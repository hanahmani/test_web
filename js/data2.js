/* ==========================================================================
   OLIVERA ERP — Données des modules ajoutés
   Personnel · Tiers · Référentiels · Piles et terrasses · Sous-produits
   Achats fournisseurs · Trésorerie · Ventes
   ========================================================================== */

Object.assign(DB, {

  /* ------------------------------ Référentiels -------------------------- */
  societes: [
    { code:"SOC-01", nom:"Huilerie Ben Chaaben", mf:"1487962/A/M/000", ville:"Sousse", tel:"+216 73 240 118", statut:"Active" },
    { code:"SOC-02", nom:"Ben Chaaben Trading (export)", mf:"1487962/B/M/001", ville:"Sousse", tel:"+216 73 240 120", statut:"Active" }
  ],
  exercices: [
    { code:"EX-2026", libelle:"Exercice 2026", debut:"01/01/2026", fin:"31/12/2026", statut:"Ouvert" },
    { code:"EX-2025", libelle:"Exercice 2025", debut:"01/01/2025", fin:"31/12/2025", statut:"Clôturé" }
  ],
  saisons: [
    { code:"S-2025/26", libelle:"Saison 2025/2026", debut:"01/10/2025", fin:"30/09/2026", olives:126500, huile:18420, rdt:14.56, statut:"Ouverte" },
    { code:"S-2024/25", libelle:"Saison 2024/2025", debut:"01/10/2024", fin:"30/09/2025", olives:111200, huile:15320, rdt:13.78, statut:"Clôturée" },
    { code:"S-2023/24", libelle:"Saison 2023/2024", debut:"01/10/2023", fin:"30/09/2024", olives:98400, huile:13835, rdt:14.06, statut:"Clôturée" }
  ],
  unites: [
    { code:"KG", libelle:"Kilogramme", type:"Poids", base:"KG", facteur:1 },
    { code:"T",  libelle:"Tonne", type:"Poids", base:"KG", facteur:1000 },
    { code:"L",  libelle:"Litre", type:"Volume", base:"L", facteur:1 },
    { code:"BT", libelle:"Bouteille", type:"Conditionnement", base:"U", facteur:1 },
    { code:"BD", libelle:"Bidon", type:"Conditionnement", base:"U", facteur:1 },
    { code:"CT", libelle:"Carton", type:"Conditionnement", base:"U", facteur:12 },
    { code:"PAL",libelle:"Palette", type:"Logistique", base:"U", facteur:60 }
  ],
  modesReglement: [
    { code:"ESP", libelle:"Espèces", journal:"Caisse espèces", delai:0, actif:true },
    { code:"CHQ", libelle:"Chèque", journal:"Portefeuille chèques", delai:30, actif:true },
    { code:"VIR", libelle:"Virement", journal:"Banque", delai:0, actif:true },
    { code:"TRT", libelle:"Traite", journal:"Portefeuille effets", delai:90, actif:true },
    { code:"AUT", libelle:"Autre", journal:"Divers", delai:0, actif:true }
  ],

  /* ------------------------------ Personnel ----------------------------- */
  presences: [
    { date:"05/09/2026", mat:"EMP-004", nom:"Karim Jaziri",    poste:"Responsable production", arrivee:"06:45", depart:"18:10", heures:11.4, hs:3.4, statut:"Présent" },
    { date:"05/09/2026", mat:"EMP-032", nom:"Nabil Ferchichi", poste:"Opérateur",              arrivee:"06:50", depart:"18:00", heures:11.2, hs:3.2, statut:"Présent" },
    { date:"05/09/2026", mat:"EMP-018", nom:"Amine Gharbi",    poste:"Magasinier",             arrivee:"07:05", depart:"17:30", heures:10.4, hs:2.4, statut:"Présent" },
    { date:"05/09/2026", mat:"EMP-011", nom:"Sonia Kacem",     poste:"Responsable qualité",    arrivee:"08:00", depart:"16:00", heures:8.0,  hs:0,   statut:"Présent" },
    { date:"05/09/2026", mat:"EMP-041", nom:"Fethi Belhadj",   poste:"Technicien maintenance", arrivee:"—",     depart:"—",     heures:0,    hs:0,   statut:"Absent" },
    { date:"04/09/2026", mat:"EMP-004", nom:"Karim Jaziri",    poste:"Responsable production", arrivee:"06:40", depart:"19:20", heures:12.7, hs:4.7, statut:"Présent" },
    { date:"04/09/2026", mat:"EMP-032", nom:"Nabil Ferchichi", poste:"Opérateur",              arrivee:"06:55", depart:"19:20", heures:12.4, hs:4.4, statut:"Présent" },
    { date:"04/09/2026", mat:"EMP-018", nom:"Amine Gharbi",    poste:"Magasinier",             arrivee:"07:00", depart:"17:00", heures:10.0, hs:2.0, statut:"Présent" },
    { date:"04/09/2026", mat:"EMP-011", nom:"Sonia Kacem",     poste:"Responsable qualité",    arrivee:"08:10", depart:"16:10", heures:8.0,  hs:0,   statut:"Présent" }
  ],
  avances: [
    { num:"AVP-2026-0042", date:"03/09/2026", mat:"EMP-032", nom:"Nabil Ferchichi", montant:300.000, mode:"Espèces", motif:"Avance sur salaire de septembre", statut:"Validé" },
    { num:"AVP-2026-0041", date:"01/09/2026", mat:"EMP-018", nom:"Amine Gharbi",    montant:200.000, mode:"Espèces", motif:"Acompte frais scolaires", statut:"Validé" },
    { num:"AVP-2026-0039", date:"28/08/2026", mat:"EMP-004", nom:"Karim Jaziri",    montant:500.000, mode:"Virement", motif:"Avance exceptionnelle", statut:"Retenu" }
  ],
  reglementsPersonnel: [
    { num:"RGP-2026-0088", date:"31/08/2026", mat:"EMP-004", nom:"Karim Jaziri",    brut:1850.000, avances:500.000, net:1350.000, mode:"Virement", periode:"Août 2026", statut:"Payé" },
    { num:"RGP-2026-0089", date:"31/08/2026", mat:"EMP-011", nom:"Sonia Kacem",     brut:1420.000, avances:0,       net:1420.000, mode:"Virement", periode:"Août 2026", statut:"Payé" },
    { num:"RGP-2026-0090", date:"31/08/2026", mat:"EMP-018", nom:"Amine Gharbi",    brut:980.000,  avances:200.000, net:780.000,  mode:"Espèces",  periode:"Août 2026", statut:"Payé" },
    { num:"RGP-2026-0091", date:"05/09/2026", mat:"EMP-032", nom:"Nabil Ferchichi", brut:1240.000, avances:300.000, net:940.000,  mode:"Espèces",  periode:"Août 2026", statut:"En attente" }
  ],

  /* ------------------------------ Transporteurs ------------------------- */
  transporteurs: [
    { code:"TRP-01", nom:"Trans Olive",        contact:"Slim Ouertani", tel:"+216 98 114 220", vehicule:"Camion 10 T", tarif:0.180, solde:1240.000, statut:"Actif" },
    { code:"TRP-02", nom:"Transport Sahline",  contact:"Nizar Ayadi",   tel:"+216 22 730 118", vehicule:"Benne 6 T",   tarif:0.150, solde:0,        statut:"Actif" },
    { code:"TRP-03", nom:"Véhicules internes", contact:"Hatem Zouari",  tel:"+216 55 402 118", vehicule:"Flotte propre",tarif:0,     solde:0,        statut:"Actif" }
  ],

  /* ------------------------------ Piles et terrasses -------------------- */
  piles: [
    { num:"PILE-01", capacite:15000, type:"Extra vierge", qte:12460, lot:"LOT-H-2026-0089", origine:"Coopérative Sahline", entree:"03/09/2026", saison:"Saison 2025/2026", etat:"En service" },
    { num:"PILE-02", capacite:15000, type:"Vierge",       qte:8390,  lot:"LOT-H-2026-0090", origine:"Domaine El Kantaoui", entree:"03/09/2026", saison:"Saison 2025/2026", etat:"En service" },
    { num:"PILE-03", capacite:10000, type:"Extra vierge", qte:9600,  lot:"LOT-H-2026-0086", origine:"Verger Ben Salem",   entree:"01/09/2026", saison:"Saison 2025/2026", etat:"En service" },
    { num:"PILE-04", capacite:10000, type:"Extra vierge", qte:2400,  lot:"LOT-H-2026-0085", origine:"Mongi Ayari",        entree:"31/08/2026", saison:"Saison 2025/2026", etat:"En service" },
    { num:"PILE-05", capacite:8000,  type:"Lampante",     qte:0,     lot:"—",               origine:"—",                  entree:"—",          saison:"Saison 2025/2026", etat:"Vide" },
    { num:"PILE-06", capacite:8000,  type:"Extra vierge", qte:0,     lot:"—",               origine:"—",                  entree:"—",          saison:"Saison 2025/2026", etat:"En nettoyage" }
  ],
  terrasses: [
    { num:"TER-A", surface:420, capacite:180000, produit:"Olives Chemlali", qte:4400, fournisseur:"Coopérative Sahline", entree:"04/09/2026", etat:"Occupée" },
    { num:"TER-B", surface:420, capacite:180000, produit:"Olives Chemlali", qte:2560, fournisseur:"Slim Ben Salem",      entree:"04/09/2026", etat:"Occupée" },
    { num:"TER-C", surface:300, capacite:120000, produit:"Olives Chetoui",  qte:1280, fournisseur:"Domaine El Kantaoui", entree:"03/09/2026", etat:"Occupée" },
    { num:"TER-D", surface:300, capacite:120000, produit:"—",               qte:0,    fournisseur:"—",                   entree:"—",          etat:"Libre" }
  ],

  /* ------------------------------ Achats fournisseurs ------------------- */
  bonsEntreeHuile: [
    { num:"BEH-2026-0031", date:"03/09/2026", fournisseur:"Coopérative Sahline", type:"Extra vierge", qte:708.6, pile:"PILE-01", lot:"LOT-H-2026-0089", acidite:0.24, origine:"Production interne OF-2026-0089", statut:"Validé" },
    { num:"BEH-2026-0030", date:"03/09/2026", fournisseur:"Domaine El Kantaoui", type:"Vierge",      qte:342.0, pile:"PILE-02", lot:"LOT-H-2026-0090", acidite:0.62, origine:"Production interne OF-2026-0090", statut:"Validé" },
    { num:"BEH-2026-0029", date:"01/09/2026", fournisseur:"Huilerie El Fejja",   type:"Extra vierge", qte:2400.0,pile:"PILE-03", lot:"LOT-H-2026-0086", acidite:0.31, origine:"Achat huile en vrac", statut:"Validé" },
    { num:"BEH-2026-0028", date:"30/08/2026", fournisseur:"Huilerie El Fejja",   type:"Extra vierge", qte:1800.0,pile:"PILE-03", lot:"LOT-H-2026-0084", acidite:0.29, origine:"Achat huile en vrac", statut:"Brouillon" }
  ],
  organoleptique: [
    { num:"ORG-2026-0074", lot:"LOT-H-2026-0089", date:"03/09/2026", fournisseur:"Coopérative Sahline", type:"Extra vierge", acidite:0.24, fruite:"Fruité vert moyen", amer:"Moyen", piquant:"Moyen", defaut:"Aucun", res:"Validé", obs:"Profil typique Chemlali, très bon équilibre" },
    { num:"ORG-2026-0073", lot:"LOT-H-2026-0090", date:"03/09/2026", fournisseur:"Domaine El Kantaoui", type:"Vierge", acidite:0.62, fruite:"Fruité mûr léger", amer:"Léger", piquant:"Léger", defaut:"Léger chômé", res:"Validé", obs:"Classé vierge, non extra vierge" },
    { num:"ORG-2026-0072", lot:"LOT-2026-00131", date:"31/08/2026", fournisseur:"Mongi Ayari", type:"Lampante", acidite:1.12, fruite:"Absent", amer:"Absent", piquant:"Absent", defaut:"Moisi-humide", res:"Non validé", obs:"Olives stockées trop longtemps avant trituration" },
    { num:"ORG-2026-0071", lot:"LOT-H-2026-0086", date:"01/09/2026", fournisseur:"Huilerie El Fejja", type:"Extra vierge", acidite:0.31, fruite:"Fruité vert intense", amer:"Marqué", piquant:"Marqué", defaut:"Aucun", res:"Validé", obs:"Lot destiné à l'export" }
  ],
  facturesFournisseurs: [
    { num:"FF-2026-00188", date:"01/09/2026", fournisseur:"Emballages Sud SA", ht:7075.630, tva:1344.370, ttc:8420.000, echeance:"01/10/2026", paye:8420.000, statut:"Payée" },
    { num:"FF-2026-00191", date:"03/09/2026", fournisseur:"Huilerie El Fejja", ht:40336.134, tva:7663.866, ttc:48000.000, echeance:"03/10/2026", paye:20000.000, statut:"Partiellement payée" },
    { num:"FF-2026-00193", date:"04/09/2026", fournisseur:"Trans Olive",       ht:1042.017, tva:197.983, ttc:1240.000, echeance:"19/09/2026", paye:0, statut:"En attente" },
    { num:"FF-2026-00186", date:"28/08/2026", fournisseur:"Méca Industrie",    ht:2058.824, tva:391.176, ttc:2450.000, echeance:"28/08/2026", paye:2450.000, statut:"Payée" },
    { num:"FF-2026-00184", date:"25/08/2026", fournisseur:"STEG",              ht:3226.891, tva:613.109, ttc:3840.000, echeance:"10/09/2026", paye:0, statut:"En attente" }
  ],
  accomptesFournisseurs: [
    { num:"ACF-2026-0057", date:"02/09/2026", fournisseur:"Huilerie El Fejja", montant:20000.000, mode:"Virement", ref:"VIR-2026-0181", affecte:"FF-2026-00191", statut:"Affecté" },
    { num:"ACF-2026-0056", date:"29/08/2026", fournisseur:"Coopérative Sahline", montant:24600.000, mode:"Virement", ref:"VIR-2026-0176", affecte:"Apports août", statut:"Affecté" },
    { num:"ACF-2026-0058", date:"05/09/2026", fournisseur:"Emballages Sud SA", montant:3000.000, mode:"Chèque", ref:"CHQ-902114", affecte:"—", statut:"Non affecté" }
  ],

  /* ------------------------------ Ventes -------------------------------- */
  ventes: [
    { num:"VTE-2026-00312", date:"05/09/2026", client:"GMS Carrefour Sousse", type:"Crédit",  produit:"Huile extra vierge conditionnée", qte:356, unite:"bt", ttc:9240.000, paye:0,        bl:"BL-2026-00618", facture:"FAC-2026-00434", statut:"Validé" },
    { num:"VTE-2026-00311", date:"04/09/2026", client:"Sté Medoil Export",    type:"Crédit",  produit:"Huile en vrac extra vierge",      qte:840, unite:"L",  ttc:18600.000,paye:6000.000, bl:"BL-2026-00617", facture:"FAC-2026-00428", statut:"Validé" },
    { num:"VTE-2026-00310", date:"04/09/2026", client:"Épicerie El Baraka",   type:"Crédit",  produit:"Huile extra vierge 1 L",          qte:200, unite:"bt", ttc:4820.000, paye:0,        bl:"BL-2026-00612", facture:"FAC-2026-00431", statut:"Validé" },
    { num:"VTE-2026-00309", date:"02/09/2026", client:"Hôtel Marhaba Palace", type:"Crédit",  produit:"Huile d'olive 5 L",               qte:60,  unite:"bd", ttc:6200.000, paye:3000.000, bl:"BL-2026-00609", facture:"FAC-2026-00430", statut:"Validé" },
    { num:"VTE-2026-00308", date:"05/09/2026", client:"Client comptoir",      type:"Comptant",produit:"Vente comptoir",                  qte:6,   unite:"bt", ttc:142.800,  paye:142.800,  bl:"—",             facture:"TKT-2026-001257", statut:"Clôturé" }
  ],

  /* ------------------------------ Trésorerie ---------------------------- */
  /* Journal unique des opérations financières : caisse, chèques, banque */
  operations: [
    { num:"OP-2026-01204", date:"05/09/2026", type:"Encaissement client", tiers:"Restaurant Le Pressoir", montant:2340.000, mode:"Espèces", journal:"Caisse espèces", motif:"Règlement FAC-2026-00426", user:"Mohamed Ben Chaaben", statut:"Validé", obs:"" },
    { num:"OP-2026-01203", date:"05/09/2026", type:"Vente comptoir", tiers:"Client comptoir", montant:142.800, mode:"Espèces", journal:"Caisse espèces", motif:"Ticket TKT-2026-001257", user:"Mohamed Ben Chaaben", statut:"Validé", obs:"" },
    { num:"OP-2026-01202", date:"05/09/2026", type:"Dépense", tiers:"Station Agil", montant:-920.500, mode:"Espèces", journal:"Caisse espèces", motif:"Carburant camion 148 TU 3620", user:"Amine Gharbi", statut:"Validé", obs:"" },
    { num:"OP-2026-01201", date:"05/09/2026", type:"Avance personnel", tiers:"Nabil Ferchichi", montant:-300.000, mode:"Espèces", journal:"Caisse espèces", motif:"Avance AVP-2026-0042", user:"Mohamed Ben Chaaben", statut:"Validé", obs:"" },
    { num:"OP-2026-01200", date:"05/09/2026", type:"Alimentation de caisse", tiers:"Banque BIAT", montant:5000.000, mode:"Virement", journal:"Caisse espèces", motif:"Retrait bancaire pour fonds de caisse", user:"Mohamed Ben Chaaben", statut:"Validé", obs:"" },
    { num:"OP-2026-01199", date:"04/09/2026", type:"Encaissement client", tiers:"Hôtel Marhaba Palace", montant:3000.000, mode:"Chèque", journal:"Portefeuille chèques", motif:"CHQ-441207 sur FAC-2026-00430", user:"Hana Mansour", statut:"Validé", obs:"Déposé le 05/09" },
    { num:"OP-2026-01198", date:"03/09/2026", type:"Règlement fournisseur", tiers:"Emballages Sud SA", montant:-8420.000, mode:"Virement", journal:"Banque", motif:"FF-2026-00188", user:"Hana Mansour", statut:"Validé", obs:"" },
    { num:"OP-2026-01197", date:"02/09/2026", type:"Accompte fournisseur", tiers:"Huilerie El Fejja", montant:-20000.000, mode:"Virement", journal:"Banque", motif:"ACF-2026-0057", user:"Hana Mansour", statut:"Validé", obs:"" },
    { num:"OP-2026-01196", date:"02/09/2026", type:"Encaissement client", tiers:"Sté Sud Distribution", montant:10720.000, mode:"Virement", journal:"Banque", motif:"FAC-2026-00421", user:"Hana Mansour", statut:"Validé", obs:"" },
    { num:"OP-2026-01195", date:"31/08/2026", type:"Règlement personnel", tiers:"Amine Gharbi", montant:-780.000, mode:"Espèces", journal:"Caisse espèces", motif:"Salaire août 2026", user:"Hana Mansour", statut:"Validé", obs:"" }
  ],
  caisseInitial: 8500.000,        /* fonds de caisse au matin du 05/09/2026 */
  validationsCaisse: [
    { date:"04/09/2026", initial:9240.000, entrees:6820.000, sorties:7560.000, theorique:8500.000, reel:8480.000, ecart:-20.000, user:"Mohamed Ben Chaaben", justif:"Erreur de rendu de monnaie au comptoir", statut:"Clôturée" },
    { date:"03/09/2026", initial:7100.000, entrees:8940.000, sorties:6800.000, theorique:9240.000, reel:9240.000, ecart:0, user:"Mohamed Ben Chaaben", justif:"—", statut:"Clôturée" }
  ]
});

/* Activité de la journée en cours (05/09/2026) : un apport et une trituration,
   afin que l'état journalier et le tableau de bord aient du contenu à afficher. */
DB.receptions.unshift({ num:"REC-2026-00313", date:"05/09/2026 07:20", producteur:"Coopérative Sahline",
  parcelle:"Bloc C", variete:"Chemlali", brut:3880, tare:380, net:3500, humidite:49.6, acidite:0.29,
  qualite:"Excellente", lot:"LOT-2026-00146", statut:"Validée" });
DB.lots.unshift({ num:"LOT-2026-00146", type:"Olives", produit:"Olives Chemlali", origine:"Sahline — Bloc C",
  producteur:"Coopérative Sahline", qte:3500, unite:"kg", reste:0, date:"05/09/2026", qualite:"Conforme" });
DB.ordres.unshift({ num:"OF-2026-0093", date:"05/09/2026", produit:"Huile extra vierge en vrac",
  lot:"LOT-2026-00146", prevu:500, reel:511, rdt:14.60, machine:"Ligne B — Alfa Laval",
  resp:"Karim Jaziri", statut:"Terminé" });

/* Sous-produits calculés pour chaque ordre de fabrication clôturé.
   Ratios usuels d'une huilerie à deux phases, appliqués aux olives triturées. */
DB.ordres.forEach(o=>{
  const lot = DB.lots.find(l=>l.num===o.lot);
  o.olives = lot ? lot.qte : (o.rdt ? Math.round(o.reel/o.rdt*100) : Math.round((o.reel||o.prevu)/0.145));
  o.saison = "Saison 2025/2026";
  if(o.reel){
    o.grignons = Math.round(o.olives*0.35);
    o.margines = Math.round(o.olives*0.45);
    o.noyaux   = Math.round(o.olives*0.35*0.22);
    o.pertes   = +(o.olives*0.02).toFixed(0);
    o.pile     = ["PILE-01","PILE-02","PILE-03","PILE-04"][DB.ordres.indexOf(o)%4];
  } else { o.grignons=0; o.margines=0; o.noyaux=0; o.pertes=0; o.pile="—"; }
});

/* Lignes de stock des sous-produits */
DB.stocks.push(
  { produit:"Grignons d'olive",  lot:"—", magasin:"Aire sous-produits", qte:DB.ordres.reduce((s,o)=>s+o.grignons,0), unite:"kg", min:0, statut:"Normal" },
  { produit:"Noyaux concassés",  lot:"—", magasin:"Aire sous-produits", qte:DB.ordres.reduce((s,o)=>s+o.noyaux,0),   unite:"kg", min:0, statut:"Normal" },
  { produit:"Margines",          lot:"—", magasin:"Bassin de margines", qte:DB.ordres.reduce((s,o)=>s+o.margines,0), unite:"L",  min:0, statut:"Normal" }
);
