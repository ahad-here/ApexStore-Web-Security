const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const db = require('../database/db');
const { securityModeMiddleware, toggleModeHandler } = require('./middleware/securityMode');
const csrfProtection = require('./middleware/csrfProtection');
const { requireAuth } = require('./middleware/auth');

// Controllers
const authController = require('./controllers/authController');
const catalogController = require('./controllers/catalogController');
const couponController = require('./controllers/couponController');
const reviewController = require('./controllers/reviewController');
const walletController = require('./controllers/walletController');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static assets
app.use(express.static(path.join(__dirname, '../public')));

// Request parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('apexstore-secret-cookie-key'));

// Session Configuration
app.use(session({
    secret: 'apexstore-insecure-session-secret-key-fast-cfd',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: false, // In vulnerable mode, readable by JS (allows cookie theft in stored/reflected XSS demo!)
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Global Security Mode Middleware (Controls Vulnerable vs Safe posture)
app.use(securityModeMiddleware);

// Mode Toggle Route
app.post('/toggle-mode', toggleModeHandler);

// ========================================================
// CORE ROUTES
// ========================================================

// Home & Catalog
app.get('/', catalogController.getHomePage);
app.get('/catalog', catalogController.getCatalog);
app.get('/search', catalogController.getSearch);
app.get('/products/:id', catalogController.getProductDetail);

// Reviews (Stored XSS Target)
app.post('/products/:id/review', reviewController.handlePostReview);

// Coupons (Blind Boolean SQLi Target)
app.get('/coupon', couponController.getCouponPage);
app.post('/coupon/validate', couponController.validateCoupon);
app.get('/api/coupon/validate', couponController.validateCoupon);

// Authentication (Easy SQLi Auth Bypass Target)
app.get('/login', authController.getLoginPage);
app.post('/login', authController.handleLogin);
app.get('/logout', authController.handleLogout);

// Wallet & Fund Transfers (CSRF Target: csrfProtection evaluates in Safe Mode)
app.get('/wallet', requireAuth, walletController.getWalletPage);
app.post('/wallet/transfer', csrfProtection, requireAuth, walletController.handleTransfer);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('pages/error', {
        title: '404 - Page Not Found',
        message: `The requested path '${req.path}' does not exist on this server.`,
        code: 404
    });
});

// Central Error Handler
app.use((err, req, res, next) => {
    console.error('[Unhandled Server Error]', err);
    res.status(500).render('pages/error', {
        title: '500 - Internal Server Error',
        message: err.message || 'An unexpected error occurred.',
        code: 500
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`[+] ApexStore Server Running at http://localhost:${PORT}`);
        console.log(`[+] Dual Security Mode Active (Default: VULNERABLE)`);
        console.log(`[+] Ready for Information Security Assignment Defense`);
        console.log(`====================================================`);
    });
}

module.exports = app;
