/* ==========================================================================
   OLIVERA ERP — Formulaires et CRUD
   Un seul générateur de formulaire alimente tous les modules : chaque entité
   déclare ses champs, le reste (validation, modale, toast, rafraîchissement,
   journal d'audit) est mutualisé.
   ========================================================================== */

function champHTML(f, v){
  const val = v ?? f.def ?? '';
  const span = f.span ? 'span-2' : '';
  const ro = f.ro ? 'readonly' : '';
  let input;
  if(f.type==='select')
    input = `<select class="input select" data-f="${f.k}" ${ro}>${(typeof f.options==='function'?f.options():f.options)
      .map(o=>`<option ${String(o)===String(val)?'selected':''}>${o}</option>`).join('')}</select>`;
  else if(f.type==='textarea')
    input = `<textarea class="input" data-f="${f.k}" rows="${f.rows||2}" placeholder="${f.ph||''}">${val}</textarea>`;
  else if(f.type==='checkbox')
    input = `<label style="display:flex;align-items:center;gap:8px;font-size:13px">
      <input type="checkbox" data-f="${f.k}" ${val?'checked':''}> ${f.ph||'Oui'}</label>`;
  else
    input = `<input class="input" data-f="${f.k}" type="${f.type||'text'}" ${f.step?`step="${f.step}"`:''}
      value="${val}" placeholder="${f.ph||''}" ${ro}>`;
  return `<div class="field ${span}" data-field="${f.k}">
    <label>${f.l}${f.req?' <span style="color:var(--danger)">*</span>':''}</label>${input}
    ${f.hint?`<div class="hint">${f.hint}</div>`:''}</div>`;
}

function formModal({title, fields, values={}, onSave, size='', okLabel='Enregistrer', cols='g-2', intro=''}){
  modal({ size, title,
    body:`${intro?`<div class="note" style="margin-bottom:16px">${intro}</div>`:''}
      <div class="grid ${cols}">${fields.map(f=>champHTML(f, values[f.k])).join('')}</div>`,
    foot:`<button class="btn" data-close>Annuler</button>
          <button class="btn btn-primary" id="fm-ok">${icon('check')}${okLabel}</button>`,
    onOpen(ov){
      const first = el('.input', ov); if(first && !first.hasAttribute('readonly')) first.focus();
      el('#fm-ok', ov).onclick = ()=>{
        const data = {}; let erreur = null;
        fields.forEach(f=>{
          const node = ov.querySelector(`[data-f="${f.k}"]`);
          let v = f.type==='checkbox' ? node.checked : node.value.trim();
          if(f.type==='number') v = parseFloat(String(v).replace(',','.')) || 0;
          if(f.req && (v==='' || v===null)){ erreur = f.l; ov.querySelector(`[data-field="${f.k}"] .input`).style.borderColor='var(--danger)'; }
          data[f.k] = v;
        });
        if(erreur) return toast('Une erreur est survenue', `Le champ « ${erreur} » est obligatoire. Veuillez vérifier les informations.`, 'err');
        closeModal();
        onSave(data);
      };
    }
  });
}

/* ==========================================================================
   Déclaration des entités
   ========================================================================== */
const ENTITES = {
  clients: {
    coll:'clients', label:'client', titre:r=>r.nom, id:'code', route:'clients',
    fields:[
      {k:'code', l:'Code client', ro:true, def:()=>'CLI-'+String(++Store.seq.CLI).padStart(4,'0')},
      {k:'nom', l:'Nom ou raison sociale', req:true, ph:'Ex. Sté Oliva Distribution'},
      {k:'tel', l:'Téléphone', req:true, ph:'+216 …'},
      {k:'email', l:'E-mail', type:'email', ph:'contact@…'},
      {k:'ville', l:'Ville', type:'select', options:['Sousse','Msaken','Hammam Sousse','Kalâa Kebira','Monastir','Tunis','Sfax','Kairouan']},
      {k:'mf', l:'Matricule fiscal'},
      {k:'conditions', l:'Conditions de paiement', type:'select', options:['Comptant','15 jours','30 jours','60 jours']},
      {k:'limite', l:'Limite de crédit (TND)', type:'number', def:5000},
      {k:'statut', l:'Statut', type:'select', options:['Actif','Inactif']}
    ],
    defaut:()=>({ ca:0, encours:0, derniere:Store.dateFR(), creation:Store.dateFR() })
  },
  fournisseurs: {
    coll:'fournisseurs', label:'fournisseur', titre:r=>r.nom, id:'code', route:'fournisseurs',
    fields:[
      {k:'code', l:'Code fournisseur', ro:true, def:()=>'FRN-'+String(++Store.seq.FRN).padStart(3,'0')},
      {k:'nom', l:'Raison sociale', req:true},
      {k:'contact', l:'Contact principal'},
      {k:'tel', l:'Téléphone', req:true},
      {k:'ville', l:'Ville'},
      {k:'type', l:'Type', type:'select', options:['Emballages','Consommables','Services','Transport','Énergie']},
      {k:'conditions', l:'Conditions de paiement', type:'select', options:['Comptant','15 jours','30 jours','Échéancier']},
      {k:'statut', l:'Statut', type:'select', options:['Actif','Inactif']}
    ],
    defaut:()=>({ achats:0, encours:0 })
  },
  producteurs: {
    coll:'producteurs', label:'producteur', titre:r=>r.nom, id:'code', route:'producteurs',
    fields:[
      {k:'code', l:'Code producteur', ro:true, def:()=>'PRD-'+String(++Store.seq.PRD).padStart(3,'0')},
      {k:'nom', l:'Nom du producteur', req:true},
      {k:'tel', l:'Téléphone', req:true},
      {k:'zone', l:'Zone agricole', type:'select', options:['Sahline','Kalâa Kebira','Hammam Sousse','Msaken','Enfidha','Monastir']},
      {k:'parcelle', l:'Parcelle principale', ph:'Ex. P-118 Oliveraie Est'},
      {k:'varietes', l:'Variétés cultivées', type:'select', options:['Chemlali','Chetoui','Sahli','Zalmati','Oueslati']},
      {k:'statut', l:'Statut', type:'select', options:['Actif','Inactif']}
    ],
    defaut:d=>({ parcelles:[d.parcelle||'Parcelle 1'], apports:0, quantite:0, rdt:0, solde:0 })
  },
  produits: {
    coll:'produits', label:'produit', titre:r=>r.nom, id:'code', route:'produits-finis',
    fields:[
      {k:'code', l:'Code article', req:true, ph:'Ex. HEV-150'},
      {k:'nom', l:'Désignation', req:true, span:true},
      {k:'cat', l:'Catégorie', type:'select', options:['Bouteilles','Bidons','Vrac','Coffrets']},
      {k:'vol', l:'Contenance (L)', type:'number', step:'0.25', def:1},
      {k:'prix', l:'Prix de vente HT (TND)', type:'number', step:'0.001', req:true},
      {k:'unite', l:'Unité', type:'select', options:['bt','bd','L','cf','pc']},
      {k:'stock', l:'Stock initial', type:'number', def:0},
      {k:'min', l:'Stock minimum', type:'number', def:50}
    ],
    defaut:()=>({})
  },
  lots: {
    coll:'lots', label:'lot', titre:r=>r.num, id:'num', route:'lots',
    fields:[
      {k:'num', l:'Numéro de lot', ro:true, def:()=>Store.num('LOT')},
      {k:'type', l:'Type', type:'select', options:['Olives','Huile','Produit fini']},
      {k:'produit', l:'Produit', req:true},
      {k:'origine', l:'Origine ou parcelle'},
      {k:'producteur', l:'Producteur', type:'select', options:()=>DB.producteurs.map(p=>p.nom)},
      {k:'qte', l:'Quantité initiale', type:'number', req:true},
      {k:'unite', l:'Unité', type:'select', options:['kg','L','unités']},
      {k:'qualite', l:'Résultat qualité', type:'select', options:['En attente','Conforme','Non conforme']}
    ],
    defaut:d=>({ reste:d.qte, date:Store.dateFR() })
  },
  ordres: {
    coll:'ordres', label:'ordre de fabrication', titre:r=>r.num, id:'num', route:'ordres',
    fields:[
      {k:'num', l:'Numéro OF', ro:true, def:()=>Store.num('OF',4)},
      {k:'date', l:'Date de lancement', def:()=>Store.dateFR()},
      {k:'produit', l:'Produit à obtenir', type:'select', options:['Huile extra vierge en vrac','Huile vierge en vrac','Huile lampante']},
      {k:'lot', l:"Lot d'olives consommé", type:'select', req:true, options:()=>DB.lots.filter(l=>l.type==='Olives'&&l.qualite!=='Non conforme').map(l=>l.num)},
      {k:'prevu', l:'Quantité prévue (L)', type:'number', req:true},
      {k:'machine', l:'Machine', type:'select', options:['Ligne A — Pieralisi','Ligne B — Alfa Laval']},
      {k:'resp', l:'Responsable', type:'select', options:()=>DB.employes.map(e=>e.nom)},
      {k:'statut', l:'Statut', type:'select', options:['Brouillon','Planifié','En production','Terminé','Annulé']}
    ],
    defaut:()=>({ reel:null, rdt:null })
  },
  receptions: {
    coll:'receptions', label:'réception', titre:r=>r.num, id:'num', route:'receptions',
    fields:[
      {k:'num', l:'Numéro de réception', ro:true, def:()=>Store.num('REC')},
      {k:'date', l:'Date et heure', def:()=>Store.dateFR()+' '+Store.heureFR()},
      {k:'producteur', l:'Producteur', type:'select', req:true, options:()=>DB.producteurs.map(p=>p.nom)},
      {k:'parcelle', l:'Parcelle'},
      {k:'variete', l:'Variété', type:'select', options:['Chemlali','Chetoui','Sahli','Zalmati','Oueslati']},
      {k:'brut', l:'Poids brut (kg)', type:'number', req:true},
      {k:'tare', l:'Tare (kg)', type:'number', def:0},
      {k:'humidite', l:'Humidité (%)', type:'number', step:'0.1'},
      {k:'acidite', l:'Acidité (%)', type:'number', step:'0.01'},
      {k:'qualite', l:'Appréciation', type:'select', options:['Excellente','Bonne','Moyenne','Médiocre']}
    ],
    defaut:d=>({ net: Math.max(0, d.brut-d.tare), lot: Store.num('LOT'), statut:'Validée' })
  },
  livraisons: {
    coll:'livraisons', label:'bon de livraison', titre:r=>r.num, id:'num', route:'livraisons',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('BL')},
      {k:'client', l:'Client', type:'select', req:true, options:()=>DB.clients.map(c=>c.nom)},
      {k:'date', l:'Date de livraison', def:()=>Store.dateFR()},
      {k:'lots', l:'Lot livré', type:'select', options:()=>DB.lots.filter(l=>l.type==='Huile').map(l=>l.num)},
      {k:'colis', l:'Nombre de colis', type:'number', req:true},
      {k:'transporteur', l:'Transporteur ou véhicule', type:'select', options:()=>['Trans Olive', ...DB.transports.map(t=>'Véhicule '+t.matricule)]},
      {k:'statut', l:'Statut', type:'select', options:['En cours','Livrée','Annulée']}
    ],
    defaut:()=>({})
  },
  commandes: {
    coll:'commandes', label:'commande', titre:r=>r.num, id:'num', route:'commandes',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('CMD')},
      {k:'client', l:'Client', type:'select', req:true, options:()=>DB.clients.map(c=>c.nom)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'montant', l:'Montant TTC (TND)', type:'number', step:'0.001', req:true},
      {k:'livre', l:'Livraison', type:'select', options:['Non livrée','Partielle','Totale']},
      {k:'statut', l:'Statut', type:'select', options:['En préparation','Livrée','Facturée','Soldée','Annulée']}
    ],
    defaut:()=>({})
  },
  factures: {
    coll:'factures', label:'facture', titre:r=>r.num, id:'num', route:'factures',
    fields:[
      {k:'num', l:'Numéro de facture', ro:true, def:()=>Store.num('FAC')},
      {k:'client', l:'Client', type:'select', req:true, options:()=>DB.clients.map(c=>c.nom)},
      {k:'date', l:"Date d'émission", def:()=>Store.dateFR()},
      {k:'echeance', l:'Échéance', def:()=>'05/10/2026'},
      {k:'ht', l:'Montant HT (TND)', type:'number', step:'0.001', req:true},
      {k:'conditions', l:'Conditions', type:'select', options:['Comptant','15 jours','30 jours','60 jours']}
    ],
    defaut:d=>({ tva:d.ht*0.19, ttc:d.ht*1.19, paye:0, tranches:[] })
  },
  depenses: {
    coll:'depenses', label:'dépense', titre:r=>r.cat, id:'date', route:'depenses',
    fields:[
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'cat', l:'Catégorie', type:'select', req:true, options:['Électricité','Eau','Carburant','Transport','Maintenance','Salaires','Emballages','Fournitures','Services','Autres dépenses']},
      {k:'montant', l:'Montant (TND)', type:'number', step:'0.001', req:true},
      {k:'tiers', l:'Tiers concerné'},
      {k:'mode', l:'Mode de paiement', type:'select', options:()=>DB.modesPaiement},
      {k:'just', l:'Justificatif joint', type:'checkbox', ph:'Pièce jointe scannée'}
    ],
    defaut:()=>({}),
    apres(d){ DB.tresorerie[d.mode==='Espèces'?'caisse':'banque'] -= d.montant; DB.tresorerie.depenses += d.montant; }
  },
  utilisateurs: {
    coll:'utilisateurs', label:'utilisateur', titre:r=>r.nom, id:'login', route:'utilisateurs',
    fields:[
      {k:'nom', l:'Nom et prénom', req:true},
      {k:'login', l:'Login', req:true, hint:'Doit être unique dans le système'},
      {k:'email', l:'E-mail professionnel', type:'email', req:true},
      {k:'tel', l:'Téléphone'},
      {k:'role', l:'Rôle', type:'select', options:['Administrateur','Direction','Responsable achats','Responsable stock','Magasinier','Responsable production','Opérateur','Responsable qualité','Responsable commercial','Comptable','Responsable maintenance']},
      {k:'site', l:'Site de rattachement', type:'select', options:['Sousse','Kalâa Kebira']},
      {k:'statut', l:'Statut', type:'select', options:['Actif','Inactif']}
    ],
    defaut:()=>({ derniere:'—' })
  },
  employes: {
    coll:'employes', label:'employé', titre:r=>r.nom, id:'mat', route:'rh',
    fields:[
      {k:'mat', l:'Matricule', ro:true, def:()=>'EMP-'+String(Math.floor(Math.random()*900)+100)},
      {k:'nom', l:'Nom et prénom', req:true},
      {k:'poste', l:'Poste', req:true},
      {k:'dept', l:'Département', type:'select', options:['Production','Qualité','Logistique','Technique','Commercial','Administration']},
      {k:'embauche', l:"Date d'embauche", def:()=>Store.dateFR()},
      {k:'statut', l:'Statut', type:'select', options:['Permanent','Saisonnier','Inactif']}
    ],
    defaut:()=>({})
  },
  equipements: {
    coll:'equipements', label:'équipement', titre:r=>r.nom, id:'code', route:'equipements',
    fields:[
      {k:'code', l:'Code équipement', req:true, ph:'Ex. POM-03'},
      {k:'nom', l:'Désignation', req:true},
      {k:'marque', l:'Marque'},
      {k:'loc', l:'Localisation', type:'select', options:['Ligne A','Ligne B','Atelier','Magasin huile']},
      {k:'maint', l:'Prochaine maintenance', def:()=>'30/09/2026'},
      {k:'etat', l:'État', type:'select', options:['En service','À l\'arrêt','En panne','Réformé']}
    ],
    defaut:()=>({})
  },
  maintenances: {
    coll:'maintenances', label:'intervention', titre:r=>r.num, id:'num', route:'maintenance',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('INT',4)},
      {k:'equip', l:'Équipement', type:'select', req:true, options:()=>DB.equipements.map(e=>e.code+' — '+e.nom)},
      {k:'type', l:'Type', type:'select', options:['Préventive','Corrective']},
      {k:'date', l:'Date prévue', def:()=>Store.dateFR()},
      {k:'tech', l:'Technicien', type:'select', options:()=>[...DB.employes.map(e=>e.nom),'Méca Industrie']},
      {k:'cout', l:'Coût estimé (TND)', type:'number', step:'0.001', def:0},
      {k:'statut', l:'Statut', type:'select', options:['Planifiée','En cours','Clôturée']}
    ],
    defaut:()=>({})
  },
  transports: {
    coll:'transports', label:'véhicule', titre:r=>r.matricule, id:'matricule', route:'transport',
    fields:[
      {k:'matricule', l:'Matricule', req:true, ph:'Ex. 210 TU 4408'},
      {k:'type', l:'Type', type:'select', options:['Camion 3,5 T','Camionnette','Tracteur + benne','Utilitaire']},
      {k:'capacite', l:'Capacité'},
      {k:'km', l:'Kilométrage', type:'number', def:0},
      {k:'chauffeur', l:'Chauffeur'},
      {k:'etat', l:'État', type:'select', options:['Disponible','En mission','En maintenance']}
    ],
    defaut:()=>({})
  },
  magasins: {
    coll:'magasins', label:'magasin', titre:r=>r.nom, id:'code', route:'magasins',
    fields:[
      {k:'code', l:'Code', req:true, ph:'Ex. MAG-06'},
      {k:'nom', l:'Désignation', req:true},
      {k:'resp', l:'Responsable', type:'select', options:()=>DB.employes.map(e=>e.nom)},
      {k:'articles', l:'Références', type:'number', def:0},
      {k:'valeur', l:'Valeur du stock (TND)', type:'number', def:0}
    ],
    defaut:()=>({})
  },
  qualite: {
    coll:'qualite', label:'analyse', titre:r=>r.lot, id:'lot', route:'qualite',
    fields:[
      {k:'lot', l:'Lot analysé', type:'select', req:true, options:()=>DB.lots.map(l=>l.num)},
      {k:'produit', l:'Produit', req:true},
      {k:'acidite', l:'Acidité (%)', type:'number', step:'0.01'},
      {k:'peroxyde', l:'Indice de peroxyde (meq)', type:'number', step:'0.1'},
      {k:'humidite', l:'Humidité (%)', type:'number', step:'0.01'},
      {k:'impuretes', l:'Impuretés (%)', type:'number', step:'0.01'},
      {k:'date', l:'Date d\'analyse', def:()=>Store.dateFR()},
      {k:'analyste', l:'Analyste', type:'select', options:()=>DB.employes.map(e=>e.nom)}
    ],
    defaut:d=>({ res: d.acidite>0.8 ? 'Non conforme' : 'Conforme' }),
    apres(d){
      const lot = DB.lots.find(l=>l.num===d.lot);
      if(lot){ lot.qualite = d.res; if(d.res==='Non conforme'){
        const st = DB.stocks.find(s=>s.lot===d.lot); if(st) st.statut='Bloqué';
        Store.notifier('Lot non conforme', `${d.lot} bloqué en stock — acidité ${fmt.n(d.acidite,2)} %`, 'danger'); } }
    }
  },
  achats: {
    coll:'achats', label:'document d\'achat', titre:r=>r.num, id:'num', route:'achats',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('BC',5)},
      {k:'fournisseur', l:'Fournisseur', type:'select', req:true, options:()=>DB.fournisseurs.map(f=>f.nom)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'montant', l:'Montant TTC (TND)', type:'number', step:'0.001', req:true},
      {k:'recu', l:'Réception', type:'select', options:['—','Partielle','Totale']},
      {k:'statut', l:'Statut', type:'select', options:['Demande','En cours','Facturée','Payée','Annulée']}
    ],
    defaut:()=>({})
  }
};

/* ==========================================================================
   Contrôleur CRUD
   ========================================================================== */
const CRUD = {
  fields(e, mode){
    return ENTITES[e].fields.map(f=>({...f, ro: f.ro && mode==='add' ? true : (mode==='view' ? true : f.ro),
      def: typeof f.def==='function' ? f.def() : f.def }));
  },

  add(e){
    const E = ENTITES[e];
    formModal({ title:`Nouveau ${E.label}`, fields:this.fields(e,'add'),
      okLabel:`Créer le ${E.label}`,
      onSave: d=>{
        const obj = Object.assign({}, d, typeof E.defaut==='function' ? E.defaut(d) : {});
        Store.add(E.coll, obj);
        if(E.apres) E.apres(obj);
        toast(`${E.label.charAt(0).toUpperCase()+E.label.slice(1)} ajouté avec succès`,
              `${E.titre(obj)} a été enregistré et les totaux ont été recalculés.`);
        App.render();
      }});
  },

  edit(e, row){
    const E = ENTITES[e];
    formModal({ title:`Modifier — ${E.titre(row)}`, fields:this.fields(e,'edit'), values:row,
      onSave: d=>{
        Store.update(E.coll, row, d);
        if(E.apres) E.apres(row);
        toast('Modification enregistrée', `${E.titre(row)} a été mis à jour.`);
        App.render();
      }});
  },

  view(e, row){
    const E = ENTITES[e];
    const lignes = E.fields.map(f=>{
      let v = row[f.k];
      if(v===undefined || v===null || v==='') v = '—';
      if(f.type==='checkbox') v = v ? 'Oui' : 'Non';
      return `<dt>${f.l}</dt><dd>${v}</dd>`;
    }).join('');
    modal({ title:E.titre(row),
      body:`<dl class="kv">${lignes}</dl>`,
      foot:`<button class="btn" data-close>Fermer</button>
            <button class="btn btn-primary" id="v-edit">${icon('edit')}Modifier</button>`,
      onOpen: ov=> el('#v-edit',ov).onclick = ()=>{ closeModal(); CRUD.edit(e,row); }
    });
  },

  del(e, row){
    const E = ENTITES[e];
    confirmer(`Supprimer ce ${E.label} ?`,
      `<strong>${E.titre(row)}</strong> sera retiré de la liste. Les documents déjà rattachés à cet enregistrement resteraient conservés dans un système en production.`,
      ()=>{ Store.remove(E.coll, row);
            toast(`${E.label.charAt(0).toUpperCase()+E.label.slice(1)} supprimé avec succès`, '');
            App.render(); }, 'Supprimer');
  },

  desactiver(e, row){
    const E = ENTITES[e];
    confirmer('Désactiver cet enregistrement ?',
      `<strong>${E.titre(row)}</strong> ne sera plus proposé dans les listes déroulantes, mais son historique est conservé.`,
      ()=>{ row.statut = 'Inactif'; Store.log('Désactivation', E.titre(row), 'Actif', 'Inactif');
            toast('Enregistrement désactivé', `${E.titre(row)} est désormais inactif.`); App.render(); }, 'Désactiver');
  }
};

/* ==========================================================================
   Entités des modules ajoutés
   ========================================================================== */
Object.assign(ENTITES, {
  presences: {
    coll:'presences', label:'pointage', titre:r=>r.nom+' — '+r.date, id:'mat', route:'presence',
    fields:[
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'nom', l:'Employé', type:'select', req:true, options:()=>DB.employes.map(e=>e.nom)},
      {k:'arrivee', l:'Heure d\'arrivée', def:'07:00'},
      {k:'depart', l:'Heure de départ', def:'17:00'},
      {k:'statut', l:'Statut', type:'select', options:['Présent','Absent','Congé','Repos']}
    ],
    defaut:d=>{
      const e = DB.employes.find(x=>x.nom===d.nom) || {};
      const h = (t)=>{ const [a,b]=String(t).split(':').map(Number); return (a||0)+(b||0)/60; };
      const heures = d.statut==='Présent' ? Math.max(0, +(h(d.depart)-h(d.arrivee)).toFixed(1)) : 0;
      return { mat:e.mat||'—', poste:e.poste||'—', heures, hs: Math.max(0, +(heures-8).toFixed(1)) };
    }
  },
  avances: {
    coll:'avances', label:'avance', titre:r=>r.num, id:'num', route:'avances',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('AVP',4)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'nom', l:'Employé', type:'select', req:true, options:()=>DB.employes.map(e=>e.nom)},
      {k:'montant', l:'Montant (TND)', type:'number', step:'0.001', req:true},
      {k:'mode', l:'Mode de paiement', type:'select', options:()=>DB.modesPaiement},
      {k:'motif', l:'Motif', span:true},
      {k:'statut', l:'Statut', type:'select', options:['Brouillon','Validé','Retenu']}
    ],
    defaut:d=>({ mat:(DB.employes.find(e=>e.nom===d.nom)||{}).mat || '—' }),
    apres(d){ if(d.statut==='Validé')
      Store.operation({type:'Avance personnel', tiers:d.nom, montant:-d.montant, mode:d.mode, motif:'Avance '+d.num}); }
  },
  reglementsPersonnel: {
    coll:'reglementsPersonnel', label:'règlement de salaire', titre:r=>r.num, id:'num', route:'reglements-personnel',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('RGP',4)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'nom', l:'Employé', type:'select', req:true, options:()=>DB.employes.map(e=>e.nom)},
      {k:'periode', l:'Période', def:'Septembre 2026'},
      {k:'brut', l:'Salaire brut (TND)', type:'number', step:'0.001', req:true},
      {k:'mode', l:'Mode de paiement', type:'select', options:()=>DB.modesPaiement},
      {k:'statut', l:'Statut', type:'select', options:['En attente','Payé']}
    ],
    defaut:d=>{
      const e = DB.employes.find(x=>x.nom===d.nom) || {};
      const av = DB.avances.filter(a=>a.nom===d.nom && a.statut==='Validé').reduce((s,a)=>s+a.montant,0);
      return { mat:e.mat||'—', avances:av, net:Math.max(0, d.brut-av) };
    },
    apres(d){ if(d.statut==='Payé')
      Store.operation({type:'Règlement personnel', tiers:d.nom, montant:-d.net, mode:d.mode, motif:'Salaire '+d.periode}); }
  },
  transporteurs: {
    coll:'transporteurs', label:'transporteur', titre:r=>r.nom, id:'code', route:'transporteurs',
    fields:[
      {k:'code', l:'Code', ro:true, def:()=>'TRP-'+String(DB.transporteurs.length+1).padStart(2,'0')},
      {k:'nom', l:'Raison sociale', req:true},
      {k:'contact', l:'Contact'},
      {k:'tel', l:'Téléphone', req:true},
      {k:'vehicule', l:'Véhicule principal'},
      {k:'tarif', l:'Tarif (TND/kg transporté)', type:'number', step:'0.001', def:0.150},
      {k:'statut', l:'Statut', type:'select', options:['Actif','Inactif']}
    ],
    defaut:()=>({ solde:0 })
  },
  societes: {
    coll:'societes', label:'société', titre:r=>r.nom, id:'code', route:'societes',
    fields:[
      {k:'code', l:'Code', req:true, ph:'SOC-03'}, {k:'nom', l:'Raison sociale', req:true},
      {k:'mf', l:'Matricule fiscal'}, {k:'ville', l:'Ville'}, {k:'tel', l:'Téléphone'},
      {k:'statut', l:'Statut', type:'select', options:['Active','Inactive']}
    ], defaut:()=>({})
  },
  exercices: {
    coll:'exercices', label:'exercice', titre:r=>r.libelle, id:'code', route:'exercices',
    fields:[
      {k:'code', l:'Code', req:true, ph:'EX-2027'}, {k:'libelle', l:'Libellé', req:true},
      {k:'debut', l:'Date de début', def:'01/01/2027'}, {k:'fin', l:'Date de fin', def:'31/12/2027'},
      {k:'statut', l:'Statut', type:'select', options:['Ouvert','Clôturé']}
    ], defaut:()=>({})
  },
  saisons: {
    coll:'saisons', label:'saison', titre:r=>r.libelle, id:'code', route:'saisons',
    fields:[
      {k:'code', l:'Code', req:true, ph:'S-2026/27'}, {k:'libelle', l:'Libellé', req:true},
      {k:'debut', l:'Date de début', def:'01/10/2026'}, {k:'fin', l:'Date de fin', def:'30/09/2027'},
      {k:'statut', l:'Statut', type:'select', options:['Ouverte','Clôturée']}
    ], defaut:()=>({ olives:0, huile:0, rdt:0 })
  },
  unites: {
    coll:'unites', label:'unité', titre:r=>r.libelle, id:'code', route:'unites',
    fields:[
      {k:'code', l:'Code', req:true}, {k:'libelle', l:'Libellé', req:true},
      {k:'type', l:'Type', type:'select', options:['Poids','Volume','Conditionnement','Logistique']},
      {k:'base', l:'Unité de base', type:'select', options:['KG','L','U']},
      {k:'facteur', l:'Facteur de conversion', type:'number', step:'0.001', def:1}
    ], defaut:()=>({})
  },
  modesReglement: {
    coll:'modesReglement', label:'mode de règlement', titre:r=>r.libelle, id:'code', route:'modes-paiement',
    fields:[
      {k:'code', l:'Code', req:true}, {k:'libelle', l:'Libellé', req:true},
      {k:'journal', l:'Journal associé', type:'select', options:['Caisse espèces','Portefeuille chèques','Banque','Portefeuille effets','Divers']},
      {k:'delai', l:'Délai d\'encaissement (jours)', type:'number', def:0},
      {k:'actif', l:'Actif', type:'checkbox', ph:'Proposé dans les écrans de paiement'}
    ], defaut:()=>({})
  },
  piles: {
    coll:'piles', label:'pile à huile', titre:r=>r.num, id:'num', route:'piles',
    fields:[
      {k:'num', l:'Numéro de pile', req:true, ph:'PILE-07'},
      {k:'capacite', l:'Capacité (L)', type:'number', req:true, def:10000},
      {k:'type', l:'Type d\'huile', type:'select', options:['Extra vierge','Vierge','Lampante','Grignon']},
      {k:'qte', l:'Quantité actuelle (L)', type:'number', def:0},
      {k:'lot', l:'Lot', type:'select', options:()=>['—', ...DB.lots.filter(l=>l.type==='Huile').map(l=>l.num)]},
      {k:'origine', l:'Fournisseur ou origine'},
      {k:'entree', l:'Date d\'entrée', def:()=>Store.dateFR()},
      {k:'saison', l:'Saison', type:'select', options:()=>DB.saisons.map(s=>s.libelle)},
      {k:'etat', l:'État', type:'select', options:['En service','Vide','En nettoyage','Hors service']}
    ], defaut:()=>({})
  },
  terrasses: {
    coll:'terrasses', label:'terrasse', titre:r=>r.num, id:'num', route:'terrasses',
    fields:[
      {k:'num', l:'Numéro', req:true, ph:'TER-E'},
      {k:'surface', l:'Surface (m²)', type:'number', def:300},
      {k:'capacite', l:'Capacité (kg)', type:'number', def:120000},
      {k:'produit', l:'Produit stocké'},
      {k:'qte', l:'Quantité (kg)', type:'number', def:0},
      {k:'fournisseur', l:'Fournisseur', type:'select', options:()=>['—', ...DB.producteurs.map(p=>p.nom)]},
      {k:'entree', l:'Date d\'entrée', def:()=>Store.dateFR()},
      {k:'etat', l:'État', type:'select', options:['Libre','Occupée','En nettoyage']}
    ], defaut:()=>({})
  },
  bonsEntreeHuile: {
    coll:'bonsEntreeHuile', label:'bon d\'entrée d\'huile', titre:r=>r.num, id:'num', route:'bons-entree-huile',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('BEH',4)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'fournisseur', l:'Fournisseur ou origine', type:'select', req:true, options:()=>[...DB.producteurs.map(p=>p.nom), ...DB.fournisseurs.map(f=>f.nom), 'Production interne']},
      {k:'type', l:'Type d\'huile', type:'select', options:['Extra vierge','Vierge','Lampante']},
      {k:'qte', l:'Quantité (L)', type:'number', step:'0.1', req:true},
      {k:'pile', l:'Pile de destination', type:'select', req:true, options:()=>DB.piles.map(p=>p.num)},
      {k:'lot', l:'Lot', type:'select', options:()=>DB.lots.filter(l=>l.type==='Huile').map(l=>l.num)},
      {k:'acidite', l:'Acidité (%)', type:'number', step:'0.01'},
      {k:'origine', l:'Origine', span:true},
      {k:'statut', l:'Statut', type:'select', options:Store.etapes.concat('Annulé')}
    ],
    defaut:()=>({}),
    apres(d){
      if(d.statut==='Validé' || d.statut==='Clôturé'){
        const pile = DB.piles.find(p=>p.num===d.pile);
        if(pile){ pile.qte += d.qte; pile.lot = d.lot || pile.lot; pile.type = d.type;
                  pile.origine = d.fournisseur; pile.entree = d.date; pile.etat='En service'; }
        Store.mouvement('Entrée', 'Huile extra vierge en vrac', d.qte, d.lot, 'Magasin huile', 'Bon d\'entrée '+d.num);
      }
    }
  },
  organoleptique: {
    coll:'organoleptique', label:'contrôle organoleptique', titre:r=>r.num, id:'num', route:'organoleptique',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('ORG',4)},
      {k:'lot', l:'Lot', type:'select', req:true, options:()=>DB.lots.map(l=>l.num)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'fournisseur', l:'Fournisseur', type:'select', options:()=>[...DB.producteurs.map(p=>p.nom), ...DB.fournisseurs.map(f=>f.nom)]},
      {k:'type', l:'Type d\'huile', type:'select', options:['Extra vierge','Vierge','Lampante']},
      {k:'acidite', l:'Acidité (%)', type:'number', step:'0.01'},
      {k:'fruite', l:'Fruité', type:'select', options:['Fruité vert intense','Fruité vert moyen','Fruité mûr léger','Absent']},
      {k:'amer', l:'Amer', type:'select', options:['Marqué','Moyen','Léger','Absent']},
      {k:'piquant', l:'Piquant', type:'select', options:['Marqué','Moyen','Léger','Absent']},
      {k:'defaut', l:'Défaut perçu', type:'select', options:['Aucun','Léger chômé','Moisi-humide','Vineux','Rance']},
      {k:'obs', l:'Observation', type:'textarea', span:true},
      {k:'res', l:'Résultat', type:'select', options:['Validé','Non validé','En attente']}
    ],
    defaut:()=>({}),
    apres(d){
      const lot = DB.lots.find(l=>l.num===d.lot);
      if(lot && d.res!=='En attente'){
        lot.qualite = d.res==='Validé' ? 'Conforme' : 'Non conforme';
        if(d.res==='Non validé'){
          const st = DB.stocks.find(s=>s.lot===d.lot); if(st) st.statut='Bloqué';
          Store.notifier('Lot non validé', `${d.lot} bloqué — défaut « ${d.defaut} »`, 'danger');
        }
      }
    }
  },
  facturesFournisseurs: {
    coll:'facturesFournisseurs', label:'facture fournisseur', titre:r=>r.num, id:'num', route:'factures-fournisseurs',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('FF',5)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'fournisseur', l:'Fournisseur', type:'select', req:true, options:()=>DB.fournisseurs.map(f=>f.nom).concat('Huilerie El Fejja')},
      {k:'ht', l:'Montant HT (TND)', type:'number', step:'0.001', req:true},
      {k:'echeance', l:'Échéance', def:'05/10/2026'},
      {k:'statut', l:'Statut', type:'select', options:['En attente','Partiellement payée','Payée','Annulée']}
    ],
    defaut:d=>({ tva:d.ht*0.19, ttc:d.ht*1.19, paye:0 })
  },
  accomptesFournisseurs: {
    coll:'accomptesFournisseurs', label:'accompte fournisseur', titre:r=>r.num, id:'num', route:'accomptes-fournisseurs',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('ACF',4)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'fournisseur', l:'Fournisseur', type:'select', req:true, options:()=>DB.fournisseurs.map(f=>f.nom).concat('Huilerie El Fejja','Coopérative Sahline')},
      {k:'montant', l:'Montant (TND)', type:'number', step:'0.001', req:true},
      {k:'mode', l:'Mode de paiement', type:'select', options:()=>DB.modesPaiement},
      {k:'ref', l:'Référence'},
      {k:'affecte', l:'Affecté à', type:'select', options:()=>['—', ...DB.facturesFournisseurs.map(f=>f.num)]},
      {k:'statut', l:'Statut', type:'select', options:['Non affecté','Affecté']}
    ],
    defaut:()=>({}),
    apres(d){
      Store.operation({type:'Accompte fournisseur', tiers:d.fournisseur, montant:-d.montant, mode:d.mode, motif:'Accompte '+d.num});
      const ff = DB.facturesFournisseurs.find(f=>f.num===d.affecte);
      if(ff){ ff.paye = Math.min(ff.ttc, ff.paye + d.montant);
              ff.statut = ff.paye>=ff.ttc ? 'Payée' : 'Partiellement payée'; }
    }
  },
  ventes: {
    coll:'ventes', label:'vente', titre:r=>r.num, id:'num', route:'ventes',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('VTE',5)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'client', l:'Client', type:'select', req:true, options:()=>DB.clients.map(c=>c.nom)},
      {k:'type', l:'Type de vente', type:'select', options:['Comptant','Crédit']},
      {k:'produit', l:'Produit', type:'select', req:true, options:()=>DB.produits.map(p=>p.nom).concat('Huile en vrac extra vierge')},
      {k:'qte', l:'Quantité', type:'number', req:true},
      {k:'unite', l:'Unité', type:'select', options:['bt','bd','L','kg','cf']},
      {k:'ttc', l:'Montant TTC (TND)', type:'number', step:'0.001', req:true},
      {k:'statut', l:'Statut', type:'select', options:Store.etapes.concat('Annulé')}
    ],
    defaut:d=>({ paye: d.type==='Comptant' ? d.ttc : 0, bl:'—', facture:'—' }),
    apres(d){
      if(d.statut==='Validé' || d.statut==='Clôturé'){
        Store.mouvement('Sortie', d.produit, d.qte, '—', 'Produits finis', 'Vente '+d.num);
        const cli = DB.clients.find(c=>c.nom===d.client);
        if(cli){ cli.ca += d.ttc; cli.derniere = d.date; if(d.type==='Crédit') cli.encours += d.ttc; }
        if(d.type==='Comptant') Store.operation({type:'Vente comptant', tiers:d.client, montant:d.ttc, mode:'Espèces', motif:'Vente '+d.num});
      }
    }
  },
  operations: {
    coll:'operations', label:'opération financière', titre:r=>r.num, id:'num', route:'historique-reglements',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('OP',5)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'type', l:'Type d\'opération', type:'select', req:true, options:['Alimentation de caisse','Dépense','Encaissement client','Règlement fournisseur','Accompte fournisseur','Avance personnel','Règlement personnel','Vente comptoir','Retrait bancaire','Autre']},
      {k:'tiers', l:'Tiers', req:true},
      {k:'montant', l:'Montant (TND, négatif pour une sortie)', type:'number', step:'0.001', req:true, span:true},
      {k:'mode', l:'Mode de paiement', type:'select', options:()=>DB.modesPaiement},
      {k:'motif', l:'Motif', span:true},
      {k:'obs', l:'Observation', type:'textarea', span:true},
      {k:'statut', l:'Statut', type:'select', options:['Brouillon','Validé','Annulé']}
    ],
    defaut:d=>({ journal: d.mode==='Espèces' ? 'Caisse espèces' : d.mode==='Chèque' ? 'Portefeuille chèques' : 'Banque', user:DB.user.nom }),
    apres(d){
      if(d.statut==='Validé'){
        if(d.journal==='Caisse espèces') DB.tresorerie.caisse += d.montant;
        if(d.journal==='Banque')         DB.tresorerie.banque += d.montant;
      }
    }
  }
});

/* ==========================================================================
   Entités du modèle réception / production / huile
   ========================================================================== */
ENTITES.employes = {
  coll:'employes', label:'employé', titre:r=>r.nom, id:'mat', route:'personnel',
  fields:[
    {k:'mat', l:'Matricule', ro:true, def:()=>'EMP-'+String(Math.floor(Math.random()*900)+100)},
    {k:'nom', l:'Nom & Prénom / الاسم و اللقب', req:true, span:true},
    {k:'prenom', l:'Prénom usuel / اللقب'},
    {k:'tel1', l:'Téléphone 1 / الهاتف', req:true},
    {k:'tel2', l:'Téléphone 2 / الهاتف'},
    {k:'email', l:'Email / البريد الإلكتروني', type:'email'},
    {k:'typeRem', l:'Type / النوع', type:'select', options:['Jour','Heure'],
      hint:"Détermine le mode de calcul de la fiche de présence"},
    {k:'prix', l:'Prix H/J / السعر', type:'number', step:'0.001', req:true,
      hint:"Prix par jour ou par heure selon le type"},
    {k:'poste', l:'Poste'},
    {k:'dept', l:'Département', type:'select', options:['Production','Qualité','Logistique','Technique','Commercial','Administration']},
    {k:'embauche', l:"Date d'embauche", def:()=>Store.dateFR()},
    {k:'statut', l:'Statut', type:'select', options:['Permanent','Saisonnier','Inactif']}
  ],
  defaut:()=>({})
};

ENTITES.presences = {
  coll:'presences', label:'pointage', titre:r=>r.nom+' — '+r.date, id:'mat', route:'presence',
  fields:[
    {k:'date', l:'Date', def:()=>Store.dateFR()},
    {k:'nom', l:'Personnel', type:'select', req:true, options:()=>DB.employes.map(e=>e.nom)},
    {k:'arrivee', l:"Heure d'entrée", def:'07:00'},
    {k:'depart', l:'Heure de sortie', def:'17:00'},
    {k:'jours', l:'Nombre de jours', type:'number', def:1, hint:"Utilisé pour les employés payés au jour"},
    {k:'statut', l:'État de présence', type:'select', options:['Présent','Absent','Congé','Repos']}
  ],
  defaut:d=>{
    const e = DB.employes.find(x=>x.nom===d.nom) || {};
    const h = t=>{ const [a,b] = String(t).split(':').map(Number); return (a||0)+(b||0)/60; };
    const heures = d.statut==='Présent' ? Math.max(0, +(h(d.depart)-h(d.arrivee)).toFixed(1)) : 0;
    const jours = d.statut==='Présent' ? (d.jours||1) : 0;
    const typeRem = e.typeRem || 'Jour', prix = e.prix || 0;
    return { mat:e.mat||'—', poste:e.poste||'—', heures, jours, hs:Math.max(0,+(heures-8).toFixed(1)),
             typeRem, prix, total: typeRem==='Heure' ? +(heures*prix).toFixed(3) : +(jours*prix).toFixed(3) };
  }
};

Object.assign(ENTITES, {
  organoleptiques: {
    coll:'organoleptiques', label:'qualité organoleptique', titre:r=>r.libelle, id:'code', route:'organoleptiques',
    fields:[
      {k:'code', l:'Code', req:true, ph:'EXV'},
      {k:'libelle', l:'Désignation', req:true, ph:'EXTRA VIERGE'},
      {k:'acidMax', l:'Acidité maximale (%)', type:'number', step:'0.01', def:0.8},
      {k:'ordre', l:'Ordre d\'affichage', type:'number', def:5},
      {k:'actif', l:'Actif', type:'checkbox', ph:'Proposé dans le bon d\'entrée huile'}
    ], defaut:()=>({})
  },
  depots: {
    coll:'depots', label:'dépôt', titre:r=>r.designation, id:'code', route:'depots',
    fields:[
      {k:'code', l:'Code', req:true, ph:'TER-E'},
      {k:'designation', l:'Désignation', req:true},
      {k:'type', l:'Type', type:'select', options:['Caisse','Dépôt','Autre']},
      {k:'capacite', l:'Capacité (kg)', type:'number', def:100000},
      {k:'qte', l:'Quantité stockée (kg)', type:'number', def:0},
      {k:'etat', l:'État', type:'select', options:['Libre','Occupée','En nettoyage']}
    ], defaut:()=>({})
  },
  pilesHuile: {
    coll:'pilesHuile', label:'pile', titre:r=>r.num+' — '+r.designation, id:'num', route:'piles',
    fields:[
      {k:'num', l:'Numéro', req:true, ph:'P07'},
      {k:'designation', l:'Désignation', req:true, ph:'Pile 7 — inox 10 T'},
      {k:'qteMax', l:'Quantité maximale (kg)', type:'number', req:true, def:10000},
      {k:'qte', l:'Quantité actuelle (kg)', type:'number', def:0, ro:true,
        hint:"Le stock n'évolue que par les bons d'entrée et de sortie d'huile"},
      {k:'prixTotal', l:'Valeur du stock (TND)', type:'number', step:'0.001', def:0, ro:true},
      {k:'saison', l:'Saison', type:'select', options:()=>DB.saisons.map(s=>s.libelle)},
      {k:'etat', l:'État', type:'select', options:['En service','Vide','En nettoyage','Hors service']}
    ], defaut:()=>({})
  },
  articles: {
    coll:'articles', label:'article', titre:r=>r.designation, id:'code', route:'articles',
    fields:[
      {k:'code', l:'Code', req:true, ph:'ART-007'},
      {k:'designation', l:'Désignation', req:true},
      {k:'prix', l:'Prix de vente', type:'number', step:'0.001', req:true},
      {k:'unite', l:'Unité', type:'select', options:()=>DB.unites.map(u=>u.libelle.slice(0,20))},
      {k:'type', l:'Type', type:'select', options:['Huile','Sous-produit','Service','Emballage']}
    ], defaut:()=>({})
  },
  grignons: {
    coll:'grignons', label:'bon de grignons', titre:r=>r.num, id:'num', route:'grignons',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('GRG',4)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'client', l:'Client', type:'select', req:true, options:()=>DB.clients.map(c=>c.nom)},
      {k:'transporteur', l:'Transporteur', type:'select', options:()=>DB.transporteurs.map(t=>t.nom)},
      {k:'matricule', l:'Matricule véhicule', type:'select', options:()=>[...new Set(DB.transporteurs.flatMap(t=>t.matricules||[]))]},
      {k:'bl', l:'Bon de livraison', def:'BL-G-00122'},
      {k:'qte', l:'Quantité (kg)', type:'number', req:true},
      {k:'pu', l:'Prix unitaire', type:'number', step:'0.001', req:true, def:0.080},
      {k:'remarque', l:'Remarque', span:true},
      {k:'etat', l:'État', type:'select', options:['Livré','En attente','Annulé']}
    ],
    defaut:d=>({ total:+(d.qte*d.pu).toFixed(3), saison:'Saison 2025/2026' })
  },
  noyaux: {
    coll:'noyaux', label:'bon de noyaux', titre:r=>r.num, id:'num', route:'noyaux',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('NOY',4)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'client', l:'Client', type:'select', req:true, options:()=>DB.clients.map(c=>c.nom)},
      {k:'transporteur', l:'Transporteur', type:'select', options:()=>DB.transporteurs.map(t=>t.nom)},
      {k:'matricule', l:'Matricule véhicule', type:'select', options:()=>[...new Set(DB.transporteurs.flatMap(t=>t.matricules||[]))]},
      {k:'bl', l:'Bon de livraison', def:'BL-N-00043'},
      {k:'qte', l:'Quantité (kg)', type:'number', req:true},
      {k:'pu', l:'Prix unitaire', type:'number', step:'0.001', req:true, def:0.220},
      {k:'remarque', l:'Remarque', span:true},
      {k:'etat', l:'État', type:'select', options:['Livré','En attente','Annulé']}
    ],
    defaut:d=>({ total:+(d.qte*d.pu).toFixed(3), saison:'Saison 2025/2026' })
  },
  marginesEvac: {
    coll:'marginesEvac', label:'enlèvement de margines', titre:r=>r.num, id:'num', route:'margines',
    fields:[
      {k:'num', l:'Numéro', ro:true, def:()=>Store.num('MRG',4)},
      {k:'date', l:'Date', def:()=>Store.dateFR()},
      {k:'fournisseur', l:'Fournisseur', type:'select', req:true, options:()=>DB.transporteurs.map(t=>t.nom)},
      {k:'transporteur', l:'Transporteur', type:'select', options:()=>DB.transporteurs.map(t=>t.nom)},
      {k:'camion', l:'Camion', type:'select', options:()=>[...new Set(DB.transporteurs.flatMap(t=>t.matricules||[]))]},
      {k:'voyages', l:'Nombre de voyages', type:'number', req:true, def:1},
      {k:'prixVoyage', l:'Prix voyage (TND)', type:'number', step:'0.001', req:true, def:45}
    ],
    defaut:d=>({ total:+(d.voyages*d.prixVoyage).toFixed(3), saison:'Saison 2025/2026' })
  }
});
