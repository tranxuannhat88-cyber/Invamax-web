import io

def update_admin_js():
    with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Replace getColorConfig logic
    old_color_config = """    const getColorConfig = (score, isHealth) => {
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
    const c3 = getColorConfig(res.pFos, true);"""

    new_color_config = """    const getColorConfig = (score, isHealth) => {
        let normalizedDisease = isHealth ? (100 - score) : score;
        
        let bg = '', text = '', icon = '', trendText = '';
        if (normalizedDisease >= 80) {
            bg = '#334155'; text = '#ffffff'; icon = 'fa-skull-crossbones'; trendText = 'Nguy kịch, mất kiểm soát';
        } else if (normalizedDisease >= 60) {
            bg = '#ef4444'; text = '#ffffff'; icon = 'fa-exclamation-triangle'; trendText = 'Nghiêm trọng, cần xử lý gấp';
        } else if (normalizedDisease >= 40) {
            bg = '#f97316'; text = '#ffffff'; icon = 'fa-exclamation-circle'; trendText = 'Có bệnh, phát sinh vấn đề';
        } else if (normalizedDisease >= 20) {
            bg = '#facc15'; text = '#1e293b'; icon = 'fa-info-circle'; trendText = 'Cảnh báo, cần cải thiện';
        } else {
            bg = '#10b981'; text = '#ffffff'; icon = 'fa-check-circle'; trendText = 'Khỏe mạnh, tối ưu tốt';
        }
        
        return { bg, text, icon, trendText };
    };

    const c1 = getColorConfig(res.pWaste, false);
    const c2 = getColorConfig(res.pSymptoms, false);
    const c3 = getColorConfig(res.pFos, true);"""

    js = js.replace(old_color_config, new_color_config)

    # 2. Replace Cards HTML logic
    old_cards_html = """    const cardsContainer = document.getElementById('a4-metric-cards');
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

    new_cards_html = """    const cardsContainer = document.getElementById('a4-metric-cards');
    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 12px 15px; box-sizing: border-box; background: ${c1.bg}; color: ${c1.text}; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 38px; margin-right: 15px;"><i class="fas fa-trash-alt"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; opacity: 0.9;">TỔNG THỂ LÃNG PHÍ</div>
                    <div style="font-size: 28px; font-weight: 900; margin: 5px 0;">${res.pWaste} / 100</div>
                    <div style="font-size: 11px; opacity: 0.9; text-align: center;"><i class="fas ${c1.icon}"></i> <span>${c1.trendText}</span></div>
                </div>
            </div>
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 12px 15px; box-sizing: border-box; background: ${c2.bg}; color: ${c2.text}; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 38px; margin-right: 15px;"><i class="fas fa-virus"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; opacity: 0.9;">DẤU HIỆU BẤT THƯỜNG</div>
                    <div style="font-size: 28px; font-weight: 900; margin: 5px 0;">${res.pSymptoms} / 100</div>
                    <div style="font-size: 11px; opacity: 0.9; text-align: center;"><i class="fas ${c2.icon}"></i> <span>${c2.trendText}</span></div>
                </div>
            </div>
            <div style="display: flex; align-items: center; width: 32%; border-radius: 8px; padding: 12px 15px; box-sizing: border-box; background: ${c3.bg}; color: ${c3.text}; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 38px; margin-right: 15px;"><i class="fas fa-heartbeat"></i></div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: center; opacity: 0.9;">SỨC KHỎE HỆ THỐNG</div>
                    <div style="font-size: 28px; font-weight: 900; margin: 5px 0;">${res.pFos} / 100</div>
                    <div style="font-size: 11px; opacity: 0.9; text-align: center;"><i class="fas ${c3.icon}"></i> <span>${c3.trendText}</span></div>
                </div>
            </div>
        `;
    }"""

    js = js.replace(old_cards_html, new_cards_html)

    # 3. Dynamic general Assessment
    old_general_desc = """    const el_a4_general_desc = document.getElementById('a4-general-desc'); if(el_a4_general_desc) el_a4_general_desc.innerText = res.generalAssessment;"""
    
    new_general_desc = """    let healthLevel = res.assessmentLevel; 
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

    let customAssessment = `Tình trạng sức khỏe nhà máy hiện tại đang ở mức <strong>${healthLevel.toUpperCase()}</strong> (Điểm bệnh lý: ${res.warningScore}/100). Hiện tại nhà máy đang yếu nhất ở các khía cạnh: <strong>${weakestStr}</strong>. <br><br><span style="color:#ef4444; font-weight:bold;">${warningStr}</span>`;

    const el_a4_general_desc = document.getElementById('a4-general-desc'); if(el_a4_general_desc) el_a4_general_desc.innerHTML = customAssessment;"""

    js = js.replace(old_general_desc, new_general_desc)

    with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated admin.js")

update_admin_js()
