$file = 'C:\Users\MAY TINH 2K\Desktop\invamax-website\kham-benh-online\assets\js\admin.js'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

$startIndex = -1
$endIndex = -1

for ($i=0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '^function generatePageHeader') { $startIndex = $i; break }
}
for ($i=$startIndex; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '^function renderDetailedReport') { $endIndex = $i; break }
}

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $lines[0..($startIndex-1)] -join "`r`n"
    $after = $lines[$endIndex..($lines.Length-1)] -join "`r`n"
    
    $replacement = @"
function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
    window.currentPageNum = pageNum;
    window.currentMaxPage = maxPage;
    return ``
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
    <div class="a4-title-bar" style="display:none;"></div>``;
}

function generatePageFooter() {
    let pageNum = window.currentPageNum || 1;
    let maxPage = window.currentMaxPage || 10;
    return ``
    <div class="a4-footer">
        <div class="a4-footer-left">
            <strong>INVAMAX</strong>
            <span>NỀN FOS - Kim chỉ nam vận hành nhà máy SME</span>
        </div>
        <div class="a4-footer-center">
            <span class="footer-module"><span class="footer-dot bg-orange"></span> Core</span>
            <span class="footer-module"><span class="footer-dot bg-orange"></span> People</span>
            <span class="footer-module"><span class="footer-dot bg-orange"></span> Standard</span>
            <span class="footer-module"><span class="footer-dot bg-green"></span> Flow</span>
            <span class="footer-module"><span class="footer-dot bg-green"></span> Capacity</span>
            <span class="footer-module"><span class="footer-dot bg-green"></span> Daily Mgmt</span>
            <span class="footer-module"><span class="footer-dot bg-green"></span> Quality</span>
            <span class="footer-module"><span class="footer-dot bg-blue"></span> Knowledge</span>
            <span class="footer-module"><span class="footer-dot bg-blue"></span> Digital</span>
            <span class="footer-module"><span class="footer-dot bg-purple"></span> Kaizen</span>
            <span class="footer-module"><span class="footer-dot bg-purple"></span> Sustain</span>
        </div>
        <div class="a4-footer-right">
            <div class="right-wrap">
                <span style="font-weight: 800; color: white;">TRANG `${pageNum} / `${maxPage}</span>
                <span>Báo cáo được phân tích bởi AI dựa trên hệ thống chuyên gia NỀN FOS.<br>Kết quả chỉ mang tính tham khảo và cần được xác nhận bởi chuyên gia.</span>
                <span>www.invamax.vn | Hotline: 0896676399</span>
            </div>
            <img src="https://img.vietqr.io/image/MB-5757658888-qr_only.png?amount=990000" alt="QR">
        </div>
    </div>``;
}

function renderPreliminary(res, factoryInfo, contactInfo, rawAnswers) {
    const healthScore = 100 - res.warningScore;
    const rotation = (healthScore / 100) * 180 - 90;
    
    let gaugeColor = '#10b981';
    if (healthScore < 80) gaugeColor = '#facc15';
    if (healthScore < 60) gaugeColor = '#f97316';
    if (healthScore < 40) gaugeColor = '#ef4444';
    if (healthScore < 20) gaugeColor = '#334155';

    let top3Cards = res.top3Wastes.map((w, i) => ``
        <div class="top3-card">
            <div class="top3-card-header">
                <div class="top3-num">`${i + 1}</div>
                <div class="top3-title">`${w}</div>
            </div>
            <div class="top3-card-body">
                <p style="margin:0 0 5px 0">Mức ưu tiên: <strong>`${i === 0 ? '<span style="color:#ef4444">Rất cao</span>' : '<span style="color:#f97316">Cao</span>'}</strong></p>
                <p style="margin:0">Ảnh hưởng: <strong style="color:#0f172a">`${i === 0 ? 'Giao hàng' : (i === 1 ? 'Chi phí' : 'Năng suất')}</strong></p>
            </div>
        </div>
    ``).join('');

    let p1 = ``
    <div class="a4-page">
        `${generatePageHeader('TỔNG QUAN', 'EXECUTIVE SUMMARY', 1, 10)}
        
        <div class="orange-title-bar">
            <span>1. THÔNG TIN NHÀ MÁY & TỔNG QUAN SỨC KHỎE VẬN HÀNH</span>
        </div>

        <div class="content-box mb-15 p-0">
            <div class="box-title" style="padding: 10px 15px; border-bottom: 1px solid #e2e8f0; margin: 0;">THÔNG TIN NHÀ MÁY</div>
            <div class="info-grid">
                <div class="info-row"><div class="info-label">Tên công ty</div><div class="info-val">`${factoryInfo['A01'] || 'Chưa cập nhật'}</div></div>
                <div class="info-row"><div class="info-label">Người trả lời</div><div class="info-val">`${contactInfo['F01'] || 'Chưa cập nhật'}</div></div>
                <div class="info-row"><div class="info-label">Sản phẩm</div><div class="info-val">`${factoryInfo['A02'] || 'Chưa cập nhật'}</div></div>
                <div class="info-row"><div class="info-label">Chức vụ</div><div class="info-val">`${contactInfo['F02'] || 'Chưa cập nhật'}</div></div>
                <div class="info-row"><div class="info-label">Mã báo cáo</div><div class="info-val a4-code-placeholder"></div></div>
                <div class="info-row"><div class="info-label">Số điện thoại</div><div class="info-val">`${contactInfo['F04'] || 'Chưa cập nhật'}</div></div>
            </div>
        </div>

        <div class="content-box mb-15">
            <div class="box-title center">ĐIỂM SỨC KHỎE TỔNG QUAN</div>
            <div class="gauge-layout">
                <div class="gauge-wrapper">
                    <canvas id="gaugeChart"></canvas>
                    <div class="gauge-needle" style="transform: rotate(`${rotation}deg);"></div>
                    <div class="gauge-center-dot"></div>
                    <div class="gauge-score"><span style="color:#ea580c">`${healthScore}</span><span style="font-size:12px;color:#94a3b8"> / 100</span></div>
                    <div class="gauge-status">MỨC ĐỘ: <span style="color:`${gaugeColor}">`${res.assessmentLevel.toUpperCase()}</span></div>
                </div>
                <div class="gauge-legend">
                    <div class="legend-item"><span class="dot" style="background:#10b981"></span> Khỏe mạnh</div>
                    <div class="legend-item"><span class="dot" style="background:#facc15"></span> Cảnh báo</div>
                    <div class="legend-item"><span class="dot" style="background:#f97316"></span> Mắc bệnh</div>
                    <div class="legend-item"><span class="dot" style="background:#ef4444"></span> Bệnh nặng</div>
                    <div class="legend-item"><span class="dot" style="background:#334155"></span> Nguy kịch</div>
                </div>
            </div>
        </div>

        <div class="content-box mb-15">
            <div class="box-title center">KẾT LUẬN TÌNH TRẠNG & KHUYẾN NGHỊ (AI)</div>
            <div class="ai-conclusion-text">`${res.generalAssessment}</div>
            <div class="ai-recommendation-box">
                <strong>HÀNH ĐỘNG KHUYẾN NGHỊ:</strong> `${res.nextSteps}
            </div>
        </div>

        <div class="content-box no-border p-0" style="background:transparent;">
            <div class="box-title" style="font-size: 13px; margin-bottom: 10px;">TOP 3 VẤN ĐỀ NGHIÊM TRỌNG</div>
            <div class="top3-cards-container">`${top3Cards}</div>
            
            <div class="top3-impact-box">
                <div class="impact-title">NẾU KHÔNG CẢI THIỆN:</div>
                <div class="impact-pills">
                    <div class="impact-pill"><i class="fas fa-coins text-red" style="color:#ef4444"></i> Chi phí <i class="fas fa-arrow-up text-red"></i></div>
                    <div class="impact-pill"><i class="fas fa-clock" style="color:#f97316"></i> Lead Time <i class="fas fa-arrow-up text-red"></i></div>
                    <div class="impact-pill"><i class="fas fa-fire" style="color:#ef4444"></i> Khó mở rộng</div>
                </div>
            </div>
            
            <div class="top3-action-box">
                <i class="fas fa-check-circle check-icon"></i>
                <div class="action-text">
                    <strong style="font-size:12px;">KHUYẾN NGHỊ NGAY</strong><br>
                    Thực hiện dự án cải tiến điểm (Kaizen Blitz) tại khu vực yếu nhất trong 30 ngày.
                </div>
            </div>
        </div>

        `${(() => { window.currentPageNum = 1; return generatePageFooter(); })()}
    </div>``;
    
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

    let p2 = ``
    <div class="a4-page">
        `${generatePageHeader('PHÂN TÍCH 8 LÃNG PHÍ', 'WASTE ANALYSIS', 2, 10)}
        <div class="grid-2" style="flex:1;">
            <div class="content-box">
                <div class="box-title">BIỂU ĐỒ 8 LÃNG PHÍ</div>
                <div class="radar-container"><canvas id="radarChart"></canvas></div>
            </div>
            
            <div class="content-box no-border">
                <div class="box-title">TOP 3 LÃNG PHÍ NỔI BẬT</div>
                <ul class="top-waste-list">
                    `${res.top3Wastes.map((w, i) => ``
                        <li class="top-waste-item">
                            <div class="top-waste-left">
                                <div class="top-waste-num">`${i + 1}</div>
                                <div class="top-waste-name">`${w}</div>
                            </div>
                            <div class="top-waste-score">`${res.wasteScores.find(x => x.module === w).score}<span>/100</span></div>
                        </li>
                    ``).join('')}
                </ul>
                <div class="insight-box" style="margin-top: 20px;">
                    <div class="title" style="color:var(--primary)">INSIGHT AI</div>
                    <div class="insight-text">`${res.generalAssessment}</div>
                </div>
            </div>
        </div>
        `${generatePageFooter()}
    </div>``;

    document.getElementById('preliminary-report').innerHTML = p1 + p2;
}
"@

    $combined = $before + "`r`n" + $replacement + "`r`n" + $after
    [System.IO.File]::WriteAllText($file, $combined, [System.Text.Encoding]::UTF8)
    Write-Output "Successfully updated admin.js"
} else {
    Write-Output "Could not find bounds"
}
