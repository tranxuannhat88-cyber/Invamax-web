import io
import re

admin_js_path = r"assets\js\admin.js"
admin_html_path = r"admin.html"

try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # We need to replace the body of renderRawDataReview
    old_func_pattern = r'function renderRawDataReview\(scores, rawAnswers\) \{.*?\n\}'
    
    new_func = '''function renderRawDataReview(scores, rawAnswers) {
    const el = document.getElementById('a4-raw-data-review');
    if(!el || !scores || !scores.top3FOS || !rawAnswers) return;

    const moduleMapping = {
        "Flow": { 
            wastes: ["Sản xuất thừa", "Chờ đợi", "Vận chuyển", "Tồn kho"], 
            symptoms: ["Trì hoãn và tiến độ chậm", "Thông tin phối hợp không thông suốt"] 
        },
        "Capacity": { 
            wastes: ["Chờ đợi", "Không khai thác hết nguồn lực"], 
            symptoms: ["Kế hoạch bất ổn", "Quản trị hiện trường mang tính chữa cháy"] 
        },
        "Standard": { 
            wastes: ["Lỗi và làm lại", "Thao tác", "Gia công thừa"], 
            symptoms: ["Dữ liệu và quyết định thiếu tin cậy", "Môi trường làm việc thiếu an toàn, lộn xộn"] 
        },
        "Quality": {
            wastes: ["Lỗi và làm lại"],
            symptoms: ["Dữ liệu và quyết định thiếu tin cậy"]
        },
        "People": {
            wastes: ["Không khai thác hết nguồn lực", "Thao tác"],
            symptoms: ["Quản trị hiện trường mang tính chữa cháy"]
        },
        "Daily Management": {
            wastes: ["Chờ đợi", "Gia công thừa"],
            symptoms: ["Quản trị hiện trường mang tính chữa cháy", "Thông tin phối hợp không thông suốt"]
        },
        "Sustain": {
            wastes: ["Không khai thác hết nguồn lực"],
            symptoms: ["Môi trường làm việc thiếu an toàn, lộn xộn"]
        },
        "Kaizen": {
            wastes: ["Gia công thừa"],
            symptoms: ["Dữ liệu và quyết định thiếu tin cậy"]
        },
        "Knowledge": {
            wastes: ["Lỗi và làm lại", "Không khai thác hết nguồn lực"],
            symptoms: ["Dữ liệu và quyết định thiếu tin cậy"]
        },
        "Digital": {
            wastes: ["Chờ đợi"],
            symptoms: ["Dữ liệu và quyết định thiếu tin cậy", "Thông tin phối hợp không thông suốt"]
        },
        "Core": {
            wastes: ["Không khai thác hết nguồn lực"],
            symptoms: ["Kế hoạch bất ổn"]
        }
    };

    const top3 = scores.top3FOS; 
    let html = `<h3 style="margin-bottom: 15px; font-size: 13px;">BẰNG CHỨNG KHẢO SÁT TỪ KHÁCH HÀNG (RAW DATA)</h3>`;
    
    top3.forEach(module => {
        const qFOS = AppQuestions.partD.filter(q => q.nhom === module);
        const mapData = moduleMapping[module] || { wastes: [], symptoms: [] };
        
        let relatedSymptoms = (scores.symptomsScores || []).filter(s => mapData.symptoms.includes(s.module)).sort((a,b)=>b.score - a.score);
        let relatedWastes = (scores.wasteScores || []).filter(w => mapData.wastes.includes(w.module)).sort((a,b)=>b.score - a.score);

        // If mapping missed, just take the top overall symptoms/wastes as fallback
        if (relatedSymptoms.length === 0 && scores.symptomsScores) {
            relatedSymptoms = scores.symptomsScores.slice(0, 2);
        }
        if (relatedWastes.length === 0 && scores.wasteScores) {
            relatedWastes = scores.wasteScores.slice(0, 2);
        }

        const renderQList = (qList) => {
            if(!qList || qList.length === 0) return '<div style="color:#94a3b8; font-style:italic;">Không có dữ liệu</div>';
            return qList.map(q => {
                let ansText = rawAnswers[q.id] !== undefined ? rawAnswers[q.id] : 'Chưa trả lời';
                
                const ansIdx = parseInt(ansText);
                if(q.dapAn && q.dapAn.length > 0 && !isNaN(ansIdx) && q.loaiTraLoi !== 'Điền số') {
                    if(q.dapAn[ansIdx] !== undefined) {
                        ansText = q.dapAn[ansIdx];
                    }
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

        html += `
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
    });
    
    el.innerHTML = html;
}'''

    js = re.sub(old_func_pattern, new_func, js, flags=re.DOTALL)

    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js successfully.")

except Exception as e:
    print("Error JS: " + str(e))

# Allow Page 5 to break page if needed by adjusting CSS
try:
    with io.open(admin_html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # The container for page 5 is usually `<div class="a4-page" id="page-5">`
    # To allow it to span 2 pages naturally, it shouldn't be restricted by fixed height
    # Actually, in print mode, `a4-page` has page-break-after: always and a fixed height of 297mm.
    # To make it flow to 2 pages, we can remove the fixed height or add an auto height class.
    # Let's change the class to `a4-page-auto` for page-5 or just change the inline style.
    
    # Let's replace `<div class="a4-page" id="page-5">` with `<div class="a4-page" id="page-5" style="height: auto; min-height: 297mm; page-break-after: always; padding-bottom: 20mm;">`
    # or just `<div class="a4-page" style="height: auto; page-break-after: always;">`
    
    html = html.replace('<div class="a4-page">', '<div class="a4-page" style="height: auto; min-height: 297mm; page-break-after: always;">', 1) # just an example if needed
    
    # Or more specifically for Page 5:
    html = re.sub(r'<div class="a4-page">(\s*<div class="a4-section-title">5\.)', r'<div class="a4-page" style="height: auto; min-height: 297mm; page-break-after: always; margin-bottom: 20mm;">\1', html)

    with io.open(admin_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated admin.html successfully.")
except Exception as e:
    print("Error HTML: " + str(e))
