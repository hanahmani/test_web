/* ==========================================================================
   OLIVERA ERP — Écrans (2/2)
   Commercial · Finance · Gestion · Analyse · Administration
   ========================================================================== */

/* =========================== CLIENTS ==================================== */
PAGES.clients = () => pageHead("Clients","Base commerciale et situation de chaque compte",
  `<button class="btn btn-sm" data-go="pos">${icon('cart')}Nouvelle vente</button>
   <button class="btn btn-sm" data-crud="add:commandes">${icon('file')}Nouvelle commande</button>
   <button class="btn btn-sm btn-primary" data-crud="add:clients">${icon('plus')}Nouveau client</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Clients actifs","8","dont 3 grands comptes"],["Chiffre d'affaires","248 650 TND","campagne 2025/2026"],
         ["Encours total","34 460 TND","sur 5 clients"],["Dépassements de limite","1","Épicerie El Baraka"]]
        .map(([l,v,d])=>`<article class="card kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div>
          <div class="kpi-foot"><span class="tiny muted">${d}</span></div></article>`).join('')}
     </div>`
  + dataTable('cli', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Client', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.ville}</div>`},
      {k:'tel', t:'Téléphone'},
      {k:'derniere', t:'Dernière commande'},
      {k:'ca', t:'CA total', r:true, render:r=>fmt.n(r.ca)+' TND'},
      {k:'encours', t:'Encours', r:true, render:r=>{
        if(!r.encours) return '<span class="muted">—</span>';
        const dep = r.limite && r.encours>r.limite;
        return `<span style="font-weight:600;color:${dep?'var(--danger)':'var(--ink)'}">${fmt.n(r.encours)} TND</span>
                ${dep?`<div class="cell-sub" style="color:var(--danger)">limite ${fmt.n(r.limite)} dépassée</div>`:''}`;
      }},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Fiche client',a:'view'},{i:'cart',t:'Nouvelle vente',a:'sell'},{i:'receipt',t:'Créer une facture',a:'inv'}])}
    ], DB.clients, {ph:"Rechercher un nom, un code, un téléphone, un e-mail…", entity:'clients', onRow:r=>Vues.ficheClient(r),
        filters:[{k:'ville', t:'Ville', options:()=>[...new Set(DB.clients.map(c=>c.ville))].filter(v=>v!=='—')},
                 {k:'statut', t:'Statut', options:['Actif','Retard','Inactif']},
                 {k:'encours', t:'Encours', options:['Avec encours','Soldé'], get:c=>c.encours?'Avec encours':'Soldé'}],
        rowAction:(a,r)=>{ if(a==='sell') return App.go('pos'); if(a==='inv') return CRUD.add('factures'); }});

/* =========================== DEVIS / COMMANDES ========================== */
PAGES.devis = () => pageHead("Devis","Offres commerciales en cours de validité",
  `<button class="btn btn-sm btn-primary" data-crud="add:commandes">${icon('plus')}Nouveau devis</button>`)
  + dataTable('dev', [
      {k:'num', t:'Devis', render:r=>`<span class="ref">${r.num.replace('CMD','DEV')}</span>`},
      {k:'client', t:'Client'},
      {k:'date', t:'Date'},
      {k:'montant', t:'Montant TTC', r:true, render:r=>fmt.tnd(r.montant)},
      {k:'validite', t:'Validité', render:()=>'30 jours'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Livrée'?'Payée':'En attente')},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'arrow-right',t:'Transformer en commande',a:'conv'}])}
    ], DB.commandes, {ph:"Rechercher un devis, un client…",
        filters:[{k:'client', t:'Client', options:()=>DB.clients.map(c=>c.nom)}]});

PAGES.commandes = () => pageHead("Commandes clients","Du bon de commande à la livraison",
  `<button class="btn btn-sm btn-primary" data-crud="add:commandes">${icon('plus')}Nouvelle commande</button>`)
  + dataTable('cmd', [
      {k:'num', t:'Commande', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'client', t:'Client'},
      {k:'date', t:'Date'},
      {k:'montant', t:'Montant TTC', r:true, render:r=>fmt.tnd(r.montant)},
      {k:'livre', t:'Livraison'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'truck',t:'Créer le bon de livraison',a:'bl'},{i:'receipt',t:'Facturer',a:'inv'}])}
    ], DB.commandes, {ph:"Rechercher une commande, un client…", entity:'commandes',
        filters:[{k:'client', t:'Client', options:()=>DB.clients.map(c=>c.nom)},
                 {k:'statut', t:'Statut', options:['En préparation','Livrée','Facturée','Soldée','Annulée']},
                 {k:'livre', t:'Livraison', options:['Non livrée','Partielle','Totale']}],
        rowAction:(a,r)=>{ if(a==='bl') return CRUD.add('livraisons'); if(a==='inv') return CRUD.add('factures'); }});

PAGES.livraisons = () => pageHead("Livraisons","Bons de livraison et lots effectivement livrés",
  `<button class="btn btn-sm btn-primary" data-crud="add:livraisons">${icon('plus')}Nouveau bon de livraison</button>`)
  + dataTable('bl', [
      {k:'num', t:'Bon de livraison', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'client', t:'Client'},
      {k:'date', t:'Date'},
      {k:'lots', t:'Lots livrés', render:r=>`<span class="ref" data-lot="${r.lots}" style="cursor:pointer">${r.lots}</span>`},
      {k:'colis', t:'Colis', r:true},
      {k:'transporteur', t:'Transporteur'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'print',t:'Imprimer',a:'print'}])}
    ], DB.livraisons, {ph:"Rechercher un bon de livraison, un client, un lot…", entity:'livraisons',
        filters:[{k:'client', t:'Client', options:()=>DB.clients.map(c=>c.nom)},
                 {k:'statut', t:'Statut', options:['En cours','Livrée','Annulée']},
                 {k:'transporteur', t:'Transporteur', options:()=>[...new Set(DB.livraisons.map(l=>l.transporteur))]}]});

/* =========================== FACTURES =================================== */
PAGES.factures = () => pageHead("Factures clients","Facturation basée sur les quantités effectivement livrées",
  `<button class="btn btn-sm">${icon('download')}Exporter</button>
   <button class="btn btn-sm btn-primary" data-crud="add:factures">${icon('plus')}Nouvelle facture</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Facturé sur la campagne",fmt.n(Store.kpis().ca)+" TND"],["Encaissé",fmt.n(Store.kpis().encaisse)+" TND"],
          ["Restant dû",fmt.n(Store.kpis().creances)+" TND"],["Factures en retard",String(DB.factures.filter(f=>Store.statutFacture(f)==='En retard').length)]]
        .map(([l,v])=>`<article class="card kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div></article>`).join('')}
     </div>`
  + dataTable('fac', [
      {k:'num', t:'N° facture', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'client', t:'Client'},
      {k:'date', t:'Date'},
      {k:'ht', t:'Montant HT', r:true, render:r=>fmt.n(r.ht,3)},
      {k:'tva', t:'TVA 19 %', r:true, render:r=>fmt.n(r.tva,3)},
      {k:'ttc', t:'Total TTC', r:true, render:r=>`<span class="strong">${fmt.n(r.ttc,3)}</span>`},
      {k:'echeance', t:'Échéance'},
      {k:'paye', t:'Payé', r:true, render:r=>fmt.n(r.paye,3)},
      {k:'reste', t:'Reste', r:true, render:r=>{const v=Store.reste(r);
        return `<span style="font-weight:600;color:${v?'var(--warn)':'var(--ink-3)'}">${fmt.n(v,3)}</span>`;}},
      {k:'statut', t:'Statut', render:r=>statutBadge(Store.statutFacture(r))},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Voir la facture" data-do="view">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Encaisser" data-enc>${icon('coins')}</button>
        <button class="icon-btn tip" data-tip="Échéancier" data-ech>${icon('calendar')}</button>
        <button class="icon-btn tip" data-tip="Imprimer" data-do="print">${icon('print')}</button></div>`}
    ], DB.factures, {ph:"Rechercher un numéro, un client…", per:10, onRow:r=>Vues.facture(r),
        rowAction:(a,r)=>{ if(a==='view') Vues.facture(r); },
        filters:[{k:'client', t:'Client', options:()=>DB.clients.map(c=>c.nom)},
                 {k:'statut', t:'Statut', options:['Payée','Partiellement payée','En attente','En retard'], get:f=>Store.statutFacture(f)},
                 {k:'echeance', t:'Échéance', options:()=>[...new Set(DB.factures.map(f=>f.echeance))]}]});

/* =========================== FINANCE ==================================== */
PAGES.finance = () => {
  const t = DB.tresorerie;
  return pageHead("Trésorerie","Position consolidée au 05/09/2026",
    `<button class="btn btn-sm">${icon('download')}Exporter</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Trésorerie actuelle",fmt.n(t.solde,3),"caisse + banque",'coins'],
         ["Recettes de la campagne",fmt.n(t.recettes),"encaissements clients",'trend'],
         ["Dépenses de la campagne",fmt.n(t.depenses),"toutes catégories",'wallet'],
         ["Créances clients",fmt.n(t.creances),"dont 4 820 en retard",'receipt']]
        .map(([l,v,d,i])=>`<article class="card kpi"><div class="kpi-label">${icon(i)}${l}</div>
          <div class="kpi-value">${v}<small>TND</small></div><div class="kpi-foot"><span class="tiny muted">${d}</span></div></article>`).join('')}
     </div>
     <div class="grid" style="grid-template-columns:1.5fr 1fr;margin-bottom:16px">
       ${card("Entrées et sorties de trésorerie", `
          ${Chart.bars([DB.fluxMois.entrees, DB.fluxMois.sorties],{labels:DB.mois,w:700,h:250,unit:'TND',colors:['#23503A','#d17e06'],bw:12})}
          <div class="legend"><span><i style="background:#23503A"></i>Encaissements</span><span><i style="background:#d17e06"></i>Décaissements</span></div>`,
          {sub:"En dinars, par mois"})}
       ${card("Répartition de la trésorerie", `
          <div class="stat-line"><span>Compte bancaire BIAT</span><span class="v">${fmt.n(t.banque,3)} TND</span></div>
          <div class="stat-line"><span>Caisse espèces</span><span class="v">${fmt.n(t.caisse,3)} TND</span></div>
          <div class="stat-line"><span>Chèques en portefeuille</span><span class="v">8 400,000 TND</span></div>
          <div class="stat-line"><span>Dettes fournisseurs</span><span class="v" style="color:var(--danger)">${fmt.n(t.dettes,3)} TND</span></div>
          <div class="stat-line"><span>Créances clients</span><span class="v" style="color:var(--ok)">${fmt.n(t.creances,3)} TND</span></div>
          <div class="note mt">Le solde de caisse ne peut pas devenir négatif (RG-TRE-02).</div>`)}
     </div>
     ${card("Derniers règlements", dataTable('reg', [
        {k:'num', t:'Règlement', render:r=>`<span class="ref">${r.num}</span>`},
        {k:'date', t:'Date'},
        {k:'tiers', t:'Tiers'},
        {k:'type', t:'Type'},
        {k:'mode', t:'Mode'},
        {k:'doc', t:'Document'},
        {k:'montant', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:${r.montant<0?'var(--danger)':'var(--ok)'}">${r.montant>0?'+':''}${fmt.n(r.montant,3)} TND</span>`}
      ], DB.paiements, {noToolbar:true, noPager:true}), {flush:true})}`;
};

PAGES.caisse = () => pageHead("Caisse","Mouvements d'espèces du jour",
  `<button class="btn btn-sm" data-go="pos">${icon('cart')}Ouvrir la caisse de vente</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Fond de caisse ouvert","2 000,000 TND"],["Encaissements du jour","10 840,500 TND"],["Décaissements du jour","920,500 TND"],["Solde théorique","11 920,000 TND"]]
        .map(([l,v])=>`<article class="card kpi"><div class="kpi-label">${l}</div><div class="kpi-value" style="font-size:21px">${v}</div></article>`).join('')}
     </div>`
  + dataTable('cai', [
      {k:'date', t:'Heure'}, {k:'tiers', t:'Tiers'}, {k:'doc', t:'Pièce'},
      {k:'mode', t:'Mode'},
      {k:'montant', t:'Montant', r:true, render:r=>fmt.n(r.montant,3)+' TND'}
    ], DB.paiements.filter(p=>p.mode==='Espèces'||p.mode==='Chèque'), {noPager:true, ph:"Rechercher…"});

PAGES.banque = () => pageHead("Banque","Comptes bancaires et rapprochements")
  + `<div class="grid g-2" style="margin-bottom:16px">
      ${card("BIAT — Agence Sousse Nord", `
        <div class="stat-line"><span>RIB</span><span class="v mono">08 041 0025874136952 47</span></div>
        <div class="stat-line"><span>Solde comptable</span><span class="v">73 580,000 TND</span></div>
        <div class="stat-line"><span>Chèques non encaissés</span><span class="v">8 400,000 TND</span></div>
        <div class="stat-line"><span>Solde disponible</span><span class="v">65 180,000 TND</span></div>`)}
      ${card("Échéancier à 30 jours", `
        <div class="stat-line"><span>Encaissements attendus</span><span class="v" style="color:var(--ok)">+34 620,000 TND</span></div>
        <div class="stat-line"><span>Décaissements prévus</span><span class="v" style="color:var(--danger)">−21 840,000 TND</span></div>
        <div class="stat-line"><span>Position projetée</span><span class="v">86 360,000 TND</span></div>
        <div class="note mt">Aucune tension de trésorerie détectée sur les 30 prochains jours.</div>`)}
     </div>`
  + dataTable('bnk', [
      {k:'date', t:'Date'}, {k:'tiers', t:'Libellé'}, {k:'doc', t:'Référence'},
      {k:'montant', t:'Mouvement', r:true, render:r=>`<span style="color:${r.montant<0?'var(--danger)':'var(--ok)'};font-weight:600">${fmt.n(r.montant,3)} TND</span>`}
    ], DB.paiements.filter(p=>p.mode==='Virement'), {noPager:true, ph:"Rechercher…"});

PAGES.depenses = () => pageHead("Dépenses","Charges d'exploitation de la campagne",
  `<button class="btn btn-sm btn-primary" data-crud="add:depenses">${icon('plus')}Nouvelle dépense</button>`)
  + dataTable('dep', [
      {k:'date', t:'Date'},
      {k:'cat', t:'Catégorie', render:r=>`<span class="badge neutral no-dot">${r.cat}</span>`},
      {k:'tiers', t:'Tiers'},
      {k:'mode', t:'Mode de paiement'},
      {k:'just', t:'Justificatif', render:r=>r.just?`<span class="badge ok">Joint</span>`:`<span class="badge warn">Manquant</span>`},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`}
    ], DB.depenses, {ph:"Rechercher une dépense, un tiers…", entity:'depenses',
        filters:[{k:'cat', t:'Catégorie', options:()=>[...new Set(DB.depenses.map(d=>d.cat))]},
                 {k:'mode', t:'Mode', options:()=>DB.modesPaiement}]});

PAGES.creances = () => pageHead("Créances clients","Factures échues et à échoir",
  `<button class="btn btn-sm btn-primary" data-toast="Relances envoyées|2 relances transmises par e-mail.">${icon('bell')}Relancer</button>`)
  + dataTable('cre', [
      {k:'num', t:'Facture', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'client', t:'Client'}, {k:'echeance', t:'Échéance'},
      {k:'ttc', t:'Montant', r:true, render:r=>fmt.n(r.ttc,3)+' TND'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)}
      ], DB.factures.filter(f=>Store.statutFacture(f)!=='Payée').map(f=>({...f, statut:Store.statutFacture(f)})),
        {noPager:true, ph:"Rechercher un client, une facture…",
         filters:[{k:'statut', t:'Statut', options:['En attente','Partiellement payée','En retard']}]});

PAGES.dettes = () => pageHead("Dettes fournisseurs","Encours par fournisseur")
  + dataTable('det', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Fournisseur'}, {k:'conditions', t:'Conditions'},
      {k:'achats', t:'Achats campagne', r:true, render:r=>fmt.n(r.achats)+' TND'},
      {k:'encours', t:'Encours', r:true, render:r=>r.encours?`<span class="strong" style="color:var(--danger)">${fmt.n(r.encours)} TND</span>`:'<span class="badge ok">Soldé</span>'}
    ], DB.fournisseurs, {noPager:true, ph:"Rechercher…"});

/* =========================== GESTION ==================================== */
PAGES.equipements = () => pageHead("Équipements","Inventaire technique de l'huilerie",
  `<button class="btn btn-sm btn-primary" data-crud="add:equipements">${icon('plus')}Nouvel équipement</button>`)
  + dataTable('eqp', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Équipement', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.marque}</div>`},
      {k:'loc', t:'Localisation'},
      {k:'maint', t:'Prochaine maintenance'},
      {k:'etat', t:'État', render:r=>statutBadge(r.etat)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'wrench',t:'Planifier une intervention',a:'mnt'},{i:'history',t:'Historique',a:'hist'}])}
    ], DB.equipements, {noPager:true, ph:"Rechercher un équipement, une marque…", entity:'equipements',
        filters:[{k:'etat', t:'État', options:['En service',"À l'arrêt",'En panne','Réformé']},
                 {k:'loc', t:'Localisation', options:()=>[...new Set(DB.equipements.map(e=>e.loc))]}],
        rowAction:(a,r)=>{ if(a==='mnt') return CRUD.add('maintenances'); if(a==='hist') return App.go('maintenance'); }});

PAGES.maintenance = () => pageHead("Maintenance","Interventions préventives et correctives",
  `<button class="btn btn-sm btn-primary" data-crud="add:maintenances">${icon('plus')}Planifier une intervention</button>`)
  + `<div class="blocked" style="margin-bottom:16px">${icon('alert-triangle')}
      <div style="flex:1"><strong>FIL-01 — Filtre à plaques en panne</strong>
        <div class="tiny" style="margin-top:2px">Un équipement en panne ne peut pas être affecté à un ordre de fabrication (RG-EQP-01). Intervention INT-2026-0074 en cours.</div></div>
      <button class="btn btn-sm">Voir l'intervention</button></div>`
  + dataTable('mnt', [
      {k:'num', t:'Intervention', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'equip', t:'Équipement'},
      {k:'type', t:'Type', render:r=>`<span class="badge ${r.type==='Préventive'?'info':'warn'} no-dot">${r.type}</span>`},
      {k:'date', t:'Date'}, {k:'tech', t:'Technicien'},
      {k:'cout', t:'Coût', r:true, render:r=>r.cout?fmt.n(r.cout,3)+' TND':'<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)}
    ], DB.maintenances, {noPager:true, ph:"Rechercher une intervention, un équipement…", entity:'maintenances',
        filters:[{k:'type', t:'Type', options:['Préventive','Corrective']},
                 {k:'statut', t:'Statut', options:['Planifiée','En cours','Clôturée']}]});

PAGES.transport = () => pageHead("Transport","Véhicules, chauffeurs et tournées",
  `<button class="btn btn-sm btn-primary" data-crud="add:transports">${icon('plus')}Nouveau véhicule</button>`)
  + dataTable('trp', [
      {k:'matricule', t:'Matricule', render:r=>`<span class="ref">${r.matricule}</span>`},
      {k:'type', t:'Type'}, {k:'capacite', t:'Capacité'},
      {k:'km', t:'Kilométrage', r:true, render:r=>fmt.n(r.km)+' km'},
      {k:'chauffeur', t:'Chauffeur'},
      {k:'etat', t:'État', render:r=>statutBadge(r.etat)}
    ], DB.transports, {noPager:true, ph:"Rechercher un véhicule, un chauffeur…", entity:'transports',
        filters:[{k:'etat', t:'État', options:['Disponible','En mission','En maintenance']}]});

PAGES.rh = () => pageHead("Ressources humaines","Personnel permanent et saisonnier de la campagne",
  `<button class="btn btn-sm btn-primary" data-crud="add:employes">${icon('plus')}Nouvel employé</button>`)
  + dataTable('rh', [
      {k:'mat', t:'Matricule', render:r=>`<span class="ref">${r.mat}</span>`},
      {k:'nom', t:'Employé', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'poste', t:'Poste'}, {k:'dept', t:'Département'}, {k:'embauche', t:"Date d'embauche"},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)}
    ], DB.employes, {noPager:true, ph:"Rechercher un employé, un poste…", entity:'employes',
        filters:[{k:'dept', t:'Département', options:()=>[...new Set(DB.employes.map(e=>e.dept))]},
                 {k:'statut', t:'Statut', options:['Permanent','Saisonnier','Inactif']}]});

/* =========================== ANALYSE ==================================== */
PAGES.reporting = () => pageHead("Rapports et statistiques","Filtres applicables à tous les rapports",
  `<button class="btn btn-sm">${icon('print')}Imprimer</button>
   <button class="btn btn-sm">${icon('download')}Exporter Excel</button>
   <button class="btn btn-sm btn-primary" data-toast="Rapport généré|Le PDF est disponible au téléchargement.">${icon('file')}Exporter PDF</button>`)
  + card("Filtres", `
      <div class="grid g-6 gap-sm">
        <div class="field"><label>Période</label><select class="input select"><option>Campagne en cours</option><option>Mois en cours</option><option>Personnalisée</option></select></div>
        <div class="field"><label>Campagne</label><select class="input select">${DB.campagnes.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div class="field"><label>Site</label><select class="input select">${DB.sites.map(s=>`<option>${s}</option>`).join('')}</select></div>
        <div class="field"><label>Produit</label><select class="input select"><option>Tous les produits</option>${DB.produits.slice(0,4).map(p=>`<option>${p.nom}</option>`).join('')}</select></div>
        <div class="field"><label>Client</label><select class="input select"><option>Tous les clients</option>${DB.clients.slice(0,4).map(c=>`<option>${c.nom}</option>`).join('')}</select></div>
        <div class="field"><label>Lot</label><input class="input" placeholder="LOT-2026-…"></div>
      </div>`, {cls:'', sub:"Les données restituées respectent le périmètre d'accès de l'utilisateur connecté (RG-REP-03)"})
  + `<div class="grid g-3 mt">
      ${[["Chiffre d'affaires","248 650 TND","+17,1 % vs campagne précédente"],
         ["Ventes","1 284 opérations","dont 962 ventes comptoir"],
         ["Achats","162 300 TND","olives, emballages, services"],
         ["Production","18 420 L","sur 126,5 T d'olives"],
         ["Rendement moyen","14,58 %","meilleur : 15,24 %"],
         ["Bénéfice estimé","86 350 TND","marge de 34,7 %"]]
        .map(([l,v,d])=>`<article class="card kpi"><div class="kpi-label">${l}</div><div class="kpi-value" style="font-size:23px">${v}</div>
          <div class="kpi-foot"><span class="tiny muted">${d}</span></div></article>`).join('')}
     </div>
     <div class="grid g-2 mt">
       ${card("Comparaison des campagnes", `
          <div class="table-wrap"><table class="tbl">
            <thead><tr><th>Indicateur</th><th class="r">2025/2026</th><th class="r">2024/2025</th><th class="r">Écart</th></tr></thead>
            <tbody>${DB.campagneCompare.map(c=>`<tr><td class="strong">${c.k}</td><td class="r">${c.a}</td>
              <td class="r muted">${c.b}</td><td class="r" style="color:var(--ok);font-weight:600">${c.d}</td></tr>`).join('')}</tbody>
          </table></div>`, {flush:true, sub:"Campagne oléicole comme unité naturelle d'analyse"})}
       ${card("Catalogue de rapports", `
          ${[["Achats par fournisseur","Achats"],["État du stock et stock dormant","Stocks"],["Production journalière et mensuelle","Production"],
             ["Rendement par lot, producteur, variété","Production"],["Ventes par client et par produit","Ventes"],
             ["Créances, dettes et trésorerie","Finance"],["État de traçabilité par lot","Qualité"]]
            .map(([t,d])=>`<div class="stat-line"><div>${t}<div class="cell-sub">${d}</div></div>
              <div class="row gap-sm"><button class="btn btn-sm">${icon('eye')}</button><button class="btn btn-sm">${icon('download')}</button></div></div>`).join('')}`,
          {sub:"Tout rapport est exportable en PDF et Excel"})}
     </div>`;

PAGES.statistiques = () => pageHead("Statistiques","Analyse multi-axes de la campagne")
  + `<div class="grid g-2" style="margin-bottom:16px">
      ${card("Production par variété d'olives", Chart.donut(DB.charts.parVariete,{centerLabel:'Litres'}))}
      ${card("Achats et ventes par mois", `
        ${Chart.bars([DB.charts.caMois, DB.charts.achatsMois],{labels:DB.mois,w:600,h:236,unit:'TND',colors:['#23503A','#d17e06'],bw:11})}
        <div class="legend"><span><i style="background:#23503A"></i>Ventes</span><span><i style="background:#d17e06"></i>Achats</span></div>`)}
     </div>
     <div class="grid g-2">
       ${card("Ventes par client", Chart.hbars(DB.charts.topClients,{unit:'TND'}))}
       ${card("Apports par fournisseur et producteur", Chart.hbars(DB.charts.topFournisseurs.map(f=>({...f,c:'#7A8B45'})),{unit:'TND'}))}
     </div>`;

PAGES.notifications = () => pageHead("Notifications","Centre d'alertes de l'application",
  `<button class="btn btn-sm" data-toast="Notifications lues|Toutes les notifications ont été marquées comme lues.">${icon('check')}Tout marquer comme lu</button>`)
  + card("", DB.notifications.map(n=>`
      <div class="alert-item" style="${n.lu?'opacity:.62':''}">
        <div class="alert-ico ${n.niv}">${icon(n.niv==='danger'?'alert-triangle':n.niv==='warn'?'flask':n.niv==='gold'?'receipt':n.niv==='ok'?'check-circle':'wrench')}</div>
        <div style="flex:1"><div class="alert-t">${n.t}</div><div class="alert-d">${n.d}</div>
          <div class="alert-meta">${n.h}</div></div>
        ${n.lu?'':'<span class="badge info no-dot">Nouveau</span>'}
      </div>`).join(''), {flush:true});

PAGES.audit = () => pageHead("Journal d'audit","Traçabilité des opérations sensibles — entrées non modifiables (RG-AUD-02)")
  + dataTable('aud', [
      {k:'date', t:'Date'},
      {k:'user', t:'Utilisateur', render:r=>`<span class="strong">${r.user}</span>`},
      {k:'action', t:'Action'},
      {k:'cible', t:'Objet concerné', render:r=>`<span class="ref">${r.cible}</span>`},
      {k:'av', t:'Ancienne valeur', render:r=>`<span class="muted">${r.av}</span>`},
      {k:'ap', t:'Nouvelle valeur', render:r=>`<span class="strong">${r.ap}</span>`}
    ], DB.audit, {ph:"Rechercher par utilisateur, module, action…",
        filters:[{k:'user', t:'Utilisateur', options:()=>[...new Set(DB.audit.map(a=>a.user))]},
                 {k:'action', t:'Action', options:()=>[...new Set(DB.audit.map(a=>a.action))]}]});

/* =========================== ADMINISTRATION ============================= */
PAGES.utilisateurs = () => pageHead("Utilisateurs","Comptes d'accès et rôles associés",
  `<button class="btn btn-sm btn-primary" data-crud="add:utilisateurs">${icon('plus')}Nouvel utilisateur</button>`)
  + dataTable('usr', [
      {k:'nom', t:'Utilisateur', render:r=>`<div style="display:flex;align-items:center;gap:10px">
        <span class="avatar" style="width:30px;height:30px;flex:0 0 30px;font-size:11px">${r.nom.split(' ').map(x=>x[0]).slice(0,2).join('')}</span>
        <div><div class="strong">${r.nom}</div><div class="cell-sub">${r.email}</div></div></div>`},
      {k:'login', t:'Login', render:r=>`<span class="mono">${r.login}</span>`},
      {k:'role', t:'Rôle'},
      {k:'site', t:'Site'},
      {k:'derniere', t:'Dernière connexion'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'key',t:'Réinitialiser le mot de passe',a:'pwd'},{i:'trash',t:'Désactiver',a:'off'}])}
    ], DB.utilisateurs, {noPager:true, ph:"Rechercher un utilisateur, un rôle…", entity:'utilisateurs',
        filters:[{k:'role', t:'Rôle', options:()=>[...new Set(DB.utilisateurs.map(u=>u.role))]},
                 {k:'statut', t:'Statut', options:['Actif','Inactif']},
                 {k:'site', t:'Site', options:()=>[...new Set(DB.utilisateurs.map(u=>u.site))]}],
        rowAction:(a,r)=>{ if(a==='pwd') return confirmer('Réinitialiser le mot de passe ?',
          `Un lien de réinitialisation sera envoyé à <strong>${r.email}</strong>.`,
          ()=>{ Store.log('Réinitialisation de mot de passe', r.login); toast('Mot de passe réinitialisé','Un lien a été envoyé par e-mail.'); }, 'Réinitialiser'); }});

PAGES.roles = () => pageHead("Rôles et permissions","Contrôle d'accès basé sur les rôles, contrôlé côté serveur (RG-RBAC-01)",
  `<button class="btn btn-sm btn-primary" data-toast="Rôle créé|Le rôle est disponible dans la matrice.">${icon('plus')}Nouveau rôle</button>`)
  + card("Matrice des permissions", `
      <div class="table-wrap"><table class="tbl matrix">
        <thead><tr><th style="text-align:left">Module</th>${DB.roles.map(r=>`<th class="tip" data-tip="${
          {ADM:'Administrateur',DIR:'Direction',ACH:'Responsable achats',STK:'Responsable stock',MAG:'Magasinier',
           PRD:'Responsable production',OPR:'Opérateur',QUA:'Responsable qualité',COM:'Responsable commercial',
           CPT:'Comptable',MNT:'Responsable maintenance'}[r]}">${r}</th>`).join('')}</tr></thead>
        <tbody>${DB.permissions.map(p=>`<tr><th>${p[0]}</th>
          ${p.slice(1).map(v=>`<td class="c">${v?'<span class="yes">✓</span>':'<span class="no">—</span>'}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div>`, {flush:true, sub:"Survolez un code de rôle pour afficher son libellé complet"});

PAGES.parametrage = () => pageHead("Paramétrage","Société, référentiels transverses et numérotation",
  `<button class="btn btn-sm btn-primary" id="param-save">${icon('check')}Enregistrer</button>`)
  + `<div class="grid g-2">
      ${card("Informations société", `
        <div class="grid g-2">
          <div class="field"><label>Raison sociale</label><input class="input" value="${DB.societe.nom}"></div>
          <div class="field"><label>Matricule fiscal</label><input class="input" value="${DB.societe.mf}"></div>
          <div class="field span-2"><label>Adresse</label><input class="input" value="${DB.societe.adresse}"></div>
          <div class="field"><label>Téléphone</label><input class="input" value="${DB.societe.tel}"></div>
          <div class="field"><label>E-mail</label><input class="input" value="${DB.societe.email}"></div>
          <div class="field"><label>Registre de commerce</label><input class="input" value="${DB.societe.rc}"></div>
          <div class="field"><label>Banque</label><input class="input" value="${DB.societe.banque}"></div>
          <div class="field span-2"><label>RIB</label><input class="input mono" value="${DB.societe.rib}"></div>
        </div>`)}
      <div style="display:flex;flex-direction:column;gap:16px">
        ${card("Paramètres généraux", `
          <div class="grid g-2">
            <div class="field"><label>Devise</label><select class="input select"><option>Dinar tunisien (TND)</option><option>Euro (EUR)</option></select></div>
            <div class="field"><label>Langue de l'interface</label><select class="input select"><option>Français</option><option>العربية</option><option>English</option></select></div>
            <div class="field"><label>Format de date</label><select class="input select"><option>JJ/MM/AAAA</option><option>AAAA-MM-JJ</option></select></div>
            <div class="field"><label>Taux de TVA</label><select class="input select"><option>19 %</option><option>13 %</option><option>7 %</option><option>0 %</option></select></div>
          </div>`)}
        ${card("Numérotation des documents", `
          ${[["Réceptions","REC-{AAAA}-#####","REC-2026-00312"],["Lots","LOT-{AAAA}-#####","LOT-2026-00145"],
             ["Ordres de fabrication","OF-{AAAA}-####","OF-2026-0092"],["Factures","FAC-{AAAA}-#####","FAC-2026-00434"],
             ["Tickets de caisse","TKT-{AAAA}-######","TKT-2026-001258"]]
            .map(([d,f,e])=>`<div class="stat-line"><div>${d}<div class="cell-sub mono">${f}</div></div>
              <div class="v mono tiny">${e}</div></div>`).join('')}
          <div class="note mt">La numérotation est continue et sans doublon par exercice (RG-PARAM-03).</div>`)}
        ${card("Campagnes oléicoles", `
          ${DB.campagnes.map((c,i)=>`<div class="stat-line"><div>${c}<div class="cell-sub">${i?'Clôturée — consultation seule':'Ouverte du 01/10/2025 au 30/09/2026'}</div></div>
            <div>${statutBadge(i?'Inactif':'Actif')}</div></div>`).join('')}
          <div class="note mt">Une seule campagne peut être ouverte à la fois pour un site donné (RG-CAM-01).</div>`)}
      </div>
    </div>`;
