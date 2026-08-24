import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. HTML updates
for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Extract Page 5 content block roughly to replace it
        # Actually, let's use regex to find Trang 5 block
        pattern_page5 = r'<!-- Trang 5 -->\s*<div class="a4-page".*?<!-- Trang 6 \(Trang 5\.1 Preview\) -->'
        
        replacement = '''<!-- Trang 5 -->
                        <div class="a4-page">
                            <div class="a4-header">
                                <div>
                                    <div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">INVA<span style="color:#f97316;">MAX</span></div>
                                    <div style="font-size: 10px; font-weight: bold; color: #f97316; margin-top: 2px;">NỀN FOS | AI / Digital | Supply Hub</div>
                                </div>
                                <div class="a4-title-center">BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE<br>THEO HỆ ĐIỀU HÀNH NỀN FOS</div>
                                <div style="width: 160px;"></div>
                            </div>
                            <div class="a4-content">
                                <div class="a4-section-title">5. BẰNG CHỨNG KHẢO SÁT (PHẦN 1)</div>
                                <div class="a4-box" style="margin-bottom: 20px;">
                                    <h3 style="margin-bottom: 15px; font-size: 13px;">BẰNG CHỨNG TỪ KHÁCH HÀNG (MODULE 1 & 2)</h3>
                                    <div id="a4-raw-data-review" style="margin-bottom: 20px;"></div>
                                </div>
                            </div>
                            <div class="a4-footer">
                                <div class="a4-footer-text">
                                    Mã báo cáo: <strong id="a4-report-id"></strong>
                                </div>
                                <div class="a4-page-number">Trang 5 / 7</div>
                            </div>
                        </div>

<!-- Trang 6 -->
                        <div class="a4-page">
                            <div class="a4-header">
                                <div>
                                    <div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">INVA<span style="color:#f97316;">MAX</span></div>
                                    <div style="font-size: 10px; font-weight: bold; color: #f97316; margin-top: 2px;">NỀN FOS | AI / Digital | Supply Hub</div>
                                </div>
                                <div class="a4-title-center">BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE<br>THEO HỆ ĐIỀU HÀNH NỀN FOS</div>
                                <div style="width: 160px;"></div>
                            </div>
                            <div class="a4-content">
                                <div class="a4-section-title">6. BẰNG CHỨNG KHẢO SÁT (PHẦN 2) & TOP 5 QUICK WINS</div>
                                <div class="a4-box" style="margin-bottom: 20px;">
                                    <h3 style="margin-bottom: 15px; font-size: 13px;">BẰNG CHỨNG TỪ KHÁCH HÀNG (MODULE 3)</h3>
                                    <div id="a4-raw-data-review-2" style="margin-bottom: 20px;"></div>
                                </div>
                                <div class="a4-box">
                                    <h3 style="margin-bottom: 15px; font-size: 13px;">KHUYẾN NGHỊ HÀNH ĐỘNG CẦM MÁU (TOP 5 QUICK WINS)</h3>
                                    <ul id="a4-quick-wins" style="font-size: 12px; color: #475569; padding-left: 20px; line-height: 1.8;"></ul>
                                </div>
                            </div>
                            <div class="a4-footer">
                                <div class="a4-footer-text">
                                    Mã báo cáo: <strong id="a4-report-id"></strong>
                                </div>
                                <div class="a4-page-number">Trang 6 / 7</div>
                            </div>
                        </div>

<!-- Trang 7 (Preview) -->'''
        
        # We need to replace the content
        html = re.sub(pattern_page5, replacement, html, flags=re.DOTALL)
        
        # Change old page 6 to 7
        html = html.replace('<!-- Trang 7 (Preview) -->\n                        <div class="a4-page page-5-1">', '<!-- Trang 7 (Preview) -->\n                        <div class="a4-page page-7">')
        html = html.replace('<div class="a4-page page-5-1">', '<div class="a4-page page-7">')
        html = html.replace('6. BÁO CÁO CHI TIẾT', '7. BÁO CÁO CHI TIẾT')
        html = html.replace('>06<', '>07<')
        html = html.replace('Trang 5 / 6', 'Trang 5 / 7')
        html = html.replace('Trang 6 / 6', 'Trang 7 / 7')
        
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)
    except Exception as e:
        print("Error HTML " + path + ": " + str(e))


# 2. JS updates
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # Change System Prompt quickWins
    old_prompt_qw = r'"quickWins": \["Hành động cầm máu 1 \(ví dụ: Sắp xếp và dọn dẹp hiện trường\)", "Hành động 2", "Hành động 3"\]'
    new_prompt_qw = '"quickWins": ["Hành động cầm máu 1 (ví dụ: Sắp xếp và dọn dẹp hiện trường)", "Hành động 2", "Hành động 3", "Hành động 4", "Hành động 5"]'
    js = re.sub(old_prompt_qw, new_prompt_qw, js)
    
    # Change Mock Data quickWins
    js = js.replace('quickWins: ["Dọn dẹp 5S", "Họp giao ca 5 phút", "Kẻ vạch vị trí"],', 'quickWins: ["Sắp xếp và dọn dẹp hiện trường (Áp dụng 5S nhanh)", "Tổ chức họp Stand-up (Huddle meeting) 10 phút đầu giờ", "Thiết lập bảng Quản lý trực quan (Visual Management Board)", "Sắp xếp lại vị trí lưu trữ nguyên vật liệu", "Giao chuẩn mục tiêu theo giờ cho từng công đoạn"],')

    # Remove deepDiveCards rendering code
    deep_dive_render_pattern = r'const el_chains = document\.getElementById\(\'a4-deep-dive-cards\'\);.*?\}\s*\n'
    js = re.sub(deep_dive_render_pattern, '', js, flags=re.DOTALL)

    # Modify renderRawDataReview to split between two divs
    old_func = r'function renderRawDataReview\(scores, rawAnswers\) \{.*?el\.innerHTML = html;\n\}'
    new_func = '''function renderRawDataReview(scores, rawAnswers) {
    const el1 = document.getElementById('a4-raw-data-review');
    const el2 = document.getElementById('a4-raw-data-review-2');
    if(!el1 || !el2 || !scores || !scores.top3FOS || !rawAnswers) return;

    const moduleMapping = {
        "Flow": { wastes: ["Sản xuất thừa", "Chờ đợi", "Vận chuyển", "Tồn kho"], symptoms: ["Trì hoãn và tiến độ chậm", "Thông tin phối hợp không thông suốt"] },
        "Capacity": { wastes: ["Chờ đợi", "Không khai thác hết nguồn lực"], symptoms: ["Kế hoạch bất ổn", "Quản trị hiện trường mang tính chữa cháy"] },
        "Standard": { wastes: ["Lỗi và làm lại", "Thao tác", "Gia công thừa"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy", "Môi trường làm việc thiếu an toàn, lộn xộn"] },
        "Quality": { wastes: ["Lỗi và làm lại"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy"] },
        "People": { wastes: ["Không khai thác hết nguồn lực", "Thao tác"], symptoms: ["Quản trị hiện trường mang tính chữa cháy"] },
        "Daily Management": { wastes: ["Chờ đợi", "Gia công thừa"], symptoms: ["Quản trị hiện trường mang tính chữa cháy", "Thông tin phối hợp không thông suốt"] },
        "Sustain": { wastes: ["Không khai thác hết nguồn lực"], symptoms: ["Môi trường làm việc thiếu an toàn, lộn xộn"] },
        "Kaizen": { wastes: ["Gia công thừa"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy"] },
        "Knowledge": { wastes: ["Lỗi và làm lại", "Không khai thác hết nguồn lực"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy"] },
        "Digital": { wastes: ["Chờ đợi"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy", "Thông tin phối hợp không thông suốt"] },
        "Core": { wastes: ["Không khai thác hết nguồn lực"], symptoms: ["Kế hoạch bất ổn"] }
    };

    const top3 = scores.top3FOS; 
    let html1 = '';
    let html2 = '';
    
    top3.forEach((module, index) => {
        const qFOS = AppQuestions.partD.filter(q => q.nhom === module);
        const mapData = moduleMapping[module] || { wastes: [], symptoms: [] };
        
        let relatedSymptoms = (scores.symptomsScores || []).filter(s => mapData.symptoms.includes(s.module)).sort((a,b)=>b.score - a.score);
        let relatedWastes = (scores.wasteScores || []).filter(w => mapData.wastes.includes(w.module)).sort((a,b)=>b.score - a.score);

        if (relatedSymptoms.length === 0 && scores.symptomsScores) { relatedSymptoms = scores.symptomsScores.slice(0, 2); }
        if (relatedWastes.length === 0 && scores.wasteScores) { relatedWastes = scores.wasteScores.slice(0, 2); }

        const renderQList = (qList) => {
            if(!qList || qList.length === 0) return '<div style="color:#94a3b8; font-style:italic;">Không có dữ liệu</div>';
            return qList.map(q => {
                let ansText = rawAnswers[q.id] !== undefined ? rawAnswers[q.id] : 'Chưa trả lời';
                const ansIdx = parseInt(ansText);
                if(q.dapAn && q.dapAn.length > 0 && !isNaN(ansIdx) && q.loaiTraLoi !== 'Điền số') {
                    if(q.dapAn[ansIdx] !== undefined) ansText = q.dapAn[ansIdx];
                }
                if (Array.isArray(rawAnswers[q.id])) {
                    ansText = rawAnswers[q.id].map(idx => {
                        const i = parseInt(idx);
                        return (!isNaN(i) && q.dapAn[i]) ? q.dapAn[i] : idx;
                    }).join(', ');
                }
                return `<div style="margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                            <div style="font-weight: 500; margin-bottom: 4px; color: #334155; line-height: 1.3;">${q.cauHoi}</div>
                            <div style="color: #ef4444; font-size: 10px; font-weight: bold;"><i class="fas fa-check-circle" style="margin-right:4px;"></i>KH Chọn: ${ansText}</div>
                        </div>`;
            }).join('');
        };

        const renderRelated = (items, type) => {
            if(!items || items.length === 0) return '<div style="color:#94a3b8; font-style:italic;">Không có dữ liệu</div>';
            return items.map(item => `
                <div style="margin-bottom: 10px; background: white; border: 1px solid #f1f5f9; padding: 8px; border-radius: 6px;">
                    <div style="font-weight: bold; color: #334155; margin-bottom: 4px;">${item.module}</div>
                    <div style="color: #ef4444; font-size: 10px; font-weight: bold;">Điểm ${type}: ${item.score}/100</div>
                </div>
            `).join('');
        };

        let cardHtml = `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 10px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="color: #0f172a; font-weight: 900; font-size: 13px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase;">KHÁM MODULE: <span style="color:#ef4444;">${module}</span></div>
            <div style="display: flex; gap: 15px;">
                <div style="flex: 3;">
                    <div style="color: #475569; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #f8fafc; padding: 4px; border-radius: 4px;">1. ĐÁNH GIÁ MODULE</div>
                    ${renderQList(qFOS)}
                </div>
                <div style="flex: 2; border-left: 1px dashed #cbd5e1; padding-left: 15px;">
                    <div style="color: #b45309; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #fef3c7; padding: 4px; border-radius: 4px;">2. DẤU HIỆU LIÊN QUAN</div>
                    ${renderRelated(relatedSymptoms, "bất thường")}
                </div>
                <div style="flex: 2; border-left: 1px dashed #cbd5e1; padding-left: 15px;">
                    <div style="color: #c2410c; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #ffedd5; padding: 4px; border-radius: 4px;">3. LÃNG PHÍ LIÊN QUAN</div>
                    ${renderRelated(relatedWastes, "lãng phí")}
                </div>
            </div>
        </div>
        `;
        
        if (index < 2) {
            html1 += cardHtml;
        } else {
            html2 += cardHtml;
        }
    });
    
    el1.innerHTML = html1;
    el2.innerHTML = html2;
}'''
    js = re.sub(old_func, new_func, js, flags=re.DOTALL)
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js successfully.")
except Exception as e:
    print("Error JS: " + str(e))
