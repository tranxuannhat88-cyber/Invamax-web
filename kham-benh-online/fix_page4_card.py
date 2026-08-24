import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update HTML
for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Reduce padding and margins for the heatmap group sections
        html = html.replace('padding: 12px; margin-bottom: 12px;', 'padding: 8px 12px; margin-bottom: 10px;')
        html = html.replace('margin-bottom: 15px;"><i', 'margin-bottom: 10px;"><i')
        html = html.replace('margin-bottom: 10px;"><i', 'margin-bottom: 8px;"><i')
        
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)
    except Exception as e:
        print("Error HTML " + path + ": " + str(e))

# 2. Update JS
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()
        
    # Replace the renderHeatmapGroup template string
    # We'll use regex to find the return `...` and replace it
    pattern = re.compile(r'return `\s*<div style="flex: 1; background: \$\{conf\.bg\}; color: \$\{conf\.text\}; border-radius: 6px; padding: 6px; text-align: center; box-shadow: 0 2px 4px rgba\(0,0,0,0\.1\);">.*?</div>`;', re.DOTALL)
    
    new_template = r"""return `
            <div style="flex: 1; background: ${conf.bg}; color: ${conf.text}; border-radius: 6px; padding: 8px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between;">
                <div style="text-align: left;">
                    <div style="font-size: 10px; font-weight: bold; line-height: 1.2; margin-bottom: 2px; text-transform: uppercase;">${modName}</div>
                    <div style="font-size: 10px; font-weight: 600; line-height: 1.2; margin-bottom: 2px; opacity: 0.9;">(${modInfo.vi})</div>
                    <div style="font-size: 22px; font-weight: 900; line-height: 1;">${item.score}</div>
                </div>
                <div style="font-size: 26px; opacity: 0.25;">
                    <i class="fas ${modInfo.icon}"></i>
                </div>
            </div>`;"""
            
    js = pattern.sub(new_template, js)
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated JS")
except Exception as e:
    print("Error JS: " + str(e))
