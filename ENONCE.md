# Cas Steenland Foodservice

Nightborn — exercice développeur medior, à faire chez toi.

| | |
| --- | --- |
| **Effort attendu** | environ 2h30 |
| **Délai** | 7 jours calendaires à partir de la réception de ce document |
| **Outils** | tous, y compris les assistants IA. La façon dont tu les utilises fait partie de ce qu'on regarde |
| **Rendu** | un repository GitHub privé, auquel tu nous invites |
| **Ensuite** | un entretien d'une heure où tu défends ce que tu as rendu |

**Si tu dépasses 3 heures, arrête-toi et note où tu en étais.** Savoir s'arrêter et dire
ce qui reste fait partie de l'exercice. Un rendu incomplet et lucide vaut mieux qu'un rendu
complet et flou.

---

## 1. Le contexte

Steenland Foodservice est un grossiste belge qui fournit de l'épicerie sèche et du surgelé
à environ 400 clients indépendants : boulangeries, sandwicheries, petits hôtels et cantines.
Entreprise familiale, 45 employés, environ 22M EUR de chiffre d'affaires, rentable,
croissance d'environ 8 % par an. Catalogue d'environ 8.000 SKU actifs. Les clients utilisent
rarement les noms officiels des produits.

Environ 120 commandes arrivent chaque jour, par email en texte libre, par PDF joint, par
téléphone et par photo WhatsApp. Trois personnes au desk commandes les retapent à la main
dans l'ERP.

### Ce que le client demande

Extrait de l'appel de cadrage avec leur directeur commercial :

> « Il nous faut un vrai webshop B2B pour que tous nos clients commandent en ligne, plus une
> app mobile parce que tout le monde est sur son téléphone, et de l'IA qui lit les emails
> automatiquement. Notre concurrent a un portail et on a l'air vieux. Le budget est d'environ
> 60.000 EUR et il faut être en ligne dans un mois. »

### Ce qu'on sait déjà

Nous avons passé 75 minutes au téléphone avec eux. Le compte rendu de cet appel est dans
[`FAITS-CLIENT.md`](FAITS-CLIENT.md). **Lis-le avant de commencer.** Il contient des faits,
pas des conclusions.

Tu y trouveras probablement des réponses que tu n'aurais pas pensé à demander, et il te
manquera des choses. Les deux comptent pour la suite.

---

## 2. Ce qu'il y a dans le repository

Tout est déjà branché. Tu ne dois pas perdre une minute de plomberie.

| Chemin | Contenu |
| --- | --- |
| `data/catalog.csv` | 300 SKU, descriptions NL et FR, conditionnement, unité, catégorie |
| `data/lignes-transcrites.json` | Les 8 commandes reçues le 27 août, transcrites telles que les clients les ont écrites |
| `data/inbox/` | Les mêmes commandes dans leur format d'origine : emails, un PDF joint, une photo de note manuscrite |
| `docs/erp-import-spec.md` | La spécification du dossier d'import de l'ERP |
| `scripts/erp-import-simulator.ts` | Un simulateur du job d'import de l'ERP |
| `lib/db/schema.ts` | Clients, produits, historique de commandes sur 6 mois |
| `docs/annexe-plan-exemple.md` | Un plan de build Nightborn complet, sur un autre projet |

Le démarrage tient en une commande, voir le [README](README.md).

**L'extraction n'est pas le sujet de cet exercice.** `data/lignes-transcrites.json` te donne
les lignes déjà transcrites depuis les emails, le PDF et la photo. Pars de là. Les fichiers
d'origine restent disponibles si tu veux les utiliser, mais personne n'attend que tu écrives
un lecteur de PDF ou d'image.

---

## 3. Ce que tu rends

Cinq fichiers dans `rendu/`, dont les squelettes sont déjà en place, plus le code.

### Partie A — Cadrage *(≈ 20 min)* → `rendu/01-cadrage.md`

Trois choses, courtes :

1. **Le vrai problème business**, en deux phrases.
2. **Le seul chiffre que tu veux faire bouger**, et sa valeur approximative aujourd'hui.
3. **Ce que tu ne sais toujours pas** et qui pourrait changer ta recommandation, avec comment
   tu irais le chercher.

Le point 3 compte autant que les deux autres. On cherche une inconnue qui, si elle tombe du
mauvais côté, change ta décision — pas une liste d'accès à demander. Le compte rendu de
l'appel ne répond pas à tout : ce qui te manque encore nous intéresse.

### Partie B — Solution et recommandation *(≈ 20 min)* → `rendu/02-solution.md`

1. Deux ou trois options réellement différentes, y compris l'option de construire très peu.
2. Un coût et un délai approximatifs par option.
3. Ta recommandation, et pourquoi les autres perdent.
4. Ce que tu dirais au directeur commercial, qui a demandé un webshop et une app.

### Partie C — Plan de build *(≈ 40 min)* → `rendu/03-plan-de-build.md`

Au format Nightborn. `docs/annexe-plan-exemple.md` t'en montre un exemplaire complet, sur un
autre client et un autre secteur. Il te montre la structure et le niveau de précision attendu
sur les critères d'acceptation. Ne le recopie pas : son cas n'a rien à voir avec celui-ci, et
dans cet exemple le client avait raison de demander ce qu'il demandait.

**Tes contraintes.** Taux journalier moyen 700 EUR. C'est toi qui décides de la composition de
l'équipe et de la durée de l'engagement, et tu justifies ce choix.

**Ce que le format implique.** Une phase, chez nous, c'est une semaine de l'engagement, pas un
objectif business. Chaque semaine a une allocation de jours par personne et des critères
d'acceptation vérifiables, c'est-à-dire des choses qu'on peut cocher ou non en fin de semaine,
pas des intentions.

**Le plan ne contient que ce qu'on va faire.** Pas de phase hypothétique. Ce que tu écartes a
deux destinations : le **hors périmètre**, avec la raison, et les **extensions possibles** en
fin de plan, chiffrées, avec le moment où on décide.

### Partie D — Une tranche de code, et le harness autour *(≈ 60 min)* → code + `rendu/04-tranche.md`

**C'est la partie qu'on regarde le plus, et ce n'est pas la feature qu'on note.**

Tu vas écrire ce code avec un assistant. Nous aussi. Ce qui nous intéresse n'est pas ce que
l'assistant a produit, c'est **ce que tu as mis autour pour pouvoir lui faire confiance** — et
pour que quelqu'un d'autre puisse lui faire confiance sans relire ton code ligne par ligne.

Construis une tranche qui part de `data/lignes-transcrites.json` et qui va jusqu'à un résultat
observable. Quelle tranche, c'est ton choix : prends celle que tu considères comme la plus
risquée. Elle peut être petite. Elle sera probablement incomplète, c'est prévu.

Puis mets-la sous contrôle. À toi de décider ce que ça veut dire ici, mais les formes qu'on
voit habituellement sont : le contexte que tu donnes à l'assistant et qui vit dans le repo, des
scripts de vérification, des tests appuyés sur une source de vérité, des standards outillés,
une commande unique qui dit si l'état du repo est bon ou non, des procédures que tu as
codifiées pour ne pas les réexpliquer à chaque fois.

**Ce que « terminé » veut dire ici :**

1. **Une seule commande.** Quelqu'un qui clone ton repo lance une commande et sait si ce que tu
   annonces est vrai ou faux. Il n'a pas à te croire sur parole ni à lire ton code.
2. **La vérification s'appuie sur quelque chose de réel.** Une source de vérité du repository,
   pas des assertions que tu as écrites dans le vide pour qu'elles passent.
3. **Rien ne disparaît en silence.** Tout ce que ta tranche n'a pas su traiter reste visible
   dans le résultat, à sa place, et est identifiable par quelqu'un d'autre que toi. Un résultat
   qui a l'air propre parce qu'il a perdu ce qui l'embêtait ne compte pas comme terminé.
4. **Le contexte que tu donnes à l'assistant est dans le repo**, il est spécifique à ce
   repository, et il aurait servi à quelqu'un d'autre que toi.
5. **Tu sais énoncer tes limites** dans `rendu/04-tranche.md` : ce que ta tranche ne gère pas,
   et ce qui casserait si on changeait les données.

Ce qu'on ne demande pas : traiter les 8 commandes, que ce soit joli, une couverture de tests
complète, la performance, la sécurité, l'authentification.

### Partie E — Comment tu as piloté l'assistant *(≈ 10 min)* → `rendu/05-notes-ia.md`

Court et honnête. Quel outil, ce que tu lui as confié, ce que tu as refait à la main, et **au
moins un endroit précis où tu as rejeté ou corrigé ce qu'il proposait, avec pourquoi.**

Si tu n'as utilisé aucun assistant, dis-le et explique ce choix. C'est une réponse valable.

---

## 4. Comment tu rends

1. Depuis le repository qu'on t'a envoyé, clique sur **Use this template** et crée un
   repository **privé** sous ton compte.
2. Invite en collaborateurs les comptes GitHub indiqués dans le mail.
3. Travaille en **commits progressifs**, pas en un seul commit final. L'historique fait partie
   du rendu : il nous montre ton ordre de travail.
4. Quand tu as fini, réponds au mail avec le lien du repository.

Si un point de plomberie te bloque plus de dix minutes — Docker, base de données,
dépendances — note-le dans ton rendu et contourne-le. Ça ne fait pas partie de ce qu'on évalue,
et la façon dont tu contournes nous en dit plus que la façon dont tu t'acharnes.

---

## 5. Ce qui se passe ensuite

Un entretien d'une heure, en visio ou chez nous :

- On choisit nous-mêmes deux ou trois morceaux de ton code et on te demande de les expliquer.
  On prendra probablement ceux qui ont le plus l'air générés.
- On revient sur ton cadrage et sur ce que tu n'as pas demandé.
- On change une contrainte du cas et tu adaptes ton plan à voix haute.

Ce n'est pas un piège : c'est la même conversation qu'on aurait sur un vrai projet, une semaine
après le kick-off.

---

## 6. Ce qu'on évalue, et ce qu'on n'évalue pas

| On regarde | Ce que ça veut dire |
| --- | --- |
| **Cadrage business** | Tu trouves le vrai problème derrière la demande, et tu nommes le chiffre qui compte |
| **Jugement sur la solution** | Tu choisis la chose la moins chère qui fait bouger ce chiffre, et tu défends le fait de ne pas construire le reste |
| **Plan de build** | Les jours tombent juste avec le budget, les critères d'acceptation sont vérifiables, les risques meurent tôt, et ce qui est écarté est écrit |
| **Contrôle de ce que tu produis** | Le code que tu rends est vérifiable par quelqu'un d'autre, et tu sais où il casse |
| **Lucidité** | Tu sais ce que tu ne sais pas, et ce que ton code ne fait pas |

**Non évalué :** connaître notre stack, des algorithmes par cœur, la beauté du code, tout
terminer.
