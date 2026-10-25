const db = require('../../database/db');
const bcrypt = require('bcryptjs');

/**
 * Auth Controller: Handles Login, Logout, and Authentication Bypass Demonstration
 * Built by student of FAST CFD for Information Security assignment defense.
 */

function getLoginPage(req, res) {
    res.render('pages/login', {
        title: 'Sign In',
        error: req.query.error || null,
        success: req.query.success || null
    });
}

function handleLogin(req, res) {
    const { username, password } = req.body;
    const isSafe = res.locals.isSafeMode;

    if (!username || !password) {
        return res.redirect('/login?error=Username and password are required');
    }

    try {
        if (!isSafe) {
            // ========================================================
            // VULNERABLE VERSION (EASY SQL INJECTION / AUTH BYPASS)
            // ========================================================
            // The user input is concatenated directly into the SQL statement without escaping.
            // Exploits like: admin' -- OR ' OR 1=1 --
            // will truncate the password verification clause.
            const rawSql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
            console.log(`[SQLi VULNERABLE EXECUTION] ${rawSql}`);

            // In vulnerable mode, we also support logging in with plain password match or bypassed query
            let user;
            try {
                user = db.prepare(rawSql).get();
            } catch (sqlErr) {
                // If the user entered a password that doesn't match raw bcrypt, check if username exists
                // when an injection operator was deliberately supplied
                console.warn('[SQLi Execution Error / Syntax]', sqlErr.message);
                return res.redirect(`/login?error=Database Query Error: ${encodeURIComponent(sqlErr.message)}`);
            }

            if (user) {
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    wallet_balance: user.wallet_balance
                };
                return res.redirect('/');
            } else {
                // Check if user exists for regular testing (fallback for plain text passwords in demo)
                const fallbackStmt = db.prepare(`SELECT * FROM users WHERE username = '${username}'`);
                const regularUser = fallbackStmt.get();
                if (regularUser && bcrypt.compareSync(password, regularUser.password)) {
                    req.session.user = {
                        id: regularUser.id,
                        username: regularUser.username,
                        role: regularUser.role,
                        email: regularUser.email,
                        wallet_balance: regularUser.wallet_balance
                    };
                    return res.redirect('/');
                }
                return res.redirect('/login?error=Invalid credentials provided');
            }

        } else {
            // ========================================================
            // SAFE VERSION (HARDENED WITH PARAMETERIZED QUERIES)
            // ========================================================
            // Parameterized query separates SQL instruction from data operands.
            // Injected SQL syntax characters are treated strictly as string literals.
            const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
            const user = stmt.get(username);

            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    wallet_balance: user.wallet_balance
                };
                return res.redirect('/');
            }

            return res.redirect('/login?error=Invalid username or password');
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.redirect(`/login?error=Internal processing error: ${encodeURIComponent(err.message)}`);
    }
}

function handleLogout(req, res) {
    req.session.destroy(() => {
        res.redirect('/login?success=Logged out successfully');
    });
}

module.exports = {
    getLoginPage,
    handleLogin,
    handleLogout
};
