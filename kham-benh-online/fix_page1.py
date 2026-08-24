import io
import re

# 1. Update a4_report.css
with io.open('assets/css/a4_report.css', 'r', encoding='utf-8') as f:
    css = f.read()

# We need to redefine .a4-box and .a4-table-info
new_css = """
.a4-box {
    background: #f8fafc;
    border-radius: 6px;
    padding: 20px;
    border: 1px solid #f1f5f9;
}
.a4-box > h3 {
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
}
.a4-table-info {
    width: 100%;
    border-collapse: collapse;
}
.a4-table-info td {
    padding: 12px 10px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 13px;
}
.a4-table-info tr:last-child td {
    border-bottom: none;
}
.a4-table-info td:first-child {
    color: #64748b;
    width: 120px;
}
.a4-table-info td:last-child {
    font-weight: 700;
    color: #0f172a;
}
"""

css = css + "\n" + new_css

with io.open('assets/css/a4_report.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update admin.html
with io.open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change h4 color to black
html = html.replace('<h4 style="color: #f97316; margin-bottom: 8px;">KẾT LUẬN TÌNH TRẠNG & KHUYẾN NGHỊ (AI)</h4>', '<h4 style="color: #0f172a; margin-bottom: 8px; font-size: 14px; font-weight: 800;">KẾT LUẬN TÌNH TRẠNG & KHUYẾN NGHỊ (AI)</h4>')
# Remove any margin-bottom from h3 if inline
html = html.replace('<h3 style="text-align: center; margin-bottom: 20px;">', '<h3 style="text-align: center;">')
# Remove table padding if inline (I don't think there is)

with io.open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 3. Update index.html
with io.open('index.html', 'r', encoding='utf-8') as f:
    index = f.read()

index = index.replace('<h4 style="color: #f97316; margin-bottom: 8px;">KẾT LUẬN TÌNH TRẠNG & KHUYẾN NGHỊ (AI)</h4>', '<h4 style="color: #0f172a; margin-bottom: 8px; font-size: 14px; font-weight: 800;">KẾT LUẬN TÌNH TRẠNG & KHUYẾN NGHỊ (AI)</h4>')
index = index.replace('<h3 style="text-align: center; margin-bottom: 20px;">', '<h3 style="text-align: center;">')
index = index.replace('</style>', new_css + '\n</style>')

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(index)

print("Fixed Page 1 Layout")
