let allTransactions = [];
let selectedType = 'expense';
let filterType = 'all';

// ========== LOAD GIAO DỊCH ==========
async function loadTransactions(params = {}) {
    try {
        let url = `${BASE_URL}/transactions?`;
        if (params.type) url += `type=${params.type}&`;
        if (params.from_date) url += `from_date=${params.from_date}&`;
        if (params.to_date) url += `to_date=${params.to_date}&`;
        if (params.wallet_id) url += `wallet_id=${params.wallet_id}&`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.status === 401) { window.location.href = 'login.html'; return; }

        const data = await res.json();
        allTransactions = data.data.data || data.data || [];
        renderTransactions(allTransactions);

    } catch (error) {
        console.error('Lỗi load giao dịch:', error);
    }
}

// ========== RENDER GIAO DỊCH ==========
function renderTransactions(transactions) {
    const incomeList = document.getElementById('incomeList');
    const expenseList = document.getElementById('expenseList');
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    const income = transactions.filter(t => t.type === 'income');
    const expense = transactions.filter(t => t.type === 'expense');

    if (income.length === 0) {
        incomeList.innerHTML = '<p style="color:#aaa; padding:10px 0;">Không có giao dịch tiền vào.</p>';
    } else {
        income.forEach(t => incomeList.appendChild(createTransactionCard(t)));
    }

    if (expense.length === 0) {
        expenseList.innerHTML = '<p style="color:#aaa; padding:10px 0;">Không có giao dịch tiền ra.</p>';
    } else {
        expense.forEach(t => expenseList.appendChild(createTransactionCard(t)));
    }

    // Ẩn/hiện section theo filter
    document.getElementById('incomeSection').style.display =
        (filterType === 'all' || filterType === 'income') ? 'block' : 'none';
    document.getElementById('expenseSection').style.display =
        (filterType === 'all' || filterType === 'expense') ? 'block' : 'none';
}

function createTransactionCard(t) {
    const div = document.createElement('div');
    div.classList.add('transaction-card');
    const date = new Date(t.transaction_date);
    const dateStr = `Ngày ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
    const categoryName = t.category?.name || '';
    const categoryColor = t.category?.color || '#E0E0E0';
    const walletName = t.wallet?.name || '';

    div.innerHTML = `
        <div class="card-info">
            <p class="date">${dateStr}</p>
            <p class="desc">${t.description || 'Không có mô tả'}</p>
            <p class="balance">Ví: ${walletName} | ${Number(t.amount).toLocaleString('vi-VN')} đ</p>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
            <button class="tag-btn" style="background-color:${categoryColor}; border:none;">${categoryName}</button>
            <button onclick="deleteTransaction(${t.id}, this)" style="background:none; border:none; color:#ff5c5c; cursor:pointer; font-size:12px;">Xóa</button>
        </div>
    `;
    return div;
}

// ========== THÊM GIAO DỊCH ==========
async function addTransaction() {
    const wallet_id = document.getElementById('txWallet').value;
    const category_id = document.getElementById('txCategory').value;
    const amount = document.getElementById('txAmount').value;
    const transaction_date = document.getElementById('txDate').value;
    const description = document.getElementById('txDesc').value;

    if (!wallet_id) { alert('Vui lòng chọn ví!'); return; }
    if (!category_id) { alert('Vui lòng chọn danh mục!'); return; }
    if (!amount) { alert('Vui lòng nhập số tiền!'); return; }
    if (!transaction_date) { alert('Vui lòng chọn ngày!'); return; }

    try {
        const res = await fetch(`${BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ wallet_id, category_id, amount, type: selectedType, transaction_date, description })
        });

        const data = await res.json();
        if (res.ok) {
            closeModal('addTransaction');
            loadTransactions();
        } else {
            alert(data.message || 'Thêm giao dịch thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== XÓA GIAO DỊCH ==========
async function deleteTransaction(id, btn) {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    try {
        const res = await fetch(`${BASE_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            btn.closest('.transaction-card').remove();
        } else {
            alert('Xóa thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== LOAD VÍ VÀ DANH MỤC VÀO SELECT ==========
async function loadWalletOptions() {
    try {
        const res = await fetch(`${BASE_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const wallets = data.data || data;

        const txWallet = document.getElementById('txWallet');
        const filterWallet = document.getElementById('filterWallet');
        wallets.forEach(w => {
            txWallet.innerHTML += `<option value="${w.id}">${w.name}</option>`;
            filterWallet.innerHTML += `<option value="${w.id}">${w.name}</option>`;
        });
    } catch (error) {
        console.error('Lỗi load ví:', error);
    }
}

async function loadCategoryOptions() {
    try {
        const res = await fetch(`${BASE_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const categories = data.data || data;

        const txCategory = document.getElementById('txCategory');
        categories.forEach(c => {
            txCategory.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    } catch (error) {
        console.error('Lỗi load danh mục:', error);
    }
}

// ========== FILTER ==========
function filterByType(type) {
    filterType = type;
    renderTransactions(allTransactions);
}

function selectFilterType(type, btn) {
    filterType = type;
    btn.closest('.grid-options').querySelectorAll('.opt-select')
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function applyFilter() {
    const fromDate = document.getElementById('filterFromDate').value;
    const toDate = document.getElementById('filterToDate').value;
    const walletId = document.getElementById('filterWallet').value;
    closeModal('filterTransaction');
    loadTransactions({
        type: filterType !== 'all' ? filterType : '',
        from_date: fromDate,
        to_date: toDate,
        wallet_id: walletId
    });
}

// ========== HELPER ==========
function selectType(type, btn) {
    selectedType = type;
    btn.closest('.grid-options').querySelectorAll('.opt-select')
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// ========== SEARCH ==========
document.getElementById('searchInput')?.addEventListener('input', function() {
    const keyword = this.value.toLowerCase();
    const filtered = allTransactions.filter(t =>
        (t.description || '').toLowerCase().includes(keyword) ||
        (t.category?.name || '').toLowerCase().includes(keyword)
    );
    renderTransactions(filtered);
});

// ========== KHỞI CHẠY ==========
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    loadTransactions();
    loadWalletOptions();
    loadCategoryOptions();
});