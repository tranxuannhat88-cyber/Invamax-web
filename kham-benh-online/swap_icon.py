import io
import re

admin_js_path = r"assets\js\admin.js"

try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    pattern = re.compile(r'return `\s*<div style="flex: 1; background: \$\{conf\.bg\}; color: \$\{conf\.text\}; border-radius: 6px; padding: 8px 12px; box-shadow: 0 2px 4px rgba\(0,0,0,0\.1\); display: flex; align-items: center; justify-content: space-between;">.*?</div>`;', re.DOTALL)

    new_template = r"""return `
            <div style="flex: 1; background: ${conf.bg}; color: ${conf.text}; border-radius: 6px; padding: 8px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between;">
                <div style="font-size: 26px; opacity: 0.25;">
                    <i class="fas ${modInfo.icon}"></i>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 10px; font-weight: bold; line-height: 1.2; margin-bottom: 2px; text-transform: uppercase;">${modName}</div>
                    <div style="font-size: 10px; font-weight: 600; line-height: 1.2; margin-bottom: 2px; opacity: 0.9;">(${modInfo.vi})</div>
                    <div style="font-size: 22px; font-weight: 900; line-height: 1;">${item.score}</div>
                </div>
            </div>`;"""
            
    js = pattern.sub(new_template, js)
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated JS")
except Exception as e:
    print("Error JS: " + str(e))
