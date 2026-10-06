/* ==========================================================================
   OLIVERA ERP — Module Finance
   Caisse espèces et caisse chèques, corrections de solde, règlements du
   personnel par période, ventes, bons de livraison et factures.
   ========================================================================== */

/* Toute opération financière porte un indicateur de validation de caisse :
   tant qu'elle n'est pas validée, elle apparaît en « somme non validée ». */
DB.operations.forEach(o=>{ if(o.valide === undefined) o.valide = Store.parse(o.date) < Store.aujourdhui; });

Object.assign(DB, {

  /* Solde de départ par journal de caisse */
  soldesDepart: [
    { journal:"Caisse espèces",       date:"05/09/2026", montant:8500.000 },
    { journal:"Portefeuille chèques", date:"05/09/2026", montant:0 }
  ],

  /* Corrections de caisse : écart constaté puis validé par un responsable */
  correctionsCaisse: [
    { num:"COR-2026-0007", date:"05/09/2026", journal:"Caisse espèces", solde:0,        validation:false, user:"Mohamed Ben Chaaben", motif:"" },
    { num:"COR-2026-0006", date:"04/09/2026", journal:"Caisse espèces", solde:-20.000,  validation:true,  user:"Mohamed Ben Chaaben", motif:"Erreur de rendu de monnaie au comptoir" },
    { num:"COR-2026-0005", date:"02/09/2026", journal:"Caisse espèces", solde:15.000,   validation:true,  user:"Hana Mansour", motif:"Excédent constaté à la clôture" }
  ],

  /* Règlements du personnel calculés sur une période de présence */
  reglementsPeriode: [
    { num:"RGP-2026-0101", dateReglement:"31/08/2026", dateDe:"01/08/2026", jusqua:"31/08/2026",
      mat:"EMP-004", personnel:"Karim Jaziri",    jours:26, heures:0,   montant:1690.000, mode:"Virement", saison:"Saison 2025/2026", statut:"Payé" },
    { num:"RGP-2026-0102", dateReglement:"31/08/2026", dateDe:"01/08/2026", jusqua:"31/08/2026",
      mat:"EMP-011", personnel:"Sonia Kacem",     jours:24, heures:0,   montant:1392.000, mode:"Virement", saison:"Saison 2025/2026", statut:"Payé" },
    { num:"RGP-2026-0103", dateReglement:"31/08/2026", dateDe:"01/08/2026", jusqua:"31/08/2026",
      mat:"EMP-018", personnel:"Amine Gharbi",    jours:25, heures:0,   montant:1050.000, mode:"Espèces",  saison:"Saison 2025/2026", statut:"Payé" },
    { num:"RGP-2026-0104", dateReglement:"05/09/2026", dateDe:"01/09/2026", jusqua:"05/09/2026",
      mat:"EMP-032", personnel:"Nabil Ferchichi", jours:0,  heures:23.6, montant:129.800, mode:"Espèces",  saison:"Saison 2025/2026", statut:"En attente" }
  ]
});

/* Les bons de livraison sont valorisés à partir des ventes rattachées */
DB.livraisons.forEach(l=>{
  const v = DB.ventes.find(x=>x.bl===l.num);
  l.total = v ? v.ttc : 0;
  l.saison = "Saison 2025/2026";
});
DB.livraisons.push(
  { num:"BL-G-00121", client:"Sté Grignons du Sahel", date:"05/09/2026", lots:"—", colis:0, transporteur:"Trans Olive",
    statut:"Livrée", total:992.000, saison:"Saison 2025/2026" },
  { num:"BL-N-00042", client:"Sté Grignons du Sahel", date:"04/09/2026", lots:"—", colis:0, transporteur:"Trans Olive",
    statut:"Livrée", total:704.000, saison:"Saison 2025/2026" }
);

/* Les ventes de sous-produits alimentent la liste des ventes */
DB.ventes.push(
  { num:"VTE-2026-00313", date:"05/09/2026", client:"Sté Grignons du Sahel", type:"Crédit", produit:"Grignons d'olive",
    qte:12400, unite:"kg", ttc:992.000, paye:992.000, bl:"BL-G-00121", facture:"—", statut:"Validé", saison:"Saison 2025/2026" },
  { num:"VTE-2026-00314", date:"04/09/2026", client:"Sté Grignons du Sahel", type:"Crédit", produit:"Noyaux concassés",
    qte:3200, unite:"kg", ttc:704.000, paye:704.000, bl:"BL-N-00042", facture:"—", statut:"Validé", saison:"Saison 2025/2026" }
);

/* ------------------------------ Compléments v2 -------------------------- */
/* Ces collections sont déclarées ici pour exister aussi côté base de données. */
DB.conversions = [
  { code:"CV-001", qteDe:0.92, de:"Kilogramme", qteVers:1, vers:"Litre", note:"Densité de l'huile d'olive" },
  { code:"CV-002", qteDe:1, de:"Tonne", qteVers:1000, vers:"Kilogramme", note:"" },
  { code:"CV-003", qteDe:1, de:"Kilogramme", qteVers:1000, vers:"Gramme", note:"" },
  { code:"CV-004", qteDe:1, de:"Carton", qteVers:12, vers:"Bouteille", note:"Carton standard" }
];
DB.typesProduction = [
  { code:"TRT-FACON", libelle:"Trituration à façon", tiers:"Client", facturation:"Prestation au kilo d'olives",
    rendementCible:14.0, description:"Le client apporte ses olives et récupère son huile ; l'huilerie facture le service.", actif:true },
  { code:"PROD-PROPRE", libelle:"Production propre", tiers:"Fournisseur", facturation:"Achat des olives ou du rendement huile",
    rendementCible:14.5, description:"L'huilerie achète les olives, produit l'huile et la stocke en pile pour la revendre.", actif:true }
];

/* Les dépenses portent un numéro, une désignation, un fournisseur et
   des pièces de règlement : les colonnes existent donc dès l'amorçage. */
DB.depenses.forEach((d,i)=>{
  d.num = d.num || 'DEP-2026-'+String(120+i).padStart(4,'0');
  d.designation = d.designation || (d.cat + (d.tiers && d.tiers!=='—' ? ' — '+d.tiers : ''));
  d.fournisseur = d.fournisseur || d.tiers;
  d.pieces = d.pieces || (d.montant ? [{ mode: d.mode==='Espèces'?'Espèce':d.mode, montant:d.montant, remarque:'' }] : []);
  d.paye = d.paye ?? d.montant;
});

/* La fiche de présence accepte une remarque par pointage */
DB.presences.forEach(p=>{ if(p.remarque === undefined) p.remarque = ''; });
