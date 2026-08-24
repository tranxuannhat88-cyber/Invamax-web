import os

with open('app_combined.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Disable loadDraft on initial load (lines 280-300 approx)
# Find the block where loadDraft is called on initialization
# Actually, I'll just clear the local storage on init, or comment it out.
# Let's search for "loadDraft();" and replace it with "// loadDraft();" in the initialization block (first occurrence)
js = js.replace('loadDraft();\n            renderResults', '// loadDraft();\n            renderResults')
js = js.replace('loadDraft();\n        updateUI();', 'localStorage.removeItem(LS_KEY); // form always blank\n        updateUI();')

# 2. Append history functions
history_js = """
// --- HISTORY MODAL LOGIC ---
window.historyRecords = [];

window.showHistoryModal = async function() {
    const user = JSON.parse(localStorage.getItem('invamax_user'));
    if (!user || user.role !== 'customer') {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa đăng nhập',
            text: 'Vui lòng quay lại Trang chủ để Đăng nhập trước khi xem Lịch sử.',
            confirmButtonText: 'Quay lại Trang chủ'
        }).then(() => {
            window.location.href = '../index.html';
        });
        return;
    }
    
    document.getElementById('history-modal').style.display = 'flex';
    const container = document.getElementById('history-list-container');
    container.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
    
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'get_history', email: user.email })
        });
        const res = await response.json();
        
        if (res.status === 'success') {
            window.historyRecords = res.data;
            if (window.historyRecords.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">Chưa có lịch sử khám bệnh.</div>';
                return;
            }
            
            let html = '';
            window.historyRecords.forEach((record, index) => {
                const date = new Date(record.timestamp).toLocaleString('vi-VN');
                html += `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: #0f172a; margin-bottom: 5px;">${date}</div>
                            <div style="font-size: 13px; color: #64748b;">Điểm cảnh báo: <span style="font-weight:bold; color: #ea580c;">${record.warningScore}</span> | Mức độ: <span style="font-weight:bold; color: #10b981;">${record.level}</span></div>
                        </div>
                        <button onclick="loadHistoryRecord(${index})" style="background: #ea580c; border: none; color: white; padding: 8px 15px; border-radius: 8px; font-weight: 600; cursor: pointer;">Xem lại</button>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 20px;">Không thể tải lịch sử.</div>';
        }
    } catch(e) {
        container.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 20px;">Lỗi kết nối.</div>';
    }
}

window.hideHistoryModal = function() {
    document.getElementById('history-modal').style.display = 'none';
}

window.loadHistoryRecord = function(index) {
    const record = window.historyRecords[index];
    if (!record || !record.rawAnswers) return;
    
    // Clear form visually first by resetting form
    document.getElementById('diagnostic-form').reset();
    
    // Restore raw answers
    const rawAnswers = record.rawAnswers;
    for (let key in rawAnswers) {
        const el = document.getElementById('diagnostic-form').elements[key];
        if (el) {
            if (el.type === 'radio') {
                const radio = Array.from(document.getElementById('diagnostic-form').elements[key]).find(r => r.value === rawAnswers[key]);
                if (radio) radio.checked = true;
            } else if (el.type === 'checkbox' || (el.length && el[0].type === 'checkbox')) {
                let val = rawAnswers[key];
                let arr = Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(s => s.trim()) : [val]);
                const checkboxes = document.querySelectorAll(`input[name="${key}"]`);
                checkboxes.forEach(cb => {
                    if(arr.includes(cb.value.trim())) {
                        cb.checked = true;
                    }
                });
            } else {
                el.value = rawAnswers[key];
            }
        }
    }
    
    hideHistoryModal();
    
    // Jump to step 1
    currentStep = 1;
    updateUI();
    
    Swal.fire({
        icon: 'success',
        title: 'Đã tải lịch sử',
        text: 'Dữ liệu khám bệnh cũ đã được điền vào bảng khảo sát.',
        timer: 1500,
        showConfirmButton: false
    });
}
"""

if 'window.showHistoryModal' not in js:
    js += '\n\n' + history_js

with open('app_combined.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Updated app_combined.js')
