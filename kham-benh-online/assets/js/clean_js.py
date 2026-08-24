import os

# 1. Fix app_combined.js
with open('app_combined.js', 'r', encoding='utf-8') as f:
    js = f.read()

# The old history logic starts near line 1308
# I'll just find the exact chunk and remove it
chunk = """const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('history-list');

if (btnShowHistory && historyModal && closeHistoryModal && historyList) {
    historyModal.style.display = 'none';

    btnShowHistory.addEventListener('click', () => {
        historyModal.style.display = 'flex';
        historyList.innerHTML = '';

        let history = [];
        try {
            const h = localStorage.getItem('invamax_history');
            if (h) history = JSON.parse(h);
        } catch(e) {}

        if (history.length === 0) {
            historyList.innerHTML = '<div style="color: #64748b; text-align: center;">Chưa có lịch sử nộp khảo sát nào.</div>';
            return;
        }

        const reversed = [...history].reverse();

        reversed.forEach((item, index) => {
            const dateStr = new Date(item.timestamp).toLocaleString('vi-VN');
            const companyName = item.factoryInfo ? (item.factoryInfo.tenDoanhNghiep || 'Unknown Company') : 'Unknown Company';
            const realIndex = history.length - 1 - index;

            const div = document.createElement('div');
            div.style.cssText = 'background: #2A3F33; border: 1px solid #3B5345; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center;';
            
            div.innerHTML = `
                <div>
                    <div style="font-weight: bold; color: white; margin-bottom: 5px; font-size: 15px;">${companyName}</div>
                    <div style="font-size: 0.85rem; color: #94a3b8;">Mã: ${item.reportId} | Ngày: ${dateStr}</div>
                </div>
                <button class="btn-xem-lai" data-id="${item.reportId}" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">Xem lại</button>
            `;
            historyList.appendChild(div);
        });

        document.querySelectorAll('.btn-xem-lai').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rId = e.target.getAttribute('data-id');
                window.location.href = `index.html?reportId=${rId}`;
            });
        });
    });

    closeHistoryModal.addEventListener('click', () => {
        historyModal.style.display = 'none';
    });
}"""

if chunk in js:
    js = js.replace(chunk, '')
    print('Removed old history logic.')
else:
    print('Could not find old history chunk.')
    
with open('app_combined.js', 'w', encoding='utf-8') as f:
    f.write(js)
