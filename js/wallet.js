document.addEventListener('DOMContentLoaded', () => {
    
    // Xử lý sự kiện click cho các nút "Xóa"
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xác nhận trước khi xóa
            const confirmDelete = confirm('Bạn có chắc chắn muốn xóa ví này khỏi danh sách?');
            
            if (confirmDelete) {
                // Tìm thẻ bao ngoài cùng của ví (.wallet-item) và xóa nó khỏi DOM
                const walletItem = this.closest('.wallet-item');
                if (walletItem) {
                    walletItem.style.transition = "opacity 0.3s ease";
                    walletItem.style.opacity = "0";
                    
                    setTimeout(() => {
                        walletItem.remove();
                        // Tại đây bạn có thể gọi API để cập nhật lại tổng số dư nếu dùng backend
                    }, 300);
                }
            }
        });
    });
});

function selectWalletType(type) {
    document.getElementById('step1').style.display = 'none';
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