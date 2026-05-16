let allTransactions = [];
let allCategories = []; // Mảng toàn cục để lưu danh sách danh mục
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
        allTransactions = data.data?.data || data.data || [];
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
        
        <div style="display:flex; flex-direction:row; align-items:center; gap:12px;">
            <button class="tag-btn" style="background-color:${categoryColor}; border:1px solid #ddd; padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: default;">${categoryName}</button>
            
            <div style="display: flex; gap: 8px;">
                <button onclick="openEditTransaction(${t.id})" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #eaeaea; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: background 0.2s;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                
                <button onclick="deleteTransaction(${t.id}, this)" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #eaeaea; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: background 0.2s;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff7b7b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        </div>
    `;
    return div;
}

// ========== THÊM GIAO DỊCH ==========
async function addTransaction() {
    const wallet_id = document.getElementById('txWallet').value;
    const category_id = document.getElementById('txCategory').value;
    const amount = Number(document.getElementById('txAmount').value);
    const transaction_date = document.getElementById('txDate').value;
    const description = document.getElementById('txDesc').value;

    if (!wallet_id) { alert('Vui lòng chọn ví!'); return; }
    if (!category_id) { alert('Vui lòng chọn danh mục!'); return; }
    if (!amount) { alert('Vui lòng nhập số tiền!'); return; }
    if (!transaction_date) { alert('Vui lòng chọn ngày!'); return; }

    // TỰ ĐỘNG TÌM LOẠI GIAO DỊCH TỪ DANH MỤC  
    const selectedCat = allCategories.find(c => c.id == category_id);
    const autoType = selectedCat ? selectedCat.type : 'expense'; // Mặc định là expense nếu lỗi

    try {
        const res = await fetch(`${BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ wallet_id, category_id, amount, type: autoType, transaction_date, description })
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

// ========== SỬA GIAO DỊCH ==========
// Hàm mở Modal và đổ dữ liệu cũ vào Form
function openEditTransaction(id) {
    const tx = allTransactions.find(t => t.id === id);
    if (!tx) return;

    document.getElementById('editTxId').value = tx.id;

    const date = new Date(tx.transaction_date);
    document.getElementById('editTxDate').value = date.toISOString().split('T')[0];
    document.getElementById('editTxAmount').value = tx.amount;
    document.getElementById('editTxDesc').value = tx.description || '';

    document.getElementById('editTxWallet').innerHTML = document.getElementById('txWallet').innerHTML;
    document.getElementById('editTxCategory').innerHTML = document.getElementById('txCategory').innerHTML;

    document.getElementById('editTxWallet').value = tx.wallet_id;
    document.getElementById('editTxCategory').value = tx.category_id;

    // Hiển thị modal
    showModal('editTransaction');
}

// Hàm gọi API để Cập nhật dữ liệu
async function updateTransaction() {
    const id = document.getElementById('editTxId').value;
    const wallet_id = document.getElementById('editTxWallet').value;
    const category_id = document.getElementById('editTxCategory').value;
    const amount = Number(document.getElementById('editTxAmount').value);
    const transaction_date = document.getElementById('editTxDate').value;
    const description = document.getElementById('editTxDesc').value;

    if (!wallet_id || !category_id || !amount || !transaction_date) {
        alert('Vui lòng nhập đầy đủ thông tin bắt buộc!');
        return;
    }

    // TỰ ĐỘNG TÌM LOẠI GIAO DỊCH TỪ DANH MỤC
    const selectedCat = allCategories.find(c => c.id == category_id);
    const autoType = selectedCat ? selectedCat.type : 'expense';

    try {
        const res = await fetch(`${BASE_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                wallet_id, 
                category_id, 
                amount, 
                type: autoType, 
                transaction_date, 
                description 
            })
        });

        const data = await res.json();
        if (res.ok) {
            closeModal('editTransaction');
            loadTransactions(); 
        } else {
            alert(data.message || 'Cập nhật giao dịch thất bại!');
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
        
        // Reset option trước khi nạp để tránh trùng lặp nếu gọi nhiều lần
        txWallet.innerHTML = '<option value="">-- Chọn ví --</option>';
        filterWallet.innerHTML = '<option value="">Tất cả</option>';
        
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
        allCategories = data.data || data; // LƯU VÀO BIẾN TOÀN CỤC ĐỂ DÙNG TỰ ĐỘNG BẮT TYPE

        const txCategory = document.getElementById('txCategory');
        txCategory.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        
        allCategories.forEach(c => {
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