import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update admin.html and index.html
for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        html = html.replace('5. PHÂN TÍCH CHUYÊN SÂU & QUICK WINS', 
                            '5. BẰNG CHỨNG KHẢO SÁT, PHÂN TÍCH CHUYÊN SÂU & QUICK WINS')
        
        # Add the raw data review container before deep dive cards
        if '<div id="a4-raw-data-review"' not in html:
            html = html.replace('<div id="a4-deep-dive-cards"', 
                                '<div id="a4-raw-data-review" style="margin-bottom: 20px;"></div>\n            <div id="a4-deep-dive-cards"')

        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated HTML for " + path)

    except Exception as e:
        print("Error HTML " + path + ": " + str(e))


# 2. Update admin.js
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # Define the renderRawDataReview function
    render_func = '''
function renderRawDataReview(scores, rawAnswers) {
    const el = document.getElementById('a4-raw-data-review');
    if(!el || !scores || !scores.top3FOS || !rawAnswers) return;

    const top3 = scores.top3FOS; 
    let html = `<h3 style="margin-bottom: 15px; font-size: 13px;">BẰNG CHỨNG KHẢO SÁT TỪ KHÁCH HÀNG (RAW DATA)</h3>`;
    
    top3.forEach(module => {
        const qFOS = AppQuestions.partD.filter(q => q.nhom === module);
        const qSymp = AppQuestions.partC.filter(q => q.nhom === module);
        const qWaste = AppQuestions.partB.filter(q => q.nhom === module);

        const renderQList = (qList) => {
            if(!qList || qList.length === 0) return '<div style="color:#94a3b8; font-style:italic;">Không có dữ liệu</div>';
            return qList.map(q => {
                let ansText = rawAnswers[q.id] !== undefined ? rawAnswers[q.id] : 'Chưa trả lời';
                
                // If it's a number, try to map to dapAn
                const ansIdx = parseInt(ansText);
                if(q.dapAn && q.dapAn.length > 0 && !isNaN(ansIdx) && q.loaiTraLoi !== 'Điền số') {
                    if(q.dapAn[ansIdx] !== undefined) {
                        ansText = q.dapAn[ansIdx];
                    }
                }
                
                // For arrays (checkbox)
                if (Array.isArray(rawAnswers[q.id])) {
                    ansText = rawAnswers[q.id].map(idx => {
                        const i = parseInt(idx);
                        return (!isNaN(i) && q.dapAn[i]) ? q.dapAn[i] : idx;
                    }).join(', ');
                }

                return `<div style="margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                            <div style="font-weight: 500; margin-bottom: 4px; color: #334155; line-height: 1.3;">${q.cauHoi}</div>
                            <div style="color: #ef4444; font-size: 10px; font-weight: bold;"><i class="fas fa-check-circle" style="margin-right:4px;"></i>KH Chọn: ${ansText}</div>
                        </div>`;
            }).join('');
        };

        html += `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 10px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="color: #0f172a; font-weight: 900; font-size: 13px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase;">KHÁM MODULE: <span style="color:#ef4444;">${module}</span></div>
            <div style="display: flex; gap: 15px;">
                <div style="flex: 1;">
                    <div style="color: #475569; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #f8fafc; padding: 4px; border-radius: 4px;">1. ĐÁNH GIÁ MODULE</div>
                    ${renderQList(qFOS)}
                </div>
                <div style="flex: 1; border-left: 1px dashed #cbd5e1; padding-left: 15px;">
                    <div style="color: #b45309; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #fef3c7; padding: 4px; border-radius: 4px;">2. DẤU HIỆU BẤT THƯỜNG</div>
                    ${renderQList(qSymp)}
                </div>
                <div style="flex: 1; border-left: 1px dashed #cbd5e1; padding-left: 15px;">
                    <div style="color: #c2410c; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #ffedd5; padding: 4px; border-radius: 4px;">3. LÃNG PHÍ GHI NHẬN</div>
                    ${renderQList(qWaste)}
                </div>
            </div>
        </div>
        `;
    });
    
    el.innerHTML = html;
}
'''
    
    # Inject the function definition before renderPreliminary if it doesn't exist
    if 'function renderRawDataReview' not in js:
        js = js.replace('function renderPreliminary(', render_func + '\n\nfunction renderPreliminary(')

    # Call it inside renderPreliminary
    if 'renderRawDataReview(res, rawAnswers);' not in js:
        call_statement = '    renderRawDataReview(res, rawAnswers);\n'
        js = js.replace("const el_a4_company = document.getElementById('a4-company');", 
                        call_statement + "    const el_a4_company = document.getElementById('a4-company');")

    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js successfully.")

except Exception as e:
    print("Error JS: " + str(e))
