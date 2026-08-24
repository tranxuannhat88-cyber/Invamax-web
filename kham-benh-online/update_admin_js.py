import io
import re
import json

def update_admin_js():
    with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Update calculateResults to calculate symptomsScores and fix fosScores
    old_calc = """    const fosScores = [];
    const fosModules = [...new Set(AppQuestions.partD.map(q => q.nhom))];
    fosModules.forEach(module => {
        const questions = AppQuestions.partD.filter(q => q.nhom === module);
        fosScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 0 : Math.round((getGroupScore(questions) / 4) * 100)
        });
    });"""

    new_calc = """    const fosScores = [];
    const fosModules = [...new Set(AppQuestions.partD.map(q => q.nhom))];
    fosModules.forEach(module => {
        const questions = AppQuestions.partD.filter(q => q.nhom === module);
        // Convert to 0-100 where 100 is excellent (original 0 is excellent)
        fosScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 100 : 100 - Math.round((getGroupScore(questions) / 4) * 100)
        });
    });

    const symptomsScores = [];
    const symptomsModules = [...new Set(AppQuestions.partC.map(q => q.nhom))];
    symptomsModules.forEach(module => {
        const questions = AppQuestions.partC.filter(q => q.nhom === module);
        symptomsScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 0 : Math.round((getGroupScore(questions) / 4) * 100)
        });
    });
    symptomsScores.sort((a,b) => b.score - a.score);
    const top3Symptoms = symptomsScores.slice(0, 3).map(item => item.module);"""
    
    js = js.replace(old_calc, new_calc)

    # Add symptomsScores to return of calculateResults
    js = js.replace('wasteScores, fosScores, pWaste, pSymptoms, pFos };', 'wasteScores, fosScores, symptomsScores, top3Symptoms, pWaste, pSymptoms, pFos };')

    # 2. Update systemPayload
    old_payload = """            top3Symptoms: scores.diseases,"""
    new_payload = """            top3Symptoms: scores.top3Symptoms,
            symptomsScores: scores.symptomsScores,"""
    js = js.replace(old_payload, new_payload)

    # 3. Update systemPrompt Schema
    old_schema = """{
  "diagnostic": { "summary": "Tóm tắt tình trạng (1 đoạn)", "keyFindings": ["Phát hiện 1"], "confidence": 90, "fieldVerificationRequired": true },
  "consulting": {
    "rootCauses": [ {"issue": "Vấn đề", "why5": ["Tại sao 1"], "impact": "Tác động"} ],
    "priorityMatrix": { "quickWins": ["Giải pháp 1"], "buildSystem": ["Giải pháp 1"] },
    "solutions": [ {"title": "Tên giải pháp", "objective": "Mục tiêu", "actions": ["Hành động 1"], "resources": "Nguồn lực", "risks": "Rủi ro"} ],
    "roadmap": {"""

    new_schema = """{
  "diagnostic": { "summary": "Tóm tắt tình trạng (1 đoạn)", "keyFindings": ["Phát hiện 1"], "confidence": 90, "fieldVerificationRequired": true, "wasteAnalysis": "Phân tích lãng phí (1 đoạn)", "symptomsAnalysis": "Phân tích dấu hiệu bất thường (1 đoạn)" },
  "consulting": {
    "causeChains": [ {"waste": "Lãng phí", "sign": "Dấu hiệu", "module": "Module", "hypothesis": "Giả thuyết", "impact": "Tác động"} ],
    "quickWins": ["Hành động 1", "Hành động 2", "Hành động 3"],
    "rootCauses": [ {"issue": "Vấn đề", "why5": ["Tại sao 1"], "impact": "Tác động"} ],
    "priorityMatrix": { "quickWins": ["Giải pháp 1"], "buildSystem": ["Giải pháp 1"] },
    "solutions": [ {"title": "Tên giải pháp", "objective": "Mục tiêu", "actions": ["Hành động 1"], "resources": "Nguồn lực", "risks": "Rủi ro"} ],
    "roadmap": {"""
    js = js.replace(old_schema, new_schema)

    # 4. Update Mock Data
    old_mock = """            aiJsonData = {
                diagnostic: { summary: "Dữ liệu mẫu", keyFindings: [] },"""
    new_mock = """            aiJsonData = {
                diagnostic: { summary: "Dữ liệu mẫu", keyFindings: [], wasteAnalysis: "Dữ liệu mẫu phân tích lãng phí", symptomsAnalysis: "Dữ liệu mẫu phân tích dấu hiệu bất thường" },
                consulting: {
                    causeChains: [
                        {waste: "Chờ đợi", sign: "Tồn kho", module: "Flow", hypothesis: "Thiếu cân bằng chuyền", impact: "Trễ đơn hàng"},
                        {waste: "Sản xuất thừa", sign: "Hàng chất đống", module: "Capacity", hypothesis: "Không khớp kế hoạch", impact: "Tăng chi phí vốn"},
                        {waste: "Khuyết tật", sign: "Làm lại nhiều", module: "Quality", hypothesis: "Thiếu tiêu chuẩn", impact: "Tốn nguyên vật liệu"},
                        {waste: "Vận chuyển", sign: "Di chuyển nhiều", module: "Core", hypothesis: "Layout chưa chuẩn", impact: "Mất thời gian"},
                        {waste: "Tồn kho", sign: "Thiếu chỗ để", module: "Sustain", hypothesis: "5S kém", impact: "Khó tìm kiếm"}
                    ],
                    quickWins: ["Dọn dẹp 5S", "Họp giao ca 5 phút", "Kẻ vạch vị trí"],
"""
    js = js.replace(old_mock, new_mock)

    # 5. Add rendering logic to renderDetailedReport (Wait, better in renderPreliminary or after it)
    # We will inject code after renderDetailedReport(aiJsonData);
    injection_point = """        renderDetailedReport(aiJsonData);"""
    injection_code = """        renderDetailedReport(aiJsonData);
        
        // Render AI fields for pages 2, 3, 5
        const el_waste_ana = document.getElementById('a4-waste-analysis');
        if(el_waste_ana && aiJsonData.diagnostic.wasteAnalysis) el_waste_ana.innerHTML = `<p style="font-size:13px;color:#475569;line-height:1.6;">${aiJsonData.diagnostic.wasteAnalysis}</p>`;
        
        const el_symp_ana = document.getElementById('a4-symptoms-analysis');
        if(el_symp_ana && aiJsonData.diagnostic.symptomsAnalysis) el_symp_ana.innerHTML = `<p style="font-size:13px;color:#475569;line-height:1.6;">${aiJsonData.diagnostic.symptomsAnalysis}</p>`;
        
        const el_quick = document.getElementById('a4-quick-wins');
        if(el_quick && aiJsonData.consulting.quickWins) {
            el_quick.innerHTML = aiJsonData.consulting.quickWins.map(qw => `<li>${qw}</li>`).join('');
        }
        
        const el_chains = document.getElementById('a4-cause-chains');
        if(el_chains && aiJsonData.consulting.causeChains) {
            el_chains.innerHTML = aiJsonData.consulting.causeChains.slice(0,5).map(c => `
                <div style="display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; gap: 10px; font-size: 11px;">
                    <div style="flex: 1; text-align: center; color: #ea580c; font-weight: bold;">${c.waste}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 1; text-align: center; color: #3b82f6; font-weight: bold;">${c.sign}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 1; text-align: center; color: #10b981; font-weight: bold;">${c.module}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 2; color: #475569;">${c.hypothesis}</div>
                    <i class="fas fa-arrow-right" style="width: 14px; color: #cbd5e1;"></i>
                    <div style="flex: 2; color: #ef4444; font-weight: 600;">${c.impact}</div>
                </div>
            `).join('');
        }
"""
    js = js.replace(injection_point, injection_code)

    # 6. Update renderPreliminary to draw waste scores, symptoms scores, heatmap groups
    injection_point2 = """    const fosShortfallsEl = document.getElementById('a4-top3-fos');"""
    injection_code2 = """    // Render waste and symptoms scores
    const renderScoresList = (containerId, scores, color) => {
        const container = document.getElementById(containerId);
        if(!container) return;
        container.innerHTML = scores.map(item => `
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding:8px 0;font-size:12px;">
                <span style="color:#475569;font-weight:bold;">${item.module}</span>
                <span style="color:${color};font-weight:bold;">${item.score}/100</span>
            </div>
        `).join('');
    };
    renderScoresList('a4-waste-scores', res.wasteScores, '#ea580c');
    renderScoresList('a4-symptoms-scores', res.symptomsScores, '#3b82f6');
    
    // Render Heatmap Groups
    const renderHeatmapGroup = (containerId, modulesList, scoresArr) => {
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
    };
    
    renderHeatmapGroup('a4-heatmap-group-a', ['Core', 'People', 'Flow'], res.fosScores);
    renderHeatmapGroup('a4-heatmap-group-b', ['Standard', 'Capacity', 'Daily Management', 'Quality'], res.fosScores);
    renderHeatmapGroup('a4-heatmap-group-c', ['Knowledge', 'Digital'], res.fosScores);
    renderHeatmapGroup('a4-heatmap-group-d', ['Kaizen', 'Sustain'], res.fosScores);

    const fosShortfallsEl = document.getElementById('a4-top3-fos');"""
    js = js.replace(injection_point2, injection_code2)

    # 7. Update initCharts to render radarSymptomsChart
    injection_point3 = """    if (radarCtx && res.wasteScores) {"""
    injection_code3 = """    const radarSymCtx = document.getElementById('radarSymptomsChart');
    if (radarSymCtx && res.symptomsScores) {
        if (window.radarSymChartInst) window.radarSymChartInst.destroy();
        const labels = res.symptomsScores.map(w => w.module);
        const data = res.symptomsScores.map(w => w.score);
        window.radarSymChartInst = new Chart(radarSymCtx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Điểm Dấu Hiệu',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 9, family: "'Inter', sans-serif", weight: '600' }, color: '#475569' },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    if (radarCtx && res.wasteScores) {"""
    js = js.replace(injection_point3, injection_code3)
    
    # 8. Hide Page 5.1 during export detailed
    injection_point4 = """        if (paywallBox) paywallBox.style.display = 'none';
        if (qrCodeBox) qrCodeBox.style.display = 'none';
    }"""
    injection_code4 = """        if (paywallBox) paywallBox.style.display = 'none';
        if (qrCodeBox) qrCodeBox.style.display = 'none';
        const page5_1 = element.querySelector('.page-5-1');
        if(page5_1) page5_1.style.display = 'none';
    }"""
    js = js.replace(injection_point4, injection_code4)

    # 9. Restore Page 5.1 after export
    injection_point5 = """        if (paywallBox) paywallBox.style.display = '';
        if (qrCodeBox) qrCodeBox.style.display = '';
        element.classList.remove('pdf-export-mode');"""
    injection_code5 = """        if (paywallBox) paywallBox.style.display = '';
        if (qrCodeBox) qrCodeBox.style.display = '';
        const page5_1 = element.querySelector('.page-5-1');
        if(page5_1) page5_1.style.display = '';
        element.classList.remove('pdf-export-mode');"""
    js = js.replace(injection_point5, injection_code5)

    with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js")

update_admin_js()
