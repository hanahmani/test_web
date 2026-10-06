/* ==========================================================================
   OLIVERA ERP — Bon d'entrée huile · Stock · Statistiques et états
   ========================================================================== */

/* ==========================  BON D'ENTRÉE HUILE  ======================== */
PAGES['bons-entree-huile'] = () => {
  const f = Flt.get('beh', {pile:'', br:''});
  let rows = Store.filtrer(DB.behs, f);
  if(f.pile) rows = rows.filter(b=>b.pile===f.pile);
  if(f.br)   rows = rows.filter(b=>(b.br||'').includes(f.br));

  return pageHead("Bon d'entrée huile / أمر دخول الزيت","Entrée de l'huile en pile avec contrôle qualité",
    `<button class="btn btn-sm" data-go="piles">${icon('boxes')}Piles à huile</button>
     <button class="btn btn-sm btn-primary" id="beh-add">${icon('plus')}Ajouter</button>`)
  + Flt.bar('beh', [
      {k:'pile', l:'Pile', type:'select', options:()=>DB.pilesHuile.map(p=>p.num)},
      {k:'br', l:'Bon de réception', ph:'000001'}
    ])
  + dataTable('behl', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date', render:r=>`${r.date}<div class="cell-sub">${r.heure}</div>`},
      {k:'br', t:'Bon réception', render:r=>r.br?`<span class="ref">${r.br}</span>`:'<span class="muted">—</span>'},
      {k:'organo', t:'Organoleptique', render:r=>`<span class="badge ${r.organo==='EXTRA VIERGE'?'ok':r.organo==='LAMPANTE'?'danger':'info'} no-dot">${r.organo}</span>`},
      {k:'rendement', t:'CMP / Rendement', r:true, render:r=>r.rendement
        ? `${fmt.n(r.rendement,2)} %<div class="cell-sub">CMP ${fmt.n(r.prixUnitaire,3)}</div>`
        : `<span class="muted">—</span><div class="cell-sub">CMP ${fmt.n(r.prixUnitaire,3)}</div>`},
      {k:'qteHuile', t:'Quantité huile', r:true, render:r=>`<span class="strong">${fmt.n(r.qteHuile,1)} kg</span>`},
      {k:'qteOlives', t:'Quantité olives', r:true, render:r=>r.qteOlives?fmt.n(r.qteOlives)+' kg':'<span class="muted">—</span>'},
      {k:'prixTotal', t:'Prix total', r:true, render:r=>fmt.n(r.prixTotal,3)},
      {k:'pile', t:'Pile', render:r=>`<span class="ref">${r.pile}</span>`},
      {k:'nature', t:'Nature'},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Consulter" data-do="voir">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="mod">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Historique de la pile" data-do="pile">${icon('history')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="sup">${icon('trash')}</button></div>`}
    ], rows, {ph:"Rechercher un bon, une pile, un lot…", per:10,
        onRow:b=>DocBEH.voir(b),
        rowAction:(a,r)=>{
          if(a==='voir') DocBEH.voir(r);
          if(a==='mod')  DocBEH.form(r);
          if(a==='pile') App.go('etat-pile-date', {pile:r.pile});
          if(a==='sup')  confirmer("Supprimer ce bon d'entrée huile ?",
            `Le bon <strong>${r.num}</strong> sera supprimé et ${fmt.n(r.qteHuile,1)} kg seront retirés de la pile ${r.pile}.`,
            ()=>{ Store.mouvementPile(r.pile, r.qteHuile, -1, r.num, 'Sortie', 'Annulation '+r.num);
                  const br = DB.bonsReception.find(x=>x.beh===r.num); if(br) br.beh = null;
                  Store.remove('behs', r); toast("Bon d'entrée huile supprimé",''); App.render(); }, 'Supprimer');
        }})
  + totaux([["Bons affichés", String(rows.length)],
            ["Total huile", fmt.n(rows.reduce((s,b)=>s+b.qteHuile,0),1)+" kg"],
            ["Total olives", fmt.n(rows.reduce((s,b)=>s+b.qteOlives,0))+" kg"],
            ["Rendement moyen", fmt.pct(rows.reduce((s,b)=>s+b.qteOlives,0) ? rows.reduce((s,b)=>s+b.qteHuile,0)/rows.reduce((s,b)=>s+b.qteOlives,0)*100 : 0)],
            ["Total montant", fmt.n(rows.reduce((s,b)=>s+b.prixTotal,0),3)+" TND"]]);
};

const DocBEH = {
  form(beh, brSource, bpSource){
    const brs = DB.bonsReception.filter(b=>!b.beh || (beh && b.num===beh.br));
    modal({ size:'wide', title: beh ? "Modifier le bon d'entrée huile "+beh.num : "Ajout bon d'entrée huile / إضافة أمر دخول الزيت",
      body:`<div class="grid g-2" style="gap:18px">
          <div class="grid g-2 gap-sm">
            <div class="field span-2"><label>Nature de l'opération / طبيعة العملية</label>
              <select class="input select" data-f="nature" id="beh-nature">
                ${DB.naturesBEH.map(n=>`<option ${beh&&beh.nature===n?'selected':''}>${n}</option>`).join('')}</select></div>
            <div class="field"><label>Date / التاريخ</label><input class="input" data-f="date" value="${beh?beh.date:Store.dateFR()}"></div>
            <div class="field"><label>Heure / الوقت</label><input class="input" data-f="heure" value="${beh?beh.heure:Store.heureFR()}"></div>
            <div class="field"><label>Prix unitaire / السعر</label><input class="input" type="number" step="0.001" data-f="prixUnitaire" id="beh-pu" value="${beh?beh.prixUnitaire:0}"></div>
            <div class="field"><label>Organoleptique / الخاصية</label>
              <select class="input select" data-f="organo">
                ${DB.organoleptiques.filter(o=>o.actif).map(o=>`<option ${beh&&beh.organo===o.libelle?'selected':''}>${o.libelle}</option>`).join('')}</select></div>
          </div>
          <div class="grid g-2 gap-sm">
            <div class="field span-2"><label>Bon de réception / مذكرة الاستلام</label>
              <select class="input select" data-f="br" id="beh-br">
                <option value="">— Sans bon de réception (achat direct) —</option>
                ${brs.map(b=>`<option value="${b.num}" ${((beh&&beh.br===b.num)||(brSource&&brSource.num===b.num))?'selected':''}>${b.num} — ${b.tiers} — ${b.nature}</option>`).join('')}
              </select></div>
            <div class="field span-2"><label>Fournisseur / Client</label>
              <select class="input select" data-f="tiers" id="beh-tiers">
                ${[...DB.fournisseurs.map(f=>f.nom), ...DB.clients.map(c=>c.nom), 'Huilerie El Fejja']
                  .map(x=>`<option ${beh&&beh.tiers===x?'selected':''}>${x}</option>`).join('')}</select></div>
            <div class="field"><label>Transporteur / الناقل</label>
              <select class="input select" data-f="transporteur">
                ${DB.transporteurs.map(t=>`<option ${beh&&beh.transporteur===t.nom?'selected':''}>${t.nom}</option>`).join('')}</select></div>
            <div class="field"><label>Matricule véhicule</label>
              <select class="input select" data-f="matricule">
                ${[...new Set(DB.transporteurs.flatMap(t=>t.matricules||[]))].map(m=>`<option ${beh&&beh.matricule===m?'selected':''}>${m}</option>`).join('')}</select></div>
          </div>
        </div>

        <div class="card mt" style="margin-top:16px">
          <div class="card-head"><div class="card-title">Ligne bon d'entrée huile / سطر أمر دخول الزيت</div></div>
          <div class="card-body">
            <div class="grid g-4 gap-sm">
              <div class="field"><label>Acidité / حموضة</label><input class="input" type="number" step="0.01" data-f="acidite" id="beh-acid" value="${beh?beh.acidite:0}"></div>
              <div class="field"><label>K232</label><input class="input" type="number" step="0.01" data-f="k232" value="${beh?beh.k232:0}"></div>
              <div class="field"><label>K270</label><input class="input" type="number" step="0.01" data-f="k270" value="${beh?beh.k270:0}"></div>
              <div class="field"><label>Quantité olives (kg)</label><input class="input" type="number" data-f="qteOlives" id="beh-ol" value="${beh?beh.qteOlives:(bpSource?bpSource.qteOlives:0)}"></div>
              <div class="field"><label>Poids brut / الوزن الإجمالي</label><input class="input" type="number" data-f="brut" id="beh-brut" value="${beh?beh.brut:0}"></div>
              <div class="field"><label>Poids vide / وزن فارغ</label><input class="input" type="number" data-f="vide" id="beh-vide" value="${beh?beh.vide:0}"></div>
              <div class="field"><label>Qté huile (kg) / كمية الزيت</label><input class="input" type="number" step="0.1" data-f="qteHuile" id="beh-huile" value="${beh?beh.qteHuile:(bpSource?bpSource.qteHuile:0)}"></div>
              <div class="field"><label>Prix total / السعر الإجمالي</label><input class="input" data-f="prixTotal" id="beh-total" value="${beh?fmt.n(beh.prixTotal,3):'0,000'}" readonly></div>
            </div>
            <div class="note mt" id="beh-alerte"></div>
          </div>
        </div>

        <div class="card mt" style="margin-top:16px">
          <div class="card-head"><div class="card-title">Pile de destination / كومة</div></div>
          <div class="card-body">
            <div class="table-wrap"><table class="tbl">
              <thead><tr><th>Pile</th><th class="r">Qté actuelle</th><th class="r">Qté entrée</th><th class="r">Quantité dispo</th><th class="r">Quantité max</th><th class="r">Coût / CMP</th><th class="c">Choix</th></tr></thead>
              <tbody>${DB.pilesHuile.map(p=>`<tr>
                <td><span class="ref">${p.num}</span><div class="cell-sub">${p.designation}</div></td>
                <td class="r">${fmt.n(p.qte)} kg</td>
                <td class="r beh-pile-e" data-p="${p.num}">—</td>
                <td class="r">${fmt.n(Store.restePile(p))} kg</td>
                <td class="r">${fmt.n(p.qteMax)} kg</td>
                <td class="r">${fmt.n(Store.cmpPile(p),3)}</td>
                <td class="c"><input type="radio" name="beh-pile" value="${p.num}" ${((beh&&beh.pile===p.num)||(!beh&&p.num==='P01'))?'checked':''}></td>
              </tr>`).join('')}</tbody>
            </table></div>
          </div>
        </div>
        <div class="totaux-bar" id="beh-tot"></div>`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="beh-ok">${icon('check')}Enregistrer</button>`,
      onOpen(ov){
        const maj = ()=>{
          const brNum = el('#beh-br',ov).value;
          const br = DB.bonsReception.find(b=>b.num===brNum);
          if(br){ el('#beh-tiers',ov).value = br.tiers; if(!beh && br.lignes[0]) el('#beh-pu',ov).value = br.lignes[0].prixHuile; }
          const brut = +el('#beh-brut',ov).value||0, vide = +el('#beh-vide',ov).value||0;
          if(brut>0) el('#beh-huile',ov).value = Math.max(0, brut - vide);
          const hu = +el('#beh-huile',ov).value||0, ol = +el('#beh-ol',ov).value||0, pu = +el('#beh-pu',ov).value||0;
          const rdt = ol ? hu/ol*100 : 0, total = hu*pu;
          el('#beh-total',ov).value = fmt.n(total,3);
          const pile = ov.querySelector('input[name="beh-pile"]:checked');
          els('.beh-pile-e',ov).forEach(td=> td.textContent = (pile && td.dataset.p===pile.value) ? fmt.n(hu,1)+' kg' : '—');
          const p = pile ? Store.pile(pile.value) : null;
          const depasse = p && (p.qte + hu > p.qteMax);
          const acid = +el('#beh-acid',ov).value||0;
          const organo = ov.querySelector('[data-f="organo"]').value;
          const ref = DB.organoleptiques.find(o=>o.libelle===organo);
          const incoherent = ref && acid > ref.acidMax;
          el('#beh-alerte',ov).innerHTML = depasse
            ? `<span style="color:var(--danger);font-weight:600">La pile ${p.num} ne peut recevoir que ${fmt.n(Store.restePile(p),1)} kg.</span>`
            : incoherent
            ? `<span style="color:var(--warn);font-weight:600">Acidité de ${fmt.n(acid,2)} % incompatible avec « ${organo} » (maximum ${fmt.n(ref.acidMax,2)} %).</span>`
            : `Quantité huile = poids brut − poids vide lorsqu'une pesée est saisie. Rendement calculé sur la quantité d'olives.`;
          el('#beh-tot',ov).innerHTML = `
            <div><span>Rendement</span><strong>${fmt.n(rdt,2)} %</strong></div>
            <div><span>Quantité huile</span><strong>${fmt.n(hu,1)} kg</strong></div>
            <div><span>Prix total</span><strong>${fmt.n(total,3)} TND</strong></div>
            <div><span>Pile</span><strong>${pile?pile.value:'—'}</strong></div>`;
        };
        els('input,select', ov).forEach(n=>{ n.oninput = maj; n.onchange = maj; });
        maj();
        el('#beh-ok',ov).onclick = ()=>{
          const d = {}; els('[data-f]',ov).forEach(n=> d[n.dataset.f] = n.type==='number' ? (parseFloat(n.value)||0) : n.value);
          const pileNode = ov.querySelector('input[name="beh-pile"]:checked');
          if(!pileNode) return toast('Une erreur est survenue','Sélectionnez la pile de destination.','err');
          if(d.qteHuile<=0) return toast('Quantité incorrecte',"La quantité d'huile doit être supérieure à zéro.",'err');
          const pile = Store.pile(pileNode.value);
          const ancienne = beh ? beh.qteHuile : 0;
          if(pile.qte - ancienne + d.qteHuile > pile.qteMax + 0.001)
            return toast('Capacité dépassée', `La pile ${pile.num} ne peut pas recevoir cette quantité.`, 'err');
          const total = d.qteHuile * d.prixUnitaire;
          const obj = Object.assign({}, d, { pile:pileNode.value, prixTotal:+total.toFixed(3),
            rendement: d.qteOlives ? +(d.qteHuile/d.qteOlives*100).toFixed(2) : 0,
            tiersType: DB.clients.some(c=>c.nom===d.tiers) ? 'Client' : 'Fournisseur',
            statut:'Validé', paye:false, saison: Flt.get('beh').saison || 'Saison 2025/2026',
            num: beh ? beh.num : Store.num('BEH',4) });
          /* Serveur présent : le bon, la pile, le CMP et le mouvement sont
             écrits par une transaction unique côté base. */
          if(!beh && typeof API !== 'undefined' && API.actif){
            API.metier('beh', obj).then(r=>{
              Store.sansPersistance(()=>{
                Store.add('behs', obj, obj.num);
                Store.mouvementPile(obj.pile, obj.qteHuile, 1, obj.num, 'Entrée', obj.nature, obj.prixTotal);
                const br = DB.bonsReception.find(b=>b.num===obj.br); if(br) br.beh = obj.num;
              });
              const pile = Store.pile(obj.pile);
              if(r.pile){ pile.qte = r.pile.qte; pile.prixTotal = r.pile.prixTotal; }
              toast("Bon d'entrée huile enregistré",
                `${fmt.n(obj.qteHuile,1)} kg ajoutés à la pile ${obj.pile} — nouveau stock ${fmt.n(pile.qte,1)} kg.`);
              App.render();
            }).catch(e=> toast('Opération refusée par le serveur', e.message, 'err'));
            closeModal();
            return;
          }
          if(beh){
            Store.mouvementPile(beh.pile, ancienne, -1, beh.num, 'Sortie', 'Correction '+beh.num);
            Store.update('behs', beh, obj, beh.num);
            Store.mouvementPile(obj.pile, obj.qteHuile, 1, obj.num, 'Entrée', 'Correction '+obj.num, obj.prixTotal);
            toast("Bon d'entrée huile modifié", `${obj.num} — pile ${obj.pile} mise à jour.`);
          } else {
            Store.add('behs', obj, obj.num);
            Store.mouvementPile(obj.pile, obj.qteHuile, 1, obj.num, 'Entrée', obj.nature, obj.prixTotal);
            const br = DB.bonsReception.find(b=>b.num===obj.br); if(br) br.beh = obj.num;
            toast("Bon d'entrée huile enregistré",
              `${fmt.n(obj.qteHuile,1)} kg ajoutés à la pile ${obj.pile} — nouveau stock ${fmt.n(Store.pile(obj.pile).qte,1)} kg.`);
          }
          closeModal(); App.render();
        };
      }});
  },

  voir(beh){
    const p = Store.pile(beh.pile) || {};
    modal({ size:'wide', title:"Bon d'entrée huile "+beh.num,
      body:`<div class="grid g-3" style="margin-bottom:16px">
          <article class="card kpi"><div class="kpi-label">Quantité huile</div><div class="kpi-value" style="font-size:21px">${fmt.n(beh.qteHuile,1)}<small>kg</small></div></article>
          <article class="card kpi"><div class="kpi-label">Rendement</div><div class="kpi-value" style="font-size:21px">${beh.rendement?fmt.n(beh.rendement,2):'—'}<small>%</small></div></article>
          <article class="card kpi"><div class="kpi-label">Prix total</div><div class="kpi-value" style="font-size:21px">${fmt.n(beh.prixTotal,3)}<small>TND</small></div></article>
        </div>
        <div class="grid g-2" style="gap:18px">
          <dl class="kv">
            <dt>Nature</dt><dd>${beh.nature}</dd>
            <dt>Bon de réception</dt><dd>${beh.br?`<span class="ref">${beh.br}</span>`:'<span class="muted">achat direct</span>'}</dd>
            <dt>${beh.tiersType==='Client'?'Client':'Fournisseur'}</dt><dd><strong>${beh.tiers}</strong></dd>
            <dt>Transporteur</dt><dd>${beh.transporteur} — ${beh.matricule}</dd>
            <dt>Date</dt><dd>${beh.date} à ${beh.heure}</dd>
          </dl>
          <dl class="kv">
            <dt>Organoleptique</dt><dd><strong>${beh.organo}</strong></dd>
            <dt>Acidité</dt><dd>${fmt.n(beh.acidite,2)} %</dd>
            <dt>K232 / K270</dt><dd>${fmt.n(beh.k232,2)} / ${fmt.n(beh.k270,2)}</dd>
            <dt>Quantité olives</dt><dd>${beh.qteOlives?fmt.n(beh.qteOlives)+' kg':'—'}</dd>
            <dt>Pile</dt><dd><span class="ref">${beh.pile}</span> — ${p.designation||''} · stock actuel ${fmt.n(p.qte||0)} kg · CMP ${fmt.n(Store.cmpPile(p||{qte:0,prixTotal:0}),3)}</dd>
          </dl>
        </div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" data-act-print>${icon('print')}Imprimer</button>
            <button class="btn btn-primary" id="behv-edit">${icon('edit')}Modifier</button>`,
      onOpen(ov){ el('#behv-edit',ov).onclick = ()=>{ closeModal(); DocBEH.form(beh); }; }});
  }
};

/* ==========================  STOCK  ===================================== */
PAGES.depots = () => pageHead("Terrasses et dépôts / المخازن","Emplacements physiques de stockage des olives",
  `<button class="btn btn-sm btn-primary" data-crud="add:depots">${icon('plus')}Ajouter</button>`)
  + dataTable('dep2', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'designation', t:'Désignation / الاسم', render:r=>`<span class="strong">${r.designation}</span>`},
      {k:'type', t:'Type / النوع', render:r=>`<span class="badge ${r.type==='Dépôt'?'ok':r.type==='Caisse'?'info':'neutral'} no-dot">${r.type}</span>`},
      {k:'qte', t:'Quantité stockée', r:true, render:r=>fmt.n(r.qte)+' kg'},
      {k:'capacite', t:'Capacité', r:true, render:r=>fmt.n(r.capacite)+' kg'},
      {k:'occupation', t:'Occupation', render:r=>`<div class="progress" style="width:110px"><i style="width:${(r.qte/r.capacite*100).toFixed(0)}%"></i></div>
        <div class="cell-sub">${fmt.n(r.qte/r.capacite*100,0)} %</div>`},
      {k:'etat', t:'État', render:r=>`<span class="badge ${r.etat==='Libre'?'ok':r.etat==='Occupée'?'info':'neutral'}">${r.etat}</span>`},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.depots, {noPager:true, ph:"Rechercher un dépôt…", entity:'depots',
        filters:[{k:'type', t:'Type', options:['Caisse','Dépôt','Autre']}]});

PAGES.piles = () => {
  const tot = DB.pilesHuile.reduce((a,p)=>({q:a.q+p.qte, m:a.m+p.qteMax, v:a.v+p.prixTotal}), {q:0,m:0,v:0});
  return pageHead("Piles à huile / كومات الزيت","Stock d'huile par pile, valorisé au coût moyen pondéré",
    `<button class="btn btn-sm" data-go="bons-entree-huile">${icon('droplet')}Bons d'entrée</button>
     <button class="btn btn-sm btn-primary" data-crud="add:pilesHuile">${icon('plus')}Ajouter</button>`)
  + kpiRow([
      ["Huile stockée", fmt.n(tot.q)+" kg", fmt.n(tot.q/tot.m*100,1)+" % de la capacité"],
      ["Capacité totale", fmt.n(tot.m)+" kg", DB.pilesHuile.length+" piles"],
      ["Valeur du stock", fmt.n(tot.v,3)+" TND", "somme des entrées valorisées"],
      ["CMP global", fmt.n(tot.q?tot.v/tot.q:0,3)+" TND/kg", "coût moyen pondéré"]
    ])
  + dataTable('piles2', [
      {k:'num', t:'Numéro', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'designation', t:'Désignation', render:r=>`<span class="strong">${r.designation}</span>`},
      {k:'qteMax', t:'Quantité max (kg)', r:true, render:r=>fmt.n(r.qteMax)},
      {k:'qte', t:'Quantité actuelle', r:true, render:r=>`<span class="strong">${fmt.n(r.qte)}</span>`},
      {k:'reste', t:'Reste', r:true, render:r=>fmt.n(Store.restePile(r))},
      {k:'remplissage', t:'Remplissage', render:r=>{const p=r.qte/r.qteMax*100;
        return `<div class="progress" style="width:110px"><i style="width:${p.toFixed(0)}%;background:${p>90?'var(--warn)':'var(--forest)'}"></i></div>
                <div class="cell-sub">${fmt.n(p,0)} %</div>`;}},
      {k:'prixTotal', t:'Prix total', r:true, render:r=>fmt.n(r.prixTotal,3)},
      {k:'cmp', t:'CMP', r:true, render:r=>`<span class="strong">${fmt.n(Store.cmpPile(r),3)}</span>`},
      {k:'etat', t:'État', render:r=>`<span class="badge ${r.etat==='En service'?'ok':r.etat==='Vide'?'neutral':'warn'}">${r.etat}</span>`},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Historique" data-do="hist">${icon('history')}</button>
        <button class="icon-btn tip" data-tip="Modifier" data-do="edit">${icon('edit')}</button>
        <button class="icon-btn tip" data-tip="Supprimer" data-do="del">${icon('trash')}</button></div>`}
    ], DB.pilesHuile, {noPager:true, ph:"Rechercher une pile…", entity:'pilesHuile',
        filters:[{k:'etat', t:'État', options:['En service','Vide','En nettoyage','Hors service']},
                 {k:'saison', t:'Saison', options:()=>DB.saisons.map(s=>s.libelle)}],
        rowAction:(a,r)=>{ if(a==='hist') App.go('etat-pile-date', {pile:r.num}); }});
};

PAGES.articles = () => pageHead("Articles / المواد","Produits et prestations commercialisés",
  `<button class="btn btn-sm btn-primary" data-crud="add:articles">${icon('plus')}Ajouter</button>`)
  + dataTable('art2', [
      {k:'code', t:'Code', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'designation', t:'Désignation', render:r=>`<span class="strong">${r.designation}</span>`},
      {k:'prix', t:'Prix de vente', r:true, render:r=>fmt.n(r.prix,3)+' TND'},
      {k:'unite', t:'Unité'},
      {k:'type', t:'Type', render:r=>`<span class="badge neutral no-dot">${r.type}</span>`},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], DB.articles, {noPager:true, ph:"Rechercher un article…", entity:'articles',
        filters:[{k:'type', t:'Type', options:()=>[...new Set(DB.articles.map(a=>a.type))]}]});

/* Sous-produits vendus : grignons et noyaux partagent la même structure */
const sousProduitVente = (cle, titre, entite) => () => {
  const f = Flt.get(cle, {client:'', etat:''});
  let rows = Store.filtrer(DB[cle], f);
  if(f.client) rows = rows.filter(r=>r.client===f.client);
  if(f.etat)   rows = rows.filter(r=>r.etat===f.etat);
  const q = rows.reduce((s,r)=>s+r.qte,0), m = rows.reduce((s,r)=>s+r.total,0);

  return pageHead(titre.t, titre.s,
    `<button class="btn btn-sm" data-go="${titre.etat}">${icon('chart')}État détaillé</button>
     <button class="btn btn-sm btn-primary" data-crud="add:${entite}">${icon('plus')}Ajouter</button>`)
  + Flt.bar(cle, [
      {k:'client', l:'Client', type:'select', options:()=>[...new Set(DB[cle].map(r=>r.client))]},
      {k:'etat', l:'État', type:'select', options:['Livré','En attente','Annulé']}
    ])
  + dataTable(cle+'l', [
      {k:'date', t:'Date / التاريخ'},
      {k:'client', t:'Client / الزبون', render:r=>`<span class="strong">${r.client}</span>`},
      {k:'transporteur', t:'Transporteur / الناقل'},
      {k:'matricule', t:'Matricule', render:r=>`<span class="mono">${r.matricule}</span>`},
      {k:'bl', t:'Bon de livraison', render:r=>`<span class="ref">${r.bl}</span>`},
      {k:'qte', t:'Quantité (kg)', r:true, render:r=>`<span class="strong">${fmt.n(r.qte)}</span>`},
      {k:'pu', t:'Prix unitaire', r:true, render:r=>fmt.n(r.pu,3)},
      {k:'total', t:'Prix total', r:true, render:r=>`<span class="strong">${fmt.n(r.total,3)} TND</span>`},
      {k:'etat', t:'État', render:r=>`<span class="badge ${r.etat==='Livré'?'ok':'warn'}">${r.etat}</span>`},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], rows, {ph:"Rechercher…", entity:entite, per:10})
  + totaux([["Bons", String(rows.length)], ["Quantité totale", fmt.n(q)+" kg"], ["Montant total", fmt.n(m,3)+" TND"]]);
};
PAGES.grignons = sousProduitVente('grignons', {t:"Grignons / القشور", s:"Ventes et enlèvements de grignons", etat:'etat-grignons'}, 'grignons');
PAGES.noyaux   = sousProduitVente('noyaux',   {t:"Noyaux / النوى",   s:"Ventes et enlèvements de noyaux",   etat:'etat-noyaux'},   'noyaux');

PAGES.margines = () => {
  const f = Flt.get('mrg', {fournisseur:''});
  let rows = Store.filtrer(DB.marginesEvac, f);
  if(f.fournisseur) rows = rows.filter(r=>r.fournisseur===f.fournisseur);
  const v = rows.reduce((s,r)=>s+r.voyages,0), m = rows.reduce((s,r)=>s+r.total,0);
  return pageHead("Margines / الهوامش","Évacuation des margines par voyage",
    `<button class="btn btn-sm" data-go="etat-margines">${icon('chart')}État détaillé</button>
     <button class="btn btn-sm btn-primary" data-crud="add:marginesEvac">${icon('plus')}Ajouter</button>`)
  + Flt.bar('mrg', [{k:'fournisseur', l:'Fournisseur', type:'select', options:()=>[...new Set(DB.marginesEvac.map(r=>r.fournisseur))]}])
  + dataTable('mrgl', [
      {k:'fournisseur', t:'Fournisseur / المزود', render:r=>`<span class="strong">${r.fournisseur}</span>`},
      {k:'date', t:'Date'},
      {k:'transporteur', t:'Transporteur'},
      {k:'camion', t:'Camion', render:r=>`<span class="mono">${r.camion}</span>`},
      {k:'voyages', t:'Nombre de voyages', r:true},
      {k:'prixVoyage', t:'Prix voyage', r:true, render:r=>fmt.n(r.prixVoyage,3)},
      {k:'total', t:'Prix total', r:true, render:r=>`<span class="strong">${fmt.n(r.total,3)} TND</span>`},
      {k:'x', t:'', r:true, render:()=>rowActions([{i:'edit',t:'Modifier',a:'edit'},{i:'trash',t:'Supprimer',a:'del'}])}
    ], rows, {ph:"Rechercher…", entity:'marginesEvac', noPager:true})
  + totaux([["Enlèvements", String(rows.length)], ["Total voyages", String(v)], ["Montant total", fmt.n(m,3)+" TND"]]);
};

/* ==========================  STATISTIQUES ET ÉTATS  ===================== */
PAGES['etat-pile'] = () => {
  const f = Flt.get('etp', {pile:''});
  let rows = DB.pilesHuile.filter(p=>!f.pile || p.num===f.pile);
  if(f.saison && f.saison!=='Toutes') rows = rows.filter(p=>p.saison===f.saison);
  const t = rows.reduce((a,p)=>({q:a.q+p.qte, m:a.m+p.qteMax}), {q:0,m:0});
  return pageHead("État par pile / كشف الكومة","Capacité, contenu et disponibilité de chaque pile")
  + Flt.bar('etp', [{k:'pile', l:'Pile', type:'select', options:()=>DB.pilesHuile.map(p=>p.num)}], {sansPeriode:true})
  + dataTable('etpl', [
      {k:'num', t:'Pile', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'designation', t:'Désignation'},
      {k:'qteMax', t:'Quantité maximale', r:true, render:r=>fmt.n(r.qteMax)+' kg'},
      {k:'qte', t:'Quantité actuelle', r:true, render:r=>`<span class="strong">${fmt.n(r.qte)} kg</span>`},
      {k:'reste', t:'Reste / capacité disponible', r:true, render:r=>fmt.n(Store.restePile(r))+' kg'},
      {k:'cmp', t:'CMP', r:true, render:r=>fmt.n(Store.cmpPile(r),3)},
      {k:'prixTotal', t:'Valeur', r:true, render:r=>fmt.n(r.prixTotal,3)+' TND'}
    ], rows, {noToolbar:true, noPager:true})
  + totaux([["Quantité maximale", fmt.n(t.m)+" kg"], ["Quantité actuelle", fmt.n(t.q)+" kg"],
            ["Reste total", fmt.n(t.m-t.q)+" kg"], ["Taux de remplissage", fmt.n(t.m?t.q/t.m*100:0,1)+" %"]]);
};

PAGES['etat-pile-date'] = (p={}) => {
  const f = Flt.get('etpd', {pile:p.pile || 'P01'});
  if(p.pile) f.pile = p.pile;
  const hist = Store.historiquePile(f.pile, f);
  const e = hist.reduce((s,m)=>s+m.entree,0), s = hist.reduce((a,m)=>a+m.sortie,0);
  return pageHead("État par pile et par date / كشف الكومة حسب التاريخ","Évolution du stock d'une pile sur la période")
  + Flt.bar('etpd', [{k:'pile', l:'Pile', type:'select', options:()=>DB.pilesHuile.map(x=>x.num)}])
  + dataTable('etpdl', [
      {k:'type', t:'Type', render:r=>`<span class="badge ${r.sens>0?'ok':'warn'} no-dot">${r.type}</span>`},
      {k:'date', t:'Date'},
      {k:'doc', t:'Numéro document', render:r=>`<span class="ref">${r.doc}</span>`},
      {k:'origine', t:'Origine'},
      {k:'entree', t:'Entrée (kg)', r:true, render:r=>r.entree?`<span style="color:var(--ok);font-weight:600">${fmt.n(r.entree,1)}</span>`:'—'},
      {k:'sortie', t:'Sortie (kg)', r:true, render:r=>r.sortie?`<span style="color:var(--danger);font-weight:600">${fmt.n(r.sortie,1)}</span>`:'—'},
      {k:'solde', t:'Solde (kg)', r:true, render:r=>`<span class="strong">${fmt.n(r.solde,1)}</span>`}
    ], hist, {noToolbar:true, noPager:true})
  + totaux([["Pile", f.pile], ["Total entrées", fmt.n(e,1)+" kg"], ["Total sorties", fmt.n(s,1)+" kg"],
            ["Solde de la période", fmt.n(e-s,1)+" kg"], ["Stock actuel", fmt.n((Store.pile(f.pile)||{}).qte||0)+" kg"]]);
};

/* État grignons / noyaux : ventes + règlements + reste */
const etatSousProduit = (cle, reglCle, titre) => () => {
  const f = Flt.get('et-'+cle, {client:'', etat:''});
  let rows = Store.filtrer(DB[cle], f);
  if(f.client) rows = rows.filter(r=>r.client===f.client);
  if(f.etat)   rows = rows.filter(r=>r.etat===f.etat);
  let regl = DB[reglCle].filter(r=>Store.dansIntervalle(r.date, f) && (!f.client || r.client===f.client));
  const q = rows.reduce((s,r)=>s+r.qte,0), m = rows.reduce((s,r)=>s+r.total,0), p = regl.reduce((s,r)=>s+r.montant,0);

  return pageHead(titre.t, titre.s)
  + Flt.bar('et-'+cle, [
      {k:'client', l:'Client', type:'select', options:()=>[...new Set(DB[cle].map(r=>r.client))]},
      {k:'etat', l:'État', type:'select', options:['Livré','En attente','Annulé']}
    ])
  + card(titre.section, dataTable('et'+cle, [
      {k:'date', t:'Date'},
      {k:'etat', t:'Type', render:r=>r.etat},
      {k:'transporteur', t:'Transporteur'},
      {k:'matricule', t:'Matricule véhicule', render:r=>`<span class="mono">${r.matricule}</span>`},
      {k:'bl', t:'N° bon de livraison', render:r=>`<span class="ref">${r.bl}</span>`},
      {k:'qte', t:'Quantité (kg)', r:true, render:r=>fmt.n(r.qte)},
      {k:'pu', t:'Prix / kg', r:true, render:r=>fmt.n(r.pu,3)},
      {k:'total', t:'Prix total', r:true, render:r=>`<span class="strong">${fmt.n(r.total,3)}</span>`}
    ], rows, {noToolbar:true, noPager:true}), {flush:true})
  + `<div style="height:16px"></div>`
  + card("Règlements / التسويات", dataTable('etr'+cle, [
      {k:'date', t:'Date'}, {k:'client', t:'Client'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)} TND</span>`},
      {k:'mode', t:'Mode de règlement'},
      {k:'ref', t:'Référence', render:r=>`<span class="mono">${r.ref}</span>`}
    ], regl, {noToolbar:true, noPager:true}), {flush:true})
  + totaux([["Total quantité", fmt.n(q)+" kg"], ["Total montant", fmt.n(m,3)+" TND"],
            ["Total réglé", fmt.n(p,3)+" TND"], ["Reste à régler", fmt.n(m-p,3)+" TND"]]);
};
PAGES['etat-grignons'] = etatSousProduit('grignons','reglementsGrignons',
  {t:"État grignons / كشف القشور", s:"Ventes de grignons et règlements associés", section:"Grignons"});
PAGES['etat-noyaux'] = etatSousProduit('noyaux','reglementsNoyaux',
  {t:"État noyaux / كشف النوى", s:"Ventes de noyaux et règlements associés", section:"Noyaux"});

PAGES['etat-margines'] = () => {
  const f = Flt.get('et-mrg', {fournisseur:''});
  let rows = Store.filtrer(DB.marginesEvac, f);
  if(f.fournisseur) rows = rows.filter(r=>r.fournisseur===f.fournisseur);
  const regl = DB.reglementsMargines.filter(r=>Store.dansIntervalle(r.date, f) && (!f.fournisseur || r.fournisseur===f.fournisseur));
  const v = rows.reduce((s,r)=>s+r.voyages,0), m = rows.reduce((s,r)=>s+r.total,0), p = regl.reduce((s,r)=>s+r.montant,0);
  return pageHead("État margines / كشف الهوامش","Évacuations de margines et règlements")
  + Flt.bar('et-mrg', [{k:'fournisseur', l:'Fournisseur', type:'select', options:()=>[...new Set(DB.marginesEvac.map(r=>r.fournisseur))]}])
  + card("Margines", dataTable('etmrg', [
      {k:'fournisseur', t:'Fournisseur'}, {k:'date', t:'Date'},
      {k:'transporteur', t:'Transporteur'}, {k:'camion', t:'Camion', render:r=>`<span class="mono">${r.camion}</span>`},
      {k:'voyages', t:'Nombre de voyages', r:true},
      {k:'prixVoyage', t:'Prix voyage', r:true, render:r=>fmt.n(r.prixVoyage,3)},
      {k:'total', t:'Prix total', r:true, render:r=>`<span class="strong">${fmt.n(r.total,3)}</span>`}
    ], rows, {noToolbar:true, noPager:true}), {flush:true})
  + `<div style="height:16px"></div>`
  + card("Règlements / التسويات", dataTable('etmrgr', [
      {k:'date', t:'Date'}, {k:'fournisseur', t:'Fournisseur'},
      {k:'montant', t:'Montant', r:true, render:r=>fmt.n(r.montant,3)},
      {k:'mode', t:'Mode de règlement'}, {k:'ref', t:'Référence'}
    ], regl, {noToolbar:true, noPager:true}), {flush:true})
  + totaux([["Total voyages", String(v)], ["Total montant", fmt.n(m,3)+" TND"],
            ["Total réglé", fmt.n(p,3)+" TND"], ["Reste", fmt.n(m-p,3)+" TND"]]);
};

PAGES['etat-fournisseur'] = (prm={}) => {
  const f = Flt.get('etf2', {tiers:'Coopérative Sahline', matricule:''});
  if(prm.tiers) f.tiers = prm.tiers;
  let brs = Store.filtrer(DB.bonsReception.filter(b=>b.tiersType==='Fournisseur' && b.tiers===f.tiers), f);
  if(f.matricule) brs = brs.filter(b=>b.matricule===f.matricule);
  const bps = DB.bonsProduction.filter(b=>brs.some(x=>x.num===b.br));
  const acc = DB.accomptesFournisseurs.filter(a=>a.fournisseur===f.tiers && Store.dansIntervalle(a.date, f));
  const totOp = brs.reduce((s,b)=>s+Store.montantBR(b),0);
  const totRegl = brs.reduce((s,b)=>s+(b.paye||0),0);
  const totAcc = acc.reduce((s,a)=>s+a.montant,0);

  return pageHead("État fournisseur / كشف الفلاح","Réceptions, transformation, acomptes et solde du fournisseur")
  + Flt.bar('etf2', [
      {k:'tiers', l:'Fournisseur', type:'select', options:()=>DB.fournisseurs.map(x=>x.nom)},
      {k:'matricule', l:'Matricule véhicule', type:'select', options:()=>[...new Set(DB.bonsReception.map(b=>b.matricule))]}
    ])
  + card("Section 1 — Entrée olives", dataTable('etf-a', [
      {k:'date', t:"Date entrée olives"},
      {k:'num', t:'N° bon réception', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'nature', t:'Nature'},
      {k:'prix', t:'Prix', r:true, render:r=>`${fmt.n(r.lignes[0]?r.lignes[0].prixHuile:0,3)}<div class="cell-sub">${Store.baseBR(r).libellePrix}</div>`},
      {k:'qte', t:'Quantité', r:true, render:r=>{const b=Store.baseBR(r);
        return `${fmt.n(b.qte)} kg<div class="cell-sub">${b.libelleQte}</div>`;}},
      {k:'total', t:'Total', r:true, render:r=>`<span class="strong">${fmt.n(Store.montantBR(r),3)}</span>`},
      {k:'paye', t:'Montant réglé', r:true, render:r=>fmt.n(r.paye||0,3)},
      {k:'reste', t:'Reste', r:true, render:r=>{const v=Store.resteBR(r);
        return `<span style="font-weight:600;color:${v>0?'var(--warn)':'var(--ink-3)'}">${fmt.n(v,3)}</span>`;}}
    ], brs, {noToolbar:true, noPager:true}), {flush:true})
  + totaux([["Total olives réceptionnées", fmt.n(brs.reduce((s,b)=>s+Store.netBR(b),0))+" kg"],
            ["Total montant", fmt.n(totOp,3)+" TND"], ["Total réglé", fmt.n(totRegl,3)+" TND"],
            ["Total reste", fmt.n(totOp-totRegl,3)+" TND"]])
  + `<div style="height:16px"></div>`
  + card("Section 2 — Traitement / production", dataTable('etf-b', [
      {k:'date', t:'Date TRT'},
      {k:'num', t:'N° BP', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'qteHuile', t:'Net huile', r:true, render:r=>`<span class="strong">${fmt.n(r.qteHuile,1)} kg</span>`},
      {k:'rendement', t:'Rendement %', r:true, render:r=>fmt.n(r.rendement,2)},
      {k:'cmp', t:'CMP', r:true, render:r=>fmt.n(r.cmp,3)},
      {k:'pile', t:'N° Pile', render:r=>{const br=DB.bonsReception.find(x=>x.num===r.br); const beh=br&&DB.behs.find(b=>b.num===br.beh);
        return beh?`<span class="ref">${beh.pile}</span>`:'<span class="muted">—</span>';}},
      {k:'cout', t:'Prix total', r:true, render:r=>fmt.n(r.cout,3)}
    ], bps, {noToolbar:true, noPager:true}), {flush:true})
  + totaux([["Total huile", fmt.n(bps.reduce((s,b)=>s+b.qteHuile,0),1)+" kg"],
            ["Rendement moyen", fmt.pct(bps.reduce((s,b)=>s+b.qteOlives,0)?bps.reduce((s,b)=>s+b.qteHuile,0)/bps.reduce((s,b)=>s+b.qteOlives,0)*100:0)],
            ["Total montant", fmt.n(bps.reduce((s,b)=>s+b.cout,0),3)+" TND"]])
  + `<div style="height:16px"></div>`
  + card("Section 3 — Acomptes", dataTable('etf-c', [
      {k:'num', t:'N° acompte', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'mode', t:'Mode'},
      {k:'montant', t:'Montant', r:true, render:r=>`<span class="strong">${fmt.n(r.montant,3)}</span>`},
      {k:'affecte', t:'Affecté à'}
    ], acc, {noToolbar:true, noPager:true}), {flush:true})
  + `<div style="height:16px"></div>`
  + card("Section 4 — Solde fournisseur", `
      <div class="stat-line"><span>Total des opérations de réception</span><span class="v">${fmt.n(totOp,3)} TND</span></div>
      <div class="stat-line"><span>− Règlements rattachés aux bons</span><span class="v" style="color:var(--ok)">− ${fmt.n(totRegl,3)} TND</span></div>
      <div class="stat-line"><span>− Acomptes versés</span><span class="v" style="color:var(--ok)">− ${fmt.n(totAcc,3)} TND</span></div>
      <div class="note mt" style="display:flex;justify-content:space-between;align-items:center;gap:14px">
        <div><strong>Solde dû au fournisseur</strong>
          <div class="tiny">Opérations − règlements − acomptes, sur la période et la saison filtrées</div></div>
        <div style="font-family:var(--font-display);font-size:24px;font-weight:600">${fmt.n(totOp-totRegl-totAcc,3)} TND</div>
      </div>`);
};

PAGES['etat-client'] = (prm={}) => {
  const f = Flt.get('etc2', {tiers:'Ferme Ouled Amor'});
  if(prm.tiers) f.tiers = prm.tiers;
  const brs = Store.filtrer(DB.bonsReception.filter(b=>b.tiersType==='Client' && b.tiers===f.tiers), f);
  const fac = DB.factures.filter(x=>x.client===f.tiers && Store.dansIntervalle(x.date, f));
  const grg = DB.grignons.filter(g=>g.client===f.tiers && Store.dansIntervalle(g.date, f));
  const tot = brs.reduce((s,b)=>s+Store.montantBR(b),0) + fac.reduce((s,x)=>s+x.ttc,0) + grg.reduce((s,g)=>s+g.total,0);
  const paye = brs.reduce((s,b)=>s+(b.paye||0),0) + fac.reduce((s,x)=>s+x.paye,0);

  return pageHead("État client / كشف الزبون","Opérations de trituration, ventes et règlements du client")
  + Flt.bar('etc2', [{k:'tiers', l:'Client', type:'select', options:()=>DB.clients.map(c=>c.nom)}])
  + card("Opérations de trituration", dataTable('etc-a', [
      {k:'date', t:'Date entrée olives'},
      {k:'num', t:'N° bon réception', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'prix', t:'Prix', r:true, render:r=>fmt.n(r.lignes[0]?r.lignes[0].prixHuile:0,3)},
      {k:'qte', t:'Quantité olives', r:true, render:r=>fmt.n(Store.netBR(r))+' kg'},
      {k:'total', t:'Total', r:true, render:r=>`<span class="strong">${fmt.n(Store.montantBR(r),3)}</span>`},
      {k:'paye', t:'Montant réglé', r:true, render:r=>fmt.n(r.paye||0,3)},
      {k:'reste', t:'Reste', r:true, render:r=>fmt.n(Store.resteBR(r),3)}
    ], brs, {noToolbar:true, noPager:true}), {flush:true})
  + `<div style="height:16px"></div>`
  + card("Autres opérations (ventes, factures, sous-produits)", dataTable('etc-b', [
      {k:'date', t:'Date'}, {k:'doc', t:'Document', render:r=>`<span class="ref">${r.doc}</span>`},
      {k:'nature', t:'Nature'},
      {k:'total', t:'Total', r:true, render:r=>fmt.n(r.total,3)},
      {k:'paye', t:'Réglé', r:true, render:r=>fmt.n(r.paye,3)},
      {k:'reste', t:'Reste', r:true, render:r=>`<span style="font-weight:600;color:${r.total-r.paye>0?'var(--warn)':'var(--ink-3)'}">${fmt.n(r.total-r.paye,3)}</span>`}
    ], [
      ...fac.map(x=>({date:x.date, doc:x.num, nature:'Facture', total:x.ttc, paye:x.paye})),
      ...grg.map(g=>({date:g.date, doc:g.bl, nature:'Vente grignons', total:g.total, paye:0}))
    ], {noToolbar:true, noPager:true}), {flush:true})
  + totaux([["Total opérations", fmt.n(tot,3)+" TND"], ["Total réglé", fmt.n(paye,3)+" TND"],
            ["Reste", fmt.n(tot-paye,3)+" TND"],
            ["Solde client (relevé)", fmt.n(Store.soldeClientV2(f.tiers, f),3)+" TND"]]);
};

/* Relevés fournisseur et client : débit / crédit / solde */
const relevePage = (id, titre, sous, liste, calcul) => (prm={}) => {
  const f = Flt.get(id, {tiers: liste()[0]});
  if(prm.tiers) f.tiers = prm.tiers;
  const r = calcul(f.tiers, f);
  return pageHead(titre, sous)
  + Flt.bar(id, [{k:'tiers', l:titre.includes('client')||titre.includes('Client')?'Client':'Fournisseur', type:'select', options:liste}])
  + card("Mouvements de la période", dataTable(id+'l', [
      {k:'date', t:'Date / التاريخ'},
      {k:'type', t:'Type / النوع', render:x=>`<span class="badge ${x.credit?'ok':'info'} no-dot">${x.type}</span>`},
      {k:'doc', t:'Document', render:x=>`<span class="ref">${x.doc}</span>`},
      {k:'debit', t:'Débit / مدين', r:true, render:x=>x.debit?fmt.n(x.debit,3):'<span class="muted">—</span>'},
      {k:'credit', t:'Crédit / دائن', r:true, render:x=>x.credit?fmt.n(x.credit,3):'<span class="muted">—</span>'},
      {k:'solde', t:'Solde / الرصيد', r:true, render:x=>`<span class="strong" style="color:${x.solde>0?'var(--danger)':x.solde<0?'var(--ok)':'var(--ink)'}">${fmt.n(x.solde,3)}</span>`}
    ], r.lignes, {noToolbar:true, noPager:true}), {flush:true,
      sub:`Solde initial repris : ${fmt.n(r.soldeInitial,3)} TND · Solde = solde précédent + débit − crédit`})
  + totaux([["Solde initial", fmt.n(r.soldeInitial,3)+" TND"], ["Total débit", fmt.n(r.totalDebit,3)+" TND"],
            ["Total crédit", fmt.n(r.totalCredit,3)+" TND"], ["Solde final", fmt.n(r.soldeFinal,3)+" TND"]]);
};
PAGES['releve-fournisseur'] = relevePage('relf', "Relevé fournisseur / كشف حركة الفلاح",
  "Mouvements chronologiques : réceptions, factures, acomptes et règlements",
  ()=>DB.fournisseurs.map(f=>f.nom), (n,p)=>Store.releveFournisseur(n,p));
PAGES['releve-client'] = relevePage('relc', "Relevé client / كشف حركة الزبون",
  "Mouvements chronologiques : ventes, factures, règlements et avoirs",
  ()=>DB.clients.map(c=>c.nom), (n,p)=>Store.releveClient(n,p));

PAGES['etat-solde-client'] = () => {
  const f = Flt.get('esc', {tiers:'', tri:'Solde décroissant'});
  let rows = DB.clients.filter(c=>!f.tiers || c.nom===f.tiers).map(c=>{
    const r = Store.releveClient(c.nom, f);
    return { code:c.code, nom:c.nom, typeC:c.typeC, soldeInitial:r.soldeInitial,
             debit:r.totalDebit, credit:r.totalCredit, solde:r.soldeFinal };
  });
  const tri = f.tri || 'Solde décroissant';
  rows.sort((a,b)=> tri==='Client' ? a.nom.localeCompare(b.nom,'fr')
    : tri==='Code' ? a.code.localeCompare(b.code,'fr')
    : tri==='Solde croissant' ? a.solde-b.solde : b.solde-a.solde);

  return pageHead("État des soldes clients / كشف أرصدة الزبائن","Solde initial, débit, crédit et solde final par client")
  + Flt.bar('esc', [
      {k:'tiers', l:'Client', type:'select', options:()=>DB.clients.map(c=>c.nom)},
      {k:'tri', l:'Tri', type:'select', options:['Solde décroissant','Solde croissant','Client','Code']}
    ])
  + dataTable('escl', [
      {k:'code', t:'Code client', render:r=>`<span class="ref">${r.code}</span>`},
      {k:'nom', t:'Client', render:r=>`<div class="strong">${r.nom}</div><div class="cell-sub">${r.typeC}</div>`},
      {k:'soldeInitial', t:'Solde initial', r:true, render:r=>fmt.n(r.soldeInitial,3)},
      {k:'debit', t:'Débit / مدين', r:true, render:r=>fmt.n(r.debit,3)},
      {k:'credit', t:'Crédit / دائن', r:true, render:r=>fmt.n(r.credit,3)},
      {k:'solde', t:'Solde final', r:true, render:r=>`<span class="strong" style="color:${r.solde>0.001?'var(--danger)':r.solde<-0.001?'var(--ok)':'var(--ink-3)'}">${fmt.n(r.solde,3)}</span>`},
      {k:'sit', t:'Situation', render:r=>r.solde>0.001?'<span class="badge danger">Débiteur</span>'
        :r.solde<-0.001?'<span class="badge ok">Créditeur</span>':'<span class="badge neutral">Soldé</span>'}
    ], rows, {noToolbar:true, noPager:true})
  + totaux([["Clients", String(rows.length)],
            ["Total débit", fmt.n(rows.reduce((s,r)=>s+r.debit,0),3)+" TND"],
            ["Total crédit", fmt.n(rows.reduce((s,r)=>s+r.credit,0),3)+" TND"],
            ["Total général des soldes", fmt.n(rows.reduce((s,r)=>s+r.solde,0),3)+" TND"]]);
};

PAGES['etat-journalier'] = () => {
  const f = Flt.get('ej2');
  const j = Store.journalier(f);
  const ligne = (l,v)=>`<div class="stat-line"><span>${l}</span><span class="v">${v}</span></div>`;
  return pageHead(`État journalier du ${f.du} au ${f.au}`, "Synthèse calculée à partir des opérations enregistrées")
  + Flt.bar('ej2', [])
  + kpiRow([
      ["Total achat matière première", fmt.n(j.achatMP,3)+" TND", j.nbReceptions+" réceptions"],
      ["Quantité matière première", fmt.n(j.qteMP)+" kg", "olives réceptionnées"],
      ["Quantité huile produite", fmt.n(j.huile,1)+" kg", j.nbProductions+" productions"],
      ["Rendement moyen", fmt.pct(j.rendement), "huile / olives traitées"]
    ])
  + `<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      ${card("Production", 
        ligne("Nombre de productions", j.nbProductions) +
        ligne("Quantité MP destinée à la production", fmt.n(j.qteProd)+" kg") +
        ligne("Quantité huile produite", fmt.n(j.huile,1)+" kg") +
        ligne("Rendement moyen", fmt.pct(j.rendement)) +
        ligne("Quantité grignons", fmt.n(j.grignons)+" kg") +
        ligne("Quantité noyaux", fmt.n(j.noyaux)+" kg") +
        ligne("Quantité margines", fmt.n(j.margines)+" L"))}
      ${card("Finance",
        ligne("Chiffre d'affaires", fmt.n(j.ca,3)+" TND") +
        ligne("Total dépenses", fmt.n(j.depenses,3)+" TND") +
        ligne("Total règlements fournisseurs", fmt.n(j.reglFournisseurs,3)+" TND") +
        ligne("Total règlements clients", fmt.n(j.reglClients,3)+" TND") +
        ligne("Total acomptes", fmt.n(j.acomptes,3)+" TND") +
        ligne("Total encaissements", fmt.n(j.encaissements,3)+" TND") +
        ligne("Total décaissements", fmt.n(j.decaissements,3)+" TND") +
        ligne("Solde de caisse", fmt.n(j.soldeCaisse,3)+" TND"))}
     </div>`
  + card("Détail des réceptions de la période", dataTable('ejbr', [
      {k:'num', t:'N° BR', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'nature', t:'Nature'}, {k:'tiers', t:'Fournisseur / Client'},
      {k:'qte', t:'Quantité', r:true, render:r=>fmt.n(Store.netBR(r))+' kg'},
      {k:'total', t:'Montant', r:true, render:r=>fmt.n(Store.montantBR(r),3)},
      {k:'bp', t:'Production', render:r=>r.bp?`<span class="ref">${r.bp}</span>`:'<span class="badge warn no-dot">Sans production</span>'}
    ], j.br, {noToolbar:true, noPager:true}), {flush:true});
};
