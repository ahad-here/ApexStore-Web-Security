const db = require('../../database/db');

/**
 * Coupon Controller: Handles Discount Verification and Blind Boolean SQL Injection
 * Built by student of FAST CFD for Information Security assignment defense.
 */

function getCouponPage(req, res) {
    res.render('pages/coupon', {
        title: 'Promotional Coupons',
        result: null,
        inputCode: ''
    });
}

function validateCoupon(req, res) {
    const code = req.query.code || req.body.code || '';
    const isSafe = res.locals.isSafeMode;

    if (!code) {
        return res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });
    }

    try {
        let coupon = null;
        let executedSql = '';

        if (!isSafe) {
            // ========================================================
            // VULNERABLE VERSION (INTERMEDIATE BLIND BOOLEAN SQLi)
            // ========================================================
            // The code parameter is concatenated directly into the SQL query.
            // Notice: The application does NOT display database columns.
            // It only returns a binary condition: Valid (True) or Invalid (False).
            //
            // Exploit Payload Example:
            // WELCOME10' AND (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin')='$' --
            // If the character matches, the query evaluates to True -> "Coupon Valid!"
            // If the character is incorrect, query evaluates to False -> "Invalid Coupon."
            executedSql = `SELECT id, discount_percent FROM coupons WHERE code = '${code}' AND is_active = 1`;
            console.log(`[BLIND SQLi VULNERABLE QUERY] ${executedSql}`);
            coupon = db.prepare(executedSql).get();
        } else {
            // ========================================================
            // SAFE VERSION (HARDENED PARAMETERIZED QUERY)
            // ========================================================
            executedSql = 'SELECT id, discount_percent FROM coupons WHERE code = ? AND is_active = 1';
            const stmt = db.prepare(executedSql);
            coupon = stmt.get(code);
        }

        const isAjax = req.xhr || req.headers.accept?.includes('json');

        if (coupon) {
            const data = {
                valid: true,
                discount: coupon.discount_percent,
                message: `Success! Valid promotional coupon applied (${coupon.discount_percent}% off).`,
                executedSql
            };
            return isAjax ? res.json(data) : res.render('pages/coupon', { title: 'Promotional Coupons', result: data, inputCode: code });
        } else {
            const data = {
                valid: false,
                discount: 0,
                message: 'Invalid, expired, or non-existent coupon code.',
                executedSql
            };
            return isAjax ? res.json(data) : res.render('pages/coupon', { title: 'Promotional Coupons', result: data, inputCode: code });
        }
    } catch (err) {
        console.warn('[Blind SQLi Exception Triggered]', err.message);
        const data = {
            valid: false,
            message: `SQL Error Encountered: ${err.message}`,
            executedSql: err.message
        };
        const isAjax = req.xhr || req.headers.accept?.includes('json');
        return isAjax ? res.status(400).json(data) : res.render('pages/coupon', { title: 'Promotional Coupons', result: data, inputCode: code });
    }
}

module.exports = {
    getCouponPage,
    validateCoupon
};
