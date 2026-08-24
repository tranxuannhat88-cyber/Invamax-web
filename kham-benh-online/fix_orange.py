import io
import re

# 1. Update admin.js generatePageHeader
with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

new_func = """function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
    return `
    <div class="a4-header">
        <div style="width: 250px;">
            <div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">INVA<span style="color:#ea580c">MAX</span></div>
            <div style="font-size: 10px; font-weight: bold; color: #ea580c; margin-top: 2px;">NỀN FOS | AI | Digital | Supply Hub</div>
        </div>
        <div class="a4-title-center">
            BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE<br>THEO HỆ ĐIỀU HÀNH NỀN FOS
        </div>
        <div style="width: 250px;"></div>
    </div>
    <div class="a4-section-title">
        <span>${pageNum}. ${title}</span>
        <span>TRANG ${pageNum} / ${maxPage}</span>
    </div>
    `;
}"""

admin_js = re.sub(r'function generatePageHeader\(title, subtitle, pageNum, maxPage = 10\) \{.*?\}\n', new_func + '\n', admin_js, flags=re.DOTALL)
with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(admin_js)

# 2. Update a4_report.css
with io.open('assets/css/a4_report.css', 'r', encoding='utf-8') as f:
    a4_css = f.read()

# Replace .a4-header
new_header_css = """.a4-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 2px solid #ea580c;
    margin-bottom: 20px;
}
.a4-header > div:first-child { width: 250px; }
.a4-title-center {
    flex: 1; text-align: center; font-size: 16px; font-weight: bold; color: #0f172a; line-height: 1.4;
}
.a4-header > div:last-child { width: 250px; }

.a4-section-title {
    background-color: #ea580c;
    color: white;
    padding: 12px 20px;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 25px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-transform: uppercase;
}

.a4-footer {
    display: none !important;
}"""

a4_css = re.sub(r'\.a4-header \{.*?\}', '', a4_css, flags=re.DOTALL)
a4_css = re.sub(r'\.a4-section-title \{.*?\}', '', a4_css, flags=re.DOTALL)
a4_css = re.sub(r'\.a4-footer \{.*?\}', '', a4_css, flags=re.DOTALL)
a4_css += "\n" + new_header_css

with io.open('assets/css/a4_report.css', 'w', encoding='utf-8') as f:
    f.write(a4_css)

# 3. Update index.html inline CSS
with io.open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

index_html = re.sub(r'\.a4-header \{.*?\}', '', index_html, flags=re.DOTALL)
index_html = re.sub(r'\.a4-section-title \{.*?\}', '', index_html, flags=re.DOTALL)
index_html = re.sub(r'</style>', new_header_css + '\n</style>', index_html)

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)

print("Fixed to match orange layout")
