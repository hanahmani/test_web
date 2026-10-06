/* ==========================================================================
   OLIVERA ERP — Extensions
   Permissions granulaires · Pointage collectif · Matricules tunisiennes
   Conversions d'unités · Types de production · Dépenses et pièces de
   règlement · Filtres des écrans financiers
   Ce fichier complète les précédents sans rien supprimer.
   ========================================================================== */

/* ==========================  1. DROITS GRANULAIRES  ====================== */
const LIBELLES_DROITS = {
  'tableau-de-bord':'Tableau de bord', receptions:'Réceptions et entrées huile', achats:'Bons de commande',
  'factures-achats':'Factures achats', accomptes:'Accomptes fournisseurs', reglements:'Règlements fournisseurs',
  production:'Production et traçabilité', types:'Types de production', operations:'Opérations de production',
  historique:'Historique de production',
  stock:'Stock général', grignons:'Grignons', noyaux:'Noyaux', mouvements:'Mouvements de stock', inventaire:'Inventaire',
  statistiques:'Tableau de bord et rapports', 'stat-stock':'Statistiques stock', 'stat-achats':'Statistiques achats',
  'stat-finance':'Statistiques financières',
  depenses:'Dépenses', 'accomptes-f':'Accomptes fournisseurs', 'reglements-f':'Règlements fournisseurs',
  'reglements-c':'Règlements clients', 'reglements-p':'Règlements personnel', pieces:'Pièces de règlement',
  caisse:'Caisse et trésorerie', ventes:'Ventes et caisse comptoir', livraisons:'Bons de livraison',
  factures:'Factures clients', 'rapports-fin':'Rapports financiers',
  utilisateurs:'Utilisateurs', personnel:'Personnel et présence', fournisseurs:'Fournisseurs', clients:'Clients',
  transporteurs:'Transporteurs', societes:'Sociétés', exercices:'Années et saisons', unites:'Unités',
  referentiels:'Référentiels', parametres:'Paramètres généraux'
};

/* Arbre des permissions construit à partir de la navigation réelle */
const ARBRE_DROITS = (() => {
  const arbre = {};
  NAV.forEach(g => {
    arbre[g.cle] = arbre[g.cle] || { libelle:g.g, icone:g.icone, enfants:new Map() };
    g.items.forEach(([k, l, i, sous]) => {
      const cle = sous || k;
      if (!arbre[g.cle].enfants.has(cle))
        arbre[g.cle].enfants.set(cle, { cle: g.cle + '.' + cle, libelle: LIBELLES_DROITS[cle] || l, ecrans: [] });
      arbre[g.cle].enfants.get(cle).ecrans.push(k);
    });
  });
  return arbre;
})();

Object.assign(Acces, {
  /* Un droit est accordé soit par la catégorie entière, soit par le droit précis */
  a(droit){
    const d = this.droits();
    if(!droit) return true;
    if(d.includes(droit)) return true;
    const cat = droit.split('.')[0];
    if(droit.indexOf('.') === -1) return d.some(x => x === cat || x.startsWith(cat + '.'));
    return d.includes(cat);
  },
  route(k){
    const droit = DROIT_ROUTE[k];
    return droit ? this.a(droit) : true;
  },
  /* Développe une liste de droits en droits élémentaires */
  detailler(droits){
    const out = new Set();
    droits.forEach(d=>{
      if(d.indexOf('.') > -1) { out.add(d); return; }
      const cat = ARBRE_DROITS[d];
      if(cat) cat.enfants.forEach(e => out.add(e.cle)); else out.add(d);
    });
    return [...out];
  }
});

/* Formulaire utilisateur avec arbre de permissions dépliable */
Utilisateur.form = function(u){
  const actifs = new Set(Acces.detailler((u && u.droits) || []));
  const categories = Object.entries(ARBRE_DROITS).map(([cle, cat])=>{
    const enfants = [...cat.enfants.values()];
    const coches = enfants.filter(e => actifs.has(e.cle)).length;
    return `<div class="perm-cat ${coches?'ouvert':''}" data-cat="${cle}">
      <div class="perm-cat-head">
        <button class="icon-btn perm-toggle" type="button" data-toggle="${cle}">${icon('chevron-right','chev')}</button>
        <label class="perm-cat-lab"><input type="checkbox" data-catbox="${cle}"
          ${coches===enfants.length?'checked':''}> ${icon(cat.icone||'list')} <strong>${cat.libelle}</strong></label>
        <span class="perm-compte">${coches} / ${enfants.length}</span>
      </div>
      <div class="perm-enfants" ${coches?'':'hidden'}>
        ${enfants.map(e=>`<label class="perm"><input type="checkbox" data-dr="${e.cle}"
          ${actifs.has(e.cle)?'checked':''}> ${e.libelle}</label>`).join('')}
      </div></div>`;
  }).join('');

  modal({ size:'wide', title: u ? 'Utilisateur — '+u.login : 'Ajouter un utilisateur',
    body:`<div class="grid g-2">
        <div class="field"><label>Login *</label><input class="input" data-f="login" value="${u?u.login:''}"></div>
        <div class="field"><label>Mot de passe</label><input class="input" type="password" data-f="mdp" value="${u?u.mdp:''}"
          placeholder="${u?'Laisser tel quel pour ne pas changer':'Mot de passe initial'}"></div>
        <div class="field"><label>Application</label><select class="input select" data-f="application">
          ${DB.societes.map(s=>`<option ${u&&u.application===s.nom?'selected':''}>${s.nom}</option>`).join('')}</select></div>
        <div class="field"><label>Personnel</label><select class="input select" data-f="nom">
          ${DB.employes.map(e=>`<option ${u&&u.nom===e.nom?'selected':''}>${e.nom}</option>`)
            .concat(u && !DB.employes.some(e=>e.nom===u.nom) ? `<option selected>${u.nom}</option>` : '').join('')}</select></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><div><div class="card-title">Droits d'accès</div>
          <div class="card-sub">Cochez une catégorie entière ou uniquement les écrans autorisés</div></div>
          <div class="spacer"></div>
          <button class="btn btn-sm" type="button" id="dr-all">Sélectionner tout</button>
          <button class="btn btn-sm" type="button" id="dr-none">Désélectionner tout</button>
          <button class="btn btn-sm" type="button" id="dr-open">Développer / réduire</button></div>
        <div class="card-body"><div class="perm-arbre">${categories}</div></div>
      </div>`,
    foot:`<button class="btn" data-close>Annuler</button>
          <button class="btn btn-primary" id="us-ok">${icon('check')}Enregistrer</button>`,
    onOpen(ov){
      const majCompteurs = ()=> els('.perm-cat', ov).forEach(c=>{
        const boxes = els('[data-dr]', c), n = boxes.filter(b=>b.checked).length;
        c.querySelector('.perm-compte').textContent = `${n} / ${boxes.length}`;
        const cb = c.querySelector('[data-catbox]');
        cb.checked = n === boxes.length; cb.indeterminate = n > 0 && n < boxes.length;
      });
      els('[data-toggle]', ov).forEach(b=> b.onclick = ()=>{
        const c = b.closest('.perm-cat');
        c.classList.toggle('ouvert');
        c.querySelector('.perm-enfants').hidden = !c.classList.contains('ouvert');
      });
      els('[data-catbox]', ov).forEach(cb=> cb.onchange = ()=>{
        els('[data-dr]', cb.closest('.perm-cat')).forEach(b=> b.checked = cb.checked);
        majCompteurs();
      });
      els('[data-dr]', ov).forEach(b=> b.onchange = majCompteurs);
      el('#dr-all', ov).onclick = ()=>{ els('[data-dr]',ov).forEach(b=>b.checked=true); majCompteurs(); };
      el('#dr-none', ov).onclick = ()=>{ els('[data-dr]',ov).forEach(b=>b.checked=false); majCompteurs(); };
      el('#dr-open', ov).onclick = ()=>{
        const tout = els('.perm-cat', ov).every(c=>c.classList.contains('ouvert'));
        els('.perm-cat', ov).forEach(c=>{ c.classList.toggle('ouvert', !tout); c.querySelector('.perm-enfants').hidden = tout; });
      };
      majCompteurs();

      el('#us-ok', ov).onclick = ()=>{
        const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.value.trim());
        if(!d.login) return toast('Une erreur est survenue','Le login est obligatoire.','err');
        /* Une catégorie entièrement cochée est enregistrée comme droit global */
        const droits = [];
        els('.perm-cat', ov).forEach(c=>{
          const cle = c.dataset.cat, boxes = els('[data-dr]', c), coches = boxes.filter(b=>b.checked);
          if(coches.length === boxes.length && boxes.length) droits.push(cle);
          else coches.forEach(b=> droits.push(b.dataset.dr));
        });
        d.droits = droits;
        if(u && !d.mdp) delete d.mdp;
        if(u){ Store.update('utilisateurs', u, d, u.login);
               toast('Utilisateur modifié', `${u.login} — ${droits.length} droit(s) actif(s).`); }
        else { Store.add('utilisateurs', Object.assign({ role:'Opérateur', site:'Sousse', statut:'Actif',
                 derniere:'—', email:d.login+'@benchaaben.tn' }, d));
               toast('Utilisateur ajouté avec succès', `${d.login} peut se connecter avec ${droits.length} droit(s).`); }
        closeModal(); App.render();
      };
    }});
};

/* ==========================  2. POINTAGE COLLECTIF  ====================== */
const Pointage = {
  ouvrir(date){
    date = date || Store.dateFR();
    const deja = m => DB.presences.find(p=>p.date===date && p.mat===m);
    modal({ size:'wide', title:'Pointage du personnel',
      body:`<div class="grid g-3" style="margin-bottom:14px">
          <div class="field"><label>Date du pointage</label><input class="input" id="pt-date" value="${date}"></div>
          <div class="field"><label>Heure d'entrée par défaut</label><input class="input" id="pt-in" value="07:00"></div>
          <div class="field"><label>Heure de sortie par défaut</label><input class="input" id="pt-out" value="17:00"></div>
        </div>
        <div class="row gap-sm" style="margin-bottom:12px">
          <button class="btn btn-sm" type="button" id="pt-tous">${icon('check')}Tous présents</button>
          <button class="btn btn-sm" type="button" id="pt-aucun">${icon('x')}Tous absents</button>
          <div class="spacer"></div>
          <span class="tiny muted" id="pt-resume"></span>
        </div>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>Personnel</th><th>Matricule</th><th>Poste</th><th>Type</th>
            <th class="c">Présent</th><th class="c">Absent</th><th>Remarque</th><th class="r">Total</th></tr></thead>
          <tbody>${DB.employes.map(e=>{
            const p = deja(e.mat);
            const present = p ? p.statut==='Présent' : true;
            return `<tr data-mat="${e.mat}">
              <td class="strong">${e.nom}</td>
              <td><span class="ref">${e.mat}</span></td>
              <td>${e.poste}</td>
              <td><span class="badge ${e.typeRem==='Jour'?'info':'gold'} no-dot">${e.typeRem} · ${fmt.n(e.prix,3)}</span></td>
              <td class="c"><input type="radio" name="pt-${e.mat}" value="Présent" ${present?'checked':''}></td>
              <td class="c"><input type="radio" name="pt-${e.mat}" value="Absent" ${present?'':'checked'}></td>
              <td><input class="input" data-rem="${e.mat}" value="${p?(p.remarque||''):''}" placeholder="Maladie, congé…"></td>
              <td class="r pt-total" data-tot="${e.mat}">—</td>
            </tr>`;}).join('')}</tbody>
        </table></div>
        ${DB.presences.some(p=>p.date===date) ? `<div class="note mt">Un pointage existe déjà pour le ${date} : l'enregistrement remplacera les lignes de cette journée.</div>`:''}`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="pt-ok">${icon('check')}Enregistrer le pointage</button>`,
      onOpen(ov){
        const heures = ()=>{
          const h = t=>{ const [a,b]=String(t).split(':').map(Number); return (a||0)+(b||0)/60; };
          return Math.max(0, +(h(el('#pt-out',ov).value) - h(el('#pt-in',ov).value)).toFixed(1));
        };
        const maj = ()=>{
          let p=0, total=0;
          DB.employes.forEach(e=>{
            const present = ov.querySelector(`input[name="pt-${e.mat}"][value="Présent"]`).checked;
            const t = present ? (e.typeRem==='Heure' ? heures()*e.prix : e.prix) : 0;
            if(present) p++;
            total += t;
            ov.querySelector(`[data-tot="${e.mat}"]`).innerHTML = present
              ? `<span class="strong">${fmt.n(t,3)} TND</span>` : '<span class="muted">—</span>';
          });
          el('#pt-resume',ov).textContent =
            `${p} présent(s) · ${DB.employes.length-p} absent(s) · masse salariale du jour : ${fmt.n(total,3)} TND`;
        };
        els('input[type="radio"]', ov).forEach(r=> r.onchange = maj);
        ['#pt-in','#pt-out'].forEach(s=> el(s,ov).oninput = maj);
        el('#pt-tous',ov).onclick = ()=>{ els('input[value="Présent"]',ov).forEach(r=>r.checked=true); maj(); };
        el('#pt-aucun',ov).onclick = ()=>{ els('input[value="Absent"]',ov).forEach(r=>r.checked=true); maj(); };
        maj();

        el('#pt-ok',ov).onclick = ()=>{
          const d = el('#pt-date',ov).value.trim();
          if(!/^\d{2}\/\d{2}\/\d{4}$/.test(d))
            return toast('Date invalide','Saisissez la date au format JJ/MM/AAAA.','err');
          const hIn = el('#pt-in',ov).value, hOut = el('#pt-out',ov).value, nbH = heures();
          /* Remplacement du pointage existant pour cette journée */
          DB.presences.filter(p=>p.date===d).slice().forEach(p=> Store.remove('presences', p));
          let n = 0;
          DB.employes.forEach(e=>{
            const present = ov.querySelector(`input[name="pt-${e.mat}"][value="Présent"]`).checked;
            const heuresE = present ? nbH : 0, jours = present ? 1 : 0;
            Store.add('presences', {
              date:d, mat:e.mat, nom:e.nom, poste:e.poste,
              arrivee: present ? hIn : '—', depart: present ? hOut : '—',
              heures:heuresE, jours, hs: Math.max(0, +(heuresE-8).toFixed(1)),
              typeRem:e.typeRem, prix:e.prix,
              total: +( (e.typeRem==='Heure' ? heuresE*e.prix : jours*e.prix) ).toFixed(3),
              statut: present ? 'Présent' : 'Absent',
              remarque: ov.querySelector(`[data-rem="${e.mat}"]`).value.trim()
            }, 'Pointage '+e.mat+' '+d);
            n++;
          });
          Store.log('Pointage collectif', d, '—', n+' employés');
          toast('Pointage enregistré', `${n} employés pointés pour le ${d}.`);
          closeModal(); App.render();
        };
      }});
  }
};

/* ==========================  3. MATRICULE TUNISIENNE  ==================== */
const Matricule = {
  regex: /^\d{1,4}\s*(TU|TU)\s*\d{1,4}$/i,
  normaliser(v){
    const m = String(v||'').match(/(\d{1,4})\s*(?:TU|TU)?\s*(\d{1,4})?/i);
    if(!m) return '';
    return m[2] ? `${m[1]} TU ${m[2]}` : m[1];
  },
  valide(v){ return this.regex.test(String(v||'').trim()); },
  champ(val, i){
    const m = String(val||'').match(/(\d{1,4})\s*(?:TU|TU)\s*(\d{1,4})/i) || [];
    return `<div class="mat-tn" data-mat-i="${i}">
      <input class="input mat-serie" inputmode="numeric" maxlength="4" placeholder="244" value="${m[1]||''}">
      <span class="mat-tu">TU</span>
      <input class="input mat-num" inputmode="numeric" maxlength="4" placeholder="2002" value="${m[2]||''}">
    </div>`;
  },
  lire(box){
    const s = box.querySelector('.mat-serie').value.replace(/\D/g,'');
    const n = box.querySelector('.mat-num').value.replace(/\D/g,'');
    return (s && n) ? `${s} TU ${n}` : '';
  }
};

/* Le formulaire fournisseur utilise le composant de plaque tunisienne */
Tiers.fournisseur = function(f, mode){
  const lecture = mode === 'voir';
  const mats = (f && f.matricules ? f.matricules : []);
  modal({ size:'wide', title: f ? (lecture?'Fiche fournisseur — ':'Modifier — ')+f.nom : 'Ajouter un fournisseur',
    body:`<div class="grid g-3">
        <div class="field"><label>Numéro</label><input class="input" data-f="numero" value="${f?f.numero:String(DB.fournisseurs.length+1).padStart(4,'0')}" ${lecture?'readonly':''}></div>
        <div class="field span-2"><label>Raison sociale *</label><input class="input" data-f="nom" value="${f?f.nom:''}" ${lecture?'readonly':''}></div>
        <div class="field span-2"><label>Adresse</label><input class="input" data-f="adresse" value="${f?f.adresse||'':''}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Identifiant unique</label><input class="input" data-f="identifiant" value="${f?f.identifiant||'':''}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Téléphone *</label><input class="input" data-f="tel" value="${f?f.tel:''}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Type</label><select class="input select" data-f="typeF" ${lecture?'disabled':''}>
          ${['Olive','Divers'].map(t=>`<option ${f&&f.typeF===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Ville</label><input class="input" data-f="ville" value="${f?f.ville||'':''}" ${lecture?'readonly':''}></div>
      </div>
      <div class="repeater" style="margin-top:16px">
        <div class="rep-head"><div><div class="card-title">Matricules des véhicules</div>
          <div class="card-sub">Format tunisien : série, TU, numéro — exemple 244 TU 2002</div></div>
          <div class="spacer"></div>
          <button class="btn btn-sm" type="button" id="mat-add" ${lecture?'disabled':''}>${icon('plus')}Ajouter matricule</button></div>
        <div class="rep-body" id="mat-liste">
          ${mats.length ? mats.map((m,i)=>`<div class="mat-ligne">${Matricule.champ(m,i)}
            <button class="icon-btn tip" type="button" data-tip="Retirer" data-mat-del>${icon('trash')}</button></div>`).join('')
            : '<div class="tiny muted">Aucun véhicule déclaré pour ce fournisseur.</div>'}
        </div>
      </div>`,
    foot: lecture
      ? `<button class="btn" data-close>Fermer</button><button class="btn btn-primary" id="tf-edit">${icon('edit')}Modifier</button>`
      : `<button class="btn" data-close>Annuler</button><button class="btn btn-primary" id="tf-ok">${icon('check')}Enregistrer</button>`,
    onOpen(ov){
      const liste = el('#mat-liste', ov);
      const ajouter = (val)=>{
        if(liste.querySelector('.tiny')) liste.innerHTML = '';
        const d = document.createElement('div');
        d.className = 'mat-ligne';
        d.innerHTML = Matricule.champ(val||'', liste.children.length) +
          `<button class="icon-btn tip" type="button" data-tip="Retirer" data-mat-del>${icon('trash')}</button>`;
        liste.appendChild(d);
        d.querySelector('[data-mat-del]').onclick = ()=> d.remove();
      };
      els('[data-mat-del]', ov).forEach(b=> b.onclick = ()=> b.closest('.mat-ligne').remove());
      if(lecture){ el('#tf-edit',ov).onclick = ()=>{ closeModal(); Tiers.fournisseur(f,'mod'); }; return; }
      el('#mat-add',ov).onclick = ()=> ajouter('');
      el('#tf-ok',ov).onclick = ()=>{
        const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.value.trim());
        if(!d.nom || !d.tel) return toast('Une erreur est survenue','La raison sociale et le téléphone sont obligatoires.','err');
        const mat = [], invalides = [];
        els('.mat-tn', ov).forEach(box=>{
          const v = Matricule.lire(box);
          const rempli = box.querySelector('.mat-serie').value || box.querySelector('.mat-num').value;
          if(v) mat.push(v); else if(rempli) invalides.push(box);
        });
        if(invalides.length){
          invalides.forEach(b=> b.classList.add('mat-erreur'));
          return toast('Matricule incomplet','Une plaque tunisienne comporte une série et un numéro, par exemple 244 TU 2002.','err');
        }
        d.matricules = mat;
        if(f){ Store.update('fournisseurs', f, d); toast('Fournisseur modifié', f.nom+' a été mis à jour.'); }
        else { Store.add('fournisseurs', Object.assign({ code:'FRN-'+String(++Store.seq.FRN).padStart(3,'0'),
                 contact:d.nom, conditions:'Comptant', achats:0, encours:0, statut:'Actif' }, d));
               toast('Fournisseur ajouté avec succès', d.nom+' est disponible dans les bons de réception.'); }
        closeModal(); App.render();
      };
    }});
};

/* ==========================  4. UNITÉS ET CONVERSIONS  =================== */
DB.conversions = DB.conversions || [
  { code:"CV-001", qteDe:0.92, de:"Kilogramme", qteVers:1, vers:"Litre", note:"Densité de l'huile d'olive" },
  { code:"CV-002", qteDe:1, de:"Tonne", qteVers:1000, vers:"Kilogramme", note:"" },
  { code:"CV-003", qteDe:1, de:"Kilogramme", qteVers:1000, vers:"Gramme", note:"" },
  { code:"CV-004", qteDe:1, de:"Carton", qteVers:12, vers:"Bouteille", note:"Carton standard" }
];
if(!DB.unites.some(u=>u.libelle==='Gramme'))
  DB.unites.push({ code:"G", libelle:"Gramme", type:"Poids", base:"KG", facteur:0.001 });

ENTITES.conversions = {
  coll:'conversions', label:'conversion', titre:r=>`${r.qteDe} ${r.de} = ${r.qteVers} ${r.vers}`, id:'code', route:'unites',
  fields:[
    {k:'code', l:'Code', ro:true, def:()=>'CV-'+String(DB.conversions.length+1).padStart(3,'0')},
    {k:'qteDe', l:'Quantité source', type:'number', step:'0.001', req:true, def:1},
    {k:'de', l:'Unité source', type:'select', req:true, options:()=>DB.unites.map(u=>u.libelle)},
    {k:'qteVers', l:'Quantité cible', type:'number', step:'0.001', req:true, def:1},
    {k:'vers', l:'Unité cible', type:'select', req:true, options:()=>DB.unites.map(u=>u.libelle)},
    {k:'note', l:'Note', span:true}
  ],
  defaut:()=>({})
};

/* Conversion utilisable par les autres modules */
Store.convertir = function(qte, de, vers){
  if(de === vers) return qte;
  const d = DB.conversions.find(c=>c.de===de && c.vers===vers);
  if(d) return +(qte * (d.qteVers / d.qteDe)).toFixed(3);
  const inv = DB.conversions.find(c=>c.de===vers && c.vers===de);
  if(inv) return +(qte * (inv.qteDe / inv.qteVers)).toFixed(3);
  return null;
};

PAGES.unites = () => pageHead("Unités et conversions","Unités de mesure et règles de conversion utilisées par les modules",
  `<button class="btn btn-sm" data-crud="add:unites">${icon('plus')}Nouvelle unité</button>
   <button class="btn btn-sm btn-primary" data-crud="add:conversions">${icon('transfer')}Nouvelle conversion</button>`)
  + card("Unités de mesure", dataTable('unl', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'libelle', t:'Libellé', render:r=>`<span class="strong">${r.libelle}</span>`},
      {k:'type', t:'Type'},
      {k:'base', t:'Unité de base'},
      {k:'facteur', t:'Facteur', r:true, render:r=>fmt.n(r.facteur,3)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.unites, {noPager:true, entity:'unites', ph:"Rechercher une unité…"}), {flush:true})
  + `<div style="height:16px"></div>`
  + card("Conversions", dataTable('cvl', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'regle', t:'Règle de conversion', render:r=>`<span class="strong">${fmt.n(r.qteDe,3)} ${r.de} = ${fmt.n(r.qteVers,3)} ${r.vers}</span>`},
      {k:'de', t:'Unité source'}, {k:'vers', t:'Unité cible'},
      {k:'facteur', t:'Facteur appliqué', r:true, render:r=>fmt.n(r.qteVers/r.qteDe,4)},
      {k:'note', t:'Note', render:r=>r.note||'<span class="muted">—</span>'},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.conversions, {noPager:true, entity:'conversions', ph:"Rechercher une conversion…"}), {flush:true,
      sub:"Exemple : 0,92 kg = 1 L pour l'huile d'olive. La conversion n'est appliquée que là où le contexte l'exige."})
  + card("Convertisseur", `
      <div class="grid g-4 gap-sm">
        <div class="field"><label>Quantité</label><input class="input" type="number" step="0.001" id="cv-q" value="100"></div>
        <div class="field"><label>De</label><select class="input select" id="cv-de">${DB.unites.map(u=>`<option>${u.libelle}</option>`).join('')}</select></div>
        <div class="field"><label>Vers</label><select class="input select" id="cv-vers">${DB.unites.map((u,i)=>`<option ${i===2?'selected':''}>${u.libelle}</option>`).join('')}</select></div>
        <div class="field"><label>Résultat</label><input class="input" id="cv-res" readonly></div>
      </div>`, {cls:'mt', sub:"Vérification rapide des règles enregistrées"});

/* ==========================  5. TYPES DE PRODUCTION  ===================== */
DB.typesProduction = DB.typesProduction || [
  { code:"TRT-FACON", libelle:"Trituration à façon", tiers:"Client", facturation:"Prestation au kilo d'olives",
    rendementCible:14.0, description:"Le client apporte ses olives et récupère son huile ; l'huilerie facture le service.", actif:true },
  { code:"PROD-PROPRE", libelle:"Production propre", tiers:"Fournisseur", facturation:"Achat des olives ou du rendement huile",
    rendementCible:14.5, description:"L'huilerie achète les olives, produit l'huile et la stocke en pile pour la revendre.", actif:true }
];
ENTITES.typesProduction = {
  coll:'typesProduction', label:'type de production', titre:r=>r.libelle, id:'code', route:'types-production',
  fields:[
    {k:'code', l:'Code', req:true, ph:'TRT-EXPORT'},
    {k:'libelle', l:'Libellé', req:true},
    {k:'tiers', l:'Tiers concerné', type:'select', options:['Client','Fournisseur']},
    {k:'facturation', l:'Mode de facturation', span:true},
    {k:'rendementCible', l:'Rendement cible (%)', type:'number', step:'0.1', def:14},
    {k:'description', l:'Description', type:'textarea', span:true},
    {k:'actif', l:'Actif', type:'checkbox', ph:'Proposé dans les bons de production'}
  ],
  defaut:()=>({})
};

PAGES['types-production'] = () => pageHead("Types de production","Catégories de production de l'huilerie, ajoutables sans modifier le code",
  `<button class="btn btn-sm btn-primary" data-crud="add:typesProduction">${icon('plus')}Nouveau type</button>`)
  + dataTable('tprod', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'libelle', t:'Type de production', render:r=>`<div class="strong">${r.libelle}</div><div class="cell-sub">${r.description||''}</div>`},
      {k:'tiers', t:'Tiers', render:r=>`<span class="badge ${r.tiers==='Client'?'gold':'info'} no-dot">${r.tiers}</span>`},
      {k:'facturation', t:'Facturation'},
      {k:'rendementCible', t:'Rendement cible', r:true, render:r=>fmt.pct(r.rendementCible)},
      {k:'bons', t:'Bons rattachés', r:true, render:r=>String(DB.bonsProduction.filter(b=>
        (r.tiers==='Client') === (b.type==='Trituration')).length)},
      {k:'actif', t:'Statut', render:r=>r.actif?'<span class="badge ok">Actif</span>':'<span class="badge neutral">Inactif</span>'},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.typesProduction, {noPager:true, entity:'typesProduction', ph:"Rechercher un type…"});

PAGES['operations-production'] = () => {
  const f = Flt.get('opprod', {type:''});
  let rows = Store.filtrer(DB.bonsProduction, f);
  if(f.type) rows = rows.filter(b=>b.type===f.type);
  return pageHead("Opérations de production","Suivi des opérations de trituration réalisées",
    `<button class="btn btn-sm" data-go="types-production">${icon('cog')}Types de production</button>
     <button class="btn btn-sm btn-primary" id="bp-add">${icon('plus')}Nouvelle opération</button>`)
  + Flt.bar('opprod', [
      {k:'type', l:'Type de production', type:'select', options:()=>DB.typesProduction.map(t=>t.tiers==='Client'?'Trituration':'Non Trituration')}
    ])
  + dataTable('opl', [
      {k:'num', t:'Opération', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date', render:r=>`${r.date}<div class="cell-sub">${r.heure}</div>`},
      {k:'type', t:'Type', render:r=>`<span class="badge ${r.type==='Trituration'?'gold':'info'} no-dot">${r.type}</span>`},
      {k:'tiers', t:'Fournisseur / Client'},
      {k:'qteOlives', t:'Olives traitées', r:true, render:r=>fmt.n(r.qteOlives)+' kg'},
      {k:'qteHuile', t:'Huile obtenue', r:true, render:r=>`<span class="strong">${fmt.n(r.qteHuile,1)} kg</span>`},
      {k:'rendement', t:'Rendement', r:true, render:r=>{
        const cible = (DB.typesProduction.find(t=>(t.tiers==='Client')===(r.type==='Trituration'))||{}).rendementCible||14;
        return `<span class="badge ${r.rendement>=cible?'ok':'warn'} no-dot">${fmt.pct(r.rendement)}</span>
                <div class="cell-sub">cible ${fmt.pct(cible)}</div>`;}},
      {k:'grignons', t:'Grignons', r:true, render:r=>fmt.n(r.grignons)+' kg'},
      {k:'margines', t:'Margines', r:true, render:r=>fmt.n(r.margines)+' L'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Validé'?'Validée':r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'voir'},{i:'edit',t:'Modifier',a:'mod'}])}
    ], rows, {ph:"Rechercher une opération…", per:10,
        onRow:b=>DocBP.voir(b),
        rowAction:(a,r)=>{ if(a==='voir') DocBP.voir(r); if(a==='mod') DocBP.form(r); }})
  + totaux([["Opérations", String(rows.length)],
            ["Olives traitées", fmt.n(rows.reduce((s,b)=>s+b.qteOlives,0))+" kg"],
            ["Huile obtenue", fmt.n(rows.reduce((s,b)=>s+b.qteHuile,0),1)+" kg"],
            ["Rendement moyen", fmt.pct(rows.reduce((s,b)=>s+b.qteOlives,0)?rows.reduce((s,b)=>s+b.qteHuile,0)/rows.reduce((s,b)=>s+b.qteOlives,0)*100:0)]]);
};

PAGES['historique-production'] = () => {
  const f = Flt.get('histprod', {});
  const rows = Store.filtrer(DB.bonsProduction, f);
  const parMois = {};
  rows.forEach(b=>{
    const m = (b.date||'').slice(3);
    parMois[m] = parMois[m] || { periode:m, bons:0, olives:0, huile:0, grignons:0, noyaux:0, margines:0, cout:0 };
    const p = parMois[m];
    p.bons++; p.olives += b.qteOlives; p.huile += b.qteHuile;
    p.grignons += b.grignons; p.noyaux += b.noyaux; p.margines += b.margines; p.cout += b.cout;
  });
  const lignes = Object.values(parMois);
  return pageHead("Historique de production","Cumuls par période, calculés sur les bons de production enregistrés")
  + Flt.bar('histprod', [])
  + dataTable('hpl', [
      {k:'periode', t:'Période'},
      {k:'bons', t:'Nombre de bons', r:true},
      {k:'olives', t:'Olives traitées', r:true, render:r=>fmt.n(r.olives)+' kg'},
      {k:'huile', t:'Huile produite', r:true, render:r=>`<span class="strong">${fmt.n(r.huile,1)} kg</span>`},
      {k:'rdt', t:'Rendement', r:true, render:r=>fmt.pct(r.olives?r.huile/r.olives*100:0)},
      {k:'grignons', t:'Grignons', r:true, render:r=>fmt.n(r.grignons)+' kg'},
      {k:'noyaux', t:'Noyaux', r:true, render:r=>fmt.n(r.noyaux)+' kg'},
      {k:'margines', t:'Margines', r:true, render:r=>fmt.n(r.margines)+' L'},
      {k:'cout', t:'Coût', r:true, render:r=>fmt.n(r.cout,3)+' TND'}
    ], lignes, {noToolbar:true, noPager:true})
  + card("Détail des bons", dataTable('hpd', [
      {k:'num', t:'BP', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'br', t:'BR', render:r=>`<span class="ref">${r.br}</span>`},
      {k:'tiers', t:'Tiers'}, {k:'type', t:'Type'},
      {k:'qteHuile', t:'Huile', r:true, render:r=>fmt.n(r.qteHuile,1)+' kg'},
      {k:'rendement', t:'Rendement', r:true, render:r=>fmt.pct(r.rendement)},
      {k:'cmp', t:'CMP', r:true, render:r=>fmt.n(r.cmp,3)}
    ], rows, {noToolbar:true, noPager:true}), {flush:true, cls:'mt'});
};

/* ==========================  6. FICHE PRÉSENCE  ========================== */
PAGES.presence = () => {
  const f = Flt.get('pres', {personnel:'', typeRem:'', etat:''});
  let rows = Store.filtrer(DB.presences, {du:f.du, au:f.au, saison:null});
  if(f.personnel) rows = rows.filter(p=>p.nom===f.personnel);
  if(f.typeRem)   rows = rows.filter(p=>p.typeRem===f.typeRem);
  if(f.etat)      rows = rows.filter(p=>p.statut===f.etat);
  const th = rows.reduce((s,p)=>s+p.heures,0), tj = rows.reduce((s,p)=>s+p.jours,0), tt = rows.reduce((s,p)=>s+p.total,0);

  return pageHead("Fiche présence","Pointage du personnel et calcul automatique de la rémunération",
    `<button class="btn btn-sm" data-go="personnel">${icon('users')}Personnel</button>
     <button class="btn btn-sm btn-primary" id="pt-open">${icon('plus')}Ajouter une présence</button>`)
  + Flt.bar('pres', [
      {k:'personnel', l:'Personnel', type:'select', options:()=>DB.employes.map(e=>e.nom)},
      {k:'typeRem', l:'Type', type:'select', options:['Jour','Heure']},
      {k:'etat', l:'État présence', type:'select', options:['Présent','Absent','Congé','Repos']}
    ])
  + dataTable('presl', [
      {k:'date', t:'Date'},
      {k:'nom', t:'Personnel', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.mat} · ${r.poste}</div>`},
      {k:'arrivee', t:'Heure entrée'}, {k:'depart', t:'Heure sortie'},
      {k:'heures', t:'Nb heures', r:true, render:r=>fmt.n(r.heures,1)},
      {k:'jours', t:'Nb jours', r:true},
      {k:'typeRem', t:'Type', render:r=>`<span class="badge ${r.typeRem==='Jour'?'info':'gold'} no-dot">${r.typeRem}</span>`},
      {k:'prix', t:'Prix', r:true, render:r=>fmt.n(r.prix,3)},
      {k:'total', t:'Total', r:true, render:r=>`<span class="strong">${fmt.n(r.total,3)} TND</span>`},
      {k:'statut', t:'État', render:r=>`<span class="badge ${r.statut==='Présent'?'ok':r.statut==='Absent'?'danger':'neutral'}">${r.statut}</span>`},
      {k:'remarque', t:'Remarque', render:r=>r.remarque||'<span class="muted">—</span>'},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], rows, {ph:"Rechercher un employé, une date…", entity:'presences', per:12})
  + totaux([["Pointages", String(rows.length)], ["Total heures", fmt.n(th,1)+" h"],
            ["Total jours", fmt.n(tj)], ["Masse salariale", fmt.n(tt,3)+" TND"]]);
};

/* ==========================  7. GRIGNONS ET NOYAUX  ====================== */
const SousProduit = {
  form(coll, titre, r){
    const dft = coll === 'grignons' ? 0.080 : 0.220;
    modal({ size:'wide', title: r ? `Modifier ${titre} ${r.num}` : `Ajouter ${titre}`,
      body:`<div class="grid g-3">
          <div class="field"><label>Numéro</label><input class="input" data-f="num" value="${r?r.num:Store.num(coll==='grignons'?'GRG':'NOY',4)}" readonly></div>
          <div class="field"><label>Date *</label><input class="input" data-f="date" value="${r?r.date:Store.dateFR()}"></div>
          <div class="field"><label>Client *</label><select class="input select" data-f="client">
            ${DB.clients.map(c=>`<option ${r&&r.client===c.nom?'selected':''}>${c.nom}</option>`).join('')}</select></div>
          <div class="field"><label>Transporteur</label><select class="input select" data-f="transporteur" id="sp-trp">
            ${DB.transporteurs.map(t=>`<option ${r&&r.transporteur===t.nom?'selected':''}>${t.nom}</option>`).join('')}</select></div>
          <div class="field"><label>Matricule véhicule</label><select class="input select" data-f="matricule" id="sp-mat"></select></div>
          <div class="field"><label>Bon de livraison</label><input class="input" data-f="bl" value="${r?r.bl:(coll==='grignons'?'BL-G-':'BL-N-')+String(Math.floor(Math.random()*900)+100).padStart(5,'0')}"></div>
          <div class="field"><label>Quantité (kg) *</label><input class="input" type="number" step="0.001" data-f="qte" id="sp-qte" value="${r?r.qte:0}"></div>
          <div class="field"><label>Prix unitaire (TND/kg) *</label><input class="input" type="number" step="0.001" data-f="pu" id="sp-pu" value="${r?r.pu:dft}"></div>
          <div class="field"><label>Prix total (TND)</label><input class="input" data-f="total" id="sp-tot" readonly></div>
          <div class="field span-2"><label>Remarque</label><input class="input" data-f="remarque" value="${r?r.remarque||'':''}"></div>
          <div class="field"><label>État</label><select class="input select" data-f="etat">
            ${['Livré','En attente','Annulé'].map(e=>`<option ${r&&r.etat===e?'selected':''}>${e}</option>`).join('')}</select></div>
        </div>
        <div class="note mt" id="sp-calc"></div>`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="sp-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        const majMats = ()=>{
          const t = DB.transporteurs.find(x=>x.nom===el('#sp-trp',ov).value) || {};
          el('#sp-mat',ov).innerHTML = (t.matricules||['—']).map(m=>
            `<option ${r&&r.matricule===m?'selected':''}>${m}</option>`).join('');
        };
        const maj = ()=>{
          const q = parseFloat(el('#sp-qte',ov).value)||0, p = parseFloat(el('#sp-pu',ov).value)||0;
          const t = +(q*p).toFixed(3);
          el('#sp-tot',ov).value = fmt.n(t,3);
          el('#sp-calc',ov).innerHTML = `Prix total = quantité × prix unitaire = <strong>${fmt.n(q)} kg × ${fmt.n(p,3)} = ${fmt.n(t,3)} TND</strong>.
            Ce montant n'est pas saisissable.`;
        };
        el('#sp-trp',ov).onchange = majMats;
        ['#sp-qte','#sp-pu'].forEach(s=> el(s,ov).oninput = maj);
        majMats(); maj();
        el('#sp-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.type==='number' ? (parseFloat(n.value)||0) : n.value.trim());
          if(!(d.qte>0)) return toast('Une erreur est survenue','La quantité doit être supérieure à zéro.','err');
          if(!(d.pu>0))  return toast('Une erreur est survenue','Le prix unitaire doit être supérieur à zéro.','err');
          d.total = +(d.qte*d.pu).toFixed(3);
          d.saison = 'Saison 2025/2026';
          if(r){ Store.update(coll, r, d, r.num); toast(titre+' modifié', `${r.num} — ${fmt.n(d.total,3)} TND.`); }
          else { Store.add(coll, d, d.num); toast(titre+' enregistré', `${d.num} — ${fmt.n(d.qte)} kg pour ${fmt.n(d.total,3)} TND.`); }
          closeModal(); App.render();
        };
      }});
  }
};

const pageSousProduit = (coll, titre, etatRoute, unite) => () => {
  const f = Flt.get(coll, {client:'', etat:''});
  let rows = Store.filtrer(DB[coll], f);
  if(f.client) rows = rows.filter(r=>r.client===f.client);
  if(f.etat)   rows = rows.filter(r=>r.etat===f.etat);
  return pageHead(titre, "Enlèvements, quantités et montants — prix total calculé automatiquement",
    `<button class="btn btn-sm" data-go="${etatRoute}">${icon('chart')}État détaillé</button>
     <button class="btn btn-sm btn-primary" data-sp-add="${coll}">${icon('plus')}Ajouter ${titre}</button>`)
  + Flt.bar(coll, [
      {k:'client', l:'Client', type:'select', options:()=>DB.clients.map(c=>c.nom)},
      {k:'etat', l:'État', type:'select', options:['Livré','En attente','Annulé']}
    ])
  + dataTable(coll+'l', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'},
      {k:'client', t:'Client', render:r=>`<span class="strong">${r.client}</span>`},
      {k:'transporteur', t:'Transporteur'},
      {k:'matricule', t:'Matricule véhicule', render:r=>`<span class="mono">${r.matricule}</span>`},
      {k:'bl', t:'Bon de livraison', render:r=>`<span class="ref">${r.bl}</span>`},
      {k:'qte', t:'Quantité (kg)', r:true, render:r=>`<span class="strong">${fmt.n(r.qte)}</span>`},
      {k:'pu', t:'Prix unitaire', r:true, render:r=>fmt.n(r.pu,3)},
      {k:'total', t:'Prix total', r:true, render:r=>`<span class="strong">${fmt.n(r.total,3)} TND</span>`},
      {k:'remarque', t:'Remarque', render:r=>r.remarque||'<span class="muted">—</span>'},
      {k:'etat', t:'État', render:r=>`<span class="badge ${r.etat==='Livré'?'ok':r.etat==='Annulé'?'danger':'warn'}">${r.etat}</span>`},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="voir">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Changer l'état" data-do="etat">${icon('check-circle')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], rows, {ph:"Rechercher…", per:10,
        onRow:r=>CRUD.view(coll, r),
        rowAction:(a,r)=>{
          if(a==='voir') CRUD.view(coll, r);
          if(a==='mod')  SousProduit.form(coll, titre, r);
          if(a==='etat') formModal({ title:"Changer l'état — "+r.num, okLabel:'Appliquer',
            fields:[{k:'etat', l:'État', type:'select', options:['Livré','En attente','Annulé'], def:r.etat}],
            onSave:d=>{ Store.update(coll, r, d, r.num); toast('État modifié', `${r.num} est désormais « ${d.etat} ».`); App.render(); }});
          if(a==='sup')  confirmer('Supprimer cet enlèvement ?', `<strong>${r.num}</strong> — ${fmt.n(r.qte)} kg pour ${fmt.n(r.total,3)} TND.`,
            ()=>{ Store.remove(coll, r); toast('Enlèvement supprimé',''); App.render(); }, 'Supprimer');
        }})
  + totaux([["Bons", String(rows.length)], ["Quantité totale", fmt.n(rows.reduce((s,r)=>s+r.qte,0))+" kg"],
            ["Montant total", fmt.n(rows.reduce((s,r)=>s+r.total,0),3)+" TND"]]);
};
PAGES.grignons = pageSousProduit('grignons', 'Grignons', 'etat-grignons', 'kg');
PAGES.noyaux   = pageSousProduit('noyaux',   'Noyaux',   'etat-noyaux',   'kg');

/* ==========================  8. PIÈCES DE RÈGLEMENT  ===================== */
const Pieces = {
  modes: ['Espèce','Virement','Chèque','Autre'],
  html(lignes){
    return `<div class="card" style="margin-top:16px">
      <div class="card-head"><div><div class="card-title">Pièces de règlement</div>
        <div class="card-sub">Un paiement peut être réglé en plusieurs tranches et plusieurs modes</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm" type="button" id="pc-add">${icon('plus')}Ajouter une ligne de paiement</button></div>
      <div class="card-body flush">
        <div class="table-wrap"><table class="tbl" id="pc-table">
          <thead><tr><th>Mode de règlement</th><th class="r">Montant</th><th>Remarque</th><th></th></tr></thead>
          <tbody>${(lignes||[]).map(l=>Pieces.ligne(l)).join('')}</tbody>
        </table></div>
      </div>
      <div class="totaux-bar" id="pc-tot" style="margin:0;border:0;border-top:1px solid var(--line-2);border-radius:0"></div>
    </div>`;
  },
  ligne(l){
    l = l || {};
    return `<tr class="pc-l">
      <td><select class="input select" data-pc="mode">${Pieces.modes.map(m=>`<option ${l.mode===m?'selected':''}>${m}</option>`).join('')}</select></td>
      <td class="r"><input class="input" type="number" step="0.001" data-pc="montant" value="${l.montant||0}" style="text-align:right"></td>
      <td><input class="input" data-pc="remarque" value="${l.remarque||''}" placeholder="Référence, n° de chèque…"></td>
      <td class="r"><button class="icon-btn tip" type="button" data-tip="Retirer" data-pc-del>${icon('trash')}</button></td>
    </tr>`;
  },
  lire(ov){
    return els('.pc-l', ov).map(tr=>({
      mode: tr.querySelector('[data-pc="mode"]').value,
      montant: parseFloat(tr.querySelector('[data-pc="montant"]').value) || 0,
      remarque: tr.querySelector('[data-pc="remarque"]').value.trim()
    })).filter(l=>l.montant > 0);
  },
  bind(ov, totalFn){
    const maj = ()=>{
      const total = totalFn(), paye = Pieces.lire(ov).reduce((s,l)=>s+l.montant,0);
      const reste = +(total - paye).toFixed(3);
      el('#pc-tot',ov).innerHTML = `
        <div><span>Montant de l'opération</span><strong>${fmt.n(total,3)} TND</strong></div>
        <div><span>Total payé</span><strong style="color:var(--ok)">${fmt.n(paye,3)} TND</strong></div>
        <div><span>Reste à payer</span><strong style="color:${reste<-0.001?'var(--danger)':reste>0.001?'var(--warn)':'var(--ok)'}">${fmt.n(reste,3)} TND</strong></div>
        ${reste < -0.001 ? `<div style="border-color:var(--danger)"><span>Contrôle</span>
          <strong style="color:var(--danger);font-size:13px">Les paiements dépassent le montant de ${fmt.n(-reste,3)} TND</strong></div>`:''}`;
    };
    const rebind = ()=>{
      els('[data-pc]', ov).forEach(i=>{ i.oninput = maj; i.onchange = maj; });
      els('[data-pc-del]', ov).forEach(b=> b.onclick = ()=>{ b.closest('tr').remove(); maj(); });
    };
    const add = el('#pc-add', ov);
    if(add) add.onclick = ()=>{
      const tb = ov.querySelector('#pc-table tbody');
      tb.insertAdjacentHTML('beforeend', Pieces.ligne({ montant:0 }));
      rebind(); maj();
    };
    rebind(); maj();
    return { maj, total: ()=>Pieces.lire(ov).reduce((s,l)=>s+l.montant,0) };
  }
};

/* ==========================  9. DÉPENSES  ================================ */
/* Les colonnes num, designation, fournisseur et pieces sont définies dans
   js/data4.js afin d'exister également dans la base de données. */

const Depense = {
  form(r){
    modal({ size:'wide', title: r ? 'Modifier la dépense '+r.num : 'Ajouter une dépense',
      body:`<div class="grid g-3">
          <div class="field"><label>Numéro</label><input class="input" data-f="num" value="${r?r.num:'DEP-2026-'+String(DB.depenses.length+121).padStart(4,'0')}" readonly></div>
          <div class="field"><label>Date *</label><input class="input" data-f="date" value="${r?r.date:Store.dateFR()}"></div>
          <div class="field"><label>Montant (TND) *</label><input class="input" type="number" step="0.001" data-f="montant" id="dp-mt" value="${r?r.montant:0}"></div>
          <div class="field span-2"><label>Fournisseur</label>
            <div class="avec-bouton">
              <select class="input select" data-f="fournisseur" id="dp-four">
                <option>—</option>
                ${DB.fournisseurs.map(x=>`<option ${r&&r.fournisseur===x.nom?'selected':''}>${x.nom}</option>`).join('')}
              </select>
              <button class="btn btn-sm" type="button" id="dp-add-four" title="Ajouter un fournisseur">${icon('plus')}</button>
            </div></div>
          <div class="field"><label>Catégorie</label><select class="input select" data-f="cat">
            ${['Électricité','Eau','Carburant','Transport','Maintenance','Salaires','Emballages','Fournitures','Services','Autres dépenses']
              .map(c=>`<option ${r&&r.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
          <div class="field span-3"><label>Désignation *</label><input class="input" data-f="designation" value="${r?r.designation||'':''}" placeholder="Objet de la dépense"></div>
        </div>
        ${Pieces.html(r ? r.pieces : [])}`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="dp-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        const p = Pieces.bind(ov, ()=> parseFloat(el('#dp-mt',ov).value)||0);
        el('#dp-mt',ov).oninput = p.maj;
        el('#dp-add-four',ov).onclick = ()=>{
          formModal({ title:'Ajouter un fournisseur', size:'slim', okLabel:'Créer',
            fields:[{k:'nom', l:'Raison sociale', req:true}, {k:'tel', l:'Téléphone', req:true},
                    {k:'typeF', l:'Type', type:'select', options:['Divers','Olive']}],
            onSave: d=>{
              const f = Object.assign({ code:'FRN-'+String(++Store.seq.FRN).padStart(3,'0'),
                numero:String(DB.fournisseurs.length+1).padStart(4,'0'), contact:d.nom, ville:'', identifiant:'',
                adresse:'', matricules:[], conditions:'Comptant', achats:0, encours:0, statut:'Actif' }, d);
              Store.add('fournisseurs', f);
              const sel = el('#dp-four',ov);
              sel.insertAdjacentHTML('beforeend', `<option selected>${f.nom}</option>`);
              sel.value = f.nom;
              toast('Fournisseur ajouté', `${f.nom} est sélectionné dans la dépense.`);
            }});
        };
        el('#dp-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.type==='number' ? (parseFloat(n.value)||0) : n.value.trim());
          if(!(d.montant>0))   return toast('Une erreur est survenue','Le montant doit être supérieur à zéro.','err');
          if(!d.designation)   return toast('Une erreur est survenue','La désignation est obligatoire.','err');
          const pieces = Pieces.lire(ov), paye = pieces.reduce((s,l)=>s+l.montant,0);
          if(paye > d.montant + 0.001)
            return toast('Paiements incohérents', `Le total des pièces (${fmt.n(paye,3)}) dépasse le montant de la dépense (${fmt.n(d.montant,3)}).`, 'err');
          d.pieces = pieces;
          d.paye = paye;
          d.tiers = d.fournisseur;
          d.mode = pieces[0] ? pieces[0].mode : 'Espèce';
          d.just = true;
          if(r){ Store.update('depenses', r, d, r.num); toast('Dépense modifiée', `${r.num} — ${fmt.n(d.montant,3)} TND.`); }
          else {
            Store.add('depenses', d, d.num);
            pieces.forEach(l=> Store.operation({ type:'Dépense', tiers:d.fournisseur||d.cat, montant:-l.montant,
              mode: l.mode==='Espèce'?'Espèces':l.mode, motif:d.designation+' ('+d.num+')' }));
            toast('Dépense enregistrée', `${d.num} — ${fmt.n(d.montant,3)} TND, ${fmt.n(paye,3)} TND réglés.`);
          }
          closeModal(); App.render();
        };
      }});
  }
};

PAGES.depenses = () => {
  const f = Flt.get('dep2', {fournisseur:'', cat:'', mode:''});
  let rows = DB.depenses.filter(d=>Store.dansIntervalle(d.date, f));
  if(f.fournisseur) rows = rows.filter(d=>d.fournisseur===f.fournisseur);
  if(f.cat)  rows = rows.filter(d=>d.cat===f.cat);
  if(f.mode) rows = rows.filter(d=>(d.pieces||[]).some(p=>p.mode===f.mode));

  return pageHead("Dépenses","Charges d'exploitation et pièces de règlement associées",
    `<button class="btn btn-sm btn-primary" id="dep-add">${icon('plus')}Ajouter une dépense</button>`)
  + Flt.bar('dep2', [
      {k:'fournisseur', l:'Fournisseur', type:'select', options:()=>DB.fournisseurs.map(x=>x.nom)},
      {k:'cat', l:'Catégorie', type:'select', options:()=>[...new Set(DB.depenses.map(d=>d.cat))]},
      {k:'mode', l:'Mode de règlement', type:'select', options:Pieces.modes}
    ])
  + dataTable('depl', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'},
      {k:'designation', t:'Désignation', render:r=>`<div class="strong">${r.designation}</div><div class="cell-sub">${r.cat}</div>`},
      {k:'fournisseur', t:'Fournisseur', render:r=>r.fournisseur&&r.fournisseur!=='—'?r.fournisseur:'<span class="muted">—</span>'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)}</span>`},
      {k:'paye', t:'Payé', r:true, render:r=>fmt.n(r.paye ?? (r.pieces||[]).reduce((s,p)=>s+p.montant,0),3)},
      {k:'pieces', t:'Pièces', render:r=>(r.pieces||[]).length
        ? r.pieces.map(p=>`<span class="badge neutral no-dot" style="margin:1px">${p.mode} ${fmt.n(p.montant,3)}</span>`).join(' ')
        : '<span class="muted">—</span>'},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="voir">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], rows, {ph:"Rechercher une dépense, un fournisseur…", per:10,
        onRow:r=>CRUD.view('depenses', r),
        rowAction:(a,r)=>{
          if(a==='voir') CRUD.view('depenses', r);
          if(a==='mod')  Depense.form(r);
          if(a==='sup')  confirmer('Supprimer cette dépense ?', `<strong>${r.num}</strong> — ${fmt.n(r.montant,3)} TND.`,
            ()=>{ Store.remove('depenses', r); toast('Dépense supprimée',''); App.render(); }, 'Supprimer');
        }})
  + totaux([["Dépenses", String(rows.length)],
            ["Montant total", fmt.n(rows.reduce((s,r)=>s+r.montant,0),3)+" TND"],
            ["Total réglé", fmt.n(rows.reduce((s,r)=>s+(r.paye ?? 0),0),3)+" TND"],
            ["Reste à payer", fmt.n(rows.reduce((s,r)=>s+(r.montant-(r.paye??0)),0),3)+" TND"]]);
};

PAGES['pieces-reglement'] = () => {
  const f = Flt.get('pcr', {mode:'', origine:''});
  const lignes = [];
  DB.depenses.forEach(d=>(d.pieces||[]).forEach(p=>lignes.push({
    date:d.date, origine:'Dépense', doc:d.num, tiers:d.fournisseur||'—', mode:p.mode, montant:p.montant, remarque:p.remarque })));
  DB.factures.forEach(x=>(x.tranches||[]).forEach(t=>lignes.push({
    date:t.date, origine:'Facture client', doc:x.num, tiers:x.client, mode:t.mode, montant:t.montant, remarque:t.ref })));
  DB.bonsReception.forEach(b=>(b.reglements||[]).forEach(rg=>lignes.push({
    date:b.date, origine:'Bon de réception', doc:b.num, tiers:b.tiers, mode:rg.mode, montant:rg.montant, remarque:'' })));
  let rows = lignes.filter(l=>Store.dansIntervalle(l.date, f));
  if(f.mode)    rows = rows.filter(l=>l.mode===f.mode || (f.mode==='Espèce' && l.mode==='Espèces'));
  if(f.origine) rows = rows.filter(l=>l.origine===f.origine);

  return pageHead("Pièces de règlement","Toutes les tranches de paiement, quel que soit le document d'origine")
  + Flt.bar('pcr', [
      {k:'mode', l:'Mode de règlement', type:'select', options:Pieces.modes.concat('Espèces')},
      {k:'origine', l:'Origine', type:'select', options:['Dépense','Facture client','Bon de réception']}
    ])
  + dataTable('pcrl', [
      {k:'date', t:'Date'},
      {k:'origine', t:'Origine', render:r=>`<span class="badge neutral no-dot">${r.origine}</span>`},
      {k:'doc', t:'Document', render:r=>`<span class="ref">${r.doc}</span>`},
      {k:'tiers', t:'Tiers'},
      {k:'mode', t:'Mode de règlement'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'remarque', t:'Remarque', render:r=>r.remarque||'<span class="muted">—</span>'}
    ], rows, {ph:"Rechercher…", per:12})
  + totaux([["Pièces", String(rows.length)],
            ["Total", fmt.n(rows.reduce((s,r)=>s+r.montant,0),3)+" TND"],
            ["Espèces", fmt.n(rows.filter(r=>r.mode.startsWith('Espèce')).reduce((s,r)=>s+r.montant,0),3)+" TND"],
            ["Autres modes", fmt.n(rows.filter(r=>!r.mode.startsWith('Espèce')).reduce((s,r)=>s+r.montant,0),3)+" TND"]]);
};

/* ==========================  10. FILTRES FINANCIERS  ===================== */
const filtreMontant = (rows, f, champ)=>{
  if(f.montantMin) rows = rows.filter(r=>(r[champ]||0) >= parseFloat(f.montantMin));
  if(f.montantMax) rows = rows.filter(r=>(r[champ]||0) <= parseFloat(f.montantMax));
  return rows;
};

PAGES['accomptes-fournisseurs'] = () => {
  const f = Flt.get('acf2', {fournisseur:'', statut:'', montantMin:'', montantMax:''});
  let rows = DB.accomptesFournisseurs.filter(a=>Store.dansIntervalle(a.date, f));
  if(f.fournisseur) rows = rows.filter(a=>a.fournisseur===f.fournisseur);
  if(f.statut)      rows = rows.filter(a=>a.statut===f.statut);
  rows = filtreMontant(rows, f, 'montant');

  return pageHead("Accomptes fournisseurs","Avances versées aux fournisseurs avant facturation",
    `<button class="btn btn-sm btn-primary" data-crud="add:accomptesFournisseurs">${icon('plus')}Ajouter un accompte</button>`)
  + Flt.bar('acf2', [
      {k:'fournisseur', l:'Fournisseur', type:'select', options:()=>[...new Set(DB.accomptesFournisseurs.map(a=>a.fournisseur))]},
      {k:'montantMin', l:'Montant minimum', ph:'0'},
      {k:'montantMax', l:'Montant maximum', ph:'100000'},
      {k:'statut', l:'Statut', type:'select', options:['Affecté','Non affecté']}
    ])
  + dataTable('acf2l', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'fournisseur', t:'Fournisseur', render:r=>`<span class="strong">${r.fournisseur}</span>`},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'mode', t:'Mode de règlement'},
      {k:'ref', t:'Référence', render:r=>`<span class="mono">${r.ref||'—'}</span>`},
      {k:'affecte', t:'Affecté à', render:r=>r.affecte&&r.affecte!=='—'?`<span class="ref">${r.affecte}</span>`:'<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>`<span class="badge ${r.statut==='Affecté'?'ok':'warn'}">${r.statut}</span>`},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], rows, {ph:"Rechercher un accompte…", entity:'accomptesFournisseurs', per:10})
  + totaux([["Accomptes", String(rows.length)], ["Total versé", fmt.n(rows.reduce((s,r)=>s+r.montant,0),3)+" TND"],
            ["Non affectés", fmt.n(rows.filter(r=>r.statut!=='Affecté').reduce((s,r)=>s+r.montant,0),3)+" TND"]]);
};

PAGES['reglements-fournisseurs'] = () => {
  const f = Flt.get('rgf2', {tiers:'', mode:'', montantMin:'', montantMax:''});
  let rows = DB.operations.filter(o=>['Règlement fournisseur','Accompte fournisseur'].includes(o.type)
    && Store.dansIntervalle(o.date, f));
  if(f.tiers) rows = rows.filter(o=>o.tiers===f.tiers);
  if(f.mode)  rows = rows.filter(o=>o.mode===f.mode);
  rows = rows.map(o=>({...o, abs:Math.abs(o.montant)}));
  rows = filtreMontant(rows, f, 'abs');

  return pageHead("Règlements fournisseurs","Décaissements rattachés aux achats et aux accomptes",
    `<button class="btn btn-sm" data-go="factures-fournisseurs">${icon('receipt')}Factures fournisseurs</button>
     <button class="btn btn-sm btn-primary" data-crud="add:operations">${icon('plus')}Nouveau règlement</button>`)
  + Flt.bar('rgf2', [
      {k:'tiers', l:'Fournisseur', type:'select', options:()=>[...new Set(DB.operations.filter(o=>o.montant<0).map(o=>o.tiers))]},
      {k:'mode', l:'Mode de règlement', type:'select', options:()=>DB.modesPaiement},
      {k:'montantMin', l:'Montant minimum', ph:'0'},
      {k:'montantMax', l:'Montant maximum', ph:'100000'}
    ])
  + dataTable('rgf2l', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'tiers', t:'Fournisseur', render:r=>`<span class="strong">${r.tiers}</span>`},
      {k:'type', t:'Nature'}, {k:'motif', t:'Document'},
      {k:'mode', t:'Mode de règlement'}, {k:'journal', t:'Journal'},
      {k:'abs', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:var(--danger)">${fmt.n(r.abs,3)} TND</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Validé'?'Validée':r.statut)}
    ], rows, {ph:"Rechercher un règlement…", per:10})
  + totaux([["Règlements", String(rows.length)], ["Total décaissé", fmt.n(rows.reduce((s,r)=>s+r.abs,0),3)+" TND"],
            ["Fournisseurs concernés", String(new Set(rows.map(r=>r.tiers)).size)]]);
};

PAGES.paiements = () => {
  const f = Flt.get('rgc2', {tiers:'', mode:'', statut:'', montantMin:'', montantMax:''});
  let fac = DB.factures.filter(x=>Store.dansIntervalle(x.date, f));
  if(f.tiers)  fac = fac.filter(x=>x.client===f.tiers);
  if(f.statut) fac = fac.filter(x=>Store.statutFacture(x)===f.statut);
  if(f.mode)   fac = fac.filter(x=>(x.tranches||[]).some(t=>t.mode===f.mode));
  fac = filtreMontant(fac, f, 'ttc');

  return pageHead("Règlements clients","Encaissements : paiement unique, mixte ou par tranches",
    `<button class="btn btn-sm" data-go="caisse-cheques">${icon('cheque')}Suivi des chèques</button>
     <button class="btn btn-sm btn-primary" id="pay-new">${icon('coins')}Enregistrer un paiement</button>`)
  + Flt.bar('rgc2', [
      {k:'tiers', l:'Client', type:'select', options:()=>DB.clients.map(c=>c.nom)},
      {k:'mode', l:'Mode de règlement', type:'select', options:()=>DB.modesPaiement},
      {k:'montantMin', l:'Montant minimum', ph:'0'},
      {k:'statut', l:'Statut', type:'select', options:['Payée','Partiellement payée','En attente','En retard']}
    ])
  + dataTable('rgc2l', [
      {k:'num', t:'Facture', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'client', t:'Client'}, {k:'echeance', t:'Échéance'},
      {k:'ttc', t:'Montant total', r:true, render:r=>fmt.n(r.ttc,3)},
      {k:'paye', t:'Montant payé', r:true, render:r=>`<span style="color:var(--ok);font-weight:600">${fmt.n(r.paye,3)}</span>`},
      {k:'reste', t:'Reste à payer', r:true, render:r=>{const v=Store.reste(r);
        return `<span style="font-weight:600;color:${v?'var(--warn)':'var(--ink-3)'}">${fmt.n(v,3)}</span>`;}},
      {k:'avancement', t:'Avancement', render:r=>`<div class="progress" style="width:110px"><i style="width:${(r.paye/r.ttc*100).toFixed(0)}%"></i></div>
        <div class="cell-sub">${(r.paye/r.ttc*100).toFixed(0)} % · ${(r.tranches||[]).length} tranche(s)</div>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(Store.statutFacture(r))},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Encaisser" data-enc>${icon('coins')}</button>
        <button class="icon-btn tip" data-tip="Échéancier" data-ech>${icon('calendar')}</button>
        <button class="icon-btn tip" data-tip="Imprimer un reçu" data-rec>${icon('print')}</button></div>`}
    ], DB.factures.filter(x=>fac.includes(x)), {ph:"Rechercher une facture, un client…", per:10, onRow:x=>Echeancier.ouvrir(x)})
  + totaux([["Factures", String(fac.length)], ["Total facturé", fmt.n(fac.reduce((s,x)=>s+x.ttc,0),3)+" TND"],
            ["Total encaissé", fmt.n(fac.reduce((s,x)=>s+x.paye,0),3)+" TND"],
            ["Reste à recouvrer", fmt.n(fac.reduce((s,x)=>s+Store.reste(x),0),3)+" TND"]]);
};

PAGES['reglement-personnel'] = () => {
  const f = Flt.get('rgp3', {personnel:'', mode:'', statut:'', montantMin:''});
  let rows = DB.reglementsPeriode.filter(r=>Store.dansIntervalle(r.dateReglement, f));
  if(f.personnel) rows = rows.filter(r=>r.personnel===f.personnel);
  if(f.mode)      rows = rows.filter(r=>r.mode===f.mode);
  if(f.statut)    rows = rows.filter(r=>r.statut===f.statut);
  rows = filtreMontant(rows, f, 'montant');

  return pageHead("Règlements personnel","Salaires réglés sur une période de présence",
    `<button class="btn btn-sm" data-go="historique-reglement-personnel">${icon('history')}Historique</button>
     <button class="btn btn-sm btn-primary" id="rgp-add">${icon('plus')}Ajouter un règlement</button>`)
  + Flt.bar('rgp3', [
      {k:'personnel', l:'Personnel', type:'select', options:()=>DB.employes.map(e=>e.nom)},
      {k:'mode', l:'Mode de règlement', type:'select', options:()=>DB.modesPaiement},
      {k:'montantMin', l:'Montant minimum', ph:'0'},
      {k:'statut', l:'Statut', type:'select', options:['Payé','En attente']}
    ])
  + dataTable('rgp3l', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'dateReglement', t:'Date'},
      {k:'personnel', t:'Personnel', render:r=>`<div class="strong">${r.personnel}</div><div class="cell-sub">${r.mat}</div>`},
      {k:'periode', t:'Période', render:r=>`${r.dateDe} → ${r.jusqua}`},
      {k:'base', t:'Base', r:true, render:r=>r.heures ? fmt.n(r.heures,1)+' h' : fmt.n(r.jours)+' j'},
      {k:'mode', t:'Mode'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Payé'?'Payée':r.statut)},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Imprimer" data-do="print">${icon('print')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], rows, {ph:"Rechercher…", per:10,
        onRow:r=>ReglementPersonnel.form(r),
        rowAction:(a,r)=>{
          if(a==='mod') ReglementPersonnel.form(r);
          if(a==='sup') confirmer('Supprimer ce règlement ?', `<strong>${r.num}</strong> — ${r.personnel}, ${fmt.n(r.montant,3)} TND.`,
            ()=>{ Store.remove('reglementsPeriode', r); toast('Règlement supprimé',''); App.render(); }, 'Supprimer');
        }})
  + totaux([["Règlements", String(rows.length)],
            ["Total payé", fmt.n(rows.filter(r=>r.statut==='Payé').reduce((s,r)=>s+r.montant,0),3)+" TND"],
            ["En attente", fmt.n(rows.filter(r=>r.statut!=='Payé').reduce((s,r)=>s+r.montant,0),3)+" TND"]]);
};

/* ==========================  11. LIAISONS DES NOUVEAUX BOUTONS  ========== */
const bindV2 = App.bindGlobal.bind(App);
App.bindGlobal = function(root){
  bindV2(root);
  root = root || document;
  const b1 = el('#pt-open', root);  if(b1) b1.onclick = ()=> Pointage.ouvrir();
  const b2 = el('#dep-add', root);  if(b2) b2.onclick = ()=> Depense.form();
  els('[data-sp-add]', root).forEach(b=> b.onclick = ()=>
    SousProduit.form(b.dataset.spAdd, b.dataset.spAdd==='grignons'?'Grignons':'Noyaux'));
  /* Convertisseur d'unités */
  const q = el('#cv-q', root);
  if(q){
    const maj = ()=>{
      const v = Store.convertir(parseFloat(q.value)||0, el('#cv-de',root).value, el('#cv-vers',root).value);
      el('#cv-res',root).value = v === null ? 'Aucune règle enregistrée' : fmt.n(v,3);
    };
    q.oninput = maj; el('#cv-de',root).onchange = maj; el('#cv-vers',root).onchange = maj; maj();
  }
};
