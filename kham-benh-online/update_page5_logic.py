import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update admin.html and index.html headers
for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        # The old header row HTML
        old_headers = """<div style="flex: 1; text-align: center;">Lãng phí</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 1; text-align: center;">Dấu hiệu</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 1; text-align: center;">Module FOS</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 2; text-align: center;">Giả thuyết nguyên nhân</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 2; text-align: center;">Tác động (Business Impact)</div>"""

        new_headers = """<div style="flex: 1; text-align: center;">Module FOS</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 1; text-align: center;">Dấu hiệu</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 1; text-align: center;">Lãng phí</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 2; text-align: center;">Phân tích Logic</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 2; text-align: center;">Tác động (Business Impact)</div>"""

        if old_headers in html:
            html = html.replace(old_headers, new_headers)
        else:
            print("Warning: old headers not found in " + path)

        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated headers in " + path)

    except Exception as e:
        print("Error HTML " + path + ": " + str(e))

# 2. Update admin.js logic, mock data, and prompt
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # Update Mock Data
    old_mock_causeChains = """causeChains: [
                        {waste: "Ch? d?i", sign: "T?n kho", module: "Flow", hypothesis: "Thi?u cn b?ng chuy?n", impact: "Tr? don hng"},
                        {waste: "S?n xu?t th?a", sign: "Hng ch?t d?ng", module: "Capacity", hypothesis: "Khng kh?p k? ho?ch", impact: "Tang chi ph v?n"},
                        {waste: "Khuy?t t?t", sign: "Lm l?i nhi?u", module: "Quality", hypothesis: "Thi?u tiu chu?n", impact: "T?n nguyn v?t li?u"},
                        {waste: "V?n chuy?n", sign: "Di chuy?n nhi?u", module: "Core", hypothesis: "Layout chua chu?n", impact: "M?t th?i gian"},
                        {waste: "T?n kho", sign: "Thi?u ch? d?", module: "Sustain", hypothesis: "5S km", impact: "Kh tm ki?m"}
                    ]"""
                    
    # Python strings use literal characters, so let's use regex to replace the array content safely
    js = re.sub(
        r'causeChains:\s*\[[\s\S]*?\],\s*quickWins:',
        'causeChains: [\n                        {module: "Flow", sign: "Ùn ứ WIP", waste: "Chờ đợi", logic: "Dòng chảy bị đứt gãy dẫn tới tồn kho WIP tăng, công đoạn sau phải chờ.", impact: "Trễ đơn hàng, tăng chi phí lưu kho"},\n                        {module: "Capacity", sign: "Làm thêm giờ liên tục", waste: "Sản xuất thừa", logic: "Năng lực không đồng bộ khiến kế hoạch chạy theo lô lớn để bù đắp.", impact: "Tăng chi phí vận hành, dòng tiền ứ đọng"},\n                        {module: "Standard", sign: "Chất lượng không ổn định", waste: "Khuyết tật", logic: "Thiếu tiêu chuẩn thao tác dẫn tới lỗi phát sinh ngẫu nhiên khó kiểm soát.", impact: "Tốn chi phí làm lại, mất uy tín"}\n                    ],\n                    quickWins:',
        js
    )

    # Update Rendering logic (in both places: lines ~407 and ~582)
    # The old rendering order: waste -> sign -> module -> hypothesis
    # New order: module -> sign -> waste -> logic
    old_render_row = """<div style="flex: 1; text-align: center; color: #ea580c; font-weight: bold;">${c.waste}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 1; text-align: center; color: #3b82f6; font-weight: bold;">${c.sign}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 1; text-align: center; color: #10b981; font-weight: bold;">${c.module}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 2; color: #475569;">${c.hypothesis}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 2; color: #ef4444; font-weight: 600;">${c.impact}</div>"""
                    
    new_render_row = """<div style="flex: 1; text-align: center; color: #10b981; font-weight: bold;">${c.module}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 1; text-align: center; color: #3b82f6; font-weight: bold;">${c.sign}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 1; text-align: center; color: #ea580c; font-weight: bold;">${c.waste}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 2; color: #475569;">${c.logic || c.hypothesis}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 2; color: #ef4444; font-weight: 600;">${c.impact}</div>"""
                    
    js = js.replace(old_render_row, new_render_row)

    # Update System Prompt
    js = js.replace(
        '"causeChains": [ {"waste": "Lang ph", "sign": "D?u hi?u", "module": "Module", "hypothesis": "Gi? thuy?t", "impact": "Tc d?ng"} ]',
        '"causeChains": [ {"module": "1 trong Top 3 Module FOS y?u nh?t", "sign": "D?u hi?u", "waste": "Lang ph", "logic": "Phn tch m?i lin h? logic (Khng ph?ng don nguyn nhn)", "impact": "Tc d?ng"} ]'
    )
    js = js.replace(
        '"quickWins": ["Hnh d?ng 1", "Hnh d?ng 2", "Hnh d?ng 3"]',
        '"quickWins": ["Hnh d?ng c?i thi?n st s?n cho Module 1", "Hnh d?ng cho Module 2", "Hnh d?ng cho Module 3"]'
    )

    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated JS successfully.")

except Exception as e:
    print("Error JS: " + str(e))
