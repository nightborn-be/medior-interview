# Compte rendu de l'appel de cadrage

Steenland Foodservice — 2026-08-25, 75 minutes
Présents côté client : le directeur, la responsable du desk commandes, le responsable des opérations.
Notes prises par l'équipe Nightborn.

Ce document rassemble ce que le client a répondu à nos questions. Il ne contient aucune
interprétation et aucune recommandation.

---

## Systèmes existants

**Comment l'ERP s'intègre-t-il ?**
Système on-prem de 2009. Pas d'API. Deux surfaces d'intégration : un dossier surveillé
où on dépose des CSV, avalés par un job d'import, et une vue SQL en lecture seule sur le
stock et les clients.

**À quelle fréquence le job d'import tourne-t-il ?**
Une fois par nuit, à 23h00. La fréquence est un paramètre du job, le contractant peut la
changer, mais il faut le faire venir.

**Qui peut intervenir sur l'ERP côté client ?**
Un contractant IT externe. Disponible deux demi-journées par mois, complet trois semaines
à l'avance.

**Peut-on écrire directement dans la base de l'ERP ?**
Non. La vue SQL est en lecture seule. Le dossier de dépôt est la seule voie d'écriture.

## Le desk commandes

**Combien de commandes, par quel canal ?**
Environ 120 par jour. Email en texte libre vers `orders@` (~60 %), PDF ou formulaire scanné
en pièce jointe (~15 %), téléphone (~20 %), photos WhatsApp de notes manuscrites (~5 %).

**Combien de temps par commande ?**
Trois personnes au desk. Environ 4 minutes par commande en moyenne, soit à peu près
6 heures de travail par jour au total.

**Dans ces 4 minutes, qu'est-ce qui prend le temps ?**
La responsable du desk dirait : chercher la bonne référence. Les clients écrivent
« bloem type 55 » et il y a trois conditionnements. Personne ne l'a chronométré.

**Que se passe-t-il quand une commande manque le cut-off ?**
Le cut-off pour une livraison le lendemain est 17h00. Les commandes qui arrivent après
15h30 le manquent souvent parce que le desk est saturé. Environ 15 commandes par jour
partent un jour plus tard. Le client appelle, le desk s'excuse, parfois on fait une course
express à nos frais, environ 90 EUR.

**Qui traite les lignes fausses, et combien ça coûte ?**
Environ 5 % des commandes arrivent à l'entrepôt avec au moins une ligne fausse : mauvais
SKU, mauvaise quantité ou mauvais conditionnement. Le desk commandes traite, plus une
correction de picking à l'entrepôt. Environ 40 EUR par erreur, à notre charge, jamais
refacturés.

**Que mesurez-vous aujourd'hui ?**
Rien de systématique. La responsable du desk sent si l'après-midi a été dure. Les plaintes
sont comptées dans un dossier de la boîte mail.

**Quelle part des emails est vraiment lisible automatiquement ?**
Aucune idée, on n'a jamais regardé. On peut vous exporter la boîte `orders@` sur 6 mois.

## L'entrepôt

**L'entrepôt peut-il absorber des commandes qui arriveraient plus tôt ?**
Le picking démarre à 16h00 et la vague se clôture à 17h00. Tout ce qui est posé dans l'ERP
avant 17h00 part bien le lendemain. L'entrepôt n'est pas le goulot.

## Les clients

**À quoi ressemble le mix de commandes ?**
Environ 25 clients représentent 40 % du volume, et ils commandent presque le même panier
chaque semaine.

**Avez-vous déjà tenté un portail client ?**
Deux fois. 2019 et 2022. Les deux sont morts sous 10 % d'adoption. Les clients sont revenus
à l'email.

**Pourquoi l'adoption a-t-elle échoué ?**
La plupart de nos clients sont des patrons boulangers de plus de 50 ans. Ils envoient la
commande à 22h00 depuis leur téléphone en trois lignes et ils ne vont pas apprendre un
catalogue de 8.000 références.

## Le projet

**D'où vient la deadline d'un mois ?**
De nulle part de particulier, le directeur veut que ce soit fait dans un mois. Rien n'est
engagé auprès de qui que ce soit, aucune échéance externe.

**Le budget de 60.000 EUR couvre quoi exactement ?**
C'est ce que le conseil a mis de côté pour le projet entier, sur l'année. Personne n'a dit
qu'il fallait tout dépenser en un mois.

**L'app mobile est-elle négociable ?**
Si vous nous montrez quelque chose qui marche, probablement. Personne chez nous n'a demandé
d'app à part le directeur.

**Qui valide ?**
Le directeur veut le portail. La responsable du desk et le responsable des opérations
portent la douleur.

**Qui est disponible de votre côté pendant le projet ?**
La responsable du desk peut vous donner deux heures par semaine, pas plus, elle est sur le
pont l'après-midi.
