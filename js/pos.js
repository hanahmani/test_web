/* ==========================================================================
   OLIVERA ERP — Vente rapide (caisse), ticket imprimable, facture, fiches
   ========================================================================== */

const POS = {
  panier: [],
  cat: "Tous",
  client: "Client comptoir",
  mode: "Espèces",
  remise: 0,
  ticket: 1258,
  dernier: null,

  totaux(){
    const sousTotal = this.panier.reduce((s,l)=> s + l.prix*l.qte*(1-l.rem/100), 0);
    const remise = sousTotal * (this.remise/100);
    const ht = sousTotal - remise;                 // §25.2 : les prix catalogue sont hors taxes
    const tva = ht * (DB.societe.tva/100);
    return { sousTotal, remise, ht, tva, ttc: ht + tva };
  },

  ajouter(code){
    const p = DB.produits.find(x=>x.code===code);
    const l = this.panier.find(x=>x.code===code);
    if(l) l.qte++;
    else this.panier.push({ code:p.code, nom:p.nom, prix:p.prix, qte:1, rem:0, unite:p.unite });
    this.refresh();
  },
  setQte(code, q){
    const l = this.panier.find(x=>x.code===code);
    if(!l) return;
    l.qte = Math.max(0, q);
    if(l.qte===0) this.panier = this.panier.filter(x=>x.code!==code);
    this.refresh();
  },
  vider(){ this.panier = []; this.remise = 0; this.refresh(); },

  refresh(){
    const box = el('#pos-cart');
    if(box){ box.innerHTML = this.cartHTML(); this.bindCart(); }
  },

  cartHTML(){
    const t = this.totaux();
    const lignes = this.panier.length ? this.panier.map(l=>`
      <div class="cart-line">
        <div>
          <div class="cart-n">${l.nom}</div>
          <div class="cart-pu">${fmt.n(l.prix,3)} TND / ${l.unite}${l.rem?` · remise ${l.rem} %`:''}</div>
          <div class="qty">
            <button data-q="-" data-code="${l.code}" aria-label="Diminuer">−</button>
            <input value="${l.qte}" data-qi="${l.code}" inputmode="numeric" aria-label="Quantité">
            <button data-q="+" data-code="${l.code}" aria-label="Augmenter">+</button>
          </div>
        </div>
        <div>
          <div class="cart-tot">${fmt.n(l.prix*l.qte*(1-l.rem/100),3)}</div>
          <button class="icon-btn" data-rm="${l.code}" style="margin-top:6px" aria-label="Retirer">${icon('trash')}</button>
        </div>
      </div>`).join('')
      : `<div class="empty">${icon('cart')}<div class="empty-t">Panier vide</div>
         <div class="empty-d">Sélectionnez un produit dans le catalogue pour démarrer la vente.</div></div>`;

    return `
      <div class="card-head">
        <div><div class="card-title">Panier</div>
          <div class="card-sub">${this.panier.length} ligne${this.panier.length>1?'s':''} · ticket TKT-2026-${String(this.ticket).padStart(6,'0')}</div></div>
        <div class="spacer"></div>
        <button class="icon-btn tip" data-tip="Vider le panier" id="pos-clear">${icon('trash')}</button>
      </div>
      <div class="cart-lines">${lignes}</div>
      <div class="totals">
        <div class="field" style="margin-bottom:10px">
          <label>Client</label>
          <select class="input select" id="pos-client">
            <option>Client comptoir</option>
            ${DB.clients.filter(c=>c.nom!=='Client comptoir').map(c=>`<option ${c.nom===this.client?'selected':''}>${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="tot-l"><span>Sous-total</span><span>${fmt.n(t.sousTotal,3)} TND</span></div>
        <div class="tot-l"><span>Remise
          <input class="input" id="pos-rem" value="${this.remise}" style="width:52px;height:24px;padding:0 6px;display:inline-block;margin-left:6px;text-align:right"> %</span>
          <span>− ${fmt.n(t.remise,3)} TND</span></div>
        <div class="tot-l"><span>Total HT</span><span>${fmt.n(t.ht,3)} TND</span></div>
        <div class="tot-l"><span>TVA ${DB.societe.tva} %</span><span>+ ${fmt.n(t.tva,3)} TND</span></div>
        <div class="tot-l big"><span>Total TTC</span><span>${fmt.n(t.ttc,3)} TND</span></div>

        <div class="pay-modes">
          ${[["Espèces","banknote"],["Carte","card"],["Chèque","cheque"],["Virement","transfer"]].map(([m,i])=>
            `<button class="chip ${this.mode===m?'on':''}" data-mode="${m}">${icon(i)}${m}</button>`).join('')}
        </div>
        <button class="btn btn-primary btn-lg btn-block" style="margin-top:12px" id="pos-valider"
          ${this.panier.length?'':'disabled'}>${icon('check')}Valider la vente</button>
      </div>`;
  },

  bindCart(){
    els('[data-q]').forEach(b=> b.onclick = ()=>{
      const l = this.panier.find(x=>x.code===b.dataset.code);
      this.setQte(b.dataset.code, l.qte + (b.dataset.q==='+'?1:-1));
    });
    els('[data-qi]').forEach(i=> i.onchange = ()=> this.setQte(i.dataset.qi, parseInt(i.value)||0));
    els('[data-rm]').forEach(b=> b.onclick = ()=> this.setQte(b.dataset.rm, 0));
    els('[data-mode]').forEach(b=> b.onclick = ()=>{ this.mode = b.dataset.mode; this.refresh(); });
    const c = el('#pos-client'); if(c) c.onchange = ()=> this.client = c.value;
    const r = el('#pos-rem'); if(r) r.onchange = ()=>{ this.remise = Math.min(100, Math.max(0, parseFloat(r.value)||0)); this.refresh(); };
    const cl = el('#pos-clear'); if(cl) cl.onclick = ()=>{ if(this.panier.length) confirmer("Vider le panier ?","Les lignes saisies seront perdues. Cette action n'enregistre aucune vente.",()=>{ this.vider(); toast('Panier vidé','Vous pouvez démarrer une nouvelle vente.','info'); },"Vider"); };
    const v = el('#pos-valider'); if(v) v.onclick = ()=> this.valider();
  },

  valider(){
    const t = this.totaux();
    const rupture = this.panier.find(l=>{ const p = DB.produits.find(x=>x.code===l.code); return p && l.qte > p.stock; });
    if(rupture) return toast('Stock insuffisant', `${rupture.nom} — la quantité demandée dépasse le stock disponible.`, 'err');
    const recu = Math.ceil(t.ttc/10)*10;
    const ticket = Store.enregistrerVente({ lignes:this.panier, client:this.client, mode:this.mode, totaux:t });
    this.dernier = ticket;
    modal({ size:'slim', title:'Vente enregistrée',
      body: `<div style="text-align:center;padding:6px 4px 2px">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center;margin:0 auto 14px">
          ${icon('check')}</div>
        <div style="font-size:16px;font-weight:600">Vente enregistrée avec succès</div>
        <div class="muted" style="margin-top:4px;font-size:13px">Ticket n° TKT-2026-${String(this.ticket).padStart(6,'0')}</div>
        <div style="font-family:var(--font-display);font-size:30px;font-weight:600;margin-top:14px">${fmt.n(t.ttc,3)} <small style="font-size:15px">TND</small></div>
        <div class="muted tiny" style="margin-top:4px">${this.mode} · ${this.client}</div>
        ${this.mode==='Espèces'?`<div class="note" style="margin-top:14px;text-align:left">
          Montant reçu : <strong>${fmt.n(recu,3)} TND</strong> · Monnaie à rendre : <strong>${fmt.n(recu-t.ttc,3)} TND</strong></div>`:''}
      </div>`,
      foot: `<button class="btn" id="tk-new">Nouvelle vente</button>
             <button class="btn" id="tk-pdf">${icon('download')}PDF</button>
             <button class="btn btn-primary" id="tk-print">${icon('print')}Imprimer le ticket</button>`,
      onOpen: ov=>{
        el('#tk-print',ov).onclick = ()=> POS.apercuTicket(recu);
        el('#tk-pdf',ov).onclick = ()=> toast('PDF généré',`Ticket TKT-2026-${String(this.ticket).padStart(6,'0')} téléchargé.`,'info');
        el('#tk-new',ov).onclick = ()=>{ closeModal(); this.ticket++; this.vider();
          toast('Nouvelle vente','La caisse est prête pour le client suivant.'); App.render(); };
      }
    });
  },

  /* Lot rattaché à un produit, repris sur le ticket pour la traçabilité */
  lotDe(nom){
    const st = DB.stocks.find(s=>s.produit===nom || nom.indexOf(s.produit)===0);
    return st && st.lot && st.lot!=='—' ? st.lot : 'LOT-H-2026-0089';
  },

  /* Données communes aux trois formats d'impression */
  donnees(recu=0, src=null){
    const t = src ? src.totaux : this.totaux();
    const vide = !src && !this.panier.length;
    const lignes = src ? src.lignes
      : (this.panier.length ? this.panier
        : [{nom:'Huile extra vierge — 0,75 L',qte:4,prix:18.5,rem:0},{nom:'Huile extra vierge — 1 L',qte:2,prix:24,rem:0}]);
    const ttc = vide ? 142.8 : t.ttc;
    return {
      lignes, ttc,
      st:  vide ? 122  : t.sousTotal,
      rem: vide ? 2    : t.remise,
      tva: vide ? 22.8 : t.tva,
      ht:  vide ? 120  : t.ht,
      rec: recu || Math.ceil(ttc/10)*10,
      num: src ? src.num : 'TKT-2026-'+String(this.ticket).padStart(6,'0'),
      client: src ? src.client : this.client,
      mode: src ? src.mode : this.mode,
      date: src ? src.date : Store.dateFR(),
      heure: src ? src.heure : Store.heureFR()
    };
  },

  /* ---------------------- Ticket client au format A4 --------------------- */
  ticketA4HTML(recu=0, src=null){
    const d = this.donnees(recu, src);
    const cli = DB.clients.find(c=>c.nom===d.client) || {};
    return `<div class="invoice ticket-a4" id="ticket-print" style="max-width:720px">
      <div class="inv-top">
        <div><div class="inv-co">${DB.societe.nom}</div>
          <div style="margin-top:6px;line-height:1.6">${DB.societe.adresse}<br>
            Tél. ${DB.societe.tel} · ${DB.societe.email}<br>
            MF ${DB.societe.mf} · RC ${DB.societe.rc}</div></div>
        <div class="inv-meta"><div class="inv-h1">TICKET DE VENTE</div>
          <div style="margin-top:6px;line-height:1.7">N° <strong>${d.num}</strong><br>
            Date : ${d.date} à ${d.heure}<br>Caissier : ${DB.user.nom}</div></div>
      </div>
      <div class="inv-parties">
        <div class="inv-box"><div class="inv-lab">Client / الزبون</div>
          <strong>${d.client}</strong>${cli.code?`<br>Code ${cli.code}`:''}${cli.tel&&cli.tel!=='—'?`<br>Tél. ${cli.tel}`:''}${cli.mf&&cli.mf!=='—'?`<br>MF ${cli.mf}`:''}</div>
        <div class="inv-box"><div class="inv-lab">Règlement</div>
          Mode : <strong>${d.mode}</strong><br>Montant reçu : ${fmt.n(d.rec,3)} TND<br>
          Monnaie rendue : ${fmt.n(Math.max(0,d.rec-d.ttc),3)} TND</div>
      </div>
      <table>
        <thead><tr><th>Désignation</th><th>Lot</th><th class="r">Qté</th><th class="r">P.U. HT</th><th class="r">Remise</th><th class="r">Total HT</th></tr></thead>
        <tbody>${d.lignes.map(l=>`<tr>
          <td>${l.nom}</td>
          <td><span style="font-size:10.5px">${POS.lotDe(l.nom)}</span></td>
          <td class="r">${fmt.n(l.qte)}</td>
          <td class="r">${fmt.n(l.prix,3)}</td>
          <td class="r">${l.rem?l.rem+' %':'—'}</td>
          <td class="r">${fmt.n(l.prix*l.qte*(1-(l.rem||0)/100),3)}</td></tr>`).join('')}</tbody>
      </table>
      <div class="inv-tot"><table>
        <tr><td>Sous-total HT</td><td class="r">${fmt.n(d.st,3)} TND</td></tr>
        <tr><td>Remise</td><td class="r">− ${fmt.n(d.rem,3)} TND</td></tr>
        <tr><td>Total HT</td><td class="r">${fmt.n(d.ht,3)} TND</td></tr>
        <tr><td>TVA ${DB.societe.tva} %</td><td class="r">${fmt.n(d.tva,3)} TND</td></tr>
        <tr class="grand"><td>Total TTC</td><td class="r">${fmt.n(d.ttc,3)} TND</td></tr>
      </table></div>
      <div class="inv-foot">
        Huile issue de la campagne 2025/2026, lots mentionnés ci-dessus pour assurer la traçabilité réglementaire.<br>
        Merci pour votre confiance — Signature du client : ............................
      </div>
    </div>`;
  },

  /* ---------------------- Ticket de caisse imprimable -------------------- */
  ticketHTML(format='w80', recu=0, src=null){
    if(format==='a4') return this.ticketA4HTML(recu, src);
    const t = src ? src.totaux : this.totaux();
    const lignes = src ? src.lignes
      : (this.panier.length?this.panier:[{nom:'Huile extra vierge 0,75 L',qte:4,prix:18.5,rem:0},{nom:'Huile extra vierge 1 L',qte:2,prix:24,rem:0}]);
    const vide = !src && !this.panier.length;
    const ttc = vide ? 142.8 : t.ttc;
    const st  = vide ? 122   : t.sousTotal;
    const rem = vide ? 2     : t.remise;
    const tva = vide ? 22.8  : t.tva;
    const rec = recu || Math.ceil(ttc/10)*10;
    const numTicket = src ? src.num : 'TKT-2026-'+String(this.ticket).padStart(6,'0');
    const client = src ? src.client : this.client;
    const mode = src ? src.mode : this.mode;
    return `<div class="ticket ${format}" id="ticket-print">
      <div class="t-c">
        <svg class="t-logo" viewBox="0 0 24 24" fill="none" stroke="#23503A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS.olive}</svg>
        <div class="t-co">${DB.societe.nom.toUpperCase()}</div>
        <div>${DB.societe.adresse}</div>
        <div>Tél. ${DB.societe.tel}</div>
        <div>MF ${DB.societe.mf}</div>
      </div>
      <div class="t-sep"></div>
      <div><strong>TICKET N° ${numTicket}</strong></div>
      <div>Date : ${src?src.date:Store.dateFR()}&nbsp;&nbsp;&nbsp;Heure : ${src?src.heure:Store.heureFR()}</div>
      <div>Caissier : ${DB.user.nom}</div>
      <div>Client : ${client}</div>
      <div class="t-sep"></div>
      <table>
        <tr><td>PRODUIT</td><td class="r">QTE</td><td class="r">PU</td><td class="r">TOTAL</td></tr>
        ${lignes.map(l=>`<tr><td colspan="4" style="padding-top:5px">${l.nom}</td></tr>
          <tr><td colspan="4" style="font-size:9.5px">Lot ${POS.lotDe(l.nom)}</td></tr>
          <tr><td></td><td class="r">${l.qte}</td><td class="r">${fmt.n(l.prix,3)}</td>
              <td class="r">${fmt.n(l.prix*l.qte*(1-(l.rem||0)/100),3)}</td></tr>`).join('')}
      </table>
      <div class="t-sep"></div>
      <table>
        <tr><td>Sous-total</td><td class="r">${fmt.n(st,3)} TND</td></tr>
        <tr><td>Remise</td><td class="r">${fmt.n(rem,3)} TND</td></tr>
        <tr><td>TVA ${DB.societe.tva} %</td><td class="r">${fmt.n(tva,3)} TND</td></tr>
        <tr class="t-tot"><td>TOTAL TTC</td><td class="r">${fmt.n(ttc,3)} TND</td></tr>
      </table>
      <div class="t-sep"></div>
      <table>
        <tr><td>Mode de paiement</td><td class="r">${mode.toUpperCase()}</td></tr>
        <tr><td>Montant reçu</td><td class="r">${fmt.n(rec,3)} TND</td></tr>
        <tr><td>Monnaie rendue</td><td class="r">${fmt.n(Math.max(0,rec-ttc),3)} TND</td></tr>
      </table>
      <div class="t-sep"></div>
      <div class="t-c t-thanks">Merci pour votre confiance !<br>À bientôt 🌿<br>
        <span style="font-size:9.5px">${DB.societe.email}</span></div>
    </div>`;
  },

  apercuTicketEnregistre(t, format='w80'){
    this.apercuTicket(Math.ceil(t.ttc/10)*10, {
      lignes: t.lignes.map(l=>({...l, rem:0})), client:t.client, mode:t.mode, num:t.num,
      date:t.date, heure:t.heure,
      totaux:{ sousTotal:t.ht, remise:0, ht:t.ht, tva:t.tva, ttc:t.ttc }
    }, format);
  },

  apercuTicket(recu, src=null, format='w80'){
    modal({ title:'Aperçu du ticket', size: format==='a4' ? 'wide' : '',
      body: `<div class="row no-print" style="justify-content:center;margin-bottom:14px">
          <div class="seg" id="tk-fmt">
            <button class="${format==='w80'?'on':''}" data-f="w80">Thermique 80 mm</button>
            <button class="${format==='w58'?'on':''}" data-f="w58">Thermique 58 mm</button>
            <button class="${format==='a4'?'on':''}" data-f="a4">Ticket client A4</button>
          </div></div>
        <div class="print-preview" id="tk-box">${this.ticketHTML(format, recu, src)}</div>`,
      foot: `<button class="btn" data-close>Fermer</button>
             <button class="btn" id="tk-dl">${icon('download')}Télécharger en PDF</button>
             <button class="btn btn-primary" id="tk-go">${icon('print')}Imprimer</button>`,
      onOpen: ov=>{
        els('#tk-fmt button', ov).forEach(b=> b.onclick = ()=>{
          els('#tk-fmt button', ov).forEach(x=>x.classList.remove('on')); b.classList.add('on');
          el('#tk-box',ov).innerHTML = this.ticketHTML(b.dataset.f, recu, src);
        });
        el('#tk-go',ov).onclick = ()=> window.print();
        el('#tk-dl',ov).onclick = ()=> toast('PDF généré','Le ticket a été enregistré dans vos téléchargements.','info');
      }
    });
  }
};

/* =========================== PAGE CAISSE ================================ */
PAGES.pos = () => {
  const cats = ["Tous", ...new Set(DB.produits.map(p=>p.cat))];
  const prods = DB.produits.filter(p=> POS.cat==='Tous' || p.cat===POS.cat);
  const grille = prods.map(p=>`
    <button class="prod" data-add="${p.code}">
      <div class="prod-img">
        <svg viewBox="0 0 24 24" fill="none" stroke="#23503A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${ICONS.bottle}</svg>
        <span class="prod-stock badge ${p.stock<60?'danger':p.stock<150?'warn':'ok'} no-dot">${fmt.n(p.stock)} ${p.unite}</span>
      </div>
      <div class="prod-b">
        <div class="prod-n">${p.nom}</div>
        <div class="prod-p">${fmt.n(p.prix,3)} <span>TND</span></div>
      </div>
    </button>`).join('');

  return pageHead("Vente rapide","Caisse comptoir — encaissement immédiat et édition du ticket",
    `<button class="btn btn-sm" data-go="tickets">${icon('history')}Tickets du jour</button>
     <button class="btn btn-sm" id="pos-preview">${icon('print')}Aperçu du ticket</button>`)
  + `<div class="pos">
      <div>
        <div class="pos-cats">${cats.map(c=>`<button class="chip ${POS.cat===c?'on':''}" data-cat="${c}">${c}</button>`).join('')}</div>
        <div class="prod-grid">${grille}</div>
      </div>
      <section class="card cart" id="pos-cart">${POS.cartHTML()}</section>
     </div>`;
};

PAGES.tickets = () => pageHead("Tickets de caisse","Ventes comptoir enregistrées",
  `<button class="btn btn-sm btn-primary" data-go="pos">${icon('cart')}Nouvelle vente</button>`)
  + `<div class="grid g-4" style="margin-bottom:16px">
      ${[["Tickets du jour", String(DB.tickets.length)],
         ["Encaissé comptoir", fmt.n(DB.tickets.reduce((s,t)=>s+t.ttc,0),3)+" TND"],
         ["Articles vendus", String(DB.tickets.reduce((s,t)=>s+t.articles,0))],
         ["Panier moyen", fmt.n(DB.tickets.reduce((s,t)=>s+t.ttc,0)/(DB.tickets.length||1),3)+" TND"]]
        .map(([l,v])=>`<article class="card kpi"><div class="kpi-label">${l}</div>
          <div class="kpi-value" style="font-size:21px">${v}</div></article>`).join('')}
     </div>`
  + dataTable('tkt', [
      {k:'num', t:'Ticket', render:r=>`<span class="ref">${r.num}</span>`},
      {k:'date', t:'Date'}, {k:'heure', t:'Heure'}, {k:'client', t:'Client'},
      {k:'articles', t:'Articles', r:true},
      {k:'mode', t:'Mode de paiement'},
      {k:'ttc', t:'Total TTC', r:true, render:r=>`<span class="strong">${fmt.n(r.ttc,3)} TND</span>`},
      {k:'x', t:'', r:true, render:()=>`<div class="row-actions">
        <button class="icon-btn tip" data-tip="Voir le ticket" data-do="tk">${icon('eye')}</button>
        <button class="icon-btn tip" data-tip="Ticket client A4" data-do="a4">${icon('file')}</button>
        <button class="icon-btn tip" data-tip="Réimprimer" data-do="print">${icon('print')}</button></div>`}
    ], DB.tickets, { ph:"Rechercher un ticket, un client…",
      filters:[{k:'mode', t:'Mode de paiement', options:()=>DB.modesPaiement},
               {k:'client', t:'Client', options:()=>[...new Set(DB.tickets.map(t=>t.client))]}],
      onRow:t=>POS.apercuTicketEnregistre(t),
      rowAction:(a,t)=>{
        if(a==='tk') return POS.apercuTicketEnregistre(t);
        if(a==='a4') return POS.apercuTicketEnregistre(t, 'a4');
        window.print();
      }});

/* =========================== VUES DÉTAILLÉES ============================ */
const Vues = {
  facture(f){
    const d = DB.factureDetail;
    const lignes = d.lignes.map(l=>{
      const tot = l.q*l.pu*(1-l.rem/100);
      return `<tr><td>${l.d}</td><td class="r">${l.q}</td><td class="r">${fmt.n(l.pu,3)}</td>
        <td class="r">${l.rem?l.rem+' %':'—'}</td><td class="r">${fmt.n(tot,3)}</td></tr>`;
    }).join('');
    const ht = d.lignes.reduce((s,l)=>s+l.q*l.pu*(1-l.rem/100),0);
    const tva = ht*0.19;

    modal({ size:'wide', title:'Facture '+f.num,
      body:`<div class="invoice" id="inv-print">
        <div class="inv-top">
          <div><div class="inv-co">${DB.societe.nom}</div>
            <div style="margin-top:6px;line-height:1.6">${DB.societe.adresse}<br>Tél. ${DB.societe.tel}<br>MF ${DB.societe.mf}<br>RC ${DB.societe.rc}</div></div>
          <div class="inv-meta"><div class="inv-h1">FACTURE</div>
            <div style="margin-top:6px;line-height:1.7">N° <strong>${f.num}</strong><br>Date : ${f.date}<br>Échéance : ${f.echeance}<br>Campagne 2025/2026</div></div>
        </div>
        <div class="inv-parties">
          <div class="inv-box"><div class="inv-lab">Facturé à</div>
            <strong>${f.client}</strong><br>${d.adresse}<br>MF ${d.mf}</div>
          <div class="inv-box"><div class="inv-lab">Conditions de règlement</div>
            ${d.conditions}<br>Banque : ${DB.societe.banque}<br>RIB : ${DB.societe.rib}</div>
        </div>
        <table>
          <thead><tr><th>Désignation et lot livré</th><th class="r">Qté</th><th class="r">P.U. HT</th><th class="r">Remise</th><th class="r">Total HT</th></tr></thead>
          <tbody>${lignes}</tbody>
        </table>
        <div class="inv-tot"><table>
          <tr><td>Total HT</td><td class="r">${fmt.n(ht,3)} TND</td></tr>
          <tr><td>TVA ${DB.societe.tva} %</td><td class="r">${fmt.n(tva,3)} TND</td></tr>
          <tr><td>Timbre fiscal</td><td class="r">1,000 TND</td></tr>
          <tr class="grand"><td>Total TTC</td><td class="r">${fmt.n(ht+tva+1,3)} TND</td></tr>
        </table></div>
        <div class="inv-foot">Arrêtée la présente facture à la somme de ${fmt.n(ht+tva+1,3)} dinars toutes taxes comprises.
          Les marchandises livrées sont issues des lots mentionnés ci-dessus, conformément aux exigences de traçabilité du secteur agroalimentaire.</div>
      </div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" data-toast="Paiement enregistré|Le solde de la facture a été mis à jour.">${icon('coins')}Enregistrer un paiement</button>
            <button class="btn" data-toast="PDF généré|La facture a été exportée.">${icon('download')}PDF</button>
            <button class="btn btn-primary" id="inv-print-btn">${icon('print')}Imprimer</button>`,
      onOpen: ov=>{ el('#inv-print-btn',ov).onclick = ()=> window.print(); App.bindGlobal(ov); }
    });
  },

  ficheClient(c){
    modal({ size:'wide', title:c.nom,
      body:`<div class="grid" style="grid-template-columns:1fr 1.3fr;gap:18px">
        <div>
          <dl class="kv">
            <dt>Code client</dt><dd><span class="ref">${c.code}</span></dd>
            <dt>Téléphone</dt><dd>${c.tel}</dd>
            <dt>Ville</dt><dd>${c.ville}</dd>
            <dt>Dernière commande</dt><dd>${c.derniere}</dd>
            <dt>Chiffre d'affaires</dt><dd>${fmt.n(c.ca)} TND</dd>
            <dt>Encours</dt><dd>${c.encours?fmt.n(c.encours)+' TND':'aucun'}</dd>
            <dt>Limite de crédit</dt><dd>${c.limite?fmt.n(c.limite)+' TND':'non définie'}</dd>
            <dt>Statut</dt><dd>${statutBadge(c.statut)}</dd>
          </dl>
          ${c.limite && c.encours>c.limite ? `<div class="blocked" style="margin-top:16px">${icon('alert-triangle')}
            <div class="tiny">Limite de crédit dépassée. La validation d'une nouvelle commande sera bloquée selon le paramétrage (RG-CLI-02).</div></div>`:''}
        </div>
        <div>
          <div class="tabs" style="margin-bottom:12px">
            <div class="tab active">Commandes</div><div class="tab">Livraisons</div><div class="tab">Factures</div><div class="tab">Paiements</div>
          </div>
          <div class="table-wrap"><table class="tbl">
            <thead><tr><th>Document</th><th>Date</th><th class="r">Montant</th><th>Statut</th></tr></thead>
            <tbody>${DB.commandes.slice(0,4).map(o=>`<tr><td><span class="ref">${o.num}</span></td><td>${o.date}</td>
              <td class="r">${fmt.n(o.montant,3)} TND</td><td>${statutBadge(o.statut)}</td></tr>`).join('')}</tbody>
          </table></div>
        </div>
      </div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn" data-toast="Ticket imprimé|Le dernier ticket du client a été réédité.">${icon('print')}Imprimer un ticket</button>
            <button class="btn" data-toast="Facture créée|FAC-2026-00435 générée pour ce client.">${icon('receipt')}Créer une facture</button>
            <button class="btn btn-primary" data-go="pos">${icon('cart')}Nouvelle vente</button>`,
      onOpen: ov=> App.bindGlobal(ov)
    });
  },

  ficheProducteur(p){
    modal({ size:'', title:p.nom,
      body:`<dl class="kv">
          <dt>Code producteur</dt><dd><span class="ref">${p.code}</span></dd>
          <dt>Téléphone</dt><dd>${p.tel}</dd>
          <dt>Zone agricole</dt><dd>${p.zone}</dd>
          <dt>Parcelles</dt><dd>${p.parcelles.join(', ')}</dd>
          <dt>Variétés cultivées</dt><dd>${p.varietes}</dd>
          <dt>Apports de la campagne</dt><dd>${p.apports} apports · ${fmt.n(p.quantite)} kg</dd>
          <dt>Rendement moyen</dt><dd><strong>${fmt.pct(p.rdt)}</strong></dd>
          <dt>Solde à régler</dt><dd>${p.solde?fmt.n(p.solde)+' TND':'soldé'}</dd>
        </dl>
        <div class="mt">
          <div class="card-title" style="margin-bottom:8px">Derniers apports</div>
          ${DB.receptions.filter(r=>r.producteur===p.nom).slice(0,4).map(r=>`
            <div class="stat-line"><div><span class="ref">${r.num}</span>
              <div class="cell-sub">${r.date} · ${r.variete} · lot ${r.lot}</div></div>
              <div class="v">${fmt.n(r.net)} kg</div></div>`).join('') || '<div class="muted tiny">Aucun apport sur la période affichée.</div>'}
        </div>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn btn-primary" data-go="collecte">${icon('truck')}Enregistrer un apport</button>`,
      onOpen: ov=> App.bindGlobal(ov)
    });
  },

  nouveauClient(){
    modal({ title:'Nouveau client',
      body:`<div class="grid g-2">
        <div class="field"><label>Code client</label><input class="input" value="CLI-0091" readonly></div>
        <div class="field"><label>Nom ou raison sociale</label><input class="input" placeholder="Ex. Sté Oliva Distribution"></div>
        <div class="field"><label>Téléphone</label><input class="input" placeholder="+216 …"></div>
        <div class="field"><label>E-mail</label><input class="input" placeholder="contact@…"></div>
        <div class="field span-2"><label>Adresse de facturation</label><input class="input"></div>
        <div class="field"><label>Matricule fiscal</label><input class="input"></div>
        <div class="field"><label>Conditions de paiement</label><select class="input select"><option>Comptant</option><option>15 jours</option><option>30 jours</option><option>60 jours</option></select></div>
        <div class="field"><label>Limite de crédit (TND)</label><input class="input" type="number" value="5000"></div>
        <div class="field"><label>Statut</label><select class="input select"><option>Actif</option><option>Inactif</option></select></div>
      </div>`,
      foot:`<button class="btn" data-close>Annuler</button>
            <button class="btn btn-primary" id="nc-ok">${icon('check')}Créer le client</button>`,
      onOpen: ov=> el('#nc-ok',ov).onclick = ()=>{ closeModal(); toast('Client créé','CLI-0091 a été ajouté à la base commerciale.'); }
    });
  }
};
