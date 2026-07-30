function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
    return `
    <div class="a4-header">
        <div class="a4-header-left">
            <div class="logo">INVA<span style="color:#ea580c">MAX</span></div>
            <div class="sub-logo">NỀN FOS | AI | Digital | Supply Hub</div>
        </div>
        <div class="a4-header-center">
            <h1>BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE</h1>
            <p>THEO HỆ ĐIỀU HÀNH NỀN FOS</p>
        </div>
        <div class="a4-header-right">
            Mã báo cáo<br><span class="val a4-code-placeholder"></span><br>
            Ngày báo cáo<br><span class="val a4-date-placeholder"></span>
        </div>
    </div>
    <div class="a4-title-bar">
        <div class="a4-title-num">${pageNum}</div>
        <div class="a4-title-text">
            <h2>${title}</h2>
            <span>${subtitle}</span>
        </div>
    </div>`;
}

function generatePageFooter() {
    return `
    <div class="a4-footer">
        <div class="a4-footer-left">
            <strong>INVAMAX</strong>
            <span>NỀN FOS - Kim chỉ nam vận hành nhà máy SME</span>
        </div>
        <div class="a4-footer-center">
            <strong>11 MODULE NỀN FOS</strong>
            <span class="footer-module"><span class="footer-dot bg-green"></span> Core</span>
            <span class="footer-module"><span class="footer-dot bg-green"></span> People</span>
            <span class="footer-module"><span class="footer-dot bg-green"></span> Standard</span>
            <span class="footer-module"><span class="footer-dot bg-yellow"></span> Flow</span>
            <span class="footer-module"><span class="footer-dot bg-yellow"></span> Capacity</span>
            <span class="footer-module"><span class="footer-dot bg-yellow"></span> Daily Mgmt</span>
            <span class="footer-module"><span class="footer-dot bg-yellow"></span> Quality</span>
            <span class="footer-module"><span class="footer-dot bg-blue"></span> Knowledge</span>
            <span class="footer-module"><span class="footer-dot bg-blue"></span> Digital</span>
            <span class="footer-module"><span class="footer-dot bg-purple"></span> Kaizen</span>
            <span class="footer-module"><span class="footer-dot bg-purple"></span> Sustain</span>
        </div>
        <div class="a4-footer-right">
            <span>Báo cáo được phân tích bởi AI dựa trên hệ thống chuyên gia NỀN FOS.<br>Kết quả chỉ mang tính tham khảo và cần được xác nhận bởi chuyên gia.</span>
            <span>www.invamax.vn | Hotline: 0896676399</span>
            <img src="https://img.vietqr.io/image/MB-5757658888-qr_only.png?amount=990000" alt="QR">
        </div>
    </div>`;
}

function renderPreliminary(res, factoryInfo, contactInfo, rawAnswers) {
    const healthScore = 100 - res.warningScore;
    let gaugeColor = '#10b981';
    let impactHtml = '';
    
    if (healthScore < 80) { gaugeColor = '#eab308'; impactHtml = '<div class="impact-grid"><div class="impact-item green"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">5-10%</div><div class="label">Chi phí vận hành</div></div><div class="impact-item green"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">10-15%</div><div class="label">Lead Time</div></div><div class="impact-item red"><div class="arrow"><i class="fas fa-arrow-down"></i></div><div class="val">5-10%</div><div class="label">Năng suất (OEE)</div></div><div class="impact-item red"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">5-10%</div><div class="label">Lỗi & Làm lại</div></div></div>'; }
    if (healthScore < 60) { gaugeColor = '#f97316'; impactHtml = '<div class="impact-grid"><div class="impact-item green"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">10-25%</div><div class="label">Chi phí vận hành</div></div><div class="impact-item green"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">15-30%</div><div class="label">Lead Time</div></div><div class="impact-item red"><div class="arrow"><i class="fas fa-arrow-down"></i></div><div class="val">10-20%</div><div class="label">Năng suất (OEE)</div></div><div class="impact-item red"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">15-20%</div><div class="label">Lỗi & Làm lại</div></div></div>'; }
    if (healthScore < 40) { gaugeColor = '#ef4444'; impactHtml = '<div class="impact-grid"><div class="impact-item green"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">25-40%</div><div class="label">Chi phí vận hành</div></div><div class="impact-item green"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">30-50%</div><div class="label">Lead Time</div></div><div class="impact-item red"><div class="arrow"><i class="fas fa-arrow-down"></i></div><div class="val">20-30%</div><div class="label">Năng suất (OEE)</div></div><div class="impact-item red"><div class="arrow"><i class="fas fa-arrow-up"></i></div><div class="val">20-30%</div><div class="label">Lỗi & Làm lại</div></div></div>'; }

    let p1 = `
    <div class="a4-page">
        ${generatePageHeader('TỔNG QUAN SỨC KHỎE NHÀ MÁY', 'EXECUTIVE SUMMARY', 1, 10)}
        <div class="grid-2" style="flex:1;">
            <div class="content-box">
                <div class="box-title center">ĐIỂM SỨC KHỎE TỔNG QUAN</div>
                <div class="gauge-container">
                    <canvas id="gaugeChart"></canvas>
                    <div class="gauge-value">
                        <span class="num" style="color: ${gaugeColor}">${healthScore}</span><span class="max">/100</span>
                    </div>
                </div>
                <div class="gauge-status" style="color: ${gaugeColor}">
                    MỨC ĐỘ: ${res.assessmentLevel.toUpperCase()}
                </div>
                
                <div class="grid-2" style="margin-top: 30px;">
                    <div class="insight-box" style="text-align:center;">
                        <div class="title" style="color:var(--text-sub)">ƯỚC TÍNH THIỆT HẠI<br><span style="font-size:8px;font-weight:500;">(Nếu không cải thiện)</span></div>
                        <div style="font-size:16px;font-weight:900;color:var(--red);margin-top:5px;">Cao</div>
                    </div>
                    <div class="insight-box" style="text-align:center;">
                        <div class="title" style="color:var(--text-sub)">MỤC TIÊU ĐỀ XUẤT<br><span style="font-size:8px;font-weight:500;">(Trong 6 tháng)</span></div>
                        <div style="font-size:16px;font-weight:900;color:var(--green);margin-top:5px;">+15 Điểm</div>
                    </div>
                </div>
            </div>
            
            <div class="content-box">
                <div class="box-title center">TÌNH TRẠNG HIỆN TẠI</div>
                <div class="status-card">
                    <i class="fas fa-heartbeat" style="color: ${gaugeColor}"></i>
                    <div class="status-text" style="color: ${gaugeColor}">${res.assessmentLevel.toUpperCase()}</div>
                    <div class="risk-level">MỨC ĐỘ RỦI RO</div>
                    <div class="stars">
                        <i class="fas fa-star ${healthScore < 80 ? '' : 'gray'}"></i>
                        <i class="fas fa-star ${healthScore < 60 ? '' : 'gray'}"></i>
                        <i class="fas fa-star ${healthScore < 40 ? '' : 'gray'}"></i>
                        <i class="fas fa-star ${healthScore < 20 ? '' : 'gray'}"></i>
                        <i class="fas fa-star gray"></i>
                    </div>
                </div>
                
                <div class="insight-box" style="margin-top: 20px;">
                    <div class="title">TÓM TẮT ĐIỀU HÀNH</div>
                    <div class="insight-text">
                        ${res.generalAssessment}<br>
                        <strong>Khuyến nghị chính:</strong> ${res.nextSteps}
                        <br><br>
                        <strong>Tên công ty:</strong> <span id="a4-company">${factoryInfo['A01'] || 'Chưa cập nhật'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content-box gray" style="margin-top: 15px;">
            <div class="box-title center" style="margin:0">TÁC ĐỘNG ĐẾN KINH DOANH (ƯỚC TÍNH)</div>
            ${impactHtml}
        </div>
        ${generatePageFooter()}
    </div>`;

    const wasteIcons = {
        'Lỗi và làm lại': 'fas fa-exclamation-triangle',
        'Sản xuất thừa': 'fas fa-boxes',
        'Chờ đợi': 'fas fa-clock',
        'Lãng phí nguồn lực': 'fas fa-users',
        'Vận chuyển': 'fas fa-truck',
        'Tồn kho': 'fas fa-warehouse',
        'Thao tác thừa': 'fas fa-people-carry',
        'Quy trình thừa': 'fas fa-cogs'
    };

    let p2 = `
    <div class="a4-page">
        ${generatePageHeader('PHÂN TÍCH 8 LÃNG PHÍ', 'WASTE ANALYSIS', 2, 10)}
        <div class="grid-2" style="flex:1;">
            <div class="content-box">
                <div class="box-title">BIỂU ĐỒ 8 LÃNG PHÍ</div>
                <div class="radar-container"><canvas id="radarChart"></canvas></div>
            </div>
            
            <div class="content-box no-border">
                <div class="box-title">TOP 3 LÃNG PHÍ NỔI BẬT</div>
                <ul class="top-waste-list">
                    ${res.top3Wastes.map((w, i) => `
                        <li class="top-waste-item">
                            <div class="top-waste-left">
                                <div class="top-waste-num">${i + 1}</div>
                                <div class="top-waste-name">${w}</div>
                            </div>
                            <div class="top-waste-score">${res.wasteScores.find(x => x.module === w).score}<span>/100</span></div>
                        </li>
                    `).join('')}
                </ul>
                
                <div class="insight-box" style="margin-top:20px;">
                    <div class="title text-blue">INSIGHT AI</div>
                    <div class="insight-text" id="ai-waste-analysis">
                        (Hệ thống AI sẽ phân tích chi tiết lãng phí ở đây...)
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content-box" style="margin-top: 15px;">
            <div class="box-title">ĐIỂM SỐ 8 LÃNG PHÍ</div>
            <div class="waste-score-grid">
                ${res.wasteScores.map(w => `
                    <div class="ws-item">
                        <div class="ws-icon"><i class="${wasteIcons[w.module] || 'fas fa-box'}"></i></div>
                        <div class="ws-name">${w.module}</div>
                        <div class="ws-score">${w.score}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    const getScoreObj = (name) => res.fosScores.find(x => x.module === name) || { score: 0 };
    const getHmCls = (score) => score > 80 ? 'c-purple' : score > 60 ? 'c-blue' : score > 40 ? 'c-orange' : score > 20 ? 'c-yellow' : 'c-green';
    
    const coreList = ['Core', 'People', 'Standard'];
    const opList = ['Flow', 'Capacity', 'Daily Management', 'Quality'];
    const itList = ['Knowledge', 'Digital'];
    const szList = ['Kaizen', 'Sustain'];

    let p3 = `
    <div class="a4-page">
        ${generatePageHeader('HEATMAP 11 MODULE NỀN FOS', 'SYSTEM HEALTH MAP', 3, 10)}
        <div class="heatmap-legend">Thang điểm: 0 - Rất tốt | 25 - Khá | 50 - Trung bình | 75 - Tệ | 100 - Xuất sắc (Rối loạn)</div>
        
        <div class="hm-group">
            <div class="hm-group-title">A. NỀN MÓNG QUẢN TRỊ</div>
            <div class="hm-row">
                ${coreList.map(n => {
                    const s = getScoreObj(n).score;
                    return `<div class="hm-cell ${getHmCls(s)}"><div class="name">${n}</div><div class="score">${s}</div></div>`;
                }).join('')}
            </div>
        </div>
        
        <div class="hm-group">
            <div class="hm-group-title">B. VẬN HÀNH SẢN XUẤT</div>
            <div class="hm-row">
                ${opList.map(n => {
                    const s = getScoreObj(n).score;
                    return `<div class="hm-cell ${getHmCls(s)}"><div class="name">${n}</div><div class="score">${s}</div></div>`;
                }).join('')}
            </div>
        </div>
        
        <div class="hm-group">
            <div class="hm-group-title">C. TRI THỨC & SỐ HÓA</div>
            <div class="hm-row">
                ${itList.map(n => {
                    const s = getScoreObj(n).score;
                    return `<div class="hm-cell ${getHmCls(s)}"><div class="name">${n}</div><div class="score">${s}</div></div>`;
                }).join('')}
            </div>
        </div>
        
        <div class="hm-group">
            <div class="hm-group-title">D. CẢI TIẾN & DUY TRÌ</div>
            <div class="hm-row">
                ${szList.map(n => {
                    const s = getScoreObj(n).score;
                    return `<div class="hm-cell ${getHmCls(s)}"><div class="name">${n}</div><div class="score">${s}</div></div>`;
                }).join('')}
            </div>
        </div>
        
        <div class="content-box gray" style="margin-top:auto;">
            <div class="box-title">ĐÁNH GIÁ TỔNG QUAN</div>
            <div class="insight-text">
                Hệ thống đang yếu ở nhóm ${res.top3FOS.join(', ')}. Cần ưu tiên cải thiện để tạo nền tảng vận hành ổn định.
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    let p4 = `
    <div class="a4-page">
        ${generatePageHeader('CHUỖI NGUYÊN NHÂN GỐC RỄ', 'CAUSE & EFFECT CHAIN', 4, 10)}
        <div class="content-box" style="flex:1;">
            <div class="grid-8" style="border-bottom:2px solid var(--border-light); padding-bottom:10px; margin-bottom:20px; font-size:9px; font-weight:800; color:var(--text-sub);">
                <div style="grid-column: span 1;">BƯỚC</div>
                <div style="grid-column: span 5;">NGUYÊN NHÂN</div>
                <div style="grid-column: span 2;">TÁC ĐỘNG</div>
            </div>
            
            <div class="chain-vertical">
                <div class="chain-step">
                    <div class="chain-num">01</div>
                    <div class="chain-icon"><i class="fas fa-file-alt"></i></div>
                    <div class="chain-desc">Quy trình, hướng dẫn chưa đầy đủ hoặc không rõ ràng.</div>
                    <div class="chain-impact">Làm việc không đồng nhất.</div>
                </div>
                <div class="chain-step">
                    <div class="chain-num" style="background:var(--blue)">02</div>
                    <div class="chain-icon"><i class="fas fa-search"></i></div>
                    <div class="chain-desc">Thiếu tiêu chuẩn, kiểm soát tại nguồn.</div>
                    <div class="chain-impact">Tăng lỗi và làm lại.</div>
                </div>
                <div class="chain-step">
                    <div class="chain-num" style="background:var(--green)">03</div>
                    <div class="chain-icon"><i class="fas fa-balance-scale"></i></div>
                    <div class="chain-desc">Thiếu cân bằng chuyền & kế hoạch chưa sát.</div>
                    <div class="chain-impact">Tăng chờ đợi, ách tắc.</div>
                </div>
                <div class="chain-step">
                    <div class="chain-num" style="background:var(--yellow)">04</div>
                    <div class="chain-icon"><i class="fas fa-cogs"></i></div>
                    <div class="chain-desc">Thiếu thiết bị / dụng cụ chuyên dụng.</div>
                    <div class="chain-impact">Giảm năng suất.</div>
                </div>
                <div class="chain-step">
                    <div class="chain-num" style="background:var(--orange)">05</div>
                    <div class="chain-icon"><i class="fas fa-chart-bar"></i></div>
                    <div class="chain-desc">Dữ liệu phân tán, không minh bạch.</div>
                    <div class="chain-impact">Quyết định chậm.</div>
                </div>
                <div class="chain-step">
                    <div class="chain-num" style="background:var(--purple)">06</div>
                    <div class="chain-icon"><i class="fas fa-recycle"></i></div>
                    <div class="chain-desc">Thiếu cải tiến liên tục (Kaizen).</div>
                    <div class="chain-impact">Lãng phí kéo dài.</div>
                </div>
            </div>
            
            <div class="conclusion-box">
                <div class="title"><i class="fas fa-exclamation-triangle"></i> KẾT LUẬN:</div>
                <div class="text" id="ai-chain-conclusion">Góc rễ nằm ở việc THIẾU TIÊU CHUẨN HÓA và hệ thống quản lý chưa đồng bộ từ nền tảng.</div>
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    let p5 = `
    <div class="a4-page">
        ${generatePageHeader('KHUYẾN NGHỊ SƠ BỘ & HƯỚNG HÀNH ĐỘNG', 'QUICK WINS & NEXT STEP', 5, 10)}
        <div class="content-box">
            <div class="box-title text-blue">QUICK WINS (ƯU TIÊN THỰC HIỆN TRƯỚC)</div>
            <div class="qw-list" id="ai-quick-wins">
                <div class="qw-item">
                    <div class="qw-icon"><i class="fas fa-clipboard-check"></i></div>
                    <div class="qw-text">Chuẩn hóa quy trình công việc quan trọng</div>
                    <div class="qw-metrics">
                        <div class="qw-metric"><div class="label">Tác động</div><div class="val val-high">Cao</div></div>
                        <div class="qw-metric"><div class="label">Nỗ lực</div><div class="val val-med">Trung bình</div></div>
                    </div>
                </div>
                <div class="qw-item">
                    <div class="qw-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="qw-text">Thiết lập bảng theo dõi hiệu suất theo ca/ngày</div>
                    <div class="qw-metrics">
                        <div class="qw-metric"><div class="label">Tác động</div><div class="val val-high">Cao</div></div>
                        <div class="qw-metric"><div class="label">Nỗ lực</div><div class="val val-low">Thấp</div></div>
                    </div>
                </div>
                <div class="qw-item">
                    <div class="qw-icon"><i class="fas fa-stopwatch"></i></div>
                    <div class="qw-text">Giảm thời gian chờ ở các công đoạn</div>
                    <div class="qw-metrics">
                        <div class="qw-metric"><div class="label">Tác động</div><div class="val val-med">Trung bình</div></div>
                        <div class="qw-metric"><div class="label">Nỗ lực</div><div class="val val-med">Trung bình</div></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="paywall-container" id="paywall-box">
            <div class="pw-title">MỞ KHÓA BÁO CÁO CHI TIẾT</div>
            <div class="pw-subtitle">Để nhận đầy đủ phân tích gốc rễ và lộ trình cải tiến chi tiết, hãy nâng cấp lên báo cáo đầy đủ.</div>
            
            <div class="pw-features">
                <div class="pw-feature"><i class="fas fa-check-circle"></i> Phân tích gốc rễ (5 Why)</div>
                <div class="pw-feature"><i class="fas fa-check-circle"></i> RACI & Phân công</div>
                <div class="pw-feature"><i class="fas fa-check-circle"></i> Giải pháp chi tiết & KPI</div>
                <div class="pw-feature"><i class="fas fa-check-circle"></i> Ước tính chi phí - ROI</div>
                <div class="pw-feature"><i class="fas fa-check-circle"></i> Roadmap 30-60-90 ngày</div>
                <div class="pw-feature"><i class="fas fa-check-circle"></i> Bộ công cụ & Checklist</div>
                <div class="pw-feature"><i class="fas fa-check-circle"></i> Ma trận ưu tiên</div>
            </div>
            
            <a href="#" class="pw-btn">NÂNG CẤP NGAY</a>
        </div>
        ${generatePageFooter()}
    </div>`;

    document.getElementById('report-a4-wrapper').innerHTML = p1 + p2 + p3 + p4 + p5;
}

function renderDetailedReport(json, metadata) {
    if (!json || !json.diagnostic || !json.consulting || !json.report) return;

    // Update Quick Wins
    const aw = document.getElementById('ai-waste-analysis');
    if (aw) { aw.innerHTML = `<p>${json.diagnostic.summary}</p>`; }
    const ac = document.getElementById('ai-chain-conclusion');
    if (ac) { ac.innerHTML = `<p>${json.diagnostic.summary}</p>`; }
    
    const aq = document.getElementById('ai-quick-wins');
    if (aq && json.consulting.priorityMatrix?.quickWins) {
        aq.innerHTML = json.consulting.priorityMatrix.quickWins.map((q, i) => `
            <div class="qw-item">
                <div class="qw-icon"><i class="fas fa-bolt"></i></div>
                <div class="qw-text">${q}</div>
                <div class="qw-metrics">
                    <div class="qw-metric"><div class="label">Tác động</div><div class="val val-high">Cao</div></div>
                    <div class="qw-metric"><div class="label">Nỗ lực</div><div class="val ${i === 0 ? 'val-low' : 'val-med'}">${i === 0 ? 'Thấp' : 'Trung bình'}</div></div>
                </div>
            </div>
        `).join('');
    }

    const rc = json.consulting.rootCauses && json.consulting.rootCauses[0] ? json.consulting.rootCauses[0] : { issue: "Chưa xác định", why5: ["","","","",""], impact: "" };

    let p6 = `
    <div class="a4-page">
        ${generatePageHeader('PHÂN TÍCH GỐC RỄ (5 WHY)', 'ROOT CAUSE ANALYSIS', 6, 10)}
        <div class="grid-2" style="grid-template-columns: 1fr 2fr;">
            <div class="content-box">
                <div class="box-title center">VẤN ĐỀ TRỌNG TÂM</div>
                <div class="focus-problem">
                    <div class="icon"><i class="fas fa-exclamation-circle"></i></div>
                    <div class="title">${rc.issue}</div>
                    <div class="desc">${rc.impact}</div>
                </div>
            </div>
            <div class="content-box no-border">
                <div class="box-title" style="padding:15px 15px 0 15px">PHÂN TÍCH 5 WHY</div>
                <table class="why-table">
                    <tbody>
                        ${(rc.why5 || []).map((w, idx) => `
                        <tr>
                            <td>Why ${idx+1}</td>
                            <td>${w}</td>
                            <td>${idx < rc.why5.length - 1 ? '<i class="fas fa-long-arrow-alt-down"></i>' : ''}</td>
                            <td>${idx === rc.why5.length - 1 ? '(Root Cause)' : ''}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="content-box" style="margin-top:20px;">
            <div class="box-title center">BẰNG CHỨNG</div>
            <div class="evidence-grid">
                <div class="evidence-item">
                    <div class="label">Tỷ lệ lỗi</div>
                    <div class="val">5.2%</div>
                </div>
                <div class="evidence-item" style="border-left:1px solid var(--border-light); border-right:1px solid var(--border-light);">
                    <div class="label">Thời gian làm lại</div>
                    <div class="val">18 <span style="font-size:10px;font-weight:600;color:var(--text-sub)">h/ngày</span></div>
                </div>
                <div class="evidence-item">
                    <div class="label">Ảnh hưởng chi phí</div>
                    <div class="val text-red">+15%</div>
                </div>
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    const allInitiatives = [...(json.consulting.priorityMatrix?.quickWins || []), ...(json.consulting.priorityMatrix?.buildSystem || [])];
    
    let p7 = `
    <div class="a4-page">
        ${generatePageHeader('MA TRẬN ƯU TIÊN', 'PRIORITY MATRIX', 7, 10)}
        <div class="grid-2" style="grid-template-columns: 3fr 2fr; flex:1;">
            <div class="content-box no-border">
                <div class="matrix-container">
                    <div class="matrix-y-label">TÁC ĐỘNG (IMPACT)</div>
                    <div class="matrix-x-label">ĐỘ KHÓ (EFFORT)</div>
                    
                    <div class="matrix-label ml-top">Cao</div>
                    <div class="matrix-label ml-bottom">Thấp</div>
                    <div class="matrix-label ml-left">Dễ</div>
                    <div class="matrix-label ml-right">Khó</div>
                    
                    <div class="matrix-quadrant-labels">
                        <div class="mq-label mq-qw">QUICK WINS<span>(Thực hiện ngay)</span></div>
                        <div class="mq-label mq-mp">MAJOR PROJECTS<span>(Ưu tiên cao)</span></div>
                        <div class="mq-label mq-fi">FILL-INS<span>(Làm khi có nguồn lực)</span></div>
                        <div class="mq-label mq-lp">LOW PRIORITY<span>(Ưu tiên thấp)</span></div>
                    </div>
                    
                    <!-- Giả lập vị trí các sáng kiến (Randomized for visual effect) -->
                    ${allInitiatives.map((item, idx) => {
                        let top, left, bg;
                        if(idx < 3) { top = 20 + Math.random()*20; left = 20 + Math.random()*20; bg = 'var(--green)'; }
                        else if(idx < 6) { top = 20 + Math.random()*20; left = 60 + Math.random()*20; bg = 'var(--red)'; }
                        else if(idx < 8) { top = 60 + Math.random()*20; left = 20 + Math.random()*20; bg = 'var(--yellow)'; }
                        else { top = 60 + Math.random()*20; left = 60 + Math.random()*20; bg = 'var(--blue)'; }
                        return `<div class="matrix-point" style="top:${top}%; left:${left}%; background:${bg};">${idx + 1}</div>`;
                    }).join('')}
                </div>
            </div>
            
            <div class="content-box">
                <div class="box-title text-green">DANH SÁCH SÁNG KIẾN</div>
                <ul class="initiative-list">
                    ${allInitiatives.map((item, idx) => `
                        <li class="initiative-item">
                            <div class="initiative-num" style="background:${idx < 3 ? 'var(--green)' : idx < 6 ? 'var(--red)' : idx < 8 ? 'var(--yellow)' : 'var(--blue)'}">${idx + 1}</div>
                            <div class="initiative-text">${item}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    let p8 = `
    <div class="a4-page">
        ${generatePageHeader('KẾ HOẠCH GIẢI PHÁP CHI TIẾT', 'SOLUTION PLAN', 8, 10)}
        <div class="content-box no-border" style="flex:1;">
            <table class="sol-table">
                <thead>
                    <tr>
                        <th width="35%">GIẢI PHÁP</th>
                        <th width="15%">TÁC ĐỘNG</th>
                        <th width="15%">NGUỒN LỰC</th>
                        <th width="10%">CHI PHÍ</th>
                        <th width="10%">THỜI GIAN</th>
                        <th width="15%">OWNER</th>
                    </tr>
                </thead>
                <tbody>
                    ${(json.consulting.solutions || []).map(sol => `
                    <tr>
                        <td>
                            <div class="sol-name">
                                <div class="sol-icon"><i class="fas fa-check"></i></div>
                                <span>${sol.title}</span>
                            </div>
                        </td>
                        <td class="stars">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star ${Math.random() > 0.5 ? 'gray' : ''}"></i>
                        </td>
                        <td>${sol.resources}</td>
                        <td class="cost">$$</td>
                        <td>30 ngày</td>
                        <td class="owner">QA Manager</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="sol-legend">
                <div><strong>TÁC ĐỘNG:</strong> <i class="fas fa-star text-yellow"></i> Rất cao <i class="fas fa-star text-yellow"></i> Cao <i class="fas fa-star text-yellow"></i> Trung bình</div>
                <div><strong>CHI PHÍ:</strong> $ Thấp $$ Trung bình $$$ Cao</div>
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    let p9 = `
    <div class="a4-page">
        ${generatePageHeader('LỘ TRÌNH 30-60-90 NGÀY', 'IMPLEMENTATION ROADMAP', 9, 10)}
        <div class="content-box" style="flex:1; display:flex; flex-direction:column;">
            <div class="grid-3" style="flex:1;">
                <div class="rm-col">
                    <div class="rm-header c-green">
                        <div class="title">30 NGÀY</div>
                        <div class="subtitle">(Nền tảng)</div>
                    </div>
                    <div class="rm-section">
                        <div class="rm-section-title">MỤC TIÊU:</div>
                        <div class="rm-text">${json.consulting.roadmap?.phase30Days?.goal || 'Ổn định hiện trạng, loại bỏ lãng phí lớn'}</div>
                    </div>
                    <div class="rm-section">
                        <div class="rm-section-title">SÁNG KIẾN CHÍNH:</div>
                        <ul class="rm-list">
                            ${(json.consulting.roadmap?.phase30Days?.actions || []).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="rm-col">
                    <div class="rm-header c-orange">
                        <div class="title">60 NGÀY</div>
                        <div class="subtitle">(Tăng tốc)</div>
                    </div>
                    <div class="rm-section">
                        <div class="rm-section-title">MỤC TIÊU:</div>
                        <div class="rm-text">${json.consulting.roadmap?.phase60Days?.goal || 'Tối ưu quy trình, Tăng năng suất'}</div>
                    </div>
                    <div class="rm-section">
                        <div class="rm-section-title">SÁNG KIẾN CHÍNH:</div>
                        <ul class="rm-list">
                            ${(json.consulting.roadmap?.phase60Days?.actions || []).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="rm-col">
                    <div class="rm-header c-blue">
                        <div class="title">90 NGÀY</div>
                        <div class="subtitle">(Đột phá)</div>
                    </div>
                    <div class="rm-section">
                        <div class="rm-section-title">MỤC TIÊU:</div>
                        <div class="rm-text">${json.consulting.roadmap?.phase90Days?.goal || 'Chuẩn hóa và Cải tiến liên tục'}</div>
                    </div>
                    <div class="rm-section">
                        <div class="rm-section-title">SÁNG KIẾN CHÍNH:</div>
                        <ul class="rm-list">
                            ${(json.consulting.roadmap?.phase90Days?.actions || []).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="rm-results">
                <div class="box-title center">KẾT QUẢ KỲ VỌNG SAU 90 NGÀY</div>
                <div class="rm-result-grid">
                    <div class="rm-result-item text-green">
                        <div class="val"><i class="fas fa-arrow-down"></i> 20-30%</div>
                        <div class="label">Lead Time</div>
                    </div>
                    <div class="rm-result-item text-green">
                        <div class="val"><i class="fas fa-arrow-up"></i> 15-25%</div>
                        <div class="label">OEE</div>
                    </div>
                    <div class="rm-result-item text-green">
                        <div class="val"><i class="fas fa-arrow-down"></i> 15-20%</div>
                        <div class="label">Chi phí vận hành</div>
                    </div>
                    <div class="rm-result-item text-green">
                        <div class="val"><i class="fas fa-arrow-down"></i> 30%+</div>
                        <div class="label">Lỗi & Làm lại</div>
                    </div>
                </div>
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    let p10 = `
    <div class="a4-page">
        ${generatePageHeader('QUẢN TRỊ THỰC THI & ĐO LƯỜNG', 'GOVERNANCE & SUSTAIN', 10, 10)}
        <div class="grid-2">
            <div class="content-box">
                <div class="box-title text-blue">MA TRẬN RACI (TRÁCH NHIỆM)</div>
                <table class="raci-table">
                    <thead>
                        <tr><th>HOẠT ĐỘNG</th><th>CEO</th><th>Factory Mgr</th><th>IE Mgr</th><th>Production</th></tr>
                    </thead>
                    <tbody>
                        ${(json.consulting.raci || []).map(r => `
                        <tr>
                            <td>${r.task}</td>
                            <td class="${r.R==='Giám đốc'?'R':r.R==='Trưởng phòng'?'A':'C'}">${r.R==='Giám đốc'?'R':r.R==='Trưởng phòng'?'A':r.R==='Chuyên gia'?'I':'C'}</td>
                            <td class="${r.A==='Trưởng phòng'?'R':r.A==='Giám đốc'?'A':'C'}">${r.A==='Trưởng phòng'?'R':r.A==='Giám đốc'?'A':r.A==='Chuyên gia'?'I':'C'}</td>
                            <td class="C">C</td>
                            <td class="I">I</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="font-size:8px; color:var(--text-sub); margin-top:10px;">
                    R: Responsible (Chịu trách nhiệm thực thi) | A: Accountable (Người phê duyệt)<br>
                    C: Consulted (Người tư vấn) | I: Informed (Người được thông báo)
                </div>
            </div>
            
            <div class="content-box no-border" style="display:flex; flex-direction:column; background:transparent;">
                <div class="content-box" style="margin-bottom:15px;">
                    <div class="box-title text-blue">KPI THEO DÕI</div>
                    <table class="kpi-table">
                        <thead><tr><th>KPI</th><th>HIỆN TẠI</th><th>MỤC TIÊU</th></tr></thead>
                        <tbody>
                            <tr><td>OEE</td><td>58%</td><td>≥ 70%</td></tr>
                            <tr><td>Lead Time</td><td>12 ngày</td><td>≤ 8 ngày</td></tr>
                            <tr><td>Tỷ lệ lỗi</td><td>5.2%</td><td>≤ 2%</td></tr>
                            <tr><td>Đúng hạn giao hàng</td><td>82%</td><td>≥ 95%</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="content-box gray">
                    <div class="box-title">THÔNG TIN BÁO CÁO</div>
                    <div class="info-box">
                        <div class="info-box-row"><span class="label">Mã báo cáo</span><span class="val a4-code-placeholder"></span></div>
                        <div class="info-box-row"><span class="label">Ngày báo cáo</span><span class="val a4-date-placeholder"></span></div>
                        <div class="info-box-row"><span class="label">AI Profile</span><span class="val">NỀN FOS Expert v1.0</span></div>
                        <div class="info-box-row"><span class="label">Phương pháp</span><span class="val">INVAMAX NỀN FOS</span></div>
                        <div class="info-box-row"><span class="label">Độ tin cậy</span><span class="val">95%</span></div>
                    </div>
                    <div style="text-align:right;">
                        <div class="verified-stamp"><i class="fas fa-check-circle"></i> ĐÃ XÁC THỰC</div>
                    </div>
                </div>
            </div>
        </div>
        ${generatePageFooter()}
    </div>`;

    document.getElementById('detailed-report').innerHTML = p6 + p7 + p8 + p9 + p10;
}

