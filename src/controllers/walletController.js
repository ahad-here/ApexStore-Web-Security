const db = require('../../database/db');

/**
 * Wallet Controller: Handles Digital Wallet, Fund Transfers, and CSRF Demonstration
 * Built by student of FAST CFD for Information Security assignment defense.
 */

function getWalletPage(req, res) {
    if (!req.session.user) {
        return res.redirect('/login?error=Please log in to access your digital wallet');
    }

    const userId = req.session.user.id;

    try {
        // Fetch fresh balance
        const user = db.prepare('SELECT id, username, email, wallet_balance, role FROM users WHERE id = ?').get(userId);
        if (user) {
            req.session.user.wallet_balance = user.wallet_balance;
        }

        // Fetch recent transactions
        const txStmt = db.prepare(`
            SELECT id, sender_id, receiver_username, amount, timestamp
            FROM transactions
            WHERE sender_id = ?
            ORDER BY timestamp DESC
            LIMIT 10
        `);
        const transactions = txStmt.all(userId);

        res.render('pages/wallet', {
            title: 'Digital Wallet',
            user: user || req.session.user,
            transactions,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (err) {
        res.render('pages/error', { message: err.message });
    }
}

function handleTransfer(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
    }

    const senderId = req.session.user.id;
    const { recipient, amount } = req.body;
    const transferAmount = parseFloat(amount);

    if (!recipient || isNaN(transferAmount) || transferAmount <= 0) {
        return res.redirect('/wallet?error=Please specify a valid recipient username and positive dollar amount.');
    }

    try {
        const sender = db.prepare('SELECT id, username, wallet_balance FROM users WHERE id = ?').get(senderId);

        if (!sender || sender.wallet_balance < transferAmount) {
            return res.redirect('/wallet?error=Insufficient wallet balance to complete transaction.');
        }

        // Check if recipient exists
        const recipientUser = db.prepare('SELECT id, username, wallet_balance FROM users WHERE username = ?').get(recipient);
        if (!recipientUser) {
            return res.redirect(`/wallet?error=Recipient user '${recipient}' not found in system.`);
        }

        if (recipientUser.id === senderId) {
            return res.redirect('/wallet?error=You cannot transfer funds to yourself.');
        }

        // Execute genuine SQLite transaction
        db.exec('BEGIN TRANSACTION;');
        try {
            // Deduct from sender
            db.prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?').run(transferAmount, senderId);
            // Credit recipient
            db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(transferAmount, recipientUser.id);
            // Record transaction
            db.prepare('INSERT INTO transactions (sender_id, receiver_username, amount) VALUES (?, ?, ?)').run(senderId, recipient, transferAmount);
            db.exec('COMMIT;');
        } catch (txErr) {
            db.exec('ROLLBACK;');
            throw txErr;
        }

        // Update active session balance
        req.session.user.wallet_balance -= transferAmount;

        console.log(`[TRANSFER EXECUTED] $${transferAmount} from ${sender.username} to ${recipient} (Mode: ${res.locals.securityMode})`);

        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.json({
                success: true,
                message: `Successfully transferred $${transferAmount.toFixed(2)} to ${recipient}.`,
                newBalance: req.session.user.wallet_balance
            });
        }

        res.redirect(`/wallet?success=Successfully transferred $${transferAmount.toFixed(2)} to ${recipient}!`);
    } catch (err) {
        console.error('Transfer execution failure:', err);
        res.redirect(`/wallet?error=Transaction failed: ${encodeURIComponent(err.message)}`);
    }
}

module.exports = {
    getWalletPage,
    handleTransfer
};
