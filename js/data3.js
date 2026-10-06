/* ==========================================================================
   OLIVERA ERP — Modèle de données aligné sur l'ERP en production
   Bons de réception · Bons de production · Bons d'entrée huile
   Tiers enrichis (matricules, types, soldes initiaux) · Piles · Sous-produits
   Les collections existantes sont enrichies, jamais remplacées.
   ========================================================================== */

/* ------------------------------ Personnel ------------------------------- */
/* Un employé est payé au jour ou à l'heure : le type pilote le calcul de la
   fiche de présence et du règlement du personnel. */
const PERSO = {
  "EMP-004": { prenom:"Karim", tel1:"+216 98 441 207", tel2:"+216 73 240 118", email:"k.jaziri@benchaaben.tn",    typeRem:"Jour",  prix:65.000 },
  "EMP-011": { prenom:"Sonia", tel1:"+216 22 118 904", tel2:"",                email:"s.kacem@benchaaben.tn",     typeRem:"Jour",  prix:58.000 },
  "EMP-018": { prenom:"Amine", tel1:"+216 55 402 118", tel2:"",                email:"a.gharbi@benchaaben.tn",    typeRem:"Jour",  prix:42.000 },
  "EMP-032": { prenom:"Nabil", tel1:"+216 96 730 441", tel2:"+216 73 240 120", email:"n.ferchichi@benchaaben.tn", typeRem:"Heure", prix:5.500 },
  "EMP-041": { prenom:"Fethi", tel1:"+216 98 220 774", tel2:"",                email:"f.belhadj@benchaaben.tn",   typeRem:"Heure", prix:7.200 }
};
DB.employes.forEach(e=> Object.assign(e, PERSO[e.mat] || { prenom:e.nom.split(' ')[0], tel1:'', tel2:'', email:'', typeRem:'Jour', prix:45 }));
DB.employes.push(
  { mat:"EMP-047", nom:"Ali Haddad", prenom:"Ali",   poste:"Ouvrier de trituration", dept:"Production", embauche:"05/10/2025", statut:"Saisonnier",
    tel1:"+216 20 114 887", tel2:"", email:"", typeRem:"Heure", prix:5.000 },
  { mat:"EMP-048", nom:"Salah Mabrouk", prenom:"Salah", poste:"Manutentionnaire",      dept:"Logistique", embauche:"05/10/2025", statut:"Saisonnier",
    tel1:"+216 26 908 331", tel2:"", email:"", typeRem:"Jour", prix:38.000 }
);

/* Fiche de présence recalculée selon le type de rémunération */
DB.presences.forEach(p=>{
  const e = DB.employes.find(x=>x.mat===p.mat) || {};
  p.typeRem = e.typeRem || 'Jour';
  p.prix = e.prix || 0;
  p.jours = p.statut==='Présent' ? 1 : 0;
  p.total = p.typeRem==='Heure' ? +(p.heures * p.prix).toFixed(3) : +(p.jours * p.prix).toFixed(3);
});

/* ------------------------------ Tiers ----------------------------------- */
/* Fournisseurs : type Olive ou Divers, plusieurs matricules de véhicules */
const FOURN = {
  "FRN-004": { typeF:"Divers", identifiant:"04471882", adresse:"Zone industrielle, Sfax", matricules:[] },
  "FRN-009": { typeF:"Divers", identifiant:"07714203", adresse:"Route de Tunis, Sousse", matricules:[] },
  "FRN-012": { typeF:"Divers", identifiant:"09112446", adresse:"Sahline, Monastir", matricules:["148 TU 3620","92 TU 4471"] },
  "FRN-018": { typeF:"Divers", identifiant:"01220448", adresse:"Rue de Marseille, Tunis", matricules:[] },
  "FRN-021": { typeF:"Divers", identifiant:"00000021", adresse:"Avenue Léopold Sédar Senghor, Sousse", matricules:[] }
};
DB.fournisseurs.forEach((f,i)=> Object.assign(f, { numero:String(i+1).padStart(4,'0') }, FOURN[f.code] || {typeF:"Divers", identifiant:"", adresse:"", matricules:[]}));

/* Les producteurs d'olives deviennent des fournisseurs de type Olive */
DB.producteurs.forEach((p,i)=>{
  DB.fournisseurs.push({
    code:p.code, numero:String(100+i), nom:p.nom, contact:p.nom, tel:p.tel, ville:p.zone,
    typeF:"Olive", identifiant:"0"+(1470000+i*137), adresse:p.zone+", Sousse",
    matricules:[["148 TU 3620","210 TU 1108"],["92 TU 4471"],["331 TU 2204"],["148 TU 3620"],["512 TU 7719"]][i] || [],
    conditions:"Comptant", achats:0, encours:p.solde||0, statut:"Actif"
  });
});

/* Clients : type métier et solde initial repris dans le relevé */
const TYPES_CLI = ["Vente","Vente","Vente","Trituration","Vente","Vente","Passager","Passager"];
DB.clients.forEach((c,i)=>{
  c.typeC = TYPES_CLI[i] || "Vente";
  c.mf = c.mf || (c.nom==='Client comptoir' ? '—' : '0'+(894000+i*211)+'/B/N/000');
  c.soldeInitial = [0, 0, 1200.000, 0, 0, -450.000, 0, 0][i] || 0;
});
DB.clients.push(
  { code:"CLI-0101", nom:"Sté Grignons du Sahel", tel:"+216 73 447 200", ville:"Msaken", derniere:"04/09/2026", ca:18400, encours:5200, limite:20000, statut:"Actif", typeC:"Grignon", mf:"0774112/A/M/000", soldeInitial:0 },
  { code:"CLI-0102", nom:"Ferme Ouled Amor",      tel:"+216 22 660 118", ville:"Kalâa Kebira", derniere:"03/09/2026", ca:9600, encours:0, limite:10000, statut:"Actif", typeC:"Trituration", mf:"0118447/B/N/000", soldeInitial:0 }
);

/* Transporteurs : plusieurs matricules par transporteur */
DB.transporteurs.forEach((t,i)=>{
  t.cin = ["04471882","09112446","07714203"][i] || "";
  t.adresse = ["Route de Kairouan, Sousse","Sahline, Monastir","Huilerie Ben Chaaben"][i] || "";
  t.matricules = [["148 TU 3620","210 TU 1108"],["331 TU 2204"],["92 TU 4471","512 TU 7719"]][i] || [];
});

/* Utilisateurs : droits par module réellement appliqués à la navigation */
const MODULES_DROITS = ["PARAMETRAGE","ACHATS","PRODUCTION","STOCK","STATISTIQUES","FINANCE"];
const DROITS = {
  "m.benchaaben": MODULES_DROITS,
  "k.jaziri":     ["ACHATS","PRODUCTION","STOCK","STATISTIQUES"],
  "s.kacem":      ["ACHATS","PRODUCTION","STATISTIQUES"],
  "a.gharbi":     ["STOCK","ACHATS"],
  "h.mansour":    ["FINANCE","STATISTIQUES","PARAMETRAGE"],
  "n.ferchichi":  ["PRODUCTION"]
};
DB.utilisateurs.forEach(u=>{
  u.droits = DROITS[u.login] || ["STATISTIQUES"];
  u.application = "Huilerie Ben Chaaben";
  u.personnel = u.nom;
  u.mdp = "••••••••";
});

/* ------------------------------ Référentiels ---------------------------- */
Object.assign(DB, {
  /* Qualités organoleptiques sélectionnables dans le bon d'entrée huile */
  organoleptiques: [
    { code:"EXV", libelle:"EXTRA VIERGE", acidMax:0.80, ordre:1, actif:true },
    { code:"VGP", libelle:"VIERGE +",     acidMax:1.50, ordre:2, actif:true },
    { code:"VRG", libelle:"VIERGE",       acidMax:2.00, ordre:3, actif:true },
    { code:"LMP", libelle:"LAMPANTE",     acidMax:99.0, ordre:4, actif:true }
  ],

  /* Natures d'opération du bon de réception */
  naturesBR: ["Achat olive sur base huile", "Achat olive", "Trituration"],
  naturesBEH: ["Achat huile", "Production interne", "Retour de pile"],

  /* Dépôts et terrasses (emplacements physiques) */
  depots: [
    { code:"TER-A", designation:"Terrasse A",        type:"Dépôt",  capacite:180000, qte:4400,  etat:"Occupée" },
    { code:"TER-B", designation:"Terrasse B",        type:"Dépôt",  capacite:180000, qte:2560,  etat:"Occupée" },
    { code:"TER-C", designation:"Terrasse C",        type:"Dépôt",  capacite:120000, qte:1280,  etat:"Occupée" },
    { code:"TER-D", designation:"Terrasse D",        type:"Dépôt",  capacite:120000, qte:0,     etat:"Libre" },
    { code:"CSS-01",designation:"Aire caisses plastique", type:"Caisse", capacite:40000, qte:3500, etat:"Occupée" },
    { code:"DIV-01",designation:"Hangar sous-produits",   type:"Autre",  capacite:60000, qte:4715, etat:"Occupée" }
  ],

  /* Piles à huile : quantité maximale, quantité actuelle, prix total et CMP */
  pilesHuile: [
    { num:"P01", designation:"Pile 1 — inox 15 T", qteMax:15000, qte:12460, prixTotal:242970.000, saison:"Saison 2025/2026", etat:"En service" },
    { num:"P02", designation:"Pile 2 — inox 15 T", qteMax:15000, qte:8390,  prixTotal:159410.000, saison:"Saison 2025/2026", etat:"En service" },
    { num:"P03", designation:"Pile 3 — inox 10 T", qteMax:10000, qte:9600,  prixTotal:188160.000, saison:"Saison 2025/2026", etat:"En service" },
    { num:"P04", designation:"Pile 4 — inox 10 T", qteMax:10000, qte:2400,  prixTotal:46320.000,  saison:"Saison 2025/2026", etat:"En service" },
    { num:"P05", designation:"Pile 5 — résine 8 T",qteMax:8000,  qte:0,     prixTotal:0,          saison:"Saison 2025/2026", etat:"Vide" },
    { num:"P06", designation:"Pile 6 — résine 8 T",qteMax:8000,  qte:0,     prixTotal:0,          saison:"Saison 2025/2026", etat:"En nettoyage" }
  ],

  /* Mouvements de pile : chaque entrée ou sortie d'huile est tracée */
  mouvementsPile: [
    { date:"03/09/2026", type:"Entrée", doc:"BEH-2026-0031", pile:"P01", qte:708.6,  sens:1, origine:"Production BP-2026-0089" },
    { date:"03/09/2026", type:"Entrée", doc:"BEH-2026-0030", pile:"P02", qte:342.0,  sens:1, origine:"Production BP-2026-0090" },
    { date:"01/09/2026", type:"Entrée", doc:"BEH-2026-0029", pile:"P03", qte:2400.0, sens:1, origine:"Achat huile Huilerie El Fejja" },
    { date:"04/09/2026", type:"Sortie", doc:"BL-2026-00617", pile:"P03", qte:840.0,  sens:-1,origine:"Livraison Sté Medoil Export" },
    { date:"05/09/2026", type:"Entrée", doc:"BEH-2026-0032", pile:"P01", qte:511.0,  sens:1, origine:"Production BP-2026-0093" }
  ],

  /* Articles commercialisés */
  articles: [
    { code:"ART-001", designation:"Huile d'olive extra vierge en vrac", prix:21.000, unite:"L",  type:"Huile" },
    { code:"ART-002", designation:"Huile d'olive vierge en vrac",       prix:19.000, unite:"L",  type:"Huile" },
    { code:"ART-003", designation:"Grignons d'olive",                   prix:0.080,  unite:"Kg", type:"Sous-produit" },
    { code:"ART-004", designation:"Noyaux concassés",                   prix:0.220,  unite:"Kg", type:"Sous-produit" },
    { code:"ART-005", designation:"Margines (évacuation)",              prix:45.000, unite:"Unité", type:"Service" },
    { code:"ART-006", designation:"Prestation de trituration",          prix:0.180,  unite:"Kg", type:"Service" }
  ]
});

/* ------------------------------ Bons de réception ----------------------- */
/* Nature « Trituration » → le tiers est un client ; sinon c'est un fournisseur. */
DB.bonsReception = [
  { num:"000006", date:"05/09/2026", heure:"07:20", nature:"Achat olive sur base huile", tiers:"Coopérative Sahline", tiersType:"Fournisseur",
    cin:"01470000", matricule:"148 TU 3620", remarque:"Récolte du 04/09, olives saines",
    lignes:[{ depot:"TER-A", brut:3980, vide:480, caisses:24, net:3500, prixHuile:19.500 }],
    reglements:[{ mode:"Espèces", montant:5000.000 }], paye:5000.000, statut:"Validé",
    saison:"Saison 2025/2026", annee:"2026", bp:"BP-2026-0093", beh:"BEH-2026-0032" },

  { num:"000005", date:"04/09/2026", heure:"09:14", nature:"Achat olive", tiers:"Slim Ben Salem", tiersType:"Fournisseur",
    cin:"01470137", matricule:"210 TU 1108", remarque:"",
    lignes:[{ depot:"TER-B", brut:1250, vide:150, caisses:10, net:1100, prixHuile:2.450 }],
    reglements:[{ mode:"Espèces", montant:2695.000 }], paye:2695.000, statut:"Validé",
    saison:"Saison 2025/2026", annee:"2026", bp:null, beh:null },

  { num:"000004", date:"04/09/2026", heure:"08:02", nature:"Achat olive sur base huile", tiers:"Coopérative Sahline", tiersType:"Fournisseur",
    cin:"01470000", matricule:"148 TU 3620", remarque:"",
    lignes:[{ depot:"TER-A", brut:4820, vide:420, caisses:28, net:4400, prixHuile:19.500 }],
    reglements:[], paye:0, statut:"Validé", saison:"Saison 2025/2026", annee:"2026", bp:null, beh:null },

  { num:"000003", date:"03/09/2026", heure:"16:38", nature:"Trituration", tiers:"Ferme Ouled Amor", tiersType:"Client",
    cin:"0118447", matricule:"331 TU 2204", remarque:"Trituration à façon, huile restituée au client",
    lignes:[{ depot:"TER-C", brut:2640, vide:240, caisses:16, net:2400, prixHuile:0.180 }],
    reglements:[{ mode:"Espèces", montant:432.000 }], paye:432.000, statut:"Validé",
    saison:"Saison 2025/2026", annee:"2026", bp:"BP-2026-0090", beh:"BEH-2026-0030" },

  { num:"000002", date:"03/09/2026", heure:"11:20", nature:"Achat olive", tiers:"Hédi Trabelsi", tiersType:"Fournisseur",
    cin:"01470274", matricule:"512 TU 7719", remarque:"Olives légèrement chômées",
    lignes:[{ depot:"TER-C", brut:980, vide:120, caisses:8, net:860, prixHuile:2.150 }],
    reglements:[], paye:0, statut:"Validé", saison:"Saison 2025/2026", annee:"2026", bp:null, beh:null },

  { num:"000001", date:"02/09/2026", heure:"09:30", nature:"Achat olive sur base huile", tiers:"Coopérative Sahline", tiersType:"Fournisseur",
    cin:"01470000", matricule:"148 TU 3620", remarque:"",
    lignes:[{ depot:"TER-A", brut:5100, vide:450, caisses:30, net:4650, prixHuile:19.500 }],
    reglements:[{ mode:"Chèque", montant:8000.000 }], paye:8000.000, statut:"Validé",
    saison:"Saison 2025/2026", annee:"2026", bp:"BP-2026-0089", beh:"BEH-2026-0031" }
];

/* ------------------------------ Bons de production ---------------------- */
DB.bonsProduction = [
  { num:"BP-2026-0093", br:"000006", date:"05/09/2026", heure:"11:40", type:"Non Trituration", tiers:"Coopérative Sahline", tiersType:"Fournisseur",
    dateBR:"05/09/2026", qteOlives:3500, qteHuile:511.0, rendement:14.60, grignons:1225, noyaux:270, margines:1575,
    cout:9964.500, cmp:19.500, statut:"Validé", saison:"Saison 2025/2026" },
  { num:"BP-2026-0090", br:"000003", date:"03/09/2026", heure:"17:50", type:"Trituration", tiers:"Ferme Ouled Amor", tiersType:"Client",
    dateBR:"03/09/2026", qteOlives:2400, qteHuile:342.0, rendement:14.25, grignons:840, noyaux:185, margines:1080,
    cout:432.000, cmp:1.263, statut:"Validé", saison:"Saison 2025/2026" },
  { num:"BP-2026-0089", br:"000001", date:"03/09/2026", heure:"10:25", type:"Non Trituration", tiers:"Coopérative Sahline", tiersType:"Fournisseur",
    dateBR:"02/09/2026", qteOlives:4650, qteHuile:708.6, rendement:15.24, grignons:1628, noyaux:358, margines:2093,
    cout:13817.700, cmp:19.500, statut:"Validé", saison:"Saison 2025/2026" }
];

/* ------------------------------ Bons d'entrée huile --------------------- */
DB.behs = [
  { num:"BEH-2026-0032", date:"05/09/2026", heure:"12:05", br:"000006", nature:"Production interne",
    tiers:"Coopérative Sahline", tiersType:"Fournisseur", transporteur:"Véhicules internes", matricule:"148 TU 3620",
    acidite:0.26, k232:1.82, k270:0.14, organo:"EXTRA VIERGE", brut:0, vide:0,
    qteOlives:3500, qteHuile:511.0, rendement:14.60, prixUnitaire:19.500, prixTotal:9964.500,
    pile:"P01", statut:"Validé", paye:true, saison:"Saison 2025/2026" },
  { num:"BEH-2026-0031", date:"03/09/2026", heure:"11:00", br:"000001", nature:"Production interne",
    tiers:"Coopérative Sahline", tiersType:"Fournisseur", transporteur:"Véhicules internes", matricule:"148 TU 3620",
    acidite:0.24, k232:1.76, k270:0.12, organo:"EXTRA VIERGE", brut:0, vide:0,
    qteOlives:4650, qteHuile:708.6, rendement:15.24, prixUnitaire:19.500, prixTotal:13817.700,
    pile:"P01", statut:"Validé", paye:true, saison:"Saison 2025/2026" },
  { num:"BEH-2026-0030", date:"03/09/2026", heure:"18:10", br:"000003", nature:"Production interne",
    tiers:"Ferme Ouled Amor", tiersType:"Client", transporteur:"Transport Sahline", matricule:"331 TU 2204",
    acidite:0.62, k232:2.14, k270:0.19, organo:"VIERGE", brut:0, vide:0,
    qteOlives:2400, qteHuile:342.0, rendement:14.25, prixUnitaire:0, prixTotal:0,
    pile:"P02", statut:"Validé", paye:true, saison:"Saison 2025/2026" },
  { num:"BEH-2026-0029", date:"01/09/2026", heure:"14:20", br:null, nature:"Achat huile",
    tiers:"Huilerie El Fejja", tiersType:"Fournisseur", transporteur:"Trans Olive", matricule:"92 TU 4471",
    acidite:0.31, k232:1.91, k270:0.15, organo:"EXTRA VIERGE", brut:2560, vide:160,
    qteOlives:0, qteHuile:2400.0, rendement:0, prixUnitaire:20.000, prixTotal:48000.000,
    pile:"P03", statut:"Validé", paye:false, saison:"Saison 2025/2026" }
];

/* ------------------------------ Sous-produits vendus -------------------- */
DB.grignons = [
  { num:"GRG-2026-0021", date:"05/09/2026", client:"Sté Grignons du Sahel", transporteur:"Trans Olive", matricule:"148 TU 3620",
    bl:"BL-G-00121", qte:12400, pu:0.080, total:992.000, etat:"Livré", remarque:"Chargement du matin", saison:"Saison 2025/2026" },
  { num:"GRG-2026-0020", date:"03/09/2026", client:"Sté Grignons du Sahel", transporteur:"Trans Olive", matricule:"148 TU 3620",
    bl:"BL-G-00119", qte:9800,  pu:0.080, total:784.000, etat:"Livré", remarque:"", saison:"Saison 2025/2026" },
  { num:"GRG-2026-0019", date:"01/09/2026", client:"Ferme Ouled Amor", transporteur:"Transport Sahline", matricule:"331 TU 2204",
    bl:"BL-G-00117", qte:6200,  pu:0.075, total:465.000, etat:"Livré", remarque:"Reprise par le client", saison:"Saison 2025/2026" }
];
DB.reglementsGrignons = [
  { date:"05/09/2026", client:"Sté Grignons du Sahel", montant:1200.000, mode:"Espèces",  ref:"—" },
  { date:"02/09/2026", client:"Ferme Ouled Amor",      montant:465.000,  mode:"Virement", ref:"VIR-2026-0179" }
];
DB.noyaux = [
  { num:"NOY-2026-0014", date:"04/09/2026", client:"Sté Grignons du Sahel", transporteur:"Trans Olive", matricule:"210 TU 1108",
    bl:"BL-N-00042", qte:3200, pu:0.220, total:704.000, etat:"Livré", remarque:"", saison:"Saison 2025/2026" },
  { num:"NOY-2026-0013", date:"31/08/2026", client:"Sté Grignons du Sahel", transporteur:"Trans Olive", matricule:"210 TU 1108",
    bl:"BL-N-00041", qte:2600, pu:0.220, total:572.000, etat:"Livré", remarque:"", saison:"Saison 2025/2026" }
];
DB.reglementsNoyaux = [
  { date:"04/09/2026", client:"Sté Grignons du Sahel", montant:704.000, mode:"Chèque", ref:"CHQ-330214" }
];
DB.marginesEvac = [
  { num:"MRG-2026-0032", date:"05/09/2026", fournisseur:"Trans Olive", transporteur:"Trans Olive", camion:"148 TU 3620",
    voyages:3, prixVoyage:45.000, total:135.000, saison:"Saison 2025/2026" },
  { num:"MRG-2026-0031", date:"03/09/2026", fournisseur:"Transport Sahline", transporteur:"Transport Sahline", camion:"331 TU 2204",
    voyages:2, prixVoyage:50.000, total:100.000, saison:"Saison 2025/2026" },
  { num:"MRG-2026-0030", date:"01/09/2026", fournisseur:"Trans Olive", transporteur:"Trans Olive", camion:"148 TU 3620",
    voyages:4, prixVoyage:45.000, total:180.000, saison:"Saison 2025/2026" }
];
DB.reglementsMargines = [
  { date:"04/09/2026", fournisseur:"Trans Olive", montant:180.000, mode:"Espèces", ref:"—" }
];

/* Acomptes fournisseurs déjà présents : on y rattache la saison */
DB.accomptesFournisseurs.forEach(a=> a.saison = "Saison 2025/2026");
