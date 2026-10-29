const express = require('express');
const path = require('path');

const app = express();
const ATTACKER_PORT = process.env.ATTACKER_PORT || 4000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(ATTACKER_PORT, () => {
    console.log(`====================================================`);
    console.log(`[!] Attacker External Phishing Server Running at http://localhost:${ATTACKER_PORT}`);
    console.log(`[!] Malicious CSRF Exploit Endpoint: http://localhost:${ATTACKER_PORT}/csrf-transfer.html`);
    console.log(`====================================================`);
});
