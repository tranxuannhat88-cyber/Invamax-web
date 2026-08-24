import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. HTML Layout changes
target_c_d_html = """                                <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                                    <div style="font-weight: bold; color: #059669; font-size: 12px; margin-bottom: 15px;"><i class="fas fa-layer-group"></i> C. TRI THỨC & SỐ HÓA</div>
                                    <div style="display: flex; gap: 15px;" id="a4-heatmap-group-c">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                
                                <div style="background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                                    <div style="font-weight: bold; color: #9333ea; font-size: 12px; margin-bottom: 15px;"><i class="fas fa-sync"></i> D. CẢI TIẾN & DUY TRÌ</div>
                                    <div style="display: flex; gap: 15px;" id="a4-heatmap-group-d">
                                        <!-- JS will populate -->
                                    </div>
                                </div>"""

replacement_c_d_html = """                                <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                                    <div style="flex: 1; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px;">
                                        <div style="font-weight: bold; color: #1d4ed8; font-size: 11px; margin-bottom: 10px;"><i class="fas fa-microchip"></i> C. TRI THỨC & SỐ HÓA</div>
                                        <div style="display: flex; gap: 8px;" id="a4-heatmap-group-c"></div>
                                    </div>
                                    <div style="flex: 1; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 12px;">
                                        <div style="font-weight: bold; color: #7e22ce; font-size: 11px; margin-bottom: 10px;"><i class="fas fa-sync"></i> D. CẢI TIẾN & DUY TRÌ</div>
                                        <div style="display: flex; gap: 8px;" id="a4-heatmap-group-d"></div>
                                    </div>
                                </div>"""

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        # Fallback if html structure has slight space differences, use regex
        # But try exact string first, though I might have different spaces. Let's use regex.
        # It's easier to find the elements by IDs.
        
        # Let's replace padding and margin for Group A and B
        html = html.replace('padding: 15px; margin-bottom: 15px;', 'padding: 12px; margin-bottom: 12px;')
        
        # We need to replace the blocks for group C and D
        # I'll just use regex to replace everything between group C's div and "ĐÁNH GIÁ TỔNG QUAN"
        pattern = re.compile(r'<div style="background:[^>]*?a4-heatmap-group-c.*?</div>\s*</div>\s*<div style="background:[^>]*?a4-heatmap-group-d.*?</div>\s*</div>', re.DOTALL)
        html = pattern.sub(replacement_c_d_html, html)

        # Update ĐÁNH GIÁ TỔNG QUAN block to include a text p for AI
        target_overview = '<div id="a4-top3-fos"'
        replacement_overview = '<p id="a4-fos-analysis" style="font-size:13px; color:#475569; line-height:1.6; margin-bottom:15px;"></p>\n                                    <div id="a4-top3-fos"'
        if '<p id="a4-fos-analysis"' not in html:
            html = html.replace(target_overview, replacement_overview)

        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
    except Exception as e:
        print("HTML replace error:", e)


# 2. Update admin.js
with io.open(admin_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Prompt Schema Update
schema_old = '"symptomsAnalysis": "Phân tích dấu hiệu bất thường (1 đoạn)", "top3SymptomsImpacts": [{"symptom": "Tên dấu hiệu", "impact": "Nhận xét phân tích tác động dựa trên kết quả khảo sát chi tiết"}] }'
schema_new = '"symptomsAnalysis": "Phân tích dấu hiệu bất thường (1 đoạn)", "top3SymptomsImpacts": [{"symptom": "Tên dấu hiệu", "impact": "Nhận xét phân tích tác động dựa trên kết quả khảo sát chi tiết"}], "fosAnalysis": "Đánh giá tổng quan tình trạng 11 module hệ điều hành (1 đoạn)", "top3FosImpacts": [{"module": "Tên module", "impact": "Tác động khi module này yếu kém"}] }'
js = js.replace(schema_old, schema_new)

# Add getModuleInfo globally
module_info_func = """const getModuleInfo = (modName) => {
    const m = modName.toLowerCase();
    if(m.includes('core')) return {vi: 'Cốt lõi', icon: 'fa-bullseye'};
    if(m.includes('people')) return {vi: 'Con người', icon: 'fa-users'};
    if(m.includes('flow')) return {vi: 'Dòng chảy', icon: 'fa-water'};
    if(m.includes('standard')) return {vi: 'Tiêu chuẩn', icon: 'fa-ruler-combined'};
    if(m.includes('capacity')) return {vi: 'Năng lực', icon: 'fa-cogs'};
    if(m.includes('daily management')) return {vi: 'Quản trị hằng ngày', icon: 'fa-calendar-check'};
    if(m.includes('quality')) return {vi: 'Chất lượng', icon: 'fa-check-circle'};
    if(m.includes('knowledge')) return {vi: 'Tri thức', icon: 'fa-book-open'};
    if(m.includes('digital')) return {vi: 'Số hóa', icon: 'fa-laptop-code'};
    if(m.includes('kaizen')) return {vi: 'Cải tiến', icon: 'fa-arrow-trend-up'};
    if(m.includes('sustain')) return {vi: 'Duy trì', icon: 'fa-shield-alt'};
    return {vi: modName, icon: 'fa-layer-group'};
};
"""
if "getModuleInfo" not in js:
    js = js.replace("const getSymptomIcon =", module_info_func + "\nconst getSymptomIcon =")

# Update renderHeatmapGroup
target_heatmap_js = """    const renderHeatmapGroup = (containerId, modulesList, scoresArr) => {
        const container = document.getElementById(containerId);
        if(!container) return;
        const html = modulesList.map(modName => {
            const item = scoresArr.find(x => x.module === modName) || {score: 0};
            let bg = '#ef4444'; // default red (0)
            if(item.score >= 75) bg = '#10b981';
            else if(item.score >= 50) bg = '#eab308';
            else if(item.score >= 25) bg = '#f97316';
            
            return `
            <div style="flex: 1; background: ${bg}; color: white; border-radius: 6px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 13px; font-weight: bold; margin-bottom: 5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${modName}</div>
                <div style="font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${item.score}</div>
            </div>`;
        }).join('');
        container.innerHTML = html;
    };"""

replacement_heatmap_js = """    const renderHeatmapGroup = (containerId, modulesList, scoresArr) => {
        const container = document.getElementById(containerId);
        if(!container) return;
        const html = modulesList.map(modName => {
            const item = scoresArr.find(x => x.module === modName) || {score: 0};
            const modInfo = getModuleInfo(modName);
            const conf = getColorConfig(item.score, true); // true for Health score
            
            return `
            <div style="flex: 1; background: ${conf.bg}; color: ${conf.text}; border-radius: 6px; padding: 12px 6px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 16px; margin-bottom: 5px; opacity: 0.9;"><i class="fas ${modInfo.icon}"></i></div>
                <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase;">${modName}</div>
                <div style="font-size: 11px; font-weight: 600; margin-bottom: 5px; opacity: 0.9;">(${modInfo.vi})</div>
                <div style="font-size: 22px; font-weight: 900;">${item.score}</div>
            </div>`;
        }).join('');
        container.innerHTML = html;
    };"""

js = js.replace(target_heatmap_js, replacement_heatmap_js)

# Remove the static a4-top3-fos rendering from renderPreliminary
# Because we want to render it dynamically in generateReport with AI data
target_static_fos = """    const fosShortfallsEl = document.getElementById('a4-top3-fos');
    if (fosShortfallsEl) {
        fosShortfallsEl.innerHTML = res.top3FOS.map(item => `
            <div class="a4-issue-card" style="background: #fff1f2; color: #e11d48; padding: 12px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; border-left: 4px solid #e11d48; display: flex; align-items: center; justify-content: space-between;">
                <span>${item}</span>
                <i class="fas fa-exclamation-circle"></i>
            </div>
        `).join('');
    }"""
js = js.replace(target_static_fos, "    // top3 fos moved to generateReport")

# Add the dynamic rendering to generateReport (after el_symp_ana logic)
target_dynamic_insert = """                </div>`;
            }).join('');
        }"""
        
dynamic_fos_js = """
        const el_fos_ana = document.getElementById('a4-fos-analysis');
        if (el_fos_ana && aiJsonData.diagnostic && aiJsonData.diagnostic.fosAnalysis) {
            el_fos_ana.innerText = aiJsonData.diagnostic.fosAnalysis;
        }
        
        const el_top3_fos = document.getElementById('a4-top3-fos');
        if (el_top3_fos && scores.top3FOS) {
            el_top3_fos.innerHTML = scores.top3FOS.map(modName => {
                const modInfo = getModuleInfo(modName);
                let aiImpact = "Điểm yếu hệ thống cần ưu tiên xử lý.";
                if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3FosImpacts) {
                    const found = aiJsonData.diagnostic.top3FosImpacts.find(x => x.module.toLowerCase() === modName.toLowerCase());
                    if (found) aiImpact = found.impact;
                }
                return `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 10px 15px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #e11d48; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: #e11d48; margin-bottom: 4px;">
                        <i class="fas ${modInfo.icon}"></i>
                        <span>${modName} (${modInfo.vi})</span>
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5;">${aiImpact}</div>
                </div>`;
            }).join('');
        }"""

if "a4-fos-analysis" not in js:
    js = js.replace(target_dynamic_insert, target_dynamic_insert + dynamic_fos_js)

# Add fallback sample data to mock data (for preview mode)
sample_data_old = '"symptomsAnalysis": "Dữ liệu mẫu phân tích dấu hiệu bất thường" }'
sample_data_new = '"symptomsAnalysis": "Dữ liệu mẫu phân tích dấu hiệu bất thường", "fosAnalysis": "Hệ thống vận hành hiện đang bộc lộ nhiều khoảng trống nghiêm trọng ở các module cốt lõi, cản trở việc mở rộng quy mô.", "top3FosImpacts": [{"module": "Core", "impact": "Không có chiến lược rõ ràng, mọi người làm việc theo kinh nghiệm"}, {"module": "Flow", "impact": "Tắc nghẽn kéo dài, chi phí vốn tăng cao"}] }'
js = js.replace(sample_data_old, sample_data_new)


with io.open(admin_js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated Page 4 Layout and Logic")
