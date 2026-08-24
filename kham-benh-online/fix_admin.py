import re

def fix_admin_js():
    filepath = r'C:\Users\MAY TINH 2K\Desktop\invamax-website\kham-benh-online\assets\js\admin.js'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix exportPDF
    export_pattern = r'function exportPDF\(type = \'chi-tiet\'\).*?(var opt =.*?html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\)\.then\(\(\) => {.*?} \);)'
    
    def repl_export(m):
        code = m.group(0)
        # Fix pagebreak to avoid blank pages
        code = code.replace("pagebreak:    { mode: 'css', avoid: '.a4-page' },", "pagebreak:    { mode: 'css' },")
        return code
        
    content = re.sub(export_pattern, repl_export, content, flags=re.DOTALL)
    
    # 2. Fix generatePageHeader
    header_pattern = r'function generatePageHeader\(title\) \{.*?</div>\s*`;\s*\}'
    new_header = """function generatePageHeader(title) {
    return `
    <div class="a4-header">
        <div class="a4-header-left">
            <h2 class="company-logo">INVAMAX</h2>
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
    <div class="orange-title-bar">${title}</div>
    `;
}"""
    content = re.sub(header_pattern, new_header, content, flags=re.DOTALL)
    
    # 3. Fix generatePageFooter
    footer_pattern = r'function generatePageFooter\(\) \{.*?</div>\s*`;\s*\}'
    new_footer = """function generatePageFooter() {
    let pageNum = window.currentPageNum || 1;
    let maxPage = window.currentMaxPage || 10;
    return `
    <div class="a4-footer" style="justify-content: flex-end; padding-right: 20px;">
        <span style="font-weight: 800; color: white;">TRANG ${pageNum} / ${maxPage}</span>
    </div>
    `;
}"""
    content = re.sub(footer_pattern, new_footer, content, flags=re.DOTALL)
    
    # 4. Fix renderPreliminary
    preliminary_pattern = r'function renderPreliminary\(res, factoryInfo, contactInfo, rawAnswers\) \{.*?document\.getElementById\(\'preliminary-report\'\)\.innerHTML = p1 \+ p2;\s*\}'
    new_preliminary = """function renderPreliminary(res, factoryInfo, contactInfo, rawAnswers) {
    window.currentPageNum = 1;
    let p1 = `
    <div class="a4-page">
        ${generatePageHeader("1. THÔNG TIN NHÀ MÁY & TỔNG QUAN SỨC KHỎE")}
        
        <div class="info-grid">
            <div class="info-item"><span class="info-label">Tên công ty</span> <span class="info-value" id="a4-company">${factoryInfo.A01 || 'Invamax'}</span></div>
            <div class="info-item"><span class="info-label">Người trả lời</span> <span class="info-value">${contactInfo.F01 || 'Đoàn Xuân Cao'}</span></div>
            <div class="info-item"><span class="info-label">Sở tại / Địa phương</span> <span class="info-value">${factoryInfo.A04 || 'Hải Phòng'}</span></div>
            <div class="info-item"><span class="info-label">Chức vụ</span> <span class="info-value">${contactInfo.F02 || 'Co Founder'}</span></div>
            <div class="info-item"><span class="info-label">Mã báo cáo</span> <span class="info-value">FOS-2072026-382</span></div>
            <div class="info-item"><span class="info-label">Số điện thoại</span> <span class="info-value">${contactInfo.F03 || '0896676399'}</span></div>
        </div>

        <div class="a4-section-title">ĐIỂM SỨC KHỎE TỔNG QUAN</div>
        <div class="gauge-container" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; margin-bottom: 20px;">
            <div style="width: 300px; height: 150px; position: relative;">
                <canvas id="gaugeChart"></canvas>
                <div class="gauge-score">
                    <div style="font-size: 32px; font-weight: 800; color: #1e293b; line-height: 1;">${100 - res.warningScore}</div>
                    <div style="font-size: 14px; color: #64748b;">/ 100</div>
                </div>
            </div>
            
            <div class="gauge-legend">
                <div class="legend-item"><span class="legend-color bg-green"></span> Khỏe mạnh</div>
                <div class="legend-item"><span class="legend-color bg-yellow"></span> Cảnh báo</div>
                <div class="legend-item"><span class="legend-color bg-orange"></span> Mức bệnh</div>
                <div class="legend-item"><span class="legend-color bg-red"></span> Bệnh nặng</div>
                <div class="legend-item"><span class="legend-color bg-dark"></span> Nguy kịch</div>
            </div>
        </div>

        <div class="ai-insight-box">
            <h4 class="insight-title">KẾT LUẬN TÌNH TRẠNG & KHUYẾN NGHỊ AI</h4>
            <p>Rối loạn hệ thống hiện diện rõ. Lãng phí xảy ra thường xuyên làm tăng chi phí và ảnh hưởng đến tiến độ, chất lượng giao hàng.</p>
            <div style="background: #f1f5f9; padding: 10px 15px; border-radius: 6px; margin-top: 10px; font-weight: 500; font-size: 13px;">
                <strong>HÀNH ĐỘNG KHUYẾN NGHỊ:</strong> Thực hiện dự án cải tiến điểm (Kaizen Blitz) tại khu vực yếu nhất, xây dựng lại hệ thống đo lường hiệu quả.
            </div>
        </div>

        <div class="a4-section-title" style="margin-top: 25px;">TOP 3 VẤN ĐỀ NGHIÊM TRỌNG</div>
        <div class="top-issues-grid">
            <div class="issue-card">
                <div class="issue-header">
                    <div class="issue-number">1</div>
                    <div class="issue-name">Lỗi và làm lại</div>
                </div>
                <div class="issue-body">
                    Mức độ rủi ro: <strong>Rất cao</strong><br>
                    Ảnh hưởng: <strong>Giao Hàng</strong>
                </div>
            </div>
            <div class="issue-card">
                <div class="issue-header">
                    <div class="issue-number">2</div>
                    <div class="issue-name">Chờ đợi</div>
                </div>
                <div class="issue-body">
                    Mức độ rủi ro: <strong>Cao</strong><br>
                    Ảnh hưởng: <strong>Chi phí</strong>
                </div>
            </div>
            <div class="issue-card">
                <div class="issue-header">
                    <div class="issue-number">3</div>
                    <div class="issue-name">Thao tác thừa</div>
                </div>
                <div class="issue-body">
                    Mức độ rủi ro: <strong>Cao</strong><br>
                    Ảnh hưởng: <strong>Năng suất</strong>
                </div>
            </div>
        </div>

        <div class="impact-display" style="display: flex; gap: 10px; margin-top: 20px;">
            <div style="color: #ef4444; font-weight: 700; width: 150px; font-size: 13px; text-transform: uppercase;">NẾU KHÔNG CẢI THIỆN:</div>
            <div style="display: flex; gap: 15px; flex: 1;">
                <div class="impact-pill"><i class="fas fa-coins" style="margin-right: 5px;"></i> Chi phí <i class="fas fa-arrow-up" style="margin-left: 5px;"></i></div>
                <div class="impact-pill"><i class="fas fa-clock" style="margin-right: 5px;"></i> Lead Time <i class="fas fa-arrow-up" style="margin-left: 5px;"></i></div>
                <div class="impact-pill"><i class="fas fa-expand-arrows-alt" style="margin-right: 5px;"></i> Khó mở rộng</div>
            </div>
        </div>

        ${generatePageFooter()}
    </div>
    `;
    
    let p2 = ``;
    
    document.getElementById('preliminary-report').innerHTML = p1 + p2;
}"""
    content = re.sub(preliminary_pattern, new_preliminary, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success")

if __name__ == "__main__":
    fix_admin_js()
