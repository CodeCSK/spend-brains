# Spendbrains — App Story

> **Single source of truth for what Spendbrains is and what it does.**  
> Plain language only — no code, no technical jargon.  
> **Document version:** 1.0 · **Status:** Approved planning

---

## What is Spendbrains?

Spendbrains helps **groups of people** track shared spending and settle up fairly.

Think of a **trip with friends**, a **family function**, **roommates sharing bills**, a **team outing**, or a **college fest**. People pay for different things at different times. Spendbrains records who paid what, who should share the cost, and **who owes whom** — so nobody needs messy spreadsheets, long chat threads, or arguments at the end.

**Today:** Spendbrains is built around **events** (trips, outings, celebrations — anything where a group shares costs for a period of time).

**Tomorrow:** Spendbrains can grow into a fuller money-management tool for **individuals, couples, families, and groups** — but the first version stays focused on **event expense tracking**.

---

## Who is Spendbrains for?

- Friends travelling together  
- Families at weddings, rituals, or holidays  
- Roommates splitting rent, utilities, or groceries  
- Colleagues on team lunches or offsite trips  
- Travel groups, college groups, or any informal group that splits costs  

**Primary market at launch:** India. All amounts are in **Indian Rupees (₹)** in the first version.

---

## The problem Spendbrains solves

When groups share costs, people usually:

- Note amounts in WhatsApp or notes apps  
- Maintain Excel or Google Sheets  
- Forget who paid for what  
- Disagree on totals at the end  
- Waste time working out who should pay whom  

Spendbrains replaces that with **one place** to log expenses as they happen and see **clear balances and settlements** instantly.

---

## How you start using Spendbrains

### Sign up and sign in

- You join with your **mobile number**.  
- You receive a **one-time code by text** to verify your number.  
- That is the main way to sign in in the first release.  

**Later (not in the first web release):**

- **iPhone app:** sign in with Apple for convenience (phone number still supported).  
- **Android app:** sign in with Google for convenience (phone number still supported).  

### Your profile

You can set:

- **Display name** — how others see you on events  
- **Profile photo** — optional  

**Later:** change phone number, delete your account, export all your data.

---

## Events — the heart of Spendbrains

There are **no separate “groups”** in the first version. Everything happens inside an **event**.

An **event** is a shared pot for one occasion — for example:

- “Goa trip 2026”  
- “Flat — March bills”  
- “Office offsite”  
- “Priya’s wedding functions”  

One person **creates** the event. Everyone else **joins** it. All expenses for that occasion live under that event.

---

## Creating an event

When someone creates an event, they become the **Captain** (the main organiser).

### Information you can add

| Field | Required? |
|-------|-----------|
| **Event name** | Yes |
| **Start and end date** | Yes |
| **Description** | Optional |
| **Location** | Optional |
| **Event type** | Yes — picked from a list (see below) |

### Event type and cover image

Every event has a **type** that sets a **default cover image** — so the event looks good even if nobody uploads a photo.

**Default type:** **General** — selected automatically so you can **skip choosing a category** and start tracking expenses straight away.

**Other types (examples):** Vacation, Corporate, Ritual / ceremony, Roommate / flat, Travel, Party, and similar. Each has its **own default cover picture**.

**In the first version:**

- You pick a type → the matching default cover appears.  
- The Captain can **change the event type** when editing the event → the cover updates to that type’s default.  
- **Custom cover photos** come in a later version (on the edit event screen).  
- **Custom event type names** also come later.  

### Public or private event

**Default: Private**

- New people can request to join, but the **Captain or Vice-captain must approve** them.  

**Optional: Public**

- The Captain can switch the event to **public** with one action.  
- Then people can join **without approval** (using the invite link, event ID, or QR code).  

---

## Joining an event

Members can join in three ways:

1. **Invite link** — shared by the Captain or another member  
2. **Event ID** — a short code you enter in the app  
3. **QR code** — scan to open the join flow  

**Private event:** join request goes to the Captain or Vice-captain for approval.  
**Public event:** you are added directly.

There is **no limit** on how many events you can be part of at the same time.

---

## Roles — who can do what

Everyone on an event is a **user**. On each event, you have one of three roles:

### Captain

- The person who **created** the event.  
- There is **one Captain** per event (like the main admin).  
- Can do **everything**, including **deleting** the event, expenses, and categories.  

### Vice-captain

- Assigned by the Captain.  
- Can do almost everything the Captain can — **except delete** the event, any expense, or any category.  
- Can approve join requests, archive the event, and mark settlements as paid.  

### Member

- Everyone else on the event.  
- Can **add** expenses.  
- Can **edit and delete only the expenses they created**.  
- Can view the expense list, summaries, and settlements.  
- Cannot manage members or event settings.  

### Who can edit or delete an expense?

- The **person who recorded** the expense, **or**  
- The **Captain** (full edit/delete), **or**  
- The **Vice-captain** (edit only — not delete)  

---

## Managing members

The **Captain** can:

- Add members  
- Change member details  
- Remove members  
- Assign someone as **Vice-captain**  

The **Vice-captain** can add and edit members but **cannot remove** them (same rule as no deletes elsewhere).

---

## Recording expenses

Each expense captures:

| Field | Required? |
|-------|-----------|
| **Description** — what was bought | Yes |
| **Amount** — in ₹ | Yes |
| **Paid by** — which member paid upfront | Yes |
| **Shared among** — which members split this cost | Yes |
| **Date** — when it happened | Yes |
| **Category** — e.g. Food, Travel, Stay | Yes |
| **Notes** — extra detail | Optional |

**Later:** receipt photo, payment method (cash, UPI, card).

### Expense categories

Each event has categories for classifying expenses (Food, Travel, Stay, Shopping, Entertainment, Other, and more).

- Every category shows an **icon and name** together.  
- The Captain can **add custom categories** for that event.  
- The Vice-captain can add or edit categories; only the Captain can **delete** a category.  

### How costs are split (first version)

In the first version, shared costs are split **equally** among the members you select.

**Example:** ₹1,200 dinner shared among 3 people → ₹400 each.

**Later:** unequal splits, custom amounts, percentages, and excluding someone from a specific expense.

---

## Expense list

The expense list is a **central, full-featured screen** — not a simple scroll.

You can:

- **Sort** — by date, amount, category, and more  
- **Filter** — by category, who paid, date range, search text  
- **Browse pages** — when there are many expenses  
- **Act on each row** — edit or delete (according to your role)  

---

## Spending summaries

For each event, you can see **per-person summaries**:

- How much each person **paid in total**  
- How much each person’s **fair share** was  
- Their **net balance** — ahead (paid more than share) or behind (paid less than share)  

---

## Settlements — who pays whom

The **Settlements** tab shows everything needed to **close the books** on an event.

### At the top — overall summary

- Total spent on the event  
- How much is already **marked as settled**  
- How much is still **outstanding**  
- Whether the event is **fully settled** or not  
- Progress — e.g. “3 of 7 payments settled”  

### Below — payment lines

Each row shows a simple instruction:

**“Person A pays Person B ₹X”**

These are calculated to **minimise** the number of transfers needed (not every possible pair).

### Extra helpful information

- Each person’s **net balance**  
- **Paid vs fair share** for each member  
- Option to show **only unsettled** payments  

### Marking as settled

The **Captain or Vice-captain** can mark a payment line as **settled** when money has actually changed hands in real life.

This is a **record for the group** — Spendbrains does not move real money between bank accounts in the first version.

### Export

You can **export settlement details only** (not the full expense dump) as:

- **PDF** — good for sharing or printing  
- **Image** — good for WhatsApp, if supported  

---

## Event status — settled vs archived

Spendbrains does **not** “close” or lock an event in the first version.

Instead, two ideas work together:

### Settlement status (automatic)

The app shows whether an event is:

- **Unsettled** — nothing marked paid yet  
- **Partially settled** — some payments marked, some not  
- **Fully settled** — all settlement lines marked paid  

This updates automatically from your expenses and settlement marks.

### Archive (organisational)

When an event is **done**, the Captain or Vice-captain can **archive** it.

- Archived events move to an **Archived** section so your main list stays clean.  
- **Permissions stay the same** — archiving is only a way to organise, not a lock.  
- You can **unarchive** anytime.  

**Later:** optional “hard close” that prevents edits — not in the first version.

---

## Staying up to date

In the first version, you **refresh or revisit** a screen to see new expenses others added.

**Later:** expenses appear **live** for everyone without refreshing.

---

## Language

**First version:** English only.

The product is built so **more languages** (Hindi and others) can be added later without rebuilding everything.

---

## Privacy and trust (first launch)

Before going public, Spendbrains will have:

- A clear **Privacy Policy** — what data is collected and why  
- **Terms of Service** — rules for using the app  
- **Consent** when you sign up with your phone number  
- A way to **contact** the team about your data  
- A documented process if you want to **access or correct** your information  

**Later:** delete your account and download all your personal data yourself.

Settlement export is available from the first version; full personal export comes later.

---

## What launches when

### Version 1 — Web (first release)

- Use Spendbrains in a **web browser** on phone or computer  
- Sign in with **mobile number only**  
- Everything described above for events, expenses, summaries, settlements, and export  
- **Not included yet:** charts, offline mode, push notifications, multiple currencies, receipt photos  

### Version 2 — iPhone app

- Native **iPhone app**  
- Sign in with **Apple** (and phone number)  
- Same features as web, matching the **same look and feel**  

### Version 3 — Android app

- **Android app** (same app codebase as iPhone)  
- Sign in with **Google** (and phone number)  

### Long term

- Once mobile apps are mature, the **website may be reduced or retired** — users move to the apps.  
- The product may expand beyond events into **personal, couple, and household** money tracking.  

---

## Look and feel across web and mobile

Spendbrains should **look like one product** whether you use the website, iPhone, or Android:

- Same colours, spacing, and typography  
- Same patterns for buttons, lists, and settlement screens  

The website is built **first**; mobile apps follow. Visual designs are kept **in sync** through a shared style guide even though each platform is built separately.

---

## What is NOT in the first version

| Feature | When |
|---------|------|
| Charts and visual analytics | Later |
| Group-wide summary dashboards | Later |
| Offline use | Later |
| Push notifications | Later |
| Multiple currencies | Later |
| Receipt photos on expenses | Later |
| Custom event cover upload | Later |
| Unequal / custom expense splits | Later |
| Live instant updates | Later |
| Change phone number | Later |
| Delete account | Later |
| Hindi and other languages | Later |
| Moving real money / UPI pay inside app | Not planned in first versions |

---

## Success — what “done well” looks like

In the first **3–6 months**, Spendbrains succeeds if:

- Groups can **create events and log expenses** smoothly  
- **Settlements are clear** and trusted  
- **Travel groups, friends, and families** actually use it  
- Reporting (summaries, settlements, export) is **reliable**  
- The foundation can **grow** without starting over  

---

## Document history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026 | Initial approved app story from requirements workshops |

---

*Documentation map: [README.md](./README.md) · Plan: [plan/](./plan/) · Backend: [../apps/backend/docs/](../apps/backend/docs/) · [frontend/](./frontend/)*
