/* ==========================================================================
   OLIVERA ERP — Règles de gestion du modèle réception / production / huile
   Un seul endroit décide des montants, des soldes et des mouvements de pile.
   ========================================================================== */

Object.assign(Store, {

  /* ------------------------------ Périodes ------------------------------ */
  /* Filtre de période commun à tous les états : { du, au, saison } */
  periodeDefaut(){ return { du:"01/09/2026", au:"05/09/2026", saison:"Saison 2025/2026" }; },
  dansIntervalle(d, p){
    const dt = this.parse(d); if(!dt) return false;
    const a = this.parse(p.du), b = this.parse(p.au);
    if(a && dt < a) return false;
    if(b && dt > b) return false;
    return true;
  },
  memeSaison(o, p){ return !p.saison || p.saison==='Toutes' || o.saison===p.saison; },
  filtrer(liste, p, champDate='date'){
    return liste.filter(o=> this.dansIntervalle(o[champDate], p) && this.memeSaison(o, p));
  },

  /* ------------------------------ Bon de réception ---------------------- */
  netBR(br){ return br.lignes.reduce((s,l)=>s+Math.max(0, l.net),0); },
  prodDuBR(br){ return DB.bonsProduction.find(b=>b.br===br.num) || null; },
  behDuBR(br){ return DB.behs.find(b=>b.br===br.num) || null; },

  /* Le mode de valorisation dépend de la nature de l'opération */
  montantBR(br){
    const net = this.netBR(br), pu = br.lignes[0] ? br.lignes[0].prixHuile : 0;
    const bp = this.prodDuBR(br);
    if(br.nature === "Achat olive sur base huile") return bp ? +(bp.qteHuile * pu).toFixed(3) : 0;
    if(br.nature === "Trituration")                return +(net * pu).toFixed(3);
    return +(net * pu).toFixed(3);                 /* Achat olive : prix au kg d'olives */
  },
  baseBR(br){
    /* Libellé de la base de facturation, adapté à la nature */
    return br.nature === "Achat olive sur base huile"
      ? { libellePrix:"Prix huile (TND/kg)", libelleQte:"Quantité huile (kg)", qte:(this.prodDuBR(br)||{}).qteHuile || 0 }
      : br.nature === "Trituration"
      ? { libellePrix:"Prix trituration (TND/kg)", libelleQte:"Quantité olives (kg)", qte:this.netBR(br) }
      : { libellePrix:"Prix olive (TND/kg)", libelleQte:"Quantité olives (kg)", qte:this.netBR(br) };
  },
  resteBR(br){ return +(this.montantBR(br) - (br.paye||0)).toFixed(3); },
  statutPaiementBR(br){
    const m = this.montantBR(br), p = br.paye||0;
    if(m<=0) return "En attente";
    if(p<=0) return "Non payé";
    return p + 0.001 >= m ? "Payé" : "Partiellement payé";
  },

  /* ------------------------------ Piles --------------------------------- */
  pile(num){ return DB.pilesHuile.find(p=>p.num===num); },
  cmpPile(p){ return p.qte > 0 ? +(p.prixTotal / p.qte).toFixed(3) : 0; },
  restePile(p){ return Math.max(0, p.qteMax - p.qte); },

  /* Entrée ou sortie d'huile : le stock de la pile n'évolue que par ici */
  mouvementPile(pile, qte, sens, doc, type, origine, valeur){
    const p = this.pile(pile);
    if(!p) return false;
    if(sens > 0){
      if(p.qte + qte > p.qteMax + 0.001) {
        toast('Capacité dépassée', `La ${p.designation} ne peut pas recevoir ${fmt.n(qte,1)} kg (reste ${fmt.n(this.restePile(p),1)} kg).`, 'err');
        return false;
      }
      p.qte += qte; p.prixTotal += (valeur || 0);
      if(p.etat === 'Vide') p.etat = 'En service';
    } else {
      if(qte > p.qte + 0.001){
        toast('Stock insuffisant', `La ${p.designation} ne contient que ${fmt.n(p.qte,1)} kg.`, 'err');
        return false;
      }
      const cmp = this.cmpPile(p);
      p.qte -= qte; p.prixTotal = Math.max(0, p.prixTotal - qte * cmp);
      if(p.qte <= 0) p.etat = 'Vide';
    }
    const mvt = { date:this.dateFR(), type, doc, pile, qte, sens, origine };
    DB.mouvementsPile.unshift(mvt);
    this.persister('creer', 'mouvementsPile', mvt);
    this.sauver('pilesHuile', p);
    this.log('Mouvement de pile', doc, pile, (sens>0?'+':'−')+fmt.n(qte,1)+' kg');
    return true;
  },

  /* Solde d'une pile au fil d'une période, mouvement par mouvement */
  historiquePile(num, p){
    const mvts = this.filtrer(DB.mouvementsPile.filter(m=>m.pile===num), p).slice().reverse();
    let solde = 0;
    return mvts.map(m=>{
      const e = m.sens > 0 ? m.qte : 0, s = m.sens < 0 ? m.qte : 0;
      solde += e - s;
      return { ...m, entree:e, sortie:s, solde };
    });
  },

  /* ------------------------------ Relevés ------------------------------- */
  /* Convention retenue, identique pour les tiers fournisseurs et clients :
     Débit  = ce que le tiers nous doit / ce que nous lui devons au titre des opérations
     Crédit = les règlements et acomptes venus solder ces opérations
     Solde  = solde précédent + débit − crédit                                */
  releveFournisseur(nom, p){
    const lignes = [];
    this.filtrer(DB.bonsReception.filter(b=>b.tiersType==='Fournisseur' && b.tiers===nom), p)
      .forEach(b=> lignes.push({ date:b.date, type:"Réception", doc:"BR "+b.num,
        debit:this.montantBR(b), credit:0 }));
    this.filtrer(DB.facturesFournisseurs.filter(f=>f.fournisseur===nom), p)
      .forEach(f=> lignes.push({ date:f.date, type:"Facture", doc:f.num, debit:f.ttc, credit:0 }));
    this.filtrer(DB.accomptesFournisseurs.filter(a=>a.fournisseur===nom), p)
      .forEach(a=> lignes.push({ date:a.date, type:"Acompte", doc:a.num, debit:0, credit:a.montant }));
    this.filtrer(DB.bonsReception.filter(b=>b.tiersType==='Fournisseur' && b.tiers===nom && b.paye>0), p)
      .forEach(b=> lignes.push({ date:b.date, type:"Règlement", doc:"BR "+b.num, debit:0, credit:b.paye }));
    DB.operations.filter(o=>o.tiers===nom && o.type==='Règlement fournisseur' && this.dansIntervalle(o.date, p))
      .forEach(o=> lignes.push({ date:o.date, type:"Règlement", doc:o.num, debit:0, credit:-o.montant }));
    return this.cumuler(lignes, 0);
  },

  releveClient(nom, p){
    const cli = DB.clients.find(c=>c.nom===nom) || {};
    const lignes = [];
    this.filtrer(DB.bonsReception.filter(b=>b.tiersType==='Client' && b.tiers===nom), p)
      .forEach(b=> lignes.push({ date:b.date, type:"Réception", doc:"BR "+b.num, debit:this.montantBR(b), credit:0 }));
    this.filtrer(DB.factures.filter(f=>f.client===nom), p)
      .forEach(f=> lignes.push({ date:f.date, type:"Facture", doc:f.num, debit:f.ttc, credit:f.paye }));
    this.filtrer(DB.tickets.filter(t=>t.client===nom), p)
      .forEach(t=> lignes.push({ date:t.date, type:"Vente", doc:t.num, debit:t.ttc, credit:t.ttc }));
    this.filtrer(DB.grignons.filter(g=>g.client===nom), p)
      .forEach(g=> lignes.push({ date:g.date, type:"Vente", doc:"Grignons "+g.bl, debit:g.total, credit:0 }));
    this.filtrer(DB.noyaux.filter(n=>n.client===nom), p)
      .forEach(n=> lignes.push({ date:n.date, type:"Vente", doc:"Noyaux "+n.bl, debit:n.total, credit:0 }));
    [...DB.reglementsGrignons, ...DB.reglementsNoyaux].filter(r=>r.client===nom && this.dansIntervalle(r.date, p))
      .forEach(r=> lignes.push({ date:r.date, type:"Règlement", doc:r.ref!=='—'?r.ref:r.mode, debit:0, credit:r.montant }));
    return this.cumuler(lignes, cli.soldeInitial || 0);
  },

  cumuler(lignes, soldeInitial){
    lignes.sort((a,b)=> (this.parse(a.date)||0) - (this.parse(b.date)||0));
    let solde = soldeInitial;
    const out = lignes.map(l=>{ solde += l.debit - l.credit; return { ...l, solde }; });
    return { soldeInitial, lignes:out,
      totalDebit: lignes.reduce((s,l)=>s+l.debit,0),
      totalCredit: lignes.reduce((s,l)=>s+l.credit,0),
      soldeFinal: solde };
  },

  soldeClientV2(nom, p){ return this.releveClient(nom, p).soldeFinal; },
  soldeFournisseurV2(nom, p){ return this.releveFournisseur(nom, p).soldeFinal; },

  /* ------------------------------ État journalier ----------------------- */
  journalier(p){
    const br  = this.filtrer(DB.bonsReception, p);
    const bp  = this.filtrer(DB.bonsProduction, p);
    const beh = this.filtrer(DB.behs, p);
    const grg = this.filtrer(DB.grignons, p);
    const noy = this.filtrer(DB.noyaux, p);
    const mrg = this.filtrer(DB.marginesEvac, p);
    const dep = DB.depenses.filter(d=>this.dansIntervalle(d.date, p));
    const ops = DB.operations.filter(o=>this.dansIntervalle(o.date, p));
    const fac = DB.factures.filter(f=>this.dansIntervalle(f.date, p));
    const tkt = DB.tickets.filter(t=>this.dansIntervalle(t.date, p));

    const qteMP = br.reduce((s,b)=>s+this.netBR(b),0);
    const qteProd = bp.reduce((s,b)=>s+b.qteOlives,0);
    const huile = bp.reduce((s,b)=>s+b.qteHuile,0);
    return {
      periode:p, br, bp, beh,
      achatMP: br.reduce((s,b)=>s+this.montantBR(b),0),
      qteMP, qteProd, huile,
      rendement: qteProd ? huile/qteProd*100 : 0,
      grignons: bp.reduce((s,b)=>s+b.grignons,0),
      noyaux:   bp.reduce((s,b)=>s+b.noyaux,0),
      margines: bp.reduce((s,b)=>s+b.margines,0),
      ca: fac.reduce((s,f)=>s+f.ttc,0) + tkt.reduce((s,t)=>s+t.ttc,0)
          + grg.reduce((s,g)=>s+g.total,0) + noy.reduce((s,n)=>s+n.total,0),
      depenses: dep.reduce((s,d)=>s+d.montant,0) + mrg.reduce((s,m)=>s+m.total,0),
      nbReceptions: br.length, nbProductions: bp.length,
      reglFournisseurs: br.reduce((s,b)=>s+(b.tiersType==='Fournisseur'?b.paye:0),0)
        + Math.abs(ops.filter(o=>o.type==='Règlement fournisseur').reduce((s,o)=>s+o.montant,0)),
      reglClients: fac.reduce((s,f)=>s+f.paye,0) + tkt.reduce((s,t)=>s+t.ttc,0),
      acomptes: DB.accomptesFournisseurs.filter(a=>this.dansIntervalle(a.date,p)).reduce((s,a)=>s+a.montant,0),
      encaissements: ops.filter(o=>o.montant>0).reduce((s,o)=>s+o.montant,0),
      decaissements: ops.filter(o=>o.montant<0).reduce((s,o)=>s-o.montant,0),
      soldeCaisse: DB.tresorerie.caisse
    };
  }
});

/* ==========================================================================
   Droits d'accès : les modules cochés dans la fiche utilisateur pilotent
   réellement la navigation et l'ouverture des écrans.
   ========================================================================== */
const Acces = {
  courant: null,                                  /* utilisateur connecté */
  init(){ this.courant = DB.utilisateurs.find(u=>u.nom===DB.user.nom) || DB.utilisateurs[0]; },
  droits(){ return (this.courant && this.courant.droits) || []; },
  a(module){ return this.droits().includes(module); },
  connecter(login){
    const u = DB.utilisateurs.find(x=>x.login===login);
    if(!u) return;
    this.courant = u;
    DB.user = { nom:u.nom, role:u.role, initiales:u.nom.split(' ').map(x=>x[0]).slice(0,2).join('') };
    Store.log('Changement d\'utilisateur', u.login, '—', u.role);
    toast('Session ouverte', `${u.nom} — ${u.role}. Modules autorisés : ${u.droits.join(', ')}.`);
    App.go(this.a('STATISTIQUES') || true ? 'dashboard' : 'dashboard');
  }
};
