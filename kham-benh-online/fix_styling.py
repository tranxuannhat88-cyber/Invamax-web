import io
import re

# 1. Update admin.js generatePageHeader
with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

new_func = """function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
    return `
    <div class="a4-header" style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 1px solid #1e293b; margin-bottom: 20px;">
        <div>
            <div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">INVA<span style="color:#ea580c;">MAX</span></div>
            <div style="font-size: 10px; font-weight: bold; color: #ea580c; margin-top: 2px;">NỀN FOS | AI / Digital | Supply Hub</div>
        </div>
        <div style="text-align: center;">
            <div style="font-size: 14px; font-weight: bold; color: #1e293b; text-transform: uppercase;">BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE</div>
            <div style="font-size: 14px; font-weight: bold; color: #1e293b; text-transform: uppercase;">THEO HỆ ĐIỀU HÀNH NỀN FOS</div>
        </div>
        <div style="width: 160px;"></div>
    </div>
    <div class="a4-section-title" style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 20px; text-transform: uppercase; display: flex; justify-content: space-between;">
        <span>${pageNum}. ${title}</span>
        <span>TRANG ${pageNum} / ${maxPage}</span>
    </div>
    `;
}"""

admin_js = re.sub(r'function generatePageHeader\(title, subtitle, pageNum, maxPage = 10\) \{.*?\}\n', new_func + '\n', admin_js, flags=re.DOTALL)
with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(admin_js)

# 2. Update index.html CSS
with io.open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

index_html = re.sub(r'\.a4-header \{.*?\}', '.a4-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 1px solid #1e293b; margin-bottom: 20px; }', index_html, flags=re.DOTALL)
index_html = re.sub(r'\.a4-section-title \{.*?\}', '.a4-section-title { font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 20px; text-transform: uppercase; display: flex; justify-content: space-between; }', index_html, flags=re.DOTALL)

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)

# 3. Update a4_report.css
with io.open('assets/css/a4_report.css', 'r', encoding='utf-8') as f:
    a4_css = f.read()

a4_css = re.sub(r'\.a4-header \{.*?\}', '.a4-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 1px solid #1e293b; margin-bottom: 20px; }', a4_css, flags=re.DOTALL)
a4_css = re.sub(r'\.a4-section-title \{.*?\}', '.a4-section-title { font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 20px; text-transform: uppercase; display: flex; justify-content: space-between; }', a4_css, flags=re.DOTALL)

with io.open('assets/css/a4_report.css', 'w', encoding='utf-8') as f:
    f.write(a4_css)

print("Fixed CSS and JS")
