/* ==========================================================================
   OLIVERA ERP — Paiements
   Trois modes de règlement : unique, mixte (plusieurs moyens en une
   opération) et échéancier (tranches planifiées). Le reste à payer et le
   statut de la facture sont recalculés à chaque validation.
   ========================================================================== */

const Encaissement = {
  facture:null, mode:'unique', lignes:[],

  ouvrir(f){
    this.facture = f; this.mode = 'unique';
    this.lignes = [{ montant: Store.reste(f), mode:'Espèces', ref:'', date:Store.dateFR(),
                     cheque:{num:'',banque:'BIAT',emission:Store.dateFR(),echeance:'',emetteur:f.client,statut:'En attente'} }];
    modal({ size:'wide', title:'Encaissement — '+f.num,
      body:`<div id="enc-body">${this.corps()}</div>`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="enc-ok">${icon('check')}Valider le paiement</button>`,
      onOpen: ov=> this.bind(ov)
    });
  },

  total(){ return this.lignes.reduce((s,l)=>s+(parseFloat(l.montant)||0),0); },

  corps(){
    const f = this.facture, reste = Store.reste(f), saisi = this.total(), ecart = reste - saisi;
    const lignes = this.lignes.map((l,i)=>`
      <div class="pay-line" data-i="${i}">
        <div class="field"><label>Montant (TND)</label>
          <input class="input" type="number" step="0.001" data-p="montant" value="${l.montant}"></div>
        <div class="field"><label>Mode de paiement</label>
          <select class="input select" data-p="mode">${DB.modesPaiement.map(m=>`<option ${m===l.mode?'selected':''}>${m}</option>`).join('')}</select></div>
        <div class="field"><label>${this.mode==='echeancier'?'Date d\'échéance':'Date'}</label>
          <input class="input" data-p="date" value="${l.date}"></div>
        <div class="field"><label>Référence</label>
          <input class="input" data-p="ref" value="${l.ref}" placeholder="${l.mode==='Virement'?'VIR-…':l.mode==='Chèque'?'N° chèque':'—'}"></div>
        <button class="icon-btn tip" data-tip="Retirer la ligne" data-del-line="${i}" ${this.lignes.length>1?'':'disabled'}>${icon('trash')}</button>
        ${l.mode==='Chèque' ? `
        <div class="cheque-box">
          <div class="tiny muted" style="margin-bottom:8px">Informations du chèque — conservées dans le suivi des chèques</div>
          <div class="grid g-4 gap-sm">
            <div class="field"><label>Numéro du chèque</label><input class="input" data-c="num" value="${l.cheque.num}" placeholder="CHQ-…"></div>
            <div class="field"><label>Banque</label><select class="input select" data-c="banque">${DB.banques.map(b=>`<option ${b===l.cheque.banque?'selected':''}>${b}</option>`).join('')}</select></div>
            <div class="field"><label>Date d'émission</label><input class="input" data-c="emission" value="${l.cheque.emission}"></div>
            <div class="field"><label>Date d'échéance</label><input class="input" data-c="echeance" value="${l.cheque.echeance}" placeholder="JJ/MM/AAAA"></div>
            <div class="field span-2"><label>Émetteur</label><input class="input" data-c="emetteur" value="${l.cheque.emetteur}"></div>
            <div class="field span-2"><label>Statut du chèque</label><select class="input select" data-c="statut">
              ${['En attente','Déposé','Encaissé','Rejeté'].map(s=>`<option ${s===l.cheque.statut?'selected':''}>${s}</option>`).join('')}</select></div>
          </div>
        </div>`:''}
      </div>`).join('');

    return `
      <div class="grid g-3" style="margin-bottom:16px">
        <article class="card kpi"><div class="kpi-label">Montant total</div><div class="kpi-value" style="font-size:21px">${fmt.n(f.ttc,3)}<small>TND</small></div></article>
        <article class="card kpi"><div class="kpi-label">Montant déjà payé</div><div class="kpi-value" style="font-size:21px;color:var(--ok)">${fmt.n(f.paye,3)}<small>TND</small></div></article>
        <article class="card kpi"><div class="kpi-label">Reste à payer</div><div class="kpi-value" style="font-size:21px;color:${reste?'var(--warn)':'var(--ok)'}">${fmt.n(reste,3)}<small>TND</small></div></article>
      </div>

      <div class="seg" id="enc-mode" style="margin-bottom:14px">
        <button class="${this.mode==='unique'?'on':''}" data-m="unique">Paiement unique</button>
        <button class="${this.mode==='mixte'?'on':''}" data-m="mixte">Paiement mixte</button>
        <button class="${this.mode==='echeancier'?'on':''}" data-m="echeancier">Paiement par tranches</button>
      </div>
      <div class="tiny muted" style="margin-bottom:12px">${
        this.mode==='unique' ? "Le client règle la totalité du reste dû en un seul moyen de paiement."
        : this.mode==='mixte' ? "Plusieurs moyens de paiement dans une même opération. La somme doit être égale au montant encaissé."
        : "Les tranches sont planifiées et enregistrées comme prévues ; elles seront marquées payées à leur échéance."}</div>

      ${lignes}

      ${this.mode!=='unique'?`<button class="btn btn-sm" id="enc-add" style="margin-top:4px">${icon('plus')}Ajouter une tranche</button>`:''}

      <div class="totals" style="border-radius:12px;margin-top:16px;border-top:0">
        <div class="tot-l"><span>Total saisi</span><span>${fmt.n(saisi,3)} TND</span></div>
        <div class="tot-l"><span>Reste après opération</span><span style="color:${ecart<0?'var(--danger)':'var(--ink)'}">${fmt.n(ecart,3)} TND</span></div>
        ${ecart<0?`<div class="blocked" style="margin-top:10px">${icon('alert-triangle')}
          <div class="tiny">Le total saisi dépasse le reste à payer de ${fmt.n(-ecart,3)} TND. Corrigez les montants avant de valider.</div></div>`:''}
      </div>`;
  },

  bind(ov){
    const redraw = ()=>{ el('#enc-body',ov).innerHTML = this.corps(); this.bind(ov); };
    els('#enc-mode button', ov).forEach(b=> b.onclick = ()=>{
      this.mode = b.dataset.m;
      if(this.mode==='unique') this.lignes = [this.lignes[0]];
      if(this.mode==='unique') this.lignes[0].montant = Store.reste(this.facture);
      redraw();
    });
    els('.pay-line', ov).forEach(box=>{
      const i = +box.dataset.i;
      els('[data-p]', box).forEach(inp=> inp.onchange = ()=>{
        this.lignes[i][inp.dataset.p] = inp.dataset.p==='montant' ? (parseFloat(inp.value)||0) : inp.value;
        redraw();
      });
      els('[data-c]', box).forEach(inp=> inp.onchange = ()=> this.lignes[i].cheque[inp.dataset.c] = inp.value);
    });
    els('[data-del-line]', ov).forEach(b=> b.onclick = ()=>{
      this.lignes.splice(+b.dataset.delLine,1); redraw();
    });
    const add = el('#enc-add', ov);
    if(add) add.onclick = ()=>{
      const reste = Math.max(0, Store.reste(this.facture) - this.total());
      this.lignes.push({ montant:reste, mode:'Espèces', ref:'', date:Store.dateFR(),
        cheque:{num:'',banque:'BIAT',emission:Store.dateFR(),echeance:'',emetteur:this.facture.client,statut:'En attente'} });
      redraw();
    };
    el('#enc-ok', ov).onclick = ()=> this.valider();
  },

  valider(){
    const f = this.facture, saisi = this.total(), reste = Store.reste(f);
    if(saisi <= 0)       return toast('Une erreur est survenue','Le montant du paiement doit être supérieur à zéro.','err');
    if(saisi > reste+0.001) return toast('Montant incorrect',`Le total des tranches (${fmt.n(saisi,3)} TND) dépasse le reste à payer (${fmt.n(reste,3)} TND).`,'err');
    const chequeIncomplet = this.lignes.find(l=>l.mode==='Chèque' && !l.cheque.num);
    if(chequeIncomplet)  return toast('Chèque incomplet','Renseignez le numéro du chèque avant de valider.','err');

    const tranches = this.lignes.map(l=>({ ...l, statut: this.mode==='echeancier' ? 'Prévue' : 'Payée' }));
    const recu = Store.encaisser(f, tranches);
    closeModal();
    toast('Paiement enregistré avec succès',
      `${f.num} — ${fmt.n(f.paye,3)} TND payés sur ${fmt.n(f.ttc,3)} TND. Reste : ${fmt.n(Store.reste(f),3)} TND.`);
    App.render();
    Recu.apercu(recu);
  }
};

/* ============================ Échéancier ================================ */
const Echeancier = {
  ouvrir(f){
    const lignes = f.tranches.length ? f.tranches.map((t,i)=>`
      <tr><td class="c">${t.n}</td><td>${t.date}</td><td class="r strong">${fmt.n(t.montant,3)} TND</td>
        <td>${t.mode}</td><td class="mono">${t.ref}</td><td>${statutBadge(t.statut)}</td>
        <td class="r"><div class="row-actions">
          ${t.statut!=='Payée'?`<button class="icon-btn tip" data-tip="Marquer comme payée" data-pay="${i}">${icon('check')}</button>`:''}
          <button class="icon-btn tip" data-tip="Supprimer la tranche" data-rm="${i}">${icon('trash')}</button>
        </div></td></tr>`).join('')
      : `<tr><td colspan="7"><div class="empty">${icon('calendar')}<div class="empty-t">Aucune tranche planifiée</div>
          <div class="empty-d">Ajoutez une tranche ou enregistrez directement un paiement.</div></div></td></tr>`;

    modal({ size:'wide', title:'Échéancier de paiement — '+f.num,
      body:`<div class="grid g-3" style="margin-bottom:16px">
          <article class="card kpi"><div class="kpi-label">Montant total</div><div class="kpi-value" style="font-size:20px">${fmt.n(f.ttc,3)}<small>TND</small></div></article>
          <article class="card kpi"><div class="kpi-label">Montant payé</div><div class="kpi-value" style="font-size:20px;color:var(--ok)">${fmt.n(f.paye,3)}<small>TND</small></div></article>
          <article class="card kpi"><div class="kpi-label">Reste à payer</div><div class="kpi-value" style="font-size:20px;color:${Store.reste(f)?'var(--warn)':'var(--ok)'}">${fmt.n(Store.reste(f),3)}<small>TND</small></div></article>
        </div>
        <div class="progress" style="margin-bottom:16px"><i style="width:${(f.paye/f.ttc*100).toFixed(1)}%"></i></div>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th class="c">Tranche</th><th>Date</th><th class="r">Montant</th><th>Mode de paiement</th><th>Référence</th><th>Statut</th><th></th></tr></thead>
          <tbody>${lignes}</tbody></table></div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" id="ech-add">${icon('plus')}Ajouter une tranche</button>
            <button class="btn" id="ech-recu">${icon('print')}Imprimer un reçu</button>
            <button class="btn btn-primary" id="ech-enc" ${Store.reste(f)?'':'disabled'}>${icon('coins')}Encaisser</button>`,
      onOpen: ov=>{
        els('[data-pay]', ov).forEach(b=> b.onclick = ()=>{
          const t = f.tranches[+b.dataset.pay];
          t.statut = 'Payée'; f.paye = Math.min(f.ttc, f.paye + t.montant);
          DB.paiements.unshift({ num:Store.num('REG'), date:Store.dateFR(), tiers:f.client, type:'Client', mode:t.mode, montant:t.montant, doc:f.num });
          DB.tresorerie[t.mode==='Espèces'?'caisse':'banque'] += t.montant;
          Store.log('Encaissement de tranche', f.num, 'Prévue', 'Payée');
          toast('Tranche encaissée', `${fmt.n(t.montant,3)} TND enregistrés sur ${f.num}.`);
          closeModal(); App.render(); Echeancier.ouvrir(f);
        });
        els('[data-rm]', ov).forEach(b=> b.onclick = ()=>{
          const t = f.tranches[+b.dataset.rm];
          confirmer('Supprimer cette tranche ?', `Tranche ${t.n} — ${fmt.n(t.montant,3)} TND. ${t.statut==='Payée'?'Le montant sera retiré du total payé.':''}`,
            ()=>{ if(t.statut==='Payée') f.paye = Math.max(0, f.paye - t.montant);
                  f.tranches.splice(+b.dataset.rm,1); f.tranches.forEach((x,i)=>x.n=i+1);
                  Store.log('Suppression de tranche', f.num); toast('Tranche supprimée','');
                  closeModal(); App.render(); Echeancier.ouvrir(f); }, 'Supprimer');
        });
        el('#ech-add', ov).onclick = ()=> formModal({
          title:'Ajouter une tranche', okLabel:'Ajouter la tranche',
          fields:[
            {k:'montant', l:'Montant (TND)', type:'number', step:'0.001', req:true, def:Store.reste(f)},
            {k:'date', l:'Date d\'échéance', req:true, def:'15/10/2026'},
            {k:'mode', l:'Mode de paiement', type:'select', options:DB.modesPaiement},
            {k:'ref', l:'Référence', ph:'N° de chèque, de virement…'},
            {k:'statut', l:'Statut', type:'select', options:['Prévue','Payée']}
          ],
          onSave: d=>{
            if(d.montant > Store.reste(f)+0.001)
              return toast('Montant incorrect', `La tranche dépasse le reste à payer (${fmt.n(Store.reste(f),3)} TND).`, 'err');
            f.tranches.push({ n:f.tranches.length+1, date:d.date, montant:d.montant, mode:d.mode, ref:d.ref||'—', statut:d.statut });
            if(d.statut==='Payée'){ f.paye = Math.min(f.ttc, f.paye + d.montant);
              DB.paiements.unshift({ num:Store.num('REG'), date:d.date, tiers:f.client, type:'Client', mode:d.mode, montant:d.montant, doc:f.num }); }
            Store.log('Ajout de tranche', f.num, '—', fmt.n(d.montant,3)+' TND');
            toast('Tranche ajoutée', `${fmt.n(d.montant,3)} TND planifiés au ${d.date}.`);
            App.render(); Echeancier.ouvrir(f);
          }});
        el('#ech-enc', ov).onclick = ()=>{ closeModal(); Encaissement.ouvrir(f); };
        el('#ech-recu', ov).onclick = ()=> Recu.apercu({
          num:'REÇU-'+f.num.slice(4), date:Store.dateFR(), heure:Store.heureFR(), client:f.client, facture:f.num,
          total:f.ttc, paye:f.paye, reste:Store.reste(f), tranches:f.tranches.filter(t=>t.statut==='Payée'), user:DB.user.nom });
      }
    });
  }
};

/* ============================ Reçu de paiement ========================== */
const Recu = {
  html(r){
    return `<div class="invoice" id="recu-print" style="max-width:640px">
      <div class="inv-top">
        <div><div class="inv-co">${DB.societe.nom}</div>
          <div style="margin-top:6px;line-height:1.6">${DB.societe.adresse}<br>Tél. ${DB.societe.tel}<br>MF ${DB.societe.mf}</div></div>
        <div class="inv-meta"><div class="inv-h1">REÇU DE PAIEMENT</div>
          <div style="margin-top:6px;line-height:1.7">N° <strong>${r.num}</strong><br>${r.date} à ${r.heure}<br>Facture ${r.facture}</div></div>
      </div>
      <div class="inv-parties">
        <div class="inv-box"><div class="inv-lab">Reçu de</div><strong>${r.client}</strong></div>
        <div class="inv-box"><div class="inv-lab">Encaissé par</div><strong>${r.user}</strong><br>${DB.user.role}</div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Mode de paiement</th><th>Référence</th><th class="r">Montant</th></tr></thead>
        <tbody>${(r.tranches||[]).map(t=>`<tr><td>${t.date}</td><td>${t.mode}</td>
          <td>${t.ref && t.ref!=='—' ? t.ref : (t.cheque && t.cheque.num) || '—'}</td>
          <td class="r">${fmt.n(t.montant,3)} TND</td></tr>`).join('')}</tbody>
      </table>
      <div class="inv-tot"><table>
        <tr><td>Montant total de la facture</td><td class="r">${fmt.n(r.total,3)} TND</td></tr>
        <tr><td>Montant payé</td><td class="r">${fmt.n(r.paye,3)} TND</td></tr>
        <tr class="grand"><td>Reste à payer</td><td class="r">${fmt.n(r.reste,3)} TND</td></tr>
      </table></div>
      <div class="inv-foot">Reçu établi par ${r.user} pour le compte de ${DB.societe.nom}. Ce document atteste du règlement des montants détaillés ci-dessus.</div>
    </div>`;
  },
  apercu(r){
    modal({ size:'wide', title:'Reçu de paiement '+r.num,
      body:`<div class="print-preview">${this.html(r)}</div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" id="rc-pdf">${icon('download')}Télécharger PDF</button>
            <button class="btn btn-primary" id="rc-print">${icon('print')}Imprimer</button>`,
      onOpen: ov=>{
        el('#rc-print',ov).onclick = ()=> window.print();
        el('#rc-pdf',ov).onclick = ()=> toast('PDF généré', `Le reçu ${r.num} a été enregistré dans vos téléchargements.`, 'info');
      }});
  }
};

/* ============================ Écran Paiements =========================== */
PAGES.paiements = () => {
  const k = Store.kpis();
  const fac = DB.factures;
  return pageHead("Paiements","Règlements clients : paiement unique, mixte ou par tranches",
    `<button class="btn btn-sm" data-go="cheques">${icon('cheque')}Suivi des chèques</button>
     <button class="btn btn-sm btn-primary" id="pay-new">${icon('coins')}Enregistrer un paiement</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Total facturé", fmt.n(fac.reduce((s,f)=>s+f.ttc,0),3)],
         ["Total encaissé", fmt.n(fac.reduce((s,f)=>s+f.paye,0),3)],
         ["Reste à recouvrer", fmt.n(fac.reduce((s,f)=>s+Store.reste(f),0),3)],
         ["Factures en retard", String(fac.filter(f=>Store.statutFacture(f)==='En retard').length)]]
        .map(([l,v])=>`<article class="card kpi"><div class="kpi-label">${l}</div>
          <div class="kpi-value" style="font-size:21px">${v}</div></article>`).join('')}
     </div>`
  + dataTable('facpay', [
      {k:'num', t:'Facture', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'client', t:'Client'},
      {k:'echeance', t:'Échéance'},
      {k:'ttc', t:'Montant total', r:true, render:r=>fmt.n(r.ttc,3)},
      {k:'paye', t:'Montant payé', r:true, render:r=>`<span style="color:var(--ok);font-weight:600">${fmt.n(r.paye,3)}</span>`},
      {k:'reste', t:'Reste à payer', r:true, render:r=>{const v=Store.reste(r);
        return `<span style="font-weight:600;color:${v?'var(--warn)':'var(--ink-3)'}">${fmt.n(v,3)}</span>`;}},
      {k:'avancement', t:'Avancement', render:r=>`<div class="progress" style="width:110px"><i style="width:${(r.paye/r.ttc*100).toFixed(0)}%"></i></div>
        <div class="cell-sub">${(r.paye/r.ttc*100).toFixed(0)} % · ${r.tranches.length} tranche${r.tranches.length>1?'s':''}</div>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(Store.statutFacture(r))},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Encaisser" data-enc>${icon('coins')}</button>
        <button class="icon-btn tip" data-tip="Échéancier" data-ech>${icon('calendar')}</button>
        <button class="icon-btn tip" data-tip="Imprimer un reçu" data-rec>${icon('print')}</button></div>`}
    ], DB.factures,
    { ph:"Rechercher une facture, un client…", per:10, entity:null,
      filters:[
        {k:'client', t:'Client', options:()=>[...new Set(DB.factures.map(f=>f.client))]},
        {k:'statut', t:'Statut', options:['Payée','Partiellement payée','En attente','En retard'], get:f=>Store.statutFacture(f)},
        {k:'mode', t:'Mode utilisé', options:()=>DB.modesPaiement, get:f=>f.tranches.map(t=>t.mode).join(' ')}
      ],
      onRow:f=>Echeancier.ouvrir(f) })
  + `<div style="height:16px"></div>`
  + card("Historique des règlements", dataTable('regs', [
      {k:'num', t:'Règlement', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'tiers', t:'Tiers'}, {k:'type', t:'Type'}, {k:'mode', t:'Mode'},
      {k:'doc', t:'Document', render:r=>`<span class="ref">${r.doc}</span>`},
      {k:'montant', t:'Montant', r:true, render:r=>`<span style="font-weight:600;color:${r.montant<0?'var(--danger)':'var(--ok)'}">${fmt.n(r.montant,3)} TND</span>`}
    ], DB.paiements, { per:6,
      filters:[
        {k:'type', t:'Type', options:['Client','Fournisseur','Producteur']},
        {k:'mode', t:'Mode', options:()=>DB.modesPaiement}
      ]}), {flush:true});
};

/* ============================ Écran Chèques ============================= */
PAGES.cheques = () => pageHead("Suivi des chèques","Chèques reçus, déposés, encaissés ou rejetés",
  `<button class="btn btn-sm" data-go="paiements">${icon('coins')}Paiements</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${['En attente','Déposé','Encaissé','Rejeté'].map(s=>{
        const l = DB.cheques.filter(c=>c.statut===s);
        return `<article class="card kpi"><div class="kpi-label">${s}</div>
          <div class="kpi-value" style="font-size:21px">${fmt.n(l.reduce((a,c)=>a+c.montant,0),3)}<small>TND</small></div>
          <div class="kpi-foot"><span class="tiny muted">${l.length} chèque${l.length>1?'s':''}</span></div></article>`;}).join('')}
     </div>`
  + dataTable('chq', [
      {k:'num', t:'N° chèque', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'banque', t:'Banque'},
      {k:'emetteur', t:'Émetteur'},
      {k:'emission', t:"Date d'émission"},
      {k:'echeance', t:"Date d'échéance"},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'facture', t:'Facture', render:r=>`<span class="ref">${r.facture}</span>`},
      {k:'statut', t:'Statut', render:r=>statutBadge(r.statut==='Encaissé'?'Payée':r.statut==='Rejeté'?'En retard':r.statut==='Déposé'?'En cours':'En attente')
        .replace('Payée','Encaissé').replace('En retard','Rejeté').replace('En cours','Déposé')},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Changer le statut" data-chq>${icon('edit')}</button></div>`}
    ], DB.cheques, { ph:"Rechercher un chèque, une banque, un émetteur…",
      filters:[
        {k:'banque', t:'Banque', options:()=>DB.banques},
        {k:'statut', t:'Statut', options:['En attente','Déposé','Encaissé','Rejeté']}
      ]});
