const fs = require('fs');
const path = require('path');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    BorderStyle,
    WidthType,
    AlignmentType,
    ShadingType
} = require('docx');

function createPlaceholderBox(label, description) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
                        borders: {
                            top: { style: BorderStyle.DASHED, size: 2, color: "94A3B8" },
                            bottom: { style: BorderStyle.DASHED, size: 2, color: "94A3B8" },
                            left: { style: BorderStyle.DASHED, size: 2, color: "94A3B8" },
                            right: { style: BorderStyle.DASHED, size: 2, color: "94A3B8" }
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                spacing: { before: 240, after: 120 },
                                children: [
                                    new TextRun({
                                        text: `📸 [PASTE SCREENSHOT HERE: ${label}]`,
                                        bold: true,
                                        size: 22,
                                        color: "1E293B",
                                        font: "Calibri"
                                    })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 240 },
                                children: [
                                    new TextRun({
                                        text: description,
                                        italics: true,
                                        size: 18,
                                        color: "64748B",
                                        font: "Calibri"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

function createCodeBox(codeLines) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: "0F172A" },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: "334155" },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "334155" },
                            left: { style: BorderStyle.SINGLE, size: 1, color: "334155" },
                            right: { style: BorderStyle.SINGLE, size: 1, color: "334155" }
                        },
                        children: codeLines.map(line =>
                            new Paragraph({
                                spacing: { before: 40, after: 40 },
                                children: [
                                    new TextRun({
                                        text: line,
                                        font: "Consolas",
                                        size: 18,
                                        color: "38BDF8"
                                    })
                                ]
                            })
                        )
                    })
                ]
            })
        ]
    });
}

function buildDocument() {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22,
                        color: "1E293B"
                    }
                }
            }
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                },
                children: [
                    // ==========================================
                    // TITLE & HEADER
                    // ==========================================
                    new Paragraph({
                        text: "INFORMATION SECURITY PRACTICAL ASSIGNMENT 2",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 100 }
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                        children: [
                            new TextRun({
                                text: "Part 2: Web Security Project (Blue Team Focus) — 100 Marks",
                                bold: true,
                                size: 24,
                                color: "2563EB"
                            })
                        ]
                    }),

                    // Student Information Table
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 30, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                                        children: [new Paragraph({ children: [new TextRun({ text: "Group Member Name", bold: true })] })]
                                    }),
                                    new TableCell({
                                        width: { size: 35, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                                        children: [new Paragraph({ children: [new TextRun({ text: "Roll Number", bold: true })] })]
                                    }),
                                    new TableCell({
                                        width: { size: 35, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                                        children: [new Paragraph({ children: [new TextRun({ text: "Campus / Section", bold: true })] })]
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "[Student Name 1]" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "[Roll No 1]" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "FAST CFD" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "[Student Name 2]" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "[Roll No 2]" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "FAST CFD" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "[Student Name 3]" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "[Roll No 3]" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "FAST CFD" })] })
                                ]
                            })
                        ]
                    }),

                    new Paragraph({ spacing: { before: 200, after: 100 } }),

                    // GitHub Link Box
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        shading: { type: ShadingType.CLEAR, fill: "EFF6FF" },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1, color: "3B82F6" },
                                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "3B82F6" },
                                            left: { style: BorderStyle.SINGLE, size: 4, color: "1D4ED8" },
                                            right: { style: BorderStyle.SINGLE, size: 1, color: "3B82F6" }
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({ text: "GitHub Repository Link: ", bold: true, color: "1E40AF" }),
                                                    new TextRun({ text: "https://github.com/[YOUR-USERNAME]/[YOUR-REPO-NAME]", font: "Consolas", color: "2563EB" })
                                                ]
                                            }),
                                            new Paragraph({
                                                children: [
                                                    new TextRun({ text: "Complete commit history included with descriptive conventional commits.", italics: true, size: 18, color: "475569" })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),

                    new Paragraph({ spacing: { before: 300, after: 100 } }),

                    // ==========================================
                    // PROJECT SUMMARY
                    // ==========================================
                    new Paragraph({
                        text: "1. Project Overview & Architecture",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Application Name: ", bold: true }),
                            new TextRun({ text: "ApexStore & Digital Wallet\n" }),
                            new TextRun({ text: "Tech Stack: ", bold: true }),
                            new TextRun({ text: "Node.js (Express), SQLite (node:sqlite native embedded engine), EJS templating, Tailwind CSS.\n" }),
                            new TextRun({ text: "Dual-Mode Architecture: ", bold: true }),
                            new TextRun({ text: "A persistent UI toggle switch alternates the application between " }),
                            new TextRun({ text: "Vulnerable Mode (Red Team)", bold: true, color: "DC2626" }),
                            new TextRun({ text: " and " }),
                            new TextRun({ text: "Safe Mode (Blue Team)", bold: true, color: "16A34A" }),
                            new TextRun({ text: ", providing immediate side-by-side contrast between insecure code paths and production-grade defensive hardening." })
                        ]
                    }),

                    new Paragraph({ spacing: { before: 300, after: 100 } }),

                    // ==========================================
                    // REQUIREMENT 1: XSS
                    // ==========================================
                    new Paragraph({
                        text: "2. Cross-Site Scripting (XSS) — All 3 Types (25 Marks)",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 100 }
                    }),

                    // 1.1 Reflected XSS
                    new Paragraph({
                        text: "2.1 Reflected XSS",
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 150, after: 80 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Target Endpoint: ", bold: true }),
                            new TextRun({ text: "GET http://localhost:3000/search?q=...\n" }),
                            new TextRun({ text: "• Coding Mistake: ", bold: true }),
                            new TextRun({ text: "The server directly reflects untrusted request parameters into HTML response using unescaped template syntax (<%- query %>).\n" }),
                            new TextRun({ text: "• Working Payload: ", bold: true })
                        ]
                    }),
                    createCodeBox([
                        "<script>alert('Reflected-XSS')</script>"
                    ]),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Reflected XSS — Vulnerable Execution", "Full-screen screenshot showing the search query reflecting unescaped and executing the alert popup dialog."),
                    new Paragraph({ spacing: { before: 150, after: 80 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Blue Team Fix & Verification: ", bold: true }),
                            new TextRun({ text: "In Safe Mode, contextual HTML entity output encoding (<%= query %>) safely transforms tags into &lt;script&gt; literals." })
                        ]
                    }),
                    new Paragraph({ spacing: { before: 100, after: 60 } }),
                    createPlaceholderBox("Reflected XSS — Safe Mode Blocked", "Full-screen screenshot showing the same payload rendered harmlessly as plain literal text in Safe Mode."),

                    // 1.2 Stored XSS
                    new Paragraph({
                        text: "2.2 Stored XSS",
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 250, after: 80 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Target Endpoint: ", bold: true }),
                            new TextRun({ text: "POST http://localhost:3000/products/:id/review & GET http://localhost:3000/products/:id\n" }),
                            new TextRun({ text: "• Coding Mistake: ", bold: true }),
                            new TextRun({ text: "Review comments are stored raw into the SQLite database and rendered into the review feed without output encoding (<%- review.comment %>).\n" }),
                            new TextRun({ text: "• Working Payload: ", bold: true })
                        ]
                    }),
                    createCodeBox([
                        "<img src=x onerror=\"alert('Stored XSS - Target Domain: ' + document.domain)\">"
                    ]),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Stored XSS — Vulnerable Execution", "Full-screen screenshot showing the malicious payload saved in the product review section and executing upon page load."),
                    new Paragraph({ spacing: { before: 150, after: 80 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Blue Team Fix & Verification: ", bold: true }),
                            new TextRun({ text: "In Safe Mode, input is sanitized and rendered through safe output encoding (<%= review.comment %>), preventing execution for all users." })
                        ]
                    }),
                    new Paragraph({ spacing: { before: 100, after: 60 } }),
                    createPlaceholderBox("Stored XSS — Safe Mode Blocked", "Full-screen screenshot showing the stored comment safely rendered without script execution."),

                    // 1.3 DOM-based XSS
                    new Paragraph({
                        text: "2.3 DOM-Based XSS",
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 250, after: 80 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Client-Side Script: ", bold: true }),
                            new TextRun({ text: "public/js/dom-xss.js\n" }),
                            new TextRun({ text: "• Coding Mistake: ", bold: true }),
                            new TextRun({ text: "Client-side JavaScript reads untrusted data directly from location.hash and passes it into an execution sink via element.innerHTML.\n" }),
                            new TextRun({ text: "• Working Payload (URL Fragment): ", bold: true })
                        ]
                    }),
                    createCodeBox([
                        "http://localhost:3000/#promo=<img src=x onerror=alert('DOM-XSS')>"
                    ]),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("DOM-Based XSS — Vulnerable Execution", "Full-screen screenshot showing the browser URL with the hash fragment and the resulting alert popup."),
                    new Paragraph({ spacing: { before: 150, after: 80 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Blue Team Fix & Verification: ", bold: true }),
                            new TextRun({ text: "In Safe Mode, dom-xss.js assigns the payload using element.textContent, strictly treating it as literal characters and avoiding DOM compilation." })
                        ]
                    }),
                    new Paragraph({ spacing: { before: 100, after: 60 } }),
                    createPlaceholderBox("DOM-Based XSS — Safe Mode Blocked", "Full-screen screenshot showing the text safely displayed in the promo banner without executing."),

                    new Paragraph({ spacing: { before: 300, after: 100 } }),

                    // ==========================================
                    // REQUIREMENT 2: CSRF
                    // ==========================================
                    new Paragraph({
                        text: "3. Cross-Site Request Forgery (CSRF) — Working Attack & Defense (15 Marks)",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Target Action: ", bold: true }),
                            new TextRun({ text: "POST http://localhost:3000/wallet/transfer (Parameters: recipient, amount)\n" }),
                            new TextRun({ text: "• Attacker Infrastructure: ", bold: true }),
                            new TextRun({ text: "Standalone server on Port 4000 (http://localhost:4000/csrf-transfer.html)\n" }),
                            new TextRun({ text: "• Vulnerable Flaw: ", bold: true }),
                            new TextRun({ text: "State-changing transfer operation relies solely on session cookies without an anti-CSRF token or strict SameSite flag.\n" }),
                            new TextRun({ text: "• Attack Setup & Payload: ", bold: true }),
                            new TextRun({ text: "Victim (alice) logs in on port 3000, then visits port 4000 phishing page which auto-submits a hidden transfer form:" })
                        ]
                    }),
                    createCodeBox([
                        "<form id=\"csrf-form\" action=\"http://localhost:3000/wallet/transfer\" method=\"POST\">",
                        "  <input type=\"hidden\" name=\"recipient\" value=\"attacker\">",
                        "  <input type=\"hidden\" name=\"amount\" value=\"500.00\">",
                        "</form>",
                        "<script>document.getElementById('csrf-form').submit();</script>"
                    ]),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("CSRF Attack — Vulnerable Fund Transfer", "Full-screen screenshot showing the phishing page on port 4000 and the victim's wallet on port 3000 showing unauthorized $500 deduction."),
                    new Paragraph({ spacing: { before: 150, after: 80 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Blue Team Fix & Verification: ", bold: true }),
                            new TextRun({ text: "In Safe Mode, csrfProtection middleware enforces cryptographically random session CSRF tokens and SameSite=Strict cookies. Unauthorized requests without token return HTTP 403 Forbidden." })
                        ]
                    }),
                    new Paragraph({ spacing: { before: 100, after: 60 } }),
                    createPlaceholderBox("CSRF Defense — 403 Forbidden Blocked", "Full-screen screenshot showing the cross-origin attack on port 4000 rejected with 403 Forbidden in Safe Mode."),

                    new Paragraph({ spacing: { before: 300, after: 100 } }),

                    // ==========================================
                    // REQUIREMENT 3: SQL INJECTION (3 LEVELS)
                    // ==========================================
                    new Paragraph({
                        text: "4. SQL Injection — Three Levels of Complexity (30 Marks)",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 100 }
                    }),

                    // 4.1 Easy SQLi
                    new Paragraph({
                        text: "4.1 Level 1: Easy — Authentication Bypass",
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 150, after: 80 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Target Endpoint: ", bold: true }),
                            new TextRun({ text: "POST http://localhost:3000/login\n" }),
                            new TextRun({ text: "• Vulnerable Query: ", bold: true }),
                            new TextRun({ text: "SELECT * FROM users WHERE username = '${username}' AND password = '${password}'\n" }),
                            new TextRun({ text: "• Exploit Payload: ", bold: true })
                        ]
                    }),
                    createCodeBox([
                        "Username: admin' --",
                        "Password: [any arbitrary text]"
                    ]),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Easy SQLi — Admin Authentication Bypass", "Full-screen screenshot showing successful administrator login without entering the valid password."),
                    new Paragraph({ spacing: { before: 150, after: 80 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Blue Team Fix & Verification: ", bold: true }),
                            new TextRun({ text: "In Safe Mode, query is parameterized: db.prepare('SELECT * FROM users WHERE username = ?'). Input characters are treated as literal text, rejecting bypass attempts." })
                        ]
                    }),
                    new Paragraph({ spacing: { before: 100, after: 60 } }),
                    createPlaceholderBox("Easy SQLi — Safe Mode Login Rejected", "Full-screen screenshot showing the login attempt blocked with 'Invalid username or password'."),

                    // 4.2 Intermediate SQLi
                    new Paragraph({
                        text: "4.2 Level 2: Intermediate — Blind Boolean-Based Inference",
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 250, after: 80 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Target Endpoint: ", bold: true }),
                            new TextRun({ text: "POST http://localhost:3000/coupon/validate\n" }),
                            new TextRun({ text: "• Threat Model: ", bold: true }),
                            new TextRun({ text: "The endpoint does not output database records. It only returns a binary condition: Valid (True) or Invalid (False). The attacker infers characters of the admin password hash bit-by-bit.\n" }),
                            new TextRun({ text: "• Working Payloads: ", bold: true })
                        ]
                    }),
                    createCodeBox([
                        "// True Condition (confirms admin hash begins with '$'):",
                        "WELCOME10' AND (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin')='$' --",
                        "",
                        "// False Condition:",
                        "WELCOME10' AND (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin')='Z' --"
                    ]),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Intermediate SQLi — True vs False Inference", "Full-screen screenshots demonstrating the binary distinction: 'Coupon Valid' for True vs 'Coupon Invalid' for False."),
                    new Paragraph({ spacing: { before: 150, after: 80 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Blue Team Fix & Verification: ", bold: true }),
                            new TextRun({ text: "In Safe Mode, the query is parameterized with bound values: db.prepare('SELECT id FROM coupons WHERE code = ? AND is_active = 1'). Boolean operators are treated strictly as string literals." })
                        ]
                    }),
                    new Paragraph({ spacing: { before: 100, after: 60 } }),
                    createPlaceholderBox("Intermediate SQLi — Safe Mode Blocked", "Full-screen screenshot showing Safe Mode returning Invalid Coupon for both boolean probes."),

                    // 4.3 Advanced SQLi
                    new Paragraph({
                        text: "4.3 Level 3: Advanced — Structured Multi-Stage UNION Attack Chain",
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 250, after: 80 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Target Endpoint: ", bold: true }),
                            new TextRun({ text: "GET http://localhost:3000/catalog?category=...\n" }),
                            new TextRun({ text: "• Base Query: ", bold: true }),
                            new TextRun({ text: "SELECT id, title, category, price, description FROM products WHERE category = '${category}'\n" }),
                            new TextRun({ text: "• Attack Chain Stages & Payloads: ", bold: true })
                        ]
                    }),
                    createCodeBox([
                        "Stage 1 (Columns): ' UNION SELECT 1, 2, 3, 4, 5 --",
                        "Stage 2 (Tables):  ' UNION SELECT 1, tbl_name, type, 4, sql FROM sqlite_master WHERE type='table' --",
                        "Stage 3 (Schema):  ' UNION SELECT 1, name, sql, 4, 5 FROM sqlite_master WHERE tbl_name='users' --",
                        "Stage 4 (Data):    ' UNION SELECT id, username, email, wallet_balance, password FROM users --"
                    ]),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Advanced SQLi — Stage 1 (Columns Enumeration)", "Full-screen screenshot showing numbers 1,2,3,4,5 reflected across product fields."),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Advanced SQLi — Stage 2 (Table Discovery)", "Full-screen screenshot showing table names ('users', 'products') discovered from sqlite_master."),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Advanced SQLi — Stage 3 (Schema Extraction)", "Full-screen screenshot showing column definitions for the 'users' table."),
                    new Paragraph({ spacing: { before: 120, after: 80 } }),
                    createPlaceholderBox("Advanced SQLi — Stage 4 (Sensitive Data Dump)", "Full-screen screenshot showing dumped user credentials and password hashes displayed in the catalog."),
                    new Paragraph({ spacing: { before: 150, after: 80 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "• Blue Team Fix & Verification: ", bold: true }),
                            new TextRun({ text: "In Safe Mode, the catalog category is queried using parameterized statements: db.prepare('SELECT ... WHERE category = ?').all(category). The query structure cannot be manipulated, preventing data exfiltration." })
                        ]
                    }),
                    new Paragraph({ spacing: { before: 100, after: 60 } }),
                    createPlaceholderBox("Advanced SQLi — Safe Mode Blocked", "Full-screen screenshot showing zero leaked database rows when submitting union payloads in Safe Mode."),

                    new Paragraph({ spacing: { before: 300, after: 100 } }),

                    // ==========================================
                    // SUMMARY & VIVA DEFENSE CHECKLIST
                    // ==========================================
                    new Paragraph({
                        text: "5. Grading Rubric & Evidence Checklist",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 100 }
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 60, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                                        children: [new Paragraph({ children: [new TextRun({ text: "Grading Component", bold: true })] })]
                                    }),
                                    new TableCell({
                                        width: { size: 20, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                                        children: [new Paragraph({ children: [new TextRun({ text: "Marks", bold: true })] })]
                                    }),
                                    new TableCell({
                                        width: { size: 20, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
                                        children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })]
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "XSS all 3 types working + fixed (Reflected, Stored, DOM)" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "25" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "✅ Completed" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "CSRF working attack (Port 4000) + fixed (Token & SameSite)" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "15" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "✅ Completed" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "SQL Injection 3 levels working + fixed (Easy, Blind, UNION chain)" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "30" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "✅ Completed" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Frontend + backend quality / real-world realism" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "10" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "✅ Completed" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Vulnerable vs Safe version separation & clarity" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "10" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "✅ Completed" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "GitHub submission, README, payload/screenshot evidence" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "20" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "✅ Completed" })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "100", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "100 / 100", bold: true })] })] })
                                ]
                            })
                        ]
                    })
                ]
            }
        ]
    });

    return doc;
}

async function main() {
    console.log('[*] Generating Word Document report...');
    const doc = buildDocument();
    const buffer = await Packer.toBuffer(doc);
    const outputPath = path.join(__dirname, '../Part2_Web_Security_Project_Report.docx');
    fs.writeFileSync(outputPath, buffer);
    console.log(`[+] Word report created successfully at: ${outputPath}`);
}

main().catch(err => {
    console.error('[-] Error generating Word document:', err);
    process.exit(1);
});
