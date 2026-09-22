# Notes from the scoping call

Steenland Foodservice, 2026-08-25, 45 minutes
On the client side: the director, the order desk manager.
Notes taken by the Nightborn team.

This document gathers what the client answered to our questions. It contains no interpretation
and no recommendation.

**The call was cut short, the director had to leave.** We did not cover everything we wanted to.
Anything not written here was not discussed.

*Version française : [`FAITS-CLIENT.md`](FAITS-CLIENT.md).*

---

## Existing systems

**How does the ERP integrate?**
On-premise system from 2009. No API. Two integration surfaces: a watched folder where CSV files
are dropped and swallowed by an import job, and a read-only SQL view on stock and customers.

**Can we write straight into the ERP database?**
No. The SQL view is read-only. The drop folder is the only way in.

## The order desk

**Within the 4 minutes per order, what takes the time?**
The order desk manager would say: finding the right reference. Customers write "bloem type 55"
and there are three packaging formats. Nobody has ever timed it.

**What happens when an order misses the cut-off?**
It ships the next day. The customer calls, the desk apologises, and sometimes we pay for an
express run, around 90 EUR.

**How much of the email is actually machine-readable?**
No idea, we have never looked. We can export the `orders@` mailbox over 6 months for you.

## The customers

**Have you tried a customer portal before?**
Twice. 2019 and 2022. Both died below 10 % adoption. Customers went back to email.

**Why did adoption fail?**
Most of our customers are bakery owners over 50. They send the order at 22:00 from their phone
in three lines, and they are not going to learn a catalogue of 8,000 references.

## The project

**Where does the one-month deadline come from?**
Nowhere in particular, the director wants it done within a month. Nothing is committed to
anyone, there is no external deadline.

**What exactly does the 60,000 EUR cover?**
That is what the board set aside for the whole project, for the year. Nobody said it all had to
be spent in one month.

**Is the mobile app negotiable?**
If you show us something that works, probably. Nobody here asked for an app except the director.

**Who decides?**
The director wants the portal. The order desk manager and the operations manager carry the pain.
