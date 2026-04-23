# Grow4Me USSD Integration Strategy

## 1. Introduction
USSD (Unstructured Supplementary Service Data) provides a critical channel for agricultural workers, farmers, and project managers who rely on feature phones or operate in areas with poor internet connectivity. Because USSD is menu-driven, session-based, and has strict character limits (typically 160 characters per screen), features must be simplified, direct, and actionable.

Based on the core capabilities of the Grow4Me backend (outlined in `PROJECT_DESCRIPTION.md`), this document outlines the features best suited for USSD implementation.

---

## 2. Core USSD Features

### 💰 1. Quick Expense Logging
**Why:** Farm workers need to log operational expenses immediately in the field without a smartphone.
**How it works:**
- User selects their active Project/Budget from a numbered list.
- Selects an existing Category (e.g., `1. Labor`, `2. Materials`, `3. Transport`).
- Enters the monetary amount and optionally a very short text description (e.g., "Tractor fuel").
- **Backend Action:** Triggers the `POST /budget/expenses/create` endpoint.

### 📦 2. Stock & Inventory Adjustments
**Why:** Real-time stock counts (e.g., bags of fertilizer used, crates of eggs collected) are crucial for stopping theft and poor planning.
**How it works:**
- **Check Stock:** User selects a tracked budget item to view its current aggregated stock level.
- **Update Stock:** User selects an item, chooses `1. Add Stock` or `2. Remove Stock`, and enters the quantity.
- **Backend Action:** Triggers the `POST /budget/inventory/edit` endpoint to log a new `InventoryMovement`.

### 📈 3. Sales & Revenue Recording
**Why:** Quick recording of sales at the farm gate or local market.
**How it works:**
- User inputs the product sold, quantity, price per unit, and total amount received.
- **Backend Action:** Triggers the `POST /budget/sales/create` endpoint. If the product is linked to inventory, it automatically deducts the stock.

### 🧠 4. AI-Powered "Smart Log" (Natural Language)
**Why:** Navigating deep USSD menus can be slow. An AI parser can handle free-form text quickly if the user knows how to type efficiently.
**How it works:**
- The USSD menu has a "Smart Entry" option where the user types a single sentence (e.g., "Sold 10 bags maize for 500" or "Spent 200 on weeding").
- **Backend Action:** The text string is sent to the `POST /budget/ai-translate` endpoint, which uses Gemini 2.0 Flash to deduce whether it's an expense or sale, the amounts, and the categories involved, auto-saving the records.

### 📊 5. Financial Pulse (Mini-Dashboard/SMS Stats)
**Why:** Project owners need quick visibility into their financial health and budget limits while offline.
**How it works:**
- Provides a highly condensed text summary of the current project year.
- Displays format: `Budget:50K | Spent:40K | Left:10K | Sales:500`.
- **Backend Action:** Calls a simplified version of `GET /budget/dashboard/summary` and `GET /budget/dashboard/financials`.

---

## 3. Proposed USSD Menu Flow (Example: `*123*#`)

**Main Menu**
```text
Welcome to Grow4Me
1. Record Expense
2. Record Sale
3. Manage Stock
4. Smart Ask (AI)
5. View Acct Balance
6. Change Project
```

**Example Flow: Recording an Expense (Option 1)**
1. **Screen 1:** `Select Category: 1.Labour 2.Seeds 3.Fertilizer` *(User replies: 1)*
2. **Screen 2:** `Enter Amount:` *(User replies: 500)*
3. **Screen 3:** `Enter brief note (optional) or 0 to skip:` *(User replies: Weeding)*
4. **Screen 4:** `Confirm Expense: 500 for Labour (Weeding). 1. Yes 2. No` *(User replies: 1)*
5. **Screen 5:** `Success! Expense recorded. Ref: EXP-842`

---

## 4. Backend Technical Considerations for USSD

To successfully link these USSD features to the existing Django backend, the following modifications will be needed:

1. **USSD Gateway Webhook:** A new dedicated Django view (e.g., `POST /ussd/callback`) designed to receive and parse XML/JSON payloads from telecom aggregators (like Africa's Talking, Twilio, or Hubtel).
2. **Session State Management:** The backend (using Redis caching) must maintain a state machine for the USSD sessions. It needs to remember variables across screens (e.g., remembering the `Category` from Screen 1 while asking for the `Amount` in Screen 2).
3. **Phone Number Authentication:** USSD cannot use JWTs or Cookies. The system must authenticate users by looking up the incoming `MSISDN` (phone number) against their `User` or `Accounts` profile.
4. **Data Pagination:** If returning lists (like 20 categories), the backend must split the data into batches of 3-4 options with a `99. Next Page` option to respect the 160-character limit of USSD screens.
