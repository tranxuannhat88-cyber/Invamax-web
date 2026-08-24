function generateReport() {
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
                diagnostic: { summary: "Dữ liệu mẫu", keyFindings: [], wasteAnalysis: "Dữ liệu mẫu phân tích lãng phí", symptomsAnalysis: "Dữ liệu mẫu phân tích dấu hiệu bất thường" },
                consulting: {
                    deepDiveCards: [
                        {module: "Flow", surveyReality: "Tồn kho bán thành phẩm (WIP) tăng cao và chờ đợi lệnh sản xuất.", aiInsight: "Flow kém khiến dòng chảy nguyên vật liệu đứt gãy. Tồn kho WIP không phải do khách hàng yêu cầu, mà là kết quả của việc các trạm sản xuất không đồng bộ nhịp độ.", businessImpact: "Ứ đọng dòng tiền, rủi ro hàng lỗi ngầm không phát hiện kịp thời."},
                        {module: "Capacity", surveyReality: "Làm thêm giờ liên tục và chạy lô lớn.", aiInsight: "Việc đánh giá năng lực Capacity thiếu dữ liệu chuẩn xác dẫn đến lập kế hoạch bị động, phải dùng biện pháp OT và lô lớn để bù đắp. Sự chênh lệch năng lực này là nguyên nhân gốc rễ gây dư thừa năng lực ảo.", businessImpact: "Tăng chi phí nhân công, giảm biên lợi nhuận."},
                        {module: "Standard", surveyReality: "Chất lượng không ổn định, nhiều khuyết tật.", aiInsight: "Thiếu tiêu chuẩn (Standard) thao tác dẫn đến công nhân làm theo thói quen. Bất cứ biến động nhỏ nào cũng gây ra lỗi, biểu hiện rõ nhất qua tỷ lệ khuyết tật cao.", businessImpact: "Tốn chi phí làm lại (Rework), uy tín sụt giảm."}
                    ],
                    quickWins: ["Sắp xếp và dọn dẹp hiện trường (Áp dụng 5S nhanh)", "Tổ chức họp Stand-up (Huddle meeting) 10 phút đầu giờ", "Thiết lập bảng Quản lý trực quan (Visual Management Board)", "Sắp xếp lại vị trí lưu trữ nguyên vật liệu", "Giao chuẩn mục tiêu theo giờ cho từng công đoạn"],
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
        
        // Render AI fields for pages 2, 3, 5
        
        
        const el_waste_analysis = document.getElementById('a4-waste-analysis');
        if (el_waste_analysis && scores.top3Wastes) {
            el_waste_analysis.innerHTML = scores.top3Wastes.map(modName => {
                let aiImpact = "Điểm nghẽn gây lãng phí nguồn lực cần khắc phục.";
                if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3WasteImpacts) {
                    const found = aiJsonData.diagnostic.top3WasteImpacts.find(x => x.module && x.module.toLowerCase() === modName.toLowerCase());
                    if (found) aiImpact = found.impact;
                }
                return `
                <div style="flex: 1; background: #fff1f2; border: 1px solid #ffe4e6; padding: 15px; border-radius: 8px; border-top: 4px solid #e11d48; display: flex; flex-direction: column;">
                    <div style="font-weight: 800; color: #be123c; font-size: 13px; margin-bottom: 8px; text-transform: uppercase;">${modName}</div>
                    <div style="font-size: 12px; color: #4c0519; line-height: 1.5; flex: 1;">${aiImpact}</div>
                </div>`;
            }).join('');
        }

        const el_symp_analysis = document.getElementById('a4-symptoms-analysis');
        if (el_symp_analysis && scores.top3Symptoms) {
            el_symp_analysis.innerHTML = scores.top3Symptoms.map(modName => {
                let aiImpact = "Dấu hiệu bất thường cần theo dõi và xử lý.";
                if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3SymptomImpacts) {
                    const found = aiJsonData.diagnostic.top3SymptomImpacts.find(x => x.module && x.module.toLowerCase() === modName.toLowerCase());
                    if (found) aiImpact = found.impact;
                }
                return `
                <div style="flex: 1; background: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 8px; border-top: 4px solid #ea580c; display: flex; flex-direction: column;">
                    <div style="font-weight: 800; color: #c2410c; font-size: 13px; margin-bottom: 8px; text-transform: uppercase;">${modName}</div>
                    <div style="font-size: 12px; color: #7c2d12; line-height: 1.5; flex: 1;">${aiImpact}</div>
                </div>`;
            }).join('');
        }

        const el_top3_fos = document.getElementById('a4-top3-fos');
        if (el_top3_fos && scores.top3FOS) {
            el_top3_fos.innerHTML = scores.top3FOS.map(modName => {
                const modInfo = getModuleInfo(modName);
                let aiImpact = "Điểm yếu hệ thống cần ưu tiên xử lý.";
                if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3FosImpacts) {
                    const found = aiJsonData.diagnostic.top3FosImpacts.find(x => x.module.toLowerCase() === modName.toLowerCase());
                    if (found) aiImpact = found.impact;
                }
                return `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 10px 15px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #e11d48; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: #e11d48; margin-bottom: 4px;">
                        <i class="fas ${modInfo.icon}"></i>
                        <span>${modName} (${modInfo.vi})</span>
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5;">${aiImpact}</div>
                </div>`;
            }).join('');
        }
        
        const el_quick = document.getElementById('a4-quick-wins');
        if(el_quick && aiJsonData.consulting.quickWins) {
            el_quick.innerHTML = aiJsonData.consulting.quickWins.map(qw => `<li>${qw}</li>`).join('');
        }
        
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
            top3Symptoms: scores.top3Symptoms,
            symptomsScores: scores.symptomsScores,
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
  "diagnostic": { "summary": "Tóm tắt tình trạng (1 đoạn)", "keyFindings": ["Phát hiện 1"], "confidence": 90, "fieldVerificationRequired": true, "wasteAnalysis": "Phân tích lãng phí (1 đoạn)", "top3WastesImpacts": [{"waste": "Tên lãng phí", "impact": "Nhận xét phân tích tác động dựa trên kết quả khảo sát chi tiết"}], "symptomsAnalysis": "Phân tích dấu hiệu bất thường (1 đoạn)", "top3SymptomsImpacts": [{"symptom": "Tên dấu hiệu", "impact": "Nhận xét phân tích tác động dựa trên kết quả khảo sát chi tiết"}], "fosAnalysis": "Đánh giá tổng quan tình trạng 11 module hệ điều hành (1 đoạn)", "top3FosImpacts": [{"module": "Tên module", "impact": "Tác động khi module này yếu kém"}] },
  "consulting": {
    "deepDiveCards": [
      {
        "module": "Tên 1 trong 3 Module FOS yếu nhất",
        "surveyReality": "Nhắc lại Dấu hiệu bất thường hoặc Lãng phí nghiêm trọng nhất mà nhà máy ĐANG gặp phải (lấy từ top3Symptoms và top3Wastes) CÓ LIÊN QUAN mật thiết đến module này.",
        "aiInsight": "Phân tích logic của chuyên gia: Tại sao sự yếu kém của Module này lại sinh ra bề nổi (dấu hiệu/lãng phí) kia? Nếu khách hàng đánh giá module rất thấp nhưng lại bảo KHÔNG CÓ lãng phí/dấu hiệu liên quan, hãy thẳng thắn chỉ ra sự mâu thuẫn và rủi ro tiềm ẩn (ngầm).",
        "businessImpact": "Tác động tiêu cực đến doanh thu, chi phí, năng lực cạnh tranh."
      }
    ],
    "quickWins": ["Hành động cầm máu 1 giải quyết ngay triệu chứng module 1", "Hành động cầm máu 2 giải quyết ngay lãng phí module 2", "Hành động cầm máu 3 giải quyết ngay bất thường module 3", "Hành động cầm máu 4...", "Hành động cầm máu 5..."],
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
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
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
                    Swal.fire('Lỗi API', 'Lỗi từ máy chủ Google (Thử lại thất bại): ' + err.message, 'error');
                    document.getElementById('ai-loading').style.display = 'none';
                    return;
                }
            }
        }

        renderDetailedReport(aiJsonData);
        
        // Render AI fields for pages 2, 3, 5
        
        
        const el_waste_analysis = document.getElementById('a4-waste-analysis');
        if (el_waste_analysis && scores.top3Wastes) {
            el_waste_analysis.innerHTML = scores.top3Wastes.map(modName => {
                let aiImpact = "Điểm nghẽn gây lãng phí nguồn lực cần khắc phục.";
                if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3WasteImpacts) {
                    const found = aiJsonData.diagnostic.top3WasteImpacts.find(x => x.module && x.module.toLowerCase() === modName.toLowerCase());
                    if (found) aiImpact = found.impact;
                }
                return `
                <div style="flex: 1; background: #fff1f2; border: 1px solid #ffe4e6; padding: 15px; border-radius: 8px; border-top: 4px solid #e11d48; display: flex; flex-direction: column;">
                    <div style="font-weight: 800; color: #be123c; font-size: 13px; margin-bottom: 8px; text-transform: uppercase;">${modName}</div>
                    <div style="font-size: 12px; color: #4c0519; line-height: 1.5; flex: 1;">${aiImpact}</div>
                </div>`;
            }).join('');
        }

        const el_symp_analysis = document.getElementById('a4-symptoms-analysis');
        if (el_symp_analysis && scores.top3Symptoms) {
            el_symp_analysis.innerHTML = scores.top3Symptoms.map(modName => {
                let aiImpact = "Dấu hiệu bất thường cần theo dõi và xử lý.";
                if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3SymptomImpacts) {
                    const found = aiJsonData.diagnostic.top3SymptomImpacts.find(x => x.module && x.module.toLowerCase() === modName.toLowerCase());
                    if (found) aiImpact = found.impact;
                }
                return `
                <div style="flex: 1; background: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 8px; border-top: 4px solid #ea580c; display: flex; flex-direction: column;">
                    <div style="font-weight: 800; color: #c2410c; font-size: 13px; margin-bottom: 8px; text-transform: uppercase;">${modName}</div>
                    <div style="font-size: 12px; color: #7c2d12; line-height: 1.5; flex: 1;">${aiImpact}</div>
                </div>`;
            }).join('');
        }

        const el_top3_fos = document.getElementById('a4-top3-fos');
        if (el_top3_fos && scores.top3FOS) {
            el_top3_fos.innerHTML = scores.top3FOS.map(modName => {
                const modInfo = getModuleInfo(modName);
                let aiImpact = "Điểm yếu hệ thống cần ưu tiên xử lý.";
                if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3FosImpacts) {
                    const found = aiJsonData.diagnostic.top3FosImpacts.find(x => x.module.toLowerCase() === modName.toLowerCase());
                    if (found) aiImpact = found.impact;
                }
                return `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 10px 15px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #e11d48; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: #e11d48; margin-bottom: 4px;">
                        <i class="fas ${modInfo.icon}"></i>
                        <span>${modName} (${modInfo.vi})</span>
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5;">${aiImpact}</div>
                </div>`;
            }).join('');
        }
        
        const el_quick = document.getElementById('a4-quick-wins');
        if(el_quick && aiJsonData.consulting.quickWins) {
            el_quick.innerHTML = aiJsonData.consulting.quickWins.map(qw => `<li>${qw}</li>`).join('');
        }
        
                // Update Code Placeholders
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