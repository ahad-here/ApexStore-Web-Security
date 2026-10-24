const crypto = require('crypto');

/**
 * Security Mode Middleware
 * Controls dual-mode behavior (Vulnerable vs Safe) across the application.
 * Built by student of FAST CFD for Information Security assignment defense.
 */
function securityModeMiddleware(req, res, next) {
    // Default mode is 'vulnerable' (Red Team) if not explicitly set
    if (!req.session.securityMode) {
        req.session.securityMode = 'vulnerable';
    }

    const isSafe = (req.session.securityMode === 'safe');
    res.locals.securityMode = req.session.securityMode;
    res.locals.isSafeMode = isSafe;
    res.locals.currentUser = req.session.user || null;

    // In Safe Mode, ensure session has a CSRF token
    if (isSafe) {
        if (!req.session.csrfToken) {
            req.session.csrfToken = crypto.randomBytes(32).toString('hex');
        }
        res.locals.csrfToken = req.session.csrfToken;

        // Apply defensive HTTP headers in Safe Mode
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
    } else {
        // In Vulnerable Mode, expose dummy or no token, remove defensive headers
        res.locals.csrfToken = '';
        res.removeHeader('X-Frame-Options');
    }

    next();
}

/**
 * Handler for toggling security mode
 */
function toggleModeHandler(req, res) {
    if (req.session.securityMode === 'safe') {
        req.session.securityMode = 'vulnerable';
    } else {
        req.session.securityMode = 'safe';
    }

    const returnUrl = req.header('Referer') || '/';
    res.redirect(returnUrl);
}

module.exports = {
    securityModeMiddleware,
    toggleModeHandler
};
