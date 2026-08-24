import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Update Page 5 Titles
        html = html.replace(
            '<div class="a4-section-title">5. BẰNG CHỨNG KHẢO SÁT (PHẦN 1)</div>',
            '<div class="a4-section-title">5. PHÂN TÍCH 3 MODULE CẦN HOÀN THIỆN & TOP 5 HÀNH ĐỘNG TRIỂN KHAI SỚM</div>'
        )
        html = html.replace(
            '<h3 style="margin-bottom: 15px; font-size: 13px;">BẰNG CHỨNG TỪ KHÁCH HÀNG (MODULE 1 & 2)</h3>',
            '<h3 style="margin-bottom: 15px; font-size: 13px;">PHÂN TÍCH 3 MODULE CẦN HOÀN THIỆN (MODULE TOP 1, MODULE TOP 2)</h3>'
        )

        # Update Page 6 Titles
        html = html.replace(
            '<div class="a4-section-title">6. BẰNG CHỨNG KHẢO SÁT (PHẦN 2) & TOP 5 QUICK WINS</div>',
            '<div class="a4-section-title">5. PHÂN TÍCH 3 MODULE CẦN HOÀN THIỆN & TOP 5 HÀNH ĐỘNG TRIỂN KHAI SỚM (TIẾP THEO)</div>'
        )
        html = html.replace(
            '<h3 style="margin-bottom: 15px; font-size: 13px;">BẰNG CHỨNG TỪ KHÁCH HÀNG (MODULE 3)</h3>',
            '<h3 style="margin-bottom: 15px; font-size: 13px;">PHÂN TÍCH 3 MODULE CẦN HOÀN THIỆN (MODULE 3)</h3>'
        )
        html = html.replace(
            '<h3 style="margin-bottom: 15px; font-size: 13px;">KHUYẾN NGHỊ HÀNH ĐỘNG CẦM MÁU (TOP 5 QUICK WINS)</h3>',
            '<h3 style="margin-bottom: 15px; font-size: 13px;">TOP 5 HÀNH ĐỘNG TRIỂN KHAI SỚM</h3>'
        )

        # Update Footers Page 5
        old_footer5 = '''<div class="a4-footer">
                                <div class="a4-footer-text">
                                    Mã báo cáo: <strong id="a4-report-id"></strong>
                                </div>
                                <div class="a4-page-number">Trang 5 / 7</div>
                            </div>'''
        new_footer5 = '''<div class="a4-footer" style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 5px;">
                                <div>Mã báo cáo: <span id="a4-code-f5" style="font-weight: bold; color: #1e293b;"></span></div>
                                <div>Trang 5 / 7</div>
                            </div>'''
        html = html.replace(old_footer5, new_footer5)

        # Update Footers Page 6
        old_footer6 = '''<div class="a4-footer">
                                <div class="a4-footer-text">
                                    Mã báo cáo: <strong id="a4-report-id"></strong>
                                </div>
                                <div class="a4-page-number">Trang 6 / 7</div>
                            </div>'''
        new_footer6 = '''<div class="a4-footer" style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 5px;">
                                <div>Mã báo cáo: <span id="a4-code-f6" style="font-weight: bold; color: #1e293b;"></span></div>
                                <div>Trang 6 / 7</div>
                            </div>'''
        html = html.replace(old_footer6, new_footer6)

        # Update Page 7 footer ID
        html = html.replace('<span id="a4-code-f6"', '<span id="a4-code-f7"')

        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)
    except Exception as e:
        print("Error HTML " + path + ": " + str(e))

# JS Update
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    js = js.replace('for(let i=1; i<=6; i++) {', 'for(let i=1; i<=7; i++) {')
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js successfully.")
except Exception as e:
    print("Error JS: " + str(e))
