import io
import re

def brute_force_replace():
    filepath = r'C:\Users\MAY TINH 2K\Desktop\invamax-website\kham-benh-online\assets\js\admin.js'
    
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the function generatePageHeader
    pattern = r'function generatePageHeader\(title, subtitle, pageNum, maxPage = 10\) \{.*?\}\n'
    
    new_func = """function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
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
}
"""
    # Just in case DOTALL is needed
    content = re.sub(pattern, new_func, content, flags=re.DOTALL)
    
    # Let's also fix the corrupted text in renderDetailedReport if any
    content = content.replace("BAO CAO KHAM B?NH NHA MAY ONLINE", "BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE")
    
    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    brute_force_replace()
