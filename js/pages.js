/* ==========================================================================
   OLIVERA ERP — Écrans (1/2)
   Tableau de bord · Approvisionnement · Stock · Production · Traçabilité
   ========================================================================== */

const PAGES = {};

/* =========================== TABLEAU DE BORD ============================= */
PAGES.dashboard = () => {
  const v = Store.kpis();
  const cartes = [
    { label:"Chiffre d'affaires", val:fmt.n(v.ca,0),        unit:"TND", icon:"wallet",  trend:12.8, spark:DB.kpis[0].spark },
    { label:"Huile produite",     val:fmt.n(v.huile,0),     unit:"L",   icon:"droplet", trend:8.4,  spark:DB.kpis[1].spark },
    { label:"Olives réceptionnées",val:fmt.n(v.olives,1),   unit:"T",   icon:"sprout",  trend:15.2, spark:DB.kpis[2].spark },
    { label:"Rendement moyen",    val:fmt.n(v.rendement,2), unit:"%",   icon:"gauge",   trend:1.3,  spark:DB.kpis[3].spark },
    { label:"Stock disponible",   val:fmt.n(v.stock,0),     unit:"L",   icon:"boxes",   trend:-3.1, spark:DB.kpis[4].spark },
    { label:"Créances clients",   val:fmt.n(v.creances,0),  unit:"TND", icon:"receipt", trend:-6.4, spark:DB.kpis[5].spark }
  ];
  const k = cartes.map(x=>`
    <article class="card kpi">
      <div class="kpi-label">${icon(x.icon)}${x.label}</div>
      <div class="kpi-value">${x.val}<small>${x.unit}</small></div>
      <div class="kpi-foot">${trend(x.trend)}${Chart.spark(x.spark, x.trend>=0?'#23503A':'#ae2822')}</div>
    </article>`).join('');

  const secondaires = [
    ["Total des ventes", v.ventes + " documents"], ["Total des achats", fmt.n(v.achats)+" TND"],
    ["Dettes fournisseurs", fmt.n(v.dettes)+" TND"], ["Paiements reçus", fmt.n(v.encaisse)+" TND"],
    ["Paiements en attente", fmt.n(v.attente)+" TND"], ["Trésorerie", fmt.n(v.tresorerie)+" TND"]
  ].map(([l,x])=>`<div class="stat-line"><span>${l}</span><span class="v">${x}</span></div>`).join('');

  const periodes = [["aujourdhui","Aujourd'hui"],["semaine","Cette semaine"],["mois","Ce mois"],["campagne","Cette campagne"],["annee","Année"]]
    .map(([k2,l])=>`<button class="${Store.periode===k2?'on':''}" data-periode="${k2}">${l}</button>`).join('');

  const alertes = DB.alertes.map(a=>`
    <div class="alert-item">
      <div class="alert-ico ${a.niveau}">${icon(a.icon)}</div>
      <div style="flex:1;min-width:0">
        <div class="alert-t">${a.titre}</div>
        <div class="alert-d">${a.texte}</div>
        <div class="alert-meta">${a.date}</div>
      </div>
      <button class="btn btn-sm" data-go="${a.cible}">Voir</button>
    </div>`).join('');

  return `
  ${pageHead("Tableau de bord", "Indicateurs calculés en direct sur les données saisies dans l'application", `
    <div class="seg">${periodes}</div>
    <button class="btn btn-sm" data-go="reporting">${icon('chart')}Rapports</button>
    <button class="btn btn-sm btn-primary" data-go="collecte">${icon('plus')}Nouvelle réception</button>`)}

  <div class="grid g-6" style="margin-bottom:16px">${k}</div>

  <div class="grid" style="grid-template-columns:1.55fr 1fr;margin-bottom:16px">
    ${card("Chiffre d'affaires et achats", `
      ${Chart.line([DB.charts.caMois, DB.charts.achatsMois], {labels:DB.mois, h:236, unit:'TND'})}
      <div class="legend"><span><i style="background:#23503A"></i>Ventes</span><span><i style="background:#d17e06"></i>Achats</span></div>`,
      {sub:"En dinars, par mois de campagne", tools:`<div class="seg"><button class="on">Mois</button><button>Trimestre</button></div>`})}
    ${card("Indicateurs complémentaires", secondaires + `
      <div class="mt">${Chart.donut(DB.charts.stockRepartition,{centerLabel:'Unités',size:150,sw:18})}</div>`,
      {sub:"Recalculés à chaque opération enregistrée"})}
  </div>

  <div class="grid" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:16px">
    ${card("Huile produite par mois", Chart.bars(DB.charts.prodMois,{labels:DB.mois,w:420,h:230,unit:'L',bw:15}), {sub:"En litres"})}
    ${card("Production par variété", Chart.hbars(DB.charts.parVariete,{unit:'L'}), {sub:"Litres obtenus par variété d'olives"})}
    ${card("Rendement par campagne", Chart.bars(DB.charts.rendementCampagne.map(r=>r.v),
      {labels:DB.charts.rendementCampagne.map(r=>r.k),w:420,h:230,unit:'%',colors:['#7A8B45'],bw:26}), {sub:"Moyenne annuelle en %"})}
  </div>

  <div class="grid" style="grid-template-columns:1.2fr 1fr 1fr">
    ${card("Alertes et actions", alertes, {flush:true, sub:"6 éléments demandent une décision", tools:`<button class="btn btn-sm btn-ghost" data-go="notifications">Tout voir</button>`})}
    ${card("Top 5 clients", Chart.hbars(DB.charts.topClients,{unit:'TND'}), {sub:"Chiffre d'affaires de la campagne"})}
    ${card("Top 5 fournisseurs", Chart.hbars(DB.charts.topFournisseurs.map(f=>({...f,c:'#d17e06'})),{unit:'TND'}), {sub:"Achats et apports réglés"})}
  </div>`;
};

/* =========================== FOURNISSEURS =============================== */
PAGES.fournisseurs = () => pageHead("Fournisseurs","Emballages, consommables, services et transport",
  `<button class="btn btn-sm btn-primary" data-crud="add:fournisseurs">${icon('plus')}Nouveau fournisseur</button>`)
  + dataTable('fourn', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Raison sociale', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.contact}</div>`},
      {k:'tel', t:'Téléphone'},
      {k:'ville', t:'Ville'},
      {k:'conditions', t:'Conditions'},
      {k:'achats', t:'Achats campagne', r:true, render:r=>fmt.n(r.achats)+' TND'},
      {k:'encours', t:'Encours', r:true, render:r=>r.encours? `<span style="color:var(--danger);font-weight:600">${fmt.n(r.encours)} TND</span>`:'<span class="muted">—</span>'},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'}])}
    ], DB.fournisseurs, {ph:"Rechercher un fournisseur, un contact, une ville…", entity:'fournisseurs',
       filters:[{k:'ville', t:'Ville', options:()=>[...new Set(DB.fournisseurs.map(f=>f.ville))]},
                {k:'conditions', t:'Conditions', options:['Comptant','15 jours','30 jours','Échéancier']},
                {k:'statut', t:'Statut', options:['Actif','Inactif'], get:f=>f.statut||'Actif'}]});

/* =========================== PRODUCTEURS ================================ */
PAGES.producteurs = () => pageHead("Producteurs et agriculteurs","Apporteurs d'olives de la campagne en cours",
  `<button class="btn btn-sm" data-go="collecte">${icon('truck')}Enregistrer un apport</button>
   <button class="btn btn-sm btn-primary" data-crud="add:producteurs">${icon('plus')}Nouveau producteur</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Producteurs actifs","5"],["Apports enregistrés","61"],["Olives collectées","126,5 T"],["Soldes à régler","6 820 TND"]]
        .map(([l,v])=>`<article class="card kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div></article>`).join('')}
     </div>`
  + dataTable('prods', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Producteur', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.varietes}</div>`},
      {k:'zone', t:'Zone'},
      {k:'parcelles', t:'Parcelles', render:r=>r.parcelles.length+' parcelle'+(r.parcelles.length>1?'s':'')},
      {k:'apports', t:'Apports', r:true},
      {k:'quantite', t:'Quantité', r:true, render:r=>fmt.n(r.quantite)+' kg'},
      {k:'rdt', t:'Rendement', r:true, render:r=>`<span class="strong">${fmt.pct(r.rdt)}</span>`},
      {k:'solde', t:'Solde dû', r:true, render:r=>r.solde? `<span style="color:var(--warn);font-weight:600">${fmt.n(r.solde)} TND</span>`:'<span class="badge ok">Soldé</span>'}
    ], DB.producteurs, {ph:"Rechercher un producteur, une zone, une variété…", entity:'producteurs', onRow:r=>Vues.ficheProducteur(r),
        filters:[{k:'zone', t:'Zone', options:()=>[...new Set(DB.producteurs.map(p=>p.zone))]},
                 {k:'varietes', t:'Variété', options:['Chemlali','Chetoui','Sahli','Zalmati','Oueslati']},
                 {k:'solde', t:'Solde', options:['Soldé','À régler'], get:p=>p.solde?'À régler':'Soldé'}]});

/* =========================== COLLECTE DES OLIVES ======================== */
PAGES.collecte = () => {
  const hist = DB.receptions.slice(0,4).map(r=>`
    <div class="stat-line"><div><span class="ref">${r.num}</span>
      <div class="cell-sub">${r.date} · ${r.variete} · ${r.producteur}</div></div>
      <div class="v">${fmt.n(r.net)} kg</div></div>`).join('');

  return pageHead("Collecte des olives","Enregistrement d'un arrivage et création du lot d'origine",
    `<button class="btn btn-sm" data-go="receptions">${icon('history')}Historique des réceptions</button>`)
  + `<div class="grid" style="grid-template-columns:1.6fr 1fr">
      ${card("Nouvelle réception", `
        <div class="grid g-3">
          <div class="field"><label>Numéro de réception</label><input class="input" value="REC-2026-00313" readonly></div>
          <div class="field"><label>Date et heure</label><input class="input" value="05/09/2026 14:30"></div>
          <div class="field"><label>Campagne</label><input class="input" value="Campagne 2025/2026" readonly></div>
        </div>
        <div class="grid g-3 mt">
          <div class="field"><label>Producteur</label><select class="input select" id="rc-prod">
            ${DB.producteurs.map(p=>`<option>${p.nom}</option>`).join('')}</select></div>
          <div class="field"><label>Parcelle</label><select class="input select">
            <option>P-114 Oliveraie Nord</option><option>P-115 Oliveraie Sud</option></select></div>
          <div class="field"><label>Origine</label><input class="input" value="Sahline, gouvernorat de Monastir"></div>
        </div>
        <div class="grid g-3 mt">
          <div class="field"><label>Variété</label><select class="input select">
            <option>Chemlali</option><option>Chetoui</option><option>Sahli</option><option>Zalmati</option><option>Oueslati</option></select></div>
          <div class="field"><label>Poids brut (kg)</label><input class="input" type="number" id="rc-brut" value="1250"></div>
          <div class="field"><label>Tare (kg)</label><input class="input" type="number" id="rc-tare" value="150"></div>
        </div>

        <div class="note mt" style="display:flex;align-items:center;justify-content:space-between;gap:14px">
          <div><strong>Poids net calculé</strong><div class="tiny">Poids net = poids brut − tare. Le champ n'est pas saisissable (RG-OLI-01).</div></div>
          <div style="font-family:var(--font-display);font-size:26px;font-weight:600" id="rc-net">1 100 kg</div>
        </div>

        <div class="grid g-3 mt">
          <div class="field"><label>Humidité (%)</label><input class="input" type="number" step="0.1" value="48.2"></div>
          <div class="field"><label>Acidité (%)</label><input class="input" type="number" step="0.01" value="0.31"></div>
          <div class="field"><label>Qualité</label><select class="input select">
            <option>Excellente</option><option selected>Bonne</option><option>Moyenne</option><option>Médiocre</option></select></div>
        </div>
        <div class="field mt"><label>Commentaires</label>
          <textarea class="input" rows="2" placeholder="Observations sur l'apport, l'état sanitaire des olives, le délai depuis la récolte…"></textarea></div>

        <div class="row mt" style="justify-content:flex-end">
          <button class="btn">Enregistrer en brouillon</button>
          <button class="btn btn-primary" id="rc-valider">${icon('check')}Valider la réception</button>
        </div>`, {sub:"Les champs marqués sont obligatoires selon le cahier des charges (§12)"})}

      <div style="display:flex;flex-direction:column;gap:16px">
        ${card("Apports du producteur", hist, {sub:"Derniers apports enregistrés"})}
        ${card("Ce que déclenche la validation", `
          <div class="timeline">
            ${[["Création du lot d'olives","Numéro LOT-2026-00146 généré automatiquement"],
               ["Entrée en stock","Magasin Matières premières, quantité nette"],
               ["Rattachement à la campagne","Campagne ouverte à la date de l'arrivage"],
               ["Analyse qualité","Contrôle en attente créé pour le responsable qualité"]]
              .map(([t,d],i)=>`<div class="tl-step ${i<3?'done':'current'}"><div class="tl-dot">${i+1}</div>
                <div class="tl-body"><div class="tl-t">${t}</div><div class="tl-d">${d}</div></div></div>`).join('')}
          </div>`)}
      </div>
    </div>`;
};

/* =========================== RÉCEPTIONS ================================= */
PAGES.receptions = () => pageHead("Réceptions","Arrivages d'olives et de matières premières",
  `<button class="btn btn-sm btn-primary" data-go="collecte">${icon('plus')}Nouvelle réception</button>`)
  + dataTable('recs', [
      {k:'num', t:'Réception', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'},
      {k:'producteur', t:'Producteur', render:r=>`<div>${r.producteur}</div><div class="cell-sub">${r.parcelle}</div>`},
      {k:'variete', t:'Variété'},
      {k:'brut', t:'Brut', r:true, render:r=>fmt.n(r.brut)+' kg'},
      {k:'tare', t:'Tare', r:true, render:r=>fmt.n(r.tare)+' kg'},
      {k:'net', t:'Net', r:true, render:r=>`<span class="strong">${fmt.n(r.net)} kg</span>`},
      {k:'humidite', t:'Humidité', r:true, render:r=>fmt.n(r.humidite,1)+' %'},
      {k:'lot', t:'Lot créé', render:r=>`<span class="ref">${r.lot}</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)}
    ], DB.receptions, {ph:"Rechercher par numéro, producteur, lot…", entity:'receptions', onRow:r=>App.go('tracabilite', {lot:r.lot}),
        filters:[{k:'producteur', t:'Producteur', options:()=>DB.producteurs.map(p=>p.nom)},
                 {k:'variete', t:'Variété', options:['Chemlali','Chetoui','Sahli','Zalmati','Oueslati']},
                 {k:'qualite', t:'Qualité', options:['Excellente','Bonne','Moyenne','Médiocre']},
                 {k:'statut', t:'Statut', options:['Validée','Brouillon']}]});

/* =========================== ACHATS ===================================== */
PAGES.achats = () => {
  const wf = ["Demande","Commande","Réception","Contrôle","Facture","Paiement"]
    .map((s,i)=>`<div class="trace-node" style="cursor:default">
        <div class="trace-ico">${icon(['file','cart','truck','shield','receipt','coins'][i])}</div>
        <div><div class="trace-k">Étape ${i+1}</div><div class="trace-v">${s}</div></div>
        <div class="badge ${i<3?'ok':'neutral'} no-dot">${i<3?'Automatisé':'À valider'}</div>
      </div>`).join('<div class="trace-link"></div>');

  return pageHead("Achats","Demandes, bons de commande, réceptions et factures fournisseurs",
    `<button class="btn btn-sm" data-crud="add:achats">${icon('file')}Nouvelle demande</button>
     <button class="btn btn-sm btn-primary" data-crud="add:achats">${icon('plus')}Bon de commande</button>`)
  + `<div class="grid" style="grid-template-columns:1fr 330px">
      <div>${dataTable('ach', [
        {k:'num', t:'Document', render:r=>`<span class="ref">${r.num}</span>`},
        {k:'fournisseur', t:'Fournisseur'},
        {k:'date', t:'Date'},
        {k:'montant', t:'Montant TTC', r:true, render:r=>r.montant?fmt.tnd(r.montant):'<span class="muted">—</span>'},
        {k:'recu', t:'Réception'},
        {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
        {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'print',t:'Imprimer',a:'print'}])}
      ], DB.achats, {ph:"Rechercher un document d'achat…", entity:'achats',
          filters:[{k:'fournisseur', t:'Fournisseur', options:()=>DB.fournisseurs.map(f=>f.nom)},
                   {k:'statut', t:'Statut', options:['Demande','En cours','Facturée','Payée','Annulée']}]})}</div>
      ${card("Workflow d'achat", wf, {sub:"Cahier des charges §10.1"})}
    </div>`;
};

/* =========================== STOCK ====================================== */
const stockPage = (titre, sous, filtre) => {
  const rows = filtre ? DB.stocks.filter(filtre) : DB.stocks;
  return pageHead(titre, sous, `
    <button class="btn btn-sm">${icon('plus')}Entrée</button>
    <button class="btn btn-sm">${icon('minus')}Sortie</button>
    <button class="btn btn-sm">${icon('transfer')}Transfert</button>
    <button class="btn btn-sm btn-primary" data-toast="Inventaire lancé|Comptage physique ouvert sur le magasin sélectionné.">${icon('list')}Inventaire</button>`)
  + dataTable('stk-'+(titre.replace(/\W/g,'')), [
      {k:'produit', t:'Produit', render:r=>`<div class="strong">${r.produit}</div><div class="cell-sub">${r.magasin}</div>`},
      {k:'lot', t:'Lot', render:r=>r.lot!=='—'?`<span class="ref" data-lot="${r.lot}" style="cursor:pointer">${r.lot}</span>`:'<span class="muted">—</span>'},
      {k:'qte', t:'Quantité', r:true, render:r=>`<span class="strong">${fmt.n(r.qte, r.qte%1?2:0)}</span> <span class="muted">${r.unite}</span>`},
      {k:'min', t:'Stock mini', r:true, render:r=>r.min?fmt.n(r.min):'<span class="muted">—</span>'},
      {k:'couv', t:'Couverture', render:r=>{
        const p = r.min? Math.min(100, r.qte/(r.min*2)*100) : 100;
        const c = r.statut==='Critique'?'var(--danger)':r.statut==='Faible'?'var(--warn)':'var(--forest)';
        return `<div class="progress" style="width:110px"><i style="width:${p.toFixed(0)}%;background:${c}"></i></div>`;
      }},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'history',t:'Mouvements',a:'mv'},{i:'link',t:'Traçabilité',a:'trace'}])}
    ], rows, {ph:"Rechercher un produit, un lot, un magasin…",
        filters:[{k:'lot', t:'Lot', options:()=>[...new Set(rows.map(s=>s.lot))].filter(l=>l!=='—')},
                 {k:'statut', t:'Statut', options:['Normal','Faible','Critique','Bloqué']}],
        rowAction:(a,r)=>{ if(a==='mv') return App.go('mouvements');
                           if(a==='trace') return App.go('tracabilite',{lot:r.lot}); }});
};

PAGES.stock = () => pageHead("Vue globale du stock","Tous magasins et toutes familles — mise à jour en temps réel",
  `<button class="btn btn-sm" data-go="mouvements">${icon('history')}Mouvements</button>
   <button class="btn btn-sm btn-primary" data-go="inventaire">${icon('list')}Inventaire</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${DB.stockCards.map(c=>`<article class="card kpi">
        <div class="kpi-label">${icon(c.icon)}${c.label}</div>
        <div class="kpi-value">${c.v}<small>${c.u}</small></div>
        <div class="kpi-foot"><span class="tiny muted">${c.d}</span></div></article>`).join('')}
     </div>`
  + dataTable('stk-all', [
      {k:'produit', t:'Produit', render:r=>`<div class="strong">${r.produit}</div>`},
      {k:'lot', t:'Lot', render:r=>r.lot!=='—'?`<span class="ref" data-lot="${r.lot}" style="cursor:pointer">${r.lot}</span>`:'<span class="muted">—</span>'},
      {k:'magasin', t:'Magasin'},
      {k:'qte', t:'Quantité', r:true, render:r=>`<span class="strong">${fmt.n(r.qte, r.qte%1?2:0)}</span> <span class="muted">${r.unite}</span>`},
      {k:'min', t:'Stock minimum', r:true, render:r=>r.min?fmt.n(r.min)+' '+r.unite:'<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'history',t:'Mouvements',a:'mv'},{i:'link',t:'Traçabilité',a:'trace'}])}
    ], DB.stocks, {ph:"Rechercher un produit, un lot, un magasin…", per:10, rerender:()=>App.render(),
        filters:[{k:'magasin', t:'Magasin', options:()=>DB.magasins.map(m=>m.nom)},
                 {k:'lot', t:'Lot', options:()=>[...new Set(DB.stocks.map(s=>s.lot))].filter(l=>l!=='—')},
                 {k:'statut', t:'Statut', options:['Normal','Faible','Critique','Bloqué']}],
        rowAction:(a,r)=>{ if(a==='mv') return App.go('mouvements');
                           if(a==='trace') return App.go('tracabilite',{lot:r.lot}); }});

PAGES.matieres      = () => stockPage("Matières premières","Olives et consommables de process", r=>r.magasin==='Matières premières');
PAGES['huile-vrac'] = () => stockPage("Huile en vrac","Cuves de stockage et lots d'huile", r=>r.magasin==='Magasin huile');
PAGES['produits-finis'] = () => stockPage("Produits finis","Références conditionnées et prêtes à la vente", r=>r.magasin==='Produits finis');
PAGES.emballages    = () => stockPage("Emballages","Bouteilles, bidons, capsules, étiquettes et cartons", r=>r.magasin==='Emballages');

PAGES.magasins = () => pageHead("Magasins","Emplacements de stockage et responsables",
  `<button class="btn btn-sm btn-primary" data-crud="add:magasins">${icon('plus')}Nouveau magasin</button>`)
  + dataTable('mag', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Magasin', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'resp', t:'Responsable'},
      {k:'articles', t:'Références', r:true},
      {k:'valeur', t:'Valeur du stock', r:true, render:r=>fmt.n(r.valeur)+' TND'},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'transfer',t:'Transférer',a:'tr'}])}
    ], DB.magasins, {noPager:true, ph:"Rechercher un magasin…", entity:'magasins'});

PAGES.mouvements = () => pageHead("Mouvements de stock","Chaque variation est tracée et non modifiable après validation (RG-STK-02)")
  + dataTable('mv', [
      {k:'date', t:'Date'},
      {k:'sens', t:'Sens', render:r=>`<span class="badge ${r.sens==='Entrée'?'ok':'warn'}">${r.sens}</span>`},
      {k:'produit', t:'Produit', render:r=>`<span class="strong">${r.produit}</span>`},
      {k:'qte', t:'Quantité', r:true, render:r=>fmt.n(r.qte, r.qte%1?1:0)},
      {k:'lot', t:'Lot', render:r=>r.lot!=='—'?`<span class="ref">${r.lot}</span>`:'<span class="muted">—</span>'},
      {k:'magasin', t:'Magasin'},
      {k:'motif', t:'Motif'},
      {k:'user', t:'Utilisateur', render:r=>`<span class="muted">${r.user}</span>`}
    ], DB.mouvements, {ph:"Rechercher un mouvement, un lot, un motif…",
        filters:[{k:'sens', t:'Sens', options:['Entrée','Sortie']},
                 {k:'magasin', t:'Magasin', options:()=>DB.magasins.map(m=>m.nom)},
                 {k:'user', t:'Utilisateur', options:()=>[...new Set(DB.mouvements.map(m=>m.user))]}]});

PAGES.inventaire = () => pageHead("Inventaire physique","Comptage du magasin Produits finis — session ouverte le 05/09/2026",
  `<button class="btn btn-sm">Annuler la session</button>
   <button class="btn btn-sm btn-primary" data-toast="Inventaire validé|Les écarts ont généré des mouvements de régularisation.">${icon('check')}Valider l'inventaire</button>`)
  + card("Comptage en cours", `
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th>Produit</th><th>Lot</th><th class="r">Stock théorique</th><th class="r">Stock compté</th><th class="r">Écart</th><th>Statut</th></tr></thead>
        <tbody>
        ${[["Huile extra vierge 0,75 L","LOT-H-2026-0089",46,42,-4],
           ["Huile extra vierge 1 L","LOT-H-2026-0089",318,318,0],
           ["Huile extra vierge 2 L","LOT-H-2026-0086",164,166,2],
           ["Huile d'olive 5 L","LOT-H-2026-0086",96,96,0]]
          .map(([p,l,t,c,e])=>`<tr><td class="strong">${p}</td><td><span class="ref">${l}</span></td>
            <td class="r">${fmt.n(t)}</td><td class="r"><input class="input" style="width:88px;height:30px;text-align:right" value="${c}"></td>
            <td class="r strong" style="color:${e<0?'var(--danger)':e>0?'var(--warn)':'var(--ink-3)'}">${e>0?'+':''}${e||'—'}</td>
            <td>${statutBadge(e===0?'Conforme':'En attente')}</td></tr>`).join('')}
        </tbody></table></div>`, {flush:false, sub:"Un inventaire validé génère automatiquement les écarts en mouvements (RG-MAG-02)"});

/* =========================== PRODUCTION ================================= */
PAGES.ordres = () => pageHead("Ordres de fabrication","Trituration des lots d'olives — campagne 2025/2026",
  `<button class="btn btn-sm" data-go="rendements">${icon('gauge')}Rendements</button>
   <button class="btn btn-sm btn-primary" data-crud="add:ordres">${icon('plus')}Nouvel ordre</button>`)
  + dataTable('of', [
      {k:'num', t:'OF', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'},
      {k:'produit', t:'Produit'},
      {k:'lot', t:'Lot olives', render:r=>`<span class="ref">${r.lot}</span>`},
      {k:'prevu', t:'Prévu', r:true, render:r=>fmt.n(r.prevu)+' L'},
      {k:'reel', t:'Réel', r:true, render:r=>r.reel!=null?`<span class="strong">${fmt.n(r.reel,1)} L</span>`:'<span class="muted">—</span>'},
      {k:'rdt', t:'Rendement', r:true, render:r=>r.rdt?`<span class="badge ${r.rdt>=14?'ok':'warn'} no-dot">${fmt.pct(r.rdt)}</span>`:'<span class="muted">—</span>'},
      {k:'machine', t:'Machine'},
      {k:'resp', t:'Responsable'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)}
    ], DB.ordres, {ph:"Rechercher un ordre, un lot, une machine…", entity:'ordres', onRow:r=>App.go('of-detail',{of:r.num}),
        filters:[{k:'statut', t:'Statut', options:['Brouillon','Planifié','En production','Terminé','Annulé']},
                 {k:'machine', t:'Machine', options:['Ligne A — Pieralisi','Ligne B — Alfa Laval']},
                 {k:'resp', t:'Responsable', options:()=>[...new Set(DB.ordres.map(o=>o.resp))]},
                 {k:'produit', t:'Produit', options:()=>[...new Set(DB.ordres.map(o=>o.produit))]}]});

PAGES['of-detail'] = (p={}) => {
  const of = DB.ordres.find(o=>o.num===(p.of||'OF-2026-0089')) || DB.ordres[3];
  const etapes = DB.ofEtapes.map(e=>`
    <div class="tl-step ${e.st}">
      <div class="tl-dot">${e.st==='done'?icon('check'):e.st==='current'?icon('clock'):''}</div>
      <div class="tl-body"><div class="tl-t">${e.t}</div><div class="tl-d">${e.d}</div>
        <div class="tiny muted" style="margin-top:3px">${e.h}</div></div>
    </div>`).join('');

  return pageHead(of.num, `${of.produit} · ${of.machine} · responsable ${of.resp}`,
    `<button class="btn btn-sm" data-go="ordres">${icon('list')}Tous les ordres</button>
     <button class="btn btn-sm" data-lot="LOT-H-2026-0089">${icon('link')}Traçabilité</button>
     <button class="btn btn-sm btn-primary" data-toast="Ordre clôturé|Le rendement a été calculé et le stock mis à jour.">${icon('check')}Clôturer l'ordre</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      <article class="card kpi"><div class="kpi-label">${icon('sprout')}Olives consommées</div><div class="kpi-value">4 650<small>kg</small></div></article>
      <article class="card kpi"><div class="kpi-label">${icon('droplet')}Huile obtenue</div><div class="kpi-value">708,6<small>L</small></div></article>
      <article class="card kpi"><div class="kpi-label">${icon('gauge')}Rendement</div><div class="kpi-value">15,24<small>%</small></div>
        <div class="kpi-foot">${trend(1.1)}<span class="tiny muted">vs moyenne campagne</span></div></article>
      <article class="card kpi"><div class="kpi-label">${icon('clock')}Durée de cycle</div><div class="kpi-value">7 h 20</div></article>
     </div>
     <div class="grid" style="grid-template-columns:1.3fr 1fr">
       ${card("Déroulé de la transformation", etapes, {sub:"Chaque étape consomme et produit des quantités tracées"})}
       <div style="display:flex;flex-direction:column;gap:16px">
         ${card("Calcul du rendement", `
           <div class="note" style="line-height:1.7">
             Rendement (%) = quantité d'huile produite ÷ quantité d'olives utilisées × 100<br>
             <strong>708,6 L ÷ 4 650 kg × 100 = 15,24 %</strong>
           </div>
           <div class="mt">
             <div class="stat-line"><span>Quantité prévue</span><span class="v">660,0 L</span></div>
             <div class="stat-line"><span>Quantité réelle</span><span class="v">708,6 L</span></div>
             <div class="stat-line"><span>Écart</span><span class="v" style="color:var(--ok)">+48,6 L (+7,4 %)</span></div>
             <div class="stat-line"><span>Pertes filtration</span><span class="v">6,5 L</span></div>
             <div class="stat-line"><span>Grignons</span><span class="v">1 840 kg</span></div>
             <div class="stat-line"><span>Margines</span><span class="v">2 100 L</span></div>
           </div>`)}
         ${card("Lots rattachés", `
           <div class="stat-line"><div><span class="ref">LOT-2026-00140</span><div class="cell-sub">Olives Chemlali consommées</div></div><div class="v">4 650 kg</div></div>
           <div class="stat-line"><div><span class="ref">LOT-H-2026-0089</span><div class="cell-sub">Huile extra vierge produite</div></div><div class="v">708,6 L</div></div>
           <div class="mt"><button class="btn btn-sm btn-block" data-lot="LOT-H-2026-0089">${icon('link')}Voir la chaîne de traçabilité</button></div>`)}
       </div>
     </div>`;
};

PAGES.production = () => PAGES['of-detail']({of:'OF-2026-0089'});

PAGES.rendements = () => pageHead("Rendements","Indicateur de performance principal de l'huilerie",
  `<button class="btn btn-sm">${icon('download')}Exporter</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Rendement moyen","14,58 %","+0,80 pt vs campagne précédente"],
         ["Meilleur rendement","15,24 %","OF-2026-0089 · Chemlali"],
         ["Rendement le plus faible","13,24 %","OF-2026-0085 · Sahli"],
         ["Ordres clôturés","5","sur 8 ordres de la période"]]
        .map(([l,v,d])=>`<article class="card kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div>
          <div class="kpi-foot"><span class="tiny muted">${d}</span></div></article>`).join('')}
     </div>
     <div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
       ${card("Rendement par campagne", Chart.bars(DB.charts.rendementCampagne.map(r=>r.v),
          {labels:DB.charts.rendementCampagne.map(r=>r.k),w:560,h:230,unit:'%',colors:['#23503A'],bw:34}), {sub:"Un écart hors bornes déclenche une alerte (RG-REND-03)"})}
       ${card("Rendement par producteur", Chart.hbars(DB.producteurs.map(p=>({k:p.nom,v:p.rdt})),{unit:'%'}), {sub:"Base de négociation des prix d'apport"})}
     </div>
     ${card("Détail par ordre de fabrication", dataTable('rdt', [
        {k:'num', t:'OF', render:r=>`<span class="ref">${r.num}</span>`},
        {k:'lot', t:'Lot olives'},
        {k:'produit', t:'Produit'},
        {k:'machine', t:'Machine'},
        {k:'reel', t:'Huile', r:true, render:r=>r.reel!=null?fmt.n(r.reel,1)+' L':'—'},
        {k:'rdt', t:'Rendement', r:true, render:r=>r.rdt?`<span class="badge ${r.rdt>=14?'ok':'warn'} no-dot">${fmt.pct(r.rdt)}</span>`:'<span class="muted">—</span>'}
      ], DB.ordres.filter(o=>o.rdt), {noToolbar:true, noPager:true}), {flush:true})}`;

PAGES.lots = () => pageHead("Lots","Identifiant unique de chaque quantité de matière ou de produit",
  `<button class="btn btn-sm" data-go="tracabilite">${icon('link')}Traçabilité</button>`)
  + dataTable('lots', [
      {k:'num', t:'Numéro de lot', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'type', t:'Type', render:r=>`<span class="badge ${r.type==='Huile'?'gold':'neutral'} no-dot">${r.type}</span>`},
      {k:'produit', t:'Produit', render:r=>`<div class="strong">${r.produit}</div><div class="cell-sub">${r.origine}</div>`},
      {k:'producteur', t:'Producteur'},
      {k:'qte', t:'Quantité initiale', r:true, render:r=>fmt.n(r.qte, r.qte%1?1:0)+' '+r.unite},
      {k:'reste', t:'Stock restant', r:true, render:r=>`<span class="strong">${fmt.n(r.reste, r.reste%1?1:0)} ${r.unite}</span>`},
      {k:'date', t:'Date'},
      {k:'qualite', t:'Qualité', render:r=>statutBadge(r.qualite)},
      {k:'x', t:'', r:true, render:r=>rowActions([{i:'link',t:'Traçabilité',a:'trace'}])}
    ], DB.lots, {ph:"Rechercher un lot, un produit, un producteur…", entity:'lots', onRow:r=>App.go('tracabilite',{lot:r.num}),
        actions:`<button class="btn btn-sm" data-crud="add:lots">${icon('plus')}Ajouter un lot</button>`,
        filters:[{k:'type', t:'Type', options:['Olives','Huile','Produit fini']},
                 {k:'qualite', t:'Qualité', options:['Conforme','Non conforme','En attente']},
                 {k:'producteur', t:'Producteur', options:()=>[...new Set(DB.lots.map(l=>l.producteur))]}]});

/* =========================== TRAÇABILITÉ ================================ */
PAGES.tracabilite = (p={}) => {
  const key = DB.traceLot[p.lot] ? p.lot : 'LOT-H-2026-0089';
  const t = DB.traceLot[key];
  const chaine = t.chaine.map((n,i)=>`
    <div class="trace-node ${i===0?'active':''}" data-node="${i}">
      <div class="trace-ico">${icon(n.icon)}</div>
      <div><div class="trace-k">${n.k}</div><div class="trace-v">${n.v}</div>
        <div class="cell-sub" style="margin-top:3px">${n.d}</div></div>
      ${icon('chevron-right','')}
    </div>`).join('<div class="trace-link"></div>');

  return pageHead("Traçabilité","Chaîne amont et aval restituée en quelques secondes — exigence réglementaire du secteur agroalimentaire",
    `<button class="btn btn-sm">${icon('download')}Rapport PDF</button>
     <button class="btn btn-sm btn-primary" data-toast="Rappel simulé|Les 2 clients concernés ont été identifiés en 0,4 seconde.">${icon('shield-alert')}Simuler un rappel</button>`)
  + `<div class="card" style="margin-bottom:16px">
      <div class="toolbar">
        <div style="position:relative;flex:1;min-width:240px;max-width:420px">
          <input class="input input-search" id="trace-q" placeholder="Rechercher un lot…" value="${key}">
        </div>
        <div class="row gap-sm">
          ${Object.keys(DB.traceLot).map(k=>`<button class="chip ${k===key?'on':''}" data-lot="${k}">${k}</button>`).join('')}
        </div>
      </div>
     </div>
     <div class="grid" style="grid-template-columns:1.15fr 1fr">
       ${card("Chaîne de traçabilité", chaine, {flush:false, sub:"Chaque étape est cliquable et ouvre le document d'origine"})}
       <div style="display:flex;flex-direction:column;gap:16px">
         ${card("Fiche du lot "+key, `<dl class="kv">
            <dt>Producteur</dt><dd>${t.producteur}</dd>
            <dt>Parcelle</dt><dd>${t.parcelle}</dd>
            <dt>Variété</dt><dd>${t.variete}</dd>
            <dt>Quantité initiale</dt><dd>${t.qte}</dd>
            <dt>Date de réception</dt><dd>${t.dateRec}</dd>
            <dt>Analyse qualité</dt><dd>${t.analyse}</dd>
            <dt>Ordre de fabrication</dt><dd>${t.of}</dd>
            <dt>Huile obtenue</dt><dd>${t.huile}</dd>
            <dt>Conditionnement</dt><dd>${t.cond}</dd>
            <dt>Clients concernés</dt><dd>${t.clients}</dd>
            <dt>Livraisons</dt><dd>${t.livraisons}</dd>
            <dt>Factures</dt><dd>${t.factures}</dd>
          </dl>`)}
         ${card("Traçabilité amont et aval", `
            <div class="tiny muted" style="margin-bottom:8px">Sens de restitution</div>
            <div class="row" style="gap:8px">
              <button class="chip on">Amont : produit → producteur</button>
              <button class="chip">Aval : lot → client</button>
            </div>
            <div class="note mt">La traçabilité reste disponible même pour les lots totalement consommés ou vendus (RG-TRAC-02).</div>`)}
       </div>
     </div>`;
};

/* =========================== QUALITÉ ==================================== */
PAGES.qualite = () => {
  const bloque = DB.qualite.find(q=>q.res==='Non conforme');
  return pageHead("Contrôle qualité","Analyses physico-chimiques et organoleptiques rattachées aux lots",
    `<button class="btn btn-sm btn-primary" data-crud="add:qualite">${icon('flask')}Saisir une analyse</button>`)
  + (bloque ? `<div class="blocked" style="margin-bottom:16px">${icon('shield-alert')}
      <div style="flex:1"><strong>Lot bloqué — ${bloque.lot}</strong>
        <div class="tiny" style="margin-top:2px">Acidité ${fmt.pct(bloque.acidite)} au-delà du seuil autorisé. Le lot ne peut être ni consommé ni vendu (RG-LOT-03).</div></div>
      <button class="btn btn-sm" data-lot="LOT-2026-00145">Voir traçabilité</button>
      <button class="btn btn-sm btn-danger" data-toast="Déblocage refusé|Seul le responsable qualité peut lever un blocage (RG-QUA-03).">Lever le blocage</button>
     </div>`:'')
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Analyses de la campagne","148","dont 6 cette semaine"],["Lots conformes","142","95,9 % du total"],
         ["Lots non conformes","3","tous bloqués en stock"],["Analyses en attente","3","dont 1 depuis plus de 24 h"]]
        .map(([l,v,d])=>`<article class="card kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div>
          <div class="kpi-foot"><span class="tiny muted">${d}</span></div></article>`).join('')}
     </div>`
  + dataTable('qua', [
      {k:'lot', t:'Lot', render:r=>`<span class="ref">${r.lot}</span>`},
      {k:'produit', t:'Produit'},
      {k:'acidite', t:'Acidité', r:true, render:r=>r.acidite!=null?`<span class="${r.acidite>0.8?'strong':''}" style="${r.acidite>0.8?'color:var(--danger)':''}">${fmt.n(r.acidite,2)} %</span>`:'<span class="muted">—</span>'},
      {k:'peroxyde', t:'Peroxyde', r:true, render:r=>r.peroxyde!=null?fmt.n(r.peroxyde,1)+' meq':'<span class="muted">—</span>'},
      {k:'humidite', t:'Humidité', r:true, render:r=>r.humidite!=null?fmt.n(r.humidite,2)+' %':'<span class="muted">—</span>'},
      {k:'impuretes', t:'Impuretés', r:true, render:r=>r.impuretes!=null?fmt.n(r.impuretes,2)+' %':'<span class="muted">—</span>'},
      {k:'date', t:'Date'},
      {k:'analyste', t:'Analyste'},
      {k:'res', t:'Résultat', render:r=>statutBadge(r.res)}
    ], DB.qualite, {ph:"Rechercher un lot, un produit, un analyste…", entity:'qualite',
        filters:[{k:'res', t:'Résultat', options:['Conforme','Non conforme','En attente']},
                 {k:'produit', t:'Produit', options:()=>[...new Set(DB.qualite.map(q=>q.produit))]},
                 {k:'analyste', t:'Analyste', options:()=>[...new Set(DB.qualite.map(q=>q.analyste))].filter(a=>a!=='—')}]});
};

/* =========================== CONDITIONNEMENT ============================ */
PAGES.conditionnement = () => pageHead("Conditionnement","Transformation de l'huile en vrac en produits finis",
  `<button class="btn btn-sm btn-primary" data-toast="Conditionnement lancé|Sortie d'huile, sortie d'emballages et entrée de produits finis générées.">${icon('box')}Nouvelle opération</button>`)
  + `<div class="grid" style="grid-template-columns:1fr 1fr">
      ${card("Opération COND-2026-0075", `
        <div class="grid g-2">
          <div class="field"><label>Lot d'huile source</label><select class="input select"><option>LOT-H-2026-0089 — 412,6 L disponibles</option><option>LOT-H-2026-0090 — 198,5 L</option></select></div>
          <div class="field"><label>Produit fini à obtenir</label><select class="input select"><option>Huile extra vierge 0,75 L</option><option>Huile extra vierge 1 L</option></select></div>
          <div class="field"><label>Volume engagé (L)</label><input class="input" type="number" id="cd-vol" value="300"></div>
          <div class="field"><label>Emballage</label><select class="input select"><option>Bouteille verre 0,75 L (8 420 en stock)</option></select></div>
        </div>
        <div class="note mt" style="display:flex;justify-content:space-between;align-items:center;gap:14px">
          <div><strong>Unités obtenues</strong><div class="tiny">300 L ÷ 0,75 L, pertes de remplissage estimées à 1,5 %</div></div>
          <div style="font-family:var(--font-display);font-size:24px;font-weight:600">394 bouteilles</div>
        </div>
        <div class="mt">
          <div class="stat-line"><span>Huile en vrac consommée</span><span class="v">300,0 L</span></div>
          <div class="stat-line"><span>Bouteilles consommées</span><span class="v">394 pc</span></div>
          <div class="stat-line"><span>Capsules consommées</span><span class="v">394 pc</span></div>
          <div class="stat-line"><span>Étiquettes consommées</span><span class="v">394 pc</span></div>
          <div class="stat-line"><span>Pertes constatées</span><span class="v" style="color:var(--warn)">4,5 L</span></div>
          <div class="stat-line"><span>Huile restante sur le lot</span><span class="v">112,6 L</span></div>
        </div>
        <div class="row mt" style="justify-content:flex-end">
          <button class="btn btn-primary" data-toast="Conditionnement validé|394 bouteilles entrées en stock produits finis.">${icon('check')}Valider l'opération</button>
        </div>`, {sub:"Le lot de produit fini hérite du lot d'huile utilisé (RG-COND-02)"})}
      ${card("Stock d'emballages", DB.stocks.filter(s=>s.magasin==='Emballages').map(s=>`
          <div class="stat-line"><div>${s.produit}<div class="cell-sub">Seuil : ${fmt.n(s.min)} ${s.unite}</div></div>
            <div class="v">${statutBadge(s.statut)} ${fmt.n(s.qte)} ${s.unite}</div></div>`).join('')
        + `<div class="note mt">L'opération est bloquée si le stock d'emballages est insuffisant (RG-COND-04).</div>`,
        {sub:"Contrôlé avant validation de l'opération"})}
    </div>`;
