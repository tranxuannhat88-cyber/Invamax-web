import re
import io

def restore_layout():
    filepath = r'C:\Users\MAY TINH 2K\Desktop\invamax-website\kham-benh-online\assets\js\admin.js'
    
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    header_def_pattern = r'function generatePageHeader\(title,\s*subtitle,\s*pageNum,\s*maxPage\s*=\s*10\)\s*\{.*?</div>\s*`;\s*\}'
    new_header_def = """function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
    return `
    <div class="a4-header">
        <div class="a4-header-left">
            <div class="logo">INVA<span style="color:#ea580c">MAX</span></div>
            <div class="sub-logo">NỀN FOS | AI | Digital | Supply Hub</div>
        </div>
        <div class="a4-header-center">
            <h1>BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE</h1>
            <p>THEO HỆ ĐIỀU HÀNH NỀN FOS</p>
        </div>
        <div class="a4-header-right">
            Mã báo cáo<br><span class="val a4-code-placeholder">FOS-2072026-382</span><br>
            Ngày báo cáo<br><span class="val a4-date-placeholder"></span>
        </div>
    </div>
    <div class="a4-title-bar">
        <div class="a4-title-num">${pageNum}</div>
        <div class="a4-title-text">
            <h2>${title}</h2>
            <span>${subtitle}</span>
        </div>
    </div>
    `;
}"""
    content = re.sub(header_def_pattern, new_header_def, content, flags=re.DOTALL)
    
    # Also page 1 uses generatePageHeader with ONLY ONE ARGUMENT!
    # In my fix_admin.py, I made it call generatePageHeader("1. THÔNG TIN NHÀ MÁY & TỔNG QUAN SỨC KHỎE")
    # But wait! If generatePageHeader now returns the detailed layout, Page 1 will get the detailed layout and break!
    # I need to decouple Page 1's header from generatePageHeader!
    
    preliminary_pattern = r'\$\{generatePageHeader\("1\. THÔNG TIN NHÀ MÁY & TỔNG QUAN SỨC KHỎE"\)\}'
    page1_header = """
    <div class="a4-header">
        <div class="a4-header-left">
            <h2 class="company-logo" style="margin:0;">INVAMAX</h2>
            <div class="tagline">NỀN FOS | AI | Digital | Supply Hub</div>
        </div>
        <div class="a4-header-center">
            <h3>BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE</h3>
            <p>THEO HỆ ĐIỀU HÀNH NỀN FOS</p>
        </div>
        <div class="a4-header-right">
            <div class="code-label">MÃ BÁO CÁO</div>
            <div class="code-value">FOS-2072026-382</div>
            <div class="date-label">NGÀY BÁO CÁO</div>
        </div>
    </div>
    <div class="orange-title-bar">1. THÔNG TIN NHÀ MÁY & TỔNG QUAN SỨC KHỎE</div>
"""
    content = re.sub(preliminary_pattern, page1_header, content)

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Success")

if __name__ == "__main__":
    restore_layout()
