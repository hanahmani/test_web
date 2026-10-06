/* ==========================================================================
   OLIVERA ERP — Liaison avec le serveur
   Deux modes d'exécution :
   • servi par le backend (http://localhost:4300) → toutes les données viennent
     de la base SQLite et chaque écriture y est enregistrée ;
   • ouvert en fichier local → mode démonstration, données en mémoire.
   ========================================================================== */

const API = {
  actif: false,
  token: null,
  utilisateur: null,
  base: '/api',
  enAttente: 0,

  async detecter(){
    if(!location.protocol.startsWith('http')) return false;
    try {
      const r = await fetch(this.base + '/sante');
      this.actif = r.ok;
    } catch { this.actif = false; }
    return this.actif;
  },

  async appel(chemin, options = {}){
    const r = await fetch(this.base + chemin, Object.assign({
      headers: Object.assign({ 'Content-Type':'application/json' },
        this.token ? { Authorization: 'Bearer ' + this.token } : {})
    }, options));
    const data = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.erreur || `Erreur ${r.status}`);
    return data;
  },

  async connexion(login, mdp){
    const d = await this.appel('/connexion', { method:'POST', body: JSON.stringify({ login, mdp }) });
    this.token = d.token; this.utilisateur = d.utilisateur;
    return d.utilisateur;
  },

  /* Chargement de toutes les tables autorisées dans le modèle de l'interface */
  async charger(){
    const d = await this.appel('/donnees');
    Object.keys(d).forEach(k=>{
      if(k === '_scalaires') Object.assign(DB, d[k]);
      else if(k === '_audit') DB.audit = d[k].map(a=>({
        user:a.utilisateur, action:a.action, cible:a.taboule+' '+a.cible,
        date:(a.horodatage||'').slice(0,10).split('-').reverse().join('/'), av:'—', ap:'—' }));
      else if(Array.isArray(d[k])) DB[k] = d[k];
    });
  },

  /* Écritures : la ligne est envoyée au serveur, l'interface reste réactive */
  async creer(coll, obj){ return this.file(()=> this.appel('/'+coll, { method:'POST', body: JSON.stringify(obj) }), coll, 'création'); },
  async majr(coll, id, obj){ return this.file(()=> this.appel(`/${coll}/${encodeURIComponent(id)}`, { method:'PUT', body: JSON.stringify(obj) }), coll, 'modification'); },
  async retirer(coll, id){ return this.file(()=> this.appel(`/${coll}/${encodeURIComponent(id)}`, { method:'DELETE' }), coll, 'suppression'); },
  async metier(action, data){ return this.appel('/metier/'+action, { method:'POST', body: JSON.stringify(data) }); },

  /* Toute erreur serveur est remontée à l'utilisateur, jamais silencieuse */
  async file(fn, coll, quoi){
    this.enAttente++;
    try { return await fn(); }
    catch(e){ toast("Enregistrement refusé par le serveur", `${quoi} sur ${coll} : ${e.message}`, 'err'); throw e; }
    finally { this.enAttente--; }
  },

  /* Écran de connexion affiché quand le backend est présent */
  ecranConnexion(){
    document.body.innerHTML = `<div class="login-page">
      <form class="login-card" id="lg-form">
        <div class="brand-mark" style="width:52px;height:52px;margin:0 auto 14px">${icon('olive')}</div>
        <div class="login-titre">OLIVERA ERP</div>
        <div class="login-sous">Huilerie Ben Chaaben — accès sécurisé</div>
        <div class="field mt"><label>Login</label><input class="input" id="lg-login" value="m.benchaaben" autocomplete="username"></div>
        <div class="field mt"><label>Mot de passe</label><input class="input" id="lg-mdp" type="password" value="m.benchaaben" autocomplete="current-password"></div>
        <div id="lg-err" class="login-err"></div>
        <button class="btn btn-primary btn-lg btn-block mt" id="lg-ok" type="submit">${icon('key')}Se connecter</button>
        <div class="login-note">Les droits d'accès sont vérifiés par le serveur : un module non autorisé est refusé même en saisissant son adresse.</div>
      </form></div>`;
    const f = document.getElementById('lg-form');
    f.onsubmit = async e=>{
      e.preventDefault();
      const b = document.getElementById('lg-ok');
      b.disabled = true; b.textContent = 'Connexion…';
      try {
        const u = await this.connexion(document.getElementById('lg-login').value.trim(),
                                       document.getElementById('lg-mdp').value);
        await this.charger();
        DB.user = { nom:u.nom, role:u.role, initiales:u.nom.split(' ').map(x=>x[0]).slice(0,2).join('') };
        document.body.innerHTML = `<div class="app"><aside class="sidebar" id="sidebar"></aside>
          <div class="main"><header class="header" id="header"></header><main class="page" id="view"></main></div></div>
          <div class="toasts"></div>`;
        App.init();
        Acces.courant = { login:u.login, nom:u.nom, role:u.role, droits:u.droits };
        App.render();
        toast('Session ouverte', `${u.nom} — modules autorisés : ${u.droits.join(', ')}.`);
      } catch(err){
        document.getElementById('lg-err').textContent = err.message;
        b.disabled = false; b.innerHTML = 'Se connecter';
      }
    };
  }
};

window.API = API;   /* exposé globalement : `const` ne s'attache pas à window */

/* Démarrage : mode serveur si le backend répond, sinon mode démonstration */
window.addEventListener('DOMContentLoaded', async ()=>{
  if(await API.detecter()) API.ecranConnexion();
  else App.init();                       /* fichier local : données en mémoire */
});
