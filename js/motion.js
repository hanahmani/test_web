/* ==========================================================================
   OLIVERA ERP — Couche de mouvement
   Additive : n'altère aucune règle métier. Compteurs chiffrés et signal de
   transition de page. Respecte prefers-reduced-motion.
   ========================================================================== */
(function(){
  const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Animation de compteur sur les valeurs déjà rendues par les pages.
     Le texte final est conservé tel quel : on n'anime que l'affichage. */
  function compteur(node){
    const final = node.textContent;
    const m = final.match(/-?[\d\u00a0 ]+(?:[.,]\d+)?/);
    if(!m) return;
    const brut = m[0];
    const cible = parseFloat(brut.replace(/[\u00a0 ]/g,'').replace(',','.'));
    if(!isFinite(cible) || Math.abs(cible) < 10) return;

    const dec = (brut.split(/[.,]/)[1]||'').length;
    const sep = brut.includes('\u00a0') ? '\u00a0' : (brut.includes(' ') ? ' ' : '');
    const virgule = brut.includes(',');
    const format = v => {
      let s = Math.abs(v).toFixed(dec);
      let [e,d] = s.split('.');
      if(sep) e = e.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      s = d ? e + (virgule ? ',' : '.') + d : e;
      return (v < 0 ? '-' : '') + s;
    };

    const duree = 420, t0 = performance.now();
    node.dataset.counting = '1';
    function pas(t){
      const p = Math.min(1, (t - t0) / duree);
      const e = 1 - Math.pow(1 - p, 3);
      node.textContent = final.replace(brut, format(cible * e));
      if(p < 1) requestAnimationFrame(pas);
      else { node.textContent = final; delete node.dataset.counting; }
    }
    requestAnimationFrame(pas);
  }

  function apresRendu(){
    const view = document.getElementById('view');
    if(!view) return;
    /* Signal de transition : la règle CSS .page-in rejoue le fade-up */
    view.classList.remove('page-in');
    void view.offsetWidth;
    if(!calme) view.classList.add('page-in');
    if(calme) return;
    view.querySelectorAll('.kpi-value, .totaux-bar strong').forEach(compteur);
  }

  /* On enveloppe le routeur sans le modifier */
  function brancher(){
    if(!window.App || !App.render || App.__motion) return false;
    const natif = App.render.bind(App);
    App.render = function(){ natif(); apresRendu(); };
    App.__motion = true;
    apresRendu();
    return true;
  }
  if(!brancher()){
    const it = setInterval(()=>{ if(brancher()) clearInterval(it); }, 60);
    setTimeout(()=>clearInterval(it), 5000);
  }
})();
