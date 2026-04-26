function injectGlobalUI() {
    const uiContainer = document.createElement('div');
    uiContainer.innerHTML = `
        <div class="avatar-dropdown" id="avatarMenu" style="display: none;">
            <ul>
                <li onclick="window.location.href='wallet.html'">Ví của tôi</li>
                <li onclick="handleExportFile()">Xuất file</li>
                <li onclick="window.location.href='change-password.html'">Thay đổi mật khẩu</li>
                <li onclick="showModal('logoutModal')">Đăng xuất</li>
                <li onclick="showModal('deleteModal')" style="color: red;">Xóa tài khoản</li>
            </ul>
        </div>

        <!-- Panel thông báo -->
        <div class="notification-dropdown" id="notificationMenu" style="display: none;">
            <div class="notif-header">
                <h4>Thông báo</h4>
                <span id="notifBadge" style="display:none; background:#FF4D4D; color:white; border-radius:50%; padding:2px 7px; font-size:12px;"></span>
            </div>
            <ul id="notificationList">
                <li style="color:#aaa; font-size:13px;">Đang tải...</li>
            </ul>
        </div>

        <div class="modal-overlay" id="logoutModal" style="display: none;">
            <div class="modal-card">
                <p>Bạn có chắc chắn muốn đăng xuất?</p>
                <div class="modal-btns">
                    <button class="btn-confirm" onclick="location.href='login.html'">Đồng ý</button>
                    <button class="btn-cancel" onclick="hideModal('logoutModal')">Thoát</button>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="deleteModal" style="display: none;">
            <div class="modal-card">
                <p>Bạn có chắc chắn muốn xóa tài khoản?</p>
                <div class="modal-btns">
                    <button class="btn-confirm" onclick="handleDeleteAccount()">Đồng ý</button>
                    <button class="btn-cancel" onclick="hideModal('deleteModal')">Thoát</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(uiContainer);

    // Kết nối avatar
    const avatarBtn = document.getElementById('avatarBtn') || document.querySelector('.avatar-img');
    const menu = document.getElementById('avatarMenu');
    const notifMenu = document.getElementById('notificationMenu');

    if (avatarBtn && menu) {
        avatarBtn.onclick = function(e) {
            e.stopPropagation();
            menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
            notifMenu.style.display = 'none';
        };
    }

    // Kết nối chuông
    const bellBtn = document.querySelector('.icon[alt="Notification"]');
    if (bellBtn && notifMenu) {
        bellBtn.style.cursor = 'pointer';
        bellBtn.onclick = function(e) {
            e.stopPropagation();
            const isOpen = notifMenu.style.display !== 'none';
            notifMenu.style.display = isOpen ? 'none' : 'block';
            if (menu) menu.style.display = 'none';
            if (!isOpen) loadNotifications(); // Load khi mở
        };
    }

    // Click ra ngoài đóng cả 2
    window.onclick = function() {
        if (menu) menu.style.display = 'none';
        if (notifMenu) notifMenu.style.display = 'none';
    };
}

// ========== LOAD THÔNG BÁO ==========
async function loadNotifications() {
    try {
        const res = await fetch(`${BASE_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await res.json();
        const notifications = data.data || [];
        const list = document.getElementById('notificationList');

        if (notifications.length === 0) {
            list.innerHTML = '<li style="color:#aaa; font-size:13px; padding:10px 0;">Không có thông báo nào.</li>';
            return;
        }

        // Hiện badge số thông báo chưa đọc
        const unread = notifications.filter(n => !n.is_read).length;
        const badge = document.getElementById('notifBadge');
        if (unread > 0) {
            badge.style.display = 'inline';
            badge.textContent = unread;
        }

        list.innerHTML = notifications.map(n => {
            const date = new Date(n.created_at);
            const dateStr = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
            const unreadStyle = n.is_read ? '' : 'font-weight:600; background:#fff9f0;';
            return `
                <li style="${unreadStyle}" onclick="markAsRead(${n.id}, this)">
                    <span class="notif-desc">${n.message || n.title || 'Thông báo mới'}</span>
                    <span class="notif-date">${dateStr}</span>
                </li>
            `;
        }).join('');

    } catch (error) {
        console.error('Lỗi load thông báo:', error);
    }
}

// ========== ĐÁNH DẤU ĐÃ ĐỌC ==========
async function markAsRead(id, li) {
    try {
        await fetch(`${BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        li.style.fontWeight = 'normal';
        li.style.background = 'white';
    } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
    }
}

window.showModal = function(id) {
    document.getElementById(id).style.display = 'flex';
};

window.hideModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalUI);
} else {
    injectGlobalUI();
}

// KHAI BÁO HÀM MODAL TOÀN CỤC
window.showModal = function(id) {
    document.getElementById(id).style.display = 'flex';
};

window.hideModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

// Đợi HTML load xong mới chạy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalUI);
} else {
    injectGlobalUI();
}

// xuất file 
function handleExportFile() {
    const dongY = confirm("Bạn có đồng ý xuất file dữ liệu không?");
    
    if (dongY) {
        alert("Hệ thống đang xuất file... Vui lòng đợi trong giây lát!");
    }
}

// ========== XUẤT FILE =========
async function handleExportFile() {
    const confirmed = confirm('Bạn có chắc chắn muốn xuất file?');
    if (!confirmed) return;

    try {
        const res = await fetch(`${BASE_URL}/transactions/export`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!res.ok) {
            alert('Xuất file thất bại!');
            return;
        }

        // Tạo link tải file
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== XÓA TÀI KHOẢN ==========
window.handleDeleteAccount = async function() {
    try {
        const res = await fetch(`${BASE_URL}/user`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            alert('Tài khoản đã được xóa!');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Xóa tài khoản thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}