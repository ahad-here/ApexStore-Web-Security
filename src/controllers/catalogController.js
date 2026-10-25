const db = require('../../database/db');

/**
 * Catalog Controller: Handles Product Catalog, Advanced SQLi Chain, and Reflected XSS
 * Built by student of FAST CFD for Information Security assignment defense.
 */

function getHomePage(req, res) {
    try {
        const stmt = db.prepare('SELECT * FROM products LIMIT 6');
        const products = stmt.all();
        res.render('pages/index', {
            title: 'Home',
            products
        });
    } catch (err) {
        res.render('pages/error', { message: err.message });
    }
}

function getCatalog(req, res) {
    const category = req.query.category || '';
    const isSafe = res.locals.isSafeMode;

    try {
        let products = [];
        let executedSql = '';

        if (!category) {
            // Default view: list all products
            products = db.prepare('SELECT id, title, category, price, description FROM products').all();
        } else if (!isSafe) {
            // ========================================================
            // VULNERABLE VERSION (ADVANCED SQL INJECTION / UNION CHAIN)
            // ========================================================
            // Raw string concatenation allows union-based extraction:
            // 1. Column discovery: ' UNION SELECT 1,2,3,4,5 --
            // 2. Table extraction: ' UNION SELECT 1, tbl_name, type, 4, sql FROM sqlite_master WHERE type='table' --
            // 3. Schema extraction: ' UNION SELECT 1, name, sql, 4, 5 FROM sqlite_master WHERE tbl_name='users' --
            // 4. Data dumping: ' UNION SELECT id, username, email, wallet_balance, password FROM users --
            executedSql = `SELECT id, title, category, price, description FROM products WHERE category = '${category}'`;
            console.log(`[ADVANCED SQLi VULNERABLE QUERY] ${executedSql}`);
            products = db.prepare(executedSql).all();
        } else {
            // ========================================================
            // SAFE VERSION (HARDENED WITH PARAMETERIZED QUERY)
            // ========================================================
            executedSql = 'SELECT id, title, category, price, description FROM products WHERE category = ?';
            const stmt = db.prepare(executedSql);
            products = stmt.all(category);
        }

        // Fetch distinct categories for the filter buttons
        const categories = db.prepare('SELECT DISTINCT category FROM products').all();

        res.render('pages/catalog', {
            title: 'Catalog',
            products,
            categories,
            selectedCategory: category,
            executedSql
        });
    } catch (err) {
        console.warn('[SQLi Execution Notice]', err.message);
        res.render('pages/catalog', {
            title: 'Catalog',
            products: [],
            categories: [],
            selectedCategory: category,
            error: `SQL Error: ${err.message}`,
            executedSql: err.message
        });
    }
}

function getSearch(req, res) {
    const q = req.query.q || '';
    let results = [];

    if (q) {
        // Safe backend lookup for products matching query
        const stmt = db.prepare('SELECT * FROM products WHERE title LIKE ? OR description LIKE ?');
        results = stmt.all(`%${q}%`, `%${q}%`);
    }

    // Reflected XSS is demonstrated in the view layer (search.ejs):
    // Vulnerable Mode renders: <%- query %> (unescaped reflection)
    // Safe Mode renders:       <%= query %> (contextual HTML encoding)
    res.render('pages/search', {
        title: 'Search Products',
        query: q,
        results
    });
}

function getProductDetail(req, res) {
    const productId = req.params.id;

    try {
        const productStmt = db.prepare('SELECT * FROM products WHERE id = ?');
        const product = productStmt.get(productId);

        if (!product) {
            return res.status(404).render('pages/error', {
                title: 'Product Not Found',
                message: 'The requested product could not be located in our catalog.'
            });
        }

        // Fetch product reviews (target for Stored XSS)
        const reviewsStmt = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC');
        const reviews = reviewsStmt.all(productId);

        res.render('pages/product-detail', {
            title: product.title,
            product,
            reviews
        });
    } catch (err) {
        res.render('pages/error', { message: err.message });
    }
}

module.exports = {
    getHomePage,
    getCatalog,
    getSearch,
    getProductDetail
};
