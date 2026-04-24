function injectGlobalUI() {
    const uiContainer = document.createElement('div');
    uiContainer.innerHTML = `
        <div class="avatar-dropdown" id="avatarMenu" style="display: none;">
            <ul>
                <li onclick="window.location.href='wallet.html'">Ví của tôi</li>
                <li>Xuất file</li>
                <li onclick="window.location.href='change-password.html'">Thay đổi mật khẩu</li>
                <li onclick="showModal('logoutModal')">Đăng xuất</li>
                <li onclick="showModal('deleteModal')" class="text-danger" style="color: red;">Xóa tài khoản</li>
            </ul>
        </div>

        <div class ="notification-dropdown" id="notificationMenu" style="display: none;">
            <h4>Lịch sử giao dịch</h4>
            <ul id="notificationList">
                <li>
                    <span class="notif-desc">HUYNHNGOCNHAUYEN chuyển khoản 500.000đ</span>
                    <span class="notif-date">20/3/2026</span>
                </li>
                <li>
                    <span class="notif-desc">Thanh toán chi phí cố định 1.000.000đ</span>
                    <span class="notif-date">18/3/2026</span>
                </li>
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

    // KẾT NỐI SỰ KIỆN CLICK CHO AVATAR
    // Hãy đảm bảo trong HTML của bạn, nút avatar có id="avatarBtn" hoặc class="avatar-img"
    const avatarBtn = document.getElementById('avatarBtn') || document.querySelector('.avatar-img');
    const menu = document.getElementById('avatarMenu');

    if (avatarBtn && menu) {
        avatarBtn.onclick = function(e) {
            e.stopPropagation(); // Ngăn việc click bị trôi
            menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
            //đóng noti nếu đang mở
            notifMenu.style.display = 'none';
        };
    }

    //kết nối chuông thông báo
    const bellBtn = document.querySelector('.icon[alt="Notification"]');
    const notifMenu = document.getElementById('notificationMenu');
    // Mở menu thông báo khi click vào chuông
    if (bellBtn && notifMenu) {
        bellBtn.style.cursor = 'pointer';
        bellBtn.onclick = function(e) {
            e.stopPropagation();
            notifMenu.style.display = (notifMenu.style.display === 'none') ? 'block' : 'none';
            //đóng avatar nếu đang mở
            if (menu) menu.style.display = 'none';
        };
    }

    // Click ra ngoài thì đóng cả 2 menu
    window.onclick = function() {
        if (menu) menu.style.display = 'none';
        if (notifMenu) notifMenu.style.display = 'none';
    };
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