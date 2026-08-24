import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
css_path = r"assets\css\a4_report.css"
admin_js_path = r"assets\js\admin.js"

# 1. Update HTML files
for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Remove Mã báo cáo from the table
        pattern_code_tr = r'\s*<tr>\s*<td>Mã báo cáo</td>\s*<td id="a4-code-[1-6]"[^>]*>.*?</td>\s*</tr>'
        html = re.sub(pattern_code_tr, '', html)
        
        # Remove <span style="float:right">Trang X / 6</span> from titles
        pattern_title_span = r'\s*<span style="float:right">Trang [1-6] / 6</span>'
        html = re.sub(pattern_title_span, '', html)
        
        # Replace footer
        for i in range(1, 7):
            old_footer = f'<div class="a4-footer" style="text-align: right;">Trang {i} / 6</div>'
            new_footer = f"""<div class="a4-footer" style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 5px;">
                                <div>Mã báo cáo: <span id="a4-code-f{i}" style="font-weight: bold; color: #1e293b;"></span></div>
                                <div>Trang {i} / 6</div>
                            </div>"""
            html = html.replace(old_footer, new_footer)
            
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)
    except Exception as e:
        print("Error HTML " + path + ": " + str(e))

# 2. Update CSS
for path in [index_html_path, css_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace("padding: 7px 10px;", "padding: 4px 10px;")
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated padding in " + path)
    except Exception as e:
        pass

# 3. Update JS
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # Fix the loop up to 6 pages instead of 5
    js = js.replace("for(let i=1; i<=5; i++) {", "for(let i=1; i<=6; i++) {")
    
    # Reduce padding and margin in labor cards
    # From: padding: 10px; -> padding: 6px 10px;
    js = js.replace('border-radius: 6px; padding: 10px; text-align: center;', 'border-radius: 6px; padding: 6px 10px; text-align: center;')
    
    # From: margin-bottom: 5px; text-transform: uppercase; -> margin-bottom: 2px;
    js = js.replace('margin-bottom: 5px; text-transform: uppercase;', 'margin-bottom: 2px; text-transform: uppercase;')
    
    # From: margin-bottom: 2px;">${numDirect} -> margin-bottom: 0px;">${numDirect}
    js = re.sub(r'margin-bottom: 2px;">(\$\{num[a-zA-Z]+\})</div>', r'margin-bottom: 0px;">\1</div>', js)
    js = re.sub(r'margin-bottom: 2px;">(\$\{totalLabor\})</div>', r'margin-bottom: 0px;">\1</div>', js)
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated JS")
except Exception as e:
    print("Error JS: " + str(e))
