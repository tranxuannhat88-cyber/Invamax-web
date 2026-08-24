import io

admin_html_path = r"admin.html"
index_html_path = r"index.html"

# The header row HTML to inject before <div id="a4-cause-chains"
header_row = """
                                    <div style="display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; gap: 10px; font-size: 10px; font-weight: bold; color: #64748b; margin-bottom: 10px; text-transform: uppercase;">
                                        <div style="flex: 1; text-align: center;">Lãng phí</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 1; text-align: center;">Dấu hiệu</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 1; text-align: center;">Module FOS</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 2; text-align: center;">Giả thuyết nguyên nhân</div>
                                        <i class="fas fa-arrow-right" style="width: 14px; opacity: 0;"></i>
                                        <div style="flex: 2; text-align: center;">Tác động (Business Impact)</div>
                                    </div>
                                    <div id="a4-cause-chains"""

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Update Section Title 5
        html = html.replace('<div class="a4-section-title">5. CHUỖI NGUYÊN NHÂN & QUICK WINS</div>', 
                            '<div class="a4-section-title">5. PHÂN TÍCH MỐI LIÊN HỆ & QUICK WINS</div>')
        
        # Update Section H3 Title
        html = html.replace('<h3 style="margin-bottom: 15px;">TOP 5 CHUỖI NGUYÊN NHÂN - TÁC ĐỘNG</h3>', 
                            '<h3 style="margin-bottom: 15px; font-size: 13px;">TOP 5 VẤN ĐỀ: LÃNG PHÍ - DẤU HIỆU - MODULE QUẢN TRỊ</h3>')

        # Inject the header row if not already there
        if "Lãng phí</div>" not in html:
            html = html.replace('<div id="a4-cause-chains"', header_row)

        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)

    except Exception as e:
        print("Error HTML " + path + ": " + str(e))
