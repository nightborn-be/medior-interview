# Steenland Foodservice case

Nightborn medior developer exercise, to be done at home.

*Version française : [`fr/ENONCE.md`](../fr/ENONCE.md). Answer in whichever language you prefer.*

| | |
| --- | --- |
| **Expected effort** | about 3 hours |
| **Deadline** | 7 calendar days from the moment you receive this document |
| **Tools** | anything, including AI assistants, except for part F. How you use them is part of what we look at |
| **What you hand in** | a private GitHub repository you invite us to |

**If you go past 3.5 hours, stop and write down where you were.** Knowing when to stop, and
saying what is left, is part of the exercise. An incomplete and clear-eyed submission beats a
complete and vague one.

---

## 1. Context

Steenland Foodservice is a Belgian wholesaler supplying dry groceries and frozen goods to
around 400 independent customers: bakeries, sandwich shops, small hotels and canteens. Family
business, 45 employees, around 22M EUR in revenue, profitable, growing about 8 % a year.
Around 8,000 active SKUs in the catalogue. Customers rarely use the official product names.

About 120 orders come in every day through four channels: free-text email to `orders@` (around
60 %), PDF or scanned form as an attachment (15 %), phone (20 %), WhatsApp photos of
handwritten notes (5 %).

Three people on the order desk retype every order into the ERP. They average 4 minutes per
order, which adds up to roughly 6 hours of work a day.

### Where it hurts

- The cut-off for next-day delivery is 17:00. Orders arriving after 15:30 often miss it
  because the desk is saturated. About 15 orders a day miss the cut-off and ship a day late.
- About 5 % of orders reach the warehouse with at least one wrong line: wrong SKU, wrong
  quantity or wrong packaging. Each mistake costs them around 40 EUR in return logistics,
  credit note handling and phone calls.
- Two customers left last year citing delivery delays.

### What the client is asking for

From the scoping call with their commercial director:

> "We need a proper B2B webshop so all our customers order online, plus a mobile app because
> everyone is on their phone, and AI that reads the emails automatically. Our competitor has a
> portal and we look old. The budget is around 60,000 EUR and we need to be live within a
> month."

### What we already know

We had 45 minutes on the phone with them, and the call was cut short. The notes are in
[`CLIENT-FACTS.md`](CLIENT-FACTS.md). **Read it before you start.** It contains facts, not
conclusions.

It is incomplete, and deliberately so. Some of what is missing is elsewhere in the repository,
some of it exists nowhere and can only be asked of the client. Knowing which category each gap
falls into is part of the exercise.

---

## 2. What is in the repository

Everything is already set up. You have nothing to install or configure.

| Path | Contents |
| --- | --- |
| `data/catalog.csv` | 300 SKUs, Dutch and French descriptions, packaging, unit, category |
| `data/lignes-transcrites.json` | The 8 orders received on 27 August, transcribed exactly as the customers wrote them |
| `data/inbox/` | The same orders in their original format: emails, one attached PDF, one photo of a handwritten note |
| `en/erp-import-spec.md` | The specification of the ERP import folder |
| `scripts/erp-import-simulator.ts` | A simulator of the ERP import job |
| `lib/db/schema.ts` | Customers, products, 6 months of order history |
| `en/build-plan-example.md` | A complete Nightborn build plan, from a different project |

Getting started is a single command, see the [README](../README.md).

**A note on the data files.** The product catalogue is in Dutch and French because that is what
the customers write, and that is the actual difficulty of the case. It is not translated. The
same goes for `data/lignes-transcrites.json`, whose field names are French: `commandes` are the
orders, `lignes` the order lines, `client` the customer name, `langue` the language,
`fichier_source` the original file and `mention_livraison` any delivery date the customer
mentioned.

**Extraction is not the subject of this exercise.** `data/lignes-transcrites.json` gives you the
lines already transcribed from the emails, the PDF and the photo. Start there. The original
files are still available if you want them, but nobody expects you to write a PDF or image
reader.

---

## 3. What you hand in

Six files in `en/answers/`, whose skeletons are already in place, plus the code.

### Part A. Framing *(≈ 20 min)* → `en/answers/01-framing.md`

Three things, short:

1. **The real business problem**, in two sentences.
2. **The single number you want to move**, and roughly what it is today.
3. **What you still do not know** that could change your recommendation, and how you would go
   and find out.

Point 3 counts as much as the other two. We are looking for an unknown that changes your
decision if it lands the wrong way, not a list of accesses to request. The call notes do not
answer everything: what is still missing is what interests us.

### Part B. Solution and recommendation *(≈ 20 min)* → `en/answers/02-solution.md`

1. Two or three genuinely different options, including the option of building very little.
2. A rough cost and timeline for each.
3. Your recommendation, and why the others lose.
4. What you would say to the commercial director, who asked for a webshop and an app.

### Part C. Build plan *(≈ 40 min)* → `en/answers/03-build-plan.md`

In the Nightborn format. `en/build-plan-example.md` shows you a complete one, for a
different client in a different sector. It shows you the structure and the level of precision
we expect on acceptance criteria. Do not copy it line by line: that case has nothing to do with
this one, and in that example the client was right to ask for what they asked for.

**Your constraints.** Average day rate 700 EUR. You decide the team composition and the length
of the engagement, and you justify that choice.

**What the format implies.** A phase, for us, is one week of the engagement, not a business
objective. Every week has an allocation of days per person and verifiable acceptance criteria,
meaning things someone can tick or not tick at the end of the week, not intentions.

**The plan only contains what we are going to do.** No hypothetical phase. What you rule out has
two destinations: **out of scope**, with the reason, and **possible extensions** at the end of
the plan, costed, with the moment the decision gets made.

### Part D. Code, and what you put around it *(≈ 60 min)* → code + `en/answers/04-code.md`

**This is the part we look at most, and the feature is not what we score.**

You are going to write this code with an assistant. So do we. What interests us is not what the
assistant produced, it is **what you put around it so you can trust it**, and so that someone
else can trust it without reading your code line by line.

Build something that starts from `data/lignes-transcrites.json` and ends at an observable
result, with no manual step in the middle. What you build is your call: take whatever you
consider riskiest. It can be small, and it will probably be incomplete. That is expected.

Then put that code under control. What that means here is up to you, but the usual shapes are:
the context you give the assistant, living in the repository; verification scripts; tests
anchored on a source of truth; tooled standards; a single command that says whether the state of
the repository is good or not; procedures you have written down so you do not have to explain
them again every time.

**What "done" means here:**

1. **One single command.** Someone who clones your repository runs one command and knows whether
   what you claim is true or false. They do not have to take your word for it or read your code.
2. **The verification rests on something real.** A source of truth from the repository, not
   assertions you wrote out of thin air so they would pass.
3. **Nothing disappears silently.** Everything your code could not handle stays visible in the
   result, in its place, and is identifiable by someone other than you. A result that looks
   clean because it dropped whatever was inconvenient does not count as done.
4. **The context you give the assistant is versioned with the code**, it is specific to this
   project, and it would have been useful to someone other than you.
5. **You can state your limits** in `en/answers/04-code.md`: what your code does not handle, and
   what would break if we changed the data.

What we are not asking for: handling all 8 orders, making it pretty, full test coverage,
performance, security, authentication.

### Part E. How you drove the assistant *(≈ 10 min)* → `en/answers/05-ai-notes.md`

Short and honest. Which tool, what you handed to it, what you redid by hand, and **at least one
specific place where you rejected or corrected what it proposed, and why.**

If you used no assistant at all, say so and explain the choice. That is a valid answer.

---

### Part F. Your technical experience *(≈ 25 min)* → `en/answers/06-technical-experience.md`

Nothing to do with the Steenland case. We want to know what you have built before, and how.

One page in total, no more. Short and precise beats long and smooth, and we would rather have
two real experiences than six skimmed ones.

**This is the only part of the submission you write without an AI assistant.** We will come back
to each of your answers during the interview, going one level below what you wrote: text you did
not write yourself does not survive a minute of that conversation. Style and spelling do not
count, and a spell checker or a translation are not a problem.

---

## 4. How you hand it in

1. From the repository we sent you, click **Use this template** and create a **private**
   repository under your own account.
2. Invite the GitHub accounts listed in the email as collaborators.
3. Work in **incremental commits**, not one final commit. The history is part of the submission:
   it shows us the order in which you worked.
4. When you are done, reply to the email with the repository link.

If a setup problem blocks you for more than ten minutes (Docker, database, dependencies), write
it down in your submission and work around it. It is not part of what we assess, and how you
work around it tells us more than how long you fight it.

---

## 5. What we assess, and what we do not

| What we look at | What that means |
| --- | --- |
| **Business framing** | You find the real problem behind the request, and you name the number that matters |
| **Solution judgement** | You pick the cheapest thing that moves that number, and you defend not building the rest |
| **Build plan** | The days add up against the budget, the acceptance criteria are verifiable, the risks die early, and what you ruled out is written down |
| **Control over what you produce** | The code you hand in is verifiable by someone else, and you know where it breaks |
| **Technical depth** | You can go into what you built before at the level of the decision, not the story |
| **Clear-sightedness** | You know what you do not know, and what your code does not do |

**Not assessed:** knowing our stack, algorithms by heart, beautiful code, finishing everything.
