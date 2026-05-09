// ========== TẠO GIAO DIỆN CHUNG TỰ ĐỘNG ==========
function injectGlobalUI() {
    const uiContainer = document.createElement('div');
    uiContainer.innerHTML = `
        <div class="avatar-dropdown" id="avatarMenu" style="display: none;">
            <ul>
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
                <!-- Chấm đỏ trong menu (đã ẩn đi vì sẽ dùng chấm đỏ ở ngoài chuông) -->
                <span id="notifBadgeInner" style="display:none; background:#FF4D4D; color:white; border-radius:50%; padding:2px 7px; font-size:12px;"></span>
            </div>
            <ul id="notificationList">
                <li style="color:#aaa; font-size:13px;">Đang tải...</li>
            </ul>
        </div>

        <div class="modal-overlay" id="logoutModal" style="display: none;">
            <div class="modal-card">
                <p>Bạn có chắc chắn muốn đăng xuất?</p>
                <div class="modal-btns">
                    <button class="btn-confirm" onclick="handleLogout()">Đồng ý</button>
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

    // KẾT NỐI AVATAR
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

    // KẾT NỐI CHUÔNG & THÊM CHẤM ĐỎ LÊN CHUÔNG
    // KẾT NỐI CHUÔNG & THÊM CHẤM ĐỎ LÊN CHUÔNG
    const bellBtn = document.querySelector('.icon[alt="Notification"]');
    if (bellBtn && notifMenu) {
        // Tạo một thẻ div bọc riêng cái chuông lại
        const bellWrapper = document.createElement('div');
        bellWrapper.style.position = 'relative';
        bellWrapper.style.display = 'flex';
        bellWrapper.style.alignItems = 'center';
        bellWrapper.style.cursor = 'pointer';

        // Đưa cái bọc này vào thay thế vị trí của chuông, rồi nhét chuông vào trong bọc
        bellBtn.parentNode.insertBefore(bellWrapper, bellBtn);
        bellWrapper.appendChild(bellBtn);

        // Tạo chấm đỏ gắn lên cái bọc
        const globalBadge = document.createElement('span');
        globalBadge.id = 'globalNotifBadge';
        // Tùy chỉnh top/right ở đây nếu bạn muốn chấm đỏ xích lên/xuống
        globalBadge.style.cssText = 'display: none; position: absolute; top: -6px; right: -6px; background: #FF4D4D; color: white; border-radius: 50%; padding: 2px 5px; font-size: 10px; font-weight: bold; min-width: 14px; text-align: center; line-height: 1; border: 2px solid white;';
        bellWrapper.appendChild(globalBadge);

        // Bấm vào cái bọc (chứa chuông + chấm đỏ) để mở menu
        bellWrapper.onclick = function(e) {
            e.stopPropagation();
            const isOpen = notifMenu.style.display !== 'none';
            notifMenu.style.display = isOpen ? 'none' : 'block';
            if (menu) menu.style.display = 'none';
        };
    }

    // Click ra ngoài đóng cả 2 menu
    window.onclick = function() {
        if (menu) menu.style.display = 'none';
        if (notifMenu) notifMenu.style.display = 'none';
    };

    // Vừa vào trang là load ngay thông báo để lấy số lượng chưa đọc gắn lên chuông
    loadNotifications();
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

        // Đếm số thông báo chưa đọc
        const unread = notifications.filter(n => !n.is_read).length;
        
        // Cập nhật chấm đỏ
        updateBadgeUI(unread);

        list.innerHTML = notifications.map(n => {
            const date = new Date(n.created_at);
            const dateStr = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
            const unreadStyle = n.is_read ? '' : 'font-weight:600; background:#fff9f0; cursor:pointer;';
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
    // Nếu đã đọc rồi (không in đậm) thì không gọi API nữa để tránh lỗi
    if (li.style.fontWeight !== '600') return;

    try {
        await fetch(`${BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Đổi giao diện thẻ li thành đã đọc
        li.style.fontWeight = 'normal';
        li.style.background = 'white';
        
        // Giảm số lượng thông báo đi 1
        const globalBadge = document.getElementById('globalNotifBadge');
        let currentCount = parseInt(globalBadge.innerText) || 0;
        updateBadgeUI(currentCount - 1);

    } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
    }
}

// Hàm hỗ trợ cập nhật số lượng trên chấm đỏ
function updateBadgeUI(count) {
    const globalBadge = document.getElementById('globalNotifBadge');
    const innerBadge = document.getElementById('notifBadgeInner');

    if (count > 0) {
        if (globalBadge) { globalBadge.style.display = 'inline-block'; globalBadge.innerText = count; }
        if (innerBadge) { innerBadge.style.display = 'inline'; innerBadge.innerText = count; }
    } else {
        if (globalBadge) globalBadge.style.display = 'none';
        if (innerBadge) innerBadge.style.display = 'none';
    }
}


// ========== CÁC HÀM XỬ LÝ TOÀN CỤC KHÁC ==========

window.showModal = function(id) {
    document.getElementById(id).style.display = 'flex';
};

window.hideModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function handleExportFile() {
    const confirmed = confirm('Bạn có chắc chắn muốn xuất file giao dịch không?');
    if (!confirmed) return;

    try {
        const res = await fetch(`${BASE_URL}/transactions/export`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!res.ok) {
            alert('Xuất file thất bại!');
            return;
        }

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

window.handleDeleteAccount = async function() {
    try {
        const res = await fetch(`${BASE_URL}/user`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.ok) {
            alert('Tài khoản đã được xóa!');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        } else {
            const data = await res.json();
            alert(data.message || 'Xóa tài khoản thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// KÍCH HOẠT KHI LOAD XONG HTML
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalUI);
} else {
    injectGlobalUI();
}