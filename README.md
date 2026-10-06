# OLIVERA ERP — Huilerie Ben Chaaben

Application de gestion d'huilerie : réception des olives, production, entrée
d'huile en pile, stock, sous-produits, ventes, finance, statistiques et états.

---

## 1. Deux façons d'exécuter l'application

### Mode serveur — données réellement enregistrées en base

    node server/server.js

Puis ouvrir **http://localhost:4300**.

* Base de données **SQLite** créée automatiquement dans `server/olivera.db`.
* Aucune dépendance à installer : le serveur utilise le HTTP et le SQLite
  intégrés à Node.js. **Node 22.5 ou plus récent est requis.**
* Première connexion : le mot de passe de chaque compte est égal à son login.

  | Login           | Profil                 | Modules autorisés                              |
  |-----------------|------------------------|------------------------------------------------|
  | `m.benchaaben`  | Administrateur         | tous                                           |
  | `k.jaziri`      | Responsable production | Achats, Production, Stock, Statistiques        |
  | `h.mansour`     | Comptable              | Finance, Statistiques, Paramétrage             |
  | `a.gharbi`      | Magasinier             | Stock, Achats                                  |

* Changer le port : `PORT=8080 node server/server.js`.
* Repartir de zéro : supprimer `server/olivera.db` et relancer.

### Mode démonstration — ouverture directe du fichier

Ouvrir `index.html` (ou le fichier unique `OLIVERA-ERP-prototype.html`) par
double-clic. L'application détecte l'absence de serveur et fonctionne avec les
données en mémoire : pratique pour une présentation client, sans persistance.

---

## 2. Architecture

    index.html            page unique de l'application
    css/style.css         design system complet
    js/data*.js           modèle métier et jeu de données initial
    js/store*.js          règles de gestion : montants, soldes, piles, relevés
    js/forms.js           générateur de formulaires et contrôleur CRUD
    js/pages*.js          les écrans, par domaine fonctionnel
    js/api.js             connexion, chargement et synchronisation avec le serveur
    server/server.js      serveur HTTP + API REST + base SQLite
    server/seed.json      données d'amorçage de la base

### API REST

| Méthode | Route                       | Rôle                                            |
|---------|-----------------------------|-------------------------------------------------|
| POST    | `/api/connexion`            | authentification, retourne un jeton de session  |
| GET     | `/api/donnees`              | chargement initial des tables autorisées        |
| GET     | `/api/:table`               | liste, filtrable par colonne                    |
| GET     | `/api/:table/:cle`          | consultation d'une ligne                        |
| POST    | `/api/:table`               | création                                        |
| PUT     | `/api/:table/:cle`          | modification                                    |
| DELETE  | `/api/:table/:cle`          | suppression                                     |
| POST    | `/api/metier/reception`     | bon de réception : document, lignes, stock      |
| POST    | `/api/metier/production`    | bon de production : consommation des olives     |
| POST    | `/api/metier/beh`           | bon d'entrée huile : pile, CMP, mouvement       |
| POST    | `/api/metier/encaissement`  | encaissement : tranches, trésorerie, statut     |
| GET     | `/api/audit`                | journal des opérations                          |

Toutes les routes sauf `/api/connexion` et `/api/sante` exigent l'en-tête
`Authorization: Bearer <jeton>`.

---

## 3. Rapport de livraison

### Ce qui a été mis en place

**Persistance réelle.** 66 tables générées à partir du modèle métier, avec clé
technique, clé naturelle et colonnes d'audit (`_cree_le`, `_cree_par`,
`_maj_le`, `_maj_par`). Les listes internes d'un document — lignes d'un bon,
tranches d'une facture, matricules d'un fournisseur — sont stockées en JSON
dans la ligne du document.

**Écritures effectives.** `Store.add`, `Store.update` et `Store.remove` sont le
point de passage unique de toutes les créations, modifications et suppressions
de l'interface : chacune déclenche l'appel REST correspondant. Une erreur
serveur remonte à l'écran par un message explicite, jamais en silence.

**Transactions.** Quatre opérations critiques sont atomiques côté serveur :

* bon d'entrée huile → écriture du bon, mise à jour de la quantité, du prix
  total et du CMP de la pile, création du mouvement, rattachement au bon de
  réception ;
* bon de production → écriture du bon, marquage du bon de réception, sortie des
  olives ;
* bon de réception → document, lignes valorisées, stock terrasse, mouvement ;
* encaissement → tranches, opérations de trésorerie, chèques, statut de la
  facture.

Si une étape échoue, la transaction est annulée : le refus de capacité d'une
pile a été vérifié, aucune ligne orpheline n'est créée.

**Droits d'accès contrôlés côté serveur.** Chaque table appartient à un module
(Paramétrage, Achats, Production, Stock, Statistiques, Finance). Les droits
cochés dans la fiche utilisateur sont appliqués sur chaque appel : un
magasinier reçoit `403 Accès refusé au module FINANCE` même en appelant l'URL
directement. Le menu de l'interface se réduit en conséquence.

**Journal d'audit.** Chaque connexion, création, modification et suppression est
enregistrée avec l'utilisateur, l'horodatage, la table, la cible, la valeur
avant et la valeur après.

**Calculs.** Poids net, montants selon la nature de l'opération, rendement, CMP,
soldes fournisseurs et clients, relevés débit/crédit, états par pile et état
journalier sont tous calculés à partir des données enregistrées.

### Tests réalisés

Connexion, création, consultation, modification et suppression d'un tiers ;
persistance vérifiée après rechargement complet du navigateur ; bon d'entrée
huile avec mise à jour de la pile et du CMP ; refus de dépassement de capacité
avec annulation de la transaction ; refus d'accès d'un profil sans droit
Finance ; parcours des 104 écrans sans erreur JavaScript.

### Ce qui reste à faire

* **Mots de passe** : hachage SHA-256 avec sel fixe, suffisant pour une
  installation locale. Pour une mise en production, passer à `scrypt` ou
  `bcrypt` et forcer le changement à la première connexion.
* **Écritures encore génériques** : les modules autres que les quatre flux
  ci-dessus écrivent table par table plutôt qu'en transaction. Cela suffit tant
  qu'une opération ne touche qu'une seule table.
* **Intégrité référentielle** : les relations sont contrôlées par le code
  métier, pas encore par des clés étrangères SQL.
* **Suppressions** : la confirmation existe, mais le blocage d'une suppression
  portant sur une donnée déjà utilisée n'est posé que sur les bons de réception
  liés à une production.
* **Sauvegarde** : prévoir une copie planifiée de `server/olivera.db`.
* **Concurrence** : le serveur est mono-processus, adapté à quelques postes
  simultanés sur le réseau local de l'huilerie.
