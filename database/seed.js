const db = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
    console.log('[*] Seeding ApexStore database...');

    // Clear existing records and reset sequences cleanly
    db.exec(`
        DELETE FROM transactions;
        DELETE FROM reviews;
        DELETE FROM coupons;
        DELETE FROM products;
        DELETE FROM users;
        DELETE FROM sqlite_sequence WHERE name IN ('transactions', 'reviews', 'coupons', 'products', 'users');
    `);

    // Helper hashing function for secure passwords
    const salt = bcrypt.genSaltSync(10);
    const hash = (pwd) => bcrypt.hashSync(pwd, salt);

    // Insert Users (Admin + Regular Customers)
    // Core seed accounts configured for authentication and privilege testing
    // Built by student of FAST CFD for Information Security assignment defense
    const insertUser = db.prepare(`
        INSERT INTO users (username, password, email, role, wallet_balance)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run('admin', hash('admin123'), 'admin@apexstore.local', 'admin', 5000.0);
    insertUser.run('alice', hash('alice123'), 'alice@apexstore.local', 'customer', 1250.0);
    insertUser.run('bob', hash('bob123'), 'bob@apexstore.local', 'customer', 850.0);
    insertUser.run('attacker', hash('attacker123'), 'attacker@darknet.org', 'customer', 50.0);

    // Insert Products across different categories
    const insertProduct = db.prepare(`
        INSERT INTO products (title, category, price, stock, description)
        VALUES (?, ?, ?, ?, ?)
    `);

    const p1 = insertProduct.run('Apex Pro Laptop 16"', 'Electronics', 1499.99, 15, 'High-performance workstation with M3-tier processor and 32GB RAM.');
    const p2 = insertProduct.run('UltraVision 4K Monitor', 'Electronics', 429.50, 25, '32-inch IPS display with HDR600 and 144Hz refresh rate.');
    insertProduct.run('SilentTouch Mechanical Keyboard', 'Accessories', 119.00, 40, 'Custom mechanical switches with per-key RGB backlighting.');
    const p4 = insertProduct.run('AcousticMax Wireless Headphones', 'Audio', 249.99, 30, 'Active noise cancellation with 40-hour high-fidelity battery life.');
    insertProduct.run('ErgoDesk Pro Chair', 'Furniture', 389.00, 12, 'Ergonomic lumbar support chair with breathable mesh.');
    insertProduct.run('OmniCharge 100W Power Bank', 'Accessories', 69.95, 50, 'Fast-charging portable battery bank with digital OLED display.');

    // Insert Initial Reviews using dynamic lastInsertRowid
    const insertReview = db.prepare(`
        INSERT INTO reviews (product_id, username, comment)
        VALUES (?, ?, ?)
    `);

    const p1Id = Number(p1.lastInsertRowid);
    const p4Id = Number(p4.lastInsertRowid);

    insertReview.run(p1Id, 'alice', 'Incredible build quality and battery life! Runs all my dev workflows seamlessly.');
    insertReview.run(p1Id, 'bob', 'Screen is gorgeous, definitely worth every penny for engineering work.');
    insertReview.run(p4Id, 'alice', 'Noise cancellation blocks out office chatter completely.');

    // Insert Promotional Coupons (Target for Blind Boolean SQL Injection)
    const insertCoupon = db.prepare(`
        INSERT INTO coupons (code, discount_percent, is_active)
        VALUES (?, ?, ?)
    `);

    insertCoupon.run('WELCOME10', 10, 1);
    insertCoupon.run('CYBER25', 25, 1);
    insertCoupon.run('VIP50', 50, 1);
    insertCoupon.run('EXPIRED05', 5, 0);

    // Insert Initial Wallet Transactions
    const insertTx = db.prepare(`
        INSERT INTO transactions (sender_id, receiver_username, amount)
        VALUES (?, ?, ?)
    `);

    insertTx.run(1, 'alice', 250.0);
    insertTx.run(2, 'bob', 100.0);

    console.log('[+] Database seeded successfully with users, products, coupons, and wallet data.');
}

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
