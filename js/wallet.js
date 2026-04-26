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

        item.innerHTML = `
            <div class="wallet-title">
                <span>${wallet.name}</span>
            </div>
            <div class="wallet-card">
                <div class="wallet-details">
                    <p class="detail-row">Số dư: <span class="amount-text">${Number(wallet.balance).toLocaleString('vi-VN')} vnđ</span></p>
                </div>
                <button class="delete-btn" onclick="deleteWalletById(${wallet.id}, this)">
                    <div class="icon-white-circle"><i class="fa-regular fa-trash-can"></i></div>
                    <span>Xóa</span>
                </button>
            </div>
        `;

        list.appendChild(item);
    });
}

// ========== TÍNH TỔNG SỐ DƯ ==========
function updateTotalBalance(wallets) {
    const total = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    document.getElementById('totalBalance').textContent = total.toLocaleString('vi-VN') + ' đ';
}

// ========== XÓA VÍ ==========
async function deleteWalletById(id, btn) {
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa ví này?');
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${BASE_URL}/wallets/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            const walletItem = btn.closest('.wallet-item');
            walletItem.style.transition = 'opacity 0.3s ease';
            walletItem.style.opacity = '0';
            setTimeout(() => {
                walletItem.remove();
                loadWallets(); // Cập nhật lại tổng số dư
            }, 300);
        } else {
            alert('Xóa thất bại, thử lại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== THÊM VÍ ==========
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
        if (!balance) { alert('Vui lòng nhập số dư!'); return; }

    } else if (isBank) {
        if (!provider) { alert('Vui lòng chọn ngân hàng!'); return; }
        balance = document.getElementById('bank-balance').value;
        if (!balance) { alert('Vui lòng nhập số dư!'); return; }
        const account = document.getElementById('bank-account').value;
        name = `Ngân hàng - ${provider}${account ? ' - ' + account : ''}`;

    } else {
        if (!provider) { alert('Vui lòng chọn ví điện tử!'); return; }
        balance = document.getElementById('ew-balance').value;
        if (!balance) { alert('Vui lòng nhập số dư!'); return; }
        const account = document.getElementById('ew-account').value;
        name = `Ví điện tử - ${provider}${account ? ' - ' + account : ''}`;
    }

    try {
        const res = await fetch(`${BASE_URL}/wallets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, balance })
        });

        const data = await res.json();

        if (res.ok) {
            closeModal('addWalletModal');
            backToStep1();
            loadWallets();
        } else {
            alert(data.message || 'Thêm ví thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== HELPER ==========
function selectWalletType(type) {
    document.getElementById('step1').style.display        = 'none';
    document.getElementById('step-cash').style.display    = 'none';
    document.getElementById('step-bank').style.display    = 'none';
    document.getElementById('step-ewallet').style.display = 'none';
    document.getElementById('step-' + type).style.display = 'block';
}

function backToStep1() {
    document.getElementById('step-cash').style.display    = 'none';
    document.getElementById('step-bank').style.display    = 'none';
    document.getElementById('step-ewallet').style.display = 'none';
    document.getElementById('step1').style.display        = 'block';
}

function selectProvider(btn) {
    btn.closest('.provider-list')
       .querySelectorAll('.provider-btn')
       .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Trả hộp thoại về bước 1 (chọn loại ví) để lần sau mở lên như mới
        if (typeof backToStep1 === 'function') {
            backToStep1();
        }
    }
}
// ========== KHỞI CHẠY ==========
document.addEventListener('DOMContentLoaded', () => {
    loadWallets();
});