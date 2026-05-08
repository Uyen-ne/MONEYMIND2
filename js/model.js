function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Bấm ra ngoài thì đóng
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
        e.target.classList.remove('active');
    }
});

// Tính năng: Bấm chọn các nút trong form
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