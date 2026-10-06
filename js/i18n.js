/* ==========================================================================
   OLIVERA ERP — Bilingue français / arabe
   Le dictionnaire traduit les libellés de l'interface après chaque rendu.
   Le passage à l'arabe bascule la page en RTL sans rechargement.
   ========================================================================== */

const I18n = {
  lang: 'fr',

  dict: {

    "Nature":"طبيعة العملية", "Fournisseur / Client":"المورد / الزبون", "Numéro BR":"رقم المذكرة",
    "Quantité (kg)":"الكمية (كغ)", "Prix total":"السعر الإجمالي", "Production":"الإنتاج",
    "Paiement":"الخلاص", "Payé":"مدفوع", "Non payé":"غير مدفوع", "Partiellement payé":"مدفوع جزئيا",

    "État de caisse espèces":"كشف الصندوق النقدي", "État de caisse chèques":"كشف صندوق الشيكات",
    "Correction de caisse":"تصحيح الصندوق", "Validation de caisse":"مصادقة الصندوق",
    "Règlement personnel":"تسوية الموظفين", "Historique règlement personnel":"سجل تسويات الموظفين",
    "Bons de livraison":"سندات التسليم", "Factures":"الفواتير", "Alimentation":"تموين الصندوق",
    "Solde de départ":"الرصيد الأولي", "Entrée":"دخل", "Sortie":"خروج", "Correction solde":"تصحيح الرصيد",
    "Solde après correction":"الرصيد بعد التصحيح", "Somme non validée":"مبلغ غير مصادق عليه",
    "Validation caisse":"مصادقة الصندوق", "Caisse":"الصندوق", "Nature":"طبيعة العملية",
    "Modalité de paiement":"طريقة الدفع", "Utilisateur":"المستخدم", "Personnel":"الموظفون",
    "Date de":"من تاريخ", "Jusqu'à":"إلى تاريخ", "Numéro règlement":"رقم التسوية",
    "Date règlement":"تاريخ التسوية", "Montant":"القيمة", "Motif":"السبب", "Validation":"تأكيد",

    /* --- Modèle réception / production / huile --- */
    "Bons de réception":"مذكرات الاستلام", "Bon de réception":"مذكرة الاستلام",
    "Bons de production":"أوامر الإنتاج", "Bon de production":"أمر الإنتاج",
    "Bons d'entrée huile":"أوامر دخول الزيت", "Bon d'entrée huile":"أمر دخول الزيت",
    "Fiche présence":"بطاقة الحضور", "Organoleptiques":"الخصائص الحسية",
    "Contrôle organoleptique":"الفحص الحسي", "Terrasses / dépôts":"المصاطب والمخازن",
    "Piles huile":"كومات الزيت", "Pile":"كومة", "Piles":"الكومات", "Grignons":"القشور", "Noyaux":"النوى",
    "Margines":"الهوامش", "Fournisseur":"الفلاح", "Fournisseurs":"الفلاحون", "Client":"الزبون", "Clients":"الزبائن",
    "Transporteur":"الناقل", "Transporteurs":"الناقلون", "Règlement":"التسوية", "Règlements":"التسويات",
    "Acompte":"تسبيق", "Acomptes":"التسبيقات", "Accomptes fournisseurs":"تسبيقات الفلاحين",
    "Solde":"الرصيد", "Débit":"مدين", "Crédit":"دائن", "Solde initial":"الرصيد الأولي", "Solde final":"الرصيد النهائي",
    "Total débit":"مجموع المدين", "Total crédit":"مجموع الدائن",
    "État fournisseur":"كشف الفلاح", "État client":"كشف الزبون",
    "Relevé fournisseur":"كشف حركة الفلاح", "Relevé client":"كشف حركة الزبون",
    "État par pile":"كشف الكومة", "État par pile / date":"كشف الكومة حسب التاريخ",
    "État grignons":"كشف القشور", "État noyaux":"كشف النوى", "État margines":"كشف الهوامش",
    "État solde client":"كشف أرصدة الزبائن", "État journalier":"الكشف اليومي",
    "Nature de l'opération":"طبيعة العملية", "Achat olive":"شراء زيتون",
    "Achat olive sur base huile":"شراء زيتون على أساس الزيت", "Trituration":"عصر",
    "Poids brut":"الوزن الإجمالي", "Poids vide":"وزن فارغ", "Poids net":"الوزن الصافي",
    "Nombre de caisses":"عدد الصناديق", "Terrasse":"المخزن", "Matricule véhicule":"رقم السيارة",
    "Quantité huile":"كمية الزيت", "Quantité olives":"كمية الزيتون", "Acidité":"حموضة",
    "Rechercher":"بحث", "Réinitialiser":"إعادة الضبط", "Ajouter":"إضافة", "Numéro":"الرقم",
    "Raison sociale":"الوصف", "Adresse":"العنوان", "Identifiant unique":"بطاقة الهوية",
    "Nom & Prénom":"الاسم و اللقب", "Nom":"الاسم", "Prénom":"اللقب", "Prix":"السعر",
    "Date début":"تاريخ البداية", "Date fin":"تاريخ النهاية", "Saison":"الموسم", "Année":"السنة",
    "Sans production":"بدون إنتاج", "Rendement":"المردود", "Droits d'accès":"صلاحيات الدخول",
    "Tout cocher":"تحديد الكل", "Tout décocher":"إلغاء التحديد", "Accès refusé":"الدخول مرفوض",

    "Toutes":"الكل", "tous":"الكل", "Tous":"الكل", "Pièces":"وثائق الخلاص", "Total réglé":"المبلغ المخلص",
    "Montant total":"المبلغ الإجمالي", "Reste à payer":"المبلغ المتبقي", "Dépenses":"المصاريف",
    "Payé":"مدفوع", "Désignation":"التسمية", "Fournisseur":"المورد", "Excel":"إكسل", "Imprimer":"طباعة",
    "Rechercher":"بحث", "Réinitialiser":"إعادة الضبط", "Date début":"تاريخ البداية", "Date fin":"تاريخ النهاية",
    "Charges d'exploitation et pièces de règlement associées":"مصاريف الاستغلال ووثائق الخلاص المرتبطة بها",
    "Document principal de réception : achat d'olives, achat sur base huile ou trituration":"الوثيقة الأساسية للاستلام: شراء زيتون أو شراء على أساس الزيت أو عصر",
    "Pointage du personnel et calcul automatique de la rémunération":"تسجيل حضور الموظفين والاحتساب الآلي للأجور",
    "Fiches du personnel permanent et saisonnier":"بطاقات الموظفين القارين والموسميين",
    "Fournisseurs d'olives et fournisseurs divers":"موردو الزيتون والموردون المختلفون",
    "Clients de vente, de trituration, de grignons et clients passagers":"زبائن البيع والعصر والقشور والزبائن العابرون",
    "Stock d'huile par pile, valorisé au coût moyen pondéré":"مخزون الزيت حسب الكومة مقوّم بالتكلفة الوسطى المرجحة",
    "Entrée de l'huile en pile avec contrôle qualité":"إدخال الزيت إلى الكومة مع مراقبة الجودة",
    "Transformation des olives réceptionnées en huile":"تحويل الزيتون المستلم إلى زيت",
    "Indicateurs calculés en direct sur les données saisies dans l'application":"مؤشرات محتسبة مباشرة من المعطيات المسجلة في التطبيق",
    "Comptes de connexion et droits d'accès par module":"حسابات الدخول والصلاحيات حسب الوحدة",
    "Unités de mesure et règles de conversion utilisées par les modules":"وحدات القيس وقواعد التحويل المستعملة في الوحدات",
    "Catégories de production de l'huilerie, ajoutables sans modifier le code":"أنواع الإنتاج بالمعصرة، قابلة للإضافة دون تغيير البرنامج",
    "Toutes les tranches de paiement, quel que soit le document d'origine":"كل أقساط الخلاص مهما كانت الوثيقة الأصلية",
    "Enlèvements, quantités et montants — prix total calculé automatiquement":"عمليات الرفع والكميات والمبالغ — السعر الإجمالي يحتسب آليا",
    "Total (TND)":"الإجمالي (دينار)", "Prix":"السعر", "Terrasse":"المصطبة",
    "Achats":"المشتريات", "Statistiques":"الإحصائيات", "Tableau de bord":"لوحة التحكم",
    "Types de production":"أنواع الإنتاج", "Opérations de production":"عمليات الإنتاج",
    "Historique de production":"سجل الإنتاج", "Stock général":"المخزون العام",
    "Pièces de règlement":"وثائق الخلاص", "Règlements personnel":"أجور الموظفين",
    "Historique règlements personnel":"سجل أجور الموظفين", "Rapports financiers":"التقارير المالية",
    "Ajouter une présence":"إضافة حضور", "Pointage du personnel":"تسجيل حضور الموظفين",
    "Tous présents":"الكل حاضر", "Tous absents":"الكل غائب", "Présent":"حاضر", "Absent":"غائب",
    "Remarque":"ملاحظة", "Matricules des véhicules":"أرقام السيارات", "Ajouter matricule":"إضافة رقم سيارة",
    "Unités et conversions":"الوحدات والتحويلات", "Conversions":"التحويلات", "Convertisseur":"محول الوحدات",
    "Unité source":"وحدة المصدر", "Unité cible":"الوحدة المستهدفة", "Quantité source":"الكمية المصدر",
    "Quantité cible":"الكمية المستهدفة", "Résultat":"النتيجة",
    "Droits d'accès":"صلاحيات الدخول", "Sélectionner tout":"تحديد الكل", "Désélectionner tout":"إلغاء التحديد",
    "Développer / réduire":"توسيع / تصغير", "Ajouter une dépense":"إضافة مصروف", "Désignation":"البيان",
    "Ajouter une ligne de paiement":"إضافة سطر دفع", "Total payé":"المبلغ المدفوع", "Reste à payer":"المبلغ المتبقي",
    "Mode de règlement":"طريقة الخلاص", "Espèce":"نقدا", "Virement":"تحويل بنكي", "Autre":"أخرى",
    "Ajouter Grignons":"إضافة قشور", "Ajouter Noyaux":"إضافة نوى", "Prix unitaire":"سعر الوحدة",
    "Prix total":"السعر الإجمالي", "Bon de livraison":"سند التسليم", "Montant minimum":"المبلغ الأدنى",
    "Montant maximum":"المبلغ الأقصى", "Catégorie":"الصنف", "Numéro":"الرقم", "État":"الحالة",

    /* --- Menu restructuré --- */
    "Dashboard":"لوحة التحكم", "Paramétrage":"الإعدادات", "Finance / Trésorerie":"المالية / الخزينة",
    "Statistiques / États":"الإحصائيات والكشوفات", "Personnel":"الموظفون", "Présence":"الحضور",
    "Avances du personnel":"تسبقات الموظفين", "Règlements du personnel":"أجور الموظفين",
    "Transporteurs":"الناقلون", "Sociétés":"الشركات", "Années":"السنوات", "Saisons":"المواسم",
    "Unités":"الوحدات", "Modes de paiement":"طرق الدفع", "Paramètres généraux":"الإعدادات العامة",
    "Réception des olives":"استلام الزيتون", "Bons de réception":"سندات الاستلام",
    "Bons d'entrée d'huile":"سندات إدخال الزيت", "Contrôle organoleptique":"الفحص الحسي",
    "Analyses physico-chimiques":"التحاليل الفيزيوكيميائية", "Bons de commande":"سندات الطلب",
    "Factures fournisseurs":"فواتير الموردين", "Accomptes fournisseurs":"تسبقات الموردين",
    "Règlements fournisseurs":"تسديدات الموردين", "Sous-produits":"المنتجات الثانوية",
    "Articles":"المواد", "Piles à huile":"صهاريج الزيت", "Terrasses":"المصاطب",
    "Grignons":"الفيتورة", "Margines":"المرجين", "Noyaux":"النوى", "Ventes":"المبيعات",
    "Caisse comptoir":"صندوق البيع", "Bons de livraison":"سندات التسليم", "Factures clients":"فواتير العملاء",
    "Encaissements":"التحصيلات", "Caisse espèces":"الصندوق النقدي", "Caisse chèques":"محفظة الشيكات",
    "Alimentation de caisse":"تموين الصندوق", "Règlements clients":"تسديدات العملاء",
    "Validation de caisse":"مصادقة الصندوق", "Historique des règlements":"سجل التسديدات",
    "État journalier":"الكشف اليومي", "État par pile":"كشف حسب الصهريج", "État par pile / date":"كشف الصهاريج حسب التاريخ",
    "État fournisseurs":"كشف الموردين", "État clients":"كشف العملاء", "États financiers":"الكشوفات المالية",
    "Journal d'activité":"سجل النشاط", "Solde initial":"الرصيد الأولي", "Solde théorique":"الرصيد النظري",
    "Solde réel compté":"الرصيد الفعلي المحتسب", "Écart":"الفارق", "Entrées du jour":"مداخيل اليوم",
    "Sorties du jour":"مصاريف اليوم", "Comptage physique":"العد الفعلي", "Clôturer la caisse":"إقفال الصندوق",
    "Relevé fournisseur":"كشف حساب المورد", "Relevé client":"كشف حساب العميل",
    "Pile":"الصهريج", "Terrasse":"المصطبة", "Journal":"اليومية", "Employé":"الموظف",
    "Brut":"الخام", "Net à payer":"الصافي للدفع", "Période":"الفترة", "Avances retenues":"التسبقات المخصومة",

    /* --- Sous-titres fréquents --- */
    "Indicateurs calculés en direct sur les données saisies dans l'application":"مؤشرات محتسبة مباشرة من المعطيات المسجلة في التطبيق",
    "Recalculés à chaque opération enregistrée":"تحتسب من جديد عند كل عملية مسجلة",
    "En dinars, par mois de campagne":"بالدينار، حسب أشهر الموسم", "En litres":"باللتر",
    "Litres obtenus par variété d'olives":"اللترات المتحصل عليها حسب صنف الزيتون",
    "Moyenne annuelle en %":"المعدل السنوي بالنسبة المائوية",
    "Chiffre d'affaires de la campagne":"رقم معاملات الموسم", "Achats et apports réglés":"المشتريات والمساهمات المخلصة",
    "6 éléments demandent une décision":"6 عناصر تتطلب قرارا", "Mois":"شهر", "Trimestre":"ثلاثي",
    "Ventes":"المبيعات", "Unités":"وحدة", "Toutes familles confondues":"كل العائلات مجتمعة",
    "Règlements clients : paiement unique, mixte ou par tranches":"تسديدات العملاء: دفعة واحدة أو مختلطة أو بالأقساط",
    "Chèques reçus, déposés, encaissés ou rejetés":"الشيكات المقبوضة والمودعة والمحصلة والمرفوضة",
    "Base commerciale et situation de chaque compte":"القاعدة التجارية ووضعية كل حساب",
    "Facturation basée sur les quantités effectivement livrées":"الفوترة على أساس الكميات المسلمة فعليا",

    /* --- Titres d'écrans --- */
    "Bonjour":"مرحبا",
    "Factures clients":"فواتير العملاء", "Commandes clients":"طلبيات العملاء", "Suivi des chèques":"متابعة الشيكات",
    "Producteurs et agriculteurs":"المنتجون والفلاحون", "Vue globale du stock":"العرض الشامل للمخزون",
    "Mouvements de stock":"حركات المخزون", "Inventaire physique":"الجرد الفعلي", "Vente rapide":"البيع السريع",
    "Tickets de caisse":"تذاكر الصندوق", "Créances clients":"ديون العملاء", "Dettes fournisseurs":"ديون الموردين",
    "Rapports et statistiques":"التقارير والإحصائيات", "Chaîne de traçabilité":"سلسلة التتبع",
    "Matrice des permissions":"مصفوفة الصلاحيات", "Informations société":"معلومات الشركة",
    "Paramètres généraux":"الإعدادات العامة", "Numérotation des documents":"ترقيم الوثائق",
    "Campagnes oléicoles":"مواسم الزيتون", "Nouvelle réception":"استلام جديد", "Apports du producteur":"مساهمات المنتج",
    "Ordre de fabrication":"أمر التصنيع", "Déroulé de la transformation":"مراحل التحويل",
    "Calcul du rendement":"احتساب المردود", "Lots rattachés":"الدفعات المرتبطة",
    "Stock d'emballages":"مخزون التعبئة", "Historique des règlements":"سجل التسديدات",
    "Comparaison des campagnes":"مقارنة المواسم", "Catalogue de rapports":"قائمة التقارير",
    "Indicateurs complémentaires":"مؤشرات إضافية", "Chiffre d'affaires et achats":"رقم المعاملات والمشتريات",
    "Huile produite par mois":"الزيت المنتج شهريا", "Production par variété":"الإنتاج حسب الصنف",
    "Rendement par campagne":"المردود حسب الموسم", "Top 5 clients":"أفضل 5 عملاء", "Top 5 fournisseurs":"أفضل 5 موردين",
    "Workflow d'achat":"مسار الشراء", "Fiche du lot":"بطاقة الدفعة",

    /* --- Étiquettes courantes --- */
    "résultats":"نتيجة", "page":"صفحة", "sur":"من", "lignes affichées":"سطر معروض",
    "Payé":"مدفوع", "Reste":"المتبقي", "N° facture":"رقم الفاتورة", "TVA 19 %":"الأداء 19 ٪",
    "Facturé sur la campagne":"المفوتر خلال الموسم", "Encaissé":"المحصل", "Restant dû":"المتبقي",
    "Factures en retard":"فواتير متأخرة", "Clients actifs":"عملاء نشطون", "Encours total":"إجمالي المستحقات",
    "Tickets du jour":"تذاكر اليوم", "Encaissé comptoir":"المحصل بالصندوق", "Articles vendus":"المنتجات المباعة",
    "Panier moyen":"معدل السلة", "Producteurs actifs":"منتجون نشطون", "Apports enregistrés":"مساهمات مسجلة",
    "Olives collectées":"الزيتون المجموع", "Soldes à régler":"أرصدة للخلاص", "Trésorerie actuelle":"الخزينة الحالية",
    "Recettes de la campagne":"مداخيل الموسم", "Dépenses de la campagne":"مصاريف الموسم",
    "Total des ventes":"إجمالي المبيعات", "Total des achats":"إجمالي المشتريات", "Paiements reçus":"مدفوعات مقبوضة",
    "Paiements en attente":"مدفوعات في الانتظار", "Aujourd'hui":"اليوم", "Cette semaine":"هذا الأسبوع",
    "Ce mois":"هذا الشهر", "Cette campagne":"هذا الموسم", "Année":"السنة",
    "Réception":"الاستلام", "Lot olives":"دفعة الزيتون", "Lot huile":"دفعة الزيت", "Produit fini":"منتج نهائي",
    "Livraison":"التسليم", "Facture":"الفاتورة", "Analyse qualité":"تحليل الجودة", "Stock mini":"الحد الأدنى",
    "Couverture":"التغطية", "Prévu":"متوقع", "Réel":"فعلي", "Sens":"الاتجاه", "Résultat":"النتيجة",
    "Peroxyde":"البيروكسيد", "Quantité initiale":"الكمية الأولية", "Stock restant":"المخزون المتبقي",
    "Ajouter":"إضافة", "Ville":"المدينة", "Encours":"المستحقات", "CA total":"إجمالي المعاملات",
    "Dernière commande":"آخر طلبية", "Raison sociale":"الاسم الاجتماعي", "Conditions":"الشروط",
    "Zone":"المنطقة", "Parcelles":"القطع", "Apports":"المساهمات", "Solde dû":"الرصيد المستحق",
    /* --- Identité et en-tête --- */
    "Gestion intégrée de l'huilerie":"الإدارة المتكاملة لمعصرة الزيتون",
    "Rechercher":"بحث", "Directeur":"المدير", "Déconnexion":"تسجيل الخروج",
    "Campagne 2025/2026":"موسم 2025/2026", "Campagne 2024/2025":"موسم 2024/2025", "Campagne 2023/2024":"موسم 2023/2024",
    "Site de Sousse (principal)":"موقع سوسة (الرئيسي)", "Site de Kalâa Kebira":"موقع القلعة الكبرى", "Tous les sites":"كل المواقع",
    "Voici un aperçu de votre huilerie aujourd'hui.":"إليك نظرة عامة على معصرتك اليوم.",
    "Thème":"السمة", "Notifications":"الإشعارات", "Menu":"القائمة", "Langue":"اللغة",

    /* --- Navigation --- */
    "Tableau de bord":"لوحة التحكم", "Approvisionnement":"التموين", "Stock":"المخزون", "Production":"الإنتاج",
    "Commercial":"التجاري", "Finance":"المالية", "Gestion":"التسيير", "Analyse":"التحليل", "Administration":"الإدارة",
    "Fournisseurs":"الموردون", "Producteurs":"المنتجون", "Achats":"المشتريات", "Réceptions":"الاستلامات",
    "Collecte des olives":"جمع الزيتون", "Vue globale":"عرض شامل", "Matières premières":"المواد الأولية",
    "Huile en vrac":"الزيت السائب", "Produits finis":"المنتجات النهائية", "Emballages":"التعبئة",
    "Magasins":"المخازن", "Mouvements":"الحركات", "Inventaire":"الجرد",
    "Ordres de fabrication":"أوامر التصنيع", "Suivi de production":"متابعة الإنتاج", "Rendements":"المردود",
    "Lots":"الدفعات", "Traçabilité":"التتبع", "Contrôle qualité":"مراقبة الجودة", "Conditionnement":"التعليب",
    "Clients":"العملاء", "Devis":"عروض الأسعار", "Commandes":"الطلبيات", "Vente rapide / Caisse":"البيع السريع / الصندوق",
    "Livraisons":"التسليمات", "Factures":"الفواتير", "Tickets":"التذاكر",
    "Paiements":"المدفوعات", "Caisse":"الصندوق", "Banque":"البنك", "Dépenses":"المصاريف",
    "Créances":"الديون المستحقة", "Dettes":"الديون", "Suivi des chèques":"متابعة الشيكات",
    "Équipements":"المعدات", "Maintenance":"الصيانة", "Transport":"النقل", "Ressources humaines":"الموارد البشرية",
    "Reporting":"التقارير", "Statistiques":"الإحصائيات", "Journal d'audit":"سجل التدقيق",
    "Utilisateurs":"المستخدمون", "Rôles et permissions":"الأدوار والصلاحيات", "Paramétrage":"الإعدادات",

    /* --- Actions --- */
    "Ajouter":"إضافة", "Modifier":"تعديل", "Supprimer":"حذف", "Consulter":"عرض", "Enregistrer":"حفظ",
    "Annuler":"إلغاء", "Valider":"تأكيد", "Filtrer":"تصفية", "Exporter":"تصدير", "Imprimer":"طباعة",
    "Fermer":"إغلاق", "Voir":"عرض", "Excel":"إكسل", "PDF":"PDF", "Télécharger PDF":"تحميل PDF",
    "Réinitialiser les filtres":"إعادة ضبط التصفية", "Tout voir":"عرض الكل", "Tout marquer comme lu":"تعليم الكل كمقروء",
    "Encaisser":"تحصيل", "Échéancier":"جدول الدفع", "Imprimer un reçu":"طباعة وصل",
    "Nouveau client":"عميل جديد", "Nouveau fournisseur":"مورد جديد", "Nouveau producteur":"منتج جديد",
    "Nouvelle vente":"بيع جديد", "Nouvelle commande":"طلبية جديدة", "Nouvelle facture":"فاتورة جديدة",
    "Nouvelle réception":"استلام جديد", "Nouvel ordre":"أمر جديد", "Nouvel utilisateur":"مستخدم جديد",
    "Nouvel employé":"موظف جديد", "Nouvel équipement":"معدة جديدة", "Nouveau véhicule":"مركبة جديدة",
    "Nouveau magasin":"مخزن جديد", "Nouvelle dépense":"مصروف جديد", "Nouveau bon de livraison":"وصل تسليم جديد",
    "Nouveau rôle":"دور جديد", "Nouveau devis":"عرض سعر جديد", "Bon de commande":"سند طلب",
    "Enregistrer un paiement":"تسجيل دفعة", "Ajouter une tranche":"إضافة قسط",
    "Marquer comme payée":"تعليم كمدفوعة", "Saisir une analyse":"إدخال تحليل",
    "Entrée":"إدخال", "Sortie":"إخراج", "Transfert":"تحويل", "Rapports":"التقارير",
    "Valider la vente":"تأكيد البيع", "Valider la réception":"تأكيد الاستلام", "Valider le paiement":"تأكيد الدفع",
    "Enregistrer en brouillon":"حفظ كمسودة", "Relancer":"تذكير", "Historique des réceptions":"سجل الاستلامات",
    "Planifier une intervention":"برمجة تدخل", "Nouvelle opération":"عملية جديدة", "Exporter Excel":"تصدير إكسل",
    "Exporter PDF":"تصدير PDF", "Rapport PDF":"تقرير PDF", "Tickets du jour":"تذاكر اليوم",
    "Aperçu du ticket":"معاينة التذكرة", "Imprimer le ticket":"طباعة التذكرة", "Vider le panier":"إفراغ السلة",

    /* --- Colonnes et libellés --- */
    "Code":"الرمز", "Client":"العميل", "Fournisseur":"المورد", "Producteur":"المنتج", "Produit":"المنتج",
    "Désignation":"التسمية", "Date":"التاريخ", "Heure":"الساعة", "Statut":"الحالة", "Montant":"المبلغ",
    "Quantité":"الكمية", "Unité":"الوحدة", "Prix":"السعر", "Total":"المجموع", "Remise":"التخفيض",
    "Téléphone":"الهاتف", "E-mail":"البريد الإلكتروني", "Ville":"المدينة", "Adresse":"العنوان",
    "Lot":"الدفعة", "Magasin":"المخزن", "Variété":"الصنف", "Campagne":"الموسم", "Machine":"الآلة",
    "Responsable":"المسؤول", "Utilisateur":"المستخدم", "Rôle":"الدور", "Site":"الموقع", "Motif":"السبب",
    "Référence":"المرجع", "Échéance":"تاريخ الاستحقاق", "Mode de paiement":"طريقة الدفع", "Tranche":"القسط",
    "Montant total":"المبلغ الإجمالي", "Montant payé":"المبلغ المدفوع", "Reste à payer":"المبلغ المتبقي",
    "Montant HT":"المبلغ دون احتساب الأداء", "Total TTC":"المجموع مع الأداء", "Total HT":"المجموع دون أداء",
    "Sous-total":"المجموع الفرعي", "Montant reçu":"المبلغ المقبوض", "Monnaie rendue":"الباقي",
    "Rendement":"المردود", "Acidité":"الحموضة", "Humidité":"الرطوبة", "Impuretés":"الشوائب",
    "Poids brut":"الوزن القائم", "Tare":"الوزن الفارغ", "Poids net":"الوزن الصافي", "Poids net calculé":"الوزن الصافي المحتسب",
    "Parcelle":"القطعة", "Origine":"المنشأ", "Commentaires":"ملاحظات", "Qualité":"الجودة",
    "Analyste":"المحلل", "Colis":"الطرود", "Transporteur":"الناقل", "Banque":"البنك", "Émetteur":"الساحب",
    "Chiffre d'affaires":"رقم المعاملات", "Huile produite":"الزيت المنتج", "Olives réceptionnées":"الزيتون المستلم",
    "Rendement moyen":"معدل المردود", "Stock disponible":"المخزون المتوفر", "Créances clients":"ديون العملاء",
    "Dettes fournisseurs":"ديون الموردين", "Trésorerie":"الخزينة", "Panier":"السلة", "Panier vide":"السلة فارغة",
    "Prochaine maintenance":"الصيانة القادمة", "Localisation":"الموقع", "État":"الحالة", "Type":"النوع",
    "Poste":"الخطة", "Département":"القسم", "Matricule":"المعرّف", "Login":"اسم الدخول",
    "Dernière connexion":"آخر اتصال", "Action":"الإجراء", "Ancienne valeur":"القيمة السابقة", "Nouvelle valeur":"القيمة الجديدة",
    "Module":"الوحدة", "Avancement":"التقدم", "Catégorie":"الصنف", "Justificatif":"الوثيقة المبررة",

    /* --- Statuts --- */
    "Payée":"مدفوعة", "Partiellement payée":"مدفوعة جزئيا", "En attente":"في الانتظار", "En retard":"متأخرة",
    "Prévue":"مبرمجة", "Conforme":"مطابقة", "Non conforme":"غير مطابقة", "Bloqué":"محجوز",
    "Actif":"نشط", "Inactif":"غير نشط", "Validée":"مصادق عليها", "Livrée":"تم التسليم", "En cours":"جارية",
    "Terminé":"منتهي", "Planifié":"مبرمج", "En production":"قيد الإنتاج", "Brouillon":"مسودة", "Annulé":"ملغى",
    "Normal":"عادي", "Faible":"منخفض", "Critique":"حرج", "En service":"في الخدمة", "En panne":"معطل",
    "Disponible":"متوفر", "En mission":"في مهمة", "Permanent":"قار", "Saisonnier":"موسمي",
    "Espèces":"نقدا", "Chèque":"شيك", "Virement":"تحويل بنكي", "Carte":"بطاقة", "Traite":"كمبيالة",
    "Déposé":"مودع", "Encaissé":"محصل", "Rejeté":"مرفوض", "Soldé":"مسدد",

    /* --- Paiements --- */
    "Paiement unique":"دفعة واحدة", "Paiement mixte":"دفع مختلط", "Paiement par tranches":"الدفع بالأقساط",
    "Échéancier de paiement":"جدول الدفع", "Reçu de paiement":"وصل خلاص", "Total saisi":"المجموع المدخل",
    "Reste après opération":"المتبقي بعد العملية", "Total facturé":"المبلغ المفوتر", "Total encaissé":"المبلغ المحصل",
    "Reste à recouvrer":"المبلغ المتبقي للتحصيل", "Factures en retard":"فواتير متأخرة", "Reçu de":"وصل من",
    "Encaissé par":"حصله", "Historique des règlements":"سجل التسديدات",

    /* --- Messages --- */
    "Aucun résultat":"لا توجد نتائج", "Chargement…":"جاري التحميل…",
    "Rechercher…":"بحث…", "Rechercher un client…":"البحث عن عميل…", "Rechercher une facture, un client…":"البحث عن فاتورة أو عميل…",
    "Alertes et actions":"التنبيهات والإجراءات", "Stock critique":"مخزون حرج", "Facture échue":"فاتورة مستحقة",
    "Lot bloqué":"دفعة محجوزة", "Production terminée":"إنتاج منته", "Maintenance préventive":"صيانة وقائية"
  },

  t(s){ return this.lang==='ar' ? (this.dict[s] || s) : s; },

  set(lang){
    this.lang = lang;
    const rtl = lang==='ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    App.render();
    toast(rtl ? 'تم تغيير اللغة' : 'Langue changée',
          rtl ? 'واجهة عربية من اليمين إلى اليسار' : 'Interface en français, de gauche à droite', 'info');
  },

  /* Traduction du DOM après chaque rendu.
     Les libellés bilingues « Français / عربي » sont réduits à une seule
     langue : l'interface n'affiche jamais les deux en même temps. */
  bilingue: /^([^\/]*[A-Za-zÀ-ÿ][^\/]*?)\s*\/\s*([\u0600-\u06FF][\s\S]*)$/,

  apply(root){
    root = root || document.body;
    const ar = this.lang === 'ar';

    const traduire = t => {
      const m = t.match(this.bilingue);
      if(m) return (ar ? m[2] : m[1]).trim();
      if(!ar) return null;
      if(this.dict[t]) return this.dict[t];
      /* « Saison : tous », « Client : tous » — libellés générés par les filtres */
      const f = t.match(/^(.+?)\s*:\s*tous$/);
      if(f && this.dict[f[1]]) return this.dict[f[1]] + ' : الكل';
      /* Salutation de l'en-tête, avec le prénom de l'utilisateur */
      const b = t.match(/^Bonjour (.+?) — voici un aperçu de votre huilerie aujourd'hui\.$/);
      if(b) return `مرحبا ${b[1]} — إليك نظرة عامة على معصرتك اليوم.`;
      /* Placeholders de recherche « Rechercher … » */
      if(/^Rechercher .+…$/.test(t)) return 'بحث…';
      /* « Saison 2025/2026 », « Campagne 2025/2026 » */
      const s = t.match(/^(Saison|Campagne)\s+(\d{4}\/\d{4})$/);
      if(s) return (s[1]==='Saison' ? 'موسم ' : 'موسم ') + s[2];
      return null;
    };

    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const noeuds = [];
    while(walk.nextNode()) noeuds.push(walk.currentNode);
    noeuds.forEach(n=>{
      if(n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) return;
      const t = n.nodeValue.trim();
      if(!t) return;
      let v = traduire(t);
      /* Les plaques tunisiennes s'écrivent « 244 TU 2002 » ou « 244 تونس 2002 » */
      const src = v === null ? t : v;
      const plaque = ar ? src.replace(/(\d{1,4})\s*TU\s*(\d{1,4})/g, '$1 تونس $2')
                        : src.replace(/(\d{1,4})\s*تونس\s*(\d{1,4})/g, '$1 TU $2');
      if(plaque !== t) v = plaque;
      if(v !== null && v !== t) n.nodeValue = n.nodeValue.replace(t, v);
    });

    ['placeholder','data-tip','title','aria-label','value'].forEach(attr=>{
      root.querySelectorAll('['+attr+']').forEach(e=>{
        if(attr === 'value' && e.tagName !== 'OPTION') return;
        const v0 = e.getAttribute(attr);
        if(!v0) return;
        const v = traduire(v0.trim());
        if(v !== null && v !== v0) e.setAttribute(attr, v);
      });
    });
  }
};
