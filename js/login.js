document.getElementById('submitBtn').addEventListener('click', async function(event) {
    event.preventDefault();
    
    let hopLe = true;
    const email = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // 1. Kiểm tra Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    if (!hopLe) return;

    // 3. Gọi API login
    try {
        const res = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: pass })
        });

        const data = await res.json();
        // 4. Xử lý phản hồi
        if (res.ok && data.data?.access_token) {
            localStorage.setItem('token', data.data.access_token);
            window.location.href = 'home.html';
        } else {
            alert(data.message || 'Email hoặc mật khẩu không đúng!');
        }
    } catch (error) {
        alert('Không kết nối được server, thử lại sau!');
    }
});

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.src = "https://cdn-icons-png.flaticon.com/512/2767/2767194.png"; // eye closed
    } else {
        input.type = "password";
        icon.src = "https://cdn-icons-png.flaticon.com/512/2767/2767146.png"; // eye open
    }
}