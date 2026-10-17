# Explo-exercice

Simulateur pédagogique de détecteur multigaz, piloté par un formateur.

Application : https://lolodalzotto-design.github.io/Explo-exercice/

1. Le formateur clique sur « Créer une session formateur ».
2. Il ouvre « Inviter le stagiaire » et partage le QR code ou le lien.
3. Le stagiaire ouvre le lien et appuie sur « Activer le son ».
4. Le formateur pilote LIE, CO, H₂S et O₂ avec les curseurs.

Alarmes LIE : niveau 1 à partir de 10 %, niveau 2 à partir de 20 %. Aucun seuil CO/H₂S/O₂ n’est configuré.

## Configuration dédiée

Projet Firebase `explo-exercice`, Realtime Database en Belgique, authentification anonyme et règles `database.rules.json` publiées. GitHub Pages sert la branche `main`, dossier racine. Cette application utilise uniquement ce projet Firebase.

## Vérification du 17 octobre 2026

Création de session, lecture dans un second onglet, réception des quatre mesures, affichage des alarmes LIE à 10 et 20 %, et remise à zéro validés sur le site publié. Les deux onglets partagent le même navigateur : cela ne remplace pas un essai sur deux téléphones indépendants en réseau mobile. Audio sur téléphone et coupure réseau restent à vérifier.

Voir [INSTALLATION.md](INSTALLATION.md) pour le fonctionnement et les limites. Cet outil simule des valeurs et ne mesure aucun gaz.
