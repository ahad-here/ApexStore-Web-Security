/**
 * CSRF Protection Middleware
 * Built by student of FAST CFD for Information Security assignment defense.
 */
function csrfProtection(req, res, next) {
    // CSRF protection is only strictly enforced in Safe Mode
    if (!res.locals.isSafeMode) {
        return next();
    }

    // Only state-changing HTTP methods require token verification
    const sensitiveMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (!sensitiveMethods.includes(req.method)) {
        return next();
    }

    const submittedToken = req.body?._csrf || req.headers['x-csrf-token'];
    const sessionToken = req.session.csrfToken;

    if (!submittedToken || !sessionToken || submittedToken !== sessionToken) {
        return res.status(403).render('pages/error', {
            title: '403 Forbidden - CSRF Attack Blocked',
            message: 'Invalid or missing CSRF token. Request rejected by Blue Team defense filter.',
            code: 403
        });
    }

    next();
}

module.exports = csrfProtection;
