/* ==========================================================================
   OLIVERA ERP — Écrans (3/3)
   Paramétrage · Achats fournisseurs · Sous-produits · Piles et terrasses
   Ventes · Trésorerie · Statistiques et états
   ========================================================================== */

/* Bandeau de cartes chiffrées réutilisable */
function kpiRow(items, taille=21){
  return `<div class="grid g-4" style="margin-bottom:16px">
    ${items.map(([l,v,d])=>`<article class="card kpi"><div class="kpi-label">${l}</div>
      <div class="kpi-value" style="font-size:${taille}px">${v}</div>
      ${d?`<div class="kpi-foot"><span class="tiny muted">${d}</span></div>`:''}</article>`).join('')}</div>`;
}
function boutonsExport(){
  return `<button class="btn btn-sm" data-act-export>${icon('download')}Excel</button>
          <button class="btn btn-sm" data-act-pdf>${icon('file')}PDF</button>
          <button class="btn btn-sm" data-act-print>${icon('print')}Imprimer</button>`;
}

/* ==========================  PARAMÉTRAGE — PERSONNEL  ==================== */
PAGES.personnel = () => pageHead("Fiches du personnel","Permanents et saisonniers de la campagne",
  `<button class="btn btn-sm" data-go="presence">${icon('clock')}Pointage</button>
   <button class="btn btn-sm btn-primary" data-crud="add:employes">${icon('plus')}Nouvel employé</button>`)
  + kpiRow([
      ["Effectif total", String(DB.employes.length), DB.employes.filter(e=>e.statut==='Saisonnier').length+" saisonniers"],
      ["Présents aujourd'hui", String(DB.presences.filter(p=>p.date===Store.dateFR() && p.statut==='Présent').length), "sur "+DB.employes.length+" employés"],
      ["Avances en cours", fmt.n(DB.avances.filter(a=>a.statut==='Validé').reduce((s,a)=>s+a.montant,0),3)+" TND", "à retenir sur salaires"],
      ["Salaires à régler", fmt.n(DB.reglementsPersonnel.filter(r=>r.statut==='En attente').reduce((s,r)=>s+r.net,0),3)+" TND", "en attente de paiement"]
    ])
  + dataTable('pers', [
      {k:'mat', t:'Matricule', render:r=>`<span class="ref">${r.mat}</span>`},
      {k:'nom', t:'Employé', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'poste', t:'Poste'}, {k:'dept', t:'Département'}, {k:'embauche', t:"Date d'embauche"},
      {k:'avances', t:'Avances', r:true, render:r=>{const s=Store.soldePersonnel(r.mat);
        return s.avances? `<span style="color:var(--warn);font-weight:600">${fmt.n(s.avances,3)}</span>` : '<span class="muted">—</span>';}},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.employes, {noPager:true, ph:"Rechercher un employé, un poste…", entity:'employes',
        filters:[{k:'dept', t:'Département', options:()=>[...new Set(DB.employes.map(e=>e.dept))]},
                 {k:'statut', t:'Statut', options:['Permanent','Saisonnier','Inactif']}]});

PAGES.presence = () => pageHead("Présence du personnel","Pointage quotidien et heures supplémentaires",
  `<button class="btn btn-sm" data-go="historique-presences">${icon('history')}Historique</button>
   <button class="btn btn-sm btn-primary" data-crud="add:presences">${icon('plus')}Enregistrer un pointage</button>`)
  + kpiRow([
      ["Présents", String(DB.presences.filter(p=>p.date===Store.dateFR()&&p.statut==='Présent').length), "au "+Store.dateFR()],
      ["Absents", String(DB.presences.filter(p=>p.date===Store.dateFR()&&p.statut==='Absent').length), "à justifier"],
      ["Heures travaillées", fmt.n(DB.presences.filter(p=>p.date===Store.dateFR()).reduce((s,p)=>s+p.heures,0),1)+" h", "cumul du jour"],
      ["Heures supplémentaires", fmt.n(DB.presences.filter(p=>p.date===Store.dateFR()).reduce((s,p)=>s+p.hs,0),1)+" h", "au-delà de 8 h par personne"]
    ])
  + dataTable('pres', [
      {k:'date', t:'Date'},
      {k:'nom', t:'Employé', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.poste}</div>`},
      {k:'arrivee', t:'Arrivée'}, {k:'depart', t:'Départ'},
      {k:'heures', t:'Heures', r:true, render:r=>fmt.n(r.heures,1)+' h'},
      {k:'hs', t:'Heures sup.', r:true, render:r=>r.hs?`<span style="color:var(--warn);font-weight:600">${fmt.n(r.hs,1)} h</span>`:'<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Présent'?'Actif':r.statut==='Absent'?'En retard':'En attente')
        .replace('Actif','Présent').replace('En retard','Absent').replace('En attente',r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.presences, {ph:"Rechercher un employé, une date…", entity:'presences', per:10,
        filters:[{k:'date', t:'Date', options:()=>[...new Set(DB.presences.map(p=>p.date))]},
                 {k:'nom', t:'Employé', options:()=>DB.employes.map(e=>e.nom)},
                 {k:'statut', t:'Statut', options:['Présent','Absent','Congé','Repos']}]});

PAGES['historique-presences'] = () => pageHead("Historique des présences","Cumul par employé sur la période affichée",
  `<button class="btn btn-sm" data-go="presence">${icon('clock')}Pointage du jour</button>`)
  + (()=> {
      const par = {};
      DB.presences.forEach(p=>{ par[p.nom] = par[p.nom] || {nom:p.nom, mat:p.mat, poste:p.poste, jours:0, heures:0, hs:0, absences:0};
        if(p.statut==='Présent'){ par[p.nom].jours++; par[p.nom].heures+=p.heures; par[p.nom].hs+=p.hs; }
        else par[p.nom].absences++; });
      return dataTable('histpres', [
        {k:'mat', t:'Matricule', render:r=>`<span class="ref">${r.mat}</span>`},
        {k:'nom', t:'Employé', render:r=>`<span class="strong">${r.nom}</span>`},
        {k:'poste', t:'Poste'},
        {k:'jours', t:'Jours travaillés', r:true},
        {k:'heures', t:'Heures cumulées', r:true, render:r=>fmt.n(r.heures,1)+' h'},
        {k:'hs', t:'Heures sup.', r:true, render:r=>fmt.n(r.hs,1)+' h'},
        {k:'absences', t:'Absences', r:true, render:r=>r.absences?`<span style="color:var(--danger);font-weight:600">${r.absences}</span>`:'—'}
      ], Object.values(par), {noPager:true, ph:"Rechercher un employé…"});
    })();

PAGES.avances = () => pageHead("Avances et acomptes du personnel","Montants retenus sur les salaires à venir",
  `<button class="btn btn-sm btn-primary" data-crud="add:avances">${icon('plus')}Nouvelle avance</button>`)
  + dataTable('avp', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'nom', t:'Employé', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'montant', t:'Montant', r:true, render:r=>fmt.n(r.montant,3)+' TND'},
      {k:'mode', t:'Mode'}, {k:'motif', t:'Motif'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Validé'?'Validée':r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.avances, {noPager:true, ph:"Rechercher une avance…", entity:'avances',
        filters:[{k:'nom', t:'Employé', options:()=>DB.employes.map(e=>e.nom)},
                 {k:'mode', t:'Mode', options:()=>DB.modesPaiement},
                 {k:'statut', t:'Statut', options:['Brouillon','Validé','Retenu']}]});

PAGES['reglements-personnel'] = () => pageHead("Règlements du personnel","Salaires nets après retenue des avances",
  `<button class="btn btn-sm btn-primary" data-crud="add:reglementsPersonnel">${icon('plus')}Nouveau règlement</button>`)
  + dataTable('rgp', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'nom', t:'Employé', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'periode', t:'Période'},
      {k:'brut', t:'Brut', r:true, render:r=>fmt.n(r.brut,3)},
      {k:'avances', t:'Avances retenues', r:true, render:r=>r.avances?`<span style="color:var(--warn)">− ${fmt.n(r.avances,3)}</span>`:'—'},
      {k:'net', t:'Net à payer', r:true, render:r=>`<span class="strong">${fmt.n(r.net,3)}</span>`},
      {k:'mode', t:'Mode'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Payé'?'Payée':r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'print',t:'Imprimer',a:'print'}])}
    ], DB.reglementsPersonnel, {noPager:true, ph:"Rechercher un règlement…", entity:'reglementsPersonnel',
        filters:[{k:'periode', t:'Période', options:()=>[...new Set(DB.reglementsPersonnel.map(r=>r.periode))]},
                 {k:'statut', t:'Statut', options:['En attente','Payé']}]});

/* ==========================  PARAMÉTRAGE — TIERS  ======================== */
PAGES.transporteurs = () => pageHead("Transporteurs","Prestataires de collecte et de livraison",
  `<button class="btn btn-sm" data-go="transport">${icon('truck')}Véhicules internes</button>
   <button class="btn btn-sm btn-primary" data-crud="add:transporteurs">${icon('plus')}Nouveau transporteur</button>`)
  + dataTable('trspt', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Raison sociale', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.contact}</div>`},
      {k:'tel', t:'Téléphone'}, {k:'vehicule', t:'Véhicule'},
      {k:'tarif', t:'Tarif', r:true, render:r=>r.tarif?fmt.n(r.tarif,3)+' TND/kg':'<span class="muted">—</span>'},
      {k:'solde', t:'Solde dû', r:true, render:r=>r.solde?`<span style="color:var(--danger);font-weight:600">${fmt.n(r.solde,3)}</span>`:'<span class="badge ok">Soldé</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.transporteurs, {noPager:true, ph:"Rechercher un transporteur…", entity:'transporteurs',
        filters:[{k:'statut', t:'Statut', options:['Actif','Inactif']}]});

/* ==========================  PARAMÉTRAGE — ADMINISTRATION  =============== */
const refPage = (titre, sous, entite, cols, rows, filtres) => pageHead(titre, sous,
  `<button class="btn btn-sm btn-primary" data-crud="add:${entite}">${icon('plus')}Ajouter</button>`)
  + dataTable('ref-'+entite, cols.concat([{k:'x', t:'', r:true,
      render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}]),
    rows, {noPager:true, ph:"Rechercher…", entity:entite, filters:filtres||[]});

PAGES.societes = () => refPage("Sociétés","Entités juridiques gérées dans le système",'societes',[
    {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
    {k:'nom', t:'Raison sociale', render:r=>`<span class="strong">${r.nom}</span>`},
    {k:'mf', t:'Matricule fiscal'}, {k:'ville', t:'Ville'}, {k:'tel', t:'Téléphone'},
    {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Active'?'Actif':'Inactif').replace('Actif','Active').replace('Inactif','Inactive')}
  ], DB.societes);

PAGES.exercices = () => refPage("Années et exercices","Périodes comptables ouvertes ou clôturées",'exercices',[
    {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
    {k:'libelle', t:'Libellé', render:r=>`<span class="strong">${r.libelle}</span>`},
    {k:'debut', t:'Début'}, {k:'fin', t:'Fin'},
    {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Ouvert'?'Actif':'Inactif').replace('Actif','Ouvert').replace('Inactif','Clôturé')}
  ], DB.exercices);

PAGES.saisons = () => pageHead("Saisons et campagnes agricoles","Unité d'analyse naturelle de l'activité de l'huilerie",
  `<button class="btn btn-sm btn-primary" data-crud="add:saisons">${icon('plus')}Nouvelle saison</button>`)
  + dataTable('sais', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'libelle', t:'Saison', render:r=>`<span class="strong">${r.libelle}</span>`},
      {k:'debut', t:'Début'}, {k:'fin', t:'Fin'},
      {k:'olives', t:'Olives reçues', r:true, render:r=>fmt.n(r.olives)+' kg'},
      {k:'huile', t:'Huile produite', r:true, render:r=>fmt.n(r.huile)+' L'},
      {k:'rdt', t:'Rendement', r:true, render:r=>`<span class="badge ${r.rdt>=14?'ok':'warn'} no-dot">${fmt.pct(r.rdt)}</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Ouverte'?'Actif':'Inactif').replace('Actif','Ouverte').replace('Inactif','Clôturée')},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.saisons, {noPager:true, ph:"Rechercher une saison…", entity:'saisons'});

PAGES.unites = () => refPage("Unités de mesure","Conversions appliquées aux stocks et aux documents",'unites',[
    {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
    {k:'libelle', t:'Libellé', render:r=>`<span class="strong">${r.libelle}</span>`},
    {k:'type', t:'Type'}, {k:'base', t:'Unité de base'},
    {k:'facteur', t:'Facteur', r:true, render:r=>fmt.n(r.facteur,3)}
  ], DB.unites, [{k:'type', t:'Type', options:['Poids','Volume','Conditionnement','Logistique']}]);

PAGES['modes-paiement'] = () => refPage("Modes de paiement","Journal alimenté et délai d'encaissement par mode",'modesReglement',[
    {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
    {k:'libelle', t:'Libellé', render:r=>`<span class="strong">${r.libelle}</span>`},
    {k:'journal', t:'Journal alimenté'},
    {k:'delai', t:'Délai', r:true, render:r=>r.delai?r.delai+' jours':'Immédiat'},
    {k:'actif', t:'Actif', render:r=>r.actif?'<span class="badge ok">Actif</span>':'<span class="badge neutral">Inactif</span>'}
  ], DB.modesReglement);

/* ==========================  ACHATS  ==================================== */
PAGES['bons-entree-huile'] = () => pageHead("Bons d'entrée d'huile","Entrées d'huile en pile, production interne ou achat en vrac",
  `<button class="btn btn-sm" data-go="piles">${icon('boxes')}État des piles</button>
   <button class="btn btn-sm btn-primary" data-crud="add:bonsEntreeHuile">${icon('plus')}Nouveau bon d'entrée</button>`)
  + kpiRow([
      ["Huile entrée en pile", fmt.n(DB.bonsEntreeHuile.filter(b=>b.statut!=='Brouillon').reduce((s,b)=>s+b.qte,0),1)+" L", "bons validés"],
      ["Bons en brouillon", String(DB.bonsEntreeHuile.filter(b=>b.statut==='Brouillon').length), "à valider"],
      ["Acidité moyenne", fmt.n(DB.bonsEntreeHuile.reduce((s,b)=>s+b.acidite,0)/DB.bonsEntreeHuile.length,2)+" %", "sur les lots entrés"],
      ["Piles alimentées", String(new Set(DB.bonsEntreeHuile.map(b=>b.pile)).size), "sur "+DB.piles.length+" piles"]
    ])
  + dataTable('beh', [
      {k:'num', t:'Bon', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'fournisseur', t:'Fournisseur / origine'},
      {k:'type', t:"Type d'huile"},
      {k:'qte', t:'Quantité', r:true, render:r=>`<span class="strong">${fmt.n(r.qte,1)} L</span>`},
      {k:'pile', t:'Pile', render:r=>`<span class="ref">${r.pile}</span>`},
      {k:'lot', t:'Lot', render:r=>`<span class="ref" data-lot="${r.lot}" style="cursor:pointer">${r.lot}</span>`},
      {k:'acidite', t:'Acidité', r:true, render:r=>fmt.n(r.acidite,2)+' %'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'check',t:'Valider',a:'wf'},{i:'edit',t:'Modifier',a:'edit'}])}
    ], DB.bonsEntreeHuile, {ph:"Rechercher un bon, une pile, un lot…", entity:'bonsEntreeHuile',
        filters:[{k:'pile', t:'Pile', options:()=>DB.piles.map(p=>p.num)},
                 {k:'type', t:"Type d'huile", options:['Extra vierge','Vierge','Lampante']},
                 {k:'fournisseur', t:'Fournisseur', options:()=>[...new Set(DB.bonsEntreeHuile.map(b=>b.fournisseur))]},
                 {k:'statut', t:'Statut', options:Store.etapes}],
        rowAction:(a,r)=>{ if(a==='wf') { Store.avancer(r); App.render(); ENTITES.bonsEntreeHuile.apres(r); } }});

PAGES.organoleptique = () => pageHead("Contrôle organoleptique","Dégustation et classement des huiles par lot",
  `<button class="btn btn-sm" data-go="qualite">${icon('flask')}Analyses physico-chimiques</button>
   <button class="btn btn-sm btn-primary" data-crud="add:organoleptique">${icon('plus')}Nouveau contrôle</button>`)
  + kpiRow([
      ["Contrôles réalisés", String(DB.organoleptique.length), "sur la saison"],
      ["Lots validés", String(DB.organoleptique.filter(o=>o.res==='Validé').length), "classés extra vierge ou vierge"],
      ["Lots non validés", String(DB.organoleptique.filter(o=>o.res==='Non validé').length), "bloqués en stock"],
      ["Acidité moyenne", fmt.n(DB.organoleptique.reduce((s,o)=>s+o.acidite,0)/DB.organoleptique.length,2)+" %", "tous lots confondus"]
    ])
  + dataTable('org', [
      {k:'num', t:'Contrôle', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'lot', t:'Lot', render:r=>`<span class="ref" data-lot="${r.lot}" style="cursor:pointer">${r.lot}</span>`},
      {k:'date', t:'Date'}, {k:'fournisseur', t:'Fournisseur'},
      {k:'type', t:"Type d'huile"},
      {k:'acidite', t:'Acidité', r:true, render:r=>`<span class="${r.acidite>0.8?'strong':''}" style="${r.acidite>0.8?'color:var(--danger)':''}">${fmt.n(r.acidite,2)} %</span>`},
      {k:'fruite', t:'Fruité'}, {k:'amer', t:'Amer'}, {k:'piquant', t:'Piquant'},
      {k:'defaut', t:'Défaut', render:r=>r.defaut==='Aucun'?'<span class="muted">Aucun</span>':`<span style="color:var(--warn)">${r.defaut}</span>`},
      {k:'res', t:'Résultat', render:r=>statutBadge(r.res==='Validé'?'Conforme':r.res==='Non validé'?'Non conforme':'En attente')
        .replace('Conforme','Validé').replace('Non Validé','Non validé')},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'}])}
    ], DB.organoleptique, {ph:"Rechercher un lot, un fournisseur…", entity:'organoleptique', per:10,
        filters:[{k:'type', t:"Type d'huile", options:['Extra vierge','Vierge','Lampante']},
                 {k:'res', t:'Résultat', options:['Validé','Non validé','En attente']},
                 {k:'defaut', t:'Défaut', options:['Aucun','Léger chômé','Moisi-humide','Vineux','Rance']}]});

PAGES['factures-fournisseurs'] = () => pageHead("Factures fournisseurs","Achats facturés, réglés ou en attente",
  `<button class="btn btn-sm" data-go="accomptes-fournisseurs">${icon('coins')}Accomptes</button>
   <button class="btn btn-sm btn-primary" data-crud="add:facturesFournisseurs">${icon('plus')}Nouvelle facture</button>`)
  + kpiRow([
      ["Total facturé", fmt.n(DB.facturesFournisseurs.reduce((s,f)=>s+f.ttc,0),3)+" TND"],
      ["Total réglé", fmt.n(DB.facturesFournisseurs.reduce((s,f)=>s+f.paye,0),3)+" TND"],
      ["Reste à payer", fmt.n(DB.facturesFournisseurs.reduce((s,f)=>s+(f.ttc-f.paye),0),3)+" TND"],
      ["Factures en attente", String(DB.facturesFournisseurs.filter(f=>f.statut!=='Payée').length)]
    ])
  + dataTable('ff', [
      {k:'num', t:'Facture', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'fournisseur', t:'Fournisseur'},
      {k:'ht', t:'Montant HT', r:true, render:r=>fmt.n(r.ht,3)},
      {k:'tva', t:'TVA 19 %', r:true, render:r=>fmt.n(r.tva,3)},
      {k:'ttc', t:'Total TTC', r:true, render:r=>`<span class="strong">${fmt.n(r.ttc,3)}</span>`},
      {k:'paye', t:'Réglé', r:true, render:r=>`<span style="color:var(--ok)">${fmt.n(r.paye,3)}</span>`},
      {k:'reste', t:'Reste', r:true, render:r=>{const v=r.ttc-r.paye;
        return `<span style="font-weight:600;color:${v?'var(--warn)':'var(--ink-3)'}">${fmt.n(v,3)}</span>`;}},
      {k:'echeance', t:'Échéance'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="view">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Régler" data-do="pay">${icon('coins')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="edit">${icon('edit')}</button></div>`}
    ], DB.facturesFournisseurs, {ph:"Rechercher une facture, un fournisseur…", entity:'facturesFournisseurs', per:10,
        filters:[{k:'fournisseur', t:'Fournisseur', options:()=>[...new Set(DB.facturesFournisseurs.map(f=>f.fournisseur))]},
                 {k:'statut', t:'Statut', options:['En attente','Partiellement payée','Payée','Annulée']}],
        rowAction:(a,r)=>{ if(a==='pay') Reglement.fournisseur(r); }});

PAGES['accomptes-fournisseurs'] = () => pageHead("Accomptes fournisseurs","Avances versées avant facturation",
  `<button class="btn btn-sm btn-primary" data-crud="add:accomptesFournisseurs">${icon('plus')}Nouvel accompte</button>`)
  + dataTable('acf', [
      {k:'num', t:'Accompte', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'fournisseur', t:'Fournisseur'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'mode', t:'Mode'}, {k:'ref', t:'Référence', render:r=>`<span class="mono">${r.ref}</span>`},
      {k:'affecte', t:'Affecté à', render:r=>r.affecte!=='—'?`<span class="ref">${r.affecte}</span>`:'<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Affecté'?'Payée':'En attente').replace('Payée','Affecté').replace('En attente','Non affecté')},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.accomptesFournisseurs, {noPager:true, ph:"Rechercher un accompte…", entity:'accomptesFournisseurs',
        filters:[{k:'fournisseur', t:'Fournisseur', options:()=>[...new Set(DB.accomptesFournisseurs.map(a=>a.fournisseur))]},
                 {k:'mode', t:'Mode', options:()=>DB.modesPaiement},
                 {k:'statut', t:'Statut', options:['Affecté','Non affecté']}]});

PAGES['reglements-fournisseurs'] = () => pageHead("Règlements fournisseurs","Décaissements rattachés aux factures d'achat",
  `<button class="btn btn-sm" data-go="factures-fournisseurs">${icon('file')}Factures fournisseurs</button>
   <button class="btn btn-sm btn-primary" data-crud="add:operations">${icon('plus')}Nouveau règlement</button>`)
  + dataTable('rgf', [
      {k:'num', t:'Opération', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'tiers', t:'Fournisseur'}, {k:'motif', t:'Document'},
      {k:'mode', t:'Mode'}, {k:'journal', t:'Journal'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:var(--danger)">${fmt.n(r.montant,3)} TND</span>`},
      {k:'user', t:'Utilisateur'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Validé'?'Validée':r.statut)}
    ], DB.operations.filter(o=>['Règlement fournisseur','Accompte fournisseur'].includes(o.type)),
    {noPager:true, ph:"Rechercher un règlement…",
     filters:[{k:'mode', t:'Mode', options:()=>DB.modesPaiement},
              {k:'tiers', t:'Fournisseur', options:()=>[...new Set(DB.operations.map(o=>o.tiers))]}]});

/* ==========================  PRODUCTION — SOUS-PRODUITS  ================= */
PAGES['sous-produits'] = () => {
  const g = DB.ordres.reduce((s,o)=>s+o.grignons,0), m = DB.ordres.reduce((s,o)=>s+o.margines,0),
        n = DB.ordres.reduce((s,o)=>s+o.noyaux,0), ol = DB.ordres.filter(o=>o.reel).reduce((s,o)=>s+o.olives,0);
  return pageHead("Sous-produits","Grignons, margines et noyaux issus de la trituration",
    `<button class="btn btn-sm" data-go="rendements">${icon('gauge')}Rendements</button>
     ${boutonsExport()}`)
  + kpiRow([
      ["Grignons produits", fmt.n(g)+" kg", ol?fmt.n(g/ol*100,1)+" % des olives triturées":""],
      ["Margines", fmt.n(m)+" L", ol?fmt.n(m/ol*100,1)+" % des olives triturées":""],
      ["Noyaux concassés", fmt.n(n)+" kg", ol?fmt.n(n/g*100,1)+" % des grignons":""],
      ["Olives triturées", fmt.n(ol)+" kg", "base de calcul des ratios"]
    ])
  + `<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      ${card("Répartition de la matière", Chart.donut([
          {k:"Huile", v:Math.round(DB.ordres.reduce((s,o)=>s+(o.reel||0),0)), c:"#d17e06"},
          {k:"Grignons", v:g, c:"#23503A"},
          {k:"Margines", v:m, c:"#4C7B58"},
          {k:"Noyaux", v:n, c:"#7A8B45"}
        ], {centerLabel:'kg / L'}), {sub:"Ce que devient une tonne d'olives entrée à l'huilerie"})}
      ${card("Valorisation des sous-produits", `
        <div class="stat-line"><div>Grignons — combustible et extraction<div class="cell-sub">Prix indicatif 0,080 TND/kg</div></div>
          <div class="v">${fmt.n(g*0.08,3)} TND</div></div>
        <div class="stat-line"><div>Noyaux concassés — chauffage<div class="cell-sub">Prix indicatif 0,220 TND/kg</div></div>
          <div class="v">${fmt.n(n*0.22,3)} TND</div></div>
        <div class="stat-line"><div>Margines — épandage contrôlé<div class="cell-sub">Coût de traitement 0,015 TND/L</div></div>
          <div class="v" style="color:var(--danger)">− ${fmt.n(m*0.015,3)} TND</div></div>
        <div class="stat-line"><div><strong>Résultat net des sous-produits</strong></div>
          <div class="v" style="color:var(--ok)">${fmt.n(g*0.08 + n*0.22 - m*0.015,3)} TND</div></div>
        <div class="note mt">Les prix indicatifs sont paramétrables dans le module Paramétrage.</div>`)}
     </div>`
  + card("Détail par ordre de fabrication", dataTable('sp', [
      {k:'num', t:'OF', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'lot', t:'Lot olives'},
      {k:'olives', t:'Olives triturées', r:true, render:r=>fmt.n(r.olives)+' kg'},
      {k:'reel', t:'Huile', r:true, render:r=>r.reel?fmt.n(r.reel,1)+' L':'<span class="muted">—</span>'},
      {k:'grignons', t:'Grignons', r:true, render:r=>fmt.n(r.grignons)+' kg'},
      {k:'margines', t:'Margines', r:true, render:r=>fmt.n(r.margines)+' L'},
      {k:'noyaux', t:'Noyaux', r:true, render:r=>fmt.n(r.noyaux)+' kg'},
      {k:'pertes', t:'Pertes', r:true, render:r=>fmt.n(r.pertes)+' kg'},
      {k:'rdt', t:'Rendement', r:true, render:r=>r.rdt?`<span class="badge ${r.rdt>=14?'ok':'warn'} no-dot">${fmt.pct(r.rdt)}</span>`:'<span class="muted">—</span>'}
    ], DB.ordres.filter(o=>o.reel), {noToolbar:true, noPager:true}), {flush:true});
};

/* ==========================  STOCK — PILES ET TERRASSES  ================= */
PAGES.piles = () => {
  const total = DB.piles.reduce((s,p)=>s+p.qte,0), cap = DB.piles.reduce((s,p)=>s+p.capacite,0);
  return pageHead("Piles à huile","Cuves de stockage : contenu, lot d'origine et taux de remplissage",
    `<button class="btn btn-sm" data-go="bons-entree-huile">${icon('droplet')}Bons d'entrée</button>
     <button class="btn btn-sm btn-primary" data-crud="add:piles">${icon('plus')}Nouvelle pile</button>`)
  + kpiRow([
      ["Huile stockée", fmt.n(total)+" L", fmt.n(total/cap*100,1)+" % de la capacité"],
      ["Capacité totale", fmt.n(cap)+" L", DB.piles.length+" piles"],
      ["Piles en service", String(DB.piles.filter(p=>p.etat==='En service').length), "contenant de l'huile"],
      ["Piles disponibles", String(DB.piles.filter(p=>p.etat!=='En service').length), "vides ou en nettoyage"]
    ])
  + dataTable('piles', [
      {k:'num', t:'Pile', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'type', t:"Type d'huile"},
      {k:'qte', t:'Quantité', r:true, render:r=>`<span class="strong">${fmt.n(r.qte)} L</span>`},
      {k:'capacite', t:'Capacité', r:true, render:r=>fmt.n(r.capacite)+' L'},
      {k:'remplissage', t:'Remplissage', render:r=>{
        const p = r.qte/r.capacite*100;
        return `<div class="progress" style="width:110px"><i style="width:${p.toFixed(0)}%;background:${p>90?'var(--warn)':'var(--forest)'}"></i></div>
                <div class="cell-sub">${fmt.n(p,0)} %</div>`;}},
      {k:'lot', t:'Lot', render:r=>r.lot!=='—'?`<span class="ref" data-lot="${r.lot}" style="cursor:pointer">${r.lot}</span>`:'<span class="muted">—</span>'},
      {k:'origine', t:'Origine'}, {k:'entree', t:"Date d'entrée"},
      {k:'etat', t:'État', render:r=>statutBadge(r.etat==='En service'?'Actif':r.etat==='Vide'?'Inactif':'En attente')
        .replace('Actif','En service').replace('Inactif','Vide').replace('En attente',r.etat)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'history',t:'Historique de la pile',a:'hist'},{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.piles, {noPager:true, ph:"Rechercher une pile, un lot, une origine…", entity:'piles',
        filters:[{k:'type', t:"Type d'huile", options:['Extra vierge','Vierge','Lampante','Grignon']},
                 {k:'etat', t:'État', options:['En service','Vide','En nettoyage','Hors service']},
                 {k:'saison', t:'Saison', options:()=>DB.saisons.map(s=>s.libelle)}],
        rowAction:(a,r)=>{ if(a==='hist') Vues.historiquePile(r); }});
};

PAGES.terrasses = () => pageHead("Terrasses","Aires de réception et de ressuyage des olives",
  `<button class="btn btn-sm btn-primary" data-crud="add:terrasses">${icon('plus')}Nouvelle terrasse</button>`)
  + kpiRow([
      ["Olives en terrasse", fmt.n(DB.terrasses.reduce((s,t)=>s+t.qte,0))+" kg", "en attente de trituration"],
      ["Terrasses occupées", String(DB.terrasses.filter(t=>t.etat==='Occupée').length), "sur "+DB.terrasses.length],
      ["Surface totale", fmt.n(DB.terrasses.reduce((s,t)=>s+t.surface,0))+" m²"],
      ["Taux d'occupation", fmt.n(DB.terrasses.reduce((s,t)=>s+t.qte,0)/DB.terrasses.reduce((s,t)=>s+t.capacite,0)*100,1)+" %"]
    ])
  + dataTable('ter', [
      {k:'num', t:'Terrasse', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'surface', t:'Surface', r:true, render:r=>fmt.n(r.surface)+' m²'},
      {k:'produit', t:'Produit'}, {k:'fournisseur', t:'Fournisseur'},
      {k:'qte', t:'Quantité', r:true, render:r=>`<span class="strong">${fmt.n(r.qte)} kg</span>`},
      {k:'capacite', t:'Capacité', r:true, render:r=>fmt.n(r.capacite)+' kg'},
      {k:'entree', t:"Date d'entrée"},
      {k:'etat', t:'État', render:r=>statutBadge(r.etat==='Occupée'?'En cours':r.etat==='Libre'?'Actif':'En attente')
        .replace('En cours','Occupée').replace('Actif','Libre').replace('En attente',r.etat)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.terrasses, {noPager:true, ph:"Rechercher une terrasse…", entity:'terrasses',
        filters:[{k:'etat', t:'État', options:['Libre','Occupée','En nettoyage']}]});

/* Écran générique pour chaque sous-produit */
const sousProduitPage = (nom, unite, ligne, champ) => () => {
  const total = DB.ordres.reduce((s,o)=>s+(o[champ]||0),0);
  return pageHead("État des "+nom.toLowerCase(), "Production, stock et mouvements",
    `<button class="btn btn-sm" data-go="sous-produits">${icon('chart')}Tous les sous-produits</button>${boutonsExport()}`)
  + kpiRow([
      [nom+" produits", fmt.n(total)+" "+unite, "cumul de la saison"],
      ["En stock", fmt.n((DB.stocks.find(s=>s.produit===ligne)||{}).qte||0)+" "+unite, "disponible"],
      ["Ordres concernés", String(DB.ordres.filter(o=>o[champ]).length), "ordres de fabrication clôturés"],
      ["Ratio moyen", fmt.n(total/Math.max(1,DB.ordres.filter(o=>o.reel).reduce((s,o)=>s+o.olives,0))*100,1)+" %", "des olives triturées"]
    ])
  + card("Production par ordre de fabrication", dataTable('sp-'+champ, [
      {k:'num', t:'OF', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'lot', t:'Lot olives'},
      {k:'olives', t:'Olives triturées', r:true, render:r=>fmt.n(r.olives)+' kg'},
      {k:champ, t:nom, r:true, render:r=>`<span class="strong">${fmt.n(r[champ])} ${unite}</span>`},
      {k:'ratio', t:'Ratio', r:true, render:r=>fmt.n(r[champ]/r.olives*100,1)+' %'},
      {k:'machine', t:'Ligne'}
    ], DB.ordres.filter(o=>o[champ]), {noPager:true, ph:"Rechercher un ordre…",
        filters:[{k:'machine', t:'Ligne', options:['Ligne A — Pieralisi','Ligne B — Alfa Laval']}]}), {flush:true});
};
PAGES.grignons = sousProduitPage("Grignons","kg","Grignons d'olive","grignons");
PAGES.margines = sousProduitPage("Margines","L","Margines","margines");
PAGES.noyaux   = sousProduitPage("Noyaux","kg","Noyaux concassés","noyaux");

PAGES.articles = () => pageHead("Articles","Référentiel des produits, matières et sous-produits",
  `<button class="btn btn-sm btn-primary" data-crud="add:produits">${icon('plus')}Nouvel article</button>`)
  + dataTable('art', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Désignation', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'cat', t:'Catégorie'},
      {k:'vol', t:'Contenance', r:true, render:r=>r.vol?fmt.n(r.vol,2)+' L':'<span class="muted">—</span>'},
      {k:'prix', t:'Prix de vente HT', r:true, render:r=>fmt.n(r.prix,3)+' TND'},
      {k:'stock', t:'Stock', r:true, render:r=>`<span class="strong">${fmt.n(r.stock)}</span> <span class="muted">${r.unite}</span>`},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.produits, {ph:"Rechercher un article…", entity:'produits', per:10,
        filters:[{k:'cat', t:'Catégorie', options:()=>[...new Set(DB.produits.map(p=>p.cat))]}]});

/* ==========================  VENTES  ==================================== */
PAGES.ventes = () => pageHead("Ventes","Vente → bon de livraison → sortie de stock → facture → règlement",
  `<button class="btn btn-sm" data-go="pos">${icon('cart')}Caisse comptoir</button>
   <button class="btn btn-sm btn-primary" data-crud="add:ventes">${icon('plus')}Nouvelle vente</button>`)
  + kpiRow([
      ["Ventes de la saison", fmt.n(DB.ventes.reduce((s,v)=>s+v.ttc,0),3)+" TND", DB.ventes.length+" documents"],
      ["Ventes au comptant", fmt.n(DB.ventes.filter(v=>v.type==='Comptant').reduce((s,v)=>s+v.ttc,0),3)+" TND"],
      ["Ventes à crédit", fmt.n(DB.ventes.filter(v=>v.type==='Crédit').reduce((s,v)=>s+v.ttc,0),3)+" TND"],
      ["Reste à encaisser", fmt.n(DB.ventes.reduce((s,v)=>s+(v.ttc-v.paye),0),3)+" TND"]
    ])
  + dataTable('vte', [
      {k:'num', t:'Vente', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'client', t:'Client'},
      {k:'type', t:'Type', render:r=>`<span class="badge ${r.type==='Comptant'?'ok':'info'} no-dot">${r.type}</span>`},
      {k:'produit', t:'Produit'},
      {k:'qte', t:'Quantité', r:true, render:r=>fmt.n(r.qte)+' '+r.unite},
      {k:'ttc', t:'Montant TTC', r:true, render:r=>`<span class="strong">${fmt.n(r.ttc,3)}</span>`},
      {k:'paye', t:'Payé', r:true, render:r=>`<span style="color:var(--ok)">${fmt.n(r.paye,3)}</span>`},
      {k:'reste', t:'Reste', r:true, render:r=>{const v=r.ttc-r.paye;
        return `<span style="font-weight:600;color:${v?'var(--warn)':'var(--ink-3)'}">${fmt.n(v,3)}</span>`;}},
      {k:'bl', t:'Bon de livraison', render:r=>r.bl!=='—'?`<span class="ref">${r.bl}</span>`:'<span class="muted">—</span>'},
      {k:'facture', t:'Facture', render:r=>r.facture!=='—'?`<span class="ref">${r.facture}</span>`:'<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="view">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Étape suivante" data-do="wf">${icon('check')}</button>
        <button class="icon-btn tip" data-tip="Encaisser" data-do="pay">${icon('coins')}</button></div>`}
    ], DB.ventes, {ph:"Rechercher une vente, un client…", entity:'ventes', per:10,
        filters:[{k:'client', t:'Client', options:()=>DB.clients.map(c=>c.nom)},
                 {k:'type', t:'Type', options:['Comptant','Crédit']},
                 {k:'statut', t:'Statut', options:Store.etapes.concat('Annulé')},
                 {k:'date', t:'Date', options:()=>[...new Set(DB.ventes.map(v=>v.date))]}],
        rowAction:(a,r)=>{
          if(a==='wf'){ if(Store.avancer(r)) { ENTITES.ventes.apres(r); App.render(); } }
          if(a==='pay'){ const f = DB.factures.find(f=>f.num===r.facture);
            if(f) Encaissement.ouvrir(f); else toast('Aucune facture rattachée','Générez d\'abord la facture de cette vente.','warn'); }
        }});

/* ==========================  TRÉSORERIE  ================================ */
PAGES['caisse-especes'] = () => {
  const c = Store.caisse();
  return pageHead("Caisse espèces","Journal des mouvements d'espèces du "+Store.dateFR(),
    `<button class="btn btn-sm" id="alim-caisse">${icon('plus')}Alimenter la caisse</button>
     <button class="btn btn-sm" data-go="validation-caisse">${icon('check')}Validation de caisse</button>
     <button class="btn btn-sm btn-primary" data-crud="add:operations">${icon('coins')}Nouvelle opération</button>`)
  + kpiRow([
      ["Solde initial", fmt.n(c.initial,3)+" TND", "fonds de caisse du matin"],
      ["Entrées du jour", fmt.n(c.entrees,3)+" TND", c.ops.filter(o=>o.montant>0).length+" opérations"],
      ["Sorties du jour", fmt.n(c.sorties,3)+" TND", c.ops.filter(o=>o.montant<0).length+" opérations"],
      ["Solde théorique", fmt.n(c.theorique,3)+" TND", "initial + entrées − sorties"]
    ])
  + dataTable('cesp', [
      {k:'num', t:'Opération', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'type', t:'Type'}, {k:'tiers', t:'Tiers'}, {k:'motif', t:'Motif'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:${r.montant<0?'var(--danger)':'var(--ok)'}">${r.montant>0?'+':''}${fmt.n(r.montant,3)}</span>`},
      {k:'user', t:'Utilisateur'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Validé'?'Validée':r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'print',t:'Imprimer',a:'print'}])}
    ], DB.operations.filter(o=>o.journal==='Caisse espèces'),
    {ph:"Rechercher une opération…", entity:'operations',
     filters:[{k:'type', t:'Type', options:()=>[...new Set(DB.operations.map(o=>o.type))]},
              {k:'date', t:'Date', options:()=>[...new Set(DB.operations.map(o=>o.date))]},
              {k:'user', t:'Utilisateur', options:()=>[...new Set(DB.operations.map(o=>o.user))]}]});
};

PAGES['caisse-cheques'] = () => pageHead("Caisse chèques","Portefeuille : chèques reçus, remis, encaissés ou rejetés",
  `<button class="btn btn-sm" data-go="paiements">${icon('coins')}Encaissements</button>`)
  + kpiRow(['En attente','Déposé','Encaissé','Rejeté'].map(s=>{
      const l = DB.cheques.filter(c=>c.statut===s);
      return [s, fmt.n(l.reduce((a,c)=>a+c.montant,0),3)+" TND", l.length+" chèque"+(l.length>1?'s':'')];
    }))
  + dataTable('chq2', [
      {k:'num', t:'N° chèque', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'banque', t:'Banque'}, {k:'emetteur', t:'Émetteur'},
      {k:'emission', t:'Émission'}, {k:'echeance', t:'Échéance'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'facture', t:'Document', render:r=>`<span class="ref">${r.facture}</span>`},
      {k:'statut', t:'Statut', render:r=>`<span class="badge ${r.statut==='Encaissé'?'ok':r.statut==='Rejeté'?'danger':r.statut==='Déposé'?'info':'warn'}">${r.statut}</span>`},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Changer le statut" data-chq>${icon('edit')}</button></div>`}
    ], DB.cheques, {ph:"Rechercher un chèque, une banque…",
        filters:[{k:'banque', t:'Banque', options:()=>DB.banques},
                 {k:'statut', t:'Statut', options:['En attente','Déposé','Encaissé','Rejeté']}]});

PAGES.alimentation = () => pageHead("Alimentation de caisse","Transferts entre la banque et la caisse espèces",
  `<button class="btn btn-sm btn-primary" id="alim-caisse">${icon('plus')}Nouvelle alimentation</button>`)
  + dataTable('alim', [
      {k:'num', t:'Opération', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'tiers', t:'Provenance'}, {k:'motif', t:'Motif'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="color:var(--ok);font-weight:600">+ ${fmt.n(r.montant,3)} TND</span>`},
      {k:'user', t:'Utilisateur'},
      {k:'statut', t:'Statut', render:r=>statutBadge('Validée')}
    ], DB.operations.filter(o=>o.type==='Alimentation de caisse'), {noPager:true, ph:"Rechercher…"});

PAGES['validation-caisse'] = () => {
  const c = Store.caisse();
  return pageHead("Validation de caisse","Contrôle et clôture de la journée du "+Store.dateFR(),
    `<button class="btn btn-sm" data-go="caisse-especes">${icon('list')}Journal de caisse</button>`)
  + `<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      ${card("Calcul du solde théorique", `
        <div class="stat-line"><span>Solde initial</span><span class="v">${fmt.n(c.initial,3)} TND</span></div>
        <div class="stat-line"><span>Entrées de la journée</span><span class="v" style="color:var(--ok)">+ ${fmt.n(c.entrees,3)} TND</span></div>
        <div class="stat-line"><span>Sorties de la journée</span><span class="v" style="color:var(--danger)">− ${fmt.n(c.sorties,3)} TND</span></div>
        <div class="note mt" style="display:flex;justify-content:space-between;align-items:center;gap:14px">
          <div><strong>Solde théorique</strong><div class="tiny">Solde initial + entrées − sorties</div></div>
          <div style="font-family:var(--font-display);font-size:24px;font-weight:600">${fmt.n(c.theorique,3)} TND</div>
        </div>`, {sub:c.ops.length+" opérations enregistrées aujourd'hui"})}
      ${card("Comptage physique", `
        <div class="field"><label>Solde réel compté (TND)</label>
          <input class="input" type="number" step="0.001" id="vc-reel" value="${fmt.n(c.theorique,3).replace(/\\s/g,'').replace(',','.')}"></div>
        <div class="mt" id="vc-ecart"></div>
        <div class="field mt"><label>Justification de l'écart</label>
          <textarea class="input" id="vc-justif" rows="2" placeholder="Obligatoire dès qu'un écart est constaté"></textarea></div>
        <div class="row mt" style="justify-content:flex-end">
          <button class="btn btn-primary" id="vc-valider">${icon('check')}Clôturer la caisse</button>
        </div>`, {sub:"L'écart est calculé automatiquement : solde réel − solde théorique"})}
     </div>`
  + card("Historique des validations", dataTable('vcaisse', [
      {k:'date', t:'Date'},
      {k:'initial', t:'Solde initial', r:true, render:r=>fmt.n(r.initial,3)},
      {k:'entrees', t:'Entrées', r:true, render:r=>fmt.n(r.entrees,3)},
      {k:'sorties', t:'Sorties', r:true, render:r=>fmt.n(r.sorties,3)},
      {k:'theorique', t:'Théorique', r:true, render:r=>fmt.n(r.theorique,3)},
      {k:'reel', t:'Réel', r:true, render:r=>`<span class="strong">${fmt.n(r.reel,3)}</span>`},
      {k:'ecart', t:'Écart', r:true, render:r=>r.ecart?`<span style="font-weight:600;color:var(--danger)">${fmt.n(r.ecart,3)}</span>`:'<span class="badge ok">Aucun</span>'},
      {k:'justif', t:'Justification'},
      {k:'user', t:'Utilisateur'},
      {k:'statut', t:'Statut', render:r=>statutBadge('Terminé').replace('Terminé','Clôturée')}
    ], DB.validationsCaisse, {noToolbar:true, noPager:true}), {flush:true});
};

PAGES['historique-reglements'] = () => pageHead("Historique des règlements","Toutes les opérations financières, tous journaux confondus",
  `${boutonsExport()}
   <button class="btn btn-sm btn-primary" data-crud="add:operations">${icon('plus')}Nouvelle opération</button>`)
  + kpiRow([
      ["Encaissements", fmt.n(DB.operations.filter(o=>o.montant>0).reduce((s,o)=>s+o.montant,0),3)+" TND"],
      ["Décaissements", fmt.n(DB.operations.filter(o=>o.montant<0).reduce((s,o)=>s-o.montant,0),3)+" TND"],
      ["Caisse espèces", fmt.n(DB.tresorerie.caisse,3)+" TND"],
      ["Banque", fmt.n(DB.tresorerie.banque,3)+" TND"]
    ])
  + dataTable('histop', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'type', t:'Type'}, {k:'tiers', t:'Tiers'},
      {k:'mode', t:'Mode'}, {k:'journal', t:'Journal'}, {k:'motif', t:'Motif'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:${r.montant<0?'var(--danger)':'var(--ok)'}">${r.montant>0?'+':''}${fmt.n(r.montant,3)}</span>`},
      {k:'user', t:'Utilisateur'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Validé'?'Validée':r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'}])}
    ], DB.operations, {ph:"Rechercher une opération, un tiers…", entity:'operations', per:10,
        filters:[{k:'type', t:'Type', options:()=>[...new Set(DB.operations.map(o=>o.type))]},
                 {k:'journal', t:'Journal', options:['Caisse espèces','Portefeuille chèques','Banque']},
                 {k:'mode', t:'Mode', options:()=>DB.modesPaiement},
                 {k:'date', t:'Date', options:()=>[...new Set(DB.operations.map(o=>o.date))]}]});

PAGES['reglements-clients'] = () => pageHead("Règlements clients","Encaissements rattachés aux factures de vente",
  `<button class="btn btn-sm btn-primary" data-go="paiements">${icon('coins')}Encaisser une facture</button>`)
  + dataTable('rgc', [
      {k:'num', t:'Règlement', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'tiers', t:'Client'}, {k:'doc', t:'Document', render:r=>`<span class="ref">${r.doc}</span>`},
      {k:'mode', t:'Mode'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="color:var(--ok);font-weight:600">${fmt.n(r.montant,3)} TND</span>`}
    ], DB.paiements.filter(p=>p.type==='Client'), {ph:"Rechercher un règlement…",
        filters:[{k:'tiers', t:'Client', options:()=>DB.clients.map(c=>c.nom)},
                 {k:'mode', t:'Mode', options:()=>DB.modesPaiement}]});

/* ==========================  STATISTIQUES ET ÉTATS  ===================== */
PAGES['etat-piles'] = () => pageHead("État par pile","Contenu et valorisation de chaque cuve", boutonsExport())
  + `<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      ${card("Remplissage des piles", Chart.bars(DB.piles.map(p=>p.qte),
        {labels:DB.piles.map(p=>p.num.replace('PILE-','P')), w:560, h:230, unit:'L', bw:34}), {sub:"Quantité en litres par pile"})}
      ${card("Répartition par type d'huile", Chart.donut(
        ['Extra vierge','Vierge','Lampante'].map((t,i)=>({k:t, v:DB.piles.filter(p=>p.type===t).reduce((s,p)=>s+p.qte,0),
          c:['#23503A','#7A8B45','#d17e06'][i]})).filter(x=>x.v), {centerLabel:'Litres'}))}
     </div>`
  + dataTable('etp', [
      {k:'num', t:'Pile', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'type', t:"Type d'huile"}, {k:'lot', t:'Lot'}, {k:'origine', t:'Origine'},
      {k:'qte', t:'Quantité', r:true, render:r=>`<span class="strong">${fmt.n(r.qte)} L</span>`},
      {k:'valeur', t:'Valorisation', r:true, render:r=>fmt.n(r.qte*21,3)+' TND'},
      {k:'entree', t:'Dernière entrée'},
      {k:'etat', t:'État'}
    ], DB.piles, {noPager:true, ph:"Rechercher une pile…",
        filters:[{k:'type', t:"Type d'huile", options:['Extra vierge','Vierge','Lampante']},
                 {k:'saison', t:'Saison', options:()=>DB.saisons.map(s=>s.libelle)}]});

PAGES['etat-pile-date'] = () => pageHead("État par pile et par date","Entrées d'huile datées, pile par pile", boutonsExport())
  + dataTable('etpd', [
      {k:'date', t:'Date'},
      {k:'pile', t:'Pile', render:r=>`<span class="ref">${r.pile}</span>`},
      {k:'num', t:"Bon d'entrée", render:r=>`<span class="ref">${r.num}</span>`},
      {k:'fournisseur', t:'Origine'}, {k:'type', t:"Type d'huile"},
      {k:'qte', t:'Quantité entrée', r:true, render:r=>`<span class="strong">${fmt.n(r.qte,1)} L</span>`},
      {k:'acidite', t:'Acidité', r:true, render:r=>fmt.n(r.acidite,2)+' %'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)}
    ], DB.bonsEntreeHuile, {ph:"Rechercher…",
        filters:[{k:'pile', t:'Pile', options:()=>DB.piles.map(p=>p.num)},
                 {k:'date', t:'Date', options:()=>[...new Set(DB.bonsEntreeHuile.map(b=>b.date))]}]});

PAGES['etat-fournisseurs'] = () => {
  const rows = [...DB.fournisseurs.map(f=>f.nom), 'Huilerie El Fejja', 'Coopérative Sahline'].map(nom=>{
    const s = Store.soldeFournisseur(nom);
    const recu = DB.receptions.filter(r=>r.producteur===nom).reduce((a,r)=>a+r.net,0);
    return { nom, recu, ...s };
  });
  return pageHead("État des fournisseurs","Quantités reçues, achats, accomptes et soldes", boutonsExport())
  + kpiRow([
      ["Achats facturés", fmt.n(rows.reduce((s,r)=>s+r.facture,0),3)+" TND"],
      ["Réglé", fmt.n(rows.reduce((s,r)=>s+r.paye,0),3)+" TND"],
      ["Accomptes non affectés", fmt.n(rows.reduce((s,r)=>s+r.acomptes,0),3)+" TND"],
      ["Solde fournisseurs", fmt.n(rows.reduce((s,r)=>s+r.solde,0),3)+" TND"]
    ])
  + dataTable('etf', [
      {k:'nom', t:'Fournisseur', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'recu', t:'Quantités reçues', r:true, render:r=>r.recu?fmt.n(r.recu)+' kg':'<span class="muted">—</span>'},
      {k:'facture', t:'Montant facturé', r:true, render:r=>fmt.n(r.facture,3)},
      {k:'paye', t:'Réglé', r:true, render:r=>`<span style="color:var(--ok)">${fmt.n(r.paye,3)}</span>`},
      {k:'acomptes', t:'Accomptes', r:true, render:r=>fmt.n(r.acomptes,3)},
      {k:'solde', t:'Solde dû', r:true, render:r=>r.solde?`<span style="font-weight:600;color:var(--danger)">${fmt.n(r.solde,3)}</span>`:'<span class="badge ok">Soldé</span>'},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Relevé fournisseur" data-do="rel">${icon('file')}</button></div>`}
    ], rows, {noPager:true, ph:"Rechercher un fournisseur…",
        rowAction:(a,r)=>{ if(a==='rel') Vues.releveFournisseur(r.nom); }});
};

PAGES['etat-clients'] = () => {
  const rows = DB.clients.map(c=>({ ...c, ...Store.soldeClient(c.nom) }));
  return pageHead("État des clients","Ventes, règlements et créances par client", boutonsExport())
  + kpiRow([
      ["Chiffre d'affaires", fmt.n(rows.reduce((s,r)=>s+r.ca,0),3)+" TND"],
      ["Facturé", fmt.n(rows.reduce((s,r)=>s+r.facture,0),3)+" TND"],
      ["Encaissé", fmt.n(rows.reduce((s,r)=>s+r.paye,0),3)+" TND"],
      ["Créances", fmt.n(rows.reduce((s,r)=>s+r.solde,0),3)+" TND"]
    ])
  + dataTable('etc', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Client', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'ville', t:'Ville'},
      {k:'ca', t:'CA total', r:true, render:r=>fmt.n(r.ca,3)},
      {k:'facture', t:'Facturé', r:true, render:r=>fmt.n(r.facture,3)},
      {k:'paye', t:'Encaissé', r:true, render:r=>`<span style="color:var(--ok)">${fmt.n(r.paye,3)}</span>`},
      {k:'solde', t:'Solde client', r:true, render:r=>r.solde>0?`<span style="font-weight:600;color:var(--danger)">${fmt.n(r.solde,3)}</span>`:'<span class="badge ok">Soldé</span>'},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Relevé client" data-do="rel">${icon('file')}</button></div>`}
    ], rows, {noPager:true, ph:"Rechercher un client…",
        filters:[{k:'ville', t:'Ville', options:()=>[...new Set(DB.clients.map(c=>c.ville))].filter(v=>v!=='—')}],
        rowAction:(a,r)=>{ if(a==='rel') Vues.releveClient(r.nom); }});
};

PAGES['etat-journalier'] = (p={}) => {
  const j = Store.journee(p.date);
  return pageHead("État journalier","Activité complète de la journée du "+j.date,
    `<select class="select" id="ej-date">${[...new Set([Store.dateFR(),'04/09/2026','03/09/2026','02/09/2026'])]
      .map(d=>`<option ${d===j.date?'selected':''}>${d}</option>`).join('')}</select>${boutonsExport()}`)
  + kpiRow([
      ["Olives réceptionnées", fmt.n(j.olives)+" kg", j.receptions.length+" réceptions"],
      ["Huile produite", fmt.n(j.huile,1)+" L", j.production.length+" ordres clôturés"],
      ["Ventes du jour", fmt.n(j.ventes,3)+" TND", j.tickets.length+" tickets · "+j.factures.length+" factures"],
      ["Solde de caisse", fmt.n(Store.caisse(j.date).theorique,3)+" TND", "théorique en fin de journée"]
    ])
  + `<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      ${card("Production et sous-produits", `
        <div class="stat-line"><span>Olives triturées</span><span class="v">${fmt.n(j.production.reduce((s,o)=>s+o.olives,0))} kg</span></div>
        <div class="stat-line"><span>Huile produite</span><span class="v">${fmt.n(j.huile,1)} L</span></div>
        <div class="stat-line"><span>Grignons</span><span class="v">${fmt.n(j.grignons)} kg</span></div>
        <div class="stat-line"><span>Margines</span><span class="v">${fmt.n(j.margines)} L</span></div>
        <div class="stat-line"><span>Noyaux</span><span class="v">${fmt.n(j.noyaux)} kg</span></div>
        <div class="stat-line"><span>Rendement du jour</span><span class="v">${j.olives?fmt.pct(j.huile/j.production.reduce((s,o)=>s+o.olives,1)*100):'—'}</span></div>`,
        {sub:"Cumul des ordres clôturés dans la journée"})}
      ${card("Trésorerie et mouvements", `
        <div class="stat-line"><span>Encaissements</span><span class="v" style="color:var(--ok)">+ ${fmt.n(j.encaissements,3)} TND</span></div>
        <div class="stat-line"><span>Décaissements</span><span class="v" style="color:var(--danger)">− ${fmt.n(j.decaissements,3)} TND</span></div>
        <div class="stat-line"><span>Entrées de stock</span><span class="v">${j.entrees} mouvements</span></div>
        <div class="stat-line"><span>Sorties de stock</span><span class="v">${j.sorties} mouvements</span></div>
        <div class="stat-line"><span>Opérations financières</span><span class="v">${j.operations.length}</span></div>`,
        {sub:"Journal du "+j.date})}
     </div>`
  + card("Détail des opérations du jour", dataTable('ej', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'type', t:'Type'}, {k:'tiers', t:'Tiers'}, {k:'motif', t:'Motif'}, {k:'journal', t:'Journal'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:${r.montant<0?'var(--danger)':'var(--ok)'}">${r.montant>0?'+':''}${fmt.n(r.montant,3)}</span>`},
      {k:'user', t:'Utilisateur'}
    ], j.operations, {noToolbar:true, noPager:true}), {flush:true});
};

PAGES['etats-financiers'] = () => {
  const enc = DB.operations.filter(o=>o.montant>0).reduce((s,o)=>s+o.montant,0);
  const dec = DB.operations.filter(o=>o.montant<0).reduce((s,o)=>s-o.montant,0);
  return pageHead("États financiers","Synthèse de la trésorerie, des créances et des dettes", boutonsExport())
  + kpiRow([
      ["Caisse espèces", fmt.n(DB.tresorerie.caisse,3)+" TND"],
      ["Portefeuille chèques", fmt.n(Store.soldeCheques('En attente')+Store.soldeCheques('Déposé'),3)+" TND"],
      ["Banque", fmt.n(DB.tresorerie.banque,3)+" TND"],
      ["Position globale", fmt.n(DB.tresorerie.caisse+DB.tresorerie.banque,3)+" TND"]
    ])
  + `<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      ${card("Encaissements et décaissements", `
        ${Chart.bars([[enc],[dec]], {labels:['Cumul'], w:420, h:200, unit:'TND', colors:['#23503A','#d17e06'], bw:60})}
        <div class="legend"><span><i style="background:#23503A"></i>Encaissements</span><span><i style="background:#d17e06"></i>Décaissements</span></div>`)}
      ${card("Créances et dettes", `
        <div class="stat-line"><span>Créances clients</span><span class="v" style="color:var(--ok)">${fmt.n(DB.factures.reduce((s,f)=>s+Store.reste(f),0),3)} TND</span></div>
        <div class="stat-line"><span>Dettes fournisseurs</span><span class="v" style="color:var(--danger)">${fmt.n(DB.facturesFournisseurs.reduce((s,f)=>s+(f.ttc-f.paye),0),3)} TND</span></div>
        <div class="stat-line"><span>Salaires à régler</span><span class="v">${fmt.n(DB.reglementsPersonnel.filter(r=>r.statut==='En attente').reduce((s,r)=>s+r.net,0),3)} TND</span></div>
        <div class="stat-line"><span>Chèques rejetés</span><span class="v" style="color:var(--danger)">${fmt.n(Store.soldeCheques('Rejeté'),3)} TND</span></div>
        <div class="stat-line"><span><strong>Position nette</strong></span><span class="v">${fmt.n(DB.tresorerie.caisse+DB.tresorerie.banque+DB.factures.reduce((s,f)=>s+Store.reste(f),0)-DB.facturesFournisseurs.reduce((s,f)=>s+(f.ttc-f.paye),0),3)} TND</span></div>`)}
     </div>`
  + card("Journal des opérations financières", dataTable('etfin', [
      {k:'date', t:'Date'}, {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'type', t:'Type'}, {k:'tiers', t:'Tiers'}, {k:'journal', t:'Journal'}, {k:'mode', t:'Mode'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:${r.montant<0?'var(--danger)':'var(--ok)'}">${fmt.n(r.montant,3)}</span>`}
    ], DB.operations, {per:8, ph:"Rechercher…",
        filters:[{k:'journal', t:'Journal', options:['Caisse espèces','Portefeuille chèques','Banque']}]}), {flush:true});
};

/* ==========================  RELEVÉS ET VUES  =========================== */
Object.assign(Vues, {
  historiquePile(p){
    const bons = DB.bonsEntreeHuile.filter(b=>b.pile===p.num);
    modal({ size:'wide', title:'Historique de la '+p.num,
      body:`<div class="grid g-3" style="margin-bottom:16px">
          <article class="card kpi"><div class="kpi-label">Quantité actuelle</div><div class="kpi-value" style="font-size:20px">${fmt.n(p.qte)}<small>L</small></div></article>
          <article class="card kpi"><div class="kpi-label">Capacité</div><div class="kpi-value" style="font-size:20px">${fmt.n(p.capacite)}<small>L</small></div></article>
          <article class="card kpi"><div class="kpi-label">Remplissage</div><div class="kpi-value" style="font-size:20px">${fmt.n(p.qte/p.capacite*100,0)}<small>%</small></div></article>
        </div>
        <dl class="kv" style="margin-bottom:16px">
          <dt>Type d'huile</dt><dd>${p.type}</dd>
          <dt>Lot en cuve</dt><dd>${p.lot}</dd>
          <dt>Origine</dt><dd>${p.origine}</dd>
          <dt>Date d'entrée</dt><dd>${p.entree}</dd>
          <dt>Saison</dt><dd>${p.saison}</dd>
          <dt>État</dt><dd>${p.etat}</dd>
        </dl>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>Date</th><th>Bon</th><th>Origine</th><th class="r">Quantité</th><th class="r">Acidité</th><th>Statut</th></tr></thead>
          <tbody>${bons.length ? bons.map(b=>`<tr><td>${b.date}</td><td><span class="ref">${b.num}</span></td>
            <td>${b.fournisseur}</td><td class="r strong">${fmt.n(b.qte,1)} L</td><td class="r">${fmt.n(b.acidite,2)} %</td>
            <td>${statutBadge(b.statut)}</td></tr>`).join('')
            : `<tr><td colspan="6"><div class="empty">${icon('droplet')}<div class="empty-t">Aucun mouvement</div>
               <div class="empty-d">Cette pile n'a encore reçu aucun bon d'entrée.</div></div></td></tr>`}</tbody>
        </table></div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn btn-primary" data-crud="add:bonsEntreeHuile">${icon('plus')}Nouveau bon d'entrée</button>`
    });
  },

  releveFournisseur(nom){
    const s = Store.soldeFournisseur(nom);
    const fac = DB.facturesFournisseurs.filter(f=>f.fournisseur===nom);
    const acc = DB.accomptesFournisseurs.filter(a=>a.fournisseur===nom);
    const rec = DB.receptions.filter(r=>r.producteur===nom);
    modal({ size:'wide', title:'Relevé fournisseur — '+nom,
      body:`<div class="invoice" id="rel-print">
        <div class="inv-top">
          <div><div class="inv-co">${DB.societe.nom}</div>
            <div style="margin-top:6px;line-height:1.6">${DB.societe.adresse}<br>MF ${DB.societe.mf}</div></div>
          <div class="inv-meta"><div class="inv-h1">RELEVÉ FOURNISSEUR</div>
            <div style="margin-top:6px;line-height:1.7">${nom}<br>Arrêté au ${Store.dateFR()}<br>Saison 2025/2026</div></div>
        </div>
        <table style="margin-top:18px">
          <thead><tr><th>Date</th><th>Document</th><th>Nature</th><th class="r">Débit</th><th class="r">Crédit</th></tr></thead>
          <tbody>
            ${rec.map(r=>`<tr><td>${r.date.split(' ')[0]}</td><td>${r.num}</td><td>Réception ${fmt.n(r.net)} kg</td><td class="r">—</td><td class="r">—</td></tr>`).join('')}
            ${fac.map(f=>`<tr><td>${f.date}</td><td>${f.num}</td><td>Facture d'achat</td><td class="r">${fmt.n(f.ttc,3)}</td><td class="r">—</td></tr>`).join('')}
            ${acc.map(a=>`<tr><td>${a.date}</td><td>${a.num}</td><td>Accompte ${a.mode}</td><td class="r">—</td><td class="r">${fmt.n(a.montant,3)}</td></tr>`).join('')}
            ${!rec.length && !fac.length && !acc.length ? '<tr><td colspan="5">Aucun mouvement sur la période.</td></tr>':''}
          </tbody>
        </table>
        <div class="inv-tot"><table>
          <tr><td>Total facturé</td><td class="r">${fmt.n(s.facture,3)} TND</td></tr>
          <tr><td>Total réglé</td><td class="r">${fmt.n(s.paye,3)} TND</td></tr>
          <tr><td>Accomptes non affectés</td><td class="r">${fmt.n(s.acomptes,3)} TND</td></tr>
          <tr class="grand"><td>Solde dû</td><td class="r">${fmt.n(s.solde,3)} TND</td></tr>
        </table></div>
        <div class="inv-foot">Relevé établi par ${DB.user.nom} — document non contractuel, à rapprocher des pièces justificatives.</div>
      </div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" data-act-pdf>${icon('download')}PDF</button>
            <button class="btn btn-primary" data-act-print>${icon('print')}Imprimer</button>`
    });
  },

  releveClient(nom){
    const s = Store.soldeClient(nom);
    const fac = DB.factures.filter(f=>f.client===nom);
    const reg = DB.paiements.filter(p=>p.tiers===nom);
    modal({ size:'wide', title:'Relevé client — '+nom,
      body:`<div class="invoice" id="rel-print">
        <div class="inv-top">
          <div><div class="inv-co">${DB.societe.nom}</div>
            <div style="margin-top:6px;line-height:1.6">${DB.societe.adresse}<br>MF ${DB.societe.mf}</div></div>
          <div class="inv-meta"><div class="inv-h1">RELEVÉ CLIENT</div>
            <div style="margin-top:6px;line-height:1.7">${nom}<br>Arrêté au ${Store.dateFR()}<br>Saison 2025/2026</div></div>
        </div>
        <table style="margin-top:18px">
          <thead><tr><th>Date</th><th>Document</th><th>Nature</th><th class="r">Débit</th><th class="r">Crédit</th></tr></thead>
          <tbody>
            ${fac.map(f=>`<tr><td>${f.date}</td><td>${f.num}</td><td>Facture de vente</td><td class="r">${fmt.n(f.ttc,3)}</td><td class="r">—</td></tr>`).join('')}
            ${reg.map(p=>`<tr><td>${p.date}</td><td>${p.num}</td><td>Règlement ${p.mode}</td><td class="r">—</td><td class="r">${fmt.n(Math.abs(p.montant),3)}</td></tr>`).join('')}
            ${!fac.length && !reg.length ? '<tr><td colspan="5">Aucun mouvement sur la période.</td></tr>':''}
          </tbody>
        </table>
        <div class="inv-tot"><table>
          <tr><td>Total facturé</td><td class="r">${fmt.n(s.facture,3)} TND</td></tr>
          <tr><td>Total encaissé</td><td class="r">${fmt.n(s.paye,3)} TND</td></tr>
          <tr class="grand"><td>Solde client</td><td class="r">${fmt.n(s.solde,3)} TND</td></tr>
        </table></div>
        <div class="inv-foot">Relevé établi par ${DB.user.nom} — merci de régler le solde avant l'échéance la plus proche.</div>
      </div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" data-act-pdf>${icon('download')}PDF</button>
            <button class="btn btn-primary" data-act-print>${icon('print')}Imprimer</button>`
    });
  }
});

/* ==========================  RÈGLEMENT FOURNISSEUR  ===================== */
const Reglement = {
  fournisseur(f){
    const reste = f.ttc - f.paye;
    formModal({ title:'Régler la facture '+f.num, okLabel:'Enregistrer le règlement',
      intro:`Fournisseur <strong>${f.fournisseur}</strong> — montant total ${fmt.n(f.ttc,3)} TND, déjà réglé ${fmt.n(f.paye,3)} TND, reste <strong>${fmt.n(reste,3)} TND</strong>.`,
      fields:[
        {k:'montant', l:'Montant à régler (TND)', type:'number', step:'0.001', req:true, def:reste},
        {k:'mode', l:'Mode de paiement', type:'select', options:()=>DB.modesPaiement},
        {k:'date', l:'Date', def:Store.dateFR()},
        {k:'ref', l:'Référence'}
      ],
      onSave: d=>{
        if(d.montant > reste + 0.001)
          return toast('Montant incorrect', `Le règlement dépasse le reste dû (${fmt.n(reste,3)} TND).`, 'err');
        f.paye += d.montant;
        f.statut = f.paye >= f.ttc - 0.001 ? 'Payée' : 'Partiellement payée';
        Store.operation({type:'Règlement fournisseur', tiers:f.fournisseur, montant:-d.montant, mode:d.mode,
          motif:f.num + (d.ref?' — '+d.ref:'')});
        const four = DB.fournisseurs.find(x=>x.nom===f.fournisseur);
        if(four) four.encours = Math.max(0, four.encours - d.montant);
        toast('Règlement enregistré', `${fmt.n(d.montant,3)} TND réglés sur ${f.num}. Reste : ${fmt.n(f.ttc-f.paye,3)} TND.`);
        App.render();
      }});
  }
};
