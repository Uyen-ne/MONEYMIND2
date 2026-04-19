// Bật/Tắt Menu Avatar
const avatarBtn = document.querySelector('.avatar-img');
const avatarMenu = document.getElementById('avatarMenu');

avatarBtn.addEventListener('click', () => {
    avatarMenu.classList.toggle('active');
});

// Hàm hiện Modal
function showModal(id) {
    document.getElementById(id).classList.add('active');
}

// Hàm ẩn Modal
function hideModal(id) {
    document.getElementById(id).classList.remove('active');
}

//hàm thông báo 
function toggleNotification() {
    const menu = document.getElementById('notificationMenu');
    menu.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.icon') && !e.target.closest('#notificationMenu')) {
        document.getElementById('notificationMenu')?.classList.remove('active');
    }
});