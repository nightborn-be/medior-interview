# Spécification du dossier d'import de commandes

Document interne, Steenland Foodservice NV
Service informatique
Référence : SPEC-ERP-IMP-014
Version 1.3

| Version | Date | Auteur | Objet |
| --- | --- | --- | --- |
| 1.0 | 12/11/2009 | J. Baeten | Rédaction initiale |
| 1.1 | 03/02/2010 | J. Baeten | Précision sur l'encodage et les fins de ligne |
| 1.2 | 17/06/2011 | J. Baeten | Ajout du dossier de rejet et du journal |
| 1.3 | 05/03/2014 | M. Ceulemans | Précision sur la fréquence du job |

---

## 1. Objet

Le présent document décrit le format des fichiers déposés dans le dossier d'import
de commandes de l'ERP, ainsi que le comportement du job qui les traite. Il s'adresse
aux personnes et aux applications qui alimentent ce dossier.

L'ERP ne dispose d'aucune interface applicative. Le dépôt de fichiers dans le dossier
décrit ci-dessous est la seule voie d'entrée supportée pour la création de commandes.

## 2. Dossier de dépôt

Le job d'import surveille un dossier de dépôt unique. Le chemin de ce dossier est un
paramètre de configuration du job (`IMPORT_DROP_PATH`). Il est fixé à l'installation
et peut être modifié par l'administrateur système.

Deux dossiers complémentaires sont utilisés par le job :

- `IMPORT_PROCESSED_PATH` : les fichiers acceptés y sont déplacés après traitement.
- `IMPORT_REJECTED_PATH` : les fichiers refusés y sont déplacés, accompagnés de leur
  journal de rejet.

Le job ne supprime jamais un fichier. Il le déplace.

## 3. Nommage des fichiers

- Extension : `.csv`, en minuscules.
- Le nom ne contient ni espace ni caractère accentué.
- Un fichier déjà présent dans le dossier `processed` ou `rejected` sous le même nom
  n'est pas écrasé : le job ajoute un suffixe numérique.

## 4. Format du fichier

| Élément | Valeur attendue |
| --- | --- |
| Encodage | Windows-1252, sans BOM. Le contenu se limite en pratique aux caractères ASCII imprimables. |
| Fin de ligne | CRLF (`\r\n`) |
| Séparateur de champs | Point-virgule (`;`) |
| Guillemets | Non supportés. Un champ ne peut contenir ni `;` ni guillemet. |
| Ligne d'en-tête | Obligatoire, en première ligne |
| Nombre de colonnes | 4, dans l'ordre imposé |
| Nombre de lignes de données | 1 minimum, 5000 maximum |
| Ligne vide | Refusée, à l'exception d'une éventuelle fin de fichier après le dernier CRLF |

La ligne d'en-tête doit être exactement :

```
customer_code;sku_code;quantity;requested_delivery_date
```

## 5. Colonnes

### 5.1 `customer_code`

Code du client dans l'ERP. Six caractères : la lettre `K` en majuscule suivie de cinq
chiffres. Exemple : `K10014`.

Un code qui ne correspond à aucun client actif rend la ligne invalide.

### 5.2 `sku_code`

Code article dans l'ERP. Six chiffres, sans préfixe ni espace. Exemple : `257764`.

Un code article inconnu rend la ligne invalide. Le job ne crée jamais d'article.

### 5.3 `quantity`

Quantité commandée, exprimée dans l'unité de vente de l'article.

- Séparateur décimal : le point (`.`). La virgule est refusée.
- Trois décimales au maximum. Les décimales ne sont pas obligatoires.
- Valeur strictement supérieure à zéro et inférieure ou égale à 9999.999.
- Pas de séparateur de milliers, pas de signe, pas d'espace.

Exemples acceptés : `4`, `2.5`, `0.750`, `120`.
Exemples refusés : `2,5`, `+4`, `1 000`, `0`, `-3`, `2.5000`.

### 5.4 `requested_delivery_date`

Date de livraison souhaitée, au format `YYYY-MM-DD`. La date doit exister au calendrier.
Aucun autre format n'est accepté, y compris `DD/MM/YYYY`.

## 6. Exemple de fichier valide

```
customer_code;sku_code;quantity;requested_delivery_date
K10014;257764;2;2026-09-01
K10014;615441;1;2026-09-01
K10027;839108;3.500;2026-09-02
```

## 7. Traitement

Le job traite un fichier en deux temps.

1. **Validation.** Le fichier entier est validé avant toute écriture. La ligne d'en-tête,
   le nombre de colonnes de chaque ligne, et chacune des quatre valeurs sont contrôlés.
2. **Écriture.** Si et seulement si toutes les lignes sont valides, les lignes sont
   écrites dans l'ERP et le fichier est déplacé dans le dossier `processed`.

**Une seule ligne invalide entraîne le rejet du fichier entier.** Aucune ligne n'est
importée. Il n'existe pas d'import partiel. Le fichier est déplacé dans le dossier
`rejected` et un journal portant le même nom, suffixé `.log`, est écrit à côté de lui.
Le journal indique le numéro de chaque ligne fautive et la raison du refus.

Un fichier rejeté n'est pas repris automatiquement. Il doit être corrigé et redéposé.

## 8. Fréquence

Le job d'import est planifié une fois par nuit, à 23h00.

La fréquence est un paramètre du job (`IMPORT_SCHEDULE`, exprimé au format cron). Elle
est modifiable par l'administrateur système.

## 9. Limites connues

- Le job ne renvoie aucun accusé de réception à l'émetteur du fichier.
- Le job ne détecte pas les doublons : deux fichiers contenant les mêmes lignes créent
  deux fois les mêmes lignes de commande.
- Le job ne gère pas les annulations. Une commande erronée déjà importée se corrige
  dans l'ERP.
