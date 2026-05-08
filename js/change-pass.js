document.getElementById('submitChangeBtn').addEventListener('click', async function(event) {
    event.preventDefault();
    let hopLe = true;

    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;

    // 1. Kiểm tra định dạng mật khẩu mới
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(newPass)) {
        document.getElementById('newPassError').style.display = 'block';
        hopLe = false;
    } else {
        document.getElementById('newPassError').style.display = 'none';
    }

    // 2. Kiểm tra mật khẩu nhập lại
    if (newPass !== confirmPass || confirmPass === '') {
        document.getElementById('confirmPassError').style.display = 'block';
        hopLe = false;
    } else {
        document.getElementById('confirmPassError').style.display = 'none';
    }

    if (!hopLe) return;

    // 3. Gọi API đổi mật khẩu
    try {
        const res = await fetch(`${BASE_URL}/user/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                current_password: oldPass,
                new_password: newPass,
                new_password_confirmation: confirmPass
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Đổi mật khẩu thành công!');
            window.location.href = 'home.html';
        } else {
            alert(data.message || 'Đổi mật khẩu thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
});