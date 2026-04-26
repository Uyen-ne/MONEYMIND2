document.getElementById('submitRegBtn').addEventListener('click', async function(event) {
    event.preventDefault();
    let hopLe = true;

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const rePass = document.getElementById('re-password').value;

    // 1. Kiểm tra Email
    const emailRegex = /^([^\s@]+@[^\s@]+\.[^\s@]+)$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').style.display = 'block';
        hopLe = false;
    } else {
        document.getElementById('emailError').style.display = 'none';
    }

    // 2. Kiểm tra Mật khẩu
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
        document.getElementById('passError').style.display = 'block';
        hopLe = false;
    } else {
        document.getElementById('passError').style.display = 'none';
    }

    // 3. Kiểm tra Mật khẩu nhập lại
    if (pass !== rePass || rePass === '') {
        document.getElementById('rePassError').style.display = 'block';
        hopLe = false;
    } else {
        document.getElementById('rePassError').style.display = 'none';
    }

    if (!hopLe) return;

    // 4. Gọi API đăng ký
    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',  
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: fullname, email: email, password: pass, password_confirmation: rePass })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Đăng ký thành công!');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Đăng ký thất bại, thử lại!');
        }
    } catch (error) {
        alert('Không kết nối được server, thử lại sau!');
    }
});

function togglePassword(id, icon) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁';
    }
}