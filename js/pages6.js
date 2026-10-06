/* ==========================================================================
   OLIVERA ERP — Finance
   État de caisse espèces et chèques, validation et correction de caisse,
   règlements du personnel par période, ventes, bons de livraison, factures.
   ========================================================================== */

/* Convention comptable retenue pour la caisse, qui est un compte d'actif :
   une entrée d'argent est portée au débit, une sortie au crédit.            */
const Caisse = {
  journal(mode){ return mode==='Chèque' ? 'Portefeuille chèques' : mode==='Virement' ? 'Banque' : 'Caisse espèces'; },
  depart(journal){ const s = DB.soldesDepart.find(x=>x.journal===journal); return s ? s.montant : 0; },

  lignes(journal, f){
    let ops = DB.operations.filter(o=>o.journal===journal && Store.dansIntervalle(o.date, f));
    if(f.utilisateur) ops = ops.filter(o=>o.user===f.utilisateur);
    return ops.map(o=>({
      sens: o.montant>0 ? 'Entrée' : 'Sortie',
      date: o.date, tiers: o.tiers, nature: o.type, mode: o.mode,
      debit: o.montant>0 ? o.montant : 0,
      credit: o.montant<0 ? -o.montant : 0,
      valide: o.valide, num:o.num, motif:o.motif, user:o.user
    }));
  },

  corrections(journal, f){
    return DB.correctionsCaisse.filter(c=>c.journal===journal && Store.dansIntervalle(c.date, f));
  },

  totaux(journal, f){
    const l = this.lignes(journal, f);
    const entrees = l.reduce((s,x)=>s+x.debit,0), sorties = l.reduce((s,x)=>s+x.credit,0);
    const corr = this.corrections(journal, f).filter(c=>c.validation).reduce((s,c)=>s+c.solde,0);
    const depart = this.depart(journal);
    return { depart, entrees, sorties, solde: depart + entrees - sorties, correction: corr,
             soldeCorrige: depart + entrees - sorties + corr, nonValidees: l.filter(x=>!x.valide).length };
  }
};

/* ------------------------------ État de caisse -------------------------- */
const etatCaissePage = (mode, titre, sous) => () => {
  const id = 'ec-'+mode;
  const f = Flt.get(id, {utilisateur:'', mode});
  const journal = Caisse.journal(mode);
  const lignes = Caisse.lignes(journal, f);
  const t = Caisse.totaux(journal, f);

  return pageHead(titre, sous)
  + Flt.bar(id, [
      {k:'utilisateur', l:'Utilisateur', type:'select', options:()=>[...new Set(DB.operations.map(o=>o.user))]},
      {k:'mode', l:'Mode de paiement', type:'select', options:()=>DB.modesPaiement}
    ], {actions:`<button class="btn btn-sm" data-go="validation-caisse">${icon('check-circle')}Validation de caisse</button>
                 <button class="btn btn-sm" data-go="correction-caisse">${icon('edit')}Correction de caisse</button>`})
  + `<div class="legende">
      <span><i class="lg-in"></i>Entrée / دخل</span>
      <span><i class="lg-out"></i>Sortie / خروج</span>
      <span><i class="lg-nv"></i>Somme non validée</span>
      <span><i class="lg-val"></i>Validation caisse</span>
     </div>`
  + card("Caisse / الصندوق", `
      <div class="table-wrap"><table class="tbl">
        <thead><tr>
          <th>Type / النوع</th><th>Date / التاريخ</th>
          <th>Client / Fournisseur / Personnel</th><th>Nature</th>
          <th>Modalité de paiement / طريقة الدفع</th>
          <th class="r">Débit / مدين</th><th class="r">Crédit / دائن</th>
        </tr></thead>
        <tbody>
          <tr class="ligne-depart"><td><span class="badge info no-dot">Solde de départ</span></td>
            <td>${f.du}</td><td class="muted">—</td><td>Solde de départ</td><td>${mode}</td>
            <td class="r strong">${fmt.n(t.depart,3)}</td><td class="r muted">0,000</td></tr>
          ${lignes.length ? lignes.map(l=>`
            <tr class="${l.sens==='Entrée'?'ligne-entree':'ligne-sortie'} ${l.valide?'':'ligne-nv'}">
              <td><span class="badge ${l.sens==='Entrée'?'ok':'warn'} no-dot">${l.sens}</span></td>
              <td>${l.date}</td>
              <td><div class="strong">${l.tiers}</div><div class="cell-sub">${l.motif||''}</div></td>
              <td>${l.nature}</td>
              <td>${l.mode}</td>
              <td class="r">${l.debit?`<span class="strong">${fmt.n(l.debit,3)}</span>`:'<span class="muted">0,000</span>'}</td>
              <td class="r">${l.credit?`<span class="strong">${fmt.n(l.credit,3)}</span>`:'<span class="muted">0,000</span>'}</td>
            </tr>`).join('')
          : `<tr><td colspan="7"><div class="empty">${icon('search')}
              <div class="empty-t">Aucun mouvement</div>
              <div class="empty-d">Aucune opération sur cette période pour ce journal.</div></div></td></tr>`}
        </tbody>
      </table></div>`, {flush:true,
      sub:`${lignes.length} mouvement${lignes.length>1?'s':''} · ${t.nonValidees} non validé${t.nonValidees>1?'s':''} · journal ${journal}`})
  + `<div class="bloc-solde">
      <div class="ls"><span>Entrée / دخل</span><strong>${fmt.n(t.entrees,3)}</strong></div>
      <div class="ls"><span>Sortie / خروج</span><strong>${fmt.n(t.sorties,3)}</strong></div>
      <div class="ls"><span>Solde / الرصيد</span><strong>${fmt.n(t.solde,3)}</strong></div>
      <div class="ls"><span>Correction solde / تصحيح الرصيد</span><strong>${fmt.n(t.correction,3)}</strong></div>
      <div class="ls total"><span>Solde après correction</span><strong>${fmt.n(t.soldeCorrige,3)} TND</strong></div>
     </div>`;
};

PAGES['etat-caisse-espece'] = etatCaissePage('Espèces', "État de caisse espèces / كشف الصندوق النقدي",
  "Mouvements d'espèces sur la période, solde de départ et correction");
PAGES['etat-caisse-cheque'] = etatCaissePage('Chèque', "État de caisse chèques / كشف صندوق الشيكات",
  "Chèques reçus et remis sur la période");

/* ------------------------------ Correction de caisse -------------------- */
PAGES['correction-caisse'] = () => {
  const f = Flt.get('cor', {});
  const rows = DB.correctionsCaisse.filter(c=>Store.dansIntervalle(c.date, f));
  return pageHead("Correction de caisse / تصحيح الصندوق","Écarts constatés à la clôture et validation par un responsable",
    `<button class="btn btn-sm" data-go="validation-caisse">${icon('check-circle')}Validation de caisse</button>
     <button class="btn btn-sm btn-primary" id="cor-add">${icon('plus')}Ajouter</button>`)
  + Flt.bar('cor', [], {sansPeriode:false})
  + card("Correction caisse", `
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th>Numéro</th><th>Date / التاريخ</th><th>Journal</th><th class="r">Solde / الرصيد</th>
          <th>Motif</th><th>Utilisateur</th><th class="c">Validation / تأكيد</th><th></th></tr></thead>
        <tbody>${rows.length ? rows.map((c,i)=>`<tr>
          <td><span class="ref">${c.num}</span></td>
          <td>${c.date}</td><td>${c.journal}</td>
          <td class="r"><span class="strong" style="color:${c.solde<0?'var(--danger)':c.solde>0?'var(--ok)':'var(--ink-3)'}">${fmt.n(c.solde,3)}</span></td>
          <td>${c.motif||'<span class="muted">—</span>'}</td>
          <td>${c.user}</td>
          <td class="c"><input type="checkbox" class="cor-val" data-num="${c.num}" ${c.validation?'checked':''}></td>
          <td class="r"><div class="row-actions">
            <button class="icon-btn tip" data-tip="Modifier" data-cor-edit="${c.num}">${icon('edit')}</button>
            <button class="icon-btn tip" data-tip="Supprimer" data-cor-del="${c.num}">${icon('trash')}</button>
          </div></td></tr>`).join('')
        : `<tr><td colspan="8"><div class="empty">${icon('edit')}<div class="empty-t">Aucune correction</div>
            <div class="empty-d">Aucun écart n'a été enregistré sur la période.</div></div></td></tr>`}
        </tbody></table></div>`, {flush:true})
  + totaux([["Corrections", String(rows.length)],
            ["Validées", String(rows.filter(c=>c.validation).length)],
            ["Écart cumulé validé", fmt.n(rows.filter(c=>c.validation).reduce((s,c)=>s+c.solde,0),3)+" TND"],
            ["Écart en attente", fmt.n(rows.filter(c=>!c.validation).reduce((s,c)=>s+c.solde,0),3)+" TND"]]);
};

const Correction = {
  form(c){
    const t = Caisse.totaux('Caisse espèces', Flt.get('cor'));
    formModal({ title: c ? 'Modifier la correction '+c.num : 'Nouvelle correction de caisse',
      okLabel:'Enregistrer', values:c || {},
      intro:`Solde théorique de la caisse espèces sur la période filtrée : <strong>${fmt.n(t.solde,3)} TND</strong>.
             La correction est la différence entre le solde réellement compté et ce solde théorique.`,
      fields:[
        {k:'date', l:'Date', def:Store.dateFR()},
        {k:'journal', l:'Journal', type:'select', options:['Caisse espèces','Portefeuille chèques']},
        {k:'solde', l:'Correction du solde (TND)', type:'number', step:'0.001', req:true,
          hint:"Valeur négative pour un manquant, positive pour un excédent"},
        {k:'motif', l:'Motif de la correction', span:true},
        {k:'validation', l:'Validée', type:'checkbox', ph:'Correction confirmée par un responsable'}
      ],
      onSave: d=>{
        if(c){ Store.update('correctionsCaisse', c, d, c.num); toast('Correction modifiée', c.num+' a été mise à jour.'); }
        else {
          const obj = Object.assign({ num:Store.num('COR',4), user:DB.user.nom }, d);
          Store.add('correctionsCaisse', obj, obj.num);
          toast('Correction enregistrée', `${fmt.n(d.solde,3)} TND ${d.solde<0?'de manquant':'d\'excédent'} sur ${d.journal}.`);
        }
        App.render();
      }});
  }
};

/* ------------------------------ Règlement du personnel ------------------ */
PAGES['reglement-personnel'] = () => {
  const f = Flt.get('rgp2', {personnel:''});
  let rows = DB.reglementsPeriode.filter(r=>Store.memeSaison(r, f));
  if(f.personnel) rows = rows.filter(r=>r.personnel===f.personnel);

  return pageHead("Règlement personnel / تسوية الموظفين","Règlements calculés sur une période de présence",
    `<button class="btn btn-sm" data-go="historique-reglement-personnel">${icon('history')}Historique</button>
     <button class="btn btn-sm btn-primary" id="rgp-add">${icon('plus')}Ajouter</button>`)
  + Flt.bar('rgp2', [
      {k:'personnel', l:'Personnel', type:'select', options:()=>DB.employes.map(e=>e.nom)}
    ], {sansPeriode:true, def:{saison:'Saison 2025/2026'}})
  + dataTable('rgp2l', [
      {k:'num', t:'Numéro / الرقم', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'dateReglement', t:'Date / التاريخ'},
      {k:'personnel', t:'Personnel / العامل', render:r=>`<div class="strong">${r.personnel}</div><div class="cell-sub">${r.mat}</div>`},
      {k:'periode', t:'Période', render:r=>`${r.dateDe} → ${r.jusqua}`},
      {k:'base', t:'Base', r:true, render:r=>r.heures ? fmt.n(r.heures,1)+' h' : fmt.n(r.jours)+' j'},
      {k:'mode', t:'Mode'},
      {k:'montant', t:'Montant / القيمة', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Payé'?'Payée':r.statut)},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Imprimer" data-do="print">${icon('print')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], rows, {noPager:true, ph:"Rechercher un règlement, un employé…",
        onRow:r=>ReglementPersonnel.form(r),
        rowAction:(a,r)=>{
          if(a==='mod') ReglementPersonnel.form(r);
          if(a==='sup') confirmer('Supprimer ce règlement ?', `Le règlement <strong>${r.num}</strong> de ${r.personnel} sera supprimé.`,
            ()=>{ Store.remove('reglementsPeriode', r); toast('Règlement supprimé',''); App.render(); }, 'Supprimer');
        }})
  + totaux([["Règlements", String(rows.length)],
            ["Total payé", fmt.n(rows.filter(r=>r.statut==='Payé').reduce((s,r)=>s+r.montant,0),3)+" TND"],
            ["En attente", fmt.n(rows.filter(r=>r.statut!=='Payé').reduce((s,r)=>s+r.montant,0),3)+" TND"],
            ["Total général", fmt.n(rows.reduce((s,r)=>s+r.montant,0),3)+" TND"]]);
};

const ReglementPersonnel = {
  /* Le montant est proposé à partir des présences de la période et du type de rémunération */
  calcul(nom, du, au){
    const e = DB.employes.find(x=>x.nom===nom) || {};
    const p = { du, au, saison:null };
    const pres = DB.presences.filter(x=>x.nom===nom && x.statut==='Présent' && Store.dansIntervalle(x.date, p));
    const heures = pres.reduce((s,x)=>s+x.heures,0), jours = pres.reduce((s,x)=>s+x.jours,0);
    const montant = e.typeRem==='Heure' ? heures*(e.prix||0) : jours*(e.prix||0);
    return { mat:e.mat||'—', typeRem:e.typeRem||'Jour', prix:e.prix||0, heures, jours, montant:+montant.toFixed(3) };
  },

  form(r){
    modal({ title: r ? 'Modifier le règlement '+r.num : 'Ajouter un règlement personnel',
      body:`<div class="grid g-2">
          <div class="field"><label>Numéro</label><input class="input" data-f="num" value="${r?r.num:Store.num('RGP',4)}" readonly></div>
          <div class="field"><label>Date de règlement</label><input class="input" data-f="dateReglement" value="${r?r.dateReglement:Store.dateFR()}"></div>
          <div class="field span-2"><label>Personnel *</label>
            <select class="input select" data-f="personnel" id="rp-pers">
              ${DB.employes.map(e=>`<option ${r&&r.personnel===e.nom?'selected':''}>${e.nom}</option>`).join('')}</select></div>
          <div class="field"><label>Date de / من تاريخ</label><input class="input" data-f="dateDe" id="rp-du" value="${r?r.dateDe:'01/09/2026'}"></div>
          <div class="field"><label>Jusqu'à / إلى تاريخ</label><input class="input" data-f="jusqua" id="rp-au" value="${r?r.jusqua:Store.dateFR()}"></div>
          <div class="field"><label>Montant (TND) *</label><input class="input" type="number" step="0.001" data-f="montant" id="rp-mt" value="${r?r.montant:0}"></div>
          <div class="field"><label>Mode de règlement</label><select class="input select" data-f="mode">
            ${DB.modesPaiement.map(m=>`<option ${r&&r.mode===m?'selected':''}>${m}</option>`).join('')}</select></div>
          <div class="field"><label>Statut</label><select class="input select" data-f="statut">
            ${['En attente','Payé'].map(s=>`<option ${r&&r.statut===s?'selected':''}>${s}</option>`).join('')}</select></div>
        </div>
        <div class="note mt" id="rp-calc"></div>`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="rp-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        const maj = (majMontant)=>{
          const c = ReglementPersonnel.calcul(el('#rp-pers',ov).value, el('#rp-du',ov).value, el('#rp-au',ov).value);
          el('#rp-calc',ov).innerHTML = `Rémunération <strong>${c.typeRem==='Heure'?'à l’heure':'au jour'}</strong> à ${fmt.n(c.prix,3)} TND ·
            présences de la période : <strong>${c.typeRem==='Heure'?fmt.n(c.heures,1)+' heures':fmt.n(c.jours)+' jours'}</strong> ·
            montant calculé : <strong>${fmt.n(c.montant,3)} TND</strong>`;
          if(majMontant) el('#rp-mt',ov).value = c.montant;
          ov._calc = c;
        };
        ['#rp-pers','#rp-du','#rp-au'].forEach(s=>{ const n = el(s,ov); n.onchange = ()=>maj(true); });
        maj(!r);
        el('#rp-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.type==='number' ? (parseFloat(n.value)||0) : n.value);
          if(d.montant<=0) return toast('Une erreur est survenue','Le montant doit être supérieur à zéro.','err');
          const c = ov._calc || {};
          const obj = Object.assign({}, d, { mat:c.mat, jours:c.jours||0, heures:c.heures||0, saison:'Saison 2025/2026' });
          if(r){ Store.update('reglementsPeriode', r, obj, r.num); toast('Règlement modifié', r.num+' a été mis à jour.'); }
          else {
            Store.add('reglementsPeriode', obj, obj.num);
            if(obj.statut==='Payé')
              Store.operation({type:'Règlement personnel', tiers:obj.personnel, montant:-obj.montant,
                mode:obj.mode, motif:`Période du ${obj.dateDe} au ${obj.jusqua}`});
            toast('Règlement enregistré', `${obj.personnel} — ${fmt.n(obj.montant,3)} TND pour la période du ${obj.dateDe} au ${obj.jusqua}.`);
          }
          closeModal(); App.render();
        };
      }});
  }
};

PAGES['historique-reglement-personnel'] = () => {
  const f = Flt.get('hrgp', {personnel:''});
  let rows = DB.reglementsPeriode.filter(r=>Store.dansIntervalle(r.dateReglement, f) && Store.memeSaison(r, f));
  if(f.personnel) rows = rows.filter(r=>r.personnel===f.personnel);

  return pageHead("Historique règlement personnel / سجل تسويات الموظفين","Règlements versés par employé et par période")
  + Flt.bar('hrgp', [{k:'personnel', l:'Personnel', type:'select', options:()=>DB.employes.map(e=>e.nom)}])
  + dataTable('hrgpl', [
      {k:'num', t:'Numéro règlement / الرقم', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'dateReglement', t:'Date règlement / التاريخ'},
      {k:'dateDe', t:'Date de / من'},
      {k:'jusqua', t:"Jusqu'à / إلى"},
      {k:'personnel', t:'Personnel / العامل', render:r=>`<span class="strong">${r.personnel}</span>`},
      {k:'base', t:'Base', r:true, render:r=>r.heures ? fmt.n(r.heures,1)+' h' : fmt.n(r.jours)+' j'},
      {k:'mode', t:'Mode'},
      {k:'montant', t:'Montant / القيمة', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)}</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Payé'?'Payée':r.statut)}
    ], rows, {noPager:true, ph:"Rechercher…"})
  + totaux([["Règlements", String(rows.length)],
            ["Employés concernés", String(new Set(rows.map(r=>r.personnel)).size)],
            ["Total / إجمالي", fmt.n(rows.reduce((s,r)=>s+r.montant,0),3)+" TND"]]);
};

/* ------------------------------ Ventes ---------------------------------- */
PAGES.ventes = () => {
  const f = Flt.get('vte2', {client:''});
  let rows = DB.ventes.filter(v=>Store.memeSaison(v, f) && Store.dansIntervalle(v.date, f));
  if(f.client) rows = rows.filter(v=>v.client===f.client);

  return pageHead("Ventes / المبيعات","Ventes rattachées à un bon de livraison et à une saison",
    `<button class="btn btn-sm" data-go="bons-livraison">${icon('truck')}Bons de livraison</button>
     <button class="btn btn-sm btn-primary" data-crud="add:ventes">${icon('plus')}Ajouter</button>`)
  + Flt.bar('vte2', [{k:'client', l:'Client', type:'select', options:()=>DB.clients.map(c=>c.nom)}])
  + dataTable('vte2l', [
      {k:'num', t:'Numéro / الرقم', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date / التاريخ'},
      {k:'client', t:'Client / الزبون', render:r=>`<div class="strong">${r.client}</div><div class="cell-sub">${r.produit}</div>`},
      {k:'saison', t:'Saison / الموسم'},
      {k:'qte', t:'Quantité / الكمية', r:true, render:r=>`${fmt.n(r.qte)} <span class="muted">${r.unite}</span>`},
      {k:'ttc', t:'Total / إجمالي', r:true, render:r=>`<span class="strong">${fmt.n(r.ttc,3)}</span>`},
      {k:'paye', t:'Réglé', r:true, render:r=>`<span style="color:var(--ok)">${fmt.n(r.paye,3)}</span>`},
      {k:'reste', t:'Reste', r:true, render:r=>{const v=r.ttc-r.paye;
        return `<span style="font-weight:600;color:${v>0?'var(--warn)':'var(--ink-3)'}">${fmt.n(v,3)}</span>`;}},
      {k:'bl', t:'Bon de livraison', render:r=>r.bl!=='—'?`<span class="ref">${r.bl}</span>`:'<span class="muted">—</span>'},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},
        {i:'coins',t:'Encaisser',a:'pay'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], rows, {ph:"Rechercher une vente, un client…", entity:'ventes', per:10,
        rowAction:(a,r)=>{ if(a==='pay'){ const fac = DB.factures.find(x=>x.num===r.facture);
          if(fac) Encaissement.ouvrir(fac); else toast('Aucune facture rattachée',"Générez la facture de cette vente pour encaisser.",'warn'); }}})
  + totaux([["Ventes", String(rows.length)],
            ["Quantité totale", fmt.n(rows.reduce((s,v)=>s+v.qte,0))],
            ["Total / إجمالي", fmt.n(rows.reduce((s,v)=>s+v.ttc,0),3)+" TND"],
            ["Total réglé", fmt.n(rows.reduce((s,v)=>s+v.paye,0),3)+" TND"],
            ["Reste", fmt.n(rows.reduce((s,v)=>s+(v.ttc-v.paye),0),3)+" TND"]]);
};

/* ------------------------------ Bons de livraison ----------------------- */
PAGES['bons-livraison'] = () => {
  const f = Flt.get('bl2', {client:''});
  let rows = DB.livraisons.filter(l=>Store.memeSaison(l, f) && Store.dansIntervalle(l.date, f));
  if(f.client) rows = rows.filter(l=>l.client===f.client);

  return pageHead("Bons de livraison / سندات التسليم","Sorties de marchandises rattachées aux ventes",
    `<button class="btn btn-sm" data-go="ventes">${icon('cart')}Ventes</button>
     <button class="btn btn-sm btn-primary" data-crud="add:livraisons">${icon('plus')}Ajouter</button>`)
  + Flt.bar('bl2', [{k:'client', l:'Client', type:'select', options:()=>DB.clients.map(c=>c.nom)}])
  + dataTable('bl2l', [
      {k:'num', t:'Numéro / الرقم', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'client', t:'Client / الزبون', render:r=>`<span class="strong">${r.client}</span>`},
      {k:'date', t:'Date / التاريخ'},
      {k:'lots', t:'Lots livrés', render:r=>r.lots!=='—'?`<span class="ref" data-lot="${r.lots}" style="cursor:pointer">${r.lots}</span>`:'<span class="muted">—</span>'},
      {k:'transporteur', t:'Transporteur'},
      {k:'total', t:'Total / إجمالي', r:true, render:r=>`<span class="strong">${fmt.n(r.total||0,3)}</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut)},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'eye',t:'Consulter',a:'view'},{i:'edit',t:'Modifier',a:'edit'},
        {i:'print',t:'Imprimer',a:'print'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], rows, {ph:"Rechercher un bon de livraison, un client…", entity:'livraisons', per:10})
  + totaux([["Bons de livraison", String(rows.length)],
            ["Clients concernés", String(new Set(rows.map(l=>l.client)).size)],
            ["Total / إجمالي", fmt.n(rows.reduce((s,l)=>s+(l.total||0),0),3)+" TND"]]);
};
