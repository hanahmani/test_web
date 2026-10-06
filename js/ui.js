/* ==========================================================================
   OLIVERA ERP — Socle UI (icônes, graphiques, tableaux, modales, toasts)
   Aucune dépendance externe : tout fonctionne hors ligne.
   ========================================================================== */

/* ------------------------------ Icônes ---------------------------------- */
const ICONS = {
  "gauge":'<path d="M12 15a3 3 0 1 0 0-6"/><path d="m14.1 9.9 3.4-3.4"/><path d="M3.3 17A9 9 0 1 1 20.7 17"/>',
  "layout":'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  "truck":'<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.3a2 2 0 0 0-.6-1.4L18.7 9.6a2 2 0 0 0-1.4-.6H14v8h3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  "user":'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  "users":'<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 5.2a3.5 3.5 0 0 1 0 6.6"/><path d="M19 21a6.5 6.5 0 0 0-3-5"/>',
  "cart":'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5l2.6 12h11.4l2-8H6"/>',
  "sprout":'<path d="M12 21V11"/><path d="M12 11C12 7 9 4 4 4c0 5 3 7 8 7Z"/><path d="M12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 6-7 6Z"/>',
  "boxes":'<rect x="3" y="9" width="8" height="7" rx="1"/><rect x="13" y="9" width="8" height="7" rx="1"/><rect x="8" y="3" width="8" height="6" rx="1"/>',
  "box":'<path d="m3 8 9-5 9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  "package":'<path d="m3 8 9-5 9 5v8l-9 5-9-5Z"/><path d="M7.5 5.5 16 10.5"/><path d="M3 8l9 5 9-5"/>',
  "factory":'<path d="M3 21V10l6 4V10l6 4V6l6 4v11Z"/><path d="M8 21v-4M14 21v-4"/>',
  "droplet":'<path d="M12 2.7 6.9 9.4a6.5 6.5 0 1 0 10.2 0Z"/>',
  "flask":'<path d="M10 3h4M11 3v6.5L5.5 18A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.7-3L13 9.5V3"/><path d="M8 15h8"/>',
  "shield":'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/>',
  "shield-alert":'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="M12 8v4M12 15.5v.01"/>',
  "wallet":'<path d="M20 8V6.5A1.5 1.5 0 0 0 18.5 5H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/><circle cx="16.5" cy="14" r="1.2"/>',
  "receipt":'<path d="M5 3v18l2.5-1.6L10 21l2-1.6L14 21l2.5-1.6L19 21V3Z"/><path d="M9 8h6M9 12h6"/>',
  "coins":'<ellipse cx="9" cy="6" rx="6" ry="3"/><path d="M3 6v5c0 1.7 2.7 3 6 3s6-1.3 6-3V6"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><ellipse cx="15" cy="12" rx="6" ry="3"/>',
  "bank":'<path d="M3 10h18M4 10 12 4l8 6"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8M3 21h18"/>',
  "trend":'<path d="M3 17 9.5 10.5l4 4L21 7"/><path d="M15 7h6v6"/>',
  "chart":'<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/>',
  "bell":'<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 20a2 2 0 0 0 3 0"/>',
  "list":'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  "settings":'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7.9 19l-.1.1A2 2 0 1 1 5 16.3l.1-.1A1.6 1.6 0 0 0 3.9 13.5H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 5 7.9l-.1-.1A2 2 0 1 1 7.7 5l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1A2 2 0 1 1 20.6 7l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z"/>',
  "key":'<circle cx="7.5" cy="15.5" r="3.5"/><path d="m10 13 8.5-8.5M16 7l2 2M13.5 9.5l2 2"/>',
  "map":'<path d="m9 4 6 2 5.5-2v14L15 20 9 18 3.5 20V6Z"/><path d="M9 4v14M15 6v14"/>',
  "tag":'<path d="M20 12.5 12.5 20a2 2 0 0 1-2.8 0L3 13.3V4h9.3l7.7 7.7a1.6 1.6 0 0 1 0 .8Z"/><circle cx="8" cy="9" r="1.4"/>',
  "wrench":'<path d="M15.5 8.5a4.5 4.5 0 0 1-5.8 5.8L5 19a2.1 2.1 0 0 1-3-3l4.7-4.7a4.5 4.5 0 0 1 5.8-5.8L9.8 8.2l1.5 3.5 3.5 1.5Z"/>',
  "cog":'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  "search":'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  "plus":'<path d="M12 5v14M5 12h14"/>',
  "minus":'<path d="M5 12h14"/>',
  "check":'<path d="m4 12.5 5 5L20 6.5"/>',
  "check-circle":'<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.7 2.8L16 9.5"/>',
  "x":'<path d="M6 6l12 12M18 6 6 18"/>',
  "alert-triangle":'<path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 16.5v.01"/>',
  "info":'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>',
  "print":'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="7" rx="2"/><path d="M6 14h12v7H6Z"/>',
  "download":'<path d="M12 3v12"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M4 20h16"/>',
  "eye":'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.6"/>',
  "edit":'<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17Z"/><path d="m14.5 6.5 3 3"/>',
  "trash":'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  "filter":'<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
  "clock":'<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.2 2"/>',
  "calendar":'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  "sun":'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  "moon":'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  "logout":'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M9 16.5 4.5 12 9 7.5M4.5 12H15"/>',
  "menu":'<path d="M3 6h18M3 12h18M3 18h18"/>',
  "panel":'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  "bottle":'<path d="M10 2h4v3.2c0 1 .4 1.9 1.1 2.6l.9.9c.6.6 1 1.5 1 2.4V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8.9c0-.9.4-1.8 1-2.4l.9-.9C9.6 7.1 10 6.2 10 5.2Z"/><path d="M7 13h10"/>',
  "banknote":'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  "card":'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  "cheque":'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 14h6M6 10h12"/>',
  "transfer":'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  "link":'<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>',
  "arrow-right":'<path d="M5 12h14M13 6l6 6-6 6"/>',
  "chevron-right":'<path d="m9 6 6 6-6 6"/>',
  "chevron-left":'<path d="m15 6-6 6 6 6"/>',
  "history":'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7.5V12l3 2"/>',
  "file":'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
  "olive":'<ellipse cx="12" cy="14" rx="5.5" ry="7"/><path d="M12 7c0-3 2-5 5-5 0 3-2 5-5 5Z"/>'
};

function icon(name, cls){
  const p = ICONS[name] || ICONS["info"];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" class="${cls||''}" aria-hidden="true">${p}</svg>`;
}

/* ------------------------------ Formatage ------------------------------- */
const fmt = {
  n(v, d=0){ return (v ?? 0).toLocaleString('fr-FR',{minimumFractionDigits:d, maximumFractionDigits:d}); },
  tnd(v){ return (v ?? 0).toLocaleString('fr-FR',{minimumFractionDigits:3, maximumFractionDigits:3}) + ' TND'; },
  pct(v){ return (v ?? 0).toLocaleString('fr-FR',{minimumFractionDigits:2, maximumFractionDigits:2}) + ' %'; }
};

const el = (sel, root) => (root||document).querySelector(sel);
const els = (sel, root) => Array.from((root||document).querySelectorAll(sel));

/* ------------------------------ Graphiques SVG -------------------------- */
const Chart = {
  /* Courbe / aire */
  line(data, opts={}){
    const w = opts.w||760, h = opts.h||230, pad = {l:46,r:14,t:14,b:26};
    const series = Array.isArray(data[0]) ? data : [data];
    const colors = opts.colors || ['#23503A','#d17e06'];
    const labels = opts.labels || [];
    const all = series.flat();
    const max = opts.max ?? Math.max(...all)*1.12, min = opts.min ?? 0;
    const iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    const X = i => pad.l + (iw * i / Math.max(1,(series[0].length-1)));
    const Y = v => pad.t + ih - ((v-min)/(max-min||1))*ih;
    let g = '';
    for(let i=0;i<=4;i++){
      const y = pad.t + ih*i/4, v = max - (max-min)*i/4;
      g += `<line class="grid-l" x1="${pad.l}" y1="${y}" x2="${w-pad.r}" y2="${y}"/>
            <text x="${pad.l-8}" y="${y+3.5}" text-anchor="end">${fmt.n(Math.round(v))}</text>`;
    }
    labels.forEach((l,i)=>{ if(labels.length<=12 || i%2===0)
      g += `<text x="${X(i)}" y="${h-7}" text-anchor="middle">${l}</text>`; });
    let paths = '';
    series.forEach((s,si)=>{
      const d = s.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
      const id = 'grd'+Math.random().toString(36).slice(2,7);
      if(opts.area!==false && si===0){
        paths += `<defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${colors[si]}" stop-opacity=".22"/>
          <stop offset="100%" stop-color="${colors[si]}" stop-opacity="0"/></linearGradient></defs>
          <path d="${d} L${X(s.length-1)} ${pad.t+ih} L${pad.l} ${pad.t+ih} Z" fill="url(#${id})"/>`;
      }
      paths += `<path d="${d}" fill="none" stroke="${colors[si]}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      s.forEach((v,i)=> paths += `<circle cx="${X(i)}" cy="${Y(v)}" r="3" fill="var(--surface)" stroke="${colors[si]}" stroke-width="2">
        <title>${labels[i]||''} : ${fmt.n(v)} ${opts.unit||''}</title></circle>`);
    });
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="width:100%;height:auto">${g}${paths}</svg>`;
  },

  /* Barres verticales (une ou deux séries) */
  bars(data, opts={}){
    const w = opts.w||760, h = opts.h||230, pad = {l:48,r:14,t:14,b:26};
    const series = Array.isArray(data[0]) ? data : [data];
    const colors = opts.colors || ['#23503A','#C9B27A'];
    const labels = opts.labels || [];
    const max = Math.max(...series.flat())*1.12;
    const iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    const n = series[0].length, slot = iw/n, bw = Math.min(opts.bw||22, slot/(series.length+0.7));
    let g='';
    for(let i=0;i<=4;i++){
      const y = pad.t+ih*i/4, v = max-(max)*i/4;
      g += `<line class="grid-l" x1="${pad.l}" y1="${y}" x2="${w-pad.r}" y2="${y}"/>
            <text x="${pad.l-8}" y="${y+3.5}" text-anchor="end">${fmt.n(Math.round(v))}</text>`;
    }
    let bars='';
    series.forEach((s,si)=> s.forEach((v,i)=>{
      const bh = Math.max(1,(v/max)*ih);
      const x = pad.l + slot*i + slot/2 - (bw*series.length+3*(series.length-1))/2 + si*(bw+3);
      bars += `<rect x="${x.toFixed(1)}" y="${(pad.t+ih-bh).toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" rx="4" fill="${colors[si]}">
        <title>${labels[i]||''} : ${fmt.n(v)} ${opts.unit||''}</title></rect>`;
    }));
    labels.forEach((l,i)=>{ bars += `<text x="${pad.l+slot*i+slot/2}" y="${h-7}" text-anchor="middle">${l}</text>`; });
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="width:100%;height:auto">${g}${bars}</svg>`;
  },

  /* Anneau */
  donut(items, opts={}){
    const size = opts.size||188, r = size/2-16, cx=size/2, cy=size/2, sw=opts.sw||22;
    const total = items.reduce((a,b)=>a+b.v,0);
    let a0 = -Math.PI/2, seg='';
    items.forEach(it=>{
      const a1 = a0 + (it.v/total)*Math.PI*2;
      const large = (a1-a0) > Math.PI ? 1 : 0;
      const x0=cx+r*Math.cos(a0), y0=cy+r*Math.sin(a0), x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
      seg += `<path d="M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}"
        fill="none" stroke="${it.c}" stroke-width="${sw}" stroke-linecap="butt"><title>${it.k} : ${fmt.n(it.v)}</title></path>`;
      a0 = a1;
    });
    const legend = items.map(i=>`<span><i style="background:${i.c}"></i>${i.k} · ${fmt.n(i.v)}</span>`).join('');
    return `<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px;flex:0 0 auto">${seg}
        <text x="${cx}" y="${cy-2}" text-anchor="middle" style="font-size:11px">${opts.centerLabel||'Total'}</text>
        <text x="${cx}" y="${cy+16}" text-anchor="middle" style="font-size:15px;font-weight:600;fill:var(--ink)">${fmt.n(total)}</text>
      </svg><div class="legend" style="flex-direction:column;gap:8px;margin:0">${legend}</div></div>`;
  },

  /* Barres horizontales (tops) */
  hbars(items, opts={}){
    const max = Math.max(...items.map(i=>i.v));
    return items.map(i=>`
      <div>
        <div class="hbar-lab"><span>${i.k}</span><span class="hbar-val">${fmt.n(i.v)} ${opts.unit||''}</span></div>
        <div class="hbar-track"><div class="hbar-fill" style="width:${(i.v/max*100).toFixed(1)}%;background:${i.c||'var(--forest)'}"></div></div>
      </div>`).join('<div style="height:11px"></div>');
  },

  /* Courbe miniature de KPI */
  spark(vals, color){
    const w=88,h=34,max=Math.max(...vals),min=Math.min(...vals);
    const X=i=>i*(w/(vals.length-1)), Y=v=>h-2-((v-min)/((max-min)||1))*(h-6);
    const d = vals.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    const id='s'+Math.random().toString(36).slice(2,7);
    return `<svg class="spark" viewBox="0 0 ${w} ${h}">
      <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".28"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${d} L${w} ${h} L0 ${h} Z" fill="url(#${id})"/>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
};

/* ------------------------------ Toasts ---------------------------------- */
function toast(titre, desc, type='ok'){
  if(window.I18n){ titre = I18n.t(titre); desc = I18n.t(desc); }
  let box = el('.toasts');
  if(!box){ box = document.createElement('div'); box.className='toasts'; document.body.appendChild(box); }
  const ic = type==='ok'?'check-circle':type==='err'?'alert-triangle':type==='warn'?'alert-triangle':'info';
  const t = document.createElement('div');
  t.className = 'toast '+(type==='ok'?'':type);
  t.innerHTML = `${icon(ic)}<div><div class="toast-t">${titre}</div>${desc?`<div class="toast-d">${desc}</div>`:''}</div>`;
  box.appendChild(t);
  setTimeout(()=>{ t.style.transition='opacity .25s, transform .25s'; t.style.opacity=0; t.style.transform='translateX(20px)';
    setTimeout(()=>t.remove(),260); }, 3800);
}

/* ------------------------------ Modales --------------------------------- */
function modal({title, body, foot, size='', onOpen}){
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true">
      <div class="modal-head"><div class="modal-title">${title}</div><div class="spacer"></div>
        <button class="icon-btn" data-close aria-label="Fermer">${icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      ${foot?`<div class="modal-foot">${foot}</div>`:''}
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e=>{ if(e.target===ov || e.target.closest('[data-close]')) closeModal(); });
  if(onOpen) onOpen(ov);
  if(window.App) App.bindGlobal(ov);
  if(window.I18n) I18n.apply(ov);
  return ov;
}
function closeModal(){ els('.overlay').forEach(o=>o.remove()); }

function confirmer(titre, texte, onOk, labelOk='Confirmer'){
  modal({ size:'slim', title:titre,
    body:`<p style="font-size:13.4px;color:var(--ink-2);line-height:1.6">${texte}</p>`,
    foot:`<button class="btn" data-close>Annuler</button><button class="btn btn-danger" id="cf-ok">${labelOk}</button>`,
    onOpen(ov){ el('#cf-ok',ov).onclick = ()=>{ closeModal(); onOk&&onOk(); }; }
  });
}

/* ------------------------------ Tableau générique ------------------------ */
/* cols: [{k:'clé', t:'Titre', cls:'', r:true, render:(row)=>html}] */
function dataTable(id, cols, rows, opts={}){
  const state = dataTable.state[id] = dataTable.state[id] || { sort:null, dir:1, page:1, q:'', f:{} };
  const per = opts.per || 8;
  const filtres = (opts.filters||[]).map(f=>({...f,
    options: typeof f.options==='function' ? f.options() : f.options,
    get: f.get || (r=>r[f.k]) }));

  let list = rows.slice();
  if(state.q){
    const q = state.q.toLowerCase();
    list = list.filter(r => Object.values(r).some(v => String(v??'').toLowerCase().includes(q)));
  }
  filtres.forEach(f=>{
    const v = state.f[f.k];
    if(v) list = list.filter(r => String(f.get(r)??'').toLowerCase().includes(String(v).toLowerCase()));
  });
  if(state.sort){
    list.sort((a,b)=>{
      const x=a[state.sort], y=b[state.sort];
      const nx=parseFloat(String(x).replace(/[^\d.-]/g,'')), ny=parseFloat(String(y).replace(/[^\d.-]/g,''));
      if(!isNaN(nx)&&!isNaN(ny)) return (nx-ny)*state.dir;
      return String(x??'').localeCompare(String(y??''),'fr')*state.dir;
    });
  }
  const pages = Math.max(1, Math.ceil(list.length/per));
  state.page = Math.min(state.page, pages);
  const slice = opts.noPager ? list : list.slice((state.page-1)*per, state.page*per);
  const actifs = Object.values(state.f).filter(Boolean).length + (state.q?1:0);

  const head = cols.map(c=>`<th class="${c.cls||''} ${c.r?'r':''} sortable" data-sort="${c.k}">${c.t}
      <span class="sort-i">${state.sort===c.k ? (state.dir>0?'▲':'▼') : '↕'}</span></th>`).join('');
  const body = slice.length ? slice.map(r=>`<tr class="${opts.onRow||opts.entity?'clickable':''}" data-i="${rows.indexOf(r)}">
      ${cols.map(c=>`<td class="${c.cls||''} ${c.r?'r':''}">${c.render?c.render(r):(r[c.k]??'')}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${cols.length}"><div class="empty">${icon('search')}
        <div class="empty-t">Aucun résultat</div>
        <div class="empty-d">Aucune ligne ne correspond aux critères. Réinitialisez les filtres pour tout afficher.</div></div></td></tr>`;

  const pager = opts.noPager ? '' : `<div class="pager">
      <span><strong>${list.length}</strong> <span>résultats</span>${list.length!==rows.length?` <span>sur</span> ${rows.length}`:''} · <span>page</span> ${state.page} <span>sur</span> ${pages}</span>
      <div class="pages">
        <button class="pg" data-pg="${Math.max(1,state.page-1)}">‹</button>
        ${Array.from({length:pages},(_,i)=>i+1).filter(i=>Math.abs(i-state.page)<3||i===1||i===pages)
          .map(i=>`<button class="pg ${state.page===i?'active':''}" data-pg="${i}">${i}</button>`).join('')}
        <button class="pg" data-pg="${Math.min(pages,state.page+1)}">›</button>
      </div></div>`;

  const barreFiltres = filtres.length ? `<div class="filters">
      ${filtres.map(f=>`<select class="input select filter-sel" data-filter="${f.k}">
        <option value="">${f.t} : tous</option>
        ${f.options.map(o=>`<option ${state.f[f.k]===String(o)?'selected':''}>${o}</option>`).join('')}
      </select>`).join('')}
      <button class="btn btn-sm" data-act="reset" ${actifs?'':'disabled'}>${icon('x')}Réinitialiser les filtres${actifs?` (${actifs})`:''}</button>
      <div class="spacer"></div>
      <span class="tiny muted">${list.length} / ${rows.length} <span>lignes affichées</span></span>
    </div>`:'';

  const toolbar = opts.noToolbar ? '' : `<div class="toolbar">
      <div style="position:relative;flex:1;min-width:190px;max-width:330px">
        <input class="input input-search" id="q-${id}" placeholder="${opts.ph||'Rechercher…'}" value="${state.q}">
      </div>
      <div class="spacer"></div>
      ${opts.actions||''}
      ${opts.entity?`<button class="btn btn-sm btn-primary" data-crud="add:${opts.entity}">${icon('plus')}Ajouter</button>`:''}
      <button class="btn btn-sm" data-act="export">${icon('download')}Excel</button>
      <button class="btn btn-sm" data-act="print">${icon('print')}Imprimer</button>
    </div>${barreFiltres}`;

  const html = `<div class="card" data-table="${id}">${toolbar}
      <div class="table-wrap"><table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
      ${pager}</div>`;

  dataTable.pending.push(()=>{
    const root = el(`[data-table="${id}"]`);
    if(!root) return;
    const rerender = opts.rerender || (()=>App.render());
    els('th.sortable', root).forEach(th=> th.onclick = ()=>{
      const k = th.dataset.sort;
      if(state.sort===k) state.dir *= -1; else { state.sort=k; state.dir=1; }
      rerender();
    });
    els('.pg', root).forEach(b=> b.onclick = ()=>{ state.page = +b.dataset.pg; rerender(); });
    els('[data-filter]', root).forEach(sel=> sel.onchange = ()=>{
      state.f[sel.dataset.filter] = sel.selectedIndex ? sel.value : '';
      state.page = 1; rerender();
    });
    els('[data-act="reset"]', root).forEach(b=> b.onclick = ()=>{
      state.f = {}; state.q=''; state.page=1; rerender(); toast('Filtres réinitialisés','Toutes les lignes sont de nouveau affichées.','info');
    });
    const q = el(`#q-${id}`, root);
    if(q) q.oninput = debounce(()=>{ state.q = q.value; state.page=1; rerender();
      const nq = el(`#q-${id}`); if(nq){ nq.focus(); nq.setSelectionRange(nq.value.length,nq.value.length); } }, 200);
    els('[data-act="export"]', root).forEach(b=> b.onclick = ()=> exportCSV(id, cols, list));
    els('[data-act="print"]', root).forEach(b=> b.onclick = ()=> window.print());
    els('tbody tr.clickable', root).forEach(tr=> tr.onclick = e=>{
      if(e.target.closest('.row-actions')) return;
      const row = rows[+tr.dataset.i];
      if(opts.onRow) opts.onRow(row); else if(opts.entity) CRUD.view(opts.entity, row);
    });
    /* Actions de ligne génériques */
    els('tbody .row-actions [data-do]', root).forEach(b=> b.onclick = e=>{
      e.stopPropagation();
      const row = rows[+b.closest('tr').dataset.i], a = b.dataset.do;
      if(opts.entity && a==='view')  return CRUD.view(opts.entity, row);
      if(opts.entity && a==='edit')  return CRUD.edit(opts.entity, row);
      if(opts.entity && (a==='del'||a==='trash')) return CRUD.del(opts.entity, row);
      if(opts.entity && a==='off')   return CRUD.desactiver(opts.entity, row);
      if(opts.rowAction) return opts.rowAction(a, row);
      if(a==='print') return window.print();
      toast('Action enregistrée', b.dataset.tip || 'Opération effectuée.', 'info');
    });
  });
  return html;
}

/* Export du tableau affiché à l'écran, quel que soit le module */
function exportEcran(){
  const tbl = el('#view .tbl');
  if(!tbl) return toast('Rien à exporter', "Cet écran ne contient pas de tableau exportable.", 'warn');
  const lignes = [];
  tbl.querySelectorAll('tr').forEach(tr=>{
    const cells = Array.from(tr.querySelectorAll('th,td'))
      .map(td=>'"'+td.innerText.replace(/\s+/g,' ').trim().replace(/"/g,'""')+'"');
    if(cells.length) lignes.push(cells.join(';'));
  });
  const url = URL.createObjectURL(new Blob(['\uFEFF'+lignes.join('\n')], {type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url; a.download = `olivera-${App.route}-${Store.dateFR().replace(/\//g,'-')}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
  toast('Export terminé', `${lignes.length-1} ligne(s) exportée(s) au format tableur.`);
}

/* Export CSV réel — ouvre le fichier dans un onglet de téléchargement */
function exportCSV(nom, cols, rows){
  const entetes = cols.filter(c=>c.t).map(c=>c.t);
  const lignes = rows.map(r=>cols.filter(c=>c.t).map(c=>{
    const v = r[c.k]; return '"'+String(v??'').replace(/"/g,'""')+'"';
  }).join(';'));
  const csv = '\uFEFF'+[entetes.join(';'), ...lignes].join('\n');
  const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url; a.download = `olivera-${nom}-${Store.dateFR().replace(/\//g,'-')}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
  toast('Export terminé', `${rows.length} ligne${rows.length>1?'s':''} exportée${rows.length>1?'s':''} au format tableur.`);
}

dataTable.state = {};
dataTable.pending = [];
function flushBindings(){ const q = dataTable.pending.splice(0); q.forEach(f=>{ try{ f(); }catch(e){ console.warn(e); } }); }

function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

/* ------------------------------ Fragments réutilisables ------------------ */
function statutBadge(s){
  const map = {
    "Payée":"ok","Conforme":"ok","Terminé":"ok","Livrée":"ok","Actif":"ok","Validée":"ok","Normal":"ok","Soldée":"ok","Clôturée":"ok","En service":"ok","Disponible":"ok","Permanent":"ok",
    "En attente":"warn","Partiellement payée":"warn","En production":"warn","En cours":"warn","Faible":"warn","En préparation":"warn","Planifié":"info","Planifiée":"info","En mission":"info","Saisonnier":"info","Facturée":"info","Demande":"neutral",
    "En retard":"danger","Non conforme":"danger","Critique":"danger","Bloqué":"danger","En panne":"danger","Annulé":"neutral","Brouillon":"neutral","Inactif":"neutral","Retard":"danger","En maintenance":"warn"
  };
  return `<span class="badge ${map[s]||'neutral'}">${s}</span>`;
}
function trend(v){
  if(v==null) return '';
  const c = v>0?'up':v<0?'down':'flat';
  const p = v>0?'<path d="M6 14l6-6 6 6"/>':'<path d="M6 10l6 6 6-6"/>';
  return `<span class="trend ${c}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>${v>0?'+':''}${fmt.n(Math.abs(v),1)} %</span>`;
}
function pageHead(titre, sous, actions){
  return `<div class="page-head"><div><h1 class="page-title">${titre}</h1>
    ${sous?`<div class="page-sub">${sous}</div>`:''}</div>
    <div class="row gap-sm">${actions||''}</div></div>`;
}
function card(titre, body, opts={}){
  return `<section class="card ${opts.cls||''}">
    ${titre?`<div class="card-head"><div><div class="card-title">${titre}</div>
      ${opts.sub?`<div class="card-sub">${opts.sub}</div>`:''}</div><div class="spacer"></div>${opts.tools||''}</div>`:''}
    <div class="card-body ${opts.flush?'flush':''}">${body}</div></section>`;
}
function rowActions(items){
  return `<div class="row-actions">${items.map(i=>`<button class="icon-btn tip" data-tip="${i.t}" data-do="${i.a}">${icon(i.i)}</button>`).join('')}</div>`;
}
