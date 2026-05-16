let currentEditWalletId = null;

// ========== LOAD DANH SÁCH VÍ ==========
async function loadWallets() {
    try {
        const res = await fetch(`${BASE_URL}/wallets`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        const data = await res.json();
        const wallets = data.data || data;
        renderWallets(wallets);
        updateTotalBalance(wallets);

    } catch (error) {
        console.error('Lỗi load ví:', error);
    }
}

// ========== RENDER VÍ LÊN GIAO DIỆN ==========
function renderWallets(wallets) {
    const list = document.getElementById('walletList');
    list.innerHTML = '';

    if (!wallets || wallets.length === 0) {
        list.innerHTML = '<p style="color:#aaa; margin:20px 0;">Chưa có ví nào. Hãy thêm ví mới!</p>';
        return;
    }

    wallets.forEach(wallet => {
        const item = document.createElement('div');
        item.classList.add('wallet-item');
        item.dataset.id = wallet.id;

        const balanceNum = Number(wallet.balance);
        const balanceColor = balanceNum < 0 ? '#ff4d4d' : '#28b463'; // Âm thì màu đỏ, dương/không thì màu xanh

        item.innerHTML = `
            <div style="background: #ffffff; padding: 18px 20px; border-radius: 16px; border: 1px solid #eef0f2; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <span style="font-weight:bold; font-size:16px; color:#333;">${wallet.name}</span>
                    <span style="font-size:15px; color:#555;">Số dư: <b style="font-size:18px; color:${balanceColor};">${balanceNum.toLocaleString('vi-VN')} vnđ</b></span>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="openEditWallet(${wallet.id}, '${wallet.name}', ${wallet.balance})" style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid #eaeaea; background: #fdfdfd; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: background 0.2s;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    
                    <button onclick="deleteWalletById(${wallet.id}, this)" style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid #eaeaea; background: #fff0f0; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: background 0.2s;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

// ========== TÍNH TỔNG SỐ DƯ ==========
function updateTotalBalance(wallets) {
    const total = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const el = document.getElementById('totalBalance');
    if (el) el.textContent = total.toLocaleString('vi-VN') + ' đ';
}

// ========== XÓA VÍ ==========
async function deleteWalletById(id, btn) {
    if (!confirm('Bạn có chắc chắn muốn xóa ví này?')) return;
    try {
        const res = await fetch(`${BASE_URL}/wallets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            loadWallets(); 
        } else {
            alert('Xóa thất bại!');
        }
    } catch (error) {
        alert('Lỗi kết nối server!');
    }
}

// 1. Hàm chọn Logo trong Modal Sửa 
function selectEditProvider(btn) {
    btn.closest('.provider-list').querySelectorAll('.provider-btn')
       .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// 2. Hàm mở Modal Sửa và tự động nhảy vào đúng "Step"
function openEditWallet(id, name, balance) {
    document.getElementById('editWalletId').value = id;
    
    // Ẩn tất cả các Step sửa trước khi xác định
    document.getElementById('edit-step-bank').style.display = 'none';
    document.getElementById('edit-step-ewallet').style.display = 'none';
    document.getElementById('edit-step-cash').style.display = 'none';

    const parts = name.split(' - ');
    const typeText = parts[0] ? parts[0].trim() : '';

    if (typeText === 'Ngân hàng') {
        document.getElementById('edit-step-bank').style.display = 'block';
        document.getElementById('edit-bank-balance').value = balance;
        document.getElementById('edit-bank-account').value = parts[2] || '';
        
        // Tự động tìm và chọn đúng Logo ngân hàng cũ
        const providerName = parts[1] ? parts[1].trim() : '';
        document.querySelectorAll('#edit-step-bank .provider-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.innerText.trim() === providerName) btn.classList.add('selected');
        });

    } else if (typeText === 'Ví điện tử') {
        document.getElementById('edit-step-ewallet').style.display = 'block';
        document.getElementById('edit-ew-balance').value = balance;
        document.getElementById('edit-ew-account').value = parts[2] || '';
        
        const providerName = parts[1] ? parts[1].trim() : '';
        document.querySelectorAll('#edit-step-ewallet .provider-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.innerText.trim() === providerName) btn.classList.add('selected');
        });

    } else {
        document.getElementById('edit-step-cash').style.display = 'block';
        document.getElementById('edit-cash-balance').value = balance;
    }

    showModal('editWalletModal');
}

// 3. Hàm Xác nhận cập nhật (Gọi API PUT)
async function confirmUpdateWallet() {
    const id = document.getElementById('editWalletId').value;
    const isBank = document.getElementById('edit-step-bank').style.display !== 'none';
    const isEW = document.getElementById('edit-step-ewallet').style.display !== 'none';

    let name = '';
    let balance = 0;

    if (isBank) {
        const provider = document.querySelector('#edit-step-bank .provider-btn.selected')?.innerText.trim();
        const account = document.getElementById('edit-bank-account').value;
        balance = document.getElementById('edit-bank-balance').value;
        if (!provider) return alert('Vui lòng chọn ngân hàng!');
        name = `Ngân hàng - ${provider}${account ? ' - ' + account : ''}`;
    } else if (isEW) {
        const provider = document.querySelector('#edit-step-ewallet .provider-btn.selected')?.innerText.trim();
        const account = document.getElementById('edit-ew-account').value;
        balance = document.getElementById('edit-ew-balance').value;
        if (!provider) return alert('Vui lòng chọn ví điện tử!');
        name = `Ví điện tử - ${provider}${account ? ' - ' + account : ''}`;
    } else {
        name = 'Tiền mặt';
        balance = document.getElementById('edit-cash-balance').value;
    }

    if (!balance) return alert('Vui lòng nhập số dư!');

    try {
        const res = await fetch(`${BASE_URL}/wallets/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, balance })
        });

        if (res.ok) {
            closeModal('editWalletModal');
            loadWallets(); // Tải lại danh sách ví
        } else {
            alert('Cập nhật thất bại!');
        }
    } catch (error) {
        alert('Lỗi kết nối server!');
    }
}

// ========== NÚT XÁC NHẬN ==========
async function confirmAddWallet() {
    const isCash   = document.getElementById('step-cash').style.display !== 'none';
    const isBank   = document.getElementById('step-bank').style.display !== 'none';
    const type = isCash ? 'cash' : isBank ? 'bank' : 'ewallet';
    const provider = document.querySelector(`#step-${type} .provider-btn.selected`)?.innerText.trim() || '';

    let name = '';
    let balance = 0;

    if (isCash) {
        name = 'Tiền mặt';
        balance = document.getElementById('cash-balance').value;
    } else if (isBank) {
        balance = document.getElementById('bank-balance').value;
        const account = document.getElementById('bank-account')?.value || '';
        name = `Ngân hàng - ${provider}${account ? ' - ' + account : ''}`;
    } else {
        balance = document.getElementById('ew-balance').value;
        const account = document.getElementById('ew-account')?.value || '';
        name = `Ví điện tử - ${provider}${account ? ' - ' + account : ''}`;
    }

    if (!balance) { alert('Vui lòng nhập số dư!'); return; }

    try {
        const method = currentEditWalletId ? 'PUT' : 'POST';
        const url = currentEditWalletId ? `${BASE_URL}/wallets/${currentEditWalletId}` : `${BASE_URL}/wallets`;
        
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, balance })
        });

        if (res.ok) {
            closeModal('addWalletModal');
            loadWallets(); 
        } else {
            alert('Thao tác thất bại!');
        }
    } catch (error) {
        alert('Lỗi kết nối!');
    }
}

// ========== HELPER ==========
function selectWalletType(type) {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step-cash').style.display = 'none';
    document.getElementById('step-bank').style.display = 'none';
    document.getElementById('step-ewallet').style.display = 'none';
    const target = document.getElementById('step-' + type);
    if (target) target.style.display = 'block';
}

function backToStep1() {
    document.getElementById('step-cash').style.display = 'none';
    document.getElementById('step-bank').style.display = 'none';
    document.getElementById('step-ewallet').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
}

function selectProvider(btn) {
    btn.closest('.provider-list').querySelectorAll('.provider-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        if (typeof backToStep1 === 'function') backToStep1();

        if (modalId === 'addWalletModal') {
            currentEditWalletId = null; 
            // HIỆN LẠI NÚT QUAY LẠI VÀ TIÊU ĐỀ GỐC
            const elements = document.querySelectorAll('#addWalletModal a, #addWalletModal p, #addWalletModal span');
            elements.forEach(el => { el.style.visibility = 'visible'; });

            const bankTitle = document.querySelector('#step-bank h2');
            const ewalletTitle = document.querySelector('#step-ewallet h2');
            if (bankTitle) bankTitle.innerText = "Chọn ngân hàng";
            if (ewalletTitle) ewalletTitle.innerText = "Chọn ví điện tử";

            document.querySelectorAll(`#${modalId} input`).forEach(input => input.value = '');
            document.querySelectorAll(`#${modalId} .provider-btn`).forEach(btn => btn.classList.remove('selected'));
        }
    }
}

document.addEventListener('DOMContentLoaded', loadWallets);