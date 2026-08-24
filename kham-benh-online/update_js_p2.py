import io
import re

def update_js_page2():
    with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Insert helpers before renderScoresList
    helpers = """
    const getWasteImpact = (wasteName) => {
        const w = wasteName.toLowerCase();
        if(w.includes('chờ đợi')) return 'Gây tắc nghẽn dòng chảy, tăng thời gian chu kỳ và chi phí nhân công, giảm năng suất.';
        if(w.includes('tồn kho')) return 'Tốn diện tích, chi phí vốn, khó kiểm soát và dễ phát sinh lỗi.';
        if(w.includes('vận chuyển')) return 'Tiêu tốn thời gian, nguy cơ hỏng hóc, không tạo ra giá trị gia tăng.';
        if(w.includes('thao tác')) return 'Gây mệt mỏi cho công nhân, giảm năng suất lao động.';
        if(w.includes('quy trình') || w.includes('gia công')) return 'Lãng phí vật tư, hao mòn máy móc, không mang lại giá trị cho khách hàng.';
        if(w.includes('dư thừa') || w.includes('sản xuất thừa')) return 'Nguồn gốc của mọi lãng phí khác, ứ đọng vốn.';
        if(w.includes('lỗi') || w.includes('khuyết tật')) return 'Tăng chi phí sửa chữa, ảnh hưởng giao hàng và uy tín khách hàng.';
        if(w.includes('nguồn lực') || w.includes('năng lực') || w.includes('talent')) return 'Lãng phí chất xám, giảm động lực làm việc của nhân viên.';
        return 'Lãng phí làm giảm hiệu quả hoạt động chung của hệ thống.';
    };

    const getWasteIcon = (wasteName) => {
        const w = wasteName.toLowerCase();
        if(w.includes('chờ đợi')) return 'fa-clock';
        if(w.includes('tồn kho')) return 'fa-boxes';
        if(w.includes('vận chuyển')) return 'fa-truck';
        if(w.includes('thao tác')) return 'fa-people-carry';
        if(w.includes('quy trình') || w.includes('gia công')) return 'fa-cogs';
        if(w.includes('dư thừa') || w.includes('sản xuất thừa')) return 'fa-industry';
        if(w.includes('lỗi') || w.includes('khuyết tật')) return 'fa-exclamation-triangle';
        if(w.includes('nguồn lực') || w.includes('năng lực') || w.includes('talent')) return 'fa-user-times';
        return 'fa-trash-alt';
    };

    const getLightColorConfig = (score) => {
        if (score >= 80) return { bg: '#f8fafc', border: '#e2e8f0', color: '#334155' };
        if (score >= 60) return { bg: '#fef2f2', border: '#fee2e2', color: '#ef4444' };
        if (score >= 40) return { bg: '#fff7ed', border: '#ffedd5', color: '#ea580c' };
        if (score >= 20) return { bg: '#fefce8', border: '#fef08a', color: '#eab308' };
        return { bg: '#f0fdf4', border: '#dcfce7', color: '#10b981' };
    };

    // Render waste and symptoms scores"""

    js = js.replace('    // Render waste and symptoms scores', helpers)

    # 2. Modify rendering of a4-waste-scores
    old_waste_score_call = "renderScoresList('a4-waste-scores', res.wasteScores, '#ea580c');"
    new_waste_score_call = """
    const el_waste_scores = document.getElementById('a4-waste-scores');
    if (el_waste_scores) {
        el_waste_scores.innerHTML = res.wasteScores.map(item => {
            const conf = getLightColorConfig(item.score);
            return `<div style="flex:1; border-radius:6px; background:${conf.bg}; border:1px solid ${conf.border}; padding:10px 5px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size:18px; color:${conf.color}; margin-bottom:6px;"><i class="fas ${getWasteIcon(item.module)}"></i></div>
                <div style="font-size:9px; font-weight:bold; color:#475569; margin-bottom:6px; height:24px; overflow:hidden; display:flex; align-items:center; line-height:1.2;">${item.module}</div>
                <div style="font-size:14px; font-weight:900; color:${conf.color};">${(item.score/25).toFixed(1)}</div>
            </div>`;
        }).join('');
    }

    const el_waste_top3 = document.getElementById('a4-waste-analysis');
    if (el_waste_top3) {
        const top3 = res.wasteScores.slice(0, 3);
        el_waste_top3.innerHTML = top3.map((item, idx) => {
            const confLight = getLightColorConfig(item.score);
            const confDark = getColorConfig(item.score, false);
            return `<div style="flex:1; border-radius:8px; background:#ffffff; border:1px solid #e2e8f0; padding:15px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; align-items:center;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${confLight.color}; color:white; font-weight:bold; display:flex; justify-content:center; align-items:center; margin-right:10px;">${idx+1}</div>
                        <div style="font-size:13px; font-weight:bold; color:#1e293b;">${item.module}</div>
                    </div>
                    <div style="font-size:16px; font-weight:900; color:#1e293b;">${(item.score/25).toFixed(1)} <span style="font-size:10px; color:#94a3b8; font-weight:normal;">/ 4.0</span></div>
                </div>
                <div style="font-size:10px; font-weight:bold; color:${confLight.color}; margin-bottom:8px;">Mức độ: ${confDark.trendText.toUpperCase()}</div>
                <div style="font-size:11px; color:#475569; line-height:1.5;"><span style="font-weight:bold;">Tác động:</span> ${getWasteImpact(item.module)}</div>
            </div>`;
        }).join('');
    }
    """
    js = js.replace(old_waste_score_call, new_waste_score_call)

    # 3. Remove the old AI string injection for a4-waste-analysis
    old_ai_injection_1 = """const el_waste_ana = document.getElementById('a4-waste-analysis');
        if(el_waste_ana && aiJsonData.diagnostic.wasteAnalysis) el_waste_ana.innerHTML = `<p style="font-size:13px;color:#475569;line-height:1.6;">${aiJsonData.diagnostic.wasteAnalysis}</p>`;"""
    
    js = js.replace(old_ai_injection_1, "")
    
    # Also for the actual fetch part
    old_ai_injection_2 = """const el_waste_ana = document.getElementById('a4-waste-analysis');
        if(el_waste_ana && result.diagnostic.wasteAnalysis) el_waste_ana.innerHTML = `<p style="font-size:13px;color:#475569;line-height:1.6;">${result.diagnostic.wasteAnalysis}</p>`;"""
    js = js.replace(old_ai_injection_2, "")
    
    # We will do regex sub to be safe
    js = re.sub(r"const el_waste_ana = document\.getElementById\('a4-waste-analysis'\);\s*if\(el_waste_ana .*?;</p>\`;", "", js, flags=re.DOTALL)


    with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js")

update_js_page2()
