/* ==========================================================================
   OLIVERA ERP — Paramétrage et Achats (modèle BR / BP / BEH)
   ========================================================================== */

/* ------------------------------ Filtres communs ------------------------- */
const Flt = {
  s:{},
  get(id, def){ if(!this.s[id]) this.s[id] = Object.assign(Store.periodeDefaut(), def||{}); return this.s[id]; },
  reset(id){ delete this.s[id]; },
  bar(id, champs=[], opts={}){
    const f = this.get(id, opts.def);
    const ctrl = c=>{
      const v = f[c.k] ?? '';
      if(c.type==='select'){
        const o = typeof c.options==='function' ? c.options() : c.options;
        return `<select class="input select" data-flt="${id}:${c.k}">
          <option value="">${c.l} : tous</option>
          ${o.map(x=>`<option ${String(x)===String(v)?'selected':''}>${x}</option>`).join('')}</select>`;
      }
      if(c.type==='check')
        return `<label class="chip ${v?'on':''}" data-flt-check="${id}:${c.k}">${icon(v?'check':'filter')}${c.l}</label>`;
      return `<div class="field"><label>${c.l}</label><input class="input" data-flt="${id}:${c.k}" value="${v}" placeholder="${c.ph||'JJ/MM/AAAA'}"></div>`;
    };
    const base = opts.sansPeriode ? [] : [
      {k:'du', l:'Date début'}, {k:'au', l:'Date fin'},
      {k:'saison', l:'Saison', type:'select', options:()=>['Toutes', ...DB.saisons.map(s=>s.libelle)]}
    ];
    const tous = base.concat(champs);
    return `<section class="card filtre-bar">
      <div class="filtre-grid">
        ${tous.map(c=> c.type==='select'||c.type==='check'
            ? `<div class="field"><label>${c.type==='check'?'&nbsp;':c.l}</label>${ctrl(c)}</div>`
            : ctrl(c)).join('')}
      </div>
      <div class="filtre-actions">
        <button class="btn btn-sm btn-primary" data-flt-search>${icon('search')}Rechercher</button>
        <button class="btn btn-sm" data-flt-reset="${id}">${icon('x')}Réinitialiser</button>
        <div class="spacer"></div>
        ${opts.actions||''}
        <button class="btn btn-sm" data-act-export>${icon('download')}Excel</button>
        <button class="btn btn-sm" data-act-pdf>${icon('file')}PDF</button>
        <button class="btn btn-sm" data-act-print>${icon('print')}Imprimer</button>
      </div>
    </section>`;
  }
};

/* Ligne de totaux sous un tableau */
function totaux(items){
  return `<div class="totaux-bar">${items.map(([l,v])=>`<div><span>${l}</span><strong>${v}</strong></div>`).join('')}</div>`;
}

/* Répéteur de lignes (matricules, lignes de document…) */
const Repeater = {
  html(id, lignes, champs, titre, boutonLabel){
    return `<div class="repeater" data-rep="${id}">
      <div class="rep-head"><div class="card-title">${titre}</div><div class="spacer"></div>
        <button class="btn btn-sm" data-rep-add="${id}">${icon('plus')}${boutonLabel}</button></div>
      <div class="rep-body">${lignes.map((l,i)=>`
        <div class="rep-line" data-i="${i}">
          ${champs.map(c=>`<div class="field"><label>${c.l}</label>
            ${c.type==='select'
              ? `<select class="input select" data-rl="${c.k}">${(typeof c.options==='function'?c.options():c.options)
                  .map(o=>`<option ${String(o)===String(l[c.k])?'selected':''}>${o}</option>`).join('')}</select>`
              : `<input class="input" type="${c.type||'text'}" ${c.step?`step="${c.step}"`:''} data-rl="${c.k}" value="${l[c.k]??''}" placeholder="${c.ph||''}">`}
          </div>`).join('')}
          <button class="icon-btn tip" data-tip="Retirer" data-rep-del="${i}">${icon('trash')}</button>
        </div>`).join('') || `<div class="tiny muted" style="padding:8px 2px">Aucune ligne. Utilisez « ${boutonLabel} ».</div>`}
      </div></div>`;
  },
  rebind(ov){ if(ov) App.bindGlobal(ov); },
  lire(ov, id, champs){
    return els(`[data-rep="${id}"] .rep-line`, ov).map(l=>{
      const o = {};
      champs.forEach(c=>{
        const n = l.querySelector(`[data-rl="${c.k}"]`);
        o[c.k] = c.type==='number' ? (parseFloat(n.value)||0) : n.value;
      });
      return o;
    });
  }
};

/* ==========================  PARAMÉTRAGE — PERSONNEL  ==================== */
PAGES.personnel = () => pageHead("Personnel","Fiches du personnel permanent et saisonnier",
  `<button class="btn btn-sm" data-go="presence">${icon('clock')}Fiche présence</button>
   <button class="btn btn-sm btn-primary" data-crud="add:employes">${icon('plus')}Ajouter</button>`)
  + kpiRow([
      ["Effectif", String(DB.employes.length), DB.employes.filter(e=>e.statut==='Saisonnier').length+" saisonniers"],
      ["Payés au jour", String(DB.employes.filter(e=>e.typeRem==='Jour').length), "rémunération journalière"],
      ["Payés à l'heure", String(DB.employes.filter(e=>e.typeRem==='Heure').length), "rémunération horaire"],
      ["Masse salariale du jour", fmt.n(DB.presences.filter(p=>p.date===Store.dateFR()).reduce((s,p)=>s+p.total,0),3)+" TND", "d'après la fiche de présence"]
    ])
  + dataTable('perso', [
      {k:'nom', t:'Nom & Prénom / الاسم و اللقب', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.poste} · ${r.mat}</div>`},
      {k:'tel1', t:'Téléphone 1 / الهاتف 1', render:r=>r.tel1||'<span class="muted">—</span>'},
      {k:'tel2', t:'Téléphone 2 / الهاتف 2', render:r=>r.tel2||'<span class="muted">—</span>'},
      {k:'email', t:'Email / البريد الإلكتروني', render:r=>r.email||'<span class="muted">—</span>'},
      {k:'typeRem', t:'Type / النوع', render:r=>`<span class="badge ${r.typeRem==='Jour'?'info':'gold'} no-dot">${r.typeRem}</span>`},
      {k:'prix', t:'Prix H/J / السعر', r:true, render:r=>`<span class="strong">${fmt.n(r.prix,3)}</span> <span class="muted tiny">TND/${r.typeRem==='Jour'?'jour':'heure'}</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.employes, {ph:"Rechercher un nom, un téléphone, un email…", entity:'employes', per:10,
        filters:[{k:'typeRem', t:'Type', options:['Jour','Heure']},
                 {k:'dept', t:'Département', options:()=>[...new Set(DB.employes.map(e=>e.dept))]},
                 {k:'statut', t:'Statut', options:['Permanent','Saisonnier','Inactif']}]});

PAGES.presence = () => {
  const f = Flt.get('pres', {personnel:'', typeRem:'', etat:''});
  let rows = Store.filtrer(DB.presences, {du:f.du, au:f.au, saison:null});
  if(f.personnel) rows = rows.filter(p=>p.nom===f.personnel);
  if(f.typeRem)   rows = rows.filter(p=>p.typeRem===f.typeRem);
  if(f.etat)      rows = rows.filter(p=>p.statut===f.etat);
  const th = rows.reduce((s,p)=>s+p.heures,0), tj = rows.reduce((s,p)=>s+p.jours,0), tt = rows.reduce((s,p)=>s+p.total,0);

  return pageHead("Fiche présence","Pointage du personnel et calcul automatique de la rémunération",
    `<button class="btn btn-sm btn-primary" id="pres-add">${icon('plus')}Enregistrer une présence</button>`)
  + Flt.bar('pres', [
      {k:'personnel', l:'Personnel', type:'select', options:()=>DB.employes.map(e=>e.nom+' '+(e.prenom||''))},
      {k:'typeRem', l:'Type', type:'select', options:['Jour','Heure']},
      {k:'etat', l:'État présence', type:'select', options:['Présent','Absent','Congé','Repos']}
    ], {sansPeriode:false})
  + dataTable('presl', [
      {k:'date', t:'Date / التاريخ'},
      {k:'nom', t:'Personnel / العامل', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.poste}</div>`},
      {k:'arrivee', t:'Heure entrée'}, {k:'depart', t:'Heure sortie'},
      {k:'heures', t:'Nb heures', r:true, render:r=>fmt.n(r.heures,1)},
      {k:'jours', t:'Nb jours', r:true},
      {k:'typeRem', t:'Type', render:r=>`<span class="badge ${r.typeRem==='Jour'?'info':'gold'} no-dot">${r.typeRem}</span>`},
      {k:'prix', t:'Prix', r:true, render:r=>fmt.n(r.prix,3)},
      {k:'total', t:'Total', r:true, render:r=>`<span class="strong">${fmt.n(r.total,3)} TND</span>`},
      {k:'statut', t:'État', render:r=>`<span class="badge ${r.statut==='Présent'?'ok':r.statut==='Absent'?'danger':'neutral'}">${r.statut}</span>`},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], rows, {ph:"Rechercher…", entity:'presences', per:10, noToolbar:false})
  + totaux([["Total heures", fmt.n(th,1)+" h"], ["Total jours", fmt.n(tj)],
            ["Nombre de pointages", String(rows.length)], ["Total à payer", fmt.n(tt,3)+" TND"]]);
};

/* ==========================  PARAMÉTRAGE — TIERS  ======================== */
PAGES.fournisseurs = () => pageHead("Fournisseurs / الفلاحون","Fournisseurs d'olives et fournisseurs divers",
  `<button class="btn btn-sm btn-primary" id="four-add">${icon('plus')}Ajouter</button>`)
  + kpiRow([
      ["Fournisseurs", String(DB.fournisseurs.length)],
      ["Type Olive", String(DB.fournisseurs.filter(f=>f.typeF==='Olive').length), "apporteurs d'olives"],
      ["Type Divers", String(DB.fournisseurs.filter(f=>f.typeF!=='Olive').length), "emballages, services, énergie"],
      ["Matricules enregistrés", String(DB.fournisseurs.reduce((s,f)=>s+(f.matricules||[]).length,0)), "véhicules déclarés"]
    ])
  + dataTable('fourn2', [
      {k:'numero', t:'Numéro / الرقم', render:r=>`<span class="ref">${r.numero}</span>`},
      {k:'nom', t:'Raison sociale / الوصف', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'adresse', t:'Adresse / العنوان', render:r=>r.adresse||'<span class="muted">—</span>'},
      {k:'tel', t:'Téléphone / الهاتف'},
      {k:'identifiant', t:'Identifiant unique / بطاقة الهوية', render:r=>`<span class="mono">${r.identifiant||'—'}</span>`},
      {k:'typeF', t:'Type / النوع', render:r=>`<span class="badge ${r.typeF==='Olive'?'ok':'neutral'} no-dot">${r.typeF}</span>`},
      {k:'matricules', t:'Matricules', render:r=>(r.matricules||[]).length
        ? r.matricules.map(m=>`<span class="badge neutral no-dot" style="margin:1px">${m}</span>`).join(' ')
        : '<span class="muted">—</span>'},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="voir">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="État fournisseur" data-do="etat">${icon('file')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], DB.fournisseurs, {ph:"Rechercher un fournisseur, un matricule…", per:10,
        filters:[{k:'typeF', t:'Type', options:['Olive','Divers']},
                 {k:'ville', t:'Ville', options:()=>[...new Set(DB.fournisseurs.map(f=>f.ville))]}],
        onRow:f=>Tiers.fournisseur(f, 'voir'),
        rowAction:(a,r)=>{
          if(a==='voir') Tiers.fournisseur(r,'voir');
          if(a==='mod')  Tiers.fournisseur(r,'mod');
          if(a==='etat') App.go('etat-fournisseur', {tiers:r.nom});
          if(a==='sup')  confirmer('Supprimer ce fournisseur ?', `<strong>${r.nom}</strong> sera retiré du référentiel. Les documents déjà émis restent conservés.`,
            ()=>{ Store.remove('fournisseurs', r); toast('Fournisseur supprimé',''); App.render(); }, 'Supprimer');
        }});

PAGES.clients = () => pageHead("Clients / الزبائن","Clients de vente, de trituration, de grignons et clients passagers",
  `<button class="btn btn-sm btn-primary" id="cli-add">${icon('plus')}Ajouter</button>`)
  + kpiRow([
      ["Clients", String(DB.clients.length)],
      ["Trituration", String(DB.clients.filter(c=>c.typeC==='Trituration').length), "clients à façon"],
      ["Grignon", String(DB.clients.filter(c=>c.typeC==='Grignon').length), "acheteurs de sous-produits"],
      ["Soldes initiaux", fmt.n(DB.clients.reduce((s,c)=>s+(c.soldeInitial||0),0),3)+" TND", "repris dans les relevés"]
    ])
  + dataTable('cli2', [
      {k:'code', t:'Code / الرمز', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Raison sociale / الوصف', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'tel', t:'Téléphone / الهاتف'},
      {k:'mf', t:'Matricule fiscal', render:r=>`<span class="mono tiny">${r.mf||'—'}</span>`},
      {k:'typeC', t:'Type / النوع', render:r=>`<span class="badge ${r.typeC==='Trituration'?'gold':r.typeC==='Grignon'?'info':'neutral'} no-dot">${r.typeC}</span>`},
      {k:'soldeInitial', t:'Solde initial', r:true, render:r=>r.soldeInitial?fmt.n(r.soldeInitial,3):'<span class="muted">0,000</span>'},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="voir">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Relevé client" data-do="rel">${icon('file')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], DB.clients, {ph:"Rechercher un client, un code, un téléphone…", per:10,
        filters:[{k:'typeC', t:'Type', options:['Vente','Trituration','Grignon','Passager']},
                 {k:'ville', t:'Ville', options:()=>[...new Set(DB.clients.map(c=>c.ville))].filter(v=>v!=='—')}],
        onRow:c=>Tiers.client(c,'voir'),
        rowAction:(a,r)=>{
          if(a==='voir') Tiers.client(r,'voir');
          if(a==='mod')  Tiers.client(r,'mod');
          if(a==='rel')  App.go('releve-client', {tiers:r.nom});
          if(a==='sup')  confirmer('Supprimer ce client ?', `<strong>${r.nom}</strong> sera retiré du référentiel.`,
            ()=>{ Store.remove('clients', r); toast('Client supprimé',''); App.render(); }, 'Supprimer');
        }});

PAGES.transporteurs = () => pageHead("Transporteurs / الناقلون","Transporteurs et matricules de véhicules",
  `<button class="btn btn-sm btn-primary" id="trp-add">${icon('plus')}Ajouter</button>`)
  + dataTable('trp2', [
      {k:'nom', t:'Nom / الاسم', render:r=>`<span class="strong">${r.nom}</span>`},
      {k:'tel', t:'Téléphone / الهاتف'},
      {k:'adresse', t:'Adresse / العنوان', render:r=>r.adresse||'<span class="muted">—</span>'},
      {k:'cin', t:'CIN / بطاقة الهوية', render:r=>`<span class="mono">${r.cin||'—'}</span>`},
      {k:'matricules', t:'Matricules véhicules', render:r=>(r.matricules||[]).length
        ? r.matricules.map(m=>`<span class="badge neutral no-dot" style="margin:1px">${m}</span>`).join(' ')
        : '<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], DB.transporteurs, {noPager:true, ph:"Rechercher un transporteur, un matricule…",
        onRow:t=>Tiers.transporteur(t,'mod'),
        rowAction:(a,r)=>{
          if(a==='mod') Tiers.transporteur(r,'mod');
          if(a==='sup') confirmer('Supprimer ce transporteur ?', `<strong>${r.nom}</strong> et ses matricules seront retirés.`,
            ()=>{ Store.remove('transporteurs', r); toast('Transporteur supprimé',''); App.render(); }, 'Supprimer');
        }});

/* Formulaires des tiers, avec répéteur de matricules */
const Tiers = {
  fournisseur(f, mode){
    const lecture = mode==='voir';
    const mats = (f && f.matricules ? f.matricules : []).map(m=>({matricule:m}));
    const champsMat = [{k:'matricule', l:'Matricule véhicule', ph:'123 تونس'}];
    modal({ size:'wide', title: f ? (lecture?'Fiche fournisseur — ':'Modifier — ')+f.nom : 'Ajouter un fournisseur',
      body:`<div class="grid g-3">
          <div class="field"><label>Numéro / الرقم</label><input class="input" data-f="numero" value="${f?f.numero:String(DB.fournisseurs.length+1).padStart(4,'0')}" ${lecture?'readonly':''}></div>
          <div class="field span-2"><label>Raison sociale / الوصف *</label><input class="input" data-f="nom" value="${f?f.nom:''}" ${lecture?'readonly':''}></div>
          <div class="field span-2"><label>Adresse / العنوان</label><input class="input" data-f="adresse" value="${f?f.adresse||'':''}" ${lecture?'readonly':''}></div>
          <div class="field"><label>Identifiant unique / بطاقة الهوية</label><input class="input" data-f="identifiant" value="${f?f.identifiant||'':''}" ${lecture?'readonly':''}></div>
          <div class="field"><label>Téléphone / الهاتف *</label><input class="input" data-f="tel" value="${f?f.tel:''}" ${lecture?'readonly':''}></div>
          <div class="field"><label>Type / النوع</label><select class="input select" data-f="typeF" ${lecture?'disabled':''}>
            ${['Olive','Divers'].map(t=>`<option ${f&&f.typeF===t?'selected':''}>${t}</option>`).join('')}</select></div>
          <div class="field"><label>Ville</label><input class="input" data-f="ville" value="${f?f.ville||'':''}" ${lecture?'readonly':''}></div>
        </div>
        <div style="height:14px"></div>
        ${Repeater.html('mat', mats, champsMat, 'Matricules / أرقام السيارات', 'Ajouter matricule')}`,
      foot: lecture
        ? `<button class="btn" data-close>Fermer</button><button class="btn btn-primary" id="tf-edit">${icon('edit')}Modifier</button>`
        : `<button class="btn" data-close>Annuler</button><button class="btn btn-primary" id="tf-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        if(lecture){ el('#tf-edit',ov).onclick = ()=>{ closeModal(); Tiers.fournisseur(f,'mod'); }; return; }
        el('#tf-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.value.trim());
          if(!d.nom || !d.tel) return toast('Une erreur est survenue','La raison sociale et le téléphone sont obligatoires.','err');
          d.matricules = Repeater.lire(ov,'mat',champsMat).map(x=>x.matricule).filter(Boolean);
          if(f){ Store.update('fournisseurs', f, d); toast('Fournisseur modifié', f.nom+' a été mis à jour.'); }
          else { Store.add('fournisseurs', Object.assign({code:'FRN-'+String(++Store.seq.FRN).padStart(3,'0'),
                   contact:d.nom, conditions:'Comptant', achats:0, encours:0, statut:'Actif'}, d));
                 toast('Fournisseur ajouté avec succès', d.nom+' est disponible dans les bons de réception.'); }
          closeModal(); App.render();
        };
      }});
  },

  client(c, mode){
    const lecture = mode==='voir';
    modal({ title: c ? (lecture?'Fiche client — ':'Modifier — ')+c.nom : 'Ajouter un client',
      body:`<div class="grid g-2">
        <div class="field"><label>Code / الرمز</label><input class="input" data-f="code" value="${c?c.code:'CLI-'+String(++Store.seq.CLI).padStart(4,'0')}" ${c?'readonly':''}></div>
        <div class="field"><label>Raison sociale / الوصف *</label><input class="input" data-f="nom" value="${c?c.nom:''}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Matricule fiscal</label><input class="input" data-f="mf" value="${c?c.mf||'':''}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Téléphone / الهاتف *</label><input class="input" data-f="tel" value="${c?c.tel:''}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Type / النوع</label><select class="input select" data-f="typeC" ${lecture?'disabled':''}>
          ${['Vente','Trituration','Grignon','Passager'].map(t=>`<option ${c&&c.typeC===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Solde initial (TND)</label><input class="input" type="number" step="0.001" data-f="soldeInitial" value="${c?c.soldeInitial||0:0}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Ville</label><input class="input" data-f="ville" value="${c?c.ville||'':''}" ${lecture?'readonly':''}></div>
        <div class="field"><label>Limite de crédit (TND)</label><input class="input" type="number" data-f="limite" value="${c?c.limite||0:5000}" ${lecture?'readonly':''}></div>
      </div>
      <div class="note mt">Le solde initial est repris automatiquement en tête du relevé et de l'état des soldes clients.</div>`,
      foot: lecture
        ? `<button class="btn" data-close>Fermer</button><button class="btn btn-primary" id="tc-edit">${icon('edit')}Modifier</button>`
        : `<button class="btn" data-close>Annuler</button><button class="btn btn-primary" id="tc-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        if(lecture){ el('#tc-edit',ov).onclick = ()=>{ closeModal(); Tiers.client(c,'mod'); }; return; }
        el('#tc-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.type==='number' ? (parseFloat(n.value)||0) : n.value.trim());
          if(!d.nom || !d.tel) return toast('Une erreur est survenue','La raison sociale et le téléphone sont obligatoires.','err');
          if(c){ Store.update('clients', c, d); toast('Client modifié', c.nom+' a été mis à jour.'); }
          else { Store.add('clients', Object.assign({ca:0, encours:0, derniere:Store.dateFR(), statut:'Actif'}, d));
                 toast('Client ajouté avec succès', d.nom+' est disponible dans les ventes et les bons de réception.'); }
          closeModal(); App.render();
        };
      }});
  },

  transporteur(t, mode){
    const mats = (t && t.matricules ? t.matricules : []).map(m=>({matricule:m}));
    const champsMat = [{k:'matricule', l:'Matricule véhicule', ph:'123 تونس'}];
    modal({ size:'wide', title: t ? 'Modifier — '+t.nom : 'Ajouter un transporteur',
      body:`<div class="grid g-2">
          <div class="field"><label>Nom / الاسم *</label><input class="input" data-f="nom" value="${t?t.nom:''}"></div>
          <div class="field"><label>Téléphone / الهاتف *</label><input class="input" data-f="tel" value="${t?t.tel:''}"></div>
          <div class="field"><label>Adresse / العنوان</label><input class="input" data-f="adresse" value="${t?t.adresse||'':''}"></div>
          <div class="field"><label>CIN / بطاقة الهوية</label><input class="input" data-f="cin" value="${t?t.cin||'':''}"></div>
        </div>
        <div style="height:14px"></div>
        ${Repeater.html('matt', mats, champsMat, 'Matricules véhicules / أرقام السيارات', 'Ajouter matricule')}`,
      foot:`<button class="btn" data-close>Annuler</button><button class="btn btn-primary" id="tt-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        el('#tt-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.value.trim());
          if(!d.nom || !d.tel) return toast('Une erreur est survenue','Le nom et le téléphone sont obligatoires.','err');
          d.matricules = Repeater.lire(ov,'matt',champsMat).map(x=>x.matricule).filter(Boolean);
          if(t){ Store.update('transporteurs', t, d); toast('Transporteur modifié',''); }
          else { Store.add('transporteurs', Object.assign({code:'TRP-'+String(DB.transporteurs.length+1).padStart(2,'0'),
                   contact:d.nom, vehicule:d.matricules[0]||'—', tarif:0, solde:0, statut:'Actif'}, d));
                 toast('Transporteur ajouté avec succès',''); }
          closeModal(); App.render();
        };
      }});
  }
};

/* ==========================  PARAMÉTRAGE — UTILISATEURS  ================= */
const MODULES = ["PARAMETRAGE","ACHATS","PRODUCTION","STOCK","STATISTIQUES","FINANCE"];
PAGES.utilisateurs = () => pageHead("Utilisateurs / المستخدمون","Comptes de connexion et droits d'accès par module",
  `<button class="btn btn-sm btn-primary" id="usr-add">${icon('plus')}Ajouter</button>`)
  + `<div class="note" style="margin-bottom:16px">Utilisateur connecté : <strong>${DB.user.nom}</strong> —
      modules autorisés : ${Acces.droits().join(', ')}. Les modules non cochés disparaissent du menu et leurs écrans sont refusés.</div>`
  + dataTable('usr2', [
      {k:'login', t:'Login', render:r=>`<span class="ref">${r.login}</span>`},
      {k:'nom', t:'Personnel', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.role}</div>`},
      {k:'application', t:'Application'},
      {k:'droits', t:'Droits d\'accès', render:r=>MODULES.map(m=>
        `<span class="badge ${r.droits.includes(m)?'ok':'neutral'} no-dot" style="margin:1px;font-size:10px">${m}</span>`).join(' ')},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Modifier et droits" data-do="mod">${icon('key')}</button>
        <button class="icon-btn tip" data-tip="Se connecter avec ce compte" data-do="conn">${icon('logout')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], DB.utilisateurs, {noPager:true, ph:"Rechercher un utilisateur…",
        filters:[{k:'statut', t:'Statut', options:['Actif','Inactif']}],
        onRow:u=>Utilisateur.form(u),
        rowAction:(a,r)=>{
          if(a==='mod') Utilisateur.form(r);
          if(a==='conn') confirmer('Ouvrir une session ?', `Basculer sur le compte <strong>${r.login}</strong> (${r.role}) pour vérifier ses droits d'accès.`,
            ()=>Acces.connecter(r.login), 'Se connecter');
          if(a==='sup') confirmer('Supprimer ce compte ?', `<strong>${r.login}</strong> ne pourra plus se connecter.`,
            ()=>{ Store.remove('utilisateurs', r); toast('Utilisateur supprimé',''); App.render(); }, 'Supprimer');
        }});

const Utilisateur = {
  form(u){
    modal({ size:'wide', title: u ? 'Utilisateur — '+u.login : 'Ajouter un utilisateur',
      body:`<div class="grid g-2">
          <div class="field"><label>Login *</label><input class="input" data-f="login" value="${u?u.login:''}"></div>
          <div class="field"><label>Mot de passe</label><input class="input" type="password" data-f="mdp" value="${u?u.mdp:''}"></div>
          <div class="field"><label>Application</label><select class="input select" data-f="application">
            ${DB.societes.map(s=>`<option ${u&&u.application===s.nom?'selected':''}>${s.nom}</option>`).join('')}</select></div>
          <div class="field"><label>Personnel</label><select class="input select" data-f="nom">
            ${DB.employes.map(e=>`<option ${u&&u.nom===e.nom?'selected':''}>${e.nom}</option>`)
              .concat(u&&!DB.employes.some(e=>e.nom===u.nom)?`<option selected>${u.nom}</option>`:'').join('')}</select></div>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card-head"><div class="card-title">Droits d'accès / صلاحيات الدخول</div><div class="spacer"></div>
            <button class="btn btn-sm" id="dr-all">Tout cocher</button>
            <button class="btn btn-sm" id="dr-none">Tout décocher</button></div>
          <div class="card-body"><div class="grid g-3 gap-sm">
            ${MODULES.map(m=>`<label class="perm"><input type="checkbox" data-dr="${m}" ${u&&u.droits.includes(m)?'checked':''}> ${m}</label>`).join('')}
          </div></div>
        </div>`,
      foot:`<button class="btn" data-close>Annuler</button><button class="btn btn-primary" id="us-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        el('#dr-all',ov).onclick = ()=> els('[data-dr]',ov).forEach(c=>c.checked=true);
        el('#dr-none',ov).onclick = ()=> els('[data-dr]',ov).forEach(c=>c.checked=false);
        el('#us-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.value.trim());
          if(!d.login) return toast('Une erreur est survenue','Le login est obligatoire.','err');
          d.droits = els('[data-dr]',ov).filter(c=>c.checked).map(c=>c.dataset.dr);
          if(u){ Store.update('utilisateurs', u, d);
                 if(Acces.courant===u) toast('Droits mis à jour', 'Vos propres droits ont changé, le menu est actualisé.');
                 else toast('Utilisateur modifié', u.login+' a été mis à jour.'); }
          else { Store.add('utilisateurs', Object.assign({ role:'Opérateur', site:'Sousse', statut:'Actif',
                   derniere:'—', email:d.login+'@benchaaben.tn' }, d));
                 toast('Utilisateur ajouté avec succès', d.login+' peut désormais se connecter.'); }
          closeModal(); App.render();
        };
      }});
  }
};

/* ==========================  PARAMÉTRAGE — RÉFÉRENTIELS  ================= */
PAGES.organoleptiques = () => refPage("Organoleptiques / الخصائص الحسية",
  "Qualités proposées dans le bon d'entrée huile", 'organoleptiques', [
    {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
    {k:'libelle', t:'Désignation', render:r=>`<span class="strong">${r.libelle}</span>`},
    {k:'acidMax', t:'Acidité maximale', r:true, render:r=>r.acidMax<50?fmt.n(r.acidMax,2)+' %':'—'},
    {k:'ordre', t:'Ordre', r:true},
    {k:'actif', t:'Actif', render:r=>r.actif?'<span class="badge ok">Actif</span>':'<span class="badge neutral">Inactif</span>'}
  ], DB.organoleptiques);

PAGES.annees = () => PAGES.exercices();

/* ==========================  ACHATS — BONS DE RÉCEPTION  ================= */
PAGES['bons-reception'] = () => {
  const f = Flt.get('br', {nature:'', tiers:'', num:'', matricule:'', sansProd:false});
  let rows = Store.filtrer(DB.bonsReception, f);
  if(f.nature)     rows = rows.filter(b=>b.nature===f.nature);
  if(f.tiers)      rows = rows.filter(b=>b.tiers===f.tiers);
  if(f.num)        rows = rows.filter(b=>b.num.includes(f.num));
  if(f.matricule)  rows = rows.filter(b=>b.matricule===f.matricule);
  if(f.sansProd)   rows = rows.filter(b=>!b.bp);

  const totalQte = rows.reduce((s,b)=>s+Store.netBR(b),0);
  const totalMt  = rows.reduce((s,b)=>s+Store.montantBR(b),0);
  const totalPaye= rows.reduce((s,b)=>s+(b.paye||0),0);

  return pageHead("Bons de réception / مذكرات الاستلام","Document principal de réception : achat d'olives, achat sur base huile ou trituration",
    `<button class="btn btn-sm btn-primary" id="br-add">${icon('plus')}Ajouter</button>`)
  + Flt.bar('br', [
      {k:'nature', l:'Nature', type:'select', options:()=>DB.naturesBR},
      {k:'tiers', l:'Fournisseur / Client', type:'select', options:()=>[...new Set(DB.bonsReception.map(b=>b.tiers))]},
      {k:'num', l:'Numéro BR', ph:'000001'},
      {k:'matricule', l:'Matricule véhicule', type:'select', options:()=>[...new Set(DB.bonsReception.map(b=>b.matricule))]},
      {k:'sansProd', l:'Sans production', type:'check'}
    ])
  + dataTable('brl', [
      {k:'num', t:'Numéro / الرقم', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date / التاريخ', render:r=>`${r.date}<div class="cell-sub">${r.heure}</div>`},
      {k:'matricule', t:'Matricule / رقم السيارة', render:r=>`<span class="mono">${r.matricule}</span>`},
      {k:'nature', t:'Nature / طبيعة العملية', render:r=>`<span class="badge ${r.nature==='Trituration'?'gold':r.nature==='Achat olive'?'info':'neutral'} no-dot">${r.nature}</span>`},
      {k:'tiers', t:'Fournisseur / Client', render:r=>`<div class="strong">${r.tiers}</div><div class="cell-sub">${r.tiersType}</div>`},
      {k:'depot', t:'Terrasse', render:r=>r.lignes.map(l=>l.depot).join(', ')},
      {k:'qte', t:'Quantité (kg)', r:true, render:r=>`<span class="strong">${fmt.n(Store.netBR(r))}</span>`},
      {k:'prix', t:'Prix', r:true, render:r=>fmt.n(r.lignes[0]?r.lignes[0].prixHuile:0,3)},
      {k:'total', t:'Total (TND)', r:true, render:r=>`<span class="strong">${fmt.n(Store.montantBR(r),3)}</span>`},
      {k:'paiement', t:'Paiement', render:r=>{const s=Store.statutPaiementBR(r);
        return `<span class="badge ${s==='Payé'?'ok':s==='Non payé'?'danger':'warn'}">${s}</span>`;}},
      {k:'bp', t:'Production', render:r=>r.bp?`<span class="ref">${r.bp}</span>`:'<span class="badge warn no-dot">Sans production</span>'},
      {k:'x', t:'', r:true, render:r=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="voir">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        ${r.bp ? `<button class="icon-btn tip" data-tip="Voir la production" data-do="vprod">${icon('factory')}</button>`
                : `<button class="icon-btn tip" data-tip="Créer la production" data-do="cprod">${icon('plus')}</button>`}
        ${r.beh ? `<button class="icon-btn tip" data-tip="Voir le bon d'entrée huile" data-do="vbeh">${icon('droplet')}</button>`:''}
        <button class="icon-btn tip" data-tip="Imprimer" data-do="imp">${icon('print')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], rows, {ph:"Rechercher un numéro, un tiers, un matricule…", per:10, noToolbar:false,
        onRow:b=>DocBR.voir(b),
        rowAction:(a,r)=>{
          if(a==='voir') DocBR.voir(r);
          if(a==='mod')  DocBR.form(r);
          if(a==='cprod')DocBP.form(null, r);
          if(a==='vprod')App.go('bons-production', {num:r.bp});
          if(a==='vbeh') App.go('bons-entree-huile', {num:r.beh});
          if(a==='imp')  DocBR.imprimer(r);
          if(a==='sup')  {
            if(r.statut==='Validé' && r.bp) return toast('Suppression impossible',"Ce bon a généré une production. Annulez d'abord le bon de production.",'err');
            confirmer('Supprimer ce bon de réception ?', `Le bon <strong>${r.num}</strong> et ses lignes seront supprimés.`,
              ()=>{ Store.remove('bonsReception', r); toast('Bon supprimé',''); App.render(); }, 'Supprimer');
          }
        }})
  + totaux([["Bons affichés", String(rows.length)], ["Total quantité", fmt.n(totalQte)+" kg"],
            ["Total montant", fmt.n(totalMt,3)+" TND"], ["Total réglé", fmt.n(totalPaye,3)+" TND"],
            ["Reste", fmt.n(totalMt-totalPaye,3)+" TND"]]);
};

/* ------------------------------ Document bon de réception --------------- */
const DocBR = {
  champsLigne:[
    {k:'depot', l:'Terrasse / المخزن', type:'select', options:()=>DB.depots.map(d=>d.designation)},
    {k:'brut', l:'Poids brut caisse', type:'number'},
    {k:'vide', l:'Poids vide caisse', type:'number'},
    {k:'caisses', l:'Nombre de caisses', type:'number'},
    {k:'net', l:'Poids net', type:'number'},
    {k:'prixHuile', l:'Prix', type:'number', step:'0.001'}
  ],
  champsRegl:[
    {k:'mode', l:'Mode règlement', type:'select', options:()=>DB.modesPaiement},
    {k:'montant', l:'Montant', type:'number', step:'0.001'}
  ],

  form(br){
    const nature = br ? br.nature : DB.naturesBR[0];
    const lignes = br ? br.lignes.slice() : [{depot:DB.depots[0].designation, brut:0, vide:0, caisses:0, net:0, prixHuile:0}];
    const regls  = br ? (br.reglements||[]).slice() : [];
    modal({ size:'wide', title: br ? 'Modifier le bon de réception '+br.num : "Ajouter un bon de réception / إضافة مذكرة الاستلام",
      body:`<div class="grid g-2" style="gap:18px">
          <div class="grid g-2 gap-sm">
            <div class="field"><label>Numéro / الرقم</label><input class="input" data-f="num" value="${br?br.num:String(DB.bonsReception.length+1).padStart(6,'0')}" readonly></div>
            <div class="field"><label>Date bon de réception / التاريخ</label><input class="input" data-f="date" value="${br?br.date:Store.dateFR()}"></div>
            <div class="field"><label>Heure / الوقت</label><input class="input" data-f="heure" value="${br?br.heure:Store.heureFR()}"></div>
            <div class="field"><label>&nbsp;</label>
              <label class="perm"><input type="checkbox" data-f-check="payer" ${br&&br.paye>0?'checked':''}> Payer / خلاص</label></div>
          </div>
          <div class="grid g-2 gap-sm">
            <div class="field span-2"><label>Nature de l'opération / طبيعة العملية</label>
              <select class="input select" data-f="nature" id="br-nature">
                ${DB.naturesBR.map(n=>`<option ${n===nature?'selected':''}>${n}</option>`).join('')}</select></div>
            <div class="field span-2" id="br-tiers-box"></div>
            <div class="field"><label>CIN / بطاقة الهوية</label><input class="input" data-f="cin" value="${br?br.cin||'':''}"></div>
            <div class="field"><label>Matricule véhicule / رقم السيارة</label>
              <select class="input select" data-f="matricule">
                ${[...new Set(DB.fournisseurs.flatMap(x=>x.matricules||[]).concat(DB.transporteurs.flatMap(t=>t.matricules||[])))]
                  .map(m=>`<option ${br&&br.matricule===m?'selected':''}>${m}</option>`).join('')}</select></div>
            <div class="field span-2"><label>Remarque / ملاحظات</label><input class="input" data-f="remarque" value="${br?br.remarque||'':''}"></div>
          </div>
        </div>

        <div style="height:16px"></div>
        ${Repeater.html('brl', lignes, this.champsLigne, "Lignes du bon de réception / سطور مذكرة الاستلام", "Ajouter une ligne")}
        <div class="note mt" id="br-calc">Poids net = poids brut − poids vide. Le poids net ne peut pas être négatif.</div>

        <div style="height:16px"></div>
        ${Repeater.html('brr', regls, this.champsRegl, "Pièces de règlement / الأجزاء اللازمة للدفع", "Ajouter ligne")}
        <div class="totaux-bar" id="br-tot"></div>`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="br-ok">${icon('check')}Enregistrer</button>`,
      onOpen: ov=> DocBR.bind(ov, br)
    });
  },

  bind(ov, br){
    const majTiers = ()=>{
      const n = el('#br-nature',ov).value;
      const client = n === 'Trituration';
      const liste = client ? DB.clients.map(c=>c.nom) : DB.fournisseurs.map(f=>f.nom);
      el('#br-tiers-box',ov).innerHTML = `<label>${client?'Client / الزبون':'Fournisseur / الفلاح'} *</label>
        <select class="input select" data-f="tiers">${liste.map(x=>`<option ${br&&br.tiers===x?'selected':''}>${x}</option>`).join('')}</select>`;
      const prixLab = n==='Achat olive sur base huile' ? 'Prix huile / سعر زيت'
                    : n==='Trituration' ? 'Prix trituration / سعر العصر' : 'Prix olive / سعر الزيتون';
      els('[data-rep="brl"] .rep-line', ov).forEach(l=>{
        const lab = l.querySelectorAll('.field label')[5]; if(lab) lab.textContent = prixLab;
      });
    };
    const majTotaux = ()=>{
      const lignes = Repeater.lire(ov,'brl',this.champsLigne);
      lignes.forEach((l,i)=>{
        const net = Math.max(0, (l.brut||0) - (l.vide||0));
        const inp = els('[data-rep="brl"] .rep-line', ov)[i].querySelector('[data-rl="net"]');
        inp.value = net; inp.readOnly = true; l.net = net;
      });
      const net = lignes.reduce((s,l)=>s+l.net,0), pu = lignes[0] ? lignes[0].prixHuile : 0;
      const n = el('#br-nature',ov).value;
      const mt = n==='Achat olive sur base huile' ? 0 : net*pu;
      const regl = Repeater.lire(ov,'brr',this.champsRegl).reduce((s,r)=>s+(r.montant||0),0);
      el('#br-tot',ov).innerHTML = `
        <div><span>Poids net total</span><strong>${fmt.n(net)} kg</strong></div>
        <div><span>Montant du bon</span><strong>${n==='Achat olive sur base huile'?'calculé après production':fmt.n(mt,3)+' TND'}</strong></div>
        <div><span>Total réglé</span><strong>${fmt.n(regl,3)} TND</strong></div>`;
      const negatif = lignes.some(l=>(l.brut||0) < (l.vide||0));
      el('#br-calc',ov).innerHTML = negatif
        ? `<span style="color:var(--danger);font-weight:600">Poids vide supérieur au poids brut : corrigez la ligne, le poids net ne peut pas être négatif.</span>`
        : `Poids net = poids brut − poids vide. Poids net total retenu : <strong>${fmt.n(net)} kg</strong>.`;
    };
    const rebind = ()=>{
      els('[data-rl]', ov).forEach(i=> i.oninput = majTotaux);
      els('[data-rl]', ov).forEach(i=> i.onchange = majTotaux);
    };
    el('#br-nature',ov).onchange = ()=>{ majTiers(); majTotaux(); };
    ov.addEventListener('rep-change', ()=>{ rebind(); majTiers(); majTotaux(); });
    majTiers(); rebind(); majTotaux();

    el('#br-ok',ov).onclick = ()=>{
      const d = {};
      els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.value.trim());
      const payer = ov.querySelector('[data-f-check="payer"]').checked;
      const lignes = Repeater.lire(ov,'brl',this.champsLigne)
        .map(l=>({ ...l, net: Math.max(0,(l.brut||0)-(l.vide||0)) }))
        .filter(l=>l.brut>0);
      if(!lignes.length) return toast('Une erreur est survenue',"Ajoutez au moins une ligne avec un poids brut.", 'err');
      if(lignes.some(l=>l.brut < l.vide)) return toast('Poids incohérent',"Le poids vide ne peut pas dépasser le poids brut.", 'err');
      const regls = Repeater.lire(ov,'brr',this.champsRegl).filter(r=>r.montant>0);
      const paye = payer ? regls.reduce((s,r)=>s+r.montant,0) : 0;
      const obj = Object.assign({}, d, { lignes, reglements:regls, paye,
        tiersType: d.nature==='Trituration' ? 'Client' : 'Fournisseur',
        statut:'Validé', saison: Flt.get('br').saison || 'Saison 2025/2026', annee:'2026',
        bp: br?br.bp:null, beh: br?br.beh:null });
      if(!br && typeof API !== 'undefined' && API.actif){
        /* Le document, ses lignes, le stock terrasse et le mouvement de
           matière première sont enregistrés en une seule transaction. */
        API.metier('reception', obj).then(()=>{
          Store.sansPersistance(()=>{
            Store.add('bonsReception', obj, 'BR '+obj.num);
            obj.lignes.forEach(l=>{ const dep = DB.depots.find(x=>x.designation===l.depot); if(dep) dep.qte += l.net; });
          });
          toast('Bon de réception enregistré',
            `${obj.num} — ${fmt.n(lignes.reduce((s,l)=>s+l.net,0))} kg réceptionnés et enregistrés en base.`);
          App.render();
        }).catch(e=> toast('Opération refusée par le serveur', e.message, 'err'));
        closeModal();
        return;
      }
      if(br){ Store.update('bonsReception', br, obj, 'BR '+br.num); toast('Bon de réception modifié', 'Le bon '+br.num+' a été mis à jour.'); }
      else {
        Store.add('bonsReception', obj, 'BR '+obj.num);
        obj.lignes.forEach(l=>{
          const dep = DB.depots.find(x=>x.designation===l.depot);
          if(dep) dep.qte += l.net;
        });
        Store.mouvement('Entrée', 'Olives Chemlali', lignes.reduce((s,l)=>s+l.net,0), '—', 'Matières premières', 'Bon de réception '+obj.num);
        if(paye>0) Store.operation({type: obj.tiersType==='Client'?'Encaissement client':'Règlement fournisseur',
          tiers:obj.tiers, montant: obj.tiersType==='Client'? paye : -paye,
          mode: regls[0] ? regls[0].mode : 'Espèces', motif:'Bon de réception '+obj.num});
        toast('Bon de réception enregistré', `${obj.num} — ${fmt.n(lignes.reduce((s,l)=>s+l.net,0))} kg réceptionnés.`);
      }
      closeModal(); App.render();
    };
  },

  voir(br){
    const bp = Store.prodDuBR(br), beh = Store.behDuBR(br), base = Store.baseBR(br);
    modal({ size:'wide', title:'Bon de réception '+br.num,
      body:`<div class="grid g-2" style="gap:18px">
          <dl class="kv">
            <dt>Numéro</dt><dd><span class="ref">${br.num}</span></dd>
            <dt>Date et heure</dt><dd>${br.date} à ${br.heure}</dd>
            <dt>Nature de l'opération</dt><dd>${br.nature}</dd>
            <dt>${br.tiersType==='Client'?'Client':'Fournisseur'}</dt><dd><strong>${br.tiers}</strong></dd>
            <dt>CIN</dt><dd>${br.cin||'—'}</dd>
            <dt>Matricule véhicule</dt><dd>${br.matricule}</dd>
            <dt>Saison</dt><dd>${br.saison}</dd>
            <dt>Remarque</dt><dd>${br.remarque||'—'}</dd>
          </dl>
          <dl class="kv">
            <dt>${base.libelleQte}</dt><dd><strong>${fmt.n(base.qte)} kg</strong></dd>
            <dt>${base.libellePrix}</dt><dd>${fmt.n(br.lignes[0]?br.lignes[0].prixHuile:0,3)}</dd>
            <dt>Montant du bon</dt><dd><strong>${fmt.n(Store.montantBR(br),3)} TND</strong></dd>
            <dt>Montant réglé</dt><dd>${fmt.n(br.paye||0,3)} TND</dd>
            <dt>Reste à payer</dt><dd><strong>${fmt.n(Store.resteBR(br),3)} TND</strong></dd>
            <dt>Statut paiement</dt><dd>${statutBadge(Store.statutPaiementBR(br)==='Payé'?'Payée':Store.statutPaiementBR(br))}</dd>
            <dt>Bon de production</dt><dd>${bp?`<span class="ref">${bp.num}</span> — ${fmt.n(bp.qteHuile,1)} kg d'huile`:'<span class="muted">aucune production</span>'}</dd>
            <dt>Bon d'entrée huile</dt><dd>${beh?`<span class="ref">${beh.num}</span> — pile ${beh.pile}`:'<span class="muted">aucun</span>'}</dd>
          </dl>
        </div>
        <div class="card-title mt" style="margin:16px 0 8px">Lignes du bon</div>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>Terrasse</th><th class="r">Poids brut</th><th class="r">Poids vide</th><th class="r">Nb caisses</th><th class="r">Poids net</th><th class="r">Prix</th><th class="r">Total ligne</th></tr></thead>
          <tbody>${br.lignes.map(l=>`<tr><td>${l.depot}</td><td class="r">${fmt.n(l.brut)}</td><td class="r">${fmt.n(l.vide)}</td>
            <td class="r">${fmt.n(l.caisses)}</td><td class="r strong">${fmt.n(l.net)}</td><td class="r">${fmt.n(l.prixHuile,3)}</td>
            <td class="r">${br.nature==='Achat olive sur base huile'?'<span class="muted">selon production</span>':fmt.n(l.net*l.prixHuile,3)}</td></tr>`).join('')}</tbody>
        </table></div>
        ${(br.reglements||[]).length?`<div class="card-title" style="margin:16px 0 8px">Pièces de règlement</div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Mode de règlement</th><th class="r">Montant</th></tr></thead>
          <tbody>${br.reglements.map(r=>`<tr><td>${r.mode}</td><td class="r strong">${fmt.n(r.montant,3)} TND</td></tr>`).join('')}</tbody></table></div>`:''}`,
      foot:`<button class="btn" data-close>Fermer</button>
            ${bp?'':`<button class="btn" id="brv-prod">${icon('factory')}Créer la production</button>`}
            <button class="btn" id="brv-print">${icon('print')}Imprimer</button>
            <button class="btn btn-primary" id="brv-edit">${icon('edit')}Modifier</button>`,
      onOpen(ov){
        el('#brv-edit',ov).onclick = ()=>{ closeModal(); DocBR.form(br); };
        el('#brv-print',ov).onclick = ()=> DocBR.imprimer(br);
        const p = el('#brv-prod',ov); if(p) p.onclick = ()=>{ closeModal(); DocBP.form(null, br); };
      }});
  },

  imprimer(br){
    const base = Store.baseBR(br);
    modal({ size:'wide', title:'Bon de réception '+br.num,
      body:`<div class="print-preview"><div class="invoice" style="max-width:700px">
        <div class="inv-top">
          <div><div class="inv-co">${DB.societe.nom}</div>
            <div style="margin-top:6px;line-height:1.6">${DB.societe.adresse}<br>Tél. ${DB.societe.tel}<br>MF ${DB.societe.mf}</div></div>
          <div class="inv-meta"><div class="inv-h1">BON DE RÉCEPTION</div>
            <div style="margin-top:6px;line-height:1.7">N° <strong>${br.num}</strong><br>${br.date} à ${br.heure}<br>${br.saison}</div></div>
        </div>
        <div class="inv-parties">
          <div class="inv-box"><div class="inv-lab">${br.tiersType==='Client'?'Client':'Fournisseur'}</div>
            <strong>${br.tiers}</strong><br>CIN ${br.cin||'—'}<br>Véhicule ${br.matricule}</div>
          <div class="inv-box"><div class="inv-lab">Nature de l'opération</div>${br.nature}<br>
            ${base.libellePrix} : ${fmt.n(br.lignes[0]?br.lignes[0].prixHuile:0,3)}</div>
        </div>
        <table><thead><tr><th>Terrasse</th><th class="r">Brut</th><th class="r">Vide</th><th class="r">Caisses</th><th class="r">Net (kg)</th></tr></thead>
          <tbody>${br.lignes.map(l=>`<tr><td>${l.depot}</td><td class="r">${fmt.n(l.brut)}</td><td class="r">${fmt.n(l.vide)}</td>
            <td class="r">${fmt.n(l.caisses)}</td><td class="r">${fmt.n(l.net)}</td></tr>`).join('')}</tbody></table>
        <div class="inv-tot"><table>
          <tr><td>${base.libelleQte}</td><td class="r">${fmt.n(base.qte)} kg</td></tr>
          <tr><td>Montant</td><td class="r">${fmt.n(Store.montantBR(br),3)} TND</td></tr>
          <tr><td>Réglé</td><td class="r">${fmt.n(br.paye||0,3)} TND</td></tr>
          <tr class="grand"><td>Reste</td><td class="r">${fmt.n(Store.resteBR(br),3)} TND</td></tr>
        </table></div>
        <div class="inv-foot">Signature du ${br.tiersType==='Client'?'client':'fournisseur'} — Signature du réceptionnaire · Établi par ${DB.user.nom}.</div>
      </div></div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" data-act-pdf>${icon('download')}PDF</button>
            <button class="btn btn-primary" data-act-print>${icon('print')}Imprimer</button>`});
  }
};

/* ==========================  ACHATS — BONS DE PRODUCTION  =============== */
PAGES['bons-production'] = () => {
  const f = Flt.get('bp', {tiers:'', br:''});
  let rows = Store.filtrer(DB.bonsProduction, f);
  if(f.tiers) rows = rows.filter(b=>b.tiers===f.tiers);
  if(f.br)    rows = rows.filter(b=>b.br.includes(f.br));

  return pageHead("Bon de production / أمر الإنتاج","Transformation des olives réceptionnées en huile",
    `<button class="btn btn-sm btn-primary" id="bp-add">${icon('plus')}Ajouter</button>`)
  + Flt.bar('bp', [
      {k:'tiers', l:'Fournisseur / Client', type:'select', options:()=>[...new Set(DB.bonsProduction.map(b=>b.tiers))]},
      {k:'br', l:'Numéro BR', ph:'000001'}
    ])
  + dataTable('bpl', [
      {k:'br', t:'N° BR', render:r=>`<span class="ref">${r.br}</span>`},
      {k:'num', t:'N° BP', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'tiers', t:'Fournisseur / Client', render:r=>`<div class="strong">${r.tiers}</div><div class="cell-sub">${r.type}</div>`},
      {k:'dateBR', t:'Date BR'}, {k:'date', t:'Date BP', render:r=>`${r.date}<div class="cell-sub">${r.heure}</div>`},
      {k:'qteOlives', t:'Quantité olives', r:true, render:r=>fmt.n(r.qteOlives)+' kg'},
      {k:'qteHuile', t:'Quantité huile', r:true, render:r=>`<span class="strong">${fmt.n(r.qteHuile,1)} kg</span>`},
      {k:'rendement', t:'Rendement', r:true, render:r=>`<span class="badge ${r.rendement>=14?'ok':'warn'} no-dot">${fmt.pct(r.rendement)}</span>`},
      {k:'cout', t:'Prix total', r:true, render:r=>fmt.n(r.cout,3)},
      {k:'cmp', t:'CMP', r:true, render:r=>fmt.n(r.cmp,3)},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Validé'?'Validée':r.statut)},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="voir">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Bon d'entrée huile" data-do="beh">${icon('droplet')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], rows, {ph:"Rechercher un BP, un BR, un tiers…", per:10,
        onRow:b=>DocBP.voir(b),
        rowAction:(a,r)=>{
          if(a==='voir') DocBP.voir(r);
          if(a==='mod')  DocBP.form(r);
          if(a==='beh')  { const br = DB.bonsReception.find(x=>x.num===r.br);
                           if(br && br.beh) App.go('bons-entree-huile',{num:br.beh}); else DocBEH.form(null, br, r); }
          if(a==='sup')  confirmer('Supprimer ce bon de production ?', `Le bon <strong>${r.num}</strong> sera supprimé et le bon de réception ${r.br} redeviendra « sans production ».`,
            ()=>{ const br = DB.bonsReception.find(x=>x.num===r.br); if(br) br.bp = null;
                  Store.remove('bonsProduction', r); toast('Bon de production supprimé',''); App.render(); }, 'Supprimer');
        }})
  + totaux([["Productions", String(rows.length)],
            ["Olives traitées", fmt.n(rows.reduce((s,b)=>s+b.qteOlives,0))+" kg"],
            ["Huile produite", fmt.n(rows.reduce((s,b)=>s+b.qteHuile,0),1)+" kg"],
            ["Rendement moyen", fmt.pct(rows.reduce((s,b)=>s+b.qteOlives,0) ? rows.reduce((s,b)=>s+b.qteHuile,0)/rows.reduce((s,b)=>s+b.qteOlives,0)*100 : 0)],
            ["Prix total", fmt.n(rows.reduce((s,b)=>s+b.cout,0),3)+" TND"]]);
};

const DocBP = {
  form(bp, brSource){
    const brs = DB.bonsReception.filter(b=>!b.bp || (bp && b.num===bp.br));
    const brDef = brSource || (bp ? DB.bonsReception.find(b=>b.num===bp.br) : brs[0]);
    modal({ size:'wide', title: bp ? 'Modifier le bon de production '+bp.num : "Ajouter un bon de production / إضافة أمر الإنتاج",
      body:`<div class="grid g-3 gap-sm">
          <div class="field"><label>Numéro</label><input class="input" data-f="num" value="${bp?bp.num:Store.num('BP',4)}" readonly></div>
          <div class="field"><label>Date</label><input class="input" data-f="date" value="${bp?bp.date:Store.dateFR()}"></div>
          <div class="field"><label>Heure</label><input class="input" data-f="heure" value="${bp?bp.heure:Store.heureFR()}"></div>
          <div class="field span-2"><label>Bon de réception *</label>
            <select class="input select" data-f="br" id="bp-br">
              ${brs.map(b=>`<option value="${b.num}" ${brDef&&brDef.num===b.num?'selected':''}>${b.num} — ${b.tiers} — ${fmt.n(Store.netBR(b))} kg — ${b.nature}</option>`).join('')}
            </select></div>
          <div class="field"><label>Type</label><select class="input select" data-f="type" id="bp-type">
            <option>Non Trituration</option><option>Trituration</option></select></div>
        </div>
        <div class="note mt" id="bp-info"></div>
        <div class="grid g-3 gap-sm mt">
          <div class="field"><label>Quantité olives traitées (kg)</label><input class="input" type="number" data-f="qteOlives" id="bp-olives" value="${bp?bp.qteOlives:0}"></div>
          <div class="field"><label>Quantité huile produite (kg)</label><input class="input" type="number" step="0.1" data-f="qteHuile" id="bp-huile" value="${bp?bp.qteHuile:0}"></div>
          <div class="field"><label>Rendement (%)</label><input class="input" data-f="rendement" id="bp-rdt" value="${bp?fmt.n(bp.rendement,2):'0,00'}" readonly></div>
          <div class="field"><label>Grignons (kg)</label><input class="input" type="number" data-f="grignons" id="bp-grg" value="${bp?bp.grignons:0}"></div>
          <div class="field"><label>Noyaux (kg)</label><input class="input" type="number" data-f="noyaux" id="bp-noy" value="${bp?bp.noyaux:0}"></div>
          <div class="field"><label>Margines (L)</label><input class="input" type="number" data-f="margines" id="bp-mrg" value="${bp?bp.margines:0}"></div>
        </div>
        <div class="totaux-bar" id="bp-tot"></div>`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="bp-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        const maj = ()=>{
          const br = DB.bonsReception.find(b=>b.num===el('#bp-br',ov).value);
          if(!br) return;
          el('#bp-type',ov).value = br.nature==='Trituration' ? 'Trituration' : 'Non Trituration';
          if(!bp){ el('#bp-olives',ov).value = Store.netBR(br); }
          const ol = +el('#bp-olives',ov).value||0, hu = +el('#bp-huile',ov).value||0;
          const rdt = ol ? hu/ol*100 : 0;
          el('#bp-rdt',ov).value = fmt.n(rdt,2);
          if(!bp && hu>0){
            el('#bp-grg',ov).value = Math.round(ol*0.35);
            el('#bp-noy',ov).value = Math.round(ol*0.35*0.22);
            el('#bp-mrg',ov).value = Math.round(ol*0.45);
          }
          const pu = br.lignes[0] ? br.lignes[0].prixHuile : 0;
          const cout = br.nature==='Achat olive sur base huile' ? hu*pu
                     : br.nature==='Trituration' ? ol*pu : ol*pu;
          const cmp = hu ? cout/hu : 0;
          el('#bp-info',ov).innerHTML = `Bon <strong>${br.num}</strong> — ${br.nature} — ${br.tiersType.toLowerCase()} <strong>${br.tiers}</strong> ·
            ${fmt.n(Store.netBR(br))} kg réceptionnés · prix ${fmt.n(pu,3)}`;
          el('#bp-tot',ov).innerHTML = `
            <div><span>Rendement</span><strong>${fmt.n(rdt,2)} %</strong></div>
            <div><span>Prix total</span><strong>${fmt.n(cout,3)} TND</strong></div>
            <div><span>CMP</span><strong>${fmt.n(cmp,3)} TND/kg</strong></div>`;
        };
        ['#bp-br','#bp-olives','#bp-huile'].forEach(s=>{ const n = el(s,ov); n.oninput = maj; n.onchange = maj; });
        maj();
        el('#bp-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.type==='number' ? (parseFloat(n.value)||0) : n.value);
          const br = DB.bonsReception.find(b=>b.num===d.br);
          if(!br) return toast('Une erreur est survenue','Sélectionnez un bon de réception.','err');
          if(d.qteOlives<=0 || d.qteHuile<=0) return toast('Quantités incorrectes','Les quantités d\'olives et d\'huile doivent être supérieures à zéro.','err');
          if(d.qteHuile > d.qteOlives) return toast('Quantités incohérentes',"La quantité d'huile ne peut pas dépasser la quantité d'olives traitées.",'err');
          const pu = br.lignes[0] ? br.lignes[0].prixHuile : 0;
          const cout = br.nature==='Achat olive sur base huile' ? d.qteHuile*pu : d.qteOlives*pu;
          const obj = Object.assign({}, d, { tiers:br.tiers, tiersType:br.tiersType, dateBR:br.date,
            rendement: d.qteOlives ? +(d.qteHuile/d.qteOlives*100).toFixed(2) : 0,
            cout:+cout.toFixed(3), cmp: d.qteHuile ? +(cout/d.qteHuile).toFixed(3) : 0,
            statut:'Validé', saison:br.saison });
          if(bp) Store.update('bonsProduction', bp, obj, bp.num);
          else { Store.add('bonsProduction', obj, obj.num); br.bp = obj.num;
                 Store.mouvement('Sortie', 'Olives Chemlali', obj.qteOlives, '—', 'Matières premières', 'Production '+obj.num); }
          toast(bp?'Bon de production modifié':'Bon de production enregistré',
            `${obj.num} — ${fmt.n(obj.qteHuile,1)} kg d'huile, rendement ${fmt.n(obj.rendement,2)} %.`);
          closeModal(); App.render();
        };
      }});
  },

  voir(bp){
    const br = DB.bonsReception.find(b=>b.num===bp.br);
    modal({ size:'wide', title:'Bon de production '+bp.num,
      body:`<div class="grid g-3" style="margin-bottom:16px">
          <article class="card kpi"><div class="kpi-label">Olives traitées</div><div class="kpi-value" style="font-size:21px">${fmt.n(bp.qteOlives)}<small>kg</small></div></article>
          <article class="card kpi"><div class="kpi-label">Huile produite</div><div class="kpi-value" style="font-size:21px">${fmt.n(bp.qteHuile,1)}<small>kg</small></div></article>
          <article class="card kpi"><div class="kpi-label">Rendement</div><div class="kpi-value" style="font-size:21px">${fmt.n(bp.rendement,2)}<small>%</small></div></article>
        </div>
        <dl class="kv">
          <dt>Bon de réception</dt><dd><span class="ref">${bp.br}</span> du ${bp.dateBR}${br?` — ${br.nature}`:''}</dd>
          <dt>Type</dt><dd>${bp.type}</dd>
          <dt>${bp.tiersType==='Client'?'Client':'Fournisseur'}</dt><dd><strong>${bp.tiers}</strong></dd>
          <dt>Date de production</dt><dd>${bp.date} à ${bp.heure}</dd>
          <dt>Grignons</dt><dd>${fmt.n(bp.grignons)} kg</dd>
          <dt>Noyaux</dt><dd>${fmt.n(bp.noyaux)} kg</dd>
          <dt>Margines</dt><dd>${fmt.n(bp.margines)} L</dd>
          <dt>Prix total</dt><dd><strong>${fmt.n(bp.cout,3)} TND</strong></dd>
          <dt>CMP</dt><dd>${fmt.n(bp.cmp,3)} TND/kg</dd>
          <dt>Bon d'entrée huile</dt><dd>${br&&br.beh?`<span class="ref">${br.beh}</span>`:'<span class="muted">non établi</span>'}</dd>
        </dl>`,
      foot:`<button class="btn" data-close>Fermer</button>
            ${br&&!br.beh?`<button class="btn" id="bpv-beh">${icon('droplet')}Créer le bon d'entrée huile</button>`:''}
            <button class="btn btn-primary" id="bpv-edit">${icon('edit')}Modifier</button>`,
      onOpen(ov){
        el('#bpv-edit',ov).onclick = ()=>{ closeModal(); DocBP.form(bp); };
        const b = el('#bpv-beh',ov); if(b) b.onclick = ()=>{ closeModal(); DocBEH.form(null, br, bp); };
      }});
  }
};
