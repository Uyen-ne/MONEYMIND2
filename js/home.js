// ========== LOAD SỐ DƯ TỔNG ==========
async function loadSummary() {
    try {
        const res = await fetch(`${BASE_URL}/statistics/summary?period=month`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.status === 401) { window.location.href = 'login.html'; return; }

        const data = await res.json();
        const summary = data.data;

        // Hiện % tăng/giảm so với tháng trước
        const pct = summary.percentage;
        const sign = pct >= 0 ? 'tăng' : 'giảm';
        const absPct = Math.abs(pct);
        const month = new Date().getMonth(); // tháng hiện tại
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
        document.querySelector('.balance-info h2').textContent =
            total.toLocaleString('vi-VN') + ' đ';
    } catch (error) {
        console.error('Lỗi load balance:', error);
    }
}

// ========== LOAD BIỂU ĐỒ TRÒN ==========
async function loadPieChart() {
    try {
        const res = await fetch(`${BASE_URL}/statistics/pie-chart?period=month`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const items = data.data;

        if (!items || items.length === 0) return;

        const total = items.reduce((sum, i) => sum + i.value, 0);
        const labels = items.map(i => i.name);
        const values = items.map(i => Math.round((i.value / total) * 100));
        const colors = items.map(i => i.color || '#E0E0E0');

        // Cập nhật stat items
        const statList = document.querySelector('.stats-left');
        const oldStats = statList.querySelectorAll('.stat-item');
        oldStats.forEach(s => s.remove());

        const bgClasses = ['yellow-bg', 'green-bg', 'purple-bg', 'blue-bg'];
        items.forEach((item, i) => {
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
        // Cập nhật biểu đồ
        if (window.myPieChart) {
            window.myPieChart.data.labels = labels;
            window.myPieChart.data.datasets[0].data = values;
            window.myPieChart.data.datasets[0].backgroundColor = colors;
            window.myPieChart.update();
        }

    } catch (error) {
        console.error('Lỗi load pie chart:', error);
    }
}

//========= LOAD THỐNG KÊ THEO KỲ ==========
async function loadStats(period) {
    try {
        const res = await fetch(`${BASE_URL}/statistics/pie-chart?period=${period}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const items = data.data;

        const statList = document.querySelector('.stats-left');
        const oldStats = statList.querySelectorAll('.stat-item');
        oldStats.forEach(s => s.remove());

        if (!items || items.length === 0) {
            const div = document.createElement('div');
            div.classList.add('stat-item');
            div.innerHTML = '<span style="color:#aaa">Không có dữ liệu.</span>';
            statList.appendChild(div);

            // Xóa chart
            if (window.myPieChart) {
                window.myPieChart.data.labels = [];
                window.myPieChart.data.datasets[0].data = [];
                window.myPieChart.data.datasets[0].backgroundColor = [];
                window.myPieChart.update();
            }
            return;
        }

        const total = items.reduce((sum, i) => sum + i.value, 0);
        const labels = items.map(i => i.name);
        const values = items.map(i => Math.round((i.value / total) * 100));
        const colors = items.map(i => i.color || '#E0E0E0');

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

        if (window.myPieChart) {
            window.myPieChart.data.labels = labels;
            window.myPieChart.data.datasets[0].data = values;
            window.myPieChart.data.datasets[0].backgroundColor = colors;
            window.myPieChart.update();
        }

    } catch (error) {
        console.error('Lỗi load stats:', error);
    }
}

// ========== LOAD GIAO DỊCH GẦN ĐÂY ==========
async function loadRecentTransactions() {
    try {
        const res = await fetch(`${BASE_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        
        // BE trả về paginate nên data nằm sâu hơn
        const transactions = data.data?.data || data.data || data || [];

        const list = document.getElementById('transList');
        list.innerHTML = '';

        if (!transactions || transactions.length === 0) {
            list.innerHTML = '<p style="color:#aaa">Chưa có giao dịch nào.</p>';
            return;
        }

        transactions.forEach(tx => {
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

// ========== KHỞI CHẠY ==========
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    loadBalance();
    loadSummary();
    loadPieChart();
    loadRecentTransactions();
});