# Appendix. Build plan example

Real plan, different client, different sector. It shows you the structure and the level of
precision we expect on acceptance criteria. **Do not copy it line by line: the Steenland case
has nothing to do with it, and in this example the client was right to ask for what they asked
for.**

*English translation of `annexe-plan-exemple.md`.*

---

# Build plan v1, Appointment reminders

| | |
| --- | --- |
| **Prepared for** | Group of 6 physiotherapy practices |
| **Prepared by** | Nightborn |
| **Version** | v1 |
| **Engagement** | 4 weeks, ≈ 12 person-days, budget 8,400 EUR |
| **Team** | 1 team lead, 1 tech lead, 1 dev |

## 1. Approach

28 practitioners, 900 appointments a week, 11 % no-show. A lost slot is worth 45 EUR and is
never recovered, which is around 220,000 EUR of lost slots per year. Every point of no-show
recovered is worth around 21,000 EUR a year.

Low cash V1 focused on the simplest cause, forgetting: SMS and email reminder at D-2 and D-1, a
send log the front desk can consult, and a single metric tracked, the weekly no-show rate
against baseline. Objective of the V1: take no-show from 11 % to 7 %, which is around 84,000 EUR
a year for 8,400 EUR of build.

Out of scope for this version, and why: no patient app (SMS is enough and an app requires an
adoption we have no reason to expect), no WhatsApp (Meta validation takes longer than the whole
project), no rework of the calendar (it is the client's production system, we read it, we do not
touch it), no financial penalty for repeated no-shows (a commercial decision for the client, not
a technical subject).

Split of roles (total 12 d: dev 6 d, tech lead 3 d, team lead 3 d):

- **Dev (6 d)**: sending engine, opt-out, log, dashboard.
- **Tech lead (3 d)**: project setup and CI/CD, calendar access, extraction and counting of
  phone numbers, instrumentation, PR review, hand-over.
- **Team lead (3 d)**: scoping, client coordination, carrier contract, demos, QA, closing.

## 2. Assumptions

1. **Budget 8,400 EUR (≈ 12 person-days)**: reminders only. One-click confirmation and the
   waiting list are extensions, to be decided after week 3.
2. **Mobile numbers present on at least 80 % of records.** Verified on day 1. Below 60 %, we
   stop and rescope with the client.
3. **Calendar readable in read-only** through the existing software's API or an export. No
   writing.
4. **French and Dutch only.**

## 3. Technical approach

- New app in the existing stack: Next.js + Node.
- Calendar read read-only, no write into the production system.
- Sending through an SMS carrier with email fallback when the patient has an address.
- Mandatory opt-out in every message, suppression table respected at send time.
- Instrumentation from day 1: every appointment carries its final status (attended, cancelled in
  advance, no-show) and the history of reminders sent. Without that we will not know whether it
  works.
- Minimal dashboard: one primary metric, three secondary ones (delivery, opt-outs, delay between
  reminder and cancellation).

## 4. Risks and open questions

1. **Mobile number coverage.** Critical path: with no numbers, the project has no object.
   Mitigation: extraction and counting on day 1, before writing a line of the sending engine.
2. **Sending cost against return.** 900 appointments a week, two messages each. Critical path:
   without a carrier contract, no real sending to the pilot in week 2. Mitigation: contract
   costed and signed in week 1, email as first channel whenever an address exists.
3. **Consent and GDPR.** Legal basis for sending and opt-out handling, to be scoped with the
   client in week 1.
4. **Sending time.** A reminder at 08:00 and one at 20:00 do not produce the same effect.
   Unknown, to be adjusted in week 4 on the first data.
5. **Late instrumentation.** Without final appointment statuses, the week 3 baseline does not
   exist and we will not be able to prove anything. Mitigation: instrumentation in week 2 at the
   latest.

## 5. Planning

### Week 1: access, data and setup *(1 d team lead, 1 d tech lead)*

- **[Tech lead]** Project setup and CI/CD, calendar access validated by a test query, extraction
  and counting of mobile numbers, instrumentation defined *(1 d)*.
- **[Team lead]** Scoping with the client, SMS carrier contract, legal basis and opt-out, task
  breakdown *(1 d)*.

**Acceptance criteria:**

1. The mobile number coverage rate is costed and communicated to the client.
2. The calendar is readable: a test query returns the appointments of the next 7 days.
3. The carrier contract is signed and the cost per message is known.
4. Production setup and CI/CD are in place.
5. The tasks for weeks 2 and 3 are created.

### Week 2: sending engine, one pilot practice *(3 d dev, 0.5 d tech lead, 0.5 d team lead)*

- **[Dev]** D-2 and D-1 sending engine, opt-out handling, send log *(3 d)*.
- **[Tech lead]** Build support, PR review, instrumentation of appointment status *(0.5 d)*.
- **[Team lead]** Demo, pilot coordination with the volunteer practice *(0.5 d)*.

**Acceptance criteria:**

1. A real reminder went out on the next day's appointments for one single practice.
2. The front desk can consult the send log and see every message sent, its channel and its
   delivery status.
3. A patient who opts out receives nothing further, verified on a real case.
4. Every appointment from the last 7 days carries a usable final status.

### Week 3: rollout and dashboard *(2 d dev, 0.5 d tech lead, 0.5 d team lead)*

- **[Dev]** Rollout to the 6 practices, dashboard (primary and secondary metrics) *(2 d)*.
- **[Tech lead]** Review, baseline verification over the 8 preceding weeks *(0.5 d)*.
- **[Team lead]** Demo, go/no-go decision on extensions with the client *(0.5 d)*.

**Acceptance criteria:**

1. The 6 practices are sending reminders in production.
2. The dashboard shows weekly no-show against the baseline of the 8 weeks before go-live.
3. The baseline is calculated and validated by the client.
4. The decision on extensions is taken and recorded.

### Week 4: QA, adjustment and hand-over *(1 d dev, 1 d team lead)*

- **[Dev]** Fixes and integration of front desk feedback *(1 d)*.
- **[Team lead]** QA of the full journey, adjustment of sending times on the first data,
  hand-over (documentation, access, handover), closing *(1 d)*.

**Acceptance criteria:**

1. QA of the full journey done, no blocking bug open.
2. Front desk feedback is integrated.
3. Hand-over complete: documentation, access, handover.
4. The client can read the dashboard alone and knows which number to look at.

*Total ≈ 12 person-days: dev 6 d, tech lead 3 d, team lead 3 d.*

## 6. Possible extensions

To be decided after week 3, based on the observed no-show:

- **One-click confirmation and cancellation from the reminder** (≈ 8 d, +5,600 EUR): turns a
  no-show into an early cancellation. Relevant if the residual no-show comes from patients who
  know they will not come.
- **Waiting list that automatically fills a freed slot** (≈ 10 d, +7,000 EUR): only justified if
  there are early cancellations to fill, so after the previous extension.
- **WhatsApp sending** (≈ 5 d, +3,500 EUR): depends on Meta validation, outside the timeline of
  this V1.
