# Product Requirements Document: DevLedger

**Version:** 0.3 | **Date:** 2026-06-25 | **Author:** Jeremy Whiteford

**License:** AGPL-3.0
**Repository:** github.com/jblackchevy/devledger

---

## 1. Problem Statement

Small real estate development teams (2-10 people) managing LIHTC, HTC, ITC, and mixed-income deals spend the majority of their administrative time in spreadsheets, email threads, and disconnected point tools. The specific pain points:

- **Budget tracking lives in Excel.** No real-time view of committed vs. spent vs. available. Variance is discovered after the fact. Contingency drawdown is manual.
- **Draw requests take 1-3 days to assemble.** Invoices are scattered across email, Google Drive, and Dropbox. Lien waivers have to be chased manually. The package is rebuilt from scratch each month.
- **Complex capital stacks have no tool.** A deal with LIHTC equity + construction loan + HOME + TIF requires manual source allocation per invoice. Nobody tracks which sources have been drawn against which budget lines.
- **Cost certification is a scramble.** At project end, pulling together LIHTC eligible basis, HTC QREs, and ITC qualified energy property costs from 18 months of invoices is a multi-week manual exercise that should have been tracked from day one.
- **Lenders and investors get PDFs, not portals.** Monthly PDF reports go out by email. Questions about prior periods require digging through archives.

Northspyre solves all of this, but its pricing (~$12K–$15K/year per project) is inaccessible for a firm managing 3–5 projects under $100M total. A self-hosted, open-source equivalent purpose-built for this segment does not exist.

### Northspyre Feature Parity Target

| Feature Area | Northspyre | Rabbet | DevLedger MVP | DevLedger v1.1 |
|---|---|---|---|---|
| Budget / ACR | Full | Partial | 95% | 95% |
| Vendor & Contract Management | Full | None | 95% | **100%** |
| Invoice processing | Full + email intake | Good | 90% (drag-drop + OCR) | 95% (+ email intake) |
| Draw package generation | Static templates | Draw-focused | **Better** (custom template builder) | Better |
| Multi-source capital stack | Good | Limited | **Better** (LIHTC/HTC/ITC/TIF native) | Better |
| Cost certification (LIHTC/HTC/ITC) | LIHTC partial | None | **Better** (first-class module, all 3) | Better |
| Lien waiver AI validation | Weak (users complain) | Strong (their differentiator) | **Better** (Claude-powered, MVP) | Better |
| Email approval notifications | Missing (users complain) | Unknown | **Better** (built-in, MVP) | Better |
| Reporting & dashboards | Full | Limited | 75% | 88% |
| Cash flow projection | Full (schedule-integrated) | Basic | Manual entry + chart (MVP) | Schedule-integrated (v1.1) |
| AI-assisted workflows | Moderate | Minimal | **Better** (Claude-native) | Expanded |
| TIF-specific draws | Generic | None | **Better** (KC PIEA native) | Better |
| Portfolio dashboard | Yes | None | Deferred | Yes |
| AI cost forecasting (ML, cross-customer) | Yes | No | No | No |
| Vendor marketplace (100K+ vendors) | Yes | No | No | No |
| Mobile app | Yes | Yes | Responsive web only | Responsive web only |
| Lender network portal | Yes | Lender-native | Token-based links | Token-based links |
| Price | ~$12-15K/yr/project | Lower than Northspyre | ~$30-40/month total | ~$30-40/month total |

**Overall at MVP: ~90% of Northspyre's core feature set, with DevLedger winning outright on cost, lien waiver AI, HTC/ITC certification, and email notifications.** Permanent gaps: ML-powered forecasting (requires cross-customer training data) and Northspyre's proprietary vendor network/marketplace.

---

## 2. Design Philosophy & UX Principles

DevLedger is a financial tool used under deadline pressure by PMs who didn't choose to become software users. Every design decision should reduce cognitive load, not add to it. The standard is Apple-level intuitiveness: you know what to do on screen 1, with no training required.

### Core Principles

**1. Zero-to-first-invoice in under 15 minutes.**
Onboarding is a first-class feature. A 5-step project setup wizard (project details → capital stack → budget import → first vendor → done) with a visible progress bar. Each step has a "skip for now" that doesn't break anything. The PM should be dragging in their first invoice within 15 minutes of creating an account.

**2. The right action is the obvious one.**
One clear path for every common task. Invoice coding shows only the fields relevant to this vendor type and project. No modal dialogs for quick edits. No "where does this go?" moments. If a user pauses for more than 3 seconds, the UI has failed.

**3. Progressive disclosure.**
Show power when needed, not always. The cost certification module appears only for projects with tax credit flags. Advanced ACR columns are collapsed by default, one click to expand. The vendor prequalification form doesn't appear until the PM activates it. Complexity is earned, not imposed.

**4. Contextual memory.**
The system learns from patterns: same vendor defaults to the same budget line as last time; same draw period defaults to the same template; same project type auto-fills the same required fields. The system reduces repetition without removing control. The user can always override.

**5. Ambient compliance, not nagging.**
A COI expiring in 30 days gets one banner on the vendor record — not a constant red badge everywhere. Missing lien waivers appear in the draw package checklist, not in the main inbox. Compliance issues surface when they're actionable, not as background noise.

**6. No dead ends.**
Every error message explains the fix. Every empty state has a primary action button. When something is blocked, the UI says why and points to the resolution. "This vendor has no active contract — add one here" is better than a generic validation error.

**7. Drill-down everywhere.**
Every dollar amount is a link. Click the invoiced total on the ACR → see the invoice list for that line. Click a budget line → see all contracts, invoices, and change orders behind it. Click a funding source → see the full draw history. The data is always one click deeper.

**8. Inline editing on the ACR grid.**
Clicking a budget line opens an inline editor in place — the grid stays visible while editing. No full-page modals for updating an exposure amount or a note. The ACR is a working document, not a read-only report.

**9. Print-first design.**
Draw packages, the ACR, and cost certification reports are financial documents first and UI second. They need to render beautifully on paper and in PDF. Every report should look like something a professional produced, not a browser screenshot.

**10. Mobile-usable approvals.**
A PM approving an invoice from their phone at a job site should work without friction. The full app doesn't need to be mobile-native, but approval workflows — the most time-sensitive actions — must be clean on a phone browser.

### Interaction Patterns

**Drag-and-drop everywhere it makes sense:**
- Invoice upload queue (drop PDFs directly on the page)
- Draw template section builder (drag sections to reorder)
- Budget line reorder within categories

**Keyboard shortcuts for power users:**
- `/` — open global search
- `A` — approve the selected invoice
- `R` — reject the selected invoice
- `Tab` — advance through invoice coding fields
- `Cmd+Enter` — submit the current form

**Bulk operations on every list view:**
- Select all → bulk approve, bulk export, bulk send lien waiver requests
- Multi-select with Shift+click or Cmd+click

**Status-driven color system (consistent across all modules):**
- Red — over budget, hard block, expired compliance
- Yellow — warning, approaching threshold, soft block
- Green — on track, clear, compliant
- Gray — inactive, draft, deferred

**Empty states:**
Every module has a designed empty state — not a blank page. The project dashboard before any invoices exist says "No invoices yet — drag a PDF here to start." The vendor directory has a "Import vendors from CSV" primary button. Empty states are the first onboarding touchpoint for each module.

### Onboarding Wizard

The project setup wizard is a 5-step flow with a progress bar:

1. **Project details** — name, type, address, key dates. Tax credit flags set here trigger module visibility.
2. **Capital stack** — add funding sources (name, type, total committed, availability date). At least one source required.
3. **Budget import** — download the Excel template, fill it out, re-upload. Or: paste a proforma and let Claude read it. Or: skip and enter manually.
4. **First vendor** — add the GC or most important vendor. Sets up the first contract.
5. **Done** — project is live. Dashboard shows empty states with next-step prompts.

Inline hints appear on first use of each module (one-sentence tooltip, dismissed with an X, never shown again). A "Try with sample project" option lets PMs explore the full product before entering real data.

---

## 3. Target Users & Use Cases

### Primary: Project Manager / Development Manager

Day-to-day project operator. Tracks budget, manages vendors, prepares draw packages, coordinates with GC and lenders.

**Use cases:** Set up new project; enter and track contracts; process invoices (upload PDF → OCR → code → approve); prepare monthly draw packages; monitor committed vs. available vs. exposure per budget line; track cost certification buckets throughout construction.

### Secondary: Development Accountant / Controller

Reconciles project costs against the general ledger and pays vendors.

**Use cases:** Approve invoices routed from PM; export to QuickBooks Online; reconcile paid invoices; generate owner's sworn statement for draws; track retainage by contract; pull cost certification reports for auditor.

### Tertiary: Principal / Managing Partner

Signs off on budget changes, reviews portfolio.

**Use cases:** Approve budget reallocations and change orders above threshold; view portfolio dashboard; review draw packages before submission; access cash flow projections.

### External: Lender / Investor / Auditor

Read-only. No login required.

**Use cases:** Review and download draw packages; view current budget status; auditor accesses cost certification report and supporting invoices.

### Non-Target Users

- General contractors (owner's tool, not GC's)
- Lenders running their own draw administration (Built, Rabbet lender-side)
- Large institutional developers (Yardi/Oracle already in place)

---

## 4. Core Modules

### 4.1 Project Setup & Budget Management

#### Project Creation

- Name, type (LIHTC, HTC, ITC, LIHTC+HTC, LIHTC+ITC, market-rate, mixed), address, key dates (start, projected completion, stabilization target)
- Tax credit program flags: LIHTC (triggers 50% test tracker, basis tracking), HTC (triggers QRE tracker), ITC (triggers qualified energy property tracker). Multiple flags allowed on one project.
- Capital stack definition: list all funding sources with name, type (construction loan, LIHTC equity, HTC equity, ITC equity, soft debt, HOME, CDBG, TIF, owner equity, other), total committed amount, draw availability date

#### Northspyre-Compatible Budget Template

A downloadable Excel template that mirrors Northspyre's Anticipated Cost Report format exactly. Columns:

| Line # | Category | Subcategory | Description | Original Budget | Approved Budget | Committed | Invoiced to Date | Retainage Held | Exposure | Pending | Anticipated Final Cost | Variance | Available | Funding Source | Basis Eligible | HTC QRE | ITC QEP |
|--------|----------|-------------|-------------|-----------------|-----------------|-----------|-----------------|----------------|----------|---------|----------------------|----------|-----------|----------------|----------------|---------|---------|

Pre-populated rows organized by category:
- **100 – Land & Acquisition** (purchase price, closing costs, title, due diligence)
- **200 – Soft Costs** (architecture, engineering, legal, accounting, permits, surveys, environmental, appraisal, market study, developer overhead)
- **300 – Hard Costs** (organized by CSI MasterFormat divisions 01–33)
- **400 – Developer Fee**
- **500 – Financing Costs** (loan fees, interest reserve, carry costs, title/closing on financing)
- **600 – Reserves** (operating reserve, replacement reserve, lease-up reserve)

Color coding: budget overruns flag red, contingency drawdown flags yellow at 50% remaining, green when on track. Visual matches Northspyre's ACR aesthetic.

**CSV import also supported** for firms that already have their own budget format.

#### AI-Assisted Proforma Reader

When starting a new project, PM uploads the proforma (Excel or PDF). A Claude-powered parser reads the proforma and:
1. Identifies line items and maps them to DevLedger budget categories
2. Extracts dollar amounts per line
3. Identifies funding sources from the sources & uses tab
4. Outputs a pre-filled budget import file (CSV or directly populates the project budget)
5. Flags any line items it couldn't confidently map, asks PM to resolve

**How AI is invoked:** This runs through the Claude API with a structured prompt and Haiku model (cheapest, fast, sufficient for document parsing). Estimated cost: ~$0.05–$0.15 per proforma. One-time per project.

**Alternatively via Claude Code:** PM can run `/proforma-import` as a Claude Code skill in the terminal, which reads the proforma file and outputs the import CSV. Zero additional API cost (covered under Claude Code subscription).

#### Budget Line Item Fields (per row)

- Line number, category, subcategory, description
- Original budget (locked after first draw)
- Approved budget (updated by approved transfers)
- Committed (sum of executed contracts on this line -- calculated, not editable)
- Invoiced to date (sum of approved invoices -- calculated)
- Retainage held (sum of withheld retainage -- calculated)
- Exposure (unapproved COs + potential commitments -- PM-editable)
- Pending (proposed budget transfers awaiting approval -- calculated)
- Anticipated final cost (committed + exposure + invoiced outside contract)
- Variance (approved budget minus anticipated final cost)
- Available (approved budget minus committed minus exposure)
- Funding source (primary source assignment; split funding uses allocation %)
- Basis eligible (boolean, LIHTC)
- HTC QRE (boolean)
- ITC QEP (boolean -- qualified energy property for Investment Tax Credit)
- Notes field

#### Anticipated Cost Report (ACR) -- Live View

Primary budget workspace:
- Filters: by category, by funding source, by basis eligibility, by overbudget status
- Sort: by line number, by variance, by available funds
- Inline editing of exposure and pending fields
- Drill-through: click any dollar amount to see underlying invoices or contracts
- Alerts: red flag when anticipated final cost exceeds approved budget; yellow when contingency below 50%
- Contingency summary header: total, drawn to date, remaining, % remaining
- Export: CSV, PDF, Excel (formatted matching the template)

#### Budget Transfers & Reallocation

- PM proposes transfer: reduce one line, increase another, with reason
- Goes to pending status on both lines
- Approver (controller or principal per threshold) receives notification
- Approved transfers update approved budget and create immutable audit log entry
- Full audit trail: who proposed, who approved, timestamp, reason

#### Scenario Modeling

- Duplicate budget version for comparison (e.g., "Base Case" vs. "Value Engineering")
- Side-by-side comparison view
- Promote scenario to active budget (with approval)
- Construction phase only -- not a pre-construction proforma tool

---

### 4.2 Vendor & Contract Management (Target: 100%)

#### Vendor Directory (Global)

Shared across all projects. Per vendor:

- Name, legal entity name, DBA (if different)
- Contact: primary contact name, email, phone
- Address (for lien waiver and 1099 purposes)
- Tax ID (EIN or SSN -- stored encrypted)
- W-9 on file (boolean + document upload + date received)
- Vendor type: GC, subcontractor, architect, engineer, civil engineer, MEP engineer, consultant, inspector, environmental, legal, title/escrow, accounting, other
- Trade/division (for subs): CSI division assignment for subcontractors
- MWBE classification: majority-owned, minority-owned (MBE), women-owned (WBE), small business (SBE), veteran-owned (VOSB), service-disabled veteran (SDVOSB), HUBZone -- checkboxes, multiple allowed
- MWBE certification number and expiration date
- Default cost code assignments (pre-fill invoice coding)
- Per-vendor history: all contracts, invoices, lien waivers, payments across all projects
- 1099 tracking: total paid YTD across all projects, 1099 required flag (non-corp vendors paid >$600)

#### Insurance & Compliance Tracking

Per vendor, per project assignment:
- Required coverage types: General Liability, Workers Comp, Auto, Umbrella, Professional Liability, Builders Risk (configurable per vendor type)
- Required limits per coverage type (configurable per project)
- COI on file (boolean + document upload)
- COI expiration date (per coverage type)
- Additional insured endorsement required (boolean) -- ADG named as additional insured
- Automated alerts: 30 days before expiration, 7 days before expiration, day of expiration
- Alert recipients: PM + vendor contact (vendor gets email with link to upload new COI)
- Vendor COI self-upload: vendor receives a tokenized link and can upload the new COI without creating an account
- Compliance dashboard per project: all vendors, all coverage types, color-coded status

#### Subcontractor Prequalification

- Prequalification form sent to prospective subcontractors via email link (no account required)
- Form collects: company info, license numbers, bonding capacity, financial references, prior project list, MWBE documentation, safety record (EMR), insurance limits
- PM reviews submitted prequalification, marks approved/rejected with notes
- Prequalification status visible on vendor record, expires after configurable period (default: 2 years)
- Prequalification package exportable for lender or program requirements

#### Contract / Commitment Tracking

Each contract has:
- Vendor (linked to vendor directory)
- Project and budget line assignment(s) with percentage splits if multi-line
- Contract type: GC/GMP, lump sum, cost-plus, time & materials, professional services, purchase order
- Original contract value
- Change orders (itemized list, status workflow)
- Revised contract value (original + approved COs)
- Pending change orders (unapproved -- feed exposure field)
- Schedule of values (line-item breakdown within the contract, GC pay app format)
- % complete (from latest pay application -- by line item in the SOV)
- Retainage rate (e.g., 10%; can reduce to 5% at 50% per contract terms)
- Retainage withheld to date (calculated from approved invoices)
- Retainage released to date
- Status: draft, executed, active, substantially complete, final complete, closed, disputed
- Document storage: executed contract PDF, change orders, insurance certificates, bonds
- Funding source allocation (which sources draw from this contract, with percentages)
- Lien waiver schedule: all conditional and unconditional waivers by pay period
- Notes/issues log

#### Change Order Management

- New CO entered by PM: description, amount, reason code (owner-directed, unforeseen condition, design change, code compliance, regulatory/permit, scope clarification)
- Status workflow: draft → PM review → principal approval (if above threshold) → executed
- Approved COs update committed amount on budget line automatically
- Pending COs update exposure field automatically
- CO budget threshold configurable per project (e.g., PM approves under $10K; principal sign-off above)
- CO log exportable to PDF for lender reporting (formatted, numbered)
- CO budget impact summary: how many COs, total approved, total pending, net impact on contingency

#### GC Pay Application Workflow (AIA G702/G703 Intake)

Instead of the GC emailing a PDF pay app, DevLedger provides a structured intake:
- GC receives a link to a pay application form (no login required)
- Form mirrors AIA G702/G703: schedule of values with % complete per line, stored material, retainage calculation
- PM reviews submitted pay app, adjusts % complete if disputed
- Approved pay app becomes the invoice record (no duplicate data entry)
- System calculates: amount earned this period, retainage withheld, net payment due
- Generates a formatted AIA G702/G703 PDF from the entered data

#### W-9 & 1099 Management

- W-9 upload required before first payment (system warns if missing)
- At year-end: generate 1099 report (all vendors, all projects, total paid YTD, 1099 required flag)
- Export 1099 data in format compatible with QuickBooks Online 1099 filing
- Flag vendors that crossed the $600 threshold mid-year

#### Vendor Self-Service Portal (v1.1)

- Vendor receives a tokenized link for a specific project
- Can submit invoices (PDF upload + metadata fields)
- Can check invoice status (submitted, under review, approved, paid)
- Can upload lien waivers
- Can update COI
- No account creation required -- token-based access per project assignment

---

### 4.3 Invoice Processing & AP Workflow

#### Invoice Intake: Drag-and-Drop PDF

- PM drags a PDF (or multiple PDFs) onto the invoice queue
- System sends the PDF to Claude API (Haiku model) for extraction
- Extracted fields: vendor name, invoice number, invoice date, due date, total amount, line items (if present), PO/contract reference number
- Extracted data pre-populates the invoice form; PM reviews and corrects
- Original PDF stored and attached to the invoice record permanently
- Bulk upload: drop a folder of PDFs; each is queued separately with extraction running in parallel
- Supported formats: PDF (primary), JPG/PNG (photo of paper invoice)

**AI cost for invoice extraction:** ~$0.01–$0.03 per invoice using Haiku. For 100 invoices/month: ~$1–$3/month. Trivial.

#### Invoice Coding

Each invoice is coded to:
- Project
- Budget line(s) with amount per line (split invoices across multiple lines)
- Funding source(s) (auto-populated from budget line allocations; overridable)
- Cost type (hard cost, soft cost, financing cost, other)
- Draw period (which monthly draw this belongs to)
- Contract reference (links to executed contract; shows remaining balance)
- Retainage amount withheld (calculated from contract rate; adjustable per invoice)
- Net amount payable (total minus retainage)
- Tax credit flags:
  - **Basis eligible** (LIHTC -- auto-filled from budget line flag; overridable)
  - **HTC QRE** (Historic Tax Credit qualified rehabilitation expenditure; auto-filled from budget line flag; overridable per invoice line)
  - **ITC QEP** (Investment Tax Credit qualified energy property; auto-filled; overridable)
  - **QRE category** (if HTC QRE: structural components, exterior work, interior work, other)
- Notes field

**AI-Assisted Coding Suggestion:** When an invoice is uploaded, Claude suggests the budget line, funding source, and tax credit flags based on vendor name, description, and amount. PM accepts or overrides. Prompt is short and cached -- estimated cost: ~$0.005 per invoice. Can be disabled if not wanted.

#### Approval Workflow

- Coded invoices route to approver queue (configurable: single-step or two-step PM → controller)
- Threshold-based routing: PM approves under $5K; controller approves $5K–$25K; principal approves over $25K (configurable)
- Approver receives email notification immediately when invoices are ready (see Email Notifications below)
- Approver reviews coding, attached PDF, contract reference, and remaining contract balance
- Approve → moves to "approved, unpaid"
- Reject → returns to PM queue with rejection reason; PM notified by email
- Approval history immutable (who approved, timestamp, any notes)
- Bulk approve: select multiple low-value invoices and approve in one click
- No user can approve their own submission (dual-control enforced)

#### Email Notifications

DevLedger ships email notifications in MVP — a deliberate competitive advantage over Northspyre, whose users explicitly report "no email alerts that invoices are ready to approve" as a top complaint. All notifications are configurable per user.

Notifications sent:
- Invoice pending your approval (sent to each approver as invoices route to their queue)
- Invoice rejected (sent to coder with rejection reason)
- COI expiring in 30 days, 7 days, and day of expiration
- Lien waiver requested (sent to vendor contact with upload link)
- Lien waiver uploaded (sent to PM for review)
- Draw package submitted for your approval
- Draw package funded (sent to accounting/controller)
- Budget line over budget (configurable threshold; sent to PM and principal)
- Budget transfer pending your approval

#### Payment & Reconciliation

- Approved invoices exported to QuickBooks Online (v1.1: direct API; MVP: CSV for manual import)
- PM marks invoices paid with payment date, check/ACH reference number, and payment amount
- Retainage tracking: net amount paid vs. retainage held; retainage release workflow at contract completion
- Reconciliation report: DevLedger approved invoices vs. QBO paid bills for any period

#### Lien Waiver Tracking & AI Validation

- Conditional lien waiver automatically requested when invoice is approved (for construction contracts)
- Waiver request sent to vendor contact email with a tokenized link to upload the signed waiver (no account needed)
- Unconditional lien waiver automatically requested when payment is confirmed
- Lien waiver status per invoice: not required / requested / received / on file
- Draw package blocked (configurable: hard block or warning) if any included invoice is missing a conditional waiver
- Lien waiver log: all waivers by project, vendor, period -- exportable as a compiled PDF
- Waiver template: system generates a pre-filled conditional/unconditional waiver form for vendor to sign and upload; or vendor uploads their own

**AI-Powered Waiver Validation (MVP):**
When a vendor uploads a waiver PDF, Claude Haiku extracts:
- Waiver type (conditional or unconditional)
- Partial or final payment flag
- Amount covered by the waiver
- Period covered
- Claimant name and project name

The extracted data is validated against expected values: correct waiver type for the current payment stage (conditional = on invoice approval; unconditional = on payment confirmation), amount matches the invoice, claimant name matches the vendor record. Mismatches are flagged for PM review before the waiver is marked "on file."

Cost: ~$0.01–$0.02 per waiver via Haiku. For 50 waivers/month: <$1/month.

**Why this matters:** Northspyre's lien waiver attachment is their most common user complaint ("could use revamping" per Capterra). Rabbet's core differentiation is AI-powered waiver classification at the line-item level. DevLedger matches and extends Rabbet's capability from day one.

---

### 4.4 Draw Request Management

#### Draw Period Setup

- Define draw periods per funding source (monthly for construction loan; quarterly for LIHTC equity; event-based for TIF)
- Each source can have different draw periods on the same project
- PM initiates a draw by selecting the funding source and period

#### Draw Package Assembly

System auto-populates the draw with all approved invoices for the selected source and period:
- PM reviews the list, can add or remove individual invoices
- System calculates:
  - Total invoiced this period (gross)
  - Retainage withheld this period
  - Net draw request amount
  - Cumulative draws to date (by source)
  - Remaining available balance
  - Budget line summary (draw amount by line)
- Lien waiver check: flag any included invoices missing conditional waivers
- Change order log: all approved COs included automatically

#### Custom Draw Template Builder

The PM (or admin) builds and saves draw package templates. Each template is composed of sections:

**Available sections (drag to reorder):**
- **Cover Letter** -- rich text editor with merge fields:
  `{{project_name}}`, `{{lender_name}}`, `{{draw_number}}`, `{{draw_period_start}}`, `{{draw_period_end}}`, `{{gross_draw_amount}}`, `{{net_draw_amount}}`, `{{retainage_withheld}}`, `{{cumulative_draws_to_date}}`, `{{remaining_balance}}`, `{{submitted_by}}`, `{{submission_date}}`, `{{pm_name}}`, `{{pm_phone}}`, `{{pm_email}}`
- **Budget Status (ACR Summary)** -- columns configurable: line description, original budget, approved budget, committed, invoiced to date, this draw, retainage, remaining; filter to hard costs only or all lines
- **Invoice Table** -- configurable columns, sort order, subtotals by category, option to include/exclude vendor addresses and invoice numbers
- **Schedule of Values (AIA G703 format)** -- GC contract SOV with % complete, earned to date, this period, retainage
- **AIA G702 Cover Sheet** -- standard Application for Payment format, auto-populated
- **Lien Waiver Log** -- table of all waivers with status
- **Change Order Log** -- all approved COs with description, amount, cumulative total
- **Funding Source Summary** -- all sources, committed, drawn to date, this draw, remaining
- **Owner's Sworn Statement** -- itemized vendor list with contract amounts, amounts due
- **Certification/Signature Block** -- configurable certifying language and signature line
- **Attachment List** -- table of contents for the package

**Template management:**
- Save template with a name (e.g., "Busey Construction Loan Draw", "PIEA TIF Requisition", "Raymond James LIHTC Draw")
- Assign a default template to each funding source on a project
- Preview the populated template before generating
- Templates are portable: export/import between DevLedger installations

#### Multi-Source Draw Coordination

- Same invoice can appear in draws for multiple sources if split-funded (each source draws its allocated share)
- System prevents drawing the same dollar twice from the same source
- Cross-source reconciliation report: for any period, show which invoices were drawn from which sources and amounts
- Sources & uses tracker: running total of project costs vs. funding sources drawn, by period

#### 50% Test Tracker (LIHTC -- Bonds)

- Running total of basis-eligible costs as % of total depreciable basis
- Basis-eligible flag on budget lines and invoices
- Dashboard shows: total depreciable basis, basis-eligible costs to date, % achieved, remaining to hit 50%
- Alert when 50% is achieved (triggers ability to close construction loan for bond deals)

#### TIF-Specific Draw Support

- TIF draws have additional fields: PIEA requisition number, TIF-eligible cost category per ordinance
- Budget lines flagged as TIF-eligible at project setup
- TIF draw output matches PIEA administrator required format (Kansas City PIEA format built in; configurable for other jurisdictions)
- Non-TIF-eligible costs auto-excluded from TIF draw even if in same period
- Cumulative TIF reimbursements tracked against total TIF reimbursement cap

#### Draw Status Workflow

- Draft → PM review → principal approval → submitted to lender → funded
- Each status change logged with timestamp and user
- Funded draw: update drawn-to-date by source; notify accounting for QBO reconciliation
- Lender access: tokenized read-only link to view and download the full draw package (no login required; configurable expiration)

---

### 4.5 Cost Certification Module

This module tracks the data needed for tax credit cost certification from day one of construction, so the auditor's work at project end is a report run, not a reconstruction.

#### LIHTC Cost Certification

**Eligible Basis Tracking:**
- Every invoice coded with basis-eligible flag contributes to eligible basis running total
- Eligible basis breakdown by category: acquisition (land excluded), hard costs, soft costs (eligible portion), financing costs (eligible portion)
- Total eligible basis = total depreciable costs (land excluded, personal property treatment)
- Applicable fraction applied to eligible basis = qualified basis
- Estimated credit: qualified basis × applicable fraction × applicable percentage (user enters applicable percentage from allocation document)

**Reports generated:**
- **Eligible Basis Summary:** total project costs, basis-eligible costs by category, non-eligible costs (land, permanent financing, reserves), resulting eligible basis
- **Cost Certification Package (draft):** formatted cost certification report by category, ready for auditor review. Includes every invoice (sorted by cost category) with vendor, amount, basis-eligible flag, and coding rationale.
- **50% Test Report:** basis-eligible costs vs. total depreciable basis, with monthly progression chart
- **10% Test Tracker** (carryover allocations): costs incurred vs. 10% of reasonably expected basis, with target date and projected achievement

**Integration with draw records:** every draw period's invoices automatically update the cost certification running total. No separate data entry.

#### HTC Cost Certification (Federal & Missouri State)

**QRE Tracking:**
- Every invoice flagged as HTC QRE contributes to the QRE running total
- QRE category breakdown required by NPS:
  - Structural components (walls, floors, roof, HVAC, plumbing, electrical)
  - Architectural fees directly related to rehabilitation
  - Other qualified expenses
- Non-QRE costs tracked separately: land, new additions, personal property, developer fee, financing costs
- QRE threshold check: total QREs must exceed the greater of (a) adjusted basis of the building or (b) $5,000. System tracks and alerts when threshold is met.
- Substantial rehabilitation test: QREs as % of adjusted basis, with target and current progress

**Reports generated:**
- **QRE Summary Report:** total QREs by category, month-by-month progression, cumulative total
- **HTC Cost Certification Package (draft):** formatted for submission to IRS and Missouri DHEWD. Includes all QREs by category, supporting invoice list, contractor certifications checklist.
- **Missouri State HTC QRE Report:** state-specific format (25% state credit on qualified costs)
- **Part 3 Certification Checklist:** all items required for NPS Part 3 / IRS Form 3468 completion, with status of each

**Adjusted basis tracking:** user enters the building's adjusted basis at project start. System tracks as QREs are recorded.

#### ITC Cost Certification (Investment Tax Credit -- Section 48)

**Qualified Energy Property (QEP) Tracking:**
- Invoices flagged as ITC QEP contribute to the qualified energy property basis
- QEP category breakdown:
  - Solar photovoltaic (30% base credit)
  - Solar thermal
  - Battery storage
  - Other qualifying energy property
- Interconnection costs (may qualify for smaller systems)
- Non-qualifying items: land, buildings (the structure itself), soft costs not directly related to energy property

**Reports generated:**
- **QEP Summary Report:** total qualified energy property costs by category, resulting ITC credit amount at applicable rate
- **ITC Cost Certification Package (draft):** formatted for IRS Form 3468 completion, with supporting invoice backup
- **Prevailing wage / apprenticeship tracking** (required for enhanced 30% credit under IRA rules): labor cost breakdown flagging compliance requirements

#### Combined Cost Certification Dashboard

For projects with multiple tax credit programs (e.g., LIHTC + HTC, LIHTC + ITC):
- Single dashboard showing all three certification buckets simultaneously
- Overlap flags: same invoice cannot typically be basis for both LIHTC and HTC QRE (IRS stacking rules) -- system flags conflicts and requires PM to resolve
- Final certification package: combined PDF with all three certification sections, ready for auditor

#### Auditor Access

- Auditor receives a read-only token link with access to the project's cost certification dashboard and the ability to download:
  - Full invoice register with all coding
  - All invoice PDFs (organized by category)
  - Supporting contracts
  - Draw history
  - Cost certification summary report
- No account required; tokenized access expires after configurable period

---

### 4.6 Reporting & Dashboards

#### Project Dashboard

Single-screen project health view:
- Budget health: total budget, committed, invoiced, available (visual progress bars)
- Contingency remaining ($ and %)
- Draw status: last draw date, amount, status of current draw in progress
- Outstanding invoices: count and total $ in the approval queue
- Open change orders: count and $ value (approved vs. pending)
- Cost certification status: LIHTC eligible basis %, HTC QREs %, ITC QEP %
- Compliance alerts: expired COIs, missing lien waivers, overbudget lines, missing W-9s
- Construction progress: % complete (aggregate from GC pay app SOV)

#### Anticipated Cost Report (ACR)

Full budget grid (see 4.1). Primary working document. Exportable to Excel, PDF, CSV.

#### Cash Flow Projection (MVP: manual entry; v1.1: schedule-integrated)

**MVP version:**
- PM manually enters projected monthly draw amounts per funding source
- System calculates actual draws to date vs. projection from approved invoices
- Projected vs. actual chart by source and month
- Sources & uses summary: total project cost vs. total committed funding by source

**v1.1 additions:**
- Auto-projection based on contract % complete progression and historical draw cadence
- Schedule integration: when construction timeline shifts, cash curve reprices automatically
- Cash need calendar: how much cash is needed, from which source, in which month, automatically calculated

#### Funding Source Tracker

Per source: name, type, total commitment, drawn to date, remaining available, next projected draw date and amount, conditions precedent checklist (manual, with status flags).

#### Portfolio Dashboard (v1.1)

Cross-project view for the principal:
- All active projects: budget, % complete, contingency remaining, next draw, last activity
- Total portfolio cost exposure
- Aggregate cash needs for next 30/60/90 days
- Projects with overruns or contingency below 5%

#### Standard Reports

All filterable by date range, exportable to PDF and CSV:
- Invoice Register
- Vendor Ledger (all transactions per vendor across all projects)
- Draw History
- Change Order Log
- Lien Waiver Status
- MWBE Participation Report (total spend by classification -- for lender and program reporting)
- 50% Test Report (LIHTC)
- QRE Tracker Report (HTC)
- QEP Tracker Report (ITC)
- Combined Cost Certification Summary
- Retainage Summary (held vs. released by vendor)
- 1099 Preparation Report
- W-9 Status Report

#### Lender / Investor / Auditor Portal (Read-Only)

- Token-based access, no login required
- Configurable scope: draw packages only, or full project dashboard
- Download available for all documents in scope
- Access log (who accessed, when, IP)
- Access expires after configurable period (default 90 days, renewable)

---

### 4.7 AI Integration Strategy

DevLedger uses AI selectively -- only where it saves meaningful time and where the cost per use is justified. The guiding principle: **AI runs on discrete, bounded tasks, not continuously**.

#### Where AI Is Used

| Feature | Model | Estimated Cost | When It Runs |
|---------|-------|---------------|--------------|
| Invoice PDF extraction (vendor, amount, date, line items) | Haiku | ~$0.01–$0.03/invoice | On upload |
| Budget line + tax credit flag suggestion (coding assistance) | Haiku | ~$0.005/invoice | During coding |
| Lien waiver extraction + validation (type, amount, period, claimant) | Haiku | ~$0.01–$0.02/waiver | On vendor upload |
| Proforma reader → budget import | Sonnet | ~$0.05–$0.15/proforma | Once at project setup |
| Draw cover letter draft | Haiku | ~$0.02/draw | On demand |
| Anomaly detection (invoice vs. contract variance flag) | Rule-based first, Haiku for edge cases | ~$0.005/invoice | On approval |
| Cost certification summary narrative | Sonnet | ~$0.10/certification run | On demand |
| Change order description cleanup | Haiku | ~$0.002/CO | On demand |

**Estimated total AI cost for a 5-project firm processing 100 invoices/month and 50 lien waivers/month:** ~$5–$17/month. Well within a $30/month API budget.

#### Claude Code Integration (Zero Additional Cost)

Several AI tasks are better run through Claude Code by the PM than embedded in the web app. These tasks use Claude Code's existing subscription rather than additional API tokens:

- **Proforma import:** `/proforma-import [filename]` -- Claude Code reads the proforma Excel/PDF and outputs a CSV ready to import into DevLedger
- **Cost certification review:** PM dumps cost data from DevLedger CSV export and asks Claude Code to review for gaps, inconsistencies, or stacking rule violations
- **Draw package QA:** PM exports a draft draw package PDF and asks Claude Code to review for completeness and flag missing items
- **Vendor research:** Ask Claude Code to research a vendor, check license status, or draft a contract summary

#### What AI Does NOT Do

- Does not auto-approve invoices (all approvals are human)
- Does not make budget reallocation decisions
- Does not submit draw packages (always reviewed by PM before submission)
- Does not have write access to financial records without human review step
- Does not run continuously in the background burning tokens on unchanged data

#### API Key Setup

DevLedger uses a separate Anthropic API key (not the Claude Code subscription). The API key is entered in admin settings. Budget cap configurable (e.g., $30/month hard limit). If the cap is hit, AI features degrade gracefully -- forms still work, just without pre-fill suggestions.

---

### 4.8 Integrations

#### MVP (Day One)

- **Drag-and-drop file upload:** PDF, JPG, PNG, Excel directly from local machine or browser drag
- **Google Drive picker (read):** When uploading a document, optionally pick from Google Drive instead of local machine. File is copied into DevLedger storage.
- **CSV import/export:** Budget, vendor list, contract list, invoice register -- all importable and exportable via CSV with documented templates
- **PDF generation:** All draw packages, reports, and cost certification documents generated server-side (Puppeteer/React-PDF). No third-party dependency.
- **Email notifications:** SMTP (SendGrid or similar) for approval requests, COI expiration alerts, lien waiver requests, draw status updates

#### v1.1 (Post-MVP)

- **QuickBooks Online API:** Push approved invoices as QBO Bills with vendor, amount, account code. Pull payment confirmations back to mark invoices paid. Two-way sync.
- **Google Drive (write):** Save generated draw packages directly to a specified Drive folder
- **DocuSign / HelloSign:** Send lien waiver forms for e-signature from the invoice record. Signed document auto-returns and uploads.
- **Email-to-invoice intake (IMAP):** Dedicated project email address; incoming PDF attachments auto-queued for review

#### v2

- **Procore:** Pull schedule of values and % complete from GC's Procore account
- **Yardi:** Two-way accounting sync for larger firms
- **Built / Rabbet:** Export draw packages in lender platform format
- **Plaid:** Bank feed for payment reconciliation

---

## 5. User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Admin** | Full system access | All permissions; manage users; configure templates; manage API keys |
| **Project Manager** | Day-to-day project operator | Create/edit invoices, contracts, draws, vendors; cannot approve own invoices |
| **Controller** | Accounting review and payment | Approve invoices; mark payments; export to QBO; view all project data |
| **Principal** | Executive oversight | Approve budget transfers and COs above threshold; view portfolio dashboard; approve draws for submission |
| **Viewer** | Internal read-only | View all project data, no edits |
| **Lender (external)** | Token-based, no login | View and download draw packages and budget reports for one project |
| **Auditor (external)** | Token-based, no login | View cost certification dashboard and download supporting documents |
| **Vendor (external)** | Token-based, no login | Submit invoices, upload COI, upload lien waivers, check payment status for one project |

**Approval thresholds:** Configurable per project. Example default: auto-approve invoices under $500 after PM codes; PM approves $500–$5K; controller approves $5K–$25K; principal approves over $25K.

**Dual-control rule:** No user can approve their own submission. Enforced in code, not just policy.

---

## 6. Data Model Overview

### Core Entities

```
Project
  ├── FundingSource (many)
  ├── BudgetLine (many)
  │     └── BudgetLineSourceAllocation (many: BudgetLine ↔ FundingSource with %)
  ├── Contract (many)
  │     ├── Vendor
  │     ├── ScheduleOfValuesLine (many)
  │     ├── ChangeOrder (many)
  │     └── LienWaiver (many: by pay period)
  ├── Invoice (many)
  │     ├── Vendor
  │     ├── InvoiceLineItem (many: amount, BudgetLine, FundingSource, basisEligible, htcQRE, itcQEP)
  │     ├── ApprovalEvent (many: immutable)
  │     └── LienWaiver (conditional + unconditional)
  ├── DrawPeriod (many)
  │     ├── FundingSource
  │     ├── DrawTemplate (linked)
  │     └── DrawLineItem (many: Invoice ↔ amount drawn this period)
  ├── CashFlowProjection (many: per FundingSource, per month)
  ├── BudgetTransfer (many: immutable audit log)
  └── CostCertification (one per tax credit program per project)
        ├── LIHTCCertification
        ├── HTCCertification
        └── ITCCertification

Vendor (global)
  └── ComplianceDocument (many: COI, W-9, prequalification, MWBE cert)

DrawTemplate (global, reusable)
  └── DrawTemplateSection (many: ordered, typed)

User
  └── ProjectRole (many: User ↔ Project with role + thresholds)

AuditEvent (immutable: all financial record changes)
```

### Key Relationships

- **Invoice → BudgetLine:** Many-to-many with amount. One invoice can split across multiple lines.
- **Invoice → FundingSource:** Derived from BudgetLine allocations; overridable per invoice.
- **Contract → BudgetLine:** Many-to-many. GC contract may span multiple lines (general conditions, concrete, framing, etc.).
- **DrawLineItem → Invoice:** Many draws can include the same invoice for different sources with different amounts.
- **InvoiceLineItem → CostCertification:** Basis-eligible and QRE flags on invoice line items feed directly into the certification aggregations.
- **CashFlowProjection:** Per funding source, per month. Stores PM-entered projection amount; actual is derived from funded DrawPeriods.

### Audit Trail

Every create/update/delete on financial records creates an immutable AuditEvent: user, action, timestamp, before/after values. Audit events are never deleted. Retention is indefinite by default (LIHTC compliance requires records for the compliance period: up to 30 years).

---

## 7. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR for draw package rendering; strong ecosystem; deploys to Vercel |
| **UI components** | shadcn/ui + Tailwind CSS | Fast, accessible, matches Northspyre's clean grid aesthetic |
| **Backend** | Next.js API routes + tRPC | Full-stack TypeScript; type-safe end-to-end; minimal ops overhead |
| **Database** | PostgreSQL (Neon for cloud) | Relational integrity critical for financial data |
| **ORM** | Prisma | Type-safe schema + migrations |
| **Auth** | NextAuth.js v5 + Google OAuth | Team signs in with Google accounts; PM controls the allowlist |
| **File storage** | Cloudflare R2 (free 10GB; S3-compatible) | Invoice PDFs, lien waivers, draw packages |
| **PDF generation** | @react-pdf/renderer + Puppeteer | React-PDF for structured reports; Puppeteer for complex draw templates |
| **AI** | Anthropic API (claude-haiku-4-5 + claude-sonnet-4-6) | Invoice extraction, lien waiver validation (Haiku); proforma reader and certification (Sonnet) |
| **Email** | Resend or SendGrid | Approval notifications, COI alerts, lien waiver requests |
| **Deployment** | Vercel (app) + Neon (database) + Cloudflare R2 (files) | Zero-ops cloud; accessible from anywhere; HTTPS + custom domain automatic |

### Estimated Monthly Infrastructure Cost

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro (team) | $20/month |
| Neon PostgreSQL | Free tier (10GB) | $0 |
| Cloudflare R2 | Free (10GB storage + 10M requests) | $0 |
| Resend email | Free (3K emails/month) | $0 |
| Anthropic API | Light AI usage (5 projects, ~100 invoices + 50 waivers/month) | ~$10–$20/month |
| **Total** | | **~$30–$40/month** |

### Team Access

- Everyone accesses the same URL from any location (browser, no install)
- Google OAuth login -- PM adds new team members by whitelisting their Google email in admin settings
- No VPN, no shared machine, no per-seat software license

### Self-Hosting Option (Secondary)

Docker Compose config included in the repo for firms that want full on-prem. Requires: 2 vCPU / 4GB RAM server, Docker, Caddy for HTTPS. Estimated cost: ~$6–$15/month on Hetzner or DigitalOcean.

### GitHub Repository

- `github.com/jblackchevy/devledger`
- Team members invited as collaborators with write access to feature branches
- Branch protection on `main`: require one approved review before merge
- Open to external contributors via fork + PR

---

## 8. MVP Scope (8 Weeks)

### Build in MVP

1. Guided project setup wizard (5-step onboarding + empty state prompts per module)
2. Project creation + capital stack definition
3. Budget import (CSV + Northspyre-compatible Excel template download)
4. AI proforma reader → budget import CSV output
5. Anticipated Cost Report (live grid with all columns, inline editing)
6. Budget transfers (with approval workflow)
7. Vendor directory (global)
8. COI tracking with expiration alerts
9. Contract entry + change order management
10. Invoice intake: drag-and-drop PDF + Claude Haiku OCR extraction
11. Invoice coding with AI line suggestion
12. Invoice approval workflow (threshold-based, dual-control)
13. Email notifications (invoice approval, rejection, COI expiration, draw status, budget overrun)
14. Lien waiver tracking + AI validation (Haiku extracts type, amount, period; flags mismatches; e-signature in v1.1)
15. Draw package assembly (invoice selection by source + period)
16. Custom draw template builder (cover letter + 4 section types)
17. Draw package PDF generation
18. Cash flow projection: manual monthly entry + projected vs. actual chart per source
19. LIHTC cost certification tracker (eligible basis running total)
20. HTC cost certification tracker (QRE running total by category)
21. ITC cost certification tracker (QEP running total by category)
22. Cost certification report export
23. Standard reports: invoice register, draw history, change order log
24. User roles: Admin, PM, Controller, Principal, Viewer
25. Token-based external access (lender, auditor)
26. Google OAuth auth + team allowlist
27. Vercel + Neon + R2 cloud deployment

### Defer to v1.1

- Email-to-invoice IMAP intake
- Portfolio dashboard (multi-project view)
- Vendor self-service portal
- QuickBooks Online API sync
- Google Drive write (save draw packages to Drive)
- DocuSign lien waiver e-signature
- GC pay application web form (AIA G702/G703 intake)
- W-9 / 1099 management
- Cash flow projection: schedule-integrated automatic reprice
- 50% test alert automation
- Subcontractor prequalification form
- AIA G702/G703 formatted output section in draw templates
- TIF-specific draw format (PIEA)

### Defer to v2

- Procore % complete sync
- Yardi accounting sync
- Built / Rabbet draw package export
- Mobile-first UI optimization
- Budget scenario modeling
- Plaid bank feed reconciliation
- Multi-tenancy (SaaS variant)

### Not Building

- Pre-construction pro forma modeling (separate tool)
- Lease-up / property management
- Payroll
- General ledger / accounting (DevLedger is a project cost control layer above the GL)
- Vendor marketplace / AI bidding intelligence (requires proprietary cross-customer dataset)

---

## 9. User Roles & Approval Configuration

(See Section 5 above for role definitions.)

### Suggested Default Configuration for a 4-Person ADG-Style Team

| User | Role | Invoice Approval Threshold |
|------|------|---------------------------|
| Principal | Principal | All; required above $25K |
| Project Manager | Project Manager | Up to $5K |
| Controller | Controller | $5K–$25K |
| Project Coordinator | Project Manager | Up to $2K |

---

## 10. Onboarding & Data Migration

### New Project (Greenfield)

1. Create project → guided wizard through name, type, key dates, capital stack
2. Download the Northspyre-compatible budget Excel template
3. Fill it out (or let Claude Code read your proforma and pre-fill it), import via CSV
4. Add vendors: CSV import using vendor template, or manual entry
5. Add contracts: CSV import or manual entry per contract
6. Start processing invoices: drag and drop from day one

**Time to onboard a new greenfield project:** ~2–4 hours for a project with a standard budget and 10–20 vendors. The onboarding wizard reduces the first 30 minutes significantly.

### In-Flight Project (Mid-Construction)

The goal is getting running totals right, not importing full history.

1. Create project and capital stack as above
2. Import budget
3. Add contracts -- this establishes committed amounts. Import all executed contracts (contract value = committed; do not try to reconstruct prior pay applications).
4. **Enter cumulative draws to date** per funding source as a starting balance (a single "prior draws" entry per source). This makes the remaining balance correct.
5. Enter retainage withheld to date per contract as a starting balance field
6. For cost certification: enter cumulative basis-eligible costs to date and QREs to date as starting balances (pulled from your prior cost tracking spreadsheet). Going forward, new invoices are coded with flags and accumulate from there.
7. For cash flow projection: enter actuals to date as a starting balance per source; then set monthly projections going forward.
8. Process invoices going forward from the current draw period. Do not try to re-enter prior invoices individually.

**Historical invoice detail is not needed** for the system to function. The running totals are what matter.

### CSV Import Templates (Provided in Repo)

- `budget-import-template.xlsx` -- Northspyre-compatible format
- `vendor-import-template.csv` -- vendor directory columns
- `contract-import-template.csv` -- contract list columns
- `invoice-import-template.csv` -- for bulk-loading prior period invoices if desired (optional)

### Claude Code Proforma Reader

For new projects: PM runs the following in the Claude Code terminal:

```
/proforma-import path/to/proforma.xlsx
```

Claude Code reads the proforma, maps line items to DevLedger budget categories, outputs `budget-import-ready.csv` in the same directory. PM reviews the mapping (Claude flags uncertain lines), then imports the CSV into DevLedger. One-time per project setup.

---

## 11. Open Questions

1. **Repository name/handle:** ~~Resolved — repo lives at `github.com/jblackchevy/devledger`.~~
2. **Missouri HTC specifics:** The state HTC uses the same QRE definition as federal but requires a separate certification to DHEWD. Should the state and federal HTC certifications be separate sub-sections in the cost certification module?
3. **Draw template portability:** Should draw templates be shareable across DevLedger installations (a public template library for common lender formats)?
4. **PIEA format configuration:** The TIF draw format is Kansas City PIEA-specific. Should it be configurable so other TIF jurisdictions can define their own fields?
5. **Retainage reduction:** Some GMP contracts reduce retainage from 10% to 5% at 50% completion. MVP supports a single retainage rate per contract. Is variable retainage needed in MVP?
6. **Audit event retention:** LIHTC extended use agreements run 30-40 years. Database strategy for very long audit trails?
7. **File storage long-term:** 30 years of invoice PDFs per project is substantial. Archival storage tier after project closeout?
8. **1099 integration:** QBO handles 1099 filing -- is exporting a 1099 report to QBO sufficient, or does the team need in-app 1099 filing?
9. **ITC prevailing wage tracking:** The enhanced 30% ITC credit under the Inflation Reduction Act requires prevailing wage and apprenticeship documentation. How granular does labor cost tracking need to be?
10. **External contributor licensing:** AGPL-3.0 means contributors must agree to the same license. Is a Contributor License Agreement (CLA) needed, or is the AGPL implicit agreement sufficient?

---

## 12. Competitive Differentiation

This section documents where DevLedger wins, where it matches, and where it honestly defers. It exists to prevent scope creep toward parity features and to keep investment focused on genuine advantages.

### Where DevLedger Wins Outright

**Cost — the defining advantage.**
Northspyre runs ~$12,000–$15,000/year per project. A firm with 5 active projects pays $60K–$75K/year. DevLedger runs ~$30–$40/month total regardless of project count. For ADG's scale, that's a $70K/year swing — enough to justify the build entirely on economics alone.

**Lien waiver AI validation.**
Northspyre's lien waiver management is their most-complained-about feature ("could use revamping" appears verbatim in Capterra reviews). Rabbet has built their entire competitive differentiation around AI-powered waiver classification. DevLedger ships lien waiver AI validation in MVP — extracting type, amount, period, and claimant from uploaded PDFs and validating against the invoice record before marking waivers on file. This beats Northspyre outright and matches Rabbet's core claim from day one.

**HTC and ITC cost certification.**
Northspyre has LIHTC compliance tools (50% test, basis tracking) but its HTC and ITC cost certification support is limited. DevLedger treats all three programs as first-class modules from day one, with QRE category tracking, Missouri state HTC reporting, and ITC qualified energy property basis — features that directly serve ADG's deal types.

**PIEA TIF-specific draws.**
No competitor has this. Kansas City's PIEA TIF requisition format is a real workflow that currently runs through manual Excel. DevLedger builds this in.

**Email approval notifications.**
Northspyre users explicitly report this as missing. "No email alerts that invoices are ready to approve" is one of the most common negative Capterra reviews. DevLedger ships this in MVP across all approval workflows — invoices, draw packages, COI expirations, budget transfers.

**Custom draw template builder.**
Northspyre's draw templates are configurable but within a fixed structure. DevLedger's template builder lets PMs build section-by-section layouts from scratch, assign templates per funding source, and export/import templates between installations. This directly serves ADG's need to maintain separate Busey, PIEA TIF, and LIHTC equity draw formats simultaneously.

**Open source / no vendor lock-in.**
AGPL-3.0. All data exportable via CSV at any time. No per-seat licensing. Self-hosting option included. If Northspyre raises prices or changes terms, ADG's workflow is unaffected.

### Where Northspyre Wins (honest assessment)

**Vendor marketplace and AI bidding intelligence.**
Northspyre has a database of 100,000+ vendors with AI-powered bid analysis that flags scope gaps in incoming proposals and recommends vendors likely to bid competitively. This is trained on $175B+ in historical project data. DevLedger cannot replicate this without the dataset. Verdict: defer indefinitely.

**Portfolio analytics.**
Northspyre's Portfolio Analytics Plus cross-references cost data across all projects, identifies budget categories consistently underestimated, tracks vendor overrun patterns portfolio-wide, and normalizes costs for inflation. Valuable for a 10+ project firm; less critical for ADG's current scale. Verdict: v1.1.

**Schedule-integrated cash flow reprice.**
Northspyre integrates construction schedules so when a milestone slips, the cash flow curve reprices automatically. DevLedger's MVP version is manual entry only. Verdict: v1.1 with automatic projection.

**10 accounting system integrations.**
Northspyre integrates bidirectionally with Yardi, MRI, Sage Intacct, Sage 300, QuickBooks (online + desktop), RealPage, Acumatica, Oracle JDE, and Nexus. DevLedger ships QBO in v1.1; others in v2. For ADG (QBO shop), this gap is irrelevant in practice.

### Where Rabbet Had an Edge (now matched or beaten)

Rabbet's origin is lender-side draw management, adapted for developers. Its two meaningful differentiators over Northspyre were:
1. AI-powered lien waiver validation at the line-item level
2. AvidXchange and Bill.com integrations

DevLedger beats Rabbet on #1 (lien waiver AI in MVP). AvidXchange and Bill.com integration are deferred — not relevant to ADG's current stack.

Rabbet's structural weakness: it documents what happened (reactive), while Northspyre anticipates what's coming (proactive). DevLedger is designed to be proactive — the cash flow projection, budget alerts, compliance warnings, and draw package readiness checks are all forward-looking.

### What DevLedger Is Not Trying to Do

- Replace Procore (GC-side field execution tool; DevLedger is owner-side)
- Replace QuickBooks or Yardi (GL/accounting layer; DevLedger sits above it)
- Compete with pre-construction proforma tools (DevLedger starts at budget setup, not underwriting)
- Serve lenders directly (Rabbet/Built lender-side is a different market)
- Build a vendor network (requires cross-customer data that doesn't exist at launch)
