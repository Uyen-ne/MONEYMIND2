const BASE_URL = 'http://localhost:8000/api';

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// ========== AUTH ==========
async function apiLogin(email, password) {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

async function apiLogout() {
    const res = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders()
    });
    return res.json();
}

// ========== WALLETS ==========
async function getWallets() {
    const res = await fetch(`${BASE_URL}/wallets`, { headers: getHeaders() });
    return res.json();
}

async function addWallet(data) {
    const res = await fetch(`${BASE_URL}/wallets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
}

async function deleteWallet(id) {
    const res = await fetch(`${BASE_URL}/wallets/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return res.json();
}

// ========== TRANSACTIONS ==========
async function getTransactions() {
    const res = await fetch(`${BASE_URL}/transactions`, { headers: getHeaders() });
    return res.json();
}

// ========== NOTIFICATIONS ==========
async function getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, { headers: getHeaders() });
    return res.json();
}

async function markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders()
    });
    return res.json();
}

// ========== STATISTICS ==========
async function getPieChart() {
    const res = await fetch(`${BASE_URL}/statistics/pie-chart`, { headers: getHeaders() });
    return res.json();
}

async function getSummary() {
    const res = await fetch(`${BASE_URL}/statistics/summary`, { headers: getHeaders() });
    return res.json();
}

async function getSpending() {
    const res = await fetch(`${BASE_URL}/statistics/spending`, { headers: getHeaders() });
    return res.json();
}