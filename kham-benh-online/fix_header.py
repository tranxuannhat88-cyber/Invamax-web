import io

def fix_header():
    filepath = r'C:\Users\MAY TINH 2K\Desktop\invamax-website\kham-benh-online\assets\js\admin.js'
    
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    start_str = "function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {"
    start_idx = content.find(start_str)
    if start_idx == -1:
        print("Could not find generatePageHeader")
        return
        
    end_str = "  }\n"
    end_idx = content.find(end_str, start_idx)
    if end_idx == -1:
        end_str = "  }\r\n"
        end_idx = content.find(end_str, start_idx)
        
    if end_idx != -1:
        end_idx += len(end_str)
        
        new_header = """function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
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
        content = content[:start_idx] + new_header + content[end_idx:]
        
    # Also fix the page 1 header which I hardcoded previously
    content = content.replace('${generatePageHeader("1. THÔNG TIN NHÀ MÁY & TỔNG QUAN SỨC KHỎE")}', """
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
""")

    # Finally, let's fix any remaining corrupted strings in renderDetailedReport
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
        
    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Success")

if __name__ == "__main__":
    fix_header()
