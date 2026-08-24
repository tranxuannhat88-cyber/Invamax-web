import io
import re

admin_html_path = r"admin.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update admin.html
with io.open(admin_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

target_html = """                                <div class="a4-grid-2">
                                    <div class="a4-box" style="text-align: center;">
                                        <h3>BẢN ĐỒ 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div style="height: 320px; width: 100%; margin: 20px 0; display: flex; justify-content: center; align-items: center;">
                                            <canvas id="radarSymptomsChart"></canvas>
                                        </div>
                                        <h3 style="margin-top: 20px;">ĐIỂM SỐ 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div class="a4-flex-8" id="a4-symptoms-scores" style="margin-top: 15px;">
                                            <!-- JS will populate -->
                                        </div>
                                    </div>
                                    <div class="a4-box">
                                        <h3>TOP 3 DẤU HIỆU BẤT THƯỜNG NỔI BẬT</h3>
                                        <div id="a4-symptoms-analysis" style="margin-top: 15px;">
                                            <!-- JS will populate -->
                                        </div>
                                    </div>
                                </div>"""
                                
replacement_html = """                                <div class="a4-box" style="margin-bottom: 10px; text-align: center;">
                                    <h3>BẢN ĐỒ 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                    <div style="height: 260px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 10px;">
                                        <canvas id="radarSymptomsChart"></canvas>
                                    </div>
                                </div>
                                <div class="a4-box" style="margin-bottom: 10px;">
                                    <h3 style="text-align: center; margin-bottom: 10px;">ĐIỂM TỔNG HỢP 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                    <div id="a4-symptoms-scores" style="display: flex; gap: 8px; justify-content: space-between;">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                <div class="a4-box">
                                    <h3 style="text-align: center; margin-bottom: 10px;">PHÂN TÍCH DẤU HIỆU BẤT THƯỜNG (TOP 3)</h3>
                                    <div id="a4-symptoms-analysis" style="display: flex; gap: 15px;">
                                        <!-- JS will populate -->
                                    </div>
                                </div>"""

if target_html in html:
    html = html.replace(target_html, replacement_html)
else:
    print("Warning: Could not find exact HTML block to replace. It might have been modified already.")
    
with io.open(admin_html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update admin.js
with io.open(admin_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Update Schema
schema_old = '"symptomsAnalysis": "Phân tích dấu hiệu bất thường (1 đoạn)"'
schema_new = '"symptomsAnalysis": "Phân tích dấu hiệu bất thường (1 đoạn)", "top3SymptomsImpacts": [{"symptom": "Tên dấu hiệu", "impact": "Nhận xét phân tích tác động dựa trên kết quả khảo sát chi tiết"}]'
js = js.replace(schema_old, schema_new)

# Update symptoms scores cards rendering
target_scores_js = "    renderScoresList('a4-symptoms-scores', res.symptomsScores, '#3b82f6');"
replacement_scores_js = """    const el_symp_scores = document.getElementById('a4-symptoms-scores');
    if (el_symp_scores && res.symptomsScores) {
        el_symp_scores.innerHTML = res.symptomsScores.map(item => {
            const conf = getColorConfig(item.score, false);
            return `<div style="flex:1; border-radius:6px; background:${conf.bg}; border:1px solid ${conf.bg}; padding:10px 2px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size:22px; color:${conf.text}; margin-bottom:8px;"><i class="fas fa-exclamation-circle"></i></div>
                <div style="flex: 1; font-size:10px; font-weight:bold; color:${conf.text}; margin-bottom:8px; display:flex; align-items:center; justify-content:center; line-height:1.3; width: 100%; word-break: break-word;">${item.module}</div>
                <div style="font-size:16px; font-weight:900; color:${conf.text}; margin-top: auto;">${item.score}</div>
            </div>`;
        }).join('');
    }"""
js = js.replace(target_scores_js, replacement_scores_js)


# Update symptoms analysis cards rendering (occurs in 2 places: line ~350 and ~477)
target_analysis_js = """        const el_symp_ana = document.getElementById('a4-symptoms-analysis');
        if(el_symp_ana && aiJsonData.diagnostic.symptomsAnalysis) el_symp_ana.innerHTML = `<p style="font-size:13px;color:#475569;line-height:1.6;">${aiJsonData.diagnostic.symptomsAnalysis}</p>`;"""
        
replacement_analysis_js = """        const el_symp_ana = document.getElementById('a4-symptoms-analysis');
        if (el_symp_ana && res.symptomsScores) {
            const top3Symp = res.symptomsScores.slice(0, 3);
            el_symp_ana.innerHTML = top3Symp.map((item, idx) => {
                const confLight = getLightColorConfig(item.score);
                const confDark = getColorConfig(item.score, false);
                return `<div style="flex:1; border-radius:8px; background:${confLight.bg}; border:1px solid ${confLight.border}; padding:15px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div style="display:flex; align-items:flex-start; flex:1; margin-right:10px;">
                            <div style="width:28px; height:28px; border-radius:50%; background:${confLight.color}; color:white; font-weight:bold; display:flex; justify-content:center; align-items:center; margin-right:10px; flex-shrink:0;">${idx+1}</div>
                            <div style="font-size:14px; font-weight:bold; color:#1e293b; line-height:1.4; padding-top:4px;">${item.module}</div>
                        </div>
                        <div style="font-size:18px; font-weight:900; color:#1e293b; white-space:nowrap; flex-shrink:0;">${item.score} <span style="font-size:11px; color:#94a3b8; font-weight:normal;">/ 100</span></div>
                    </div>
                    <div style="font-size:12px; font-weight:bold; color:${confLight.color}; margin-bottom:8px;">Mức độ: ${confDark.trendText.toUpperCase()}</div>
                    <div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">Tác động:</span> ${(() => {
                        let aiImpact = "Cần theo dõi sát sao để tránh ảnh hưởng đến hiệu suất chung.";
                        if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3SymptomsImpacts) {
                            const found = aiJsonData.diagnostic.top3SymptomsImpacts.find(x => x.symptom.toLowerCase() === item.module.toLowerCase());
                            if (found) aiImpact = found.impact;
                        }
                        return aiImpact;
                    })()}</div>
                </div>`;
            }).join('');
        }"""
        
js = js.replace(target_analysis_js, replacement_analysis_js)

with io.open(admin_js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated Page 3 formats successfully")
