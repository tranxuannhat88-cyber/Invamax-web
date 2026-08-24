import io

def update_admin_js():
    with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Update renderPreliminary Score logic
    old_score_text = """    const healthScore = 100 - res.warningScore;
    const el_a4_score_text = document.getElementById('a4-score-text'); if(el_a4_score_text) el_a4_score_text.innerText = `${healthScore} / 100`; // Sửa lại thành healthScore
    const el_a4_level_text = document.getElementById('a4-level-text'); if(el_a4_level_text) el_a4_level_text.innerText = `MỨC ĐỘ: ${res.assessmentLevel.toUpperCase()}`;

    // Colors
    const scoreTextEl = document.getElementById('a4-score-text');
    if (healthScore >= 80) scoreTextEl.style.color = '#10b981';
    else if (healthScore >= 60) scoreTextEl.style.color = '#eab308';
    else if (healthScore >= 40) scoreTextEl.style.color = '#f97316';
    else if (healthScore >= 20) scoreTextEl.style.color = '#ef4444';
    else scoreTextEl.style.color = '#334155';"""

    new_score_text = """    const diseaseScore = res.warningScore;
    const el_a4_score_text = document.getElementById('a4-score-text'); if(el_a4_score_text) el_a4_score_text.innerText = `${diseaseScore} / 100`; 
    const el_a4_level_text = document.getElementById('a4-level-text'); if(el_a4_level_text) el_a4_level_text.innerText = `MỨC ĐỘ: ${res.assessmentLevel.toUpperCase()}`;

    // Colors based on disease score
    const scoreTextEl = document.getElementById('a4-score-text');
    if (diseaseScore >= 80) scoreTextEl.style.color = '#334155';
    else if (diseaseScore >= 60) scoreTextEl.style.color = '#ef4444';
    else if (diseaseScore >= 40) scoreTextEl.style.color = '#f97316';
    else if (diseaseScore >= 20) scoreTextEl.style.color = '#eab308';
    else scoreTextEl.style.color = '#10b981';"""

    js = js.replace(old_score_text, new_score_text)

    # 2. Update metric cards rendering
    old_metrics = """    const el_score_waste = document.getElementById('score-waste'); if(el_score_waste) el_score_waste.innerText = `${res.pWaste}/100`;
    const el_score_symp = document.getElementById('score-symptoms'); if(el_score_symp) el_score_symp.innerText = `${res.pSymptoms}/100`;
    const el_score_fos = document.getElementById('score-fos'); if(el_score_fos) el_score_fos.innerText = `${res.pFos}/100`;"""

    new_metrics = """    const getColorConfig = (score, isHealth) => {
        let isBad = isHealth ? (score < 40) : (score >= 40);
        let trendIcon = isBad ? 'fa-exclamation-circle' : (isHealth ? 'fa-arrow-up' : 'fa-arrow-down');
        let trendText = isBad ? 'Cần hành động ngay' : 'Đang ở mức an toàn';
        let trendColor = isBad ? '#ef4444' : '#10b981';
        
        let normalizedDisease = isHealth ? (100 - score) : score;
        if (normalizedDisease >= 80) return { bg: '#f8fafc', border: '#e2e8f0', color: '#334155', trendIcon, trendText, trendColor };
        if (normalizedDisease >= 60) return { bg: '#fef2f2', border: '#fee2e2', color: '#ef4444', trendIcon, trendText, trendColor };
        if (normalizedDisease >= 40) return { bg: '#fff7ed', border: '#ffedd5', color: '#ea580c', trendIcon, trendText, trendColor };
        if (normalizedDisease >= 20) return { bg: '#fefce8', border: '#fef08a', color: '#eab308', trendIcon, trendText, trendColor };
        return { bg: '#f0fdf4', border: '#dcfce7', color: '#10b981', trendIcon: 'fa-arrow-down', trendText: 'Kiểm soát tốt', trendColor: '#10b981' };
    };

    const c1 = getColorConfig(res.pWaste, false);
    const c2 = getColorConfig(res.pSymptoms, false);
    const c3 = getColorConfig(res.pFos, true);

    const cardsContainer = document.getElementById('a4-metric-cards');
    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 12px 15px; box-sizing: border-box; background: ${c1.bg}; border: 1px solid ${c1.border};">
                <div style="font-size: 38px; margin-right: 15px; color: ${c1.color};"><i class="fas fa-trash-alt"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; color: #475569; text-transform: uppercase; text-align: center;">TỔNG THỂ LÃNG PHÍ</div>
                    <div style="font-size: 24px; font-weight: 800; margin: 5px 0; color: ${c1.color};">${res.pWaste} / 100</div>
                    <div style="font-size: 11px;"><i class="fas ${c1.trendIcon}" style="color:${c1.trendColor}"></i> <span style="font-size:10px; color:#64748b;">${c1.trendText}</span></div>
                </div>
            </div>
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 12px 15px; box-sizing: border-box; background: ${c2.bg}; border: 1px solid ${c2.border};">
                <div style="font-size: 38px; margin-right: 15px; color: ${c2.color};"><i class="fas fa-virus"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; color: #475569; text-transform: uppercase; text-align: center;">DẤU HIỆU BẤT THƯỜNG</div>
                    <div style="font-size: 24px; font-weight: 800; margin: 5px 0; color: ${c2.color};">${res.pSymptoms} / 100</div>
                    <div style="font-size: 11px;"><i class="fas ${c2.trendIcon}" style="color:${c2.trendColor}"></i> <span style="font-size:10px; color:#64748b;">${c2.trendText}</span></div>
                </div>
            </div>
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 12px 15px; box-sizing: border-box; background: ${c3.bg}; border: 1px solid ${c3.border};">
                <div style="font-size: 38px; margin-right: 15px; color: ${c3.color};"><i class="fas fa-heartbeat"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; color: #475569; text-transform: uppercase; text-align: center;">SỨC KHỎE HỆ THỐNG</div>
                    <div style="font-size: 24px; font-weight: 800; margin: 5px 0; color: ${c3.color};">${res.pFos} / 100</div>
                    <div style="font-size: 11px;"><i class="fas ${c3.trendIcon}" style="color:${c3.trendColor}"></i> <span style="font-size:10px; color:#64748b;">${c3.trendText}</span></div>
                </div>
            </div>
        `;
    }"""
    js = js.replace(old_metrics, new_metrics)

    # 3. Update initCharts
    # We will replace everything from `const gaugeCtx = document.getElementById('gaugeChart');` up to `if (radarSymCtx && res.symptomsScores)`
    import re
    pattern = r"const gaugeCtx = document\.getElementById\('gaugeChart'\);.*?const radarSymCtx = document\.getElementById\('radarSymptomsChart'\);"
    
    new_init_charts = """const gaugeNeedle = {
        id: 'gaugeNeedle',
        afterDatasetDraw(chart, args, options) {
            const { ctx, config, data, chartArea: { top, bottom, left, right, width, height } } = chart;
            ctx.save();
            const needleValue = data.datasets[0].needleValue;
            if (needleValue === undefined) return;
            
            const dataTotal = 100;
            // 0 is at -90deg (left), 100 is at +90deg (right)
            // Math.PI + angle from 0 to PI
            const angle = Math.PI + (needleValue / dataTotal * Math.PI);
            
            const cx = left + width / 2;
            const cy = chart._metasets[0].data[0].y; 

            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(height/2 - 15, 0); 
            ctx.lineTo(0, 6);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            ctx.restore();
        }
    };

    const gaugeCtx = document.getElementById('gaugeChart');
    if (gaugeCtx) {
        if (window.gaugeChartInst) window.gaugeChartInst.destroy();
        
        window.gaugeChartInst = new Chart(gaugeCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [20, 20, 20, 20, 20],
                    backgroundColor: ['#10b981', '#facc15', '#f97316', '#ef4444', '#334155'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270,
                    needleValue: res.warningScore
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { tooltip: { enabled: false }, legend: { display: false } },
                animation: { animateRotate: true, animateScale: false }
            },
            plugins: [gaugeNeedle]
        });
    }

    const radarSymCtx = document.getElementById('radarSymptomsChart');"""

    js = re.sub(pattern, new_init_charts, js, flags=re.DOTALL)

    with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js")

update_admin_js()
