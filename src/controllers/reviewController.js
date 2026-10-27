const db = require('../../database/db');

/**
 * Review Controller: Handles Customer Reviews and Stored XSS Demonstration
 * Built by student of FAST CFD for Information Security assignment defense.
 */

function handlePostReview(req, res) {
    const productId = req.params.id;
    let { username, comment } = req.body;
    const isSafe = res.locals.isSafeMode;

    if (!comment || !comment.trim()) {
        return res.redirect(`/products/${productId}?error=Review comment cannot be empty`);
    }

    username = username ? username.trim() : (req.session.user ? req.session.user.username : 'Anonymous');

    try {
        if (!isSafe) {
            // ========================================================
            // VULNERABLE VERSION (STORED XSS)
            // ========================================================
            // The unvalidated, raw HTML/script string is saved directly
            // into the SQLite database. When rendered in the view without
            // output encoding, it triggers stored script execution.
            console.log(`[STORED XSS VULNERABLE INSERT] Review: "${comment}"`);
            const insertStmt = db.prepare('INSERT INTO reviews (product_id, username, comment) VALUES (?, ?, ?)');
            insertStmt.run(productId, username, comment);

        } else {
            // ========================================================
            // SAFE VERSION (HARDENED INPUT SANITIZATION & DEFENSE)
            // ========================================================
            // Strips potentially dangerous executable tags and ensures clean storage
            const sanitizedComment = comment
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');

            const insertStmt = db.prepare('INSERT INTO reviews (product_id, username, comment) VALUES (?, ?, ?)');
            insertStmt.run(productId, username, sanitizedComment);
        }

        res.redirect(`/products/${productId}?success=Review posted successfully`);
    } catch (err) {
        console.error('Error posting review:', err);
        res.redirect(`/products/${productId}?error=Failed to submit review: ${encodeURIComponent(err.message)}`);
    }
}

module.exports = {
    handlePostReview
};
