/**
 * DOM-based XSS Demonstration Script
 * Built by student of FAST CFD for Information Security assignment defense.
 * 
 * Vulnerability Mechanism:
 * Reads untrusted user data directly from client-side location.hash and inserts
 * it into the DOM execution sink (innerHTML) without sanitization.
 * 
 * Defense:
 * Uses safe DOM setter (textContent) to prevent execution of injected HTML tags/scripts.
 */
document.addEventListener('DOMContentLoaded', () => {
    const promoElement = document.getElementById('promo-banner-text');
    if (!promoElement) return;

    // Check if security mode is Safe or Vulnerable via data attribute or class
    const isSafe = document.querySelector('header').textContent.includes('SAFE MODE');

    // Parse untrusted input from the URL fragment (e.g., #promo=<img src=x onerror=alert('DOM-XSS')>)
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        let rawInput = hash.substring(1); // Strip leading '#'
        if (rawInput.startsWith('promo=')) {
            rawInput = rawInput.replace('promo=', '');
        }

        try {
            rawInput = decodeURIComponent(rawInput);
        } catch (e) {
            console.warn('URI decode error', e);
        }

        if (isSafe) {
            // SAFE MODE DEFENSE:
            // textContent safely treats input as literal text, preventing DOM XSS injection
            promoElement.textContent = rawInput;
        } else {
            // VULNERABLE SINK:
            // innerHTML parses input as live HTML, executing script payloads or event handlers
            promoElement.innerHTML = rawInput;
        }
    }
});
