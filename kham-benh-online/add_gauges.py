import io
import re

# 1. Update admin.js
with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

# Add to calculateResults return
admin_js = admin_js.replace(
    'return { warningScore, assessmentLevel, generalAssessment, diseases, nextSteps, top3Wastes, top3FOS, wasteScores, fosScores };',
    '''
    let pWaste = Math.round((wScore / 4) * 100);
    let pSymptoms = Math.round((sScore / 4) * 100);
    let pFos = 100 - Math.round((mScore / 4) * 100);
    return { warningScore, assessmentLevel, generalAssessment, diseases, nextSteps, top3Wastes, top3FOS, wasteScores, fosScores, pWaste, pSymptoms, pFos };
    '''
)

# Update initCharts to render the 3 new gauges
new_gauges_js = """
    // Render 3 sub-gauges
    const renderSubGauge = (ctxId, score, isHealth) => {
        const ctx = document.getElementById(ctxId);
        if (!ctx) return;
        let color = '#10b981'; // green
        if (isHealth) {
            if (score < 20) color = '#334155'; // black
            else if (score < 40) color = '#ef4444'; // red
            else if (score < 60) color = '#f97316'; // orange
            else if (score < 80) color = '#eab308'; // yellow
        } else {
            if (score >= 80) color = '#334155';
            else if (score >= 60) color = '#ef4444';
            else if (score >= 40) color = '#f97316';
            else if (score >= 20) color = '#eab308';
        }
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: [color, '#e2e8f0'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { tooltip: { enabled: false } },
                animation: false
            }
        });
    };

    if (res.pWaste !== undefined) {
        renderSubGauge('gaugeWaste', res.pWaste, false);
        renderSubGauge('gaugeSymptoms', res.pSymptoms, false);
        renderSubGauge('gaugeFos', res.pFos, true);
    }
"""

admin_js = admin_js.replace('if (radarCtx && res.wasteScores) {', new_gauges_js + '\n    if (radarCtx && res.wasteScores) {')

# Also set the text values in renderPreliminary
render_text_js = """
    const el_score_waste = document.getElementById('score-waste'); if(el_score_waste) el_score_waste.innerText = `${res.pWaste}/100`;
    const el_score_symp = document.getElementById('score-symptoms'); if(el_score_symp) el_score_symp.innerText = `${res.pSymptoms}/100`;
    const el_score_fos = document.getElementById('score-fos'); if(el_score_fos) el_score_fos.innerText = `${res.pFos}/100`;
"""
admin_js = admin_js.replace("const el_a4_general_desc = document.getElementById('a4-general-desc');", render_text_js + "\n    const el_a4_general_desc = document.getElementById('a4-general-desc');")

with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(admin_js)

# 2. Update admin.html
with io.open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_issues_html = """<div class="a4-box" style="margin-top: 20px;">
                                    <h3>BA VẤN ĐỀ NỔI BẬT</h3>
                                    <div class="a4-flex-3" id="a4-top-3-issues">
                                        <!-- JS will populate -->
                                    </div>
                                </div>"""

new_gauges_html = """<div class="grid-3" style="margin-top: 20px;">
                                    <div class="a4-box" style="padding: 15px;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; border-bottom: none;">TỔNG THỂ LÃNG PHÍ</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeWaste"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-waste">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="padding: 15px;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; border-bottom: none;">DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeSymptoms"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-symptoms">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="padding: 15px;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; border-bottom: none;">SỨC KHỎE HỆ THỐNG</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeFos"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-fos">0/100</div>
                                        </div>
                                    </div>
                                </div>"""

html = html.replace(old_issues_html, new_gauges_html)

with io.open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Added 3 gauges")
