import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update admin.js logic, mock data, and prompt
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # 1.1 Replace Mock Data
    old_mock_causeChains = r'causeChains:\s*\[[\s\S]*?\],\s*quickWins:'
    new_mock_deepDiveCards = '''deepDiveCards: [
                        {module: "Flow", surveyReality: "Tồn kho bán thành phẩm (WIP) tăng cao và chờ đợi lệnh sản xuất.", aiInsight: "Flow kém khiến dòng chảy nguyên vật liệu đứt gãy. Tồn kho WIP không phải do khách hàng yêu cầu, mà là kết quả của việc các trạm sản xuất không đồng bộ nhịp độ.", businessImpact: "Ứ đọng dòng tiền, rủi ro hàng lỗi ngầm không phát hiện kịp thời."},
                        {module: "Capacity", surveyReality: "Làm thêm giờ liên tục và chạy lô lớn.", aiInsight: "Việc đánh giá năng lực Capacity thiếu dữ liệu chuẩn xác dẫn đến lập kế hoạch bị động, phải dùng biện pháp OT và lô lớn để bù đắp. Sự chênh lệch năng lực này là nguyên nhân gốc rễ gây dư thừa năng lực ảo.", businessImpact: "Tăng chi phí nhân công, giảm biên lợi nhuận."},
                        {module: "Standard", surveyReality: "Chất lượng không ổn định, nhiều khuyết tật.", aiInsight: "Thiếu tiêu chuẩn (Standard) thao tác dẫn đến công nhân làm theo thói quen. Bất cứ biến động nhỏ nào cũng gây ra lỗi, biểu hiện rõ nhất qua tỷ lệ khuyết tật cao.", businessImpact: "Tốn chi phí làm lại (Rework), uy tín sụt giảm."}
                    ],
                    quickWins:'''
    js = re.sub(old_mock_causeChains, new_mock_deepDiveCards, js)

    # 1.2 Update Render HTML template
    # There are two places where 'a4-cause-chains' is referenced
    # I will replace the element ID in HTML and JS
    js = js.replace("getElementById('a4-cause-chains')", "getElementById('a4-deep-dive-cards')")
    js = js.replace("aiJsonData.consulting.causeChains", "aiJsonData.consulting.deepDiveCards")
    
    old_render_row = r'''el_chains\.innerHTML\s*=\s*aiJsonData\.consulting\.deepDiveCards\.slice\(0,5\)\.map\(c\s*=>\s*`[\s\S]*?`\)\.join\(''\);'''
    new_render_row = '''el_chains.innerHTML = aiJsonData.consulting.deepDiveCards.slice(0,3).map(c => `
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; margin-bottom: 10px;">
                    <div style="display: flex; gap: 15px; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; margin-bottom: 2px;">VẤN ĐỀ TỪ KHẢO SÁT</div>
                            <div style="color: #ef4444; font-weight: bold; margin-bottom: 4px;">\${c.module} (Module Yếu)</div>
                            <div style="color: #475569;">\${c.surveyReality}</div>
                        </div>
                        <div style="flex: 2; border-left: 1px dashed #cbd5e1; padding-left: 15px;">
                            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; margin-bottom: 2px;">CHUYÊN GIA PHÂN TÍCH (LOGIC)</div>
                            <div style="color: #334155; margin-bottom: 5px;">\${c.aiInsight}</div>
                            <div style="color: #ea580c; font-weight: bold;"><i class="fas fa-exclamation-triangle"></i> Tác động: \${c.businessImpact}</div>
                        </div>
                    </div>
                </div>
            `).join('');'''
    js = re.sub(old_render_row, new_render_row, js)

    # 1.3 Update System Prompt schema
    old_prompt_schema = r'"causeChains": \[\s*\{\s*"module":\s*"1 trong Top 3 Module FOS y\?u nh\?t",\s*"sign":\s*"D\?u hi\?u",\s*"waste":\s*"Lang ph",\s*"logic":\s*"Phn tch m\?i lin h\? logic \(Khng ph\?ng don nguyn nhn\)",\s*"impact":\s*"Tc d\?ng"\s*\}\s*\]'
    new_prompt_schema = '''"deepDiveCards": [
      {
        "module": "Tên 1 trong 3 Module FOS yếu nhất",
        "surveyReality": "Nhắc lại Dấu hiệu bất thường hoặc Lãng phí nghiêm trọng nhất mà nhà máy ĐANG gặp phải (lấy từ top3Symptoms và top3Wastes) CÓ LIÊN QUAN mật thiết đến module này.",
        "aiInsight": "Phân tích logic của chuyên gia: Tại sao sự yếu kém của Module này lại sinh ra bề nổi (dấu hiệu/lãng phí) kia? Nếu khách hàng đánh giá module rất thấp nhưng lại bảo KHÔNG CÓ lãng phí/dấu hiệu liên quan, hãy thẳng thắn chỉ ra sự mâu thuẫn và rủi ro tiềm ẩn (ngầm).",
        "businessImpact": "Tác động tiêu cực đến doanh thu, chi phí, năng lực cạnh tranh."
      }
    ]'''
    # Use string replace for safety, removing whitespace variance if needed, or regex
    js = re.sub(r'"causeChains":\s*\[\s*\{\s*"module":.*?"impact":.*?"\}\s*\]', new_prompt_schema, js, flags=re.DOTALL)
    
    # 1.4 Update System Prompt Quick Wins
    js = js.replace(
        '"quickWins": ["Hnh d?ng c?i thi?n st s?n cho Module 1", "Hnh d?ng cho Module 2", "Hnh d?ng cho Module 3"]',
        '"quickWins": ["Hành động cầm máu 1 (xử lý ngay dấu hiệu bất thường/lãng phí bề nổi của Module yếu)", "Hành động 2", "Hành động 3"]'
    )

    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js successfully.")

except Exception as e:
    print("Error JS: " + str(e))

# 2. Update admin.html and index.html
for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        html = html.replace('<div class="a4-section-title">5. PHÂN TÍCH MỐI LIÊN HỆ & QUICK WINS</div>', 
                            '<div class="a4-section-title">5. PHÂN TÍCH CHUYÊN SÂU & QUICK WINS</div>')
        
        html = html.replace('<h3 style="margin-bottom: 15px; font-size: 13px;">TOP 5 VẤN ĐỀ: LÃNG PHÍ - DẤU HIỆU - MODULE QUẢN TRỊ</h3>', 
                            '<h3 style="margin-bottom: 15px; font-size: 13px;">TOP 3 MODULE YẾU KÉM NHẤT: PHÂN TÍCH CHUYÊN SÂU</h3>')

        header_pattern = r'<div style="display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; gap: 10px; font-size: 10px; font-weight: bold; color: #64748b; margin-bottom: 10px; text-transform: uppercase;">.*?Tác động \(Business Impact\)</div>\s*</div>'
        html = re.sub(header_pattern, '', html, flags=re.DOTALL)

        html = html.replace('<div id="a4-cause-chains"', '<div id="a4-deep-dive-cards"')

        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)

    except Exception as e:
        print("Error HTML " + path + ": " + str(e))
