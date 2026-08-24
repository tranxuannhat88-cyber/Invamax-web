import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update HTML
replacement_html = """                                        </div>
                                    </div>
                                    <div id="a4-labor-structure" style="display: flex; gap: 10px; margin-top: 15px;">
                                        <!-- JS will populate -->
                                    </div>
                                </div>"""

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # We need to find the end of a4-grid-2 and insert a4-labor-structure before the closing div of a4-box.
        # It's right before <div class="a4-box" style="margin-top: 20px;"> for Điểm Bệnh Lý
        
        target = r'</div>\s*</div>\s*</div>\s*<div class="a4-box" style="margin-top: 20px;">\s*<h3 style="text-align: center;">'
        
        # Actually it's easier to find a4-grid-2, step out of it, and inject.
        # Let's use string manipulation based on the content.
        search_str = '</table>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div class="a4-box" style="margin-top: 20px;">'
        if search_str in html:
            html = html.replace(search_str, search_str.replace('</div>\n                                </div>\n                                <div class="a4-box"', '</div>\n                                    <div id="a4-labor-structure" style="display: flex; gap: 10px; margin-top: 15px;"></div>\n                                </div>\n                                <div class="a4-box"'))
        else:
            # Fallback regex
            html = re.sub(
                r'(</table>\s*</div>\s*</div>)\s*(</div>\s*<div class="a4-box" style="margin-top: 20px;">)',
                r'\1\n                                    <div id="a4-labor-structure" style="display: flex; gap: 10px; margin-top: 15px;"></div>\n                                \2',
                html
            )
            
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)
    except Exception as e:
        print("Error HTML " + path + ": " + str(e))

# 2. Update JS
with io.open(admin_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

labor_js = """
    // Render Labor Structure
    const numDirect = parseInt(factoryInfo['A06']) || 0;
    const numIndirect = parseInt(factoryInfo['A07']) || 0;
    const numManager = parseInt(factoryInfo['A08']) || 0;
    const totalLabor = numDirect + numIndirect + numManager;
    
    const laborEl = document.getElementById('a4-labor-structure');
    if (laborEl) {
        if (totalLabor > 0) {
            const pDirect = Math.round((numDirect / totalLabor) * 100);
            const pIndirect = Math.round((numIndirect / totalLabor) * 100);
            const pManager = 100 - pDirect - pIndirect;
            
            laborEl.innerHTML = `
                <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">Lao động trực tiếp</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${numDirect}</div>
                    <div style="font-size: 12px; color: #f97316; font-weight: 700;">${pDirect}%</div>
                </div>
                <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">Lao động gián tiếp</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${numIndirect}</div>
                    <div style="font-size: 12px; color: #f97316; font-weight: 700;">${pIndirect}%</div>
                </div>
                <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">Lao động quản lý</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${numManager}</div>
                    <div style="font-size: 12px; color: #f97316; font-weight: 700;">${Math.round((numManager/totalLabor)*100)}%</div>
                </div>
                <div style="flex: 1; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px; text-align: center;">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">Tổng lao động</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${totalLabor}</div>
                    <div style="font-size: 12px; color: #94a3b8; font-weight: 700;">100%</div>
                </div>
            `;
        } else {
            laborEl.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 10px; color: #94a3b8; font-size: 12px; font-style: italic;">
                    Chưa có thông tin cơ cấu lao động
                </div>
            `;
        }
    }
"""

target_js = """    const code = `FOS-${dateStr}-${Math.floor(Math.random()*1000)}`;"""
if "const numDirect =" not in js:
    js = js.replace(target_js, labor_js + "\n" + target_js)

with io.open(admin_js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated admin.js")
