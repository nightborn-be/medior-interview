# Order import folder specification

Internal document, Steenland Foodservice NV
IT department
Reference: SPEC-ERP-IMP-014
Version 1.3

*English translation of `erp-import-spec.md`. In case of doubt, the French original prevails.*

| Version | Date | Author | Subject |
| --- | --- | --- | --- |
| 1.0 | 12/11/2009 | J. Baeten | Initial version |
| 1.1 | 03/02/2010 | J. Baeten | Clarification on encoding and line endings |
| 1.2 | 17/06/2011 | J. Baeten | Rejection folder and log added |
| 1.3 | 05/03/2014 | M. Ceulemans | Clarification on job frequency |

---

## 1. Purpose

This document describes the format of the files dropped into the ERP order import folder, and
the behaviour of the job that processes them. It is intended for the people and applications
that feed this folder.

The ERP has no application interface. Dropping files into the folder described below is the only
supported way in for creating orders.

## 2. Drop folder

The import job watches a single drop folder. The path of that folder is a configuration
parameter of the job (`IMPORT_DROP_PATH`). It is set at installation time and can be changed by
the system administrator.

Two further folders are used by the job:

- `IMPORT_PROCESSED_PATH`: accepted files are moved here after processing.
- `IMPORT_REJECTED_PATH`: rejected files are moved here, together with their rejection log.

The job never deletes a file. It moves it.

## 3. File naming

- Extension: `.csv`, lowercase.
- The name contains no space and no accented character.
- A file already present in the `processed` or `rejected` folder under the same name is not
  overwritten: the job appends a numeric suffix.

## 4. File format

| Element | Expected value |
| --- | --- |
| Encoding | Windows-1252, no BOM. In practice the content is limited to printable ASCII characters. |
| Line ending | CRLF (`\r\n`) |
| Field separator | Semicolon (`;`) |
| Quotes | Not supported. A field can contain neither `;` nor a quote character. |
| Header line | Mandatory, first line |
| Number of columns | 4, in the imposed order |
| Number of data lines | 1 minimum, 5000 maximum |
| Empty line | Rejected, except for a possible end of file after the last CRLF |

The header line must be exactly:

```
customer_code;sku_code;quantity;requested_delivery_date
```

## 5. Columns

### 5.1 `customer_code`

Customer code in the ERP. Six characters: an uppercase `K` followed by five digits. Example:
`K10014`.

A code matching no active customer makes the line invalid.

### 5.2 `sku_code`

Article code in the ERP. Six digits, no prefix and no space. Example: `257764`.

An unknown article code makes the line invalid. The job never creates an article.

### 5.3 `quantity`

Quantity ordered, expressed in the article's selling unit.

- Decimal separator: the dot (`.`). The comma is rejected.
- Three decimal places at most. Decimals are not mandatory.
- Value strictly greater than zero and less than or equal to 9999.999.
- No thousands separator, no sign, no space.

Accepted examples: `4`, `2.5`, `0.750`, `120`.
Rejected examples: `2,5`, `+4`, `1 000`, `0`, `-3`, `2.5000`.

### 5.4 `requested_delivery_date`

Requested delivery date, in `YYYY-MM-DD` format. The date must exist in the calendar. No other
format is accepted, including `DD/MM/YYYY`.

## 6. Example of a valid file

```
customer_code;sku_code;quantity;requested_delivery_date
K10014;257764;2;2026-09-01
K10014;615441;1;2026-09-01
K10027;839108;3.500;2026-09-02
```

## 7. Processing

The job processes a file in two stages.

1. **Validation.** The whole file is validated before anything is written. The header line, the
   number of columns on each line, and each of the four values are checked.
2. **Writing.** If and only if every line is valid, the lines are written into the ERP and the
   file is moved to the `processed` folder.

**A single invalid line causes the whole file to be rejected.** No line is imported. There is no
such thing as a partial import. The file is moved to the `rejected` folder and a log carrying
the same name, suffixed `.log`, is written next to it. The log gives the number of each faulty
line and the reason for the refusal.

A rejected file is not retried automatically. It must be corrected and dropped again.

## 8. Frequency

The import job is scheduled once a night, at 23:00.

The frequency is a parameter of the job (`IMPORT_SCHEDULE`, expressed in cron format). It can be
changed by the system administrator.

## 9. Known limitations

- The job sends no acknowledgement back to whoever submitted the file.
- The job does not detect duplicates: two files containing the same lines create the same order
  lines twice.
- The job does not handle cancellations. An incorrect order already imported is corrected inside
  the ERP.
