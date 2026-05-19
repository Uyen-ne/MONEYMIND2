// Biến lưu trạng thái bộ lọc hiện tại
let currentFilter = {
    period: 'month',
    date: new Date().toISOString().split('T')[0],
    walletId: null
};

// ========== LOAD SỐ DƯ TỔNG ==========
async function loadSummary() {
    try {
        const res = await fetch(`${BASE_URL}/statistics/summary?period=month`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.status === 401) { window.location.href = 'login.html'; return; }

        const data = await res.json();
        const summary = data.data;

        const pct = summary.percentage;
        const sign = pct >= 0 ? 'tăng' : 'giảm';
        const absPct = Math.abs(pct);
        const month = new Date().getMonth(); 
        const lastMonth = month === 0 ? 12 : month;

        document.querySelector('.alert-info p').innerHTML =
            `Chi tiêu tháng ${month + 1} này đã <span class="highlight">${sign} ${absPct}%</span> so với tháng ${lastMonth} trước!`;

    } catch (error) {
        console.error('Lỗi load summary:', error);
    }
}

// ========== LOAD SỐ DƯ VÍ ==========
async function loadBalance() {
    try {
        const res = await fetch(`${BASE_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const wallets = data.data || data;
        const total = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
        document.getElementById('totalBalance').textContent = total.toLocaleString('vi-VN') + ' đ';
    } catch (error) {
        console.error('Lỗi load balance:', error);
    }
}

// ========== LOAD PIE CHART & STATS ==========
async function loadPieChart() {
    const { period, date, walletId } = currentFilter;
    // Khởi tạo URL cơ bản
    let url = `${BASE_URL}/statistics/pie-chart?period=${period}`;
    
    // Chỉ nối thêm date nếu có ngày cụ thể (tránh lỗi khi chọn Tất cả)
    if (date) url += `&date=${date}`;
    if (walletId) url += `&wallet_id=${walletId}`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const items = data.data;

        const statList = document.getElementById('statItems');
        statList.innerHTML = ''; // Xóa data cũ

        if (!items || items.length === 0) {
            statList.innerHTML = '<div class="stat-item"><span style="color:#aaa">Không có dữ liệu.</span></div>';
            updateChartData([], [], []);
            return;
        }

        const total = items.reduce((sum, i) => sum + i.value, 0);

        items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('stat-item');
            div.innerHTML = `
                <span>${item.name}:</span>
                <div class="stat-amount" style="background-color:${item.color || '#E0E0E0'};">
                    ${Number(item.value).toLocaleString('vi-VN')} đ
                </div>
            `;
            statList.appendChild(div);
        });

        // Cập nhật Chart.js
        updateChartData(
            items.map(i => i.name),
            items.map(i => Math.round((i.value / total) * 100)),
            items.map(i => i.color || '#ccc')
        );

    } catch (error) {
        console.error('Lỗi load pie chart:', error);
    }
}

function updateChartData(labels, data, colors) {
    if (window.myPieChart) {
        window.myPieChart.data.labels = labels;
        window.myPieChart.data.datasets[0].data = data;
        window.myPieChart.data.datasets[0].backgroundColor = colors;
        window.myPieChart.update();
    }
}

// ========== LOAD GIAO DỊCH GẦN ĐÂY ==========
async function loadRecentTransactions() {
    try {
        const res = await fetch(`${BASE_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const allTransactions = data.data?.data || data.data || data || [];

        const list = document.getElementById('transList');
        list.innerHTML = '';

        if (!allTransactions || allTransactions.length === 0) {
            list.innerHTML = '<p style="color:#aaa">Chưa có giao dịch nào.</p>';
            return;
        }

        // CHỈ LẤY 3 GIAO DỊCH ĐẦU TIÊN (GẦN NHẤT)
        const top3Transactions = allTransactions.slice(0, 3);

        top3Transactions.forEach(tx => {
            const date = new Date(tx.transaction_date);
            const dateStr = `Ngày ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
            const isIncome = tx.type === 'income';
            
            const div = document.createElement('div');
            div.classList.add('trans-card');
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <p class="date">${dateStr}</p>
                        <p class="desc">${tx.description || ''}</p>
                        <p style="font-size:12px; color:#aaa;">${tx.wallet?.name || ''} • ${tx.category?.name || ''}</p>
                    </div>
                    <p style="color:${isIncome ? '#2ecc71' : '#ff4d4d'}; font-size:16px; font-weight:600; white-space:nowrap; margin-left:16px;">
                        ${isIncome ? '+' : '-'}${Number(tx.amount).toLocaleString('vi-VN')} đ
                    </p>
                </div>
            `;
            list.appendChild(div);
        });

    } catch (error) {
        console.error('Lỗi load transactions:', error);
    }
}

// ========== LOAD WALLET FILTERS ==========
async function loadWalletFilterOptions() {
    try {
        const res = await fetch(`${BASE_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const wallets = data.data || data;

        const container = document.getElementById('walletFilterOptions');
        wallets.forEach(w => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = w.name;
            btn.style = 'padding: 6px; border: none; background: #f0f0f0; border-radius: 6px; cursor: pointer;';
            btn.onclick = () => applyWalletFilter(w.id, w.name);
            container.appendChild(btn);
        });
    } catch (error) {
        console.error('Lỗi load wallet filter:', error);
    }
}

// ========== LOGIC UI: MENU & FILTER ==========
function toggleFilterMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menuId === 'timeFilterMenu') document.getElementById('walletFilterMenu').style.display = 'none';
    if (menuId === 'walletFilterMenu') document.getElementById('timeFilterMenu').style.display = 'none';
    
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
}

function showTimeInput(type) {
    document.getElementById('calendarBox').style.display = 'block';
    ['dateInput', 'weekInput', 'monthInput'].forEach(id => document.getElementById(id).style.display = 'none');

    const targetInput = document.getElementById(type + 'Input');
    targetInput.style.display = 'block';
    try { targetInput.showPicker(); } catch (e) {}
}

function applyTimeFilter(value, type) {
    if (!value) return; 

    let displayText = "Tháng này";

    if (type === 'date') {
        currentFilter.period = 'day';
        currentFilter.date = value;
        const parts = value.split('-');
        displayText = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else if (type === 'week') {
        currentFilter.period = 'week';
        const [year, week] = value.split('-W');
        const d = new Date(year, 0, 1 + (week - 1) * 7);
        currentFilter.date = d.toISOString().split('T')[0];
        displayText = `Tuần ${week}/${year}`;
    } else if (type === 'month') {
        currentFilter.period = 'month';
        currentFilter.date = value + '-01';
        const parts = value.split('-');
        displayText = `Tháng ${parts[1]}/${parts[0]}`;
    }

    document.getElementById('timeFilterResult').innerText = displayText;
    document.getElementById('timeFilterMenu').style.display = 'none';
    document.getElementById('calendarBox').style.display = 'none';

    // Cập nhật CẢ biểu đồ VÀ danh sách giao dịch
    loadPieChart(); 
    loadRecentTransactions(); 
}

function applyWalletFilter(walletId, walletName) {
    document.getElementById('walletFilterResult').innerText = walletName;
    document.getElementById('walletFilterMenu').style.display = 'none';
    
    currentFilter.walletId = walletId;
    loadPieChart(); // Load lại chart dựa theo filter mới
}

// Đóng popup khi click ra ngoài
document.addEventListener('click', function(event) {
    const timeMenu = document.getElementById('timeFilterMenu');
    const walletMenu = document.getElementById('walletFilterMenu');
    
    if (timeMenu && timeMenu.style.display === 'block' && !event.target.closest('#timeFilterMenu') && !event.target.closest('[onclick="toggleFilterMenu(\'timeFilterMenu\')"]')) {
        timeMenu.style.display = 'none';
        document.getElementById('calendarBox').style.display = 'none';
    }
    if (walletMenu && walletMenu.style.display === 'block' && !event.target.closest('#walletFilterMenu') && !event.target.closest('[onclick="toggleFilterMenu(\'walletFilterMenu\')"]')) {
        walletMenu.style.display = 'none';
    }
});

// ========== KHỞI CHẠY ==========
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    loadBalance();
    loadSummary();
    loadWalletFilterOptions();
    loadPieChart(); // Load Thống kê (mặc định tháng hiện tại)
    loadRecentTransactions();
});

