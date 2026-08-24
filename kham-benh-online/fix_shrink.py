import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update HTML files for radar height (230px -> 200px)
target_radar_html = 'height: 230px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 5px;'
replacement_radar_html = 'height: 200px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 0px;'

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        html = html.replace(target_radar_html, replacement_radar_html)
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
    except Exception as e:
        print("Error with " + path + ": " + str(e))

# 2. Update JS file
with io.open(admin_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the icon name
js = js.replace("return 'fa-comments-slash';", "return 'fa-unlink';")
# Change padding for top 3 cards (12px 15px -> 10px 12px)
js = js.replace('padding:12px 15px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);', 
                'padding:10px 12px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);')
# Change margin-bottom in top 3 cards
js = js.replace('margin-bottom:8px;">Mức độ:', 'margin-bottom:4px;">Mức độ:')
js = js.replace('margin-bottom:12px;">\n                        <div style="display:flex; align-items:flex-start;', 
                'margin-bottom:8px;">\n                        <div style="display:flex; align-items:flex-start;')
js = js.replace('padding-top:4px;">${item.module}</div>', 'padding-top:2px;">${item.module}</div>')


with io.open(admin_js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Applied shrinking updates.")
