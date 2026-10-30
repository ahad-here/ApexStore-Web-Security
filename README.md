# ApexStore & Digital Wallet — Web Security Project (Part 2)

> **Information Security Practical Assignment 2**  
> **Course:** Information Security (CS-3004)  
> **Institution:** FAST NUCES (CFD Campus)  
> **Academic Session:** Fall 2026

---

## 1. Project Overview & Architecture

**ApexStore** is a realistic, full-stack e-commerce store and digital financial wallet application built for the Information Security Practical Assignment. It models standard production flows including customer registration, administrative role authorization, catalog browsing with search and category filters, product reviews, coupon redemption, and peer-to-peer wallet transactions.

To satisfy the academic requirement of providing both a **Vulnerable Version** and a **Safe Version** within a single project, the application incorporates a live, switchable **Security Mode Toggle**:

- 🔴 **Vulnerable Mode (Red Team):** Demonstrates real-world, unmitigated OWASP Top 10 vulnerabilities (XSS, CSRF, and SQL Injection) executing against genuine database tables and client rendering sinks.
- 🟢 **Safe Mode (Blue Team):** Implements industry-standard defensive controls across the exact same routes: parameterized prepared statements, context-aware HTML entity output encoding, DOM-safe properties, anti-CSRF synchronizer tokens, and strict cookie policies.

---

## 2. Technology Stack

- **Runtime:** Node.js (v18+)
- **Backend Framework:** Express.js (`express`)
- **Database:** SQLite via native `node:sqlite` (zero-configuration embedded database; data file stored locally in `database/apexstore.db`)
- **Session & Cookies:** `express-session`, `cookie-parser`
- **Frontend / Views:** Server-Side Templating with EJS + Tailwind CSS CDN
- **Password Security:** `bcryptjs`
- **Attacker Infrastructure:** Dedicated Express instance running on port `4000` (`http://localhost:4000`) to demonstrate cross-origin CSRF exploits against the application on port `3000`.

---

## 3. Setup and Execution

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Seed the Database

Populates initial sample products, promotional coupons, user accounts, and starting wallet balances:

```bash
npm run seed
```

### 3.3 Run the Application Server (Port 3000)

```bash
npm start
```

The target web store will be running at: **`http://localhost:3000`**

### 3.4 Run the External Attacker Server (Port 4000)

In a separate terminal window:

```bash
npm run attacker
```

The attacker portal will be running at: **`http://localhost:4000`**

### 3.5 Run the Automated Verification Suite

To execute end-to-end tests validating exploit success in Vulnerable Mode and clean prevention in Safe Mode:

```bash
npm test
```

---

## 4. Pre-Seeded Demonstration Accounts

| Username   | Password      | Role          | Wallet Balance | Primary Demonstration Use                               |
| :--------- | :------------ | :------------ | :------------- | :------------------------------------------------------ |
| `admin`    | `admin123`    | Administrator | $5,000.00      | Authentication Bypass & Database Credential Dumping     |
| `alice`    | `alice123`    | Customer      | $1,250.00      | Target victim account for Cross-Site Request Forgery    |
| `bob`      | `bob123`      | Customer      | $850.00        | Recipient account for transfer verification             |
| `attacker` | `attacker123` | Customer      | $50.00         | Destination wallet for unauthorized CSRF funds transfer |

---

## 5. Implemented Vulnerabilities & Blue Team Defenses

### 5.1 Cross-Site Scripting (XSS) — 25 Marks

#### 1. Reflected XSS

- **Location:** `GET /search?q=...`
- **Root Cause:** User input from the query string is reflected verbatim into `views/pages/search.ejs` using unescaped template tags (`<%- query %>`).
- **Exploit Payload:**
  ```html
  <script>
    alert("Reflected-XSS");
  </script>
  ```
- **Blue Team Defense:** In Safe Mode, the view switches to contextual HTML entity encoding (`<%= query %>`), transforming dangerous characters (`<`, `>`, `&`, `"`) into inert HTML entities (`&lt;script&gt;`).

#### 2. Stored XSS

- **Location:** `POST /products/:id/review` & `GET /products/:id`
- **Root Cause:** Customer reviews submitted through the product page form are inserted unvalidated into the SQLite `reviews` table and displayed back using `<%- review.comment %>`.
- **Exploit Payload:**
  ```html
  <img src="x" onerror="alert('Stored XSS - ' + document.domain)" />
  ```
- **Blue Team Defense:** In Safe Mode, server-side input sanitization strips executable tags prior to database storage, and the template outputs reviews through escaped tags (`<%= review.comment %>`).

#### 3. DOM-Based XSS

- **Location:** `http://localhost:3000/#promo=...`
- **Root Cause:** Client-side script `public/js/dom-xss.js` extracts data from `window.location.hash` and writes it directly into an execution sink via `element.innerHTML`.
- **Exploit Payload:**
  ```text
  http://localhost:3000/#promo=<img src=x onerror=alert('DOM-XSS')>
  ```
- **Blue Team Defense:** In Safe Mode, `dom-xss.js` sets the content using `element.textContent`, forcing the browser to parse the fragment strictly as text without HTML parsing.

---

### 5.2 Cross-Site Request Forgery (CSRF) — 15 Marks

- **Target Action:** `POST http://localhost:3000/wallet/transfer` (`recipient=attacker&amount=500.00`)
- **Attacker Origin:** `http://localhost:4000/csrf-transfer.html`
- **Root Cause:** State-changing fund transfer operations rely purely on browser session cookies without verifying the request origin or requiring an anti-CSRF token.
- **Exploit Mechanism:**
  1. A victim user (such as `alice`) logs into ApexStore on `http://localhost:3000`.
  2. The victim visits the attacker-controlled page at `http://localhost:4000/csrf-transfer.html` (e.g. via a phishing link).
  3. The page executes an auto-submitting hidden HTML `<form>` targeting `http://localhost:3000/wallet/transfer`.
  4. The browser automatically includes the victim's session cookie with the cross-origin request, causing $500.00 to be transferred without the victim's knowledge or consent.
- **Blue Team Defense:**
  - **Synchronizer Token Pattern:** In Safe Mode, every state-changing form includes a cryptographically random `_csrf` token tied to the user's session. The backend `csrfProtection` middleware validates this token on all `POST` requests and rejects missing/invalid tokens with **HTTP 403 Forbidden**.
  - **Strict Cookie Flags:** Session cookies are configured with `SameSite=Strict`.

---

### 5.3 SQL Injection (SQLi) — 30 Marks

#### Level 1: Easy — Authentication Bypass

- **Location:** `POST /login`
- **Root Cause:** The authentication controller builds the SQL query via direct string interpolation:
  ```sql
  SELECT * FROM users WHERE username = '${username}' AND password = '${password}'
  ```
- **Exploit Payload:**
  - Username: `admin' --` (or `' OR '1'='1' --`)
  - Password: `[any string]`
- **Result:** Injected SQL syntax terminates the password clause, logging in as the administrator.
- **Blue Team Defense:** Parameterized query using prepared statements (`db.prepare('SELECT * FROM users WHERE username = ?')`) combined with secure `bcryptjs` password verification.

#### Level 2: Intermediate — Blind Boolean-Based Inference

- **Location:** `POST /coupon/validate` & `GET /api/coupon/validate`
- **Root Cause:** Direct string concatenation in a discount verification query that returns only a binary state: **Valid (True)** or **Invalid (False)**.
- **Exploit Payloads:**
  - _True Condition:_
    ```sql
    WELCOME10' AND (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin')='$' --
    ```
    _(Returns "Coupon Valid", confirming the first character of the password hash is `$`)._
  - _False Condition:_
    ```sql
    WELCOME10' AND (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin')='Z' --
    ```
    _(Returns "Coupon Invalid")._
- **Blue Team Defense:** Parameterized prepared statement (`db.prepare('SELECT id, discount_percent FROM coupons WHERE code = ? AND is_active = 1')`), preventing boolean injection.

#### Level 3: Advanced — Structured Multi-Stage UNION Attack Chain

- **Location:** `GET /catalog?category=...`
- **Root Cause:** Product category filter executes raw concatenated SQL:
  ```sql
  SELECT id, title, category, price, description FROM products WHERE category = '${category}'
  ```
- **Structured Attack Chain:**

| Stage       | Goal                     | Payload                                                                             | Observed Result                                                                                |
| :---------- | :----------------------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Stage 1** | Column Count Enumeration | `' UNION SELECT 1, 2, 3, 4, 5 --`                                                   | Returns numeric placeholders across the 5 product fields, determining column width.            |
| **Stage 2** | Database Table Discovery | `' UNION SELECT 1, tbl_name, type, 4, sql FROM sqlite_master WHERE type='table' --` | Discovers target table `users` inside the SQLite system catalog.                               |
| **Stage 3** | Target Schema Extraction | `' UNION SELECT 1, name, sql, 4, 5 FROM sqlite_master WHERE tbl_name='users' --`    | Extracts the schema definition and column names for the `users` table.                         |
| **Stage 4** | Sensitive Data Dumping   | `' UNION SELECT id, username, email, wallet_balance, password FROM users --`        | Exfiltrates user emails, balances, and password hashes directly into the product catalog view. |

- **Blue Team Defense:** Parameterized query with bound parameters (`db.prepare('SELECT ... WHERE category = ?').all(category)`), disallowing statement manipulation.

---

## 6. Project Structure

```text
IS-Assignment/
├── package.json                   # Project configuration and npm scripts
├── README.md                      # Project documentation and submission guide
├── database/
│   ├── db.js                      # Database initialization and table definitions
│   └── seed.js                    # Initial demo accounts, products, and coupons
├── src/
│   ├── app.js                     # Main Express application configuration
│   ├── middleware/
│   │   ├── auth.js                # Session authentication check
│   │   ├── csrfProtection.js      # Anti-CSRF token verification for Safe Mode
│   │   └── securityMode.js        # Global dual-mode (Vulnerable vs Safe) toggle
│   └── controllers/
│       ├── authController.js      # Login logic (Easy SQLi vs Parameterized)
│       ├── catalogController.js   # Products & Search (Advanced SQLi & Reflected XSS)
│       ├── couponController.js    # Coupon checks (Blind Boolean SQLi)
│       ├── reviewController.js    # Comments (Stored XSS)
│       └── walletController.js    # Fund transfers (CSRF demonstration)
├── views/
│   ├── layouts/
│   │   ├── header.ejs             # Navigation and Security Mode Switcher banner
│   │   └── footer.ejs
│   └── pages/
│       ├── index.ejs              # Dashboard & featured products
│       ├── login.ejs              # Sign-in form (Easy SQLi target)
│       ├── catalog.ejs            # Catalog & filter (Advanced SQLi target)
│       ├── coupon.ejs             # Promo code lookup (Blind SQLi target)
│       ├── product-detail.ejs     # Reviews (Stored XSS target)
│       ├── search.ejs             # Product search (Reflected XSS target)
│       ├── wallet.ejs             # Balance & transfer (CSRF target)
│       └── error.ejs              # Error display page
├── public/
│   ├── css/style.css              # Custom styling
│   └── js/
│       ├── main.js                # Core UI scripts
│       └── dom-xss.js             # Client-side hash processor (DOM XSS target)
├── attacker/
│   ├── attackerServer.js          # Independent server on port 4000
│   └── public/
│       ├── index.html             # Phishing portal landing page
│       └── csrf-transfer.html     # Auto-submitting CSRF exploit form
└── tests/
    └── exploits.test.js           # Automated exploit and defense verification suite
```
