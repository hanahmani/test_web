/* ==========================================================================
   OLIVERA ERP — Coquille applicative, navigation et routeur
   ========================================================================== */

/* Menu principal : sept blocs, chacun rattaché à un droit d'accès */
/* Menu principal : catégories dépliables. Chaque écran porte un droit
   granulaire « CATEGORIE.ecran » réellement contrôlé par l'application. */
const NAV = [
  { g:"Tableau de bord", cle:"STATISTIQUES", icone:"layout", items:[
      ["dashboard","Tableau de bord","layout","tableau-de-bord"] ]},

  { g:"Achats", cle:"ACHATS", icone:"cart", items:[
      ["bons-reception","Bons de réception","truck","receptions"],
      ["bons-entree-huile","Bons d'entrée huile","droplet","receptions"],
      ["organoleptique","Contrôle organoleptique","flask","receptions"],
      ["achats","Bons de commande","cart","achats"],
      ["factures-fournisseurs","Factures achats","receipt","factures-achats"],
      ["accomptes-fournisseurs","Accomptes fournisseurs","coins","accomptes"],
      ["reglements-fournisseurs","Règlements fournisseurs","banknote","reglements"] ]},

  { g:"Production", cle:"PRODUCTION", icone:"factory", items:[
      ["bons-production","Bons de production","factory","production"],
      ["types-production","Types de production","cog","types"],
      ["operations-production","Opérations de production","gauge","operations"],
      ["historique-production","Historique de production","history","historique"],
      ["rendements","Rendement","gauge","production"],
      ["sous-produits","Sous-produits","boxes","production"],
      ["lots","Lots","tag","production"],
      ["tracabilite","Traçabilité","link","production"] ]},

  { g:"Stock", cle:"STOCK", icone:"boxes", items:[
      ["stock","Stock général","boxes","stock"],
      ["piles","Piles à huile","droplet","stock"],
      ["depots","Terrasses / dépôts","map","stock"],
      ["articles","Articles","package","stock"],
      ["grignons","Grignons","sprout","grignons"],
      ["noyaux","Noyaux","olive","noyaux"],
      ["margines","Margines","droplet","stock"],
      ["mouvements","Mouvements","history","mouvements"],
      ["inventaire","Inventaire","list","inventaire"] ]},

  { g:"Statistiques", cle:"STATISTIQUES", icone:"chart", items:[
      ["etat-journalier","État journalier","calendar","statistiques"],
      ["etat-pile","État par pile","droplet","stat-stock"],
      ["etat-pile-date","État par pile / date","history","stat-stock"],
      ["etat-grignons","État grignons","sprout","stat-stock"],
      ["etat-noyaux","État noyaux","olive","stat-stock"],
      ["etat-margines","État margines","droplet","stat-stock"],
      ["etat-fournisseur","État fournisseur","truck","stat-achats"],
      ["etat-client","État client","user","stat-finance"],
      ["releve-fournisseur","Relevé fournisseur","file","stat-achats"],
      ["releve-client","Relevé client","file","stat-finance"],
      ["etat-solde-client","État solde client","coins","stat-finance"],
      ["reporting","Rapports","chart","statistiques"],
      ["audit","Journal d'activité","shield-alert","statistiques"] ]},

  { g:"Finance", cle:"FINANCE", icone:"coins", items:[
      ["depenses","Dépenses","wallet","depenses"],
      ["accomptes-fournisseurs","Accomptes fournisseurs","coins","accomptes-f"],
      ["reglements-fournisseurs","Règlements fournisseurs","banknote","reglements-f"],
      ["paiements","Règlements clients","coins","reglements-c"],
      ["reglement-personnel","Règlements personnel","users","reglements-p"],
      ["historique-reglement-personnel","Historique règlements personnel","history","reglements-p"],
      ["pieces-reglement","Pièces de règlement","file","pieces"],
      ["etat-caisse-espece","Caisse espèces","banknote","caisse"],
      ["etat-caisse-cheque","Caisse chèques","cheque","caisse"],
      ["validation-caisse","Validation de caisse","check-circle","caisse"],
      ["correction-caisse","Correction de caisse","edit","caisse"],
      ["alimentation","Alimentation de caisse","transfer","caisse"],
      ["banque","Banque","bank","caisse"],
      ["ventes","Ventes","cart","ventes"],
      ["pos","Vente rapide / Caisse","banknote","ventes"],
      ["tickets","Tickets de caisse","print","ventes"],
      ["bons-livraison","Bons de livraison","truck","livraisons"],
      ["factures","Factures clients","receipt","factures"],
      ["etats-financiers","Rapports financiers","chart","rapports-fin"] ]},

  { g:"Paramétrage", cle:"PARAMETRAGE", icone:"settings", items:[
      ["utilisateurs","Utilisateurs","key","utilisateurs"],
      ["personnel","Personnel","users","personnel"],
      ["presence","Fiche présence","clock","personnel"],
      ["fournisseurs","Fournisseurs","truck","fournisseurs"],
      ["clients","Clients","user","clients"],
      ["transporteurs","Transporteurs","truck","transporteurs"],
      ["societes","Sociétés","bank","societes"],
      ["annees","Années","calendar","exercices"],
      ["saisons","Saisons","sprout","exercices"],
      ["unites","Unités","list","unites"],
      ["organoleptiques","Organoleptiques","flask","referentiels"],
      ["modes-paiement","Modes de paiement","card","referentiels"],
      ["parametrage","Paramètres généraux","settings","parametres"] ]}
];



const TITRES = {}, DROIT_ROUTE = {}, GROUPE_ROUTE = {};
NAV.forEach(g => g.items.forEach(([k,l,ic,sous]) => {
  TITRES[k] = l;
  DROIT_ROUTE[k] = DROIT_ROUTE[k] || (g.cle + '.' + (sous || k));
  GROUPE_ROUTE[k] = g.g;
}));

const App = {
  route: 'dashboard',
  params: {},

  /* ------------------------------ Démarrage ---------------------------- */
  init(){
    Acces.init();
    el('#sidebar').innerHTML = this.sidebarHTML();
    el('#header').innerHTML  = this.headerHTML();
    this.bindShell();
    const h = location.hash.replace('#','');
    if(h && PAGES[h]) this.route = h;
    this.render();
    window.addEventListener('hashchange', ()=>{
      const r = location.hash.replace('#','');
      if(r && PAGES[r] && r!==this.route){ this.route=r; this.params={}; this.render(); }
    });
    document.addEventListener('keydown', e=>{
      if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); this.palette(); }
      if(e.key==='Escape') closeModal();
      if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='b'){ e.preventDefault(); document.body.classList.toggle('collapsed'); }
    });
  },

  /* ------------------------------ Sidebar ------------------------------ */
  groupesOuverts: null,

  sidebarHTML(){
    /* La catégorie de l'écran courant est dépliée automatiquement */
    if(!this.groupesOuverts) this.groupesOuverts = new Set([GROUPE_ROUTE[this.route] || 'Tableau de bord']);
    this.groupesOuverts.add(GROUPE_ROUTE[this.route]);

    const nav = NAV.map(g=>{
      const items = g.items.filter(([k]) => Acces.route(k));
      if(!items.length) return '';
      const ouvert = this.groupesOuverts.has(g.g) || items.some(([k])=>k===this.route);
      return `
      <div class="nav-cat ${ouvert?'ouvert':''}">
        <button class="nav-group-btn ${items.some(([k])=>k===this.route)?'actif':''}" data-groupe="${g.g}">
          ${icon(g.icone||'list')}<span>${g.g}</span>
          <span class="nav-count">${items.length}</span>
          ${icon('chevron-right','chev')}
        </button>
        <div class="nav-sous" ${ouvert?'':'hidden'}>
          ${items.map(([k,l,i,b])=>`
            <div class="nav-item ${k===this.route?'active':''}" data-nav="${k}" title="${l}">
              ${icon(i)}<span>${l}</span>${typeof b==='number'?`<span class="nav-badge">${b}</span>`:''}
            </div>`).join('')}
        </div>
      </div>`;
    }).join('');

    return `
      <div class="brand">
        <div class="brand-mark">${icon('olive')}</div>
        <div class="brand-text">
          <div class="brand-name">Huilerie Ben Chaaben</div>
          <div class="brand-sub">Gestion d'huilerie</div>
        </div>
        <button class="icon-btn side-toggle" id="side-toggle" aria-label="Réduire le menu">${icon('chevron-left')}</button>
      </div>
      <nav class="nav">${nav}</nav>
      <div class="side-user">
        <span class="avatar">${DB.user.initiales}</span>
        <div class="u-meta"><div class="u-name">${DB.user.nom}</div><div class="u-role">${DB.user.role}</div></div>
        <div class="spacer u-meta"></div>
        <button class="icon-btn tip" data-tip="Changer d'utilisateur" id="session">${icon('users')}</button>
        <button class="icon-btn tip" data-tip="Déconnexion" id="logout">${icon('logout')}</button>
      </div>`;
  },

  /* ------------------------------ Header ------------------------------- */
  headerHTML(){
    return `
      <button class="icon-btn hide-lg" id="burger" aria-label="Menu">${icon('menu')}</button>
      <div class="head-ctx">
        <nav class="crumb" aria-label="Fil d'Ariane">
          ${GROUPE_ROUTE[this.route] && GROUPE_ROUTE[this.route] !== TITRES[this.route]
            ? `<span class="crumb-i">${GROUPE_ROUTE[this.route]}</span>${icon('chevron-right')}` : ''}
          <span class="crumb-i on">${TITRES[this.route]||'Tableau de bord'}</span>
        </nav>
        <div class="hello-sub hide-sm">Bonjour ${DB.user.nom.split(' ')[0]} — voici un aperçu de votre huilerie aujourd'hui.</div>
      </div>
      <div class="spacer"></div>
      <select class="select campaign hide-sm" id="camp">${DB.campagnes.map(c=>`<option>${c}</option>`).join('')}</select>
      <select class="select hide-sm" id="site">${DB.sites.map(s=>`<option>${s}</option>`).join('')}</select>
      <button class="search-btn hide-sm" id="search">${icon('search')}Rechercher<kbd>Ctrl K</kbd></button>
      <button class="icon-btn" id="notif" aria-label="Notifications">${icon('bell')}<span class="dot"></span></button>
      <button class="icon-btn" id="theme" aria-label="Thème">${icon(document.documentElement.getAttribute('data-theme')==='dark'?'sun':'moon')}</button>
      <select class="select" id="lang" aria-label="Langue" style="width:70px">
        <option value="fr" ${I18n.lang==='fr'?'selected':''}>FR</option>
        <option value="ar" ${I18n.lang==='ar'?'selected':''}>AR</option>
      </select>
      <span class="avatar">${DB.user.initiales}</span>`;
  },

  bindShell(){
    els('[data-nav]').forEach(n=> n.onclick = ()=> this.go(n.dataset.nav));
    els('[data-groupe]').forEach(b=> b.onclick = ()=>{
      const g = b.dataset.groupe;
      if(this.groupesOuverts.has(g)) this.groupesOuverts.delete(g); else this.groupesOuverts.add(g);
      el('#sidebar').innerHTML = this.sidebarHTML(); this.bindShell(); I18n.apply(document.body);
    });
    el('#burger').onclick = ()=> document.body.classList.toggle('nav-open');
    const st = el('#side-toggle'); if(st) st.onclick = ()=> document.body.classList.toggle('collapsed');
    el('#search').onclick = ()=> this.palette();
    el('#notif').onclick  = ()=> this.go('notifications');
    el('#session').onclick = ()=> modal({ size:'slim', title:"Changer d'utilisateur",
      body:`<div class="tiny muted" style="margin-bottom:10px">Ouvrir une session avec un autre profil pour vérifier ses droits d'accès.</div>
        ${DB.utilisateurs.map(u=>`<div class="stat-line" style="cursor:pointer" data-sess="${u.login}">
          <div><strong>${u.nom}</strong><div class="cell-sub">${u.role} · ${u.droits.join(', ')}</div></div>
          <div>${u.nom===DB.user.nom?'<span class="badge ok">Connecté</span>':icon('chevron-right')}</div></div>`).join('')}`,
      foot:`<button class="btn" data-close>Fermer</button>`,
      onOpen: ov=> els('[data-sess]',ov).forEach(n=> n.onclick = ()=>{ closeModal(); Acces.connecter(n.dataset.sess); })
    });
    el('#logout').onclick = ()=> confirmer('Se déconnecter ?','Votre session sera fermée et vous reviendrez à la page de connexion.',
      ()=> toast('Session fermée','À bientôt, '+DB.user.nom.split(' ')[0]+'.','info'), 'Se déconnecter');
    el('#lang').onchange = e => I18n.set(e.target.value);
    el('#camp').onchange  = e => toast('Campagne changée', e.target.value+' — les indicateurs ont été recalculés.','info');
    el('#site').onchange  = e => toast('Site changé', e.target.value+' — le périmètre des données est mis à jour.','info');
    el('#theme').onclick  = () => {
      const dark = document.documentElement.getAttribute('data-theme')==='dark';
      document.documentElement.setAttribute('data-theme', dark?'light':'dark');
      el('#theme').innerHTML = icon(dark?'moon':'sun');
      this.render();
    };
  },

  /* ------------------------------ Navigation --------------------------- */
  go(route, params={}){
    if(!PAGES[route]){ toast('Module en cours de développement', TITRES[route]||route, 'warn'); return; }
    this.route = route; this.params = params;
    history.replaceState(null,'','#'+route);
    document.body.classList.remove('nav-open');
    closeModal();
    els('[data-nav]').forEach(n=> n.classList.toggle('active', n.dataset.nav===route));
    this.render();
    window.scrollTo({top:0, behavior:'instant'});
  },

  render(){
    const view = el('#view');
    const droit = DROIT_ROUTE[this.route];
    if(droit && !Acces.route(this.route)){
      view.innerHTML = pageHead("Accès refusé", "Votre profil ne dispose pas du droit « "+droit+" »")
        + `<div class="card"><div class="card-body"><div class="empty">${icon('shield-alert')}
            <div class="empty-t">Écran non autorisé</div>
            <div class="empty-d">L'utilisateur <strong>${DB.user.nom}</strong> n'a pas accès au module ${droit}.
              Un administrateur peut modifier ses droits dans Paramétrage → Utilisateurs.</div></div></div></div>`;
      el('#sidebar').innerHTML = this.sidebarHTML();
      el('#header').innerHTML = this.headerHTML();
      this.bindShell(); I18n.apply(document.body);
      return;
    }
    view.innerHTML = PAGES[this.route](this.params);
    flushBindings();
    this.bindGlobal(view);
    this.bindPage();
    el('#sidebar').innerHTML = this.sidebarHTML();
    el('#header').innerHTML  = this.headerHTML();
    this.bindShell();
    I18n.apply(document.body);
  },

  /* Comportements communs à toutes les pages */
  bindGlobal(root){
    root = root || document;
    els('[data-go]', root).forEach(b=> b.onclick = ()=> this.go(b.dataset.go));
    els('[data-toast]', root).forEach(b=> b.onclick = ()=>{
      const [t,d] = b.dataset.toast.split('|'); closeModal(); toast(t,d);
    });
    els('[data-lot]', root).forEach(b=> b.onclick = ()=> this.go('tracabilite', {lot:b.dataset.lot}));

    /* Création, modification, suppression sur toutes les entités déclarées */
    els('[data-crud]', root).forEach(b=> b.onclick = e=>{
      e.stopPropagation();
      const [mode, entite, id] = b.dataset.crud.split(':');
      const E = ENTITES[entite];
      const row = id ? DB[E.coll].find(r=>String(r[E.id])===id) : null;
      if(mode==='add')  return CRUD.add(entite);
      if(mode==='edit') return CRUD.edit(entite, row);
      if(mode==='view') return CRUD.view(entite, row);
      if(mode==='del')  return CRUD.del(entite, row);
    });

    /* Paiements : encaisser, échéancier, reçu */
    els('[data-enc]', root).forEach(b=> b.onclick = e=>{ e.stopPropagation();
      Encaissement.ouvrir(DB.factures[+b.closest('tr').dataset.i]); });
    els('[data-ech]', root).forEach(b=> b.onclick = e=>{ e.stopPropagation();
      Echeancier.ouvrir(DB.factures[+b.closest('tr').dataset.i]); });
    els('[data-rec]', root).forEach(b=> b.onclick = e=>{ e.stopPropagation();
      const f = DB.factures[+b.closest('tr').dataset.i];
      Recu.apercu({ num:'REÇU-'+f.num.slice(4), date:Store.dateFR(), heure:Store.heureFR(), client:f.client,
        facture:f.num, total:f.ttc, paye:f.paye, reste:Store.reste(f),
        tranches:f.tranches.filter(t=>t.statut==='Payée'), user:DB.user.nom }); });
    els('[data-chq]', root).forEach(b=> b.onclick = e=>{ e.stopPropagation();
      const c = DB.cheques[+b.closest('tr').dataset.i];
      formModal({ title:'Chèque '+c.num, size:'slim', cols:'g-2', okLabel:'Mettre à jour',
        fields:[{k:'statut', l:'Statut du chèque', type:'select', span:true, options:['En attente','Déposé','Encaissé','Rejeté']},
                {k:'echeance', l:"Date d'échéance"}, {k:'banque', l:'Banque', type:'select', options:DB.banques}],
        values:c,
        onSave: d=>{ const av=c.statut; Object.assign(c,d); Store.log('Suivi de chèque', c.num, av, c.statut);
          if(c.statut==='Rejeté') Store.notifier('Chèque rejeté', `${c.num} — ${c.emetteur}`, 'danger');
          toast('Chèque mis à jour', `${c.num} est désormais au statut « ${c.statut} ».`); App.render(); } }); });

    /* Barres de filtres des états */
    els('[data-flt]', root).forEach(n=> n.onchange = ()=>{
      const [id,k] = n.dataset.flt.split(':');
      Flt.get(id)[k] = n.value; this.render();
    });
    els('[data-flt-check]', root).forEach(n=> n.onclick = ()=>{
      const [id,k] = n.dataset.fltCheck.split(':');
      const f = Flt.get(id); f[k] = !f[k]; this.render();
    });
    els('[data-flt-reset]', root).forEach(b=> b.onclick = ()=>{
      Flt.reset(b.dataset.fltReset); toast('Filtres réinitialisés','Les critères sont revenus à leur valeur par défaut.','info'); this.render();
    });
    els('[data-flt-search]', root).forEach(b=> b.onclick = ()=>{ this.render(); toast('Recherche appliquée','Les résultats correspondent aux critères sélectionnés.','info'); });

    /* Répéteurs de lignes (matricules, lignes de document, règlements) */
    els('[data-rep-add]', root).forEach(b=> b.onclick = ()=>{
      const box = b.closest('.repeater').querySelector('.rep-body');
      const modele = box.querySelector('.rep-line');
      if(modele){
        const clone = modele.cloneNode(true);
        clone.querySelectorAll('input').forEach(i=>{ i.value = ''; i.readOnly = false; });
        box.appendChild(clone);
      } else {
        toast('Ligne indisponible', "Rouvrez le formulaire pour ajouter une première ligne.", 'warn');
        return;
      }
      const ov = b.closest('.overlay');
      Repeater.rebind(ov);
      if(ov) ov.dispatchEvent(new CustomEvent('rep-change'));
    });
    els('[data-rep-del]', root).forEach(b=> b.onclick = ()=>{
      const line = b.closest('.rep-line'), box = line.parentElement, ov = b.closest('.overlay');
      if(box.querySelectorAll('.rep-line').length <= 1) return toast('Suppression impossible','Le document doit conserver au moins une ligne.','warn');
      line.remove();
      if(ov) ov.dispatchEvent(new CustomEvent('rep-change'));
    });

    /* Boutons d'ajout des écrans du modèle réception / production / huile */
    const ouvre = { '#br-add':()=>DocBR.form(), '#bp-add':()=>DocBP.form(), '#beh-add':()=>DocBEH.form(),
      '#four-add':()=>Tiers.fournisseur(), '#cli-add':()=>Tiers.client(), '#trp-add':()=>Tiers.transporteur(),
      '#usr-add':()=>Utilisateur.form(), '#pres-add':()=>CRUD.add('presences'),
      '#cor-add':()=>Correction.form(), '#rgp-add':()=>ReglementPersonnel.form() };
    Object.keys(ouvre).forEach(sel=>{ const b = el(sel, root); if(b) b.onclick = ouvre[sel]; });

    /* Corrections de caisse */
    els('.cor-val', root).forEach(c=> c.onchange = ()=>{
      const cor = DB.correctionsCaisse.find(x=>x.num===c.dataset.num);
      if(!cor) return;
      if(c.checked && !cor.motif){
        c.checked = false;
        return toast('Justification requise', "Renseignez le motif de la correction avant de la valider.", 'err');
      }
      cor.validation = c.checked;
      Store.log('Validation de correction de caisse', cor.num, c.checked?'Non validée':'Validée', c.checked?'Validée':'Non validée');
      toast(c.checked?'Correction validée':'Validation retirée',
        `${cor.num} — ${fmt.n(cor.solde,3)} TND ${c.checked?'pris en compte dans le solde':'exclu du solde'}.`);
      this.render();
    });
    els('[data-cor-edit]', root).forEach(b=> b.onclick = ()=>
      Correction.form(DB.correctionsCaisse.find(x=>x.num===b.dataset.corEdit)));
    els('[data-cor-del]', root).forEach(b=> b.onclick = ()=>{
      const c = DB.correctionsCaisse.find(x=>x.num===b.dataset.corDel);
      confirmer('Supprimer cette correction ?', `La correction <strong>${c.num}</strong> de ${fmt.n(c.solde,3)} TND sera supprimée.`,
        ()=>{ Store.remove('correctionsCaisse', c); toast('Correction supprimée',''); this.render(); }, 'Supprimer');
    });

    /* Export, PDF et impression au niveau d'un écran */
    els('[data-act-export]', root).forEach(b=> b.onclick = ()=> exportEcran());
    els('[data-act-pdf]', root).forEach(b=> b.onclick = ()=>{
      toast('Export PDF', "La boîte d'impression s'ouvre : choisissez « Enregistrer au format PDF ».", 'info');
      setTimeout(()=>window.print(), 400); });
    els('[data-act-print]', root).forEach(b=> b.onclick = ()=> window.print());

    /* Filtre de période du tableau de bord */
    els('[data-periode]', root).forEach(b=> b.onclick = ()=>{ Store.periode = b.dataset.periode; this.render(); });
    els('.row-actions [data-do]', root).forEach(b=> b.onclick = e=>{
      e.stopPropagation();
      const a = b.dataset.do;
      if(a==='trace') return this.go('tracabilite');
      if(a==='print') return window.print();
      if(a==='off')   return confirmer('Désactiver ce compte ?',"L'utilisateur ne pourra plus se connecter mais son historique est conservé (RG-USER-02).",
        ()=> toast('Compte désactivé','Le compte a été désactivé et l\'action journalisée.'));
      if(a==='view')  return toast('Ouverture de la fiche','Le détail complet s\'affiche dans l\'écran dédié.','info');
      toast('Action enregistrée', b.dataset.tip || 'Opération effectuée.','info');
    });
    els('.tabs .tab', root).forEach(t=> t.onclick = ()=>{
      els('.tabs .tab', t.parentElement).forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
    });
    els('.seg button', root).forEach(b=>{
      if(b.closest('#tk-fmt') || b.dataset.m || b.dataset.periode) return;
      b.onclick = ()=>{
      els('.seg button', b.parentElement).forEach(x=>x.classList.remove('on')); b.classList.add('on');
      };
    });
  },

  /* Comportements propres à certains écrans */
  bindPage(){
    /* Caisse */
    els('[data-add]').forEach(b=> b.onclick = ()=>{ POS.ajouter(b.dataset.add); });
    els('[data-cat]').forEach(b=> b.onclick = ()=>{ POS.cat = b.dataset.cat; this.render(); });
    if(this.route==='pos'){ POS.bindCart(); const p = el('#pos-preview'); if(p) p.onclick = ()=> POS.apercuTicket(0); }

    /* Nouveau client */
    els('[data-new-client]').forEach(b=> b.onclick = ()=> Vues.nouveauClient());

    /* Collecte : poids net calculé */
    const brut = el('#rc-brut'), tare = el('#rc-tare'), net = el('#rc-net');
    if(brut && tare && net){
      const calc = ()=> net.textContent = fmt.n(Math.max(0,(+brut.value||0)-(+tare.value||0)))+' kg';
      brut.oninput = tare.oninput = calc; calc();
      const v = el('#rc-valider');
      if(v) v.onclick = ()=>{
        const b = +brut.value||0, tr = +tare.value||0, net = b - tr;
        if(net <= 0) return toast('Une erreur est survenue','Le poids net doit être supérieur à zéro. Vérifiez le poids brut et la tare.','err');
        const rec = {
          num: Store.num('REC'), date: Store.dateFR()+' '+Store.heureFR(),
          producteur: el('#rc-prod').value, parcelle: els('.page select')[1] ? els('.page select')[1].value : '—',
          variete: els('.page select')[2] ? els('.page select')[2].value : 'Chemlali',
          brut: b, tare: tr, net,
          humidite: parseFloat(els('.page input[type=number]')[2]?.value)||0,
          acidite: parseFloat(els('.page input[type=number]')[3]?.value)||0,
          qualite: els('.page select')[3] ? els('.page select')[3].value : 'Bonne',
          lot: Store.num('LOT'), statut:'Validée'
        };
        Store.add('receptions', rec, rec.num);
        Store.add('lots', { num:rec.lot, type:'Olives', produit:'Olives '+rec.variete, origine:rec.parcelle,
          producteur:rec.producteur, qte:net, unite:'kg', reste:net, date:Store.dateFR(), qualite:'En attente' }, rec.lot);
        Store.mouvement('Entrée', 'Olives '+rec.variete, net, rec.lot, 'Matières premières', 'Réception '+rec.num);
        Store.notifier('Analyse en attente', `${rec.lot} réceptionné sans analyse qualité`, 'warn');
        const prod = DB.producteurs.find(p=>p.nom===rec.producteur);
        if(prod){ prod.apports++; prod.quantite += net; }

        modal({ size:'slim', title:'Réception validée',
        body:`<div style="text-align:center;padding:4px">
            <div style="width:54px;height:54px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center;margin:0 auto 14px">${icon('check')}</div>
            <div style="font-size:15.5px;font-weight:600">Réception ${rec.num} enregistrée</div>
            <div class="muted" style="font-size:13px;margin-top:4px">Poids net retenu : <strong>${fmt.n(net)} kg</strong></div>
            <div class="note" style="margin-top:14px;text-align:left">Le lot <strong>${rec.lot}</strong> a été créé, l'entrée en stock générée dans le magasin Matières premières et un contrôle qualité mis en attente.</div>
          </div>`,
        foot:`<button class="btn" data-close>Fermer</button>
              <button class="btn" id="rc-trace">${icon('link')}Voir la traçabilité</button>
              <button class="btn btn-primary" id="rc-of">${icon('factory')}Créer l'ordre de fabrication</button>`,
        onOpen: ov=>{
          el('#rc-trace',ov).onclick = ()=> this.go('receptions');
          el('#rc-of',ov).onclick = ()=>{ closeModal(); CRUD.add('ordres'); };
        }});
        toast('Réception enregistrée avec succès', `${rec.num} — ${fmt.n(net)} kg de ${rec.variete}.`);
      };
    }

    /* Conditionnement : unités obtenues */
    const vol = el('#cd-vol');
    if(vol) vol.oninput = ()=> toast('Recalcul effectué', Math.floor((+vol.value||0)/0.75*0.985)+' bouteilles obtenues pour '+vol.value+' L engagés.','info');

    /* Alimentation de caisse */
    const alim = el('#alim-caisse');
    if(alim) alim.onclick = ()=> formModal({
      title:'Alimenter la caisse espèces', okLabel:'Enregistrer',
      intro:`Solde de caisse actuel : <strong>${fmt.n(Store.caisse().theorique,3)} TND</strong>.`,
      fields:[
        {k:'montant', l:'Montant (TND)', type:'number', step:'0.001', req:true, def:2000},
        {k:'tiers', l:'Provenance', type:'select', options:['Banque BIAT','Banque Amen','Apport de la direction']},
        {k:'motif', l:'Motif', span:true, def:'Alimentation du fonds de caisse'}
      ],
      onSave: d=>{
        Store.operation({type:'Alimentation de caisse', tiers:d.tiers, montant:d.montant, mode:'Virement', motif:d.motif});
        DB.tresorerie.caisse += 0;
        toast('Caisse alimentée', `${fmt.n(d.montant,3)} TND ajoutés au fonds de caisse.`);
        this.render();
      }});

    /* Validation de caisse : écart calculé en direct */
    const reel = el('#vc-reel');
    if(reel){
      const c = Store.caisse();
      const maj = ()=>{
        const ecart = (parseFloat(reel.value)||0) - c.theorique;
        el('#vc-ecart').innerHTML = Math.abs(ecart) < 0.001
          ? `<div class="note" style="background:var(--ok-bg);border-color:#CFE3D4;color:var(--ok)">
               <strong>Aucun écart</strong> — le comptage correspond au solde théorique.</div>`
          : `<div class="blocked">${icon('alert-triangle')}<div>
               <strong>Écart de ${fmt.n(ecart,3)} TND</strong>
               <div class="tiny">${ecart>0?'Excédent de caisse':'Manquant en caisse'} — une justification est obligatoire avant la clôture.</div></div></div>`;
      };
      reel.oninput = maj; maj();
      el('#vc-valider').onclick = ()=>{
        const r = parseFloat(reel.value)||0, ecart = r - c.theorique, justif = el('#vc-justif').value.trim();
        if(Math.abs(ecart) >= 0.001 && !justif)
          return toast('Une erreur est survenue', "Un écart est constaté : la justification est obligatoire avant de clôturer la caisse.", 'err');
        DB.validationsCaisse.unshift({ date:Store.dateFR(), initial:c.initial, entrees:c.entrees, sorties:c.sorties,
          theorique:c.theorique, reel:r, ecart, user:DB.user.nom, justif:justif||'—', statut:'Clôturée' });
        Store.log('Validation de caisse', Store.dateFR(), fmt.n(c.theorique,3)+' TND', fmt.n(r,3)+' TND');
        toast('Caisse clôturée', Math.abs(ecart)<0.001 ? 'Comptage conforme au solde théorique.'
          : `Écart de ${fmt.n(ecart,3)} TND enregistré et justifié.`);
        this.render();
      };
    }

    /* État journalier : changement de date */
    const ej = el('#ej-date');
    if(ej) ej.onchange = ()=> this.go('etat-journalier', {date:ej.value});

    /* Paramétrage : enregistrement des informations société */
    const ps = el('#param-save');
    if(ps) ps.onclick = ()=>{
      const champs = els('.page .card input');
      const av = DB.societe.nom;
      DB.societe.nom = champs[0].value; DB.societe.mf = champs[1].value; DB.societe.adresse = champs[2].value;
      DB.societe.tel = champs[3].value; DB.societe.email = champs[4].value; DB.societe.rc = champs[5].value;
      DB.societe.banque = champs[6].value; DB.societe.rib = champs[7].value;
      Store.log('Modification du paramétrage', 'Société', av, DB.societe.nom);
      toast('Paramètres enregistrés', 'Les informations société apparaîtront sur les prochains documents édités.');
      this.render();
    };

    /* Traçabilité : recherche de lot */
    const tq = el('#trace-q');
    if(tq) tq.onkeydown = e=>{ if(e.key==='Enter'){
      const v = tq.value.trim().toUpperCase();
      if(DB.traceLot[v]) this.go('tracabilite',{lot:v});
      else toast('Lot introuvable','Aucun lot ne correspond à « '+v+' ». Essayez LOT-2026-00145.','warn');
    }};
    els('.trace-node').forEach(n=> n.onclick = ()=>{
      els('.trace-node').forEach(x=>x.classList.remove('active')); n.classList.add('active');
    });
  },

  /* ------------------------------ Palette Ctrl+K ------------------------ */
  palette(){
    const items = NAV.flatMap(g=> g.items.map(([k,l,i])=>({k,l,i,g:g.g})));
    const render = q => items
      .filter(x=> x.l.toLowerCase().includes(q.toLowerCase()) || x.g.toLowerCase().includes(q.toLowerCase()))
      .slice(0,10)
      .map((x,n)=>`<div class="cmd-item ${n===0?'sel':''}" data-cmd="${x.k}">${icon(x.i)}${x.l}<span class="cmd-grp">${x.g}</span></div>`).join('')
      || `<div class="empty">${icon('search')}<div class="empty-t">Aucun module trouvé</div>
          <div class="empty-d">Essayez « traçabilité », « caisse » ou « rendement ».</div></div>`;

    const ov = modal({ size:'cmdk', title:'', body:'', });
    ov.querySelector('.modal').className = 'modal cmdk';
    ov.querySelector('.modal').innerHTML = `
      <input class="cmd-input" id="cmd-q" placeholder="Rechercher un module, un écran…" autocomplete="off">
      <div class="cmd-list" id="cmd-list">${render('')}</div>`;
    const q = el('#cmd-q', ov), list = el('#cmd-list', ov);
    const bind = ()=> els('.cmd-item', list).forEach(i=> i.onclick = ()=>{ closeModal(); this.go(i.dataset.cmd); });
    bind(); q.focus();
    q.oninput = ()=>{ list.innerHTML = render(q.value); bind(); };
    q.onkeydown = e=>{
      const sel = el('.cmd-item.sel', list), all = els('.cmd-item', list);
      if(e.key==='Enter' && sel){ closeModal(); this.go(sel.dataset.cmd); }
      if(e.key==='ArrowDown' || e.key==='ArrowUp'){
        e.preventDefault();
        let i = all.indexOf(sel) + (e.key==='ArrowDown'?1:-1);
        i = Math.max(0, Math.min(all.length-1, i));
        all.forEach(x=>x.classList.remove('sel')); all[i] && all[i].classList.add('sel');
      }
    };
  }
};

/* Le démarrage est piloté par js/api.js : mode serveur ou mode démonstration. */
