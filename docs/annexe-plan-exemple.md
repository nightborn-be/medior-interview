# Annexe. Exemple de plan de build

Vrai plan, autre client, autre secteur. Il te montre la structure et le niveau de précision
attendu sur les critères d'acceptation. **Ne le copie pas ligne par ligne : le cas Steenland
n'a rien à voir, et dans cet exemple le client avait raison de demander ce qu'il demandait.**

*English version: [`build-plan-example.en.md`](build-plan-example.en.md).*

---

# Plan de build v1, Rappels de rendez-vous

| | |
| --- | --- |
| **Préparé pour** | Groupe de 6 cabinets de kinésithérapie |
| **Préparé par** | Nightborn |
| **Version** | v1 |
| **Engagement** | 4 semaines, ≈ 12 jours-homme, budget 8.400 EUR |
| **Équipe** | 1 team lead, 1 tech lead, 1 dev |

## 1. Approche

28 praticiens, 900 rendez-vous par semaine, 11 % de no-show. Un créneau perdu vaut 45 EUR et
ne se rattrape pas, soit environ 220.000 EUR de créneaux perdus par an. Chaque point de
no-show récupéré vaut environ 21.000 EUR par an.

V1 low cash centrée sur la cause la plus simple, l'oubli : rappel SMS et email à J-2 et J-1,
journal d'envoi consultable par le secrétariat, et une seule métrique suivie, le taux de
no-show hebdomadaire contre baseline. Objectif de la V1 : faire passer le no-show de 11 % à
7 %, soit environ 84.000 EUR par an pour 8.400 EUR de build.

Hors périmètre de cette version, et pourquoi : pas d'app patient (le SMS suffit et une app
demande une adoption qu'on n'a aucune raison d'attendre), pas de WhatsApp (la validation Meta
prend plus de temps que le projet entier), pas de refonte de l'agenda (c'est le système de
production du client, on le lit, on n'y touche pas), pas de pénalité financière sur no-show
répété (décision commerciale du client, pas un sujet technique).

Répartition des rôles (total 12 j : dev 6 j, tech lead 3 j, team lead 3 j) :

- **Dev (6 j)** : moteur d'envoi, désabonnement, journal, tableau de bord.
- **Tech lead (3 j)** : setup et CI/CD, accès agenda, extraction et comptage des numéros,
  instrumentation, PR review, hand-over.
- **Team lead (3 j)** : cadrage, coordination client, contrat opérateur, démos, QA, clôture.

## 2. Hypothèses

1. **Budget 8.400 EUR (≈ 12 j-h)** : rappels seuls. La confirmation en un clic et la liste
   d'attente sont des extensions, à décider après la semaine 3.
2. **Numéros de portable présents sur au moins 80 % des dossiers.** Vérifié en jour 1. Sous
   60 %, on arrête et on recadre avec le client.
3. **Agenda lisible en lecture seule** via l'API du logiciel existant ou un export. Aucune
   écriture.
4. **FR et NL uniquement.**

## 3. Approche technique

- Nouvelle app dans la stack existante : Next.js + Node.
- Lecture de l'agenda en read-only, aucune écriture dans le système de production.
- Envoi via un opérateur SMS avec fallback email si le patient a une adresse.
- Désabonnement obligatoire dans chaque message, table de suppression respectée à l'envoi.
- Instrumentation dès le jour 1 : chaque rendez-vous porte son statut final (honoré, annulé à
  l'avance, no-show) et l'historique des rappels envoyés. Sans ça on ne saura pas si ça marche.
- Tableau de bord minimal : une métrique principale, trois secondaires (délivrance,
  désabonnements, délai entre rappel et annulation).

## 4. Risques et questions ouvertes

1. **Couverture des numéros de portable.** Chemin critique : sans numéros, le projet n'a pas
   d'objet. Mitigation : extraction et comptage en jour 1, avant d'écrire une ligne du moteur
   d'envoi.
2. **Coût d'envoi contre retour.** 900 rendez-vous par semaine, deux messages chacun. Chemin
   critique : sans contrat opérateur, pas d'envoi réel au pilote en semaine 2. Mitigation :
   contrat chiffré et signé en semaine 1, email en canal premier quand l'adresse existe.
3. **Consentement et RGPD.** Base légale de l'envoi et gestion du désabonnement, à cadrer avec
   le client en semaine 1.
4. **Horaire d'envoi.** Un rappel à 8h00 et un rappel à 20h00 ne produisent pas le même effet.
   Inconnu, à ajuster en semaine 4 sur les premières données.
5. **Instrumentation tardive.** Sans les statuts finaux des rendez-vous, la baseline de la
   semaine 3 n'existe pas et on ne pourra rien prouver. Mitigation : instrumentation en
   semaine 2 au plus tard.

## 5. Planning

### Semaine 1 : accès, données et setup *(1 j team lead, 1 j tech lead)*

- **[Tech lead]** Setup projet et CI/CD, accès agenda validé par une requête de test,
  extraction et comptage des numéros de portable, définition de l'instrumentation *(1 j)*.
- **[Team lead]** Cadrage avec le client, contrat opérateur SMS, base légale et
  désabonnement, découpage des tâches *(1 j)*.

**Critères d'acceptation :**

1. Le taux de couverture des numéros de portable est chiffré et communiqué au client.
2. L'agenda est lisible : une requête de test remonte les rendez-vous des 7 prochains jours.
3. Le contrat opérateur est signé et le coût par message connu.
4. Le setup production et la CI/CD sont en place.
5. Les tâches des semaines 2 et 3 sont créées.

### Semaine 2 : moteur d'envoi, un cabinet pilote *(3 j dev, 0,5 j tech lead, 0,5 j team lead)*

- **[Dev]** Moteur d'envoi J-2 et J-1, gestion du désabonnement, journal d'envoi *(3 j)*.
- **[Tech lead]** Support du build, PR review, instrumentation du statut des rendez-vous
  *(0,5 j)*.
- **[Team lead]** Démo, coordination du pilote avec le cabinet volontaire *(0,5 j)*.

**Critères d'acceptation :**

1. Un rappel réel est parti sur les rendez-vous du lendemain d'un seul cabinet.
2. Le secrétariat peut consulter le journal d'envoi et y voir chaque message envoyé, son canal
   et son statut de délivrance.
3. Un patient qui se désabonne ne reçoit plus rien, vérifié sur un cas réel.
4. Chaque rendez-vous des 7 derniers jours porte un statut final exploitable.

### Semaine 3 : généralisation et tableau de bord *(2 j dev, 0,5 j tech lead, 0,5 j team lead)*

- **[Dev]** Généralisation aux 6 cabinets, tableau de bord (métrique principale et
  secondaires) *(2 j)*.
- **[Tech lead]** Revue, vérification de la baseline sur les 8 semaines précédentes *(0,5 j)*.
- **[Team lead]** Démo, décision go/no-go sur les extensions avec le client *(0,5 j)*.

**Critères d'acceptation :**

1. Les 6 cabinets envoient des rappels en production.
2. Le tableau de bord affiche le no-show hebdomadaire contre la baseline des 8 semaines avant
   mise en production.
3. La baseline est calculée et validée par le client.
4. La décision sur les extensions est prise et actée.

### Semaine 4 : QA, ajustement et hand-over *(1 j dev, 1 j team lead)*

- **[Dev]** Correctifs et intégration des retours du secrétariat *(1 j)*.
- **[Team lead]** QA du parcours complet, ajustement des horaires d'envoi sur les premières
  données, hand-over (documentation, accès, passation), clôture *(1 j)*.

**Critères d'acceptation :**

1. QA du parcours complet réalisée, aucun bug bloquant ouvert.
2. Les retours du secrétariat sont intégrés.
3. Hand-over complet : documentation, accès, passation.
4. Le client peut lire seul le tableau de bord et sait quel chiffre regarder.

*Total ≈ 12 j-h : dev 6 j, tech lead 3 j, team lead 3 j.*

## 6. Extensions possibles

À décider après la semaine 3, sur base du no-show observé :

- **Confirmation et annulation en un clic depuis le rappel** (≈ 8 j, +5.600 EUR) : transforme
  un no-show en annulation anticipée. Pertinent si le no-show résiduel vient de patients qui
  savent qu'ils ne viendront pas.
- **Liste d'attente qui remplit automatiquement un créneau libéré** (≈ 10 j, +7.000 EUR) : ne
  se justifie que s'il y a des annulations anticipées à remplir, donc après l'extension
  précédente.
- **Envoi WhatsApp** (≈ 5 j, +3.500 EUR) : dépend de la validation Meta, hors des délais de
  cette V1.
