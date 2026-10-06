/* ==========================================================================
   OLIVERA ERP — Données de démonstration
   Toutes les valeurs sont fictives mais cohérentes entre elles.
   Ce fichier est le seul point à remplacer par des appels API REST.
   ========================================================================== */

const DB = {

  societe: {
    nom: "Huilerie Ben Chaaben",
    adresse: "Route de Kairouan Km 4, Zone industrielle — 4000 Sousse",
    tel: "+216 73 240 118",
    email: "contact@benchaaben.tn",
    mf: "1487962/A/M/000",
    rc: "B0912472026",
    banque: "BIAT — Agence Sousse Nord",
    rib: "08 041 0025874136952 47",
    tva: 19
  },

  user: { nom: "Mohamed Ben Chaaben", role: "Directeur", initiales: "MB" },

  campagnes: ["Campagne 2025/2026", "Campagne 2024/2025", "Campagne 2023/2024"],
  sites: ["Site de Sousse (principal)", "Site de Kalâa Kebira", "Tous les sites"],

  /* ------------------------------ Tableau de bord ----------------------- */
  kpis: [
    { id:"ca",   label:"Chiffre d'affaires", value:"248 650", unit:"TND", trend:12.8, icon:"wallet",
      spark:[132,148,141,166,175,168,192,206,199,224,236,248] },
    { id:"huile",label:"Huile produite",     value:"18 420",  unit:"L",   trend:8.4,  icon:"droplet",
      spark:[42,61,88,124,168,214,268,320,366,398,412,420] },
    { id:"oliv", label:"Olives réceptionnées",value:"126,5",  unit:"T",   trend:15.2, icon:"sprout",
      spark:[8,18,29,44,58,71,85,96,106,114,121,126] },
    { id:"rdt",  label:"Rendement moyen",    value:"14,58",   unit:"%",   trend:1.3,  icon:"gauge",
      spark:[13.1,13.4,13.2,13.9,14.1,14.0,14.3,14.5,14.4,14.6,14.5,14.58] },
    { id:"stock",label:"Stock disponible",   value:"32 850",  unit:"L",   trend:-3.1, icon:"boxes",
      spark:[38,37,36,35,36,34,35,34,33,33,33,32.8] },
    { id:"crea", label:"Créances clients",   value:"48 250",  unit:"TND", trend:-6.4, icon:"receipt",
      spark:[62,60,58,57,55,54,53,52,51,50,49,48] }
  ],

  mois: ["Oct","Nov","Déc","Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep"],

  charts: {
    caMois:      [8400,26900,41200,38600,31500,24800,19700,15300,12400,9800,8600,11450],
    achatsMois:  [21500,34800,29600,18200,9400,6800,5200,4100,3600,3900,4400,6100],
    prodMois:    [620,3180,4260,3540,2380,1620,1180,720,340,220,180,180],
    rendementCampagne: [ {k:"2021/22",v:13.42}, {k:"2022/23",v:12.95}, {k:"2023/24",v:14.06}, {k:"2024/25",v:13.78}, {k:"2025/26",v:14.58} ],
    parVariete:  [ {k:"Chemlali",v:9840,c:"#23503A"}, {k:"Chetoui",v:4210,c:"#4C7B58"}, {k:"Sahli",v:2380,c:"#7A8B45"}, {k:"Zalmati",v:1290,c:"#d17e06"}, {k:"Oueslati",v:700,c:"#C9B27A"} ],
    stockRepartition: [ {k:"Huile en vrac",v:32850,c:"#23503A"}, {k:"Produits finis",v:12450,c:"#4C7B58"}, {k:"Olives",v:8240,c:"#7A8B45"}, {k:"Emballages",v:45820,c:"#d17e06"} ],
    topClients:  [ {k:"Sté Medoil Export",v:62400}, {k:"GMS Carrefour Sousse",v:41850}, {k:"Épicerie El Baraka",v:28600}, {k:"Restaurant Le Pressoir",v:19240}, {k:"Client comptoir",v:16980} ],
    topFournisseurs:[ {k:"Coop. Sahline",v:48200}, {k:"Verger Ben Salem",v:36400}, {k:"Domaine El Kantaoui",v:24900}, {k:"Emballages Sud SA",v:14600}, {k:"Sté Trans Olive",v:8300} ]
  },

  alertes: [
    { niveau:"danger", titre:"Stock critique", texte:"Huile d'olive extra vierge 0,75 L — 42 unités, seuil fixé à 150", date:"Aujourd'hui, 08:12", cible:"stock", icon:"alert-triangle" },
    { niveau:"warn",   titre:"Contrôle qualité en attente", texte:"Lot LOT-2026-00145 réceptionné hier, analyse non saisie", date:"Aujourd'hui, 07:40", cible:"qualite", icon:"flask" },
    { niveau:"gold",   titre:"Facture échue", texte:"FAC-2026-00428 — Épicerie El Baraka, 4 820,000 TND, 12 jours de retard", date:"Hier, 17:05", cible:"factures", icon:"receipt" },
    { niveau:"ok",     titre:"Production terminée", texte:"OF-2026-0089 clôturé, rendement 15,24 % sur 6,4 T de Chemlali", date:"Hier, 15:22", cible:"production", icon:"check-circle" },
    { niveau:"danger", titre:"Lot bloqué", texte:"LOT-2026-00131 non conforme — acidité 1,12 % au-delà du seuil extra vierge", date:"03/09/2026", cible:"qualite", icon:"shield-alert" },
    { niveau:"info",   titre:"Maintenance préventive", texte:"Décanteur centrifuge DEC-02 — vidange prévue dans 3 jours", date:"02/09/2026", cible:"maintenance", icon:"wrench" }
  ],

  /* ------------------------------ Producteurs --------------------------- */
  producteurs: [
    { code:"PRD-014", nom:"Slim Ben Salem",   tel:"+216 98 214 006", zone:"Sahline",     parcelles:["P-114 Oliveraie Nord","P-115 Oliveraie Sud"], varietes:"Chemlali, Chetoui", apports:14, quantite:38400, rdt:14.9, solde:4820 },
    { code:"PRD-027", nom:"Coopérative Sahline", tel:"+216 73 356 100", zone:"Sahline",  parcelles:["Bloc A","Bloc B","Bloc C"], varietes:"Chemlali", apports:26, quantite:61200, rdt:14.2, solde:0 },
    { code:"PRD-031", nom:"Hédi Trabelsi",    tel:"+216 22 640 918", zone:"Kalâa Kebira",parcelles:["Parcelle Est"], varietes:"Sahli", apports:6, quantite:9800, rdt:13.4, solde:1260 },
    { code:"PRD-042", nom:"Domaine El Kantaoui", tel:"+216 73 246 771", zone:"Hammam Sousse", parcelles:["Sect. 1","Sect. 2"], varietes:"Chetoui, Zalmati", apports:11, quantite:22600, rdt:15.1, solde:0 },
    { code:"PRD-055", nom:"Mongi Ayari",      tel:"+216 55 118 402", zone:"Msaken",      parcelles:["Domaine familial"], varietes:"Chemlali", apports:4, quantite:5100, rdt:13.8, solde:740 }
  ],

  receptions: [
    { num:"REC-2026-00312", date:"04/09/2026 09:14", producteur:"Slim Ben Salem", parcelle:"P-114 Oliveraie Nord", variete:"Chemlali", brut:1250, tare:150, net:1100, humidite:48.2, acidite:0.31, qualite:"Bonne", lot:"LOT-2026-00145", statut:"Validée" },
    { num:"REC-2026-00311", date:"04/09/2026 08:02", producteur:"Coopérative Sahline", parcelle:"Bloc B", variete:"Chemlali", brut:4820, tare:420, net:4400, humidite:51.0, acidite:0.28, qualite:"Excellente", lot:"LOT-2026-00144", statut:"Validée" },
    { num:"REC-2026-00310", date:"03/09/2026 16:38", producteur:"Domaine El Kantaoui", parcelle:"Sect. 2", variete:"Chetoui", brut:2640, tare:240, net:2400, humidite:46.4, acidite:0.42, qualite:"Bonne", lot:"LOT-2026-00143", statut:"Validée" },
    { num:"REC-2026-00309", date:"03/09/2026 11:20", producteur:"Hédi Trabelsi", parcelle:"Parcelle Est", variete:"Sahli", brut:980, tare:120, net:860, humidite:53.8, acidite:0.88, qualite:"Moyenne", lot:"LOT-2026-00142", statut:"Validée" },
    { num:"REC-2026-00308", date:"02/09/2026 15:55", producteur:"Mongi Ayari", parcelle:"Domaine familial", variete:"Chemlali", brut:1640, tare:180, net:1460, humidite:49.1, acidite:0.35, qualite:"Bonne", lot:"LOT-2026-00141", statut:"Validée" },
    { num:"REC-2026-00307", date:"02/09/2026 09:30", producteur:"Coopérative Sahline", parcelle:"Bloc A", variete:"Chemlali", brut:5100, tare:450, net:4650, humidite:50.2, acidite:0.30, qualite:"Excellente", lot:"LOT-2026-00140", statut:"Validée" }
  ],

  /* ------------------------------ Production ---------------------------- */
  ordres: [
    { num:"OF-2026-0092", date:"04/09/2026", produit:"Huile extra vierge en vrac", lot:"LOT-2026-00145", prevu:160, reel:null, rdt:null, machine:"Ligne A — Pieralisi", resp:"Karim Jaziri", statut:"En production" },
    { num:"OF-2026-0091", date:"04/09/2026", produit:"Huile extra vierge en vrac", lot:"LOT-2026-00144", prevu:640, reel:null, rdt:null, machine:"Ligne B — Alfa Laval", resp:"Karim Jaziri", statut:"Planifié" },
    { num:"OF-2026-0090", date:"03/09/2026", produit:"Huile vierge en vrac", lot:"LOT-2026-00143", prevu:330, reel:342, rdt:14.25, machine:"Ligne A — Pieralisi", resp:"Nabil Ferchichi", statut:"Terminé" },
    { num:"OF-2026-0089", date:"03/09/2026", produit:"Huile extra vierge en vrac", lot:"LOT-2026-00140", prevu:660, reel:708.6, rdt:15.24, machine:"Ligne B — Alfa Laval", resp:"Karim Jaziri", statut:"Terminé" },
    { num:"OF-2026-0088", date:"02/09/2026", produit:"Huile extra vierge en vrac", lot:"LOT-2026-00141", prevu:200, reel:206, rdt:14.11, machine:"Ligne A — Pieralisi", resp:"Nabil Ferchichi", statut:"Terminé" },
    { num:"OF-2026-0087", date:"01/09/2026", produit:"Huile lampante", lot:"LOT-2026-00131", prevu:120, reel:0, rdt:null, machine:"Ligne A — Pieralisi", resp:"Nabil Ferchichi", statut:"Annulé" },
    { num:"OF-2026-0086", date:"01/09/2026", produit:"Huile extra vierge en vrac", lot:"LOT-2026-00138", prevu:480, reel:492.4, rdt:14.62, machine:"Ligne B — Alfa Laval", resp:"Karim Jaziri", statut:"Terminé" },
    { num:"OF-2026-0085", date:"31/08/2026", produit:"Huile vierge en vrac", lot:"LOT-2026-00136", prevu:210, reel:198.5, rdt:13.24, machine:"Ligne A — Pieralisi", resp:"Nabil Ferchichi", statut:"Terminé" }
  ],

  ofEtapes: [
    { t:"Réception des olives", d:"4 650 kg — LOT-2026-00140, Chemlali, Coopérative Sahline", h:"03/09 07:10", st:"done" },
    { t:"Nettoyage et effeuillage", d:"Pertes feuilles et terre : 62 kg", h:"03/09 07:45", st:"done" },
    { t:"Broyage", d:"Broyeur à marteaux BRO-01 — grille 6 mm", h:"03/09 08:20", st:"done" },
    { t:"Malaxage", d:"32 min à 26 °C — malaxeur MAL-02", h:"03/09 08:55", st:"done" },
    { t:"Extraction", d:"Décanteur DEC-02, deux phases", h:"03/09 09:40", st:"done" },
    { t:"Séparation", d:"Séparateur centrifuge SEP-01 — 708,6 L d'huile obtenus", h:"03/09 10:25", st:"done" },
    { t:"Stockage huile", d:"Cuve inox CV-04 — magasin Huile", h:"03/09 11:00", st:"done" },
    { t:"Filtration", d:"Filtre à plaques FIL-01 — 702,1 L après filtration", h:"03/09 14:30", st:"current" },
    { t:"Conditionnement", d:"Non démarré", h:"—", st:"todo" }
  ],

  /* ------------------------------ Lots & traçabilité -------------------- */
  lots: [
    { num:"LOT-2026-00145", type:"Olives", produit:"Olives Chemlali", origine:"Sahline — P-114", producteur:"Slim Ben Salem", qte:1100, unite:"kg", reste:1100, date:"04/09/2026", qualite:"En attente" },
    { num:"LOT-2026-00144", type:"Olives", produit:"Olives Chemlali", origine:"Sahline — Bloc B", producteur:"Coopérative Sahline", qte:4400, unite:"kg", reste:4400, date:"04/09/2026", qualite:"Conforme" },
    { num:"LOT-2026-00143", type:"Olives", produit:"Olives Chetoui", origine:"Hammam Sousse — Sect. 2", producteur:"Domaine El Kantaoui", qte:2400, unite:"kg", reste:0, date:"03/09/2026", qualite:"Conforme" },
    { num:"LOT-H-2026-0089", type:"Huile", produit:"Huile extra vierge", origine:"OF-2026-0089", producteur:"Coopérative Sahline", qte:708.6, unite:"L", reste:412.6, date:"03/09/2026", qualite:"Conforme" },
    { num:"LOT-2026-00131", type:"Olives", produit:"Olives Sahli", origine:"Msaken — Domaine familial", producteur:"Mongi Ayari", qte:1400, unite:"kg", reste:1400, date:"31/08/2026", qualite:"Non conforme" }
  ],

  traceLot: {
    "LOT-2026-00145": {
      producteur:"Slim Ben Salem (PRD-014)", parcelle:"P-114 Oliveraie Nord — Sahline",
      variete:"Chemlali", qte:"1 100 kg", dateRec:"04/09/2026 09:14",
      analyse:"Humidité 48,2 % · Acidité 0,31 % · Conforme extra vierge",
      of:"OF-2026-0092 (en production)", huile:"160 L attendus",
      cond:"Non conditionné", clients:"—", livraisons:"—", factures:"—",
      chaine:[
        { k:"Producteur", v:"Slim Ben Salem", icon:"user", d:"PRD-014 · Sahline · 14 apports cette campagne" },
        { k:"Parcelle",   v:"P-114 Oliveraie Nord", icon:"map", d:"Chemlali · 3,2 ha · récolte du 03/09" },
        { k:"Réception",  v:"REC-2026-00312", icon:"truck", d:"04/09/2026 09:14 · brut 1 250 kg · tare 150 kg · net 1 100 kg" },
        { k:"Lot olives", v:"LOT-2026-00145", icon:"package", d:"1 100 kg · magasin Matières premières · analyse en attente" },
        { k:"Production", v:"OF-2026-0092", icon:"factory", d:"Ligne A Pieralisi · en production depuis 10:05" },
        { k:"Lot huile",  v:"LOT-H-2026-0092", icon:"droplet", d:"160 L attendus · cuve CV-06" },
        { k:"Conditionnement", v:"En attente", icon:"box", d:"Aucune opération de conditionnement enregistrée" },
        { k:"Produit fini", v:"—", icon:"tag", d:"Aucun produit fini issu de ce lot à ce jour" },
        { k:"Client",     v:"—", icon:"users", d:"Aucun client concerné" },
        { k:"Livraison",  v:"—", icon:"truck", d:"Aucun bon de livraison" },
        { k:"Facture",    v:"—", icon:"receipt", d:"Aucune facture" }
      ]
    },
    "LOT-H-2026-0089": {
      producteur:"Coopérative Sahline (PRD-027)", parcelle:"Bloc A — Sahline",
      variete:"Chemlali", qte:"708,6 L", dateRec:"02/09/2026 09:30",
      analyse:"Acidité 0,24 % · Peroxyde 8,4 meq · Conforme extra vierge",
      of:"OF-2026-0089 (terminé, rendement 15,24 %)", huile:"708,6 L",
      cond:"296 L conditionnés — 240 bouteilles 0,75 L + 116 bouteilles 1 L",
      clients:"GMS Carrefour Sousse, Épicerie El Baraka", livraisons:"BL-2026-00612, BL-2026-00618", factures:"FAC-2026-00431, FAC-2026-00434",
      chaine:[
        { k:"Producteur", v:"Coopérative Sahline", icon:"user", d:"PRD-027 · 26 apports · rendement moyen 14,2 %" },
        { k:"Parcelle",   v:"Bloc A", icon:"map", d:"Chemlali · 12 ha · récolte du 01/09" },
        { k:"Réception",  v:"REC-2026-00307", icon:"truck", d:"02/09/2026 09:30 · net 4 650 kg" },
        { k:"Lot olives", v:"LOT-2026-00140", icon:"package", d:"4 650 kg · consommé intégralement" },
        { k:"Production", v:"OF-2026-0089", icon:"factory", d:"Terminé le 03/09 · 708,6 L · rendement 15,24 %" },
        { k:"Lot huile",  v:"LOT-H-2026-0089", icon:"droplet", d:"708,6 L · cuve CV-04 · reste 412,6 L" },
        { k:"Conditionnement", v:"COND-2026-0074", icon:"box", d:"296 L → 240 bt 0,75 L + 116 bt 1 L · 4,2 L de pertes" },
        { k:"Produit fini", v:"HEV-075 / HEV-100", icon:"tag", d:"Étiquetés le 03/09 · DLUO 09/2028" },
        { k:"Client",     v:"2 clients livrés", icon:"users", d:"GMS Carrefour Sousse · Épicerie El Baraka" },
        { k:"Livraison",  v:"BL-2026-00612, BL-2026-00618", icon:"truck", d:"Livrés les 04/09 et 05/09" },
        { k:"Facture",    v:"FAC-2026-00431, FAC-2026-00434", icon:"receipt", d:"9 240,000 TND · une facture réglée, une en attente" }
      ]
    }
  },

  qualite: [
    { lot:"LOT-H-2026-0089", produit:"Huile extra vierge", acidite:0.24, peroxyde:8.4, humidite:0.12, impuretes:0.04, res:"Conforme", date:"03/09/2026", analyste:"Sonia Kacem" },
    { lot:"LOT-2026-00144", produit:"Olives Chemlali", acidite:0.28, peroxyde:null, humidite:51.0, impuretes:1.20, res:"Conforme", date:"04/09/2026", analyste:"Sonia Kacem" },
    { lot:"LOT-2026-00145", produit:"Olives Chemlali", acidite:null, peroxyde:null, humidite:null, impuretes:null, res:"En attente", date:"—", analyste:"—" },
    { lot:"LOT-2026-00131", produit:"Olives Sahli", acidite:1.12, peroxyde:null, humidite:56.4, impuretes:3.80, res:"Non conforme", date:"31/08/2026", analyste:"Sonia Kacem" },
    { lot:"LOT-H-2026-0090", produit:"Huile vierge", acidite:0.62, peroxyde:11.2, humidite:0.14, impuretes:0.06, res:"Conforme", date:"03/09/2026", analyste:"Sonia Kacem" },
    { lot:"LOT-H-2026-0086", produit:"Huile extra vierge", acidite:0.31, peroxyde:9.1, humidite:0.11, impuretes:0.03, res:"Conforme", date:"01/09/2026", analyste:"Sonia Kacem" }
  ],

  /* ------------------------------ Catalogue POS ------------------------- */
  produits: [
    { code:"HEV-075", nom:"Huile extra vierge — 0,75 L", cat:"Bouteilles", prix:18.500, stock:42,    unite:"bt", vol:0.75 },
    { code:"HEV-100", nom:"Huile extra vierge — 1 L",    cat:"Bouteilles", prix:24.000, stock:318,   unite:"bt", vol:1 },
    { code:"HEV-200", nom:"Huile extra vierge — 2 L",    cat:"Bidons",     prix:46.500, stock:164,   unite:"bd", vol:2 },
    { code:"HOV-500", nom:"Huile d'olive — 5 L",         cat:"Bidons",     prix:104.000,stock:96,    unite:"bd", vol:5 },
    { code:"HVR-001", nom:"Huile en vrac — au litre",    cat:"Vrac",       prix:21.000, stock:32850, unite:"L",  vol:1 },
    { code:"HVR-025", nom:"Bidon 25 L",                  cat:"Vrac",       prix:498.000,stock:38,    unite:"bd", vol:25 },
    { code:"HVI-100", nom:"Huile vierge — 1 L",          cat:"Bouteilles", prix:19.500, stock:212,   unite:"bt", vol:1 },
    { code:"HEV-050", nom:"Huile extra vierge — 0,5 L",  cat:"Bouteilles", prix:13.200, stock:276,   unite:"bt", vol:0.5 },
    { code:"COF-001", nom:"Coffret dégustation 3×250 ml",cat:"Coffrets",   prix:39.000, stock:54,    unite:"cf", vol:0.75 },
    { code:"SAV-001", nom:"Savon à l'huile d'olive",     cat:"Coffrets",   prix:4.500,  stock:410,   unite:"pc", vol:0 }
  ],

  /* ------------------------------ Clients ------------------------------- */
  clients: [
    { code:"CLI-0012", nom:"Sté Medoil Export",        tel:"+216 71 890 442", ville:"Tunis",  derniere:"04/09/2026", ca:62400, encours:12400, limite:40000, statut:"Actif" },
    { code:"CLI-0024", nom:"GMS Carrefour Sousse",     tel:"+216 73 202 900", ville:"Sousse", derniere:"04/09/2026", ca:41850, encours:9860,  limite:30000, statut:"Actif" },
    { code:"CLI-0031", nom:"Épicerie El Baraka",       tel:"+216 96 442 118", ville:"Msaken", derniere:"02/09/2026", ca:28600, encours:4820,  limite:5000,  statut:"Retard" },
    { code:"CLI-0045", nom:"Restaurant Le Pressoir",   tel:"+216 73 348 210", ville:"Hammam Sousse", derniere:"01/09/2026", ca:19240, encours:0, limite:10000, statut:"Actif" },
    { code:"CLI-0058", nom:"Hôtel Marhaba Palace",     tel:"+216 73 246 477", ville:"Sousse", derniere:"28/08/2026", ca:16420, encours:6200, limite:15000, statut:"Actif" },
    { code:"CLI-0061", nom:"Sté Sud Distribution",     tel:"+216 75 621 004", ville:"Sfax",   derniere:"24/08/2026", ca:11980, encours:0,    limite:12000, statut:"Actif" },
    { code:"CLI-0077", nom:"Boutique Terroir Médina",  tel:"+216 22 908 331", ville:"Sousse", derniere:"18/08/2026", ca:6240,  encours:1180, limite:3000,  statut:"Actif" },
    { code:"CLI-0090", nom:"Client comptoir",          tel:"—",               ville:"—",      derniere:"05/09/2026", ca:16980, encours:0,    limite:0,     statut:"Actif" }
  ],

  commandes: [
    { num:"CMD-2026-00284", client:"Sté Medoil Export",    date:"04/09/2026", montant:18600, livre:"Partielle", statut:"En préparation" },
    { num:"CMD-2026-00283", client:"GMS Carrefour Sousse", date:"03/09/2026", montant:9240,  livre:"Totale",    statut:"Livrée" },
    { num:"CMD-2026-00282", client:"Hôtel Marhaba Palace", date:"02/09/2026", montant:6200,  livre:"Totale",    statut:"Facturée" },
    { num:"CMD-2026-00281", client:"Épicerie El Baraka",   date:"01/09/2026", montant:4820,  livre:"Totale",    statut:"Facturée" },
    { num:"CMD-2026-00280", client:"Restaurant Le Pressoir",date:"31/08/2026",montant:2340,  livre:"Totale",    statut:"Soldée" }
  ],

  livraisons: [
    { num:"BL-2026-00618", client:"GMS Carrefour Sousse", date:"05/09/2026", lots:"LOT-H-2026-0089", colis:82,  transporteur:"Trans Olive", statut:"Livrée" },
    { num:"BL-2026-00617", client:"Sté Medoil Export",    date:"04/09/2026", lots:"LOT-H-2026-0086", colis:210, transporteur:"Véhicule 148 TU 3620", statut:"En cours" },
    { num:"BL-2026-00612", client:"Épicerie El Baraka",   date:"04/09/2026", lots:"LOT-H-2026-0089", colis:36,  transporteur:"Véhicule 92 TU 4471", statut:"Livrée" },
    { num:"BL-2026-00609", client:"Hôtel Marhaba Palace", date:"02/09/2026", lots:"LOT-H-2026-0086", colis:48,  transporteur:"Trans Olive", statut:"Livrée" }
  ],

  /* Factures : chaque facture porte son échéancier de règlement (tranches) */
  factures: [
    { num:"FAC-2026-00434", client:"GMS Carrefour Sousse", date:"05/09/2026", ht:7764.706, tva:1475.294, ttc:9240.000, echeance:"05/10/2026", paye:0, tranches:[] },
    { num:"FAC-2026-00431", client:"Épicerie El Baraka",   date:"01/09/2026", ht:4050.420, tva:769.580,  ttc:4820.000, echeance:"24/08/2026", paye:0, tranches:[] },
    { num:"FAC-2026-00430", client:"Hôtel Marhaba Palace", date:"02/09/2026", ht:5210.084, tva:989.916,  ttc:6200.000, echeance:"02/10/2026", paye:3000, tranches:[
        { n:1, date:"04/09/2026", montant:3000.000, mode:"Chèque", ref:"CHQ-441207", statut:"Payée" },
        { n:2, date:"02/10/2026", montant:3200.000, mode:"Virement", ref:"—", statut:"Prévue" } ] },
    { num:"FAC-2026-00428", client:"Sté Medoil Export",    date:"28/08/2026", ht:15630.252,tva:2969.748, ttc:18600.000,echeance:"27/09/2026", paye:6000, tranches:[
        { n:1, date:"28/08/2026", montant:6000.000, montantPrevu:6000, mode:"Virement", ref:"VIR-2026-0188", statut:"Payée" },
        { n:2, date:"15/09/2026", montant:6600.000, mode:"Chèque", ref:"CHQ-118904", statut:"Prévue" },
        { n:3, date:"27/09/2026", montant:6000.000, mode:"Virement", ref:"—", statut:"Prévue" } ] },
    { num:"FAC-2026-00426", client:"Restaurant Le Pressoir",date:"31/08/2026",ht:1966.387, tva:373.613,  ttc:2340.000, echeance:"30/09/2026", paye:2340, tranches:[
        { n:1, date:"05/09/2026", montant:2340.000, mode:"Espèces", ref:"—", statut:"Payée" } ] },
    { num:"FAC-2026-00421", client:"Sté Sud Distribution", date:"24/08/2026", ht:9008.403, tva:1711.597, ttc:10720.000,echeance:"23/09/2026", paye:10720, tranches:[
        { n:1, date:"02/09/2026", montant:10720.000, mode:"Virement", ref:"VIR-2026-0175", statut:"Payée" } ] },
    { num:"FAC-2026-00418", client:"Boutique Terroir Médina",date:"18/08/2026",ht:991.597, tva:188.403,  ttc:1180.000, echeance:"17/09/2026", paye:0, tranches:[] }
  ],

  /* Tickets de caisse — ventes comptoir de la journée */
  tickets: [
    { num:"TKT-2026-001257", date:"05/09/2026", heure:"14:02", client:"Client comptoir", articles:6,  mode:"Espèces",  ht:120.000, tva:22.800, ttc:142.800, lignes:[{nom:"Huile extra vierge — 0,75 L",qte:4,prix:18.5},{nom:"Huile extra vierge — 1 L",qte:2,prix:24}] },
    { num:"TKT-2026-001256", date:"05/09/2026", heure:"13:41", client:"Boutique Terroir Médina", articles:12, mode:"Carte", ht:239.160, tva:45.240, ttc:284.400, lignes:[{nom:"Huile extra vierge — 1 L",qte:12,prix:19.93}] },
    { num:"TKT-2026-001255", date:"05/09/2026", heure:"12:18", client:"Client comptoir", articles:2,  mode:"Espèces",  ht:40.336, tva:7.664,  ttc:48.000, lignes:[{nom:"Huile extra vierge — 1 L",qte:2,prix:20.17}] },
    { num:"TKT-2026-001254", date:"05/09/2026", heure:"11:52", client:"Restaurant Le Pressoir", articles:24, mode:"Chèque", ht:927.731, tva:176.269, ttc:1104.000, lignes:[{nom:"Huile d'olive — 5 L",qte:12,prix:77.31}] },
    { num:"TKT-2026-001253", date:"05/09/2026", heure:"10:30", client:"Client comptoir", articles:1,  mode:"Espèces",  ht:87.395, tva:16.605, ttc:104.000, lignes:[{nom:"Huile d'olive — 5 L",qte:1,prix:87.39}] }
  ],

  /* Reçus de paiement émis */
  recus: [],

  /* Chèques reçus — suivi jusqu'à l'encaissement */
  cheques: [
    { num:"CHQ-441207", banque:"BIAT", emetteur:"Hôtel Marhaba Palace", emission:"04/09/2026", echeance:"04/10/2026", montant:3000.000, facture:"FAC-2026-00430", statut:"Déposé" },
    { num:"CHQ-118904", banque:"Amen Bank", emetteur:"Sté Medoil Export", emission:"28/08/2026", echeance:"15/09/2026", montant:6600.000, facture:"FAC-2026-00428", statut:"En attente" },
    { num:"CHQ-772140", banque:"STB", emetteur:"Restaurant Le Pressoir", emission:"12/08/2026", echeance:"25/08/2026", montant:1840.000, facture:"FAC-2026-00415", statut:"Encaissé" },
    { num:"CHQ-660311", banque:"BNA", emetteur:"Épicerie El Baraka", emission:"02/08/2026", echeance:"20/08/2026", montant:1200.000, facture:"FAC-2026-00409", statut:"Rejeté" }
  ],

  /* Reprise d'antériorité : cumuls de la campagne déjà clôturés avant la période affichée.
     Les KPI = base + documents saisis dans l'application. */
  base: { ca:193867.000, olives:111630, huile:16472.5, creances:11210.000, dettes:18340.000, encaisse:189600.000 },

  banques: ["BIAT","Amen Bank","STB","BNA","Attijari Bank","UIB","Zitouna Bank"],
  modesPaiement: ["Espèces","Chèque","Virement","Carte","Traite"],

  factureDetail: {
    num:"FAC-2026-00434", client:"GMS Carrefour Sousse", adresse:"Avenue Taïeb Mhiri, 4051 Sousse",
    mf:"0894471/B/N/000", date:"05/09/2026", echeance:"05/10/2026", conditions:"Règlement à 30 jours — virement bancaire",
    lignes:[
      { d:"Huile extra vierge 0,75 L — LOT-H-2026-0089", q:240, pu:15.546, rem:0 },
      { d:"Huile extra vierge 1 L — LOT-H-2026-0089",    q:116, pu:20.168, rem:0 },
      { d:"Huile extra vierge 2 L — LOT-H-2026-0086",    q:40,  pu:39.076, rem:5 }
    ]
  },

  paiements: [
    { num:"REG-2026-00512", date:"05/09/2026", tiers:"Restaurant Le Pressoir", type:"Client", mode:"Espèces",  montant:2340.00, doc:"FAC-2026-00426" },
    { num:"REG-2026-00511", date:"04/09/2026", tiers:"Hôtel Marhaba Palace",   type:"Client", mode:"Chèque",   montant:3000.00, doc:"FAC-2026-00430" },
    { num:"REG-2026-00509", date:"03/09/2026", tiers:"Emballages Sud SA",      type:"Fournisseur", mode:"Virement", montant:-8420.00, doc:"FF-2026-00188" },
    { num:"REG-2026-00507", date:"02/09/2026", tiers:"Sté Sud Distribution",   type:"Client", mode:"Virement", montant:10720.00, doc:"FAC-2026-00421" },
    { num:"REG-2026-00504", date:"01/09/2026", tiers:"Coopérative Sahline",    type:"Producteur", mode:"Virement", montant:-24600.00, doc:"Apports août" }
  ],

  depenses: [
    { date:"04/09/2026", cat:"Électricité",  montant:3840.00, tiers:"STEG",              mode:"Virement", just:true },
    { date:"03/09/2026", cat:"Carburant",    montant:920.500, tiers:"Station Agil",      mode:"Espèces",  just:true },
    { date:"02/09/2026", cat:"Maintenance",  montant:2450.00, tiers:"Méca Industrie",    mode:"Chèque",   just:true },
    { date:"01/09/2026", cat:"Emballages",   montant:8420.00, tiers:"Emballages Sud SA", mode:"Virement", just:true },
    { date:"31/08/2026", cat:"Salaires",     montant:18600.00,tiers:"Personnel saisonnier", mode:"Virement", just:false },
    { date:"30/08/2026", cat:"Transport",    montant:1240.00, tiers:"Trans Olive",       mode:"Espèces",  just:true }
  ],

  tresorerie: { solde:86420.500, caisse:12840.500, banque:73580.000, recettes:142380.00, depenses:55960.00, creances:48250.00, dettes:31840.00 },
  fluxMois: { entrees:[18400,42600,58200,51300,44800,38200,31400,26800,22100,18600,16400,21800], sorties:[24800,38200,41600,29400,21800,17400,14900,12600,11200,10800,11400,13600] },

  /* ------------------------------ Stock --------------------------------- */
  stockCards: [
    { label:"Huile en vrac",  v:"32 850", u:"L", icon:"droplet", d:"6 cuves · 4 lots actifs" },
    { label:"Produits finis", v:"12 450", u:"unités", icon:"box", d:"9 références · 2 sous seuil" },
    { label:"Olives",         v:"8 240",  u:"kg", icon:"sprout", d:"3 lots en attente de trituration" },
    { label:"Emballages",     v:"45 820", u:"unités", icon:"package", d:"Bouteilles, bidons, capsules, étiquettes" }
  ],
  stocks: [
    { produit:"Huile extra vierge 0,75 L", lot:"LOT-H-2026-0089", magasin:"Produits finis", qte:42,    unite:"bt", min:150,  statut:"Critique" },
    { produit:"Huile extra vierge 1 L",    lot:"LOT-H-2026-0089", magasin:"Produits finis", qte:318,   unite:"bt", min:200,  statut:"Normal" },
    { produit:"Huile extra vierge 2 L",    lot:"LOT-H-2026-0086", magasin:"Produits finis", qte:164,   unite:"bd", min:80,   statut:"Normal" },
    { produit:"Huile d'olive 5 L",         lot:"LOT-H-2026-0086", magasin:"Produits finis", qte:96,    unite:"bd", min:100,  statut:"Faible" },
    { produit:"Huile extra vierge en vrac",lot:"LOT-H-2026-0089", magasin:"Magasin huile",  qte:12460, unite:"L",  min:5000, statut:"Normal" },
    { produit:"Huile vierge en vrac",      lot:"LOT-H-2026-0090", magasin:"Magasin huile",  qte:20390,  unite:"L",  min:3000, statut:"Normal" },
    { produit:"Olives Chemlali",           lot:"LOT-2026-00145",  magasin:"Matières premières", qte:1100, unite:"kg", min:0, statut:"Normal" },
    { produit:"Olives Sahli",              lot:"LOT-2026-00131",  magasin:"Matières premières", qte:1400, unite:"kg", min:0, statut:"Bloqué" },
    { produit:"Bouteille verre 0,75 L",    lot:"—",               magasin:"Emballages",     qte:8420,  unite:"pc", min:3000, statut:"Normal" },
    { produit:"Capsule inviolable",        lot:"—",               magasin:"Emballages",     qte:2140,  unite:"pc", min:5000, statut:"Faible" }
  ],
  mouvements: [
    { date:"05/09/2026 14:35", sens:"Sortie", produit:"Huile extra vierge 0,75 L", qte:4,   lot:"LOT-H-2026-0089", magasin:"Produits finis", motif:"Vente comptoir", user:"Mohamed Ben Chaaben" },
    { date:"05/09/2026 11:20", sens:"Entrée", produit:"Huile extra vierge en vrac", qte:492.4, lot:"LOT-H-2026-0086", magasin:"Magasin huile", motif:"Production OF-2026-0086", user:"Karim Jaziri" },
    { date:"04/09/2026 16:02", sens:"Sortie", produit:"Bouteille verre 0,75 L", qte:240, lot:"—", magasin:"Emballages", motif:"Conditionnement COND-2026-0074", user:"Nabil Ferchichi" },
    { date:"04/09/2026 09:14", sens:"Entrée", produit:"Olives Chemlali", qte:1100, lot:"LOT-2026-00145", magasin:"Matières premières", motif:"Réception REC-2026-00312", user:"Amine Gharbi" },
    { date:"03/09/2026 10:25", sens:"Sortie", produit:"Olives Chemlali", qte:4650, lot:"LOT-2026-00140", magasin:"Matières premières", motif:"Consommation OF-2026-0089", user:"Karim Jaziri" }
  ],
  magasins: [
    { code:"MAG-01", nom:"Matières premières", resp:"Amine Gharbi",   articles:6,  valeur:38400 },
    { code:"MAG-02", nom:"Magasin huile",      resp:"Karim Jaziri",   articles:4,  valeur:412600 },
    { code:"MAG-03", nom:"Produits finis",     resp:"Sonia Kacem",    articles:9,  valeur:186200 },
    { code:"MAG-04", nom:"Emballages",         resp:"Amine Gharbi",   articles:12, valeur:42800 },
    { code:"MAG-05", nom:"Pièces de rechange", resp:"Fethi Belhadj",  articles:34, valeur:18600 }
  ],

  /* ------------------------------ Achats -------------------------------- */
  fournisseurs: [
    { code:"FRN-004", nom:"Emballages Sud SA",   contact:"Ridha Manai",  tel:"+216 74 402 118", ville:"Sfax",   achats:14600, encours:8420, conditions:"30 jours" },
    { code:"FRN-009", nom:"Méca Industrie",      contact:"Fethi Belhadj",tel:"+216 73 331 020", ville:"Sousse", achats:9800,  encours:0,    conditions:"Comptant" },
    { code:"FRN-012", nom:"Trans Olive",         contact:"Slim Ouertani",tel:"+216 98 114 220", ville:"Sousse", achats:8300,  encours:1240, conditions:"15 jours" },
    { code:"FRN-018", nom:"Étiquettes Médina",   contact:"Ines Karray",  tel:"+216 71 220 448", ville:"Tunis",  achats:6400,  encours:0,    conditions:"30 jours" },
    { code:"FRN-021", nom:"STEG",                contact:"—",            tel:"—",               ville:"Sousse", achats:22400, encours:3840, conditions:"Échéancier" }
  ],
  achats: [
    { num:"BC-2026-00142", fournisseur:"Emballages Sud SA", date:"01/09/2026", montant:8420.00, recu:"Totale",   statut:"Facturée" },
    { num:"BC-2026-00141", fournisseur:"Étiquettes Médina", date:"30/08/2026", montant:2640.00, recu:"Partielle",statut:"En cours" },
    { num:"BC-2026-00140", fournisseur:"Méca Industrie",    date:"28/08/2026", montant:2450.00, recu:"Totale",   statut:"Payée" },
    { num:"DA-2026-00088", fournisseur:"—",                 date:"04/09/2026", montant:0,       recu:"—",        statut:"Demande" }
  ],

  /* ------------------------------ Gestion ------------------------------- */
  equipements: [
    { code:"BRO-01", nom:"Broyeur à marteaux",     marque:"Pieralisi", etat:"En service", loc:"Ligne A", maint:"12/09/2026" },
    { code:"MAL-02", nom:"Malaxeur 3 corps",       marque:"Pieralisi", etat:"En service", loc:"Ligne A", maint:"20/09/2026" },
    { code:"DEC-02", nom:"Décanteur centrifuge",   marque:"Alfa Laval",etat:"En service", loc:"Ligne B", maint:"08/09/2026" },
    { code:"SEP-01", nom:"Séparateur centrifuge",  marque:"Alfa Laval",etat:"En service", loc:"Ligne B", maint:"30/09/2026" },
    { code:"FIL-01", nom:"Filtre à plaques",       marque:"Rover",     etat:"En panne",   loc:"Atelier", maint:"06/09/2026" },
    { code:"CND-01", nom:"Ligne de conditionnement",marque:"Bertolaso",etat:"En service", loc:"Atelier", maint:"15/10/2026" }
  ],
  maintenances: [
    { num:"INT-2026-0074", equip:"FIL-01 — Filtre à plaques", type:"Corrective", date:"06/09/2026", tech:"Fethi Belhadj", cout:640.00, statut:"En cours" },
    { num:"INT-2026-0073", equip:"DEC-02 — Décanteur",        type:"Préventive", date:"08/09/2026", tech:"Fethi Belhadj", cout:0,      statut:"Planifiée" },
    { num:"INT-2026-0071", equip:"BRO-01 — Broyeur",          type:"Préventive", date:"29/08/2026", tech:"Méca Industrie",cout:2450.00,statut:"Clôturée" }
  ],
  transports: [
    { matricule:"148 TU 3620", type:"Camion 3,5 T", capacite:"3 500 kg", km:184200, etat:"En mission",   chauffeur:"Slim Ouertani" },
    { matricule:"92 TU 4471",  type:"Camionnette",  capacite:"1 200 kg", km:96400,  etat:"Disponible",   chauffeur:"Hatem Zouari" },
    { matricule:"210 TU 1108", type:"Tracteur + benne", capacite:"6 000 kg", km:42800, etat:"En maintenance", chauffeur:"—" }
  ],
  employes: [
    { mat:"EMP-004", nom:"Karim Jaziri",    poste:"Responsable production", dept:"Production", embauche:"12/03/2019", statut:"Permanent" },
    { mat:"EMP-011", nom:"Sonia Kacem",     poste:"Responsable qualité",    dept:"Qualité",    embauche:"04/09/2020", statut:"Permanent" },
    { mat:"EMP-018", nom:"Amine Gharbi",    poste:"Magasinier",             dept:"Logistique", embauche:"01/10/2022", statut:"Permanent" },
    { mat:"EMP-032", nom:"Nabil Ferchichi", poste:"Opérateur",              dept:"Production", embauche:"15/10/2025", statut:"Saisonnier" },
    { mat:"EMP-041", nom:"Fethi Belhadj",   poste:"Technicien maintenance", dept:"Technique",  embauche:"20/01/2021", statut:"Permanent" }
  ],

  /* ------------------------------ Administration ------------------------ */
  utilisateurs: [
    { login:"m.benchaaben",    nom:"Mohamed Ben Chaaben", email:"m.benchaaben@benchaaben.tn", role:"Administrateur", site:"Sousse", statut:"Actif",   derniere:"05/09/2026 08:02" },
    { login:"k.jaziri",    nom:"Karim Jaziri",    email:"k.jaziri@benchaaben.tn", role:"Responsable production", site:"Sousse", statut:"Actif", derniere:"05/09/2026 07:14" },
    { login:"s.kacem",     nom:"Sonia Kacem",     email:"s.kacem@benchaaben.tn",  role:"Responsable qualité", site:"Sousse", statut:"Actif", derniere:"04/09/2026 16:40" },
    { login:"a.gharbi",    nom:"Amine Gharbi",    email:"a.gharbi@benchaaben.tn", role:"Magasinier", site:"Sousse", statut:"Actif", derniere:"05/09/2026 06:55" },
    { login:"h.mansour",   nom:"Hana Mansour",    email:"h.mansour@benchaaben.tn",role:"Comptable", site:"Sousse", statut:"Actif", derniere:"04/09/2026 17:22" },
    { login:"n.ferchichi", nom:"Nabil Ferchichi", email:"n.ferchichi@benchaaben.tn", role:"Opérateur", site:"Kalâa Kebira", statut:"Inactif", derniere:"12/08/2026 09:10" }
  ],
  roles: ["ADM","DIR","ACH","STK","MAG","PRD","OPR","QUA","COM","CPT","MNT"],
  permissions: [
    ["Utilisateurs",        1,0,0,0,0,0,0,0,0,0,0],
    ["Paramétrage",         1,0,0,0,0,0,0,0,0,0,0],
    ["Tableau de bord",     1,1,1,1,1,1,1,1,1,1,1],
    ["Fournisseurs",        1,0,1,0,0,0,0,0,0,1,0],
    ["Producteurs",         1,0,1,0,0,0,0,0,0,0,0],
    ["Achats",              1,0,1,1,0,0,0,0,0,1,0],
    ["Matières premières",  1,0,1,1,1,0,0,0,0,0,0],
    ["Réception olives",    1,0,1,1,1,1,0,1,0,0,0],
    ["Stock",               1,0,0,1,1,1,0,0,0,0,0],
    ["Magasins",            1,0,0,1,1,0,0,0,0,0,0],
    ["Production",          1,0,0,0,0,1,1,0,0,0,0],
    ["Lots",                1,0,0,1,0,1,0,1,0,0,0],
    ["Qualité",             1,0,0,0,0,1,0,1,0,0,0],
    ["Conditionnement",     1,0,0,1,0,1,1,0,0,0,0],
    ["Produits finis",      1,0,0,1,0,1,0,0,1,0,0],
    ["Clients",             1,0,0,0,0,0,0,0,1,1,0],
    ["Ventes",              1,0,0,0,0,0,0,0,1,1,0],
    ["Livraisons",          1,0,0,1,1,0,0,0,1,0,0],
    ["Facturation",         1,0,0,0,0,0,0,0,0,1,0],
    ["Paiements",           1,0,0,0,0,0,0,0,0,1,0],
    ["Trésorerie",          1,0,0,0,0,0,0,0,0,1,0],
    ["Dépenses",            1,0,0,0,0,0,0,0,0,1,0],
    ["Équipements",         1,0,0,0,0,1,0,0,0,0,1],
    ["Maintenance",         1,0,0,0,0,0,0,0,0,0,1],
    ["Ressources humaines", 1,0,0,0,0,0,0,0,0,0,0],
    ["Comptabilité",        1,0,0,0,0,0,0,0,0,1,0],
    ["Transports",          1,0,0,0,0,0,0,0,1,0,1],
    ["Reporting",           1,1,1,1,0,1,0,1,1,1,1],
    ["Notifications",       1,1,1,1,1,1,1,1,1,1,1],
    ["Journal d'audit",     1,0,0,0,0,0,0,0,0,0,0]
  ],
  audit: [
    { user:"Hana Mansour",   action:"Modification d'une facture", cible:"FAC-2026-00430", date:"05/09/2026 09:41", av:"4 500,000 TND", ap:"4 750,000 TND" },
    { user:"Sonia Kacem",    action:"Blocage qualité d'un lot",   cible:"LOT-2026-00131", date:"31/08/2026 14:02", av:"En attente", ap:"Non conforme" },
    { user:"Mohamed Ben Chaaben",action:"Modification de rôle",        cible:"n.ferchichi",    date:"12/08/2026 09:20", av:"Opérateur actif", ap:"Opérateur inactif" },
    { user:"Karim Jaziri",   action:"Clôture d'un ordre de fabrication", cible:"OF-2026-0089", date:"03/09/2026 11:04", av:"En production", ap:"Terminé" },
    { user:"Amine Gharbi",   action:"Validation d'un inventaire", cible:"INV-2026-0018",  date:"01/09/2026 18:12", av:"Écart -12 bt", ap:"Régularisé" }
  ],
  notifications: [
    { t:"Stock critique", d:"Huile extra vierge 0,75 L — 42 unités restantes", h:"il y a 12 min", lu:false, niv:"danger" },
    { t:"Analyse en attente", d:"LOT-2026-00145 réceptionné sans analyse", h:"il y a 48 min", lu:false, niv:"warn" },
    { t:"Facture échue", d:"FAC-2026-00431 — Épicerie El Baraka", h:"il y a 3 h", lu:false, niv:"gold" },
    { t:"Maintenance prévue", d:"Décanteur DEC-02 — intervention le 08/09", h:"Hier", lu:true, niv:"info" },
    { t:"Commande livrée", d:"CMD-2026-00283 — GMS Carrefour Sousse", h:"Hier", lu:true, niv:"ok" }
  ],

  campagneCompare: [
    { k:"Olives réceptionnées", a:"126,5 T", b:"111,2 T", d:"+13,8 %" },
    { k:"Huile produite",       a:"18 420 L", b:"15 320 L", d:"+20,2 %" },
    { k:"Rendement moyen",      a:"14,58 %", b:"13,78 %", d:"+0,80 pt" },
    { k:"Chiffre d'affaires",   a:"248 650 TND", b:"212 400 TND", d:"+17,1 %" },
    { k:"Charges affectées",    a:"162 300 TND", b:"148 900 TND", d:"+9,0 %" },
    { k:"Résultat estimé",      a:"86 350 TND", b:"63 500 TND", d:"+36,0 %" }
  ]
};
