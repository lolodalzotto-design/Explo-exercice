# Explo exercice — première version

Simulateur pédagogique, aucune mesure réelle. Deux rôles : formateur et stagiaire. HTML/CSS/JavaScript sans compilation, hébergeable sur GitHub Pages.

## Déjà prévu

- Quatre indicateurs : LIE 0–100 %, CO 0–1000 ppm, H₂S 0–100 ppm, O₂ 0–25 % (pas 0,1).
- Valeurs initiales de simulation : 0 / 0 / 0 / 20,9.
- Alarmes LIE inclusives : niveau 1 à partir de 10 %, niveau 2 à partir de 20 %, avec sons provisoires distincts.
- Aucun seuil d’alarme CO/H₂S/O₂ supposé : à définir selon le matériel de référence.
- QR code et lien stagiaire propres à chaque session. Le lien stagiaire ne permet pas de piloter.
- Démonstration sur un seul appareil, clairement distincte de la commande distante.
- Indicateur de déconnexion, arrêt du son après perte prolongée du signal formateur (15 secondes), fin de session.

## 1. Activer GitHub Pages

Dans ce dépôt : Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save.
Attendre que GitHub confirme la publication. L’adresse attendue est https://lolodalzotto-design.github.io/Explo-exercice/ ; elle n’est utilisable qu’après activation et réussite du déploiement.

## 2. Configurer Firebase

Utiliser de préférence un projet dédié à cet exercice, forfait Spark. Ne pas remplacer les règles d’une base existante utilisée par une autre application.

1. Dans la console Firebase, créer/sélectionner le projet. Ajouter une application Web et récupérer l’objet public `firebaseConfig`.
2. Authentication → Sign-in method : activer **Anonymous / Anonyme**. Dans Settings → Authorized domains, ajouter `lolodalzotto-design.github.io` si nécessaire.
3. Créer **Realtime Database** (ce n’est pas Cloud Firestore), choisir une région européenne et démarrer avec les accès fermés.
4. Dans l’onglet Rules de cette base dédiée, copier `database.rules.json` puis publier.
5. Dans `firebase-config.js`, remplacer `null` par l’objet de configuration. Il doit inclure `apiKey`, `authDomain`, `projectId`, `appId` et surtout `databaseURL` de Realtime Database. Ne jamais mettre un compte de service ni une clé privée dans le dépôt.
6. Enregistrer le fichier et attendre la nouvelle publication GitHub Pages.

Le QR code et les SDK Firebase sont chargés depuis des CDN. Une connexion Internet est nécessaire. La gratuité reste soumise aux quotas Firebase et GitHub applicables.

## 3. Exercice à deux téléphones

1. Téléphone formateur : ouvrir le site, créer une session et afficher le QR code.
2. Téléphone stagiaire : scanner le QR code ou ouvrir le lien transmis, puis appuyer sur **Activer le son**. Garder la page au premier plan, écran allumé ; ne pas compter sur les alarmes en arrière-plan.
3. Déplacer chaque curseur. Tester LIE 9, 10, 19, 20 puis retour à 0. À 10 et 20 les niveaux doivent changer sans rafraîchissement.
4. Vérifier les quatre valeurs sur les deux appareils et tester une coupure réseau : l’écran stagiaire doit signaler des valeurs figées et couper l’alarme après expiration du signal.
5. Terminer la session avec le bouton formateur. Pour une nouvelle session, recharger la page.

Le formateur publie un signal toutes les 5 secondes ; les valeurs sont envoyées environ 100 ms après le dernier mouvement du curseur. Le délai réel dépend du réseau. Un accusé de réception stagiaire n’est pas encore implémenté : « commandes envoyées » ne signifie pas « reçues ».

## Accès et limites de cette première version

Les règles interdisent l’énumération des sessions et réservent l’écriture à l’utilisateur anonyme qui a créé la session, dans son navigateur. Le lien stagiaire contient un identifiant aléatoire de 128 bits ; toute personne possédant ce lien peut lire la session après authentification anonyme. Ne pas diffuser le lien au-delà de l’exercice. Conserver les données Firebase du navigateur formateur pendant la session.

Les sessions terminées restent dans la base et peuvent être supprimées depuis la console. Pas encore de purge automatique, de scénarios automatiques ni de reproduction photographique de l’appareil.

## Vérification effectuée

Syntaxe JavaScript et tests des seuils inclusifs 10/20, valeurs initiales et rejet des valeurs invalides. Les essais navigateur, audio mobile et transmission entre deux appareils restent à faire après configuration Firebase. Les règles sont fournies mais pas encore validées sur un émulateur Firebase.

Documentation : https://firebase.google.com/docs/web/setup et https://firebase.google.com/docs/database/web/read-and-write
