import re
import io

def fix_detailed_report():
    filepath = r'C:\Users\MAY TINH 2K\Desktop\invamax-website\kham-benh-online\assets\js\admin.js'
    
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's replace the corrupted headers
    replacements = {
        'MA TR?N UU TIEN': 'MA TRẬN ƯU TIÊN',
        'K? HO?CH GI?I PHAP CHI TI?T': 'KẾ HOẠCH GIẢI PHÁP CHI TIẾT',
        'L? TRINH 30-60-90 NGAY': 'LỘ TRÌNH 30-60-90 NGÀY',
        'QU?N TR? TH?C THI & DO LU?NG': 'QUẢN TRỊ THỰC THI & ĐO LƯỜNG',
        'TRACH NHI?M': 'TRÁCH NHIỆM',
        'GI?I PHAP': 'GIẢI PHÁP',
        'TAC D?NG': 'TÁC ĐỘNG',
        'NGU?N L?C': 'NGUỒN LỰC',
        'CHI PHI': 'CHI PHÍ',
        'TH?I GIAN': 'THỜI GIAN',
        '30 NGAY': '30 NGÀY',
        '60 NGAY': '60 NGÀY',
        '90 NGAY': '90 NGÀY',
        'HO?T D?NG': 'HOẠT ĐỘNG',
        'DO lU?NG': 'ĐO LƯỜNG',
        'D?i': 'Đợi',
        'phn tch': 'phân tích',
        'thng tin': 'thông tin',
        'chuyn gia': 'chuyên gia',
        'tnh ton': 'tính toán',
        'k?t qu?': 'kết quả'
    }
    
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    # Let's completely overwrite the generatePageHeader for pages 6-10 if it has bad text
    def repl_header(m):
        title = m.group(1)
        for bad, good in replacements.items():
            title = title.replace(bad, good)
        return f"generatePageHeader('{title}', "
        
    content = re.sub(r'generatePageHeader\(\'(.*?)\',\s*', repl_header, content)

    # Let's fix the generatePageHeader definition again just in case there are multiple
    header_def_pattern = r'function generatePageHeader\(title,\s*subtitle,\s*pageNum,\s*maxPage\s*=\s*10\)\s*\{.*?</div>\s*`;\s*\}'
    new_header_def = """function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
    return `
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
    <div class="orange-title-bar">${pageNum}. ${title} <span style="font-weight: 400; opacity: 0.8; float: right;">${subtitle}</span></div>
    `;
}"""
    content = re.sub(header_def_pattern, new_header_def, content, flags=re.DOTALL)
    
    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    fix_detailed_report()
