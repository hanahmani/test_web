/* ==========================================================================
   OLIVERA ERP — Store
   Source unique de vérité pendant la session : toute création, modification
   ou suppression passe par ici, ce qui garantit la cohérence entre ventes,
   stock, factures, paiements, trésorerie, traçabilité et tableau de bord.
   ========================================================================== */

const Store = {

  /* ------------------------------ Séquences ---------------------------- */
  seq: { REC:312, LOT:145, OF:92, FAC:434, TKT:1258, BL:618, CMD:284, REG:512, RECU:0, DEV:96, BC:142, CLI:90, FRN:21, PRD:55, INT:74 },
  num(prefix, taille=5){
    this.seq[prefix] = (this.seq[prefix]||0) + 1;
    return `${prefix}-2026-${String(this.seq[prefix]).padStart(taille,'0')}`;
  },

  /* ------------------------------ Dates -------------------------------- */
  aujourdhui: new Date(2026, 8, 5),           // 05/09/2026, date de démonstration
  parse(d){                                    // "04/09/2026 09:14" → Date
    if(!d || d==='—') return null;
    const m = String(d).match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return m ? new Date(+m[3], +m[2]-1, +m[1]) : null;
  },
  dateFR(dt=this.aujourdhui){
    return String(dt.getDate()).padStart(2,'0')+'/'+String(dt.getMonth()+1).padStart(2,'0')+'/'+dt.getFullYear();
  },
  heureFR(){ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); },

  periode: 'campagne',                         // aujourdhui | semaine | mois | campagne | annee
  dansPeriode(d){
    const dt = this.parse(d); if(!dt) return false;
    const t = this.aujourdhui, j = 86400000;
    switch(this.periode){
      case 'aujourdhui': return dt.getTime() === t.getTime();
      case 'semaine':    return (t - dt) < 7*j && dt <= t;
      case 'mois':       return dt.getMonth()===t.getMonth() && dt.getFullYear()===t.getFullYear();
      case 'annee':      return dt.getFullYear()===t.getFullYear();
      default:           return true;          // campagne entière
    }
  },
  /* La reprise d'antériorité n'a de sens que sur la campagne entière */
  base(k){ return this.periode==='campagne' ? DB.base[k] : 0; },

  /* ------------------------------ Statuts calculés ---------------------- */
  statutFacture(f){
    if(f.paye <= 0) return this.parse(f.echeance) < this.aujourdhui ? "En retard" : "En attente";
    if(f.paye + 0.001 >= f.ttc) return "Payée";
    return "Partiellement payée";
  },
  reste(f){ return Math.max(0, f.ttc - f.paye); },

  /* ------------------------------ Indicateurs --------------------------- */
  kpis(){
    const fac = DB.factures.filter(f=>this.dansPeriode(f.date));
    const tkt = DB.tickets.filter(t=>this.dansPeriode(t.date));
    const rec = DB.receptions.filter(r=>this.dansPeriode(r.date));
    const ofs = DB.ordres.filter(o=>this.dansPeriode(o.date) && o.reel);
    const dep = DB.depenses.filter(d=>this.dansPeriode(d.date));

    const ca      = this.base('ca') + fac.reduce((s,f)=>s+f.ttc,0) + tkt.reduce((s,t)=>s+t.ttc,0);
    const olives  = this.base('olives') + rec.reduce((s,r)=>s+r.net,0);
    const huile   = this.base('huile') + ofs.reduce((s,o)=>s+(o.reel||0),0);
    const stock   = DB.stocks.filter(s=>s.magasin==='Magasin huile').reduce((s,x)=>s+x.qte,0);
    const encaisse= this.base('encaisse') + DB.factures.reduce((s,f)=>s+f.paye,0) + DB.tickets.reduce((s,t)=>s+t.ttc,0);
    const creances= this.base('creances') + DB.factures.reduce((s,f)=>s+this.reste(f),0);
    const dettes  = this.base('dettes') + DB.fournisseurs.reduce((s,f)=>s+f.encours,0);
    const attente = DB.factures.filter(f=>this.statutFacture(f)!=="Payée").reduce((s,f)=>s+this.reste(f),0);

    return {
      ca, olives:olives/1000, huile, rendement: olives? huile/olives*100 : 0, stock, creances, dettes,
      encaisse, attente, depenses: dep.reduce((s,d)=>s+d.montant,0),
      ventes: fac.length + tkt.length,
      achats: DB.achats.filter(a=>a.montant).reduce((s,a)=>s+a.montant,0),
      clients: DB.clients.length, fournisseurs: DB.fournisseurs.length,
      tresorerie: DB.tresorerie.caisse + DB.tresorerie.banque
    };
  },

  /* ------------------------------ Journal d'audit ----------------------- */
  log(action, cible, av='—', ap='—'){
    DB.audit.unshift({ user:DB.user.nom, action, cible, date:this.dateFR()+' '+this.heureFR(), av, ap });
  },
  notifier(t, d, niv='info'){ DB.notifications.unshift({ t, d, h:"à l'instant", lu:false, niv }); },

  /* ------------------------------ CRUD générique ------------------------ */
  add(coll, obj, cible){
    DB[coll].unshift(obj);
    this.log("Création", cible || obj.num || obj.code || obj.nom || coll, '—', 'Créé');
    this.persister('creer', coll, obj);
    return obj;
  },
  update(coll, ancien, nouveau, cible){
    Object.assign(ancien, nouveau);
    this.log("Modification", cible || ancien.num || ancien.code || ancien.nom || coll, 'Valeur précédente', 'Valeur mise à jour');
    this.persister('majr', coll, ancien);
    return ancien;
  },
  remove(coll, obj){
    const i = DB[coll].indexOf(obj);
    if(i>-1) DB[coll].splice(i,1);
    this.log("Suppression", obj.num || obj.code || obj.nom || coll, 'Existant', 'Supprimé');
    this.persister('retirer', coll, obj);
  },

  /* Clé naturelle utilisée par l'API pour retrouver une ligne */
  cle(coll, obj){
    const cles = { employes:'mat', transports:'matricule', utilisateurs:'login', qualite:'lot', terrasses:'num' };
    return obj[cles[coll]] ?? obj.num ?? obj.code ?? obj.matricule ?? obj.login ?? obj.mat ?? obj.lot;
  },

  /* Envoi vers le serveur lorsque l'application est servie par le backend */
  persister(op, coll, obj){
    if(this.silencieux || typeof API === 'undefined' || !API.actif) return;                 /* mode démonstration */
    const id = this.cle(coll, obj);
    const propre = {}; Object.keys(obj).forEach(k=>{ if(k[0] !== '_') propre[k] = obj[k]; });
    if(op === 'creer')   API.creer(coll, propre).catch(()=>{});
    if(op === 'majr')    API.majr(coll, id, propre).catch(()=>{});
    if(op === 'retirer') API.retirer(coll, id).catch(()=>{});
  },

  /* Exécute des écritures locales sans les renvoyer au serveur
     (utilisé après une opération déjà enregistrée par une transaction) */
  silencieux:false,
  sansPersistance(fn){ this.silencieux = true; try { fn(); } finally { this.silencieux = false; } },

  /* Sauvegarde explicite d'un objet modifié directement dans l'interface */
  sauver(coll, obj){ this.persister('majr', coll, obj); },

  /* ------------------------------ Stock --------------------------------- */
  mouvement(sens, produit, qte, lot, magasin, motif){
    DB.mouvements.unshift({ date:this.dateFR()+' '+this.heureFR(), sens, produit, qte, lot:lot||'—', magasin, motif, user:DB.user.nom });
    const ligne = DB.stocks.find(s=>s.produit===produit);
    if(ligne){
      ligne.qte += (sens==='Entrée' ? qte : -qte);
      if(ligne.qte < 0) ligne.qte = 0;
      ligne.statut = ligne.statut==='Bloqué' ? 'Bloqué'
        : (ligne.min && ligne.qte < ligne.min*0.4) ? 'Critique'
        : (ligne.min && ligne.qte < ligne.min) ? 'Faible' : 'Normal';
      if(ligne.statut==='Critique') this.notifier('Stock critique', `${produit} — ${fmt.n(ligne.qte)} ${ligne.unite} restants`, 'danger');
    }
    const p = DB.produits.find(p=>p.nom===produit);
    if(p) p.stock = Math.max(0, p.stock + (sens==='Entrée'? qte : -qte));
  },

  /* ------------------------------ Vente comptoir ------------------------ */
  /* Une vente validée : ticket + sortie de stock + encaissement + trésorerie */
  enregistrerVente({lignes, client, mode, totaux}){
    const num = this.num('TKT', 6);
    const ticket = { num, date:this.dateFR(), heure:this.heureFR(), client,
      articles: lignes.reduce((s,l)=>s+l.qte,0), mode,
      ht:totaux.ht, tva:totaux.tva, ttc:totaux.ttc,
      lignes: lignes.map(l=>({nom:l.nom, qte:l.qte, prix:l.prix})) };
    DB.tickets.unshift(ticket);

    lignes.forEach(l=>{
      const p = DB.produits.find(p=>p.code===l.code);
      this.mouvement('Sortie', l.nom, l.qte, p && p.lot || 'LOT-H-2026-0089', 'Produits finis', 'Vente comptoir '+num);
    });

    if(mode==='Espèces') DB.tresorerie.caisse += totaux.ttc;
    else DB.tresorerie.banque += totaux.ttc;
    DB.tresorerie.recettes += totaux.ttc;

    const cli = DB.clients.find(c=>c.nom===client);
    if(cli){ cli.ca += totaux.ttc; cli.derniere = this.dateFR(); }

    DB.paiements.unshift({ num:this.num('REG'), date:this.dateFR(), tiers:client, type:"Client", mode, montant:totaux.ttc, doc:num });
    this.log("Vente comptoir", num, '—', fmt.n(totaux.ttc,3)+' TND');
    return ticket;
  },

  /* ------------------------------ Encaissement -------------------------- */
  /* tranches : [{montant, mode, ref, date, statut, cheque:{...}}] */
  encaisser(facture, tranches){
    let encaisse = 0;
    tranches.forEach((t,i)=>{
      const ligne = { n:(facture.tranches.length+i+1), date:t.date, montant:t.montant, mode:t.mode,
                      ref:t.ref||'—', statut:t.statut||'Payée' };
      facture.tranches.push(ligne);
      if(ligne.statut==='Payée'){
        encaisse += t.montant;
        DB.paiements.unshift({ num:this.num('REG'), date:t.date, tiers:facture.client, type:"Client",
          mode:t.mode, montant:t.montant, doc:facture.num });
        if(t.mode==='Espèces') DB.tresorerie.caisse += t.montant;
        else DB.tresorerie.banque += t.montant;
        DB.tresorerie.recettes += t.montant;
      }
      if(t.mode==='Chèque' && t.cheque && t.cheque.num){
        DB.cheques.unshift({ num:t.cheque.num, banque:t.cheque.banque, emetteur:t.cheque.emetteur || facture.client,
          emission:t.cheque.emission, echeance:t.cheque.echeance, montant:t.montant,
          facture:facture.num, statut:t.cheque.statut || 'En attente' });
      }
    });
    facture.paye = Math.min(facture.ttc, facture.paye + encaisse);

    const cli = DB.clients.find(c=>c.nom===facture.client);
    if(cli) cli.encours = Math.max(0, cli.encours - encaisse);

    this.log("Encaissement", facture.num, fmt.n(facture.paye-encaisse,3)+' TND', fmt.n(facture.paye,3)+' TND');
    if(this.statutFacture(facture)==='Payée') this.notifier('Facture soldée', `${facture.num} — ${facture.client}`, 'ok');

    /* Reçu de paiement */
    const recu = { num:this.num('RECU',5), date:this.dateFR(), heure:this.heureFR(), client:facture.client,
      facture:facture.num, total:facture.ttc, paye:facture.paye, reste:this.reste(facture),
      tranches: tranches.filter(t=>t.statut!=='Prévue'), user:DB.user.nom };
    DB.recus.unshift(recu);
    return recu;
  }
};

/* ==========================================================================
   Extensions : soldes des tiers, trésorerie, workflow de validation
   ========================================================================== */
Object.assign(Store, {

  /* ------------------------------ Soldes des tiers ---------------------- */
  soldeFournisseur(nom){
    const facture = DB.facturesFournisseurs.filter(f=>f.fournisseur===nom).reduce((s,f)=>s+f.ttc,0);
    const paye    = DB.facturesFournisseurs.filter(f=>f.fournisseur===nom).reduce((s,f)=>s+f.paye,0);
    const acomptes= DB.accomptesFournisseurs.filter(a=>a.fournisseur===nom && a.statut==='Non affecté').reduce((s,a)=>s+a.montant,0);
    return { facture, paye, acomptes, solde: Math.max(0, facture - paye - acomptes) };
  },
  soldeClient(nom){
    const fac = DB.factures.filter(f=>f.client===nom);
    const facture = fac.reduce((s,f)=>s+f.ttc,0), paye = fac.reduce((s,f)=>s+f.paye,0);
    return { facture, paye, solde: facture - paye };
  },
  soldePersonnel(mat){
    const av = DB.avances.filter(a=>a.mat===mat && a.statut==='Validé').reduce((s,a)=>s+a.montant,0);
    const rg = DB.reglementsPersonnel.filter(r=>r.mat===mat && r.statut==='En attente').reduce((s,r)=>s+r.net,0);
    return { avances: av, aRegler: rg };
  },

  /* ------------------------------ Trésorerie ---------------------------- */
  opsDuJour(journal, date){
    date = date || this.dateFR();
    return DB.operations.filter(o=>o.date===date && (!journal || o.journal===journal));
  },
  caisse(date){
    const ops = this.opsDuJour('Caisse espèces', date);
    const entrees = ops.filter(o=>o.montant>0).reduce((s,o)=>s+o.montant,0);
    const sorties = ops.filter(o=>o.montant<0).reduce((s,o)=>s-o.montant,0);
    const initial = DB.caisseInitial;
    return { initial, entrees, sorties, theorique: initial + entrees - sorties, ops };
  },
  soldeCheques(statut){
    return DB.cheques.filter(c=>!statut || c.statut===statut).reduce((s,c)=>s+c.montant,0);
  },
  soldeBanque(){
    return DB.tresorerie.banque;
  },

  /* Enregistre une opération financière et met à jour les soldes */
  operation({type, tiers, montant, mode, motif, obs}){
    const journal = mode==='Espèces' ? 'Caisse espèces' : mode==='Chèque' ? 'Portefeuille chèques' : 'Banque';
    const op = { num:this.num('OP',5), date:this.dateFR(), type, tiers, montant, mode, journal,
                 motif:motif||'', user:DB.user.nom, statut:'Validé', obs:obs||'' };
    DB.operations.unshift(op);
    this.persister('creer', 'operations', op);
    if(journal==='Caisse espèces') DB.tresorerie.caisse += montant;
    if(journal==='Banque')         DB.tresorerie.banque += montant;
    if(montant>0) DB.tresorerie.recettes += montant; else DB.tresorerie.depenses += -montant;
    this.log('Opération financière', op.num, '—', fmt.n(montant,3)+' TND');
    return op;
  },

  /* ------------------------------ Workflow ------------------------------ */
  etapes: ["Brouillon","En attente de validation","Validé","Clôturé"],
  suivant(statut){
    const i = this.etapes.indexOf(statut);
    return i>-1 && i<this.etapes.length-1 ? this.etapes[i+1] : null;
  },
  avancer(doc, champ='statut'){
    const suite = this.suivant(doc[champ]);
    if(!suite){ toast('Document déjà clôturé','Aucune étape suivante disponible pour ce document.','warn'); return false; }
    const av = doc[champ]; doc[champ] = suite;
    this.log('Changement de statut', doc.num || doc.code || '—', av, suite);
    toast('Document '+suite.toLowerCase(), `${doc.num||''} est passé de « ${av} » à « ${suite} ».`);
    return true;
  },
  annuler(doc, motif, champ='statut'){
    const av = doc[champ]; doc[champ] = 'Annulé'; doc.motifAnnulation = motif;
    this.log('Annulation', doc.num || doc.code || '—', av, 'Annulé — '+motif);
  },
  supprimable(doc){
    return !doc.statut || ['Brouillon','En attente de validation'].includes(doc.statut);
  },

  /* ------------------------------ État journalier ----------------------- */
  journee(date){
    date = date || this.dateFR();
    const jour = d => String(d||'').startsWith(date);
    const rec = DB.receptions.filter(r=>jour(r.date));
    const prod = DB.ordres.filter(o=>jour(o.date) && o.reel);
    const tkt = DB.tickets.filter(t=>jour(t.date));
    const fac = DB.factures.filter(f=>jour(f.date));
    const mvt = DB.mouvements.filter(m=>jour(m.date));
    const ops = this.opsDuJour(null, date);
    return {
      date, receptions:rec, production:prod, tickets:tkt, factures:fac, mouvements:mvt, operations:ops,
      olives: rec.reduce((s,r)=>s+r.net,0),
      huile: prod.reduce((s,o)=>s+(o.reel||0),0),
      grignons: prod.reduce((s,o)=>s+o.grignons,0),
      margines: prod.reduce((s,o)=>s+o.margines,0),
      noyaux: prod.reduce((s,o)=>s+o.noyaux,0),
      ventes: tkt.reduce((s,t)=>s+t.ttc,0) + fac.reduce((s,f)=>s+f.ttc,0),
      encaissements: ops.filter(o=>o.montant>0).reduce((s,o)=>s+o.montant,0),
      decaissements: ops.filter(o=>o.montant<0).reduce((s,o)=>s-o.montant,0),
      entrees: mvt.filter(m=>m.sens==='Entrée').length,
      sorties: mvt.filter(m=>m.sens==='Sortie').length
    };
  }
});
