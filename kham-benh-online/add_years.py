import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update HTML
target_html = '<tr><td>Sản phẩm</td><td id="a4-product" style="font-weight: 600; color: #1e293b;">...</td></tr>'
replacement_html = '<tr><td>Sản phẩm</td><td id="a4-product" style="font-weight: 600; color: #1e293b;">...</td></tr>\n                                                <tr><td>Số năm hoạt động</td><td id="a4-years" style="font-weight: 600; color: #1e293b;">...</td></tr>'

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        html = html.replace(target_html, replacement_html)
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)
    except Exception as e:
        print("Error HTML " + path + ": " + str(e))

# 2. Update JS
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()
    
    target_js = "const el_a4_product = document.getElementById('a4-product'); if(el_a4_product) el_a4_product.innerText = factoryInfo['A04'] || 'Không rõ';"
    replacement_js = "const el_a4_product = document.getElementById('a4-product'); if(el_a4_product) el_a4_product.innerText = factoryInfo['A04'] || 'Không rõ';\n    const el_a4_years = document.getElementById('a4-years'); if(el_a4_years) el_a4_years.innerText = factoryInfo['A05'] ? factoryInfo['A05'] + ' năm' : 'Không rõ';"
    
    js = js.replace(target_js, replacement_js)
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated JS")
except Exception as e:
    print("Error JS: " + str(e))
