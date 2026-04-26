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

// Tính năng: Bấm chọn các nút trong form
document.addEventListener('DOMContentLoaded', function() {
    
    // Tìm tất cả các loại nút có thể chọn trong toàn bộ trang web
    const optionButtons = document.querySelectorAll('.opt-select, .icon-box, .source-btn, .color-circle');

    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            // Bước A: Tìm cái khung bao quanh nhóm nút này (để không lố sang nhóm khác)
            const parentGroup = this.parentElement;

            // Bước B: Xóa trạng thái 'selected' của tất cả các anh em trong cùng 1 nhóm
            const siblings = parentGroup.querySelectorAll('.opt-select, .icon-box, .source-btn, .color-circle');
            siblings.forEach(sib => sib.classList.remove('selected'));

            // Bước C: Bật trạng thái 'selected' cho chính cái nút vừa được bấm
            this.classList.add('selected');
        });
    });
    
});