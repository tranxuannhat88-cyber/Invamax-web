async function generateReport() {
    const jsonText = document.getElementById('jsonData').value.trim();
    if (!jsonText) { Swal.fire('Lỗi', 'Vui lòng dán JSON dữ liệu thô', 'error'); return; }

    let isMock = false;
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) { isMock = true; }

    let rawAnswers;
    try { rawAnswers = JSON.parse(jsonText); } 
    catch (e) { Swal.fire('Lỗi', 'JSON không hợp lệ.', 'error'); return; }

    document.getElementById('ai-loading').style.display = 'block';
    document.getElementById('report-preview').style.display = 'none';

    try {
        const scores = calculateResults(rawAnswers);
        
        let factoryInfo = {}; AppQuestions.partA.forEach(q => { factoryInfo[q.id] = rawAnswers[q.id]; });
        let contactInfo = {}; AppQuestions.partF.forEach(q => { contactInfo[q.id] = rawAnswers[q.id]; });

        renderPreliminary(scores, factoryInfo, contactInfo, rawAnswers);

        let aiJsonData = null;

        if (isMock) {
            document.getElementById('ai-loading').style.display = 'none';
            Swal.fire('Chế độ xem trước', 'Hệ thống dùng dữ liệu mẫu (Chưa nhập API Key).', 'info');
            
            aiJsonData = {
                diagnostic: { summary: "Dữ liệu mẫu", keyFindings: [] },
                consulting: {
                    rootCauses: [ {issue: "Mẫu 1", why5: ["Why1", "Why2"], impact: "Tác động mẫu"} ],
                    priorityMatrix: { quickWins: ["Giải pháp nhanh"], buildSystem: ["Hệ thống lâu dài"] },
                    solutions: [ {title: "Giải pháp 1", objective: "Mục tiêu 1", actions: ["Hành động"], resources: "Nguồn lực", risks: "Rủi ro"} ],
                    roadmap: {
                        phase30Days: {goal: "Mục tiêu 30", actions: ["Hành động 30"]},
                        phase60Days: {goal: "Mục tiêu 60", actions: ["Hành động 60"]},
                        phase90Days: {goal: "Mục tiêu 90", actions: ["Hành động 90"]}
                    },
                    raci: [ {task: "Công việc mẫu", R: "GD", A: "TP", C: "QC", I: "TV"} ],
                    sustainControls: ["Cơ chế 1"]
                }
            };
            renderDetailedReport(aiJsonData);
            document.getElementById('report-preview').style.display = 'block';
            initCharts(scores);
            return;
        }

        // Prepare System Payload
        const systemPayload = {
            factoryHealthIndex: 100 - scores.warningScore,
            diseaseScore: scores.warningScore,
            assessmentLevel: scores.assessmentLevel,
            top3Wastes: scores.top3Wastes,
            top3Symptoms: scores.diseases,
            top3ModulesFOS: scores.top3FOS,
            wasteScores: scores.wasteScores,
            fosScores: scores.fosScores,
            businessPriority: {
                priority12Months: rawAnswers['E01'] || '',
                keyGoal6Months: rawAnswers['E02'] || '',
                biggestObstacle: rawAnswers['E04'] || ''
            }
        };

        const systemPrompt = `BẠN LÀ CHUYÊN GIA TƯ VẤN QUẢN TRỊ SẢN XUẤT TINH GỌN (LEAN MANUFACTURING) VÀ HỆ ĐIỀU HÀNH FOS CỦA INVAMAX.

Hệ thống đã thu thập dữ liệu, tính điểm và mapping kết quả của nhà máy như sau:
${JSON.stringify(systemPayload, null, 2)}

YÊU CẦU: Bạn hãy hoạt động tuần tự qua 3 MODE sau để phân tích và lập kế hoạch cho nhà máy:

MODE 1 = DIAGNOSTIC
- Phân tích dữ liệu được cung cấp. Xác định tình trạng nhà máy và tóm tắt các vấn đề nổi bật. Không đề xuất giải pháp.

MODE 2 = CONSULTING
- Phân tích nguyên nhân gốc rễ (Root Cause Analysis). Xác định các vấn đề ưu tiên.
- Đề xuất CHÍNH XÁC 5 hành động cầm máu (Quick Wins) BẮT BUỘC phải liên kết trực tiếp và logic để giải quyết các Dấu hiệu bất thường/Lãng phí nghiêm trọng nhất của 3 Module yếu kém nhất.
- Đề xuất giải pháp đột phá. Xây dựng Roadmap 30-60-90 ngày. Đề xuất chỉ số đo lường (KPI).

MODE 3 = REPORT
- Tổng hợp thành báo cáo hoàn chỉnh dựa trên kết quả của MODE 1 và 2. TUYỆT ĐỐI KHÔNG phân tích lại dữ liệu, KHÔNG thay đổi kết quả của CONSULTING.

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON. BẮT BUỘC dùng JSON Schema sau:
{
  "diagnostic": { "summary": "Tóm tắt tình trạng (1 đoạn)", "keyFindings": ["Phát hiện 1"], "confidence": 90, "fieldVerificationRequired": true },
  "consulting": {
    "rootCauses": [ {"issue": "Vấn đề", "why5": ["Tại sao 1"], "impact": "Tác động"} ],
    "priorityMatrix": { "quickWins": ["Giải pháp 1"], "buildSystem": ["Giải pháp 1"] },
    "solutions": [ {"title": "Tên giải pháp", "objective": "Mục tiêu", "actions": ["Hành động 1"], "resources": "Nguồn lực", "risks": "Rủi ro"} ],
    "roadmap": {
       "phase30Days": {"goal": "Mục tiêu", "actions": ["Hành động"]},
       "phase60Days": {"goal": "Mục tiêu", "actions": ["Hành động"]},
       "phase90Days": {"goal": "Mục tiêu", "actions": ["Hành động"]}
    },
    "raci": [ {"task": "Công việc", "R": "Vai trò", "A": "Vai trò", "C": "Vai trò", "I": "Vai trò"} ],
    "sustainControls": ["Cơ chế 1"]
  },
  "report": { "status": "Hoàn thành", "verificationCheck": "Đã khớp" }
}`;

        // Fetch API with Retry Logic
        let retries = 2;
        let success = false;
        
        while (retries >= 0 && !success) {
            try {
                console.log(`[Diagnostic, Consulting, Report] Gọi AI Engine... (Còn ${retries} lần thử)`);
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: { temperature: 0.7, response_mime_type: "application/json" }
                    })
                });

                const aiData = await response.json();
                if (aiData.error) throw new Error(aiData.error.message);
                if (!aiData.candidates || aiData.candidates.length === 0) throw new Error('Không nhận được phản hồi từ AI.');
                
                const aiText = aiData.candidates[0].content.parts[0].text;
                aiJsonData = JSON.parse(aiText);
                console.log('[Diagnostic] Thành công:', aiJsonData.diagnostic);
                console.log('[Consulting] Thành công:', aiJsonData.consulting);
                console.log('[Report] Thành công:', aiJsonData.report);
                success = true;
            } catch (err) {
                console.error("Lỗi AI Engine:", err);
                retries--;
                if (retries < 0) {
                    Swal.fire('Lỗi API', 'Đã thử lại 3 lần nhưng AI trả về dữ liệu không hợp lệ: ' + err.message, 'error');
                    document.getElementById('ai-loading').style.display = 'none';
                    return;
                }
            }
        }

        renderDetailedReport(aiJsonData);
        
        // Update Code Placeholders
        const code = document.getElementById('a4-code-1').innerText;
        document.querySelectorAll('.a4-code-placeholder').forEach(el => el.innerText = code);

        document.getElementById('ai-loading').style.display = 'none';
        document.getElementById('report-preview').style.display = 'block';

        initCharts(scores);

    } catch (e) {
        console.error(e);
        Swal.fire('Lỗi hệ thống', e.toString(), 'error');
        document.getElementById('ai-loading').style.display = 'none';
    }
}

function renderDetailedReport(json) {
    const aiHtml = `
<div class="a4-page">
    <div class="a4-header">
        <div><div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a;">INVA<span style="color:#f97316;">MAX</span></div></div>
        <div class="a4-title-center">BÁO CÁO CHI TIẾT<br>GIẢI PHÁP & LỘ TRÌNH</div>
        <div style="width: 160px;"></div>
    </div>
    <div class="a4-content">
        <div class="a4-section-title">6. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS) <span style="float:right">Trang 6 / 10</span></div>
        <div class="a4-box" style="margin-bottom: 20px;">
            <div style="color: #ef4444; font-weight: bold; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle"></i> MỐI LIÊN KẾT HỆ THỐNG</div>
            <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0;">${json.diagnostic.summary}</p>
        </div>
        <div class="a4-grid-2" style="grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
            ${(json.consulting.rootCauses || []).map(rc => `
                <div class="a4-box" style="padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <h4 style="color: #ea580c; font-size: 13px; margin: 0 0 10px 0; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px;">${rc.issue}</h4>
                    <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0;"><strong>Tác động:</strong> ${rc.impact}</p>
                    <div style="background: #f8fafc; padding: 8px; border-radius: 4px; font-size: 11px; color: #64748b;">
                        <strong style="color:#0f172a;">Phân tích 5-Why:</strong><br>
                        ${(rc.why5 || []).map((w, idx) => `<div style="margin-top:4px;">${idx+1}. ${w}</div>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    <div class="a4-footer">INVAMAX www.invamax.com | Mã báo cáo: <span class="a4-code-placeholder"></span> | Trang 6 / 10</div>
</div>

<div class="a4-page">
    <div class="a4-header">
        <div><div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a;">INVA<span style="color:#f97316;">MAX</span></div></div>
        <div class="a4-title-center">BÁO CÁO CHI TIẾT<br>GIẢI PHÁP & LỘ TRÌNH</div>
        <div style="width: 160px;"></div>
    </div>
    <div class="a4-content">
        <div class="a4-section-title">7. MA TRẬN ƯU TIÊN & XẾP HẠNG VẤN ĐỀ <span style="float:right">Trang 7 / 10</span></div>
        <div class="a4-grid-2" style="margin-bottom: 20px;">
            <div class="a4-box" style="border-left: 4px solid #ef4444; background: #fff;">
                <h4 style="color: #ef4444; margin: 0 0 10px 0; font-size: 13px;">Ưu tiên cao nhất (Quick Wins)</h4>
                <ul style="font-size: 12px; color: #334155; padding-left: 20px; line-height: 1.6; margin: 0;">
                    ${(json.consulting.priorityMatrix?.quickWins || []).map(q => `<li>${q}</li>`).join('')}
                </ul>
            </div>
            <div class="a4-box" style="border-left: 4px solid #3b82f6; background: #fff;">
                <h4 style="color: #3b82f6; margin: 0 0 10px 0; font-size: 13px;">Chiến lược dài hạn (Build System)</h4>
                <ul style="font-size: 12px; color: #334155; padding-left: 20px; line-height: 1.6; margin: 0;">
                    ${(json.consulting.priorityMatrix?.buildSystem || []).map(q => `<li>${q}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>
    <div class="a4-footer">INVAMAX www.invamax.com | Mã báo cáo: <span class="a4-code-placeholder"></span> | Trang 7 / 10</div>
</div>

<div class="a4-page">
    <div class="a4-header">
        <div><div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a;">INVA<span style="color:#f97316;">MAX</span></div></div>
        <div class="a4-title-center">BÁO CÁO CHI TIẾT<br>GIẢI PHÁP & LỘ TRÌNH</div>
        <div style="width: 160px;"></div>
    </div>
    <div class="a4-content">
        <div class="a4-section-title">8. CHI TIẾT GIẢI PHÁP ĐỘT PHÁ (SOLUTION DETAILS) <span style="float:right">Trang 8 / 10</span></div>
        <div class="a4-grid-2">
            ${(json.consulting.solutions || []).map(sol => `
                <div class="a4-box" style="background: #fff; padding: 15px;">
                    <h4 style="color: #ea580c; font-size: 13px; margin: 0 0 10px 0;"><i class="fas fa-tools"></i> ${sol.title}</h4>
                    <div style="font-size: 12px; color: #475569; line-height: 1.6;">
                        <p style="margin: 0 0 5px 0;"><strong>Mục tiêu:</strong> ${sol.objective}</p>
                        <p style="margin: 0 0 5px 0;"><strong>Hành động:</strong></p>
                        <ul style="margin: 0 0 10px 0; padding-left: 20px;">
                            ${(sol.actions || []).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                        <p style="margin: 0 0 5px 0;"><strong>Nguồn lực:</strong> ${sol.resources}</p>
                        <p style="margin: 0;"><strong>Rủi ro & Kiểm soát:</strong> ${sol.risks}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    <div class="a4-footer">INVAMAX www.invamax.com | Mã báo cáo: <span class="a4-code-placeholder"></span> | Trang 8 / 10</div>
</div>

<div class="a4-page">
    <div class="a4-header">
        <div><div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a;">INVA<span style="color:#f97316;">MAX</span></div></div>
        <div class="a4-title-center">BÁO CÁO CHI TIẾT<br>GIẢI PHÁP & LỘ TRÌNH</div>
        <div style="width: 160px;"></div>
    </div>
    <div class="a4-content">
        <div class="a4-section-title">9. LỘ TRÌNH TRIỂN KHAI 30-60-90 NGÀY <span style="float:right">Trang 9 / 10</span></div>
        <div class="a4-box" style="padding: 0; overflow: hidden; border: 1px solid #e2e8f0; background: #fff;">
            <table class="a4-table-issues" style="margin: 0;">
                <thead style="background: #0f172a; color: white;">
                    <tr>
                        <th style="color: white; width: 25%;">Giai đoạn</th>
                        <th style="color: white;">Mục tiêu</th>
                        <th style="color: white;">Hành động cốt lõi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="background: #fefce8; color: #ca8a04; font-weight: bold; border-right: 1px solid #e2e8f0;">30 Ngày Đầu (Ổn định)</td>
                        <td style="border-right: 1px solid #e2e8f0; font-size: 12px; color: #334155; padding: 10px;">${json.consulting.roadmap?.phase30Days?.goal || ''}</td>
                        <td style="font-size: 11px; color: #475569; padding: 10px;">
                            <ul style="padding-left: 15px; margin: 0;">${(json.consulting.roadmap?.phase30Days?.actions || []).map(a => `<li>${a}</li>`).join('')}</ul>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f0fdf4; color: #16a34a; font-weight: bold; border-right: 1px solid #e2e8f0;">60 Ngày (Chuẩn hóa)</td>
                        <td style="border-right: 1px solid #e2e8f0; font-size: 12px; color: #334155; padding: 10px;">${json.consulting.roadmap?.phase60Days?.goal || ''}</td>
                        <td style="font-size: 11px; color: #475569; padding: 10px;">
                            <ul style="padding-left: 15px; margin: 0;">${(json.consulting.roadmap?.phase60Days?.actions || []).map(a => `<li>${a}</li>`).join('')}</ul>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f8fafc; color: #3b82f6; font-weight: bold; border-right: 1px solid #e2e8f0;">90 Ngày (Duy trì)</td>
                        <td style="border-right: 1px solid #e2e8f0; font-size: 12px; color: #334155; padding: 10px;">${json.consulting.roadmap?.phase90Days?.goal || ''}</td>
                        <td style="font-size: 11px; color: #475569; padding: 10px;">
                            <ul style="padding-left: 15px; margin: 0;">${(json.consulting.roadmap?.phase90Days?.actions || []).map(a => `<li>${a}</li>`).join('')}</ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="a4-footer">INVAMAX www.invamax.com | Mã báo cáo: <span class="a4-code-placeholder"></span> | Trang 9 / 10</div>
</div>

<div class="a4-page">
    <div class="a4-header">
        <div><div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a;">INVA<span style="color:#f97316;">MAX</span></div></div>
        <div class="a4-title-center">BÁO CÁO CHI TIẾT<br>GIẢI PHÁP & LỘ TRÌNH</div>
        <div style="width: 160px;"></div>
    </div>
    <div class="a4-content">
        <div class="a4-section-title">10. CƠ CHẾ TRIỂN KHAI VÀ DUY TRÌ (RACI & SUSTAIN) <span style="float:right">Trang 10 / 10</span></div>
        
        <div class="a4-box" style="margin-bottom: 20px; background: #fff;">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #1e293b;"><i class="fas fa-users"></i> MA TRẬN PHÂN CÔNG (RACI)</h4>
            <table class="a4-table-issues" style="font-size: 11px; border: 1px solid #e2e8f0;">
                <thead style="background: #f1f5f9;">
                    <tr>
                        <th style="padding:8px;">Công việc</th>
                        <th style="text-align: center; padding:8px;">Giám đốc</th>
                        <th style="text-align: center; padding:8px;">Trưởng phòng</th>
                        <th style="text-align: center; padding:8px;">Tổ trưởng</th>
                        <th style="text-align: center; padding:8px;">Chuyên gia</th>
                    </tr>
                </thead>
                <tbody>
                    ${(json.consulting.raci || []).map(r => `
                    <tr>
                        <td style="color: #334155; padding:8px;">${r.task}</td>
                        <td style="text-align: center; font-weight: bold; padding:8px; color: ${r.R === 'Giám đốc' || r.A === 'Giám đốc' ? '#ea580c' : '#64748b'};">${r.R || '-'}</td>
                        <td style="text-align: center; font-weight: bold; padding:8px; color: ${r.A === 'Trưởng phòng' || r.R === 'Trưởng phòng' ? '#ea580c' : '#64748b'};">${r.A || '-'}</td>
                        <td style="text-align: center; font-weight: bold; padding:8px;">${r.C || '-'}</td>
                        <td style="text-align: center; font-weight: bold; padding:8px;">${r.I || '-'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="a4-box" style="background: #fff;">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #1e293b;"><i class="fas fa-shield-alt"></i> CƠ CHẾ KIỂM SOÁT VÀ DUY TRÌ (SUSTAIN)</h4>
            <ul style="font-size: 12px; color: #475569; padding-left: 20px; line-height: 1.6; margin: 0;">
                ${(json.consulting.sustainControls || []).map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
    </div>
    <div class="a4-footer">INVAMAX www.invamax.com | Mã báo cáo: <span class="a4-code-placeholder"></span> | Trang 10 / 10</div>
</div>
    `;
    
    document.getElementById('detailed-report').innerHTML = aiHtml;
}

