import io

admin_html_path = r"admin.html"
index_html_path = r"index.html"
css_path = r"assets\css\a4_report.css"
admin_js_path = r"assets\js\admin.js"

# 1. Update CSS in index.html and a4_report.css
target_td_css = "padding: 12px 10px;"
replacement_td_css = "padding: 7px 10px;"

for path in [index_html_path, css_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace(target_td_css, replacement_td_css)
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated padding in " + path)
    except Exception as e:
        print("Error with " + path + ": " + str(e))

# 2. Update font size in admin.js
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # The percentage div has font-size: 12px; color: #f97316; font-weight: 700;
    target_pct = '<div style="font-size: 12px; color: #f97316; font-weight: 700;">${pDirect}%</div>'
    replacement_pct = '<div style="font-size: 15px; color: #f97316; font-weight: 800;">${pDirect}%</div>'
    js = js.replace(target_pct, replacement_pct)
    
    target_pct2 = '<div style="font-size: 12px; color: #f97316; font-weight: 700;">${pIndirect}%</div>'
    replacement_pct2 = '<div style="font-size: 15px; color: #f97316; font-weight: 800;">${pIndirect}%</div>'
    js = js.replace(target_pct2, replacement_pct2)
    
    target_pct3 = '<div style="font-size: 12px; color: #f97316; font-weight: 700;">${Math.round((numManager/totalLabor)*100)}%</div>'
    replacement_pct3 = '<div style="font-size: 15px; color: #f97316; font-weight: 800;">${Math.round((numManager/totalLabor)*100)}%</div>'
    js = js.replace(target_pct3, replacement_pct3)
    
    # Also for Total Labor percentage (which is 100%)
    target_pct4 = '<div style="font-size: 12px; color: #94a3b8; font-weight: 700;">100%</div>'
    replacement_pct4 = '<div style="font-size: 15px; color: #94a3b8; font-weight: 800;">100%</div>'
    js = js.replace(target_pct4, replacement_pct4)
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated font size in admin.js")
except Exception as e:
    print("Error with admin.js: " + str(e))
