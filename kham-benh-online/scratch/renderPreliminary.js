function renderPreliminary(res, factoryInfo, contactInfo, rawAnswers) {
    // Basic replacements
        renderRawDataReview(res, rawAnswers);
    const el_a4_company = document.getElementById('a4-company'); if(el_a4_company) el_a4_company.innerText = factoryInfo['A01'] || 'Không rõ';
    const el_a4_product = document.getElementById('a4-product'); if(el_a4_product) el_a4_product.innerText = factoryInfo['A04'] || 'Không rõ';
    const el_a4_years = document.getElementById('a4-years'); if(el_a4_years) el_a4_years.innerText = factoryInfo['A05'] ? factoryInfo['A05'] + ' năm' : 'Không rõ';
    const el_a4_name = document.getElementById('a4-name'); if(el_a4_name) el_a4_name.innerText = contactInfo['F01'] || 'Không rõ';
    const el_a4_job = document.getElementById('a4-job'); if(el_a4_job) el_a4_job.innerText = contactInfo['F02'] || 'Không rõ';
    const phone = contactInfo['F04'] || '';
    const el_a4_phone = document.getElementById('a4-phone'); if(el_a4_phone) el_a4_phone.innerText = phone || 'Không rõ';

    const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '');

    // Render Labor Structure
    const numDirect = parseInt(factoryInfo['A06']) || 0;
    const numIndirect = parseInt(factoryInfo['A07']) || 0;
    const numManager = parseInt(factoryInfo['A08']) || 0;
    const totalLabor = numDirect + numIndirect + numManager;
    
    const laborEl = document.getElementById('a4-labor-structure');
    if (laborEl) {
        if (totalLabor > 0) {
            const pDirect = Math.round((numDirect / totalLabor) * 100);
            const pIndirect = Math.round((numIndirect / totalLabor) * 100);
            const pManager = 100 - pDirect - pIndirect;
            
            laborEl.innerHTML = `
                <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 2px; text-transform: uppercase;">Lao động trực tiếp</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 0px;">${numDirect}</div>
                    <div style="font-size: 15px; color: #f97316; font-weight: 800;">${pDirect}%</div>
                </div>
                <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 2px; text-transform: uppercase;">Lao động gián tiếp</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 0px;">${numIndirect}</div>
                    <div style="font-size: 15px; color: #f97316; font-weight: 800;">${pIndirect}%</div>
                </div>
                <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 2px; text-transform: uppercase;">Lao động quản lý</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 0px;">${numManager}</div>
                    <div style="font-size: 15px; color: #f97316; font-weight: 800;">${Math.round((numManager/totalLabor)*100)}%</div>
                </div>
                <div style="flex: 1; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 6px 10px; text-align: center;">
                    <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 2px; text-transform: uppercase;">Tổng lao động</div>
                    <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 0px;">${totalLabor}</div>
                    <div style="font-size: 15px; color: #94a3b8; font-weight: 800;">100%</div>
                </div>
            `;
        } else {
            laborEl.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 10px; color: #94a3b8; font-size: 12px; font-style: italic;">
                    Chưa có thông tin cơ cấu lao động
                </div>
            `;
        }
    }

    const code = `FOS-${dateStr}-${Math.floor(Math.random()*1000)}`;
    for(let i=1; i<=7; i++) {
        const el = document.getElementById(`a4-code-${i}`) || document.getElementById(`a4-code-f${i}`);
        if(el) el.innerText = code;
    }

    const diseaseScore = res.warningScore;
    const el_a4_score_text = document.getElementById('a4-score-text'); if(el_a4_score_text) el_a4_score_text.innerText = `${diseaseScore} / 100`; 
    const el_a4_level_text = document.getElementById('a4-level-text'); if(el_a4_level_text) el_a4_level_text.innerText = `MỨC ĐỘ: ${res.assessmentLevel.toUpperCase()}`;

    // Colors based on disease score
    const scoreTextEl = document.getElementById('a4-score-text');
    if (diseaseScore >= 80) scoreTextEl.style.color = '#334155';
    else if (diseaseScore >= 60) scoreTextEl.style.color = '#ef4444';
    else if (diseaseScore >= 40) scoreTextEl.style.color = '#f97316';
    else if (diseaseScore >= 20) scoreTextEl.style.color = '#eab308';
    else scoreTextEl.style.color = '#10b981';

    


    const c1 = getColorConfig(res.pWaste, false);
    const c2 = getColorConfig(res.pSymptoms, false);
    const c3 = getColorConfig(res.pFos, false);

    const cardsContainer = document.getElementById('a4-metric-cards');
    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 8px 12px; box-sizing: border-box; background: ${c1.bg}; color: ${c1.text}; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 38px; margin-right: 15px;"><i class="fas fa-trash-alt"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; opacity: 0.9;">TỔNG THỂ LÃNG PHÍ</div>
                    <div style="font-size: 28px; font-weight: 900; margin: 2px 0;">${res.pWaste} / 100</div>
                    <div style="font-size: 11px; opacity: 0.9; text-align: center;"><i class="fas ${c1.icon}"></i> <span>${c1.trendText}</span></div>
                </div>
            </div>
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 8px 12px; box-sizing: border-box; background: ${c2.bg}; color: ${c2.text}; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 38px; margin-right: 15px;"><i class="fas fa-virus"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; opacity: 0.9;">DẤU HIỆU BẤT THƯỜNG</div>
                    <div style="font-size: 28px; font-weight: 900; margin: 2px 0;">${res.pSymptoms} / 100</div>
                    <div style="font-size: 11px; opacity: 0.9; text-align: center;"><i class="fas ${c2.icon}"></i> <span>${c2.trendText}</span></div>
                </div>
            </div>
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 8px 12px; box-sizing: border-box; background: ${c3.bg}; color: ${c3.text}; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 38px; margin-right: 15px;"><i class="fas fa-heartbeat"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; opacity: 0.9;">BỆNH LÝ HỆ THỐNG</div>
                    <div style="font-size: 28px; font-weight: 900; margin: 2px 0;">${res.pFos} / 100</div>
                    <div style="font-size: 11px; opacity: 0.9; text-align: center;"><i class="fas ${c3.icon}"></i> <span>${c3.trendText}</span></div>
                </div>
            </div>
        `;
    }

    let healthLevel = res.assessmentLevel; 
    let weakest = [];
    if (res.pWaste >= 60) weakest.push('tồn tại nhiều lãng phí');
    if (res.pSymptoms >= 60) weakest.push('nhiều dấu hiệu bất thường');
    if (res.pFos <= 40) weakest.push('hệ thống quản trị lỏng lẻo');
    
    if (weakest.length === 0) {
        if (res.pWaste >= 40) weakest.push('lãng phí tiềm ẩn');
        if (res.pSymptoms >= 40) weakest.push('một số bất thường nhỏ');
        if (res.pFos <= 60) weakest.push('hệ thống chưa chuẩn hóa');
    }

    let weakestStr = weakest.length > 0 ? weakest.join(', ') : 'chưa có vấn đề nghiêm trọng';

    let warningStr = '';
    if (res.warningScore >= 80) warningStr = "HẬU QUẢ: Rủi ro đứt gãy dây chuyền cực kỳ cao, tổn thất lớn về dòng tiền và phàn nàn từ khách hàng.";
    else if (res.warningScore >= 60) warningStr = "HẬU QUẢ: Rủi ro mất kiểm soát chi phí, chất lượng giảm sút và ảnh hưởng trực tiếp đến lợi nhuận.";
    else if (res.warningScore >= 40) warningStr = "HẬU QUẢ: Các điểm nghẽn sẽ làm tăng chi phí ẩn và giảm biên lợi nhuận nếu không xử lý kịp thời.";
    else if (res.warningScore >= 20) warningStr = "HẬU QUẢ: Không ảnh hưởng ngay lập tức nhưng có nguy cơ phình to lãng phí.";
    else warningStr = "HẬU QUẢ: Hoạt động trơn tru, sẵn sàng để chuyển đổi số và mở rộng quy mô.";

    let customAssessment = `Tình trạng sức khỏe nhà máy hiện tại đang ở mức <strong>${healthLevel.toUpperCase()}</strong> (Điểm bệnh lý: ${res.warningScore}/100). Hiện tại nhà máy đang yếu nhất ở các khía cạnh: <strong>${weakestStr}</strong>. `;

    const el_a4_general_desc = document.getElementById('a4-general-desc'); if(el_a4_general_desc) el_a4_general_desc.innerHTML = customAssessment;
    const el_a4_recommendation_text = document.getElementById('a4-recommendation-text'); if(el_a4_recommendation_text) el_a4_recommendation_text.innerText = "HÀNH ĐỘNG KHUYẾN NGHỊ: " + res.nextSteps;

    const top3IssuesEl = document.getElementById('a4-top-3-issues');
    if (top3IssuesEl) {
        top3IssuesEl.innerHTML = res.diseases.map(disease => `
            <div class="a4-issue-card">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 24px; margin-bottom: 10px;"></i>
                <div class="title" style="font-weight: bold; color: #1e293b;">${disease}</div>
            </div>
        `).join('');
    }








    // Render waste and symptoms scores
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
    
    const el_waste_scores = document.getElementById('a4-waste-scores');
    if (el_waste_scores && res.wasteScores) {
        el_waste_scores.innerHTML = res.wasteScores.map(item => {
            const conf = getLightColorConfig(item.score); 
            return `<div class="a4-card" style="flex:1; border-radius:12px; background:${conf.bg}; border:1px solid ${conf.border}; padding:10px 2px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="font-size:22px; color:${conf.color}; margin-bottom:8px; opacity:0.9;"><i class="fas ${getWasteIcon(item.module)}"></i></div>
                <div style="flex: 1; font-size:10px; font-weight:bold; color:#1e293b; margin-bottom:8px; display:flex; align-items:center; justify-content:center; line-height:1.3; width: 100%; word-break: break-word;">${item.module}</div>
                <div style="font-size:16px; font-weight:900; color:${conf.color}; margin-top: auto;">${item.score}</div>
                <div style="font-size:9px; font-weight:600; color:${conf.color}; background:white; padding:2px 4px; border-radius:10px; border:1px solid ${conf.border}; margin-top:4px;">${conf.trendText}</div>
            </div>`;
        }).join('');
    }

    
    
    const el_symp_scores = document.getElementById('a4-symptoms-scores');
    if (el_symp_scores && res.symptomsScores) {
        el_symp_scores.innerHTML = res.symptomsScores.map(item => {
            const conf = getLightColorConfig(item.score);
            return `<div class="a4-card" style="flex:1; border-radius:12px; background:${conf.bg}; border:1px solid ${conf.border}; padding:10px 2px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="font-size:22px; color:${conf.color}; margin-bottom:8px; opacity:0.9;"><i class="fas ${getSymptomIcon(item.module)}"></i></div>
                <div style="flex: 1; font-size:10px; font-weight:bold; color:#1e293b; margin-bottom:8px; display:flex; align-items:center; justify-content:center; line-height:1.3; width: 100%; word-break: break-word;">${item.module}</div>
                <div style="font-size:16px; font-weight:900; color:${conf.color}; margin-top: auto;">${item.score}</div>
                <div style="font-size:9px; font-weight:600; color:${conf.color}; background:white; padding:2px 4px; border-radius:10px; border:1px solid ${conf.border}; margin-top:4px;">${conf.trendText}</div>
            </div>`;
        }).join('');
    }
    
    // Render Heatmap Groups
    const renderHeatmapGroup = (containerId, modulesList, scoresArr) => {
        const container = document.getElementById(containerId);
        if(!container) return;
        const html = modulesList.map(modName => {
            const item = scoresArr.find(x => x.module === modName) || {score: 0};
            const modInfo = getModuleInfo(modName);
            const conf = getColorConfig(item.score, true); // true for Health score
            
            return `
            <div style="flex: 1; background: ${conf.bg}; color: ${conf.text}; border-radius: 6px; padding: 8px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between;">
                <div style="font-size: 26px; opacity: 0.25;">
                    <i class="fas ${modInfo.icon}"></i>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 10px; font-weight: bold; line-height: 1.2; margin-bottom: 2px; text-transform: uppercase;">${modName}</div>
                    <div style="font-size: 10px; font-weight: 600; line-height: 1.2; margin-bottom: 2px; opacity: 0.9;">(${modInfo.vi})</div>
                    <div style="font-size: 22px; font-weight: 900; line-height: 1;">${item.score}</div>
                </div>
            </div>`;
        }).join('');
        container.innerHTML = html;
    };
    
    renderHeatmapGroup('a4-heatmap-group-a', ['Core', 'People', 'Flow'], res.fosScores);
    renderHeatmapGroup('a4-heatmap-group-b', ['Standard', 'Capacity', 'Daily Management', 'Quality'], res.fosScores);
    renderHeatmapGroup('a4-heatmap-group-c', ['Knowledge', 'Digital'], res.fosScores);
    renderHeatmapGroup('a4-heatmap-group-d', ['Kaizen', 'Sustain'], res.fosScores);

    // top3 fos moved to generateReport

    // Generate QR
    const amount = 990000;
    const bankId = 'MB';
    const accountNo = '5757658888';
    const accountName = 'INVAMAX';
    let cleanPhone = (phone || '0945530699').replace(/\s+/g, '');
    const addInfo = 'KBM ' + cleanPhone;
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
    
    const qrImgInline = document.getElementById('a4-qr-img-inline');
    if (qrImgInline) { qrImgInline.src = qrUrl; }
    const qrPhoneInline = document.getElementById('a4-qr-phone-inline');
    if (qrPhoneInline) { qrPhoneInline.innerText = cleanPhone; }
}