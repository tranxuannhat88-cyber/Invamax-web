import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace auth container with History button
old_auth = '<div id="auth-btn-container" style="position: absolute; right: 20px; top: 20px; z-index: 100;"></div>'
new_btn = '<button id="btn-show-history" onclick="showHistoryModal()" style="position: absolute; right: 20px; top: 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 15px; border-radius: 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; z-index: 100;"><i data-lucide="history"></i> Lịch sử khám bệnh</button>'
html = html.replace(old_auth, new_btn)

# Add History Modal if not exists
modal_html = """
    <!-- History Modal -->
    <div class="login-modal-overlay" id="history-modal" style="display: none; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 1000; padding: 20px;">
        <div class="login-modal" style="background: white; border-radius: 24px; width: 100%; max-width: 600px; padding: 30px; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); max-height: 80vh; display: flex; flex-direction: column;">
            <div class="login-close" onclick="hideHistoryModal()" style="position: absolute; top: 20px; right: 20px; cursor: pointer; color: #94a3b8; font-size: 28px; line-height: 1; margin-top: -5px;">&times;</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 20px; color: #0f172a; text-align: center;"><i data-lucide="history" style="display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Lịch sử Khám bệnh</h2>
            <div id="history-list-container" style="overflow-y: auto; flex-grow: 1; padding-right: 10px;">
                <div style="text-align: center; color: #64748b; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>
            </div>
        </div>
    </div>
"""
if 'id="history-modal"' not in html:
    html = html.replace('</body>', modal_html + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated index.html')
