let selectedCatType = 'expense';
let selectedCatIcon = '';
let selectedCatColor = '';
let selectedEditColor = '';

// ========== LOAD DANH MỤC ==========
async function loadCategories() {
    try {
        const res = await fetch(`${BASE_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.status === 401) { window.location.href = 'login.html'; return; }

        const data = await res.json();
        const categories = data.data || [];

        const income = categories.filter(c => c.type === 'income');
        const expense = categories.filter(c => c.type === 'expense');

        renderCategories(income, 'incomeCategories');
        renderCategories(expense, 'expenseCategories');

    } catch (error) {
        console.error('Lỗi load danh mục:', error);
    }
}

// ========== RENDER ==========
const emojiMap = {
    'food': '🍜', 'travel': '🚗', 'shopping': '🛍️', 'water': '💡',
    'home': '🏠', 'health': '💊', 'fun': '🎮', 'edu': '📚',
    'beauty': '💄', 'salary': '💰', 'invest': '📈', 'stock': '💹',
    'bonus': '🎁', 'bank': '🏦', 'other': '📌'
};

function renderCategories(categories, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<p style="color:#aaa; padding:10px 0;">Chưa có danh mục nào.</p>';
        return;
    }

    categories.forEach(cat => {
        const div = document.createElement('div');
        div.classList.add('category-card');
        div.style.backgroundColor = cat.color || '#f5f5f5';

        const emoji = emojiMap[cat.icon] || '📌';

        div.innerHTML = `
            <div class="cat-left">
                <div class="cat-icon" style="font-size:24px;">${emoji}</div>
                <span class="cat-name">${cat.name}</span>
            </div>
            <div class="cat-right">
                <button class="action-icon-btn" onclick="openEditModal(${cat.id}, '${cat.name}', '${cat.color || ''}')">✎</button>
                <button class="action-icon-btn" onclick="deleteCategory(${cat.id}, this)">🗑</button>
            </div>
        `;
        container.appendChild(div);
    });
}

const PRESETS = [
    { name: 'Ăn uống',     icon: 'food',     emoji: '🍜' },
    { name: 'Đi lại',      icon: 'travel',   emoji: '🚗' },
    { name: 'Mua sắm',     icon: 'shopping', emoji: '🛍️' },
    { name: 'Điện nước',   icon: 'water',    emoji: '💡' },
    { name: 'Nhà cửa',     icon: 'home',     emoji: '🏠' },
    { name: 'Sức khỏe',    icon: 'health',   emoji: '💊' },
    { name: 'Giải trí',    icon: 'fun',      emoji: '🎮' },
    { name: 'Giáo dục',    icon: 'edu',      emoji: '📚' },
    { name: 'Làm đẹp',     icon: 'beauty',   emoji: '💄' },
    { name: 'Tiền lương',  icon: 'salary',   emoji: '💰' },
    { name: 'Đầu tư',      icon: 'invest',   emoji: '📈' },
    { name: 'Chứng khoán', icon: 'stock',    emoji: '💹' },
    { name: 'Tiền thưởng', icon: 'bonus',    emoji: '🎁' },
    { name: 'Tiền lãi',    icon: 'bank',     emoji: '🏦' },
    { name: 'Khác',        icon: 'other',    emoji: '📌' },
];

let selectedPresetName = '';
let selectedPresetIcon = '';

function renderPresets() {
    const grid = document.getElementById('presetGrid');
    grid.innerHTML = '';
    PRESETS.forEach(p => {
        const btn = document.createElement('button');
        btn.classList.add('preset-btn');
        btn.innerHTML = `<span>${p.emoji}</span>${p.name}`;
        btn.onclick = function() {
            // Chọn preset → điền tên vào input, bỏ chọn các preset khác
            grid.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPresetName = p.name;
            selectedPresetIcon = p.icon;
            document.getElementById('catName').value = ''; // Xóa input tự nhập
            document.getElementById('catName').placeholder = `Đang dùng: ${p.name}`;
        };
        grid.appendChild(btn);
    });
}

// ========== THÊM DANH MỤC ==========
async function addCategory() {
    const customName = document.getElementById('catName').value.trim();
    const name = customName || selectedPresetName;
    const icon = customName ? 'other' : (selectedPresetIcon || 'other');

    if (!name) { alert('Vui lòng chọn hoặc nhập tên danh mục!'); return; }
    if (!selectedCatType) { alert('Vui lòng chọn nguồn tiền!'); return; }

    try {
        const res = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name,
                type: selectedCatType,
                color: selectedCatColor || '#f5f5f5',
                icon
            })
        });

        const data = await res.json();
        if (res.ok) {
            closeModal('addCategoryModal');
            // Reset
            document.getElementById('catName').value = '';
            document.getElementById('catName').placeholder = 'Nhập tên danh mục khác...';
            document.getElementById('presetGrid').querySelectorAll('.preset-btn')
                .forEach(b => b.classList.remove('selected'));
            selectedPresetName = '';
            selectedPresetIcon = '';
            selectedCatColor = '';
            loadCategories();
        } else {
            alert(data.message || 'Thêm danh mục thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// Thêm renderPresets() vào DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    loadCategories();
    renderPresets();
});

// ========== SỬA DANH MỤC ==========
function openEditModal(id, name, color) {
    document.getElementById('editCatId').value = id;
    document.getElementById('editCatName').value = name;
    selectedEditColor = color;
    showModal('editCategoryModal');
}

async function updateCategory() {
    const id = document.getElementById('editCatId').value;
    const name = document.getElementById('editCatName').value.trim();
    if (!name) { alert('Vui lòng nhập tên danh mục!'); return; }

    try {
        const res = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, color: selectedEditColor })
        });

        const data = await res.json();
        if (res.ok) {
            closeModal('editCategoryModal');
            loadCategories();
        } else {
            alert(data.message || 'Cập nhật thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== XÓA DANH MỤC ==========
async function deleteCategory(id, btn) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
        const res = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.ok) {
            btn.closest('.category-card').remove();
        } else {
            alert('Xóa thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== HELPER CHỌN ==========
function selectCatType(type, btn) {
    selectedCatType = type;
    btn.closest('.source-selector-row').querySelectorAll('.source-btn')
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function selectIcon(icon, btn) {
    selectedCatIcon = icon;
    btn.closest('.icon-selector-row').querySelectorAll('.icon-box')
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function selectColor(color, el) {
    selectedCatColor = color;
    el.closest('.color-selector-row').querySelectorAll('.color-circle')
        .forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function selectEditColor(color, el) {
    selectedEditColor = color;
    el.closest('.color-selector-row').querySelectorAll('.color-circle')
        .forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

// ========== KHỞI CHẠY ==========
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    loadCategories();
});