# Compte rendu de l'appel de cadrage

Steenland Foodservice, 2026-08-25, 45 minutes
Présents côté client : le directeur, la responsable du desk commandes.
Notes prises par l'équipe Nightborn.

Ce document rassemble ce que le client a répondu à nos questions. Il ne contient aucune
interprétation et aucune recommandation.

**L'appel a été écourté, le directeur devait partir.** Nous n'avons pas couvert tout ce que
nous voulions. Ce qui ne figure pas ici n'a pas été abordé.

*English version: [`en/CLIENT-FACTS.md`](../en/CLIENT-FACTS.md).*

---

## Systèmes existants

**Comment l'ERP s'intègre-t-il ?**
Système on-prem de 2009. Pas d'API. Deux surfaces d'intégration : un dossier surveillé où on
dépose des CSV, avalés par un job d'import, et une vue SQL en lecture seule sur le stock et
les clients.

**Peut-on écrire directement dans la base de l'ERP ?**
Non. La vue SQL est en lecture seule. Le dossier de dépôt est la seule voie d'écriture.

## Le desk commandes

**Dans les 4 minutes par commande, qu'est-ce qui prend le temps ?**
La responsable du desk dirait : chercher la bonne référence. Les clients écrivent
« bloem type 55 » et il y a trois conditionnements. Personne ne l'a chronométré.

**Que se passe-t-il quand une commande manque le cut-off ?**
Elle part le lendemain. Le client appelle, le desk s'excuse, parfois on fait une course
express à nos frais, environ 90 EUR.

**Quelle part des emails est vraiment lisible automatiquement ?**
Aucune idée, on n'a jamais regardé. On peut vous exporter la boîte `orders@` sur 6 mois.

## Les clients

**Avez-vous déjà tenté un portail client ?**
Deux fois. 2019 et 2022. Les deux sont morts sous 10 % d'adoption. Les clients sont revenus
à l'email.

**Pourquoi l'adoption a-t-elle échoué ?**
La plupart de nos clients sont des patrons boulangers de plus de 50 ans. Ils envoient la
commande à 22h00 depuis leur téléphone en trois lignes et ils ne vont pas apprendre un
catalogue de 8.000 références.

## Le projet

**D'où vient l'échéance d'un mois ?**
De nulle part de particulier, le directeur veut que ce soit fait dans un mois. Rien n'est
engagé auprès de qui que ce soit, aucune échéance externe.

**Le budget de 60.000 EUR couvre quoi exactement ?**
C'est ce que le conseil a mis de côté pour le projet entier, sur l'année. Personne n'a dit
qu'il fallait tout dépenser en un mois.

**L'app mobile est-elle négociable ?**
Si vous nous montrez quelque chose qui marche, probablement. Personne chez nous n'a demandé
d'app à part le directeur.

**Qui valide ?**
Le directeur veut le portail. La responsable du desk et le responsable des opérations portent
la douleur.
