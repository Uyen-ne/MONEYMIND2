// Hàm mở Modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Hàm đóng Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// BẮT SỰ KIỆN CLICK AN TOÀN (CHỈ ĐÓNG KHI BẤM NÚT HỦY/THOÁT)
document.addEventListener('click', function(event) {
        const nutHuy = event.target.closest('.btn-form-cancel');
    
    if (nutHuy) {
        event.preventDefault(); 

        const theCuaSo = event.target.closest('.modal-overlay');
        if (theCuaSo) {
            theCuaSo.classList.remove('active'); 
            theCuaSo.style.display = 'none';     
        }
    }

});

document.addEventListener('DOMContentLoaded', function() {
    
    const optionButtons = document.querySelectorAll('.opt-select, .icon-box, .source-btn, .color-circle');

    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            const parentGroup = this.parentElement;

            const siblings = parentGroup.querySelectorAll('.opt-select, .icon-box, .source-btn, .color-circle');
            siblings.forEach(sib => sib.classList.remove('selected'));

            this.classList.add('selected');
        });
    });
    
});

// TÍNH NĂNG: HIỆN THÔNG BÁO XÁC NHẬN KHI BẤM NÚT XÓA
document.addEventListener('click', function(event) {
    const nutBam = event.target.closest('button');
    if (!nutBam) return; 

    if (nutBam.classList.contains('delete-btn') || nutBam.textContent.includes('🗑')) {
        
        const dongY = confirm("Bạn có chắc chắn muốn xóa mục này khỏi danh sách?");

        if (dongY) {
            const theBaoQuanh = nutBam.closest('.category-card, .goal-setting-block, .transaction-card');
            
            if (theBaoQuanh) {
                theBaoQuanh.style.transition = "0.3s";
                theBaoQuanh.style.opacity = "0";
                
                setTimeout(() => {
                    theBaoQuanh.remove(); 
                }, 300);
            }
        }
    }
});