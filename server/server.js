/* ==========================================================================
   OLIVERA ERP — Serveur applicatif
   Node.js sans aucune dépendance externe : serveur HTTP natif + SQLite intégré
   (node:sqlite, Node 22.5+). Lancement : node server/server.js
   ========================================================================== */
'use strict';
const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const RACINE = path.join(__dirname, '..');
const FICHIER_DB = path.join(__dirname, 'olivera.db');
const PORT = process.env.PORT || 4300;

/* ==========================================================================
   1. Droits d'accès : chaque table appartient à un module
   ========================================================================== */
const MODULE_DE = {
  PARAMETRAGE: ['employes','presences','fournisseurs','producteurs','clients','transporteurs','transports',
                'utilisateurs','societes','exercices','saisons','unites','conversions','organoleptiques','modesReglement','depots','terrasses'],
  ACHATS:      ['bonsReception','behs','bonsEntreeHuile','organoleptique','facturesFournisseurs',
                'accomptesFournisseurs','achats','receptions','qualite'],
  PRODUCTION:  ['bonsProduction','ordres','lots','produits','typesProduction'],
  STOCK:       ['pilesHuile','piles','stocks','mouvements','mouvementsPile','articles','grignons','noyaux',
                'marginesEvac','magasins','reglementsGrignons','reglementsNoyaux','reglementsMargines'],
  FINANCE:     ['operations','correctionsCaisse','reglementsPeriode','reglementsPersonnel','avances','factures',
                'paiements','ventes','livraisons','tickets','depenses','cheques','recus','validationsCaisse','soldesDepart'],
  STATISTIQUES:['audit','notifications','campagnes']
};
const TABLE_MODULE = {};
Object.entries(MODULE_DE).forEach(([m, tables]) => tables.forEach(t => TABLE_MODULE[t] = m));

/* ==========================================================================
   2. Base de données : schéma dérivé du modèle métier
   Chaque collection devient une table ; les sous-listes d'un document
   (lignes de bon, règlements, matricules) sont stockées en JSON dans la ligne.
   ========================================================================== */
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));
const COLLECTIONS = Object.keys(seed).filter(k => k[0] !== '_');

/* Clé naturelle de chaque table, utilisée par les routes /api/:table/:id */
const CLE = {
  employes:'mat', presences:'num', fournisseurs:'code', producteurs:'code', clients:'code',
  transporteurs:'code', transports:'matricule', utilisateurs:'login', societes:'code', exercices:'code',
  saisons:'code', unites:'code', conversions:'code', typesProduction:'code', organoleptiques:'code',
  modesReglement:'code', depots:'code', terrasses:'num',
  bonsReception:'num', bonsProduction:'num', behs:'num', bonsEntreeHuile:'num', organoleptique:'num',
  facturesFournisseurs:'num', accomptesFournisseurs:'num', achats:'num', receptions:'num', qualite:'lot',
  ordres:'num', lots:'num', produits:'code', pilesHuile:'num', piles:'num', articles:'code',
  grignons:'num', noyaux:'num', marginesEvac:'num', magasins:'code', operations:'num',
  correctionsCaisse:'num', reglementsPeriode:'num', reglementsPersonnel:'num', avances:'num',
  factures:'num', paiements:'num', ventes:'num', livraisons:'num', tickets:'num', recus:'num', cheques:'num',
  depenses:'num', reglementsPeriode:'num', grignons:'num', noyaux:'num', marginesEvac:'num'
};
const cleDe = t => CLE[t] || 'id';

const typeSQL = v => typeof v === 'number' ? 'REAL' : typeof v === 'boolean' ? 'INTEGER' : 'TEXT';
const colonnes = t => {
  const cols = new Map();
  (seed[t] || []).forEach(r => Object.entries(r).forEach(([k, v]) => {
    if (!cols.has(k)) cols.set(k, Array.isArray(v) || (v && typeof v === 'object') ? 'TEXT' : typeSQL(v));
  }));
  if (!cols.size) cols.set('valeur', 'TEXT');
  return cols;
};

const db = new DatabaseSync(FICHIER_DB);
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

const SCHEMA = {};
function creerSchema() {
  COLLECTIONS.forEach(t => {
    const cols = colonnes(t);
    SCHEMA[t] = [...cols.keys()];
    const def = [...cols].map(([k, ty]) => `"${k}" ${ty}`).join(', ');
    db.exec(`CREATE TABLE IF NOT EXISTS "${t}" (
      _id INTEGER PRIMARY KEY AUTOINCREMENT, ${def},
      _cree_le TEXT, _cree_par TEXT, _maj_le TEXT, _maj_par TEXT)`);
  });
  db.exec(`CREATE TABLE IF NOT EXISTS _audit (
    _id INTEGER PRIMARY KEY AUTOINCREMENT, horodatage TEXT, utilisateur TEXT,
    action TEXT, taboule TEXT, cible TEXT, avant TEXT, apres TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS _config (cle TEXT PRIMARY KEY, valeur TEXT)`);
}

const enc = v => (v === null || v === undefined) ? null
  : (Array.isArray(v) || typeof v === 'object') ? JSON.stringify(v)
  : (typeof v === 'boolean') ? (v ? 1 : 0) : v;

function ligneVersObjet(t, row) {
  const o = {};
  SCHEMA[t].forEach(c => {
    let v = row[c];
    if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{'))) { try { v = JSON.parse(v); } catch {} }
    o[c] = v;
  });
  o._id = row._id; o._cree_le = row._cree_le; o._cree_par = row._cree_par;
  o._maj_le = row._maj_le; o._maj_par = row._maj_par;
  return o;
}

function amorcer() {
  const dejaFait = db.prepare(`SELECT valeur FROM _config WHERE cle='amorce'`).get();
  if (dejaFait) return false;
  db.exec('BEGIN');
  try {
    COLLECTIONS.forEach(t => {
      (seed[t] || []).forEach(r => inserer(t, r, 'amorce', false));
    });
    db.prepare(`INSERT INTO _config VALUES ('amorce', ?)`).run(new Date().toISOString());
    db.prepare(`INSERT INTO _config VALUES ('scalaires', ?)`).run(JSON.stringify(seed._scalaires || {}));
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return true;
}

/* ==========================================================================
   3. Opérations élémentaires
   ========================================================================== */
function inserer(t, obj, user, journaliser = true) {
  const cols = SCHEMA[t].filter(c => obj[c] !== undefined);
  const sql = `INSERT INTO "${t}" (${cols.map(c => `"${c}"`).join(',')}, _cree_le, _cree_par)
               VALUES (${cols.map(() => '?').join(',')}, ?, ?)`;
  const r = db.prepare(sql).run(...cols.map(c => enc(obj[c])), new Date().toISOString(), user);
  if (journaliser) audit(user, 'CREATION', t, obj[cleDe(t)] || String(r.lastInsertRowid), null, obj);
  return db.prepare(`SELECT * FROM "${t}" WHERE _id = ?`).get(r.lastInsertRowid);
}

function modifier(t, id, obj, user) {
  const avant = trouver(t, id);
  if (!avant) return null;
  const cols = SCHEMA[t].filter(c => obj[c] !== undefined);
  if (!cols.length) return avant;
  db.prepare(`UPDATE "${t}" SET ${cols.map(c => `"${c}"=?`).join(',')}, _maj_le=?, _maj_par=? WHERE _id=?`)
    .run(...cols.map(c => enc(obj[c])), new Date().toISOString(), user, avant._id);
  const apres = db.prepare(`SELECT * FROM "${t}" WHERE _id=?`).get(avant._id);
  audit(user, 'MODIFICATION', t, id, avant, ligneVersObjet(t, apres));
  return apres;
}

function supprimer(t, id, user) {
  const avant = trouver(t, id);
  if (!avant) return false;
  db.prepare(`DELETE FROM "${t}" WHERE _id=?`).run(avant._id);
  audit(user, 'SUPPRESSION', t, id, avant, null);
  return true;
}

function trouver(t, id) {
  const cle = cleDe(t);
  const row = SCHEMA[t].includes(cle)
    ? db.prepare(`SELECT * FROM "${t}" WHERE "${cle}" = ?`).get(String(id))
    : db.prepare(`SELECT * FROM "${t}" WHERE _id = ?`).get(Number(id));
  return row ? ligneVersObjet(t, row) : null;
}

function lister(t, filtres = {}) {
  let sql = `SELECT * FROM "${t}"`, args = [];
  const conds = [];
  Object.entries(filtres).forEach(([k, v]) => {
    if (SCHEMA[t].includes(k) && v !== '') { conds.push(`"${k}" = ?`); args.push(v); }
  });
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
  sql += ' ORDER BY _id DESC';
  return db.prepare(sql).all(...args).map(r => ligneVersObjet(t, r));
}

function audit(user, action, table, cible, avant, apres) {
  db.prepare(`INSERT INTO _audit (horodatage, utilisateur, action, taboule, cible, avant, apres)
              VALUES (?,?,?,?,?,?,?)`)
    .run(new Date().toISOString(), user || 'système', action, table, String(cible ?? ''),
         avant ? JSON.stringify(avant).slice(0, 4000) : null,
         apres ? JSON.stringify(apres).slice(0, 4000) : null);
}

/* ==========================================================================
   4. Règles métier transactionnelles
   ========================================================================== */
const Metier = {
  /* Validation d'un bon d'entrée huile : le bon, la pile, le CMP et le
     mouvement de stock sont écrits dans une seule transaction. */
  validerBEH(beh, user) {
    const pile = trouver('pilesHuile', beh.pile);
    if (!pile) throw erreur(400, `Pile ${beh.pile} introuvable`);
    const qte = Number(beh.qteHuile) || 0;
    if (qte <= 0) throw erreur(400, "La quantité d'huile doit être supérieure à zéro");
    if (pile.qte + qte > pile.qteMax + 0.001)
      throw erreur(409, `Capacité dépassée : la pile ${pile.num} ne peut recevoir que ${(pile.qteMax - pile.qte).toFixed(1)} kg`);

    db.exec('BEGIN');
    try {
      const cree = inserer('behs', Object.assign({ statut: 'Validé' }, beh), user);
      const prixTotal = pile.prixTotal + (Number(beh.prixTotal) || 0);
      const nouvelleQte = pile.qte + qte;
      modifier('pilesHuile', pile.num, {
        qte: nouvelleQte, prixTotal,
        cmp: nouvelleQte ? +(prixTotal / nouvelleQte).toFixed(3) : 0,
        etat: 'En service'
      }, user);
      inserer('mouvementsPile', {
        date: beh.date, type: 'Entrée', doc: beh.num, pile: pile.num,
        qte, sens: 1, origine: beh.nature || 'Bon d\'entrée huile'
      }, user);
      if (beh.br) {
        const br = trouver('bonsReception', beh.br);
        if (br) modifier('bonsReception', br.num, { beh: beh.num }, user);
      }
      db.exec('COMMIT');
      return { beh: ligneVersObjet('behs', cree), pile: trouver('pilesHuile', pile.num) };
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  },

  /* Validation d'un bon de production : consommation des olives et
     rattachement au bon de réception. */
  validerProduction(bp, user) {
    const br = trouver('bonsReception', bp.br);
    if (!br) throw erreur(400, `Bon de réception ${bp.br} introuvable`);
    if (br.bp) throw erreur(409, `Le bon ${br.num} a déjà la production ${br.bp}`);
    if (!(Number(bp.qteHuile) > 0)) throw erreur(400, "La quantité d'huile doit être supérieure à zéro");
    if (Number(bp.qteHuile) > Number(bp.qteOlives)) throw erreur(400, "L'huile ne peut pas dépasser les olives traitées");

    db.exec('BEGIN');
    try {
      const cree = inserer('bonsProduction', Object.assign({ statut: 'Validé' }, bp), user);
      modifier('bonsReception', br.num, { bp: bp.num }, user);
      inserer('mouvements', {
        date: bp.date, sens: 'Sortie', produit: 'Olives', qte: Number(bp.qteOlives), lot: br.num,
        magasin: 'Matières premières', motif: 'Production ' + bp.num, user
      }, user);
      db.exec('COMMIT');
      return ligneVersObjet('bonsProduction', cree);
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  },

  /* Encaissement d'une facture client : tranches, trésorerie et statut. */
  encaisser({ facture, tranches }, user) {
    const f = trouver('factures', facture);
    if (!f) throw erreur(400, `Facture ${facture} introuvable`);
    const total = tranches.reduce((s, t) => s + (Number(t.montant) || 0), 0);
    const reste = f.ttc - (f.paye || 0);
    if (total <= 0) throw erreur(400, 'Le montant doit être supérieur à zéro');
    if (total > reste + 0.001) throw erreur(409, `Le total (${total.toFixed(3)}) dépasse le reste dû (${reste.toFixed(3)})`);

    db.exec('BEGIN');
    try {
      const lignes = Array.isArray(f.tranches) ? f.tranches : [];
      let encaisse = 0;
      tranches.forEach((t, i) => {
        lignes.push({ n: lignes.length + 1, date: t.date, montant: t.montant, mode: t.mode, ref: t.ref || '—', statut: t.statut || 'Payée' });
        if ((t.statut || 'Payée') === 'Payée') {
          encaisse += Number(t.montant);
          inserer('operations', {
            num: 'OP-' + Date.now() + '-' + i, date: t.date, type: 'Encaissement client', tiers: f.client,
            montant: Number(t.montant), mode: t.mode,
            journal: t.mode === 'Espèces' ? 'Caisse espèces' : t.mode === 'Chèque' ? 'Portefeuille chèques' : 'Banque',
            motif: 'Règlement ' + f.num, user, statut: 'Validé', valide: 0
          }, user);
          if (t.mode === 'Chèque' && t.cheque && t.cheque.num)
            inserer('cheques', Object.assign({ montant: Number(t.montant), facture: f.num, statut: 'En attente' }, t.cheque), user);
        }
      });
      modifier('factures', f.num, { paye: Math.min(f.ttc, (f.paye || 0) + encaisse), tranches: lignes }, user);
      db.exec('COMMIT');
      return trouver('factures', f.num);
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  },

  /* Bon de réception : le document, ses lignes et le stock terrasse. */
  creerReception(br, user) {
    const lignes = br.lignes || [];
    if (!lignes.length) throw erreur(400, 'Le bon doit comporter au moins une ligne');
    if (lignes.some(l => (Number(l.brut) || 0) < (Number(l.vide) || 0)))
      throw erreur(400, 'Le poids vide ne peut pas dépasser le poids brut');

    db.exec('BEGIN');
    try {
      lignes.forEach(l => l.net = Math.max(0, (Number(l.brut) || 0) - (Number(l.vide) || 0)));
      const cree = inserer('bonsReception', Object.assign({ statut: 'Validé' }, br, { lignes }), user);
      const net = lignes.reduce((s, l) => s + l.net, 0);
      lignes.forEach(l => {
        const dep = lister('depots').find(d => d.designation === l.depot);
        if (dep) modifier('depots', dep.code, { qte: (dep.qte || 0) + l.net, etat: 'Occupée' }, user);
      });
      inserer('mouvements', {
        date: br.date, sens: 'Entrée', produit: 'Olives', qte: net, lot: br.num,
        magasin: 'Matières premières', motif: 'Bon de réception ' + br.num, user
      }, user);
      db.exec('COMMIT');
      return ligneVersObjet('bonsReception', cree);
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
};

/* ==========================================================================
   5. Authentification et sessions
   ========================================================================== */
const sessions = new Map();
const hacher = (login, mdp) => crypto.createHash('sha256').update(login + ':' + mdp + ':olivera').digest('hex');

function preparerMotsDePasse() {
  /* Mot de passe initial = le login, à changer à la première connexion réelle. */
  lister('utilisateurs').forEach(u => {
    if (!u.mdp || u.mdp.startsWith('•')) modifier('utilisateurs', u.login, { mdp: hacher(u.login, u.login) }, 'système');
  });
}

function connecter(login, mdp) {
  const u = trouver('utilisateurs', login);
  if (!u || u.statut === 'Inactif') return null;
  if (u.mdp !== hacher(login, mdp)) return null;
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { login: u.login, nom: u.nom, role: u.role, droits: u.droits || [] });
  audit(u.login, 'CONNEXION', 'utilisateurs', u.login, null, null);
  return { token, utilisateur: { login: u.login, nom: u.nom, role: u.role, droits: u.droits || [] } };
}

const session = req => sessions.get((req.headers.authorization || '').replace('Bearer ', ''));
const erreur = (code, msg) => Object.assign(new Error(msg), { code });

function autoriser(sess, table, ecriture) {
  const mod = TABLE_MODULE[table];
  if (!mod) return true;
  const droits = sess.droits || [];
  /* Un droit peut être global (« FINANCE ») ou granulaire (« FINANCE.depenses ») */
  const aLaCategorie = m => droits.some(d => d === m || d.startsWith(m + '.'));
  if (ecriture) return aLaCategorie(mod);
  return aLaCategorie(mod) || aLaCategorie('STATISTIQUES');
}

/* ==========================================================================
   6. Serveur HTTP : API REST + service des fichiers du front
   ========================================================================== */
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png' };

const json = (res, code, data) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};

function corps(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 4e6) req.destroy(); });
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch { reject(erreur(400, 'JSON invalide')); } });
  });
}

const serveur = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const parties = url.pathname.split('/').filter(Boolean);

  try {
    /* ---------- API ---------- */
    if (parties[0] === 'api') {
      const [, ressource, id] = parties;

      if (ressource === 'sante') return json(res, 200, { ok: true, version: '1.0', tables: COLLECTIONS.length });

      if (ressource === 'connexion' && req.method === 'POST') {
        const { login, mdp } = await corps(req);
        const s = connecter(login, mdp);
        return s ? json(res, 200, s) : json(res, 401, { erreur: 'Identifiants incorrects' });
      }

      const sess = session(req);
      if (!sess) return json(res, 401, { erreur: 'Session expirée, reconnectez-vous' });

      if (ressource === 'donnees' && req.method === 'GET') {
        /* Chargement initial : uniquement les tables autorisées */
        const out = { _scalaires: JSON.parse((db.prepare(`SELECT valeur FROM _config WHERE cle='scalaires'`).get() || {}).valeur || '{}') };
        COLLECTIONS.forEach(t => { if (autoriser(sess, t, false)) out[t] = lister(t); });
        out._audit = db.prepare(`SELECT * FROM _audit ORDER BY _id DESC LIMIT 200`).all();
        return json(res, 200, out);
      }

      if (ressource === 'metier' && req.method === 'POST') {
        const action = id, data = await corps(req);
        const droitsAction = { beh:'ACHATS', production:'PRODUCTION', reception:'ACHATS', encaissement:'FINANCE' };
        const m = droitsAction[action];
        if (!(sess.droits || []).some(d => d === m || d.startsWith(m + '.')))
          return json(res, 403, { erreur: `Droit ${droitsAction[action]} requis pour cette opération` });
        if (action === 'beh')          return json(res, 200, Metier.validerBEH(data, sess.login));
        if (action === 'production')   return json(res, 200, Metier.validerProduction(data, sess.login));
        if (action === 'reception')    return json(res, 200, Metier.creerReception(data, sess.login));
        if (action === 'encaissement') return json(res, 200, Metier.encaisser(data, sess.login));
        return json(res, 404, { erreur: 'Opération inconnue' });
      }

      if (ressource === 'audit' && req.method === 'GET')
        return json(res, 200, db.prepare(`SELECT * FROM _audit ORDER BY _id DESC LIMIT 500`).all());

      if (COLLECTIONS.includes(ressource)) {
        const ecriture = req.method !== 'GET';
        if (!autoriser(sess, ressource, ecriture))
          return json(res, 403, { erreur: `Accès refusé au module ${TABLE_MODULE[ressource]}` });

        if (req.method === 'GET' && !id)  return json(res, 200, lister(ressource, Object.fromEntries(url.searchParams)));
        if (req.method === 'GET')         { const o = trouver(ressource, id); return o ? json(res, 200, o) : json(res, 404, { erreur: 'Introuvable' }); }
        if (req.method === 'POST')        { const o = await corps(req);
                                            const cle = cleDe(ressource);
                                            if (o[cle] && trouver(ressource, o[cle])) return json(res, 409, { erreur: `La clé ${o[cle]} existe déjà` });
                                            return json(res, 201, ligneVersObjet(ressource, inserer(ressource, o, sess.login))); }
        if (req.method === 'PUT')         { const o = await corps(req); const m = modifier(ressource, id, o, sess.login);
                                            return m ? json(res, 200, ligneVersObjet(ressource, m)) : json(res, 404, { erreur: 'Introuvable' }); }
        if (req.method === 'DELETE')      return supprimer(ressource, id, sess.login)
                                            ? json(res, 200, { supprime: true }) : json(res, 404, { erreur: 'Introuvable' });
      }
      return json(res, 404, { erreur: 'Ressource inconnue' });
    }

    /* ---------- Fichiers du front ---------- */
    let f = url.pathname === '/' ? '/index.html' : url.pathname;
    const cible = path.join(RACINE, path.normalize(f).replace(/^(\.\.[/\\])+/, ''));
    if (!cible.startsWith(RACINE) || !fs.existsSync(cible) || fs.statSync(cible).isDirectory())
      { res.writeHead(404); return res.end('Introuvable'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(cible)] || 'application/octet-stream' });
    fs.createReadStream(cible).pipe(res);

  } catch (e) {
    json(res, e.code && e.code < 600 ? e.code : 500, { erreur: e.message || 'Erreur serveur' });
  }
});

creerSchema();
const neuf = amorcer();
preparerMotsDePasse();
serveur.listen(PORT, () => {
  console.log(`\n  OLIVERA ERP — serveur démarré`);
  console.log(`  Application : http://localhost:${PORT}`);
  console.log(`  Base        : ${FICHIER_DB} ${neuf ? '(créée et amorcée)' : '(existante, données conservées)'}`);
  console.log(`  Tables      : ${COLLECTIONS.length}`);
  console.log(`  Connexion   : login m.benchaaben — mot de passe m.benchaaben\n`);
});
