// ========== LOAD MỤC TIÊU ==========
async function loadGoals() {
    try {
        const res = await fetch(`${BASE_URL}/goals`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.status === 401) { window.location.href = 'login.html'; return; }

        const data = await res.json();
        const goals = data.data || [];

        renderProgressList(goals);
        renderGoalList(goals);

    } catch (error) {
        console.error('Lỗi load mục tiêu:', error);
    }
}

// ========== RENDER TIẾN ĐỘ ==========
function renderProgressList(goals) {
    const container = document.getElementById('progressList');
    container.innerHTML = '';

    if (goals.length === 0) {
        container.innerHTML = '<p style="color:#aaa; padding:10px 0;">Chưa có mục tiêu nào.</p>';
        return;
    }

    // Lấy thống kê từ API statistics/goals
    fetch(`${BASE_URL}/statistics/goals`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
        const stats = data.data || [];

        if (stats.length === 0) {
            container.innerHTML = '<p style="color:#aaa; padding:10px 0;">Chưa có dữ liệu tiến độ.</p>';
            return;
        }

        stats.forEach(stat => {
            const pct = Math.min(stat.percentage, 100);
            const fillColor = stat.is_exceeded ? 'fill-red' : 'fill-green';
            
            // Format tiền tệ
            const spentStr = Number(stat.spent).toLocaleString('vi-VN');
            const totalStr = Number(stat.amount).toLocaleString('vi-VN');
            const remainingStr = Number(Math.max(stat.amount - stat.spent, 0)).toLocaleString('vi-VN');
            
            // Tính số tiền đã vượt (nếu có)
            const exceededAmount = stat.spent - stat.amount;
            const exceededStr = Number(exceededAmount).toLocaleString('vi-VN');

            const div = document.createElement('div');
            div.classList.add('progress-block');
            div.style.marginBottom = '20px'; // Thêm khoảng cách giữa các mục tiêu

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
                    <p class="category-label" style="margin: 0; font-weight: 600;">${stat.name || stat.category_name}</p>
                    <span style="font-size: 14px; color: #555;">
                        <strong style="color: ${stat.is_exceeded ? '#ff4d4d' : '#333'};">${spentStr} đ</strong> / ${totalStr} đ
                    </span>
                </div>

                <div style="height: 12px; background: #e0e0e0; border-radius: 10px; overflow: hidden; width: 100%;">
                    <div class="${fillColor}" style="width: ${pct}%; height: 100%; border-radius: 10px; transition: width 0.5s ease-in-out;"></div>
                </div>

                ${stat.is_exceeded 
                    ? `<p style="color:#ff4d4d; font-size:13px; margin-top:6px; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                          ⚠️ Đã vượt hạn mức <span style="font-weight: bold;">${exceededStr} đ</span>!
                       </p>` 
                    : `<p style="color:#888; font-size:13px; margin-top:6px;">
                          Còn lại: <span style="font-weight: 500; color: #2ecc71;">${remainingStr} đ</span>
                       </p>`
                }
            `;
            container.appendChild(div);
        });
    })
    .catch(err => console.error('Lỗi load statistics goals:', err));
}

// ========== RENDER DANH SÁCH MỤC TIÊU ==========
function renderGoalList(goals) {
    const container = document.getElementById('goalList');
    container.innerHTML = '';

    if (goals.length === 0) {
        container.innerHTML = '<p style="color:#aaa; padding:10px 0;">Chưa có mục tiêu nào.</p>';
        return;
    }

    goals.forEach(goal => {
        const categoryName = goal.category ? goal.category.name : 'Tổng hợp';
        const amount = Number(goal.amount).toLocaleString('vi-VN');

        const div = document.createElement('div');
        div.classList.add('goal-setting-block');
        div.innerHTML = `
            <p class="category-label">${goal.name || categoryName}</p>
            <div class="goal-row">
                <div class="goal-input-bg">
                    <span class="prefix">Tối đa:</span>
                    <div class="amount-pill">${amount} VNĐ</div>
                </div>
                <div class="goal-actions">
                    <button class="icon-btn edit-btn" onclick="openEditGoal(${goal.id}, '${goal.name || ''}', ${goal.amount}, '${goal.start_date}', '${goal.end_date}')">✎</button>
                    <button class="icon-btn delete-btn" onclick="deleteGoal(${goal.id}, this)">🗑</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// ========== THÊM MỤC TIÊU ==========
async function addGoal() {
    const name = document.getElementById('goalName').value.trim();
    const category_id = document.getElementById('goalCategory').value;
    const amount = document.getElementById('goalAmount').value;
    const start_date = document.getElementById('goalStartDate').value;
    const end_date = document.getElementById('goalEndDate').value;

    if (!amount) { alert('Vui lòng nhập hạn mức!'); return; }
    if (!start_date || !end_date) { alert('Vui lòng chọn thời gian!'); return; }

    try {
        const body = { amount, start_date, end_date };
        if (name) body.name = name;
        if (category_id) body.category_id = category_id;

        const res = await fetch(`${BASE_URL}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (res.ok) {
            closeModal('addGoalModal');
            loadGoals();
        } else {
            alert(data.message || 'Thêm mục tiêu thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== SỬA MỤC TIÊU ==========
function openEditGoal(id, name, amount, startDate, endDate) {
    document.getElementById('editGoalId').value = id;
    document.getElementById('editGoalName').value = name;
    document.getElementById('editGoalAmount').value = amount;
    document.getElementById('editGoalStartDate').value = startDate;
    document.getElementById('editGoalEndDate').value = endDate;
    showModal('editGoalModal');
}

async function updateGoal() {
    const id = document.getElementById('editGoalId').value;
    const name = document.getElementById('editGoalName').value.trim();
    const amount = document.getElementById('editGoalAmount').value;
    const start_date = document.getElementById('editGoalStartDate').value;
    const end_date = document.getElementById('editGoalEndDate').value;

    try {
        const res = await fetch(`${BASE_URL}/goals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, amount, start_date, end_date })
        });

        const data = await res.json();
        if (res.ok) {
            closeModal('editGoalModal');
            loadGoals();
        } else {
            alert(data.message || 'Cập nhật thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== XÓA MỤC TIÊU ==========
async function deleteGoal(id, btn) {
    if (!confirm('Bạn có chắc muốn xóa mục tiêu này?')) return;

    try {
        const res = await fetch(`${BASE_URL}/goals/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.ok) {
            loadGoals();
        } else {
            alert('Xóa thất bại!');
        }
    } catch (error) {
        alert('Không kết nối được server!');
    }
}

// ========== LOAD DANH MỤC VÀO SELECT ==========
async function loadCategoryOptions() {
    try {
        const res = await fetch(`${BASE_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const categories = data.data || data;

        const select = document.getElementById('goalCategory');
        // Chỉ lấy danh mục tiền ra
        categories
            .filter(c => c.type === 'expense')
            .forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
    } catch (error) {
        console.error('Lỗi load danh mục:', error);
    }
}

// ========== KHỞI CHẠY ==========
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    loadGoals();
    loadCategoryOptions();
});