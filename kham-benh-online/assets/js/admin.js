const AI_CONFIG = {
    profile: "NEN_FOS_EXPERT",
    promptVersion: "NFE-SP-1.0",
    knowledgeVersion: "NFE-KB-1.0",
    mappingVersion: "NFE-MAP-1.0",
    scoringVersion: "NFE-SCORE-1.0",
    model: "gemini-3.6-flash"
};

const KNOWLEDGE_BASE_TEXT = `INVAMAX FOS KNOWLEDGE BASE:
1. 11 Module INVAMAX FOS (bắt buộc đúng thứ tự): Knowledge, Digital, Quality, People, Flow, Standard, Capacity, Daily Management, Core, Sustain, Kaizen.
2. Từ vựng chuẩn: Dùng 'Lãng phí nguồn lực' (không dùng Non-utilized Talent). Dùng 'Quy trình thừa' (không dùng Gia công thừa).
3. Tuyệt đối không bịa nguyên nhân gốc (Root Cause) nếu thiếu dữ liệu đầu vào.`;

document.addEventListener('DOMContentLoaded', () => {
    const p = document.getElementById('conf-profile');
    if(p) {
        p.innerText = AI_CONFIG.profile;
        const el_conf_prompt = document.getElementById('conf-prompt'); if(el_conf_prompt) el_conf_prompt.innerText = AI_CONFIG.promptVersion;
        const el_conf_kb = document.getElementById('conf-kb'); if(el_conf_kb) el_conf_kb.innerText = KNOWLEDGE_BASE_TEXT ? `Connected (${AI_CONFIG.knowledgeVersion})` : 'Not Connected';
        document.getElementById('conf-kb').style.color = KNOWLEDGE_BASE_TEXT ? '#10b981' : '#ef4444';
        const el_conf_model = document.getElementById('conf-model'); if(el_conf_model) el_conf_model.innerText = AI_CONFIG.model;
    }
});

function saveAuditLog(logData) {
    let logs = JSON.parse(localStorage.getItem('fos_audit_logs') || '[]');
    logs.unshift(logData);
    if (logs.length > 50) logs.pop();
    localStorage.setItem('fos_audit_logs', JSON.stringify(logs));
}

function showAuditLogs() {
    let logs = JSON.parse(localStorage.getItem('fos_audit_logs') || '[]');
    if (logs.length === 0) {
        Swal.fire('Audit Logs', 'Chưa có log nào.', 'info');
        return;
    }
    let html = '<div style="max-height: 400px; overflow-y: auto; text-align: left; font-size: 12px; font-family: monospace;">';
    logs.forEach(l => {
        html += `<div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
            <strong>Time:</strong> ${new Date(l.generatedAt).toLocaleString()}<br>
            <strong>Request ID:</strong> ${l.requestId}<br>
            <strong>Model:</strong> ${l.model}<br>
            <strong>Prompt Hash:</strong> ${l.promptHash}<br>
            <strong>Status:</strong> <span style="color:${l.error ? 'red' : 'green'}">${l.error ? 'FAILED' : 'SUCCESS'}</span> (Retries: ${l.retries})<br>
            <strong>Processing Time:</strong> ${l.processingTimeMs} ms<br>
            ${l.error ? `<strong>Error:</strong> ${l.error}<br>` : ''}
            <details><summary style="cursor:pointer; color:#3b82f6;">Xem Chi Tiết Input/Output</summary>
               <strong>Input Hash:</strong> ${l.inputHash}<br>
               <strong>Output JSON:</strong>
               <pre style="background:#f1f5f9; padding:5px; border-radius:4px;">${JSON.stringify(l.output, null, 2)}</pre>
            </details>
        </div>`;
    });
    html += '</div>';
    Swal.fire({ title: 'AI Audit Logs', html: html, width: 800 });
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash; 
    }
    return new Uint32Array([hash])[0].toString(36);
}

async function testAIProfile() {
    if (!KNOWLEDGE_BASE_TEXT) {
        Swal.fire('Lỗi', 'CONFIGURATION_NOT_VALID: Thiếu Knowledge Base.', 'error');
        return;
    }
    
    const apiKey = document.getElementById('apiKey')?.value;
    if (!apiKey) {
        Swal.fire('Lỗi', 'Vui lòng nhập API Key để chạy Test.', 'error');
        return;
    }
    
    Swal.fire({
        title: 'Đang kiểm tra AI Profile...',
        html: 'Gửi Test Payload tới Gemini (Ép lỗi & Kiểm tra chuẩn từ vựng)...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    const testPayload = {
        factoryHealthIndex: null,
        diseaseScore: null,
        top3Wastes: ["Non-utilized Talent", "Gia công thừa", "Chờ đợi"],
        top3Symptoms: [],
        businessPriority: null
    };

    const systemPrompt = `BẠN LÀ CHUYÊN GIA TƯ VẤN QUẢN TRỊ SẢN XUẤT TINH GỌN (LEAN MANUFACTURING) VÀ HỆ ĐIỀU HÀNH FOS CỦA INVAMAX.
TUÂN THỦ KIẾN THỨC SAU:
${KNOWLEDGE_BASE_TEXT}

Dữ liệu đầu vào (Cố tình thiếu & sai chuẩn):
${JSON.stringify(testPayload, null, 2)}

YÊU CẦU TEST:
1. Trả về đúng JSON theo Schema ở dưới.
2. Liệt kê đủ 11 module FOS trong mảng "modulesList" thuộc phần "diagnostic".
3. Phát hiện lỗi từ vựng ở top3Wastes và sửa thành đúng chuẩn INVAMAX FOS trong phần "diagnostic.correctedWastes" (Phải dùng đúng "Lãng phí nguồn lực" và "Quy trình thừa").
4. Ở phần "consulting.rootCauses", nếu đầu vào không có thông tin để suy luận, phải để mảng rỗng (không được bịa).

JSON SCHEMA BẮT BUỘC:
{
  "diagnostic": { "modulesList": ["Tên module..."], "correctedWastes": ["Tên đã sửa..."] },
  "consulting": { "rootCauses": [] },
  "report": { "status": "TEST_MODE" }
}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
            })
        });

        if (!response.ok) throw new Error("API Error: " + response.statusText);
        const aiData = await response.json();
        const jsonText = aiData.candidates[0].content.parts[0].text;
        const result = JSON.parse(jsonText);

        let errors = [];
        const requiredModules = ["Knowledge", "Digital", "Quality", "People", "Flow", "Standard", "Capacity", "Daily Management", "Core", "Sustain", "Kaizen"];
        
        if (!result.diagnostic || !result.diagnostic.modulesList || result.diagnostic.modulesList.join(',') !== requiredModules.join(',')) {
            errors.push("- Sai 11 module hoặc sai thứ tự.");
        }
        
        const wastes = result.diagnostic?.correctedWastes || [];
        if (!wastes.includes("Lãng phí nguồn lực") || !wastes.includes("Quy trình thừa")) {
            errors.push("- Không nhận diện và sửa đúng từ vựng chuẩn (Lãng phí nguồn lực, Quy trình thừa).");
        }

        if (result.consulting && result.consulting.rootCauses && result.consulting.rootCauses.length > 0) {
            errors.push("- AI bịa nguyên nhân gốc (Root Cause) khi thiếu dữ liệu đầu vào.");
        }

        if (errors.length === 0) {
            Swal.fire('PASS', 'AI Profile đã vượt qua mọi bài kiểm tra khắt khe của INVAMAX FOS Expert!', 'success');
        } else {
            Swal.fire('FAIL', 'AI Profile trượt bài test:<br><br>' + errors.join('<br>'), 'error');
        }

    } catch (e) {
        Swal.fire('Lỗi', 'Test thất bại: ' + e.message, 'error');
    }
}
// admin.js
const LS_API_KEY = 'openai_api_key';

document.addEventListener('DOMContentLoaded', async () => {
    // Load API Key
    const savedKey = localStorage.getItem(LS_API_KEY);
    if (savedKey) document.getElementById('apiKey').value = savedKey;
});

function saveApiKey() {
    const key = document.getElementById('apiKey').value.trim();
    if (key) {
        localStorage.setItem(LS_API_KEY, key);
        Swal.fire('Thành công', 'Đã lưu API Key!', 'success');
    }
}

// Replicate calculateResults from app_combined.js
function calculateResults(answers) {
    const getGroupScore = (group) => {
        let totalWeightedScore = 0;
        let totalWeights = 0;
        
        group.forEach(q => {
            if (answers[q.id] !== undefined && q.trongSo !== undefined && q.trongSo > 0) {
                const ansStr = String(answers[q.id]);
                if (ansStr.trim() !== "") {
                    let score = 0;
                    if (q.loaiTraLoi === 'Thang điểm 0-4' || (q.dapAn && q.dapAn.length > 0 && !q.loaiTraLoi.includes('Nhiều lựa chọn'))) {
                        score = parseInt(ansStr);
                    } else {
                        score = parseInt(ansStr);
                    }
                    if (!isNaN(score)) {
                        totalWeightedScore += score * q.trongSo;
                        totalWeights += q.trongSo;
                    }
                }
            }
        });
        
        return totalWeights > 0 ? (totalWeightedScore / totalWeights) : 0;
    };

    let wScore = getGroupScore(AppQuestions.partB);
    let sScore = getGroupScore(AppQuestions.partC);
    let mScore = getGroupScore(AppQuestions.partD);
    
    // Scale 0-4 to 0-100 (where 4 = worst = 100)
    let warningScore = ((wScore * 0.4 + sScore * 0.4 + mScore * 0.2) / 4) * 100;
    warningScore = Math.round(warningScore);

    const wasteScores = [];
    const wasteModules = [...new Set(AppQuestions.partB.map(q => q.nhom))];
    wasteModules.forEach(module => {
        const questions = AppQuestions.partB.filter(q => q.nhom === module);
        wasteScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 0 : Math.round((getGroupScore(questions) / 4) * 100)
        });
    });

    const fosScores = [];
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
    const top3Symptoms = symptomsScores.slice(0, 3).map(item => item.module);

    let assessmentLevel = "";
    let generalAssessment = "";
    let diseases = [];
    let nextSteps = "";

    let healthScore = 100 - warningScore;

    if (healthScore >= 80) {
        assessmentLevel = "Khỏe mạnh";
        generalAssessment = "Hệ thống vận hành trơn tru, tiêu chuẩn được duy trì tốt. Doanh nghiệp có nền tảng vững chắc để mở rộng hoặc chuyển đổi số.";
        diseases = ["Không phát hiện bệnh nghiêm trọng"];
        nextSteps = "Tiếp tục cải tiến liên tục (Kaizen) và bắt đầu số hóa các quy trình cốt lõi.";
    } else if (healthScore >= 60) {
        assessmentLevel = "Cảnh báo nhẹ";
        generalAssessment = "Hệ thống cơ bản hoạt động nhưng đã xuất hiện các điểm nghẽn và lãng phí rải rác. Nếu không xử lý kịp thời có thể làm giảm biên lợi nhuận.";
        diseases = ["Lãng phí tiềm ẩn", "Quy trình chưa chuẩn hóa đồng bộ"];
        nextSteps = "Tập trung chuẩn hóa quy trình tại các điểm nghẽn, đào tạo lại nhân sự về tiêu chuẩn.";
    } else if (healthScore >= 40) {
        assessmentLevel = "Mắc bệnh (Cần điều trị)";
        generalAssessment = "Rối loạn hệ thống hiện diện rõ. Lãng phí xảy ra thường xuyên làm tăng chi phí và ảnh hưởng đến tiến độ, chất lượng giao hàng.";
        diseases = ["Tắc nghẽn cục bộ", "Lỗi và làm lại thường xuyên", "Chỉ số OEE thấp"];
        nextSteps = "Thực hiện dự án cải tiến điểm (Kaizen Blitz) tại khu vực yếu nhất, xây dựng lại hệ thống đo lường hiệu quả.";
    } else if (healthScore >= 20) {
        assessmentLevel = "Bệnh nặng (Nguy hiểm)";
        generalAssessment = "Hệ thống vận hành lỏng lẻo, chi phí sản xuất mất kiểm soát. Doanh nghiệp đang đối mặt với rủi ro lớn về dòng tiền và phàn nàn từ khách hàng.";
        diseases = ["Rối loạn luồng chảy", "Mất kiểm soát chất lượng diện rộng", "Tồn kho quá mức/Thiếu vật tư liên tục"];
        nextSteps = "Cần chuyên gia can thiệp ngay lập tức. Tái thiết lập luồng giá trị và áp dụng các biện pháp kiểm soát khẩn cấp.";
    } else {
        assessmentLevel = "Báo động đỏ (Nguy kịch)";
        generalAssessment = "Hệ thống đang trong tình trạng khủng hoảng. Rủi ro đứt gãy dây chuyền cực kỳ cao và gây thiệt hại nghiêm trọng.";
        diseases = ["Mất kiểm soát hoàn toàn chất lượng và tiến độ", "Đứt gãy toàn bộ chuỗi cung ứng nội bộ", "Thiếu hụt hoàn toàn khả năng quản trị hiện trường"];
        nextSteps = "Dừng ngay các hoạt động lãng phí, triệu tập ban lãnh đạo để tái cơ cấu toàn diện hệ thống quản lý.";
    }

    const sortDesc = (a, b) => b.score - a.score;
    wasteScores.sort(sortDesc);
    fosScores.sort((a, b) => a.score - b.score);

    const top3Wastes = wasteScores.slice(0, 3).map(item => item.module);
    const top3FOS = fosScores.slice(0, 3).map(item => item.module);

    
    let pWaste = Math.round((wScore / 4) * 100);
    let pSymptoms = Math.round((sScore / 4) * 100);
    let pFos = 100 - Math.round((mScore / 4) * 100);
    return { warningScore, assessmentLevel, generalAssessment, diseases, nextSteps, top3Wastes, top3FOS, wasteScores, fosScores, symptomsScores, top3Symptoms, pWaste, pSymptoms, pFos };
    
}

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

function generatePageHeader(title, subtitle, pageNum, maxPage = 7) {
    return `
    <div class="a4-header" style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 12px; border-bottom: 2px solid #ea580c; margin-bottom: 10px;">
        <div style="width: 250px;">
            <div class="a4-logo" style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: 1px; margin-bottom: 2px;">INVAMAX</div>
            <div style="font-size: 13px; font-weight: bold; color: #ea580c;">Factory Diagnosis&trade;</div>
        </div>
        <div style="flex: 1; text-align: right;">
            <div style="font-size: 18px; font-weight: 800; color: #1e293b; text-transform: uppercase;">HỒ SƠ KHÁM BỆNH NHÀ MÁY ONLINE</div>
            <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">THEO HỆ ĐIỀU HÀNH INVAMAX FOS</div>
        </div>
    </div>
    <div class="a4-section-title" style="background: #1e293b; color: white; padding: 12px 20px; font-size: 15px; font-weight: bold; border-radius: 8px; margin-bottom: 10px; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <span>${pageNum}. ${title}</span>
    </div>
    `;
}

function generatePageFooter(pageNum, maxPage = 7) {
    return `
    <div class="a4-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #e2e8f0; margin-top: auto; font-size: 11px; color: #64748b; font-weight: 500;">
        <div style="display: flex; gap: 12px;">
            <span style="font-weight: bold; color: #0f172a;">INVAMAX</span>
            <span>|</span>
            <span style="color: #ea580c; font-weight: bold;">Factory Diagnosis&trade;</span>
            <span>|</span>
            <span>invamax.com</span>
        </div>
        <div>Trang ${pageNum} / ${maxPage}</div>
    </div>
    `;
}



const getColorConfig = (score, isHealth) => {
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
const getModuleInfo = (modName) => {
    const m = modName.toLowerCase();
    if(m.includes('core')) return {vi: 'Cốt lõi', icon: 'fa-bullseye'};
    if(m.includes('people')) return {vi: 'Con người', icon: 'fa-users'};
    if(m.includes('flow')) return {vi: 'Dòng chảy', icon: 'fa-water'};
    if(m.includes('standard')) return {vi: 'Tiêu chuẩn', icon: 'fa-ruler-combined'};
    if(m.includes('capacity')) return {vi: 'Năng lực', icon: 'fa-cogs'};
    if(m.includes('daily management')) return {vi: 'Quản trị hằng ngày', icon: 'fa-calendar-check'};
    if(m.includes('quality')) return {vi: 'Chất lượng', icon: 'fa-check-circle'};
    if(m.includes('knowledge')) return {vi: 'Tri thức', icon: 'fa-book-open'};
    if(m.includes('digital')) return {vi: 'Số hóa', icon: 'fa-laptop-code'};
    if(m.includes('kaizen')) return {vi: 'Cải tiến', icon: 'fa-arrow-trend-up'};
    if(m.includes('sustain')) return {vi: 'Duy trì', icon: 'fa-shield-alt'};
    return {vi: modName, icon: 'fa-layer-group'};
};

const getSymptomIcon = (symptomName) => {
    const s = symptomName.toLowerCase();
    if(s.includes('thông tin')) return 'fa-unlink';
    if(s.includes('dữ liệu')) return 'fa-database';
    if(s.includes('chữa cháy')) return 'fa-fire-extinguisher';
    if(s.includes('cải tiến')) return 'fa-history';
    if(s.includes('kế hoạch')) return 'fa-calendar-times';
    if(s.includes('tiêu chuẩn')) return 'fa-ruler-combined';
    if(s.includes('nguồn lực')) return 'fa-battery-empty';
    if(s.includes('dòng chảy')) return 'fa-pause-circle';
    return 'fa-exclamation-circle';
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
        if (score >= 80) return { bg: '#f8fafc', border: '#e2e8f0', color: '#334155', trendText: 'Rất tệ' };
        if (score >= 60) return { bg: '#fef2f2', border: '#fee2e2', color: '#ef4444', trendText: 'Tệ' };
        if (score >= 40) return { bg: '#fff7ed', border: '#ffedd5', color: '#ea580c', trendText: 'Trung bình' };
        if (score >= 20) return { bg: '#fefce8', border: '#fef08a', color: '#eab308', trendText: 'Khá' };
        return { bg: '#f0fdf4', border: '#dcfce7', color: '#10b981', trendText: 'Tốt' };
    };


function renderRawDataReview(scores, rawAnswers) {
    const el1 = document.getElementById('a4-raw-data-review');
    const el2 = document.getElementById('a4-raw-data-review-2');
    if(!el1 || !el2 || !scores || !scores.top3FOS || !rawAnswers) return;

    const moduleMapping = {
        "Flow": { wastes: ["Sản xuất thừa", "Chờ đợi", "Vận chuyển", "Tồn kho"], symptoms: ["Trì hoãn và tiến độ chậm", "Thông tin phối hợp không thông suốt"] },
        "Capacity": { wastes: ["Chờ đợi", "Không khai thác hết nguồn lực"], symptoms: ["Kế hoạch bất ổn", "Quản trị hiện trường mang tính chữa cháy"] },
        "Standard": { wastes: ["Lỗi và làm lại", "Thao tác", "Gia công thừa"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy", "Môi trường làm việc thiếu an toàn, lộn xộn"] },
        "Quality": { wastes: ["Lỗi và làm lại"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy"] },
        "People": { wastes: ["Không khai thác hết nguồn lực", "Thao tác"], symptoms: ["Quản trị hiện trường mang tính chữa cháy"] },
        "Daily Management": { wastes: ["Chờ đợi", "Gia công thừa"], symptoms: ["Quản trị hiện trường mang tính chữa cháy", "Thông tin phối hợp không thông suốt"] },
        "Sustain": { wastes: ["Không khai thác hết nguồn lực"], symptoms: ["Môi trường làm việc thiếu an toàn, lộn xộn"] },
        "Kaizen": { wastes: ["Gia công thừa"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy"] },
        "Knowledge": { wastes: ["Lỗi và làm lại", "Không khai thác hết nguồn lực"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy"] },
        "Digital": { wastes: ["Chờ đợi"], symptoms: ["Dữ liệu và quyết định thiếu tin cậy", "Thông tin phối hợp không thông suốt"] },
        "Core": { wastes: ["Không khai thác hết nguồn lực"], symptoms: ["Kế hoạch bất ổn"] }
    };

    const top3 = scores.top3FOS; 
    let html1 = '';
    let html2 = '';
    
    top3.forEach((module, index) => {
        const qFOS = AppQuestions.partD.filter(q => q.nhom === module);
        const mapData = moduleMapping[module] || { wastes: [], symptoms: [] };
        
        let relatedSymptoms = (scores.symptomsScores || []).filter(s => mapData.symptoms.includes(s.module)).sort((a,b)=>b.score - a.score);
        let relatedWastes = (scores.wasteScores || []).filter(w => mapData.wastes.includes(w.module)).sort((a,b)=>b.score - a.score);

        if (relatedSymptoms.length === 0 && scores.symptomsScores) { relatedSymptoms = scores.symptomsScores.slice(0, 2); }
        if (relatedWastes.length === 0 && scores.wasteScores) { relatedWastes = scores.wasteScores.slice(0, 2); }

        const renderQList = (qList) => {
            if(!qList || qList.length === 0) return '<div style="color:#94a3b8; font-style:italic;">Không có dữ liệu</div>';
            return qList.map(q => {
                let ansText = rawAnswers[q.id] !== undefined ? rawAnswers[q.id] : 'Chưa trả lời';
                const ansIdx = parseInt(ansText);
                if(q.dapAn && q.dapAn.length > 0 && !isNaN(ansIdx) && q.loaiTraLoi !== 'Điền số') {
                    if(q.dapAn[ansIdx] !== undefined) ansText = q.dapAn[ansIdx];
                }
                if (Array.isArray(rawAnswers[q.id])) {
                    ansText = rawAnswers[q.id].map(idx => {
                        const i = parseInt(idx);
                        return (!isNaN(i) && q.dapAn[i]) ? q.dapAn[i] : idx;
                    }).join(', ');
                }
                return `<div style="margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                            <div style="font-weight: 500; margin-bottom: 4px; color: #334155; line-height: 1.3;">${q.cauHoi}</div>
                            <div style="color: #ef4444; font-size: 10px; font-weight: bold;"><i class="fas fa-check-circle" style="margin-right:4px;"></i>KH Chọn: ${ansText}</div>
                        </div>`;
            }).join('');
        };

        const renderRelated = (items, type) => {
            if(!items || items.length === 0) return '<div style="color:#94a3b8; font-style:italic;">Không có dữ liệu</div>';
            return items.map(item => `
                <div style="margin-bottom: 10px; background: white; border: 1px solid #f1f5f9; padding: 8px; border-radius: 6px;">
                    <div style="font-weight: bold; color: #334155; margin-bottom: 4px;">${item.module}</div>
                    <div style="color: #ef4444; font-size: 10px; font-weight: bold;">Điểm ${type}: ${item.score}/100</div>
                </div>
            `).join('');
        };

        let cardHtml = `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 10px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="color: #0f172a; font-weight: 900; font-size: 13px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase;">KHÁM MODULE: <span style="color:#ef4444;">${module}</span></div>
            <div style="display: flex; gap: 15px;">
                <div style="flex: 3;">
                    <div style="color: #475569; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #f8fafc; padding: 4px; border-radius: 4px;">1. ĐÁNH GIÁ MODULE</div>
                    ${renderQList(qFOS)}
                </div>
                <div style="flex: 2; border-left: 1px dashed #cbd5e1; padding-left: 15px;">
                    <div style="color: #b45309; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #fef3c7; padding: 4px; border-radius: 4px;">2. DẤU HIỆU LIÊN QUAN</div>
                    ${renderRelated(relatedSymptoms, "bất thường")}
                </div>
                <div style="flex: 2; border-left: 1px dashed #cbd5e1; padding-left: 15px;">
                    <div style="color: #c2410c; font-size: 9px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; background: #ffedd5; padding: 4px; border-radius: 4px;">3. LÃNG PHÍ LIÊN QUAN</div>
                    ${renderRelated(relatedWastes, "lãng phí")}
                </div>
            </div>
        </div>
        `;
        
        if (index < 2) {
            html1 += cardHtml;
        } else {
            html2 += cardHtml;
        }
    });
    
    el1.innerHTML = html1;
    el2.innerHTML = html2;
}


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

function renderDetailedReport(json, metadata) {
    if (!json) return;
    const el = document.getElementById('detailed-report');
    if (!el) return;
    
    const styles = `
        <style>
            .p610-box { border: 1px solid #e2e8f0; border-radius: 8px; background: white; margin-bottom: 15px; overflow: hidden; }
            .p610-header { padding: 8px 15px; font-weight: bold; font-size: 14px; color: white; display:flex; align-items:center; }
            .p610-flex { display: flex; }
            .p610-row { display: flex; margin-bottom: 10px; }
            .p6-cause-chain { display: flex; flex: 1; align-items: stretch; border: 1px solid #e2e8f0; border-radius: 8px; margin-right: 15px; background: white;}
            .p6-col { flex: 1; padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; position: relative; }
            .p6-arrow { position: absolute; right: -12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #94a3b8; z-index: 2; background: white; width: 24px; text-align: center;}
            .p6-col-title { font-size: 10px; font-weight: bold; color: #475569; text-transform: uppercase; margin-bottom: 10px; }
            .p6-icon-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 8px; }
            .p6-text { font-size: 11px; color: #1e293b; font-weight: 500; }
            .p6-score { font-size: 12px; font-weight: bold; margin-top: 5px; }
            .p6-right-col { width: 200px; display: flex; flex-direction: column; gap: 10px; }
            .p6-verify-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: white; }
            .p6-verify-title { font-size: 10px; font-weight: bold; color: #0f172a; text-align: center; margin-bottom: 8px; }
            
            .c-red { color: #ef4444; } .bg-red { background: #ef4444; color: white; } .bg-red-light { background: #fee2e2; color: #ef4444; }
            .c-orange { color: #f97316; } .bg-orange { background: #f97316; color: white; } .bg-orange-light { background: #ffedd5; color: #f97316; }
            .c-green { color: #22c55e; } .bg-green { background: #22c55e; color: white; } .bg-green-light { background: #dcfce7; color: #22c55e; }
            .c-blue { color: #3b82f6; } .bg-blue { background: #3b82f6; color: white; } .bg-blue-light { background: #dbeafe; color: #3b82f6; }
        </style>
    `;

    let html = styles;

    // PAGE 6
    html += `
    <div class="a4-page">
        ${generatePageHeader('6. PHÂN TÍCH NGUYÊN NHÂN & CHUỖI TÁC ĐỘNG', 'Top 3 chuỗi nguyên nhân hệ thống ảnh hưởng lớn nhất đến hiệu suất vận hành', 6, 10)}
        <div class="a4-content">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; display: flex; align-items: center; margin-bottom: 10px;">
                <div style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">i</div>
                <div style="font-size: 12px; color: #1e293b;">
                    Phân tích được thực hiện dựa trên kết quả khảo sát online (94 câu hỏi) theo hệ điều hành INVAMAX FOS.<br>
                    Các nguyên nhân dưới đây là nguyên nhân hệ thống có khả năng cao, cần được xác minh tại hiện trường.
                </div>
            </div>
            
            <!-- Item 1 -->
            <div class="p610-row">
                <div class="p6-cause-chain">
                    <div style="position: absolute; left: 0; top: -12px; background: white; padding-right: 10px; display: flex; align-items: center;">
                        <div class="bg-red" style="padding: 2px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px;">1</div>
                        <div class="c-red" style="font-weight: bold; font-size: 13px; text-transform: uppercase;">LÃNG PHÍ CHỜ ĐỢI &nbsp;|&nbsp; 3,6/4</div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">LÃNG PHÍ</div>
                        <div class="p6-icon-circle bg-red-light"><i class="fas fa-clock"></i></div>
                        <div class="p6-text">Chờ đợi</div>
                        <div class="p6-score c-red">3,6/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">DẤU HIỆU BẤT THƯỜNG</div>
                        <div class="p6-icon-circle bg-red-light"><i class="fas fa-calendar-times"></i></div>
                        <div class="p6-text">Kế hoạch thay đổi thường xuyên</div>
                        <div class="p6-score c-red">3,4/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">MODULE LIÊN QUAN</div>
                        <div style="display:flex; gap:10px;">
                            <div style="text-align:center;">
                                <div class="p6-icon-circle bg-blue-light" style="margin:0 auto 5px;"><i class="fas fa-chart-bar"></i></div>
                                <div class="p6-text" style="font-size:10px;">Capacity<br>(Năng lực)</div>
                            </div>
                            <div style="text-align:center;">
                                <div class="p6-icon-circle bg-blue-light" style="margin:0 auto 5px;"><i class="fas fa-users-cog"></i></div>
                                <div class="p6-text" style="font-size:10px;">Daily Mgt<br>(Quản trị)</div>
                            </div>
                        </div>
                        <div class="p6-score c-blue" style="margin-top:10px;">3,5/4 &nbsp; 3,1/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title c-orange">NGUYÊN NHÂN HỆ THỐNG</div>
                        <div class="p6-icon-circle bg-orange-light"><i class="fas fa-cog"></i></div>
                        <div class="p6-text" style="text-align:left;">Kế hoạch chưa bám sát năng lực thực tế, thay đổi liên tục. Cơ chế theo dõi xử lý sai lệch hàng ngày chưa hiệu quả.</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="padding-top: 15px; align-items: flex-start; text-align: left;">
                        <div class="p6-col-title c-green">TÁC ĐỘNG CHÍNH</div>
                        <div class="p6-icon-circle bg-green-light" style="margin:0 auto 10px;"><i class="fas fa-bullseye"></i></div>
                        <ul style="font-size:11px; padding-left:15px; margin:0; line-height:1.5;">
                            <li>Lead time tăng</li>
                            <li>Giao hàng trễ</li>
                            <li>Tăng ca</li>
                            <li>Chi phí tăng</li>
                        </ul>
                    </div>
                </div>
                
                <div class="p6-right-col">
                    <div class="p6-verify-box">
                        <div class="p6-verify-title">ĐỘ TIN CẬY</div>
                        <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
                            <div class="p6-icon-circle bg-blue" style="width:30px; height:30px; font-size:14px; margin:0;"><i class="fas fa-shield-alt"></i></div>
                            <div>
                                <div class="c-red" style="font-size:12px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star text-gray-300"></i></div>
                                <div style="font-size:11px; font-weight:bold; text-align:center;">Cao</div>
                            </div>
                        </div>
                    </div>
                    <div class="p6-verify-box" style="flex:1;">
                        <div class="p6-verify-title">CẦN XÁC MINH</div>
                        <ul style="list-style:none; padding:0; margin:0; font-size:11px; line-height:1.5;">
                            <li style="margin-bottom:6px;"><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Tỷ lệ thay đổi kế hoạch</li>
                            <li style="margin-bottom:6px;"><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Tỷ lệ hoàn thành KH</li>
                            <li><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Cơ chế điều độ, xử lý</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Item 2 -->
            <div class="p610-row">
                <div class="p6-cause-chain">
                    <div style="position: absolute; left: 0; top: -12px; background: white; padding-right: 10px; display: flex; align-items: center;">
                        <div class="bg-orange" style="padding: 2px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px;">2</div>
                        <div class="c-orange" style="font-weight: bold; font-size: 13px; text-transform: uppercase;">LÃNG PHÍ LỖI & LÀM LẠI &nbsp;|&nbsp; 3,5/4</div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">LÃNG PHÍ</div>
                        <div class="p6-icon-circle bg-orange-light"><i class="fas fa-times-circle"></i></div>
                        <div class="p6-text">Lỗi & làm lại</div>
                        <div class="p6-score c-orange">3,5/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">DẤU HIỆU BẤT THƯỜNG</div>
                        <div class="p6-icon-circle bg-orange-light"><i class="fas fa-clipboard-list"></i></div>
                        <div class="p6-text">Sai lỗi chất lượng xảy ra thường xuyên</div>
                        <div class="p6-score c-orange">3,3/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">MODULE LIÊN QUAN</div>
                        <div style="display:flex; gap:10px;">
                            <div style="text-align:center;">
                                <div class="p6-icon-circle bg-blue-light" style="margin:0 auto 5px;"><i class="fas fa-check-shield"></i></div>
                                <div class="p6-text" style="font-size:10px;">Quality<br>(Chất lượng)</div>
                            </div>
                            <div style="text-align:center;">
                                <div class="p6-icon-circle bg-blue-light" style="margin:0 auto 5px;"><i class="fas fa-file-alt"></i></div>
                                <div class="p6-text" style="font-size:10px;">Standard<br>(Tiêu chuẩn)</div>
                            </div>
                        </div>
                        <div class="p6-score c-blue" style="margin-top:10px;">3,4/4 &nbsp; 2,9/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title c-orange">NGUYÊN NHÂN HỆ THỐNG</div>
                        <div class="p6-icon-circle bg-orange-light"><i class="fas fa-cog"></i></div>
                        <div class="p6-text" style="text-align:left;">Tiêu chuẩn công việc chưa rõ ràng, chưa kiểm soát tuân thủ. Kiểm tra chất lượng tại nguồn chưa hiệu quả.</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="padding-top: 15px; align-items: flex-start; text-align: left;">
                        <div class="p6-col-title c-green">TÁC ĐỘNG CHÍNH</div>
                        <div class="p6-icon-circle bg-green-light" style="margin:0 auto 10px;"><i class="fas fa-bullseye"></i></div>
                        <ul style="font-size:11px; padding-left:15px; margin:0; line-height:1.5;">
                            <li>Tỷ lệ lỗi nội bộ cao</li>
                            <li>Làm lại & sửa chữa</li>
                            <li>Kéo dài thời gian SX</li>
                            <li>Chi phí chất lượng tăng</li>
                        </ul>
                    </div>
                </div>
                
                <div class="p6-right-col">
                    <div class="p6-verify-box">
                        <div class="p6-verify-title">ĐỘ TIN CẬY</div>
                        <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
                            <div class="p6-icon-circle bg-blue" style="width:30px; height:30px; font-size:14px; margin:0;"><i class="fas fa-shield-alt"></i></div>
                            <div>
                                <div class="c-orange" style="font-size:12px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i><i class="far fa-star text-gray-300"></i></div>
                                <div style="font-size:11px; font-weight:bold; text-align:center;">Trung bình - Cao</div>
                            </div>
                        </div>
                    </div>
                    <div class="p6-verify-box" style="flex:1;">
                        <div class="p6-verify-title">CẦN XÁC MINH</div>
                        <ul style="list-style:none; padding:0; margin:0; font-size:11px; line-height:1.5;">
                            <li style="margin-bottom:6px;"><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Tỷ lệ lỗi theo công đoạn</li>
                            <li style="margin-bottom:6px;"><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Tình trạng sử dụng SOP</li>
                            <li><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Cơ chế kiểm tra tại nguồn</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Item 3 -->
            <div class="p610-row">
                <div class="p6-cause-chain">
                    <div style="position: absolute; left: 0; top: -12px; background: white; padding-right: 10px; display: flex; align-items: center;">
                        <div class="bg-green" style="padding: 2px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px;">3</div>
                        <div class="c-green" style="font-weight: bold; font-size: 13px; text-transform: uppercase;">LÃNG PHÍ TỒN KHO &nbsp;|&nbsp; 3,2/4</div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">LÃNG PHÍ</div>
                        <div class="p6-icon-circle bg-green-light"><i class="fas fa-box"></i></div>
                        <div class="p6-text">Tồn kho</div>
                        <div class="p6-score c-green">3,2/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">DẤU HIỆU BẤT THƯỜNG</div>
                        <div class="p6-icon-circle bg-green-light"><i class="fas fa-warehouse"></i></div>
                        <div class="p6-text">Tồn kho nguyên vật liệu & WIP cao</div>
                        <div class="p6-score c-green">3,2/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title">MODULE LIÊN QUAN</div>
                        <div style="display:flex; gap:10px;">
                            <div style="text-align:center;">
                                <div class="p6-icon-circle bg-blue-light" style="margin:0 auto 5px;"><i class="fas fa-industry"></i></div>
                                <div class="p6-text" style="font-size:10px;">Flow<br>(Dòng chảy)</div>
                            </div>
                            <div style="text-align:center;">
                                <div class="p6-icon-circle bg-blue-light" style="margin:0 auto 5px;"><i class="fas fa-chart-bar"></i></div>
                                <div class="p6-text" style="font-size:10px;">Capacity<br>(Năng lực)</div>
                            </div>
                        </div>
                        <div class="p6-score c-blue" style="margin-top:10px;">3,3/4 &nbsp; 3,5/4</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="border-right: 1px solid #e2e8f0; padding-top: 15px;">
                        <div class="p6-col-title c-orange">NGUYÊN NHÂN HỆ THỐNG</div>
                        <div class="p6-icon-circle bg-orange-light"><i class="fas fa-cog"></i></div>
                        <div class="p6-text" style="text-align:left;">Dòng chảy chưa tối ưu, chưa xác định điểm kéo. Kế hoạch mua và sản xuất chưa đồng bộ.</div>
                        <div class="p6-arrow"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="p6-col" style="padding-top: 15px; align-items: flex-start; text-align: left;">
                        <div class="p6-col-title c-green">TÁC ĐỘNG CHÍNH</div>
                        <div class="p6-icon-circle bg-green-light" style="margin:0 auto 10px;"><i class="fas fa-bullseye"></i></div>
                        <ul style="font-size:11px; padding-left:15px; margin:0; line-height:1.5;">
                            <li>Tồn kho cao</li>
                            <li>Chiếm dụng vốn</li>
                            <li>Rủi ro hàng hóa</li>
                            <li>Không gian lưu trữ tải</li>
                        </ul>
                    </div>
                </div>
                
                <div class="p6-right-col">
                    <div class="p6-verify-box">
                        <div class="p6-verify-title">ĐỘ TIN CẬY</div>
                        <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
                            <div class="p6-icon-circle bg-blue" style="width:30px; height:30px; font-size:14px; margin:0;"><i class="fas fa-shield-alt"></i></div>
                            <div>
                                <div class="c-orange" style="font-size:12px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i><i class="far fa-star text-gray-300"></i></div>
                                <div style="font-size:11px; font-weight:bold; text-align:center;">Trung bình - Cao</div>
                            </div>
                        </div>
                    </div>
                    <div class="p6-verify-box" style="flex:1;">
                        <div class="p6-verify-title">CẦN XÁC MINH</div>
                        <ul style="list-style:none; padding:0; margin:0; font-size:11px; line-height:1.5;">
                            <li style="margin-bottom:6px;"><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Tồn kho theo nhóm</li>
                            <li style="margin-bottom:6px;"><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Vòng quay tồn kho chậm</li>
                            <li><i class="far fa-square" style="color:#94a3b8; margin-right:5px;"></i> Chính sách mua hàng</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; display: flex; align-items: center; margin-top: auto;">
                <div style="background: #3b82f6; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-right: 12px; flex-shrink: 0;"><i class="fas fa-clipboard-list"></i></div>
                <div style="font-size: 12px; color: #1e293b;">
                    <strong>LƯU Ý QUAN TRỌNG</strong><br>
                    • Đây là các nguyên nhân hệ thống có khả năng cao dựa trên dữ liệu khảo sát. Kết luận nguyên nhân gốc chỉ được xác định sau khi xác minh tại hiện trường.<br>
                    • Khuyến nghị ưu tiên xác minh các nội dung bên phải để đảm bảo giải pháp đưa ra sát với thực tế và mang lại hiệu quả cao nhất.
                </div>
            </div>
        </div>
        ${generatePageFooter(6, 10)}
    </div>
    `;

    // PAGE 7 (Ma trận)
    html += `
    <div class="a4-page">
        ${generatePageHeader('7. MA TRẬN VẤN ĐỀ ƯU TIÊN', 'Xếp hạng các vấn đề theo mức độ tác động và nguồn lực cần thiết để triển khai', 7, 10)}
        <div class="a4-content">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background: #3b82f6; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size:12px;">i</div>
                <div style="font-size: 12px; color: #1e293b;">
                    Trang này tổng hợp các vấn đề ưu tiên từ phân tích nguyên nhân (Trang 6) và mục tiêu của doanh nghiệp, giúp xác định thứ tự hành động phù hợp để tạo hiệu quả cao nhất.
                </div>
            </div>
            
            <div style="display:flex; gap:15px; margin-bottom: 15px;">
                <!-- Matrix -->
                <div style="flex:2;">
                    <div style="text-align:center; font-size:14px; font-weight:bold; color:#1e293b; margin-bottom:5px;">MA TRẬN ƯU TIÊN HÀNH ĐỘNG</div>
                    <div style="text-align:center; font-size:11px; color:#ef4444; margin-bottom:15px;">(Mức độ tác động × Mức độ triển khai)</div>
                    
                    <div style="display:flex;">
                        <!-- Y axis -->
                        <div style="width:70px; display:flex; flex-direction:column; justify-content:space-between; align-items:center; padding: 20px 0; font-size:10px; font-weight:bold; color:#0f172a; text-align:center; border-right: 2px solid #0f172a; position:relative;">
                            <div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:10px solid #0f172a;"></div>
                            <div>Cao<br><span style="color:#ef4444">(5)</span></div>
                            <div style="color:#0f172a;">MỨC ĐỘ<br>TÁC ĐỘNG<br><span style="font-weight:normal; font-size:9px;">(Ảnh hưởng đến mục tiêu vận hành & kinh doanh)</span></div>
                            <div>Trung bình<br><span style="color:#f97316">(3)</span></div>
                            <div>Thấp<br><span style="color:#22c55e">(1)</span></div>
                        </div>
                        
                        <!-- Grid -->
                        <div style="flex:1; display:grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; border-bottom: 2px solid #0f172a; position:relative;">
                            <div style="position:absolute; right:-10px; bottom:-6px; width:0; height:0; border-top:6px solid transparent; border-bottom:6px solid transparent; border-left:10px solid #0f172a;"></div>
                            
                            <!-- Q1 -->
                            <div style="background:#f0fdf4; border-right:1px dashed #cbd5e1; border-bottom:1px dashed #cbd5e1; padding:15px;">
                                <div style="text-align:center; font-weight:bold; color:#16a34a; font-size:12px; margin-bottom:5px;">ƯU TIÊN THỰC HIỆN NGAY</div>
                                <div style="text-align:center; font-size:10px; color:#475569; margin-bottom:15px;">(Tác động cao - Dễ triển khai)</div>
                                
                                <div style="display:flex; align-items:flex-start; margin-bottom:10px;">
                                    <div style="background:#16a34a; color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; margin-right:8px;">1</div>
                                    <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.4;">Thiết lập cơ chế xử lý sai lệch kế hoạch hằng ngày</div>
                                </div>
                                <div style="display:flex; align-items:flex-start;">
                                    <div style="background:#16a34a; color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; margin-right:8px;">2</div>
                                    <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.4;">Chuẩn hóa công việc tại các công đoạn có lỗi cao</div>
                                </div>
                            </div>
                            
                            <!-- Q2 -->
                            <div style="background:#fef2f2; border-bottom:1px dashed #cbd5e1; padding:15px;">
                                <div style="text-align:center; font-weight:bold; color:#dc2626; font-size:12px; margin-bottom:5px;">DỰ ÁN TRỌNG ĐIỂM</div>
                                <div style="text-align:center; font-size:10px; color:#475569; margin-bottom:15px;">(Tác động cao - Khó triển khai)</div>
                                
                                <div style="display:flex; align-items:flex-start; margin-bottom:10px;">
                                    <div style="background:#dc2626; color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; margin-right:8px;">3</div>
                                    <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.4;">Cân đối kế hoạch theo năng lực sản xuất thực tế</div>
                                </div>
                                <div style="display:flex; align-items:flex-start;">
                                    <div style="background:#dc2626; color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; margin-right:8px;">6</div>
                                    <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.4;">Đồng bộ kế hoạch mua hàng với kế hoạch sản xuất</div>
                                </div>
                            </div>
                            
                            <!-- Q3 -->
                            <div style="background:#fffbeb; border-right:1px dashed #cbd5e1; padding:15px;">
                                <div style="text-align:center; font-weight:bold; color:#d97706; font-size:12px; margin-bottom:5px;">THỰC HIỆN KHI CÓ ĐIỀU KIỆN</div>
                                <div style="text-align:center; font-size:10px; color:#475569; margin-bottom:15px;">(Tác động thấp - Dễ triển khai)</div>
                                
                                <div style="display:flex; align-items:flex-start;">
                                    <div style="background:#d97706; color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; margin-right:8px;">5</div>
                                    <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.4;">Thiết lập giới hạn WIP và tồn kho tối thiểu - tối đa</div>
                                </div>
                            </div>
                            
                            <!-- Q4 -->
                            <div style="background:#f8fafc; padding:15px;">
                                <div style="text-align:center; font-weight:bold; color:#475569; font-size:12px; margin-bottom:5px;">THEO DÕI, CHƯA ƯU TIÊN</div>
                                <div style="text-align:center; font-size:10px; color:#475569; margin-bottom:15px;">(Tác động thấp - Khó triển khai)</div>
                                
                                <div style="display:flex; align-items:flex-start;">
                                    <div style="background:#64748b; color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; margin-right:8px;">7</div>
                                    <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.4;">Nâng cấp hệ thống dữ liệu & công cụ báo cáo</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- X axis labels -->
                    <div style="display:flex; margin-left:70px; margin-top:5px; font-size:10px; font-weight:bold; color:#0f172a;">
                        <div style="flex:1; text-align:left;">Dễ (1)</div>
                        <div style="flex:1; text-align:center;">Trung bình (3)</div>
                        <div style="flex:1; text-align:right; padding-right:10px;">Khó (5)</div>
                    </div>
                    <div style="text-align:center; margin-left:70px; margin-top:5px; font-size:11px; font-weight:bold; color:#0f172a;">MỨC ĐỘ TRIỂN KHAI (KHÓ / NGUỒN LỰC CẦN THIẾT)</div>
                </div>
                
                <!-- Guides -->
                <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:15px;">
                    <div style="font-weight:bold; color:#0f172a; font-size:12px; margin-bottom:15px; text-align:center;">HƯỚNG DẪN ĐÁNH GIÁ</div>
                    
                    <div style="margin-bottom:15px;">
                        <div style="display:flex; align-items:center; color:#ef4444; font-weight:bold; font-size:11px; margin-bottom:5px;">
                            <i class="fas fa-bullseye" style="width:20px;"></i> MỨC ĐỘ TÁC ĐỘNG
                        </div>
                        <div style="font-size:10px; color:#475569; padding-left:20px; line-height:1.6;">
                            5 = Ảnh hưởng rất lớn đến mục tiêu<br>(năng suất, chất lượng, giao hàng, chi phí)<br>
                            3 = Ảnh hưởng trung bình<br>
                            1 = Ảnh hưởng thấp
                        </div>
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <div style="display:flex; align-items:center; color:#f97316; font-weight:bold; font-size:11px; margin-bottom:5px;">
                            <i class="fas fa-cog" style="width:20px;"></i> MỨC ĐỘ KHẨN CẤP
                        </div>
                        <div style="font-size:10px; color:#475569; padding-left:20px; line-height:1.6;">
                            5 = Rất khẩn cấp, cần xử lý sớm<br>
                            3 = Cần xử lý trong 1-3 tháng<br>
                            1 = Chưa khẩn cấp
                        </div>
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <div style="display:flex; align-items:center; color:#3b82f6; font-weight:bold; font-size:11px; margin-bottom:5px;">
                            <i class="fas fa-users" style="width:20px;"></i> MỨC ĐỘ TRIỂN KHAI
                        </div>
                        <div style="font-size:10px; color:#475569; padding-left:20px; line-height:1.6;">
                            5 = Rất khó / cần nhiều nguồn lực<br>(thời gian, chi phí, nhân sự, phối hợp)<br>
                            3 = Trung bình<br>
                            1 = Dễ / ít nguồn lực
                        </div>
                    </div>
                    
                    <div style="border-top:1px solid #e2e8f0; padding-top:10px;">
                        <div style="font-weight:bold; color:#0f172a; font-size:11px; margin-bottom:5px;">CÁCH ĐỌC MA TRẬN</div>
                        <ul style="font-size:9px; color:#475569; padding-left:15px; margin:0; line-height:1.5;">
                            <li><strong style="color:#16a34a;">Ưu tiên thực hiện ngay:</strong> Tác động cao, dễ triển khai. Mang lại hiệu quả nhanh.</li>
                            <li><strong style="color:#dc2626;">Dự án trọng điểm:</strong> Tác động cao nhưng cần nhiều nguồn lực, cần lập kế hoạch dự án.</li>
                            <li><strong style="color:#d97706;">Thực hiện khi có điều kiện:</strong> Tác động thấp, dễ triển khai. Làm khi có nguồn lực rảnh.</li>
                            <li><strong style="color:#64748b;">Theo dõi, chưa ưu tiên:</strong> Tác động thấp và khó triển khai. Theo dõi sau.</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Table -->
            <div style="margin-bottom:15px;">
                <div style="font-weight:bold; color:#1e293b; font-size:13px; margin-bottom:5px;">BẢNG XẾP HẠNG ƯU TIÊN HÀNH ĐỘNG</div>
                <div style="font-size:11px; color:#475569; margin-bottom:10px;">Công thức tính điểm ưu tiên: <span style="color:#ef4444; font-weight:bold;">Điểm ưu tiên = Mức độ tác động × Mức độ khẩn cấp + Mức độ triển khai</span></div>
                
                <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;">
                    <thead>
                        <tr style="background:#1e3a8a; color:white;">
                            <th style="padding:8px 5px; border:1px solid #e2e8f0;">STT</th>
                            <th style="padding:8px 5px; border:1px solid #e2e8f0; text-align:left;">VẤN ĐỀ ƯU TIÊN</th>
                            <th style="padding:8px 5px; border:1px solid #e2e8f0; text-align:left;">MODULE LIÊN QUAN</th>
                            <th style="padding:8px 5px; border:1px solid #e2e8f0; width:60px;">MỨC ĐỘ<br>TÁC ĐỘNG<br>(1-5)</th>
                            <th style="padding:8px 5px; border:1px solid #e2e8f0; width:60px;">MỨC ĐỘ<br>KHẨN CẤP<br>(1-5)</th>
                            <th style="padding:8px 5px; border:1px solid #e2e8f0; width:60px;">MỨC ĐỘ<br>TRIỂN KHAI<br>(1-5)</th>
                            <th style="padding:8px 5px; border:1px solid #e2e8f0; width:80px;">ĐIỂM ƯU TIÊN<br><span style="font-size:8px; font-weight:normal;">(Tác động × Khẩn cấp + Triển khai)</span></th>
                            <th style="padding:8px 5px; border:1px solid #e2e8f0;">KẾT LUẬN</th>
                        </tr>
                    </thead>
                    <tbody style="color:#1e293b;">
                        <tr>
                            <td style="border:1px solid #e2e8f0; padding:6px;"><div style="background:#16a34a; color:white; width:20px; height:20px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; font-weight:bold;">1</div></td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left; font-weight:bold;">Thiết lập cơ chế xử lý sai lệch kế hoạch hằng ngày</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left;">Daily Management, Capacity, Flow</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">5</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">5</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">2</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; font-weight:bold; color:#16a34a; font-size:12px;">12,5</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; color:#16a34a; font-weight:bold;">Ưu tiên thực hiện ngay</td>
                        </tr>
                        <tr style="background:#f8fafc;">
                            <td style="border:1px solid #e2e8f0; padding:6px;"><div style="background:#16a34a; color:white; width:20px; height:20px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; font-weight:bold;">2</div></td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left; font-weight:bold;">Chuẩn hóa công việc tại các công đoạn có lỗi cao</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left;">Standard, Quality, Daily Management</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">5</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">2</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; font-weight:bold; color:#16a34a; font-size:12px;">10,0</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; color:#16a34a; font-weight:bold;">Ưu tiên thực hiện ngay</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #e2e8f0; padding:6px;"><div style="background:#dc2626; color:white; width:20px; height:20px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; font-weight:bold;">3</div></td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left; font-weight:bold;">Cân đối kế hoạch theo năng lực sản xuất thực tế</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left;">Capacity, Core, Flow</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">5</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">5</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; font-weight:bold; color:#dc2626; font-size:12px;">6,3</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; color:#dc2626; font-weight:bold;">Dự án trọng điểm</td>
                        </tr>
                        <tr style="background:#f8fafc;">
                            <td style="border:1px solid #e2e8f0; padding:6px;"><div style="background:#d97706; color:white; width:20px; height:20px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; font-weight:bold;">4</div></td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left; font-weight:bold;">Thiết lập giới hạn WIP và tồn kho tối thiểu - tối đa</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left;">Flow, Capacity, Standard</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">3</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; font-weight:bold; color:#d97706; font-size:12px;">5,3</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; color:#d97706; font-weight:bold;">Thực hiện khi có điều kiện</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #e2e8f0; padding:6px;"><div style="background:#dc2626; color:white; width:20px; height:20px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; font-weight:bold;">5</div></td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left; font-weight:bold;">Đồng bộ kế hoạch mua hàng với kế hoạch sản xuất</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left;">Flow, Capacity, Digital</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; font-weight:bold; color:#dc2626; font-size:12px;">4,0</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; color:#dc2626; font-weight:bold;">Dự án trọng điểm</td>
                        </tr>
                        <tr style="background:#f8fafc;">
                            <td style="border:1px solid #e2e8f0; padding:6px;"><div style="background:#64748b; color:white; width:20px; height:20px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; font-weight:bold;">6</div></td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left; font-weight:bold;">Kiểm soát chất lượng tại nguồn</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left;">Quality, Standard, Daily Management</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">3</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">3</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">3</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; font-weight:bold; color:#64748b; font-size:12px;">3,0</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; color:#64748b; font-weight:bold;">Theo dõi</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #e2e8f0; padding:6px;"><div style="background:#64748b; color:white; width:20px; height:20px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; font-weight:bold;">7</div></td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left; font-weight:bold;">Nâng cấp hệ thống dữ liệu & công cụ báo cáo</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; text-align:left;">Digital, Core</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">2</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">3</td>
                            <td style="border:1px solid #e2e8f0; padding:6px;">4</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; font-weight:bold; color:#64748b; font-size:12px;">1,5</td>
                            <td style="border:1px solid #e2e8f0; padding:6px; color:#64748b; font-weight:bold;">Chưa ưu tiên</td>
                        </tr>
                    </tbody>
                </table>
                <div style="font-size:9px; color:#64748b; font-style:italic; margin-top:5px;">* Điểm ưu tiên càng cao → Ưu tiên hành động càng cao.</div>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; display: flex; align-items: center; margin-top: auto;">
                <div style="background: #3b82f6; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-clipboard-check"></i></div>
                <div>
                    <div style="font-size: 13px; font-weight:bold; color: #1e3a8a; margin-bottom:4px;">KẾT LUẬN ĐIỀU HÀNH</div>
                    <div style="font-size: 12px; color: #1e293b; line-height:1.5;">
                        Nhà máy nên tập trung trước vào 2 việc mang lại hiệu quả nhanh: (1) Thiết lập cơ chế xử lý sai lệch kế hoạch hằng ngày và (2) Chuẩn hóa công việc tại các công đoạn có lỗi cao. Sau đó, triển khai dự án trọng điểm (3) Cân đối kế hoạch theo năng lực sản xuất thực tế trong 60 ngày để giảm tình trạng chờ đợi, lỗi và giao hàng trễ.
                    </div>
                </div>
            </div>
        </div>
        ${generatePageFooter(7, 10)}
    </div>
    `;

    // PAGE 8
    html += `
    <div class="a4-page">
        ${generatePageHeader('8. KẾ HOẠCH ĐIỀU TRỊ ƯU TIÊN', 'Ba giải pháp ưu tiên nhất - Triển khai trước trong 30-60 ngày', 8, 10)}
        <div class="a4-content">
            <div style="display:flex; gap:15px; height: 100%;">
                
                <div style="flex:2; display:flex; flex-direction:column; gap:15px;">
                    <!-- Pri 1 -->
                    <div style="border: 1px solid #16a34a; border-radius: 8px; display:flex; overflow:hidden;">
                        <div style="background:#16a34a; color:white; width:60px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px;">
                            <div style="font-size:11px; font-weight:bold; text-align:center;">ƯU TIÊN</div>
                            <div style="font-size:36px; font-weight:bold; line-height:1;">1</div>
                        </div>
                        <div style="flex:1; padding:15px; background:white;">
                            <div style="font-size:14px; font-weight:bold; color:#16a34a; margin-bottom:12px;">Thiết lập cơ chế xử lý sai lệch kế hoạch hằng ngày</div>
                            <div style="display:grid; grid-template-columns: 1.5fr 2fr 1.5fr 1fr; gap:10px; font-size:11px;">
                                <div>
                                    <div style="color:#16a34a; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-bullseye"></i> MỤC TIÊU</div>
                                    <div style="color:#0f172a; font-weight:bold; font-size:24px; margin-bottom:5px;"><i class="fas fa-bullseye text-green-500"></i></div>
                                    <div style="color:#475569;">Tăng tỷ lệ hoàn thành kế hoạch hằng ngày.</div>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px;">
                                    <div style="color:#16a34a; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-clipboard-check"></i> VIỆC CẦN LÀM</div>
                                    <ul style="list-style:none; padding:0; margin:0; color:#475569;">
                                        <li style="margin-bottom:6px;"><i class="fas fa-check-circle text-green-500" style="margin-right:5px;"></i> Họp điều hành đầu ca</li>
                                        <li style="margin-bottom:6px;"><i class="fas fa-check-circle text-green-500" style="margin-right:5px;"></i> Theo dõi kế hoạch theo giờ</li>
                                        <li><i class="fas fa-check-circle text-green-500" style="margin-right:5px;"></i> Xử lý sai lệch ngay</li>
                                    </ul>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px;">
                                    <div style="color:#16a34a; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-chart-bar"></i> KPI THEO DÕI</div>
                                    <ul style="list-style:none; padding:0; margin:0; color:#475569;">
                                        <li style="margin-bottom:10px;">• Tỷ lệ hoàn thành kế hoạch hằng ngày (%)</li>
                                        <li>• Thời gian chờ trung bình (phút)</li>
                                    </ul>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px; text-align:center;">
                                    <div style="color:#16a34a; font-weight:bold; font-size:10px; margin-bottom:15px;">THỜI GIAN</div>
                                    <div style="color:#16a34a; font-size:20px; margin-bottom:5px;"><i class="far fa-calendar-alt"></i></div>
                                    <div style="color:#16a34a; font-size:24px; font-weight:bold; line-height:1;">30</div>
                                    <div style="color:#16a34a; font-weight:bold; font-size:11px;">ngày</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pri 2 -->
                    <div style="border: 1px solid #1d4ed8; border-radius: 8px; display:flex; overflow:hidden;">
                        <div style="background:#1d4ed8; color:white; width:60px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px;">
                            <div style="font-size:11px; font-weight:bold; text-align:center;">ƯU TIÊN</div>
                            <div style="font-size:36px; font-weight:bold; line-height:1;">2</div>
                        </div>
                        <div style="flex:1; padding:15px; background:white;">
                            <div style="font-size:14px; font-weight:bold; color:#1d4ed8; margin-bottom:12px;">Chuẩn hóa công việc tại các công đoạn có lỗi cao</div>
                            <div style="display:grid; grid-template-columns: 1.5fr 2fr 1.5fr 1fr; gap:10px; font-size:11px;">
                                <div>
                                    <div style="color:#1d4ed8; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-bullseye"></i> MỤC TIÊU</div>
                                    <div style="color:#0f172a; font-weight:bold; font-size:24px; margin-bottom:5px;"><i class="fas fa-bullseye text-blue-600"></i></div>
                                    <div style="color:#475569;">Giảm lỗi và làm lại, nâng cao chất lượng tại nguồn.</div>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px;">
                                    <div style="color:#1d4ed8; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-clipboard-check"></i> VIỆC CẦN LÀM</div>
                                    <ul style="list-style:none; padding:0; margin:0; color:#475569;">
                                        <li style="margin-bottom:6px;"><i class="fas fa-check-circle text-blue-600" style="margin-right:5px;"></i> Cập nhật SOP công đoạn lỗi cao</li>
                                        <li style="margin-bottom:6px;"><i class="fas fa-check-circle text-blue-600" style="margin-right:5px;"></i> Thiết lập kiểm tra tại nguồn</li>
                                        <li><i class="fas fa-check-circle text-blue-600" style="margin-right:5px;"></i> Đào tạo theo công việc chuẩn</li>
                                    </ul>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px;">
                                    <div style="color:#1d4ed8; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-chart-bar"></i> KPI THEO DÕI</div>
                                    <ul style="list-style:none; padding:0; margin:0; color:#475569;">
                                        <li style="margin-bottom:10px;">• Tỷ lệ lỗi (%)</li>
                                        <li>• Tỷ lệ làm lại (%)</li>
                                    </ul>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px; text-align:center;">
                                    <div style="color:#1d4ed8; font-weight:bold; font-size:10px; margin-bottom:15px;">THỜI GIAN</div>
                                    <div style="color:#1d4ed8; font-size:20px; margin-bottom:5px;"><i class="far fa-calendar-alt"></i></div>
                                    <div style="color:#1d4ed8; font-size:24px; font-weight:bold; line-height:1;">30</div>
                                    <div style="color:#1d4ed8; font-weight:bold; font-size:11px;">ngày</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pri 3 -->
                    <div style="border: 1px solid #ea580c; border-radius: 8px; display:flex; overflow:hidden;">
                        <div style="background:#ea580c; color:white; width:60px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px;">
                            <div style="font-size:11px; font-weight:bold; text-align:center;">ƯU TIÊN</div>
                            <div style="font-size:36px; font-weight:bold; line-height:1;">3</div>
                        </div>
                        <div style="flex:1; padding:15px; background:white;">
                            <div style="font-size:14px; font-weight:bold; color:#ea580c; margin-bottom:12px;">Cân đối kế hoạch theo năng lực thực tế</div>
                            <div style="display:grid; grid-template-columns: 1.5fr 2fr 1.5fr 1fr; gap:10px; font-size:11px;">
                                <div>
                                    <div style="color:#ea580c; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-bullseye"></i> MỤC TIÊU</div>
                                    <div style="color:#0f172a; font-weight:bold; font-size:24px; margin-bottom:5px;"><i class="fas fa-bullseye text-orange-500"></i></div>
                                    <div style="color:#475569;">Giảm thời gian chờ, tăng khả năng giao hàng đúng hạn.</div>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px;">
                                    <div style="color:#ea580c; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-clipboard-check"></i> VIỆC CẦN LÀM</div>
                                    <ul style="list-style:none; padding:0; margin:0; color:#475569;">
                                        <li style="margin-bottom:6px;"><i class="fas fa-check-circle text-orange-500" style="margin-right:5px;"></i> Cập nhật năng lực từng công đoạn</li>
                                        <li style="margin-bottom:6px;"><i class="fas fa-check-circle text-orange-500" style="margin-right:5px;"></i> Cân bằng tải kế hoạch</li>
                                        <li><i class="fas fa-check-circle text-orange-500" style="margin-right:5px;"></i> Theo dõi và xử lý công đoạn nghẽn</li>
                                    </ul>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px;">
                                    <div style="color:#ea580c; font-weight:bold; font-size:10px; margin-bottom:5px;"><i class="fas fa-chart-bar"></i> KPI THEO DÕI</div>
                                    <ul style="list-style:none; padding:0; margin:0; color:#475569;">
                                        <li style="margin-bottom:6px;">• Lead time (ngày)</li>
                                        <li style="margin-bottom:6px;">• Tỷ lệ giao hàng đúng hạn (%)</li>
                                        <li>• Mức tồn kho & WIP (ngày)</li>
                                    </ul>
                                </div>
                                <div style="border-left:1px dashed #cbd5e1; padding-left:10px; text-align:center;">
                                    <div style="color:#ea580c; font-weight:bold; font-size:10px; margin-bottom:15px;">THỜI GIAN</div>
                                    <div style="color:#ea580c; font-size:20px; margin-bottom:5px;"><i class="far fa-calendar-alt"></i></div>
                                    <div style="color:#ea580c; font-size:24px; font-weight:bold; line-height:1;">60</div>
                                    <div style="color:#ea580c; font-weight:bold; font-size:11px;">ngày</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="flex:1; display:flex; flex-direction:column; gap:15px;">
                    <!-- Success box -->
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:20px; text-align:center; flex:1;">
                        <div style="background:#16a34a; color:white; width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 15px;">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div style="font-weight:bold; color:#16a34a; font-size:14px; margin-bottom:20px;">ĐIỀU KIỆN<br>THÀNH CÔNG</div>
                        
                        <div style="display:flex; align-items:center; text-align:left; gap:10px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px dashed #bbf7d0;">
                            <i class="fas fa-check-circle text-green-600" style="font-size:18px;"></i>
                            <div style="font-size:11px; color:#0f172a; font-weight:600;">Lãnh đạo cam kết và đồng hành.</div>
                        </div>
                        <div style="display:flex; align-items:center; text-align:left; gap:10px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px dashed #bbf7d0;">
                            <i class="fas fa-check-circle text-green-600" style="font-size:18px;"></i>
                            <div style="font-size:11px; color:#0f172a; font-weight:600;">Có người phụ trách rõ ràng cho từng nội dung.</div>
                        </div>
                        <div style="display:flex; align-items:center; text-align:left; gap:10px;">
                            <i class="fas fa-check-circle text-green-600" style="font-size:18px;"></i>
                            <div style="font-size:11px; color:#0f172a; font-weight:600;">Theo dõi KPI hằng tuần và xử lý kịp thời.</div>
                        </div>
                    </div>
                    
                    <!-- Alert box -->
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:20px; text-align:center;">
                        <div style="color:#ef4444; font-size:40px; margin-bottom:10px;">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div style="font-weight:bold; color:#ef4444; font-size:14px; margin-bottom:15px;">LƯU Ý</div>
                        <ul style="text-align:left; font-size:11px; color:#0f172a; padding-left:15px; margin:0; line-height:1.6;">
                            <li style="color:#ef4444; font-weight:bold;"><span style="color:#0f172a; font-weight:normal;">Cần xác minh và điều chỉnh tại hiện trường trước khi triển khai trên diện rộng.</span></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; display: flex; align-items: center; margin-top: 20px;">
                <div style="background: #3b82f6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-star"></i></div>
                <div>
                    <div style="font-size: 13px; font-weight:bold; color: #1e3a8a; margin-bottom:4px;">KẾT LUẬN AI</div>
                    <div style="font-size: 12px; color: #1e293b; line-height:1.5;">
                        Ba giải pháp trên được lựa chọn vì có khả năng cải thiện trực tiếp các vấn đề ưu tiên của nhà máy.<br>Nên triển khai theo thứ tự và đánh giá kết quả sau từng giai đoạn trước khi mở rộng.
                    </div>
                </div>
            </div>
        </div>
        ${generatePageFooter(8, 10)}
    </div>
    `;

    // PAGE 9
    html += `
    <div class="a4-page">
        ${generatePageHeader('9. PHÁC ĐỒ ĐIỀU TRỊ 30-60 NGÀY', 'Lộ trình triển khai theo thứ tự ưu tiên, từ ổn định đến chuẩn hóa.', 9, 10)}
        <div class="a4-content">
            <div style="display:flex; gap:15px; margin-bottom: 10px; height: 100%;">
                
                <!-- Left Content -->
                <div style="flex:2; display:flex; flex-direction:column; gap:10px;">
                    <!-- Phase 1 -->
                    <div style="border: 1px solid #16a34a; border-radius: 8px; overflow:hidden;">
                        <div style="background:#16a34a; color:white; padding:10px 15px; display:flex; gap:10px; align-items:center;">
                            <div style="background:#14532d; padding:4px 10px; border-radius:4px; font-weight:bold; font-size:12px;">GIAI ĐOẠN 1</div>
                            <div style="font-size:18px; font-weight:bold;">0 - 30 NGÀY</div>
                            <div style="font-size:13px; margin-left:20px;">ỔN ĐỊNH VÀ XỬ LÝ ĐIỂM NÓNG</div>
                        </div>
                        <div style="background:white; padding:15px;">
                            <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:center;">
                                <thead>
                                    <tr style="color:#16a34a; font-weight:bold; border-bottom:1px solid #e2e8f0;">
                                        <th style="padding:10px; width:30%;">MỤC TIÊU</th>
                                        <th style="padding:10px; width:40%;">VIỆC TRỌNG TÂM</th>
                                        <th style="padding:10px; width:30%;">KẾT QUẢ MONG ĐỢI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding:15px 10px; border-right:1px solid #e2e8f0; color:#1e293b;">
                                            Giảm nhanh các bất thường đang ảnh hưởng trực tiếp đến sản xuất.
                                        </td>
                                        <td style="padding:15px 10px; border-right:1px solid #e2e8f0; text-align:left;">
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#16a34a; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">1</div><div style="color:#1e293b;">Thiết lập cơ chế xử lý sai lệch kế hoạch hằng ngày.</div></div>
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#16a34a; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">2</div><div style="color:#1e293b;">Chuẩn hóa công việc tại công đoạn có lỗi cao.</div></div>
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#16a34a; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">3</div><div style="color:#1e293b;">Theo dõi thời gian chờ, lỗi và hoàn thành kế hoạch hằng ngày.</div></div>
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#16a34a; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">4</div><div style="color:#1e293b;">Phân công rõ người chịu trách nhiệm.</div></div>
                                            <div style="display:flex;"><div style="background:#16a34a; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">5</div><div style="color:#1e293b;">Xác minh dữ liệu và nguyên nhân tại hiện trường.</div></div>
                                        </td>
                                        <td style="padding:15px 10px; text-align:left;">
                                            <ul style="padding-left:15px; margin:0; color:#1e293b; line-height:1.6;">
                                                <li>Sai lệch được phát hiện và xử lý trong ngày.</li>
                                                <li>Thời gian chờ bắt đầu giảm.</li>
                                                <li>Lỗi và làm lại được kiểm soát tốt hơn.</li>
                                                <li>Có dữ liệu nền để đánh giá hiệu quả.</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style="background:#f0fdf4; border-top:1px solid #16a34a; padding:12px 15px;">
                            <div style="font-weight:bold; color:#16a34a; font-size:11px; margin-bottom:8px;">ĐIỂM KIỂM SOÁT NGÀY 30</div>
                            <div style="display:flex; gap:10px; text-align:center; font-size:10px; color:#1e293b;">
                                <div style="flex:1;">Hoàn thành ≥ 80% hành động ưu tiên</div>
                                <div style="flex:1;">Có Owner cho từng nội dung</div>
                                <div style="flex:1;">KPI được cập nhật hằng ngày/tuần</div>
                                <div style="flex:1;">Chốt nội dung cần tiếp tục triển khai ở giai đoạn 2.</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Phase 2 -->
                    <div style="border: 1px solid #ea580c; border-radius: 8px; overflow:hidden;">
                        <div style="background:#ea580c; color:white; padding:10px 15px; display:flex; gap:10px; align-items:center;">
                            <div style="background:#9a3412; padding:4px 10px; border-radius:4px; font-weight:bold; font-size:12px;">GIAI ĐOẠN 2</div>
                            <div style="font-size:18px; font-weight:bold;">31 - 60 NGÀY</div>
                            <div style="font-size:13px; margin-left:20px;">CHUẨN HÓA VÀ CỦNG CỐ HỆ THỐNG</div>
                        </div>
                        <div style="background:white; padding:15px;">
                            <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:center;">
                                <thead>
                                    <tr style="color:#ea580c; font-weight:bold; border-bottom:1px solid #e2e8f0;">
                                        <th style="padding:10px; width:30%;">MỤC TIÊU</th>
                                        <th style="padding:10px; width:40%;">VIỆC TRỌNG TÂM</th>
                                        <th style="padding:10px; width:30%;">KẾT QUẢ MONG ĐỢI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding:15px 10px; border-right:1px solid #e2e8f0; color:#1e293b;">
                                            Ổn định cách vận hành và ngăn vấn đề tái diễn.
                                        </td>
                                        <td style="padding:15px 10px; border-right:1px solid #e2e8f0; text-align:left;">
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#ea580c; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">1</div><div style="color:#1e293b;">Cân đối kế hoạch theo năng lực thực tế.</div></div>
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#ea580c; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">2</div><div style="color:#1e293b;">Chuẩn hóa SOP và điểm kiểm soát.</div></div>
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#ea580c; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">3</div><div style="color:#1e293b;">Thiết lập giới hạn WIP phù hợp.</div></div>
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#ea580c; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">4</div><div style="color:#1e293b;">Tích hợp theo dõi KPI vào Daily Management.</div></div>
                                            <div style="display:flex; margin-bottom:8px;"><div style="background:#ea580c; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">5</div><div style="color:#1e293b;">Đánh giá hiệu lực giải pháp và điều chỉnh.</div></div>
                                            <div style="display:flex;"><div style="background:#ea580c; color:white; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; margin-right:8px; flex-shrink:0;">6</div><div style="color:#1e293b;">Chuẩn hóa nội dung đã thử nghiệm thành công.</div></div>
                                        </td>
                                        <td style="padding:15px 10px; text-align:left;">
                                            <ul style="padding-left:15px; margin:0; color:#1e293b; line-height:1.6;">
                                                <li>Kế hoạch sản xuất ổn định hơn.</li>
                                                <li>Lead time và thời gian chờ giảm.</li>
                                                <li>Tỷ lệ lỗi và làm lại giảm.</li>
                                                <li>Trách nhiệm và cơ chế xử lý sai lệch rõ ràng.</li>
                                                <li>Hệ thống có khả năng tự duy trì sau giai đoạn triển khai.</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style="background:#fff7ed; border-top:1px solid #ea580c; padding:12px 15px;">
                            <div style="font-weight:bold; color:#ea580c; font-size:11px; margin-bottom:8px;">ĐIỂM KIỂM SOÁT NGÀY 60</div>
                            <div style="display:flex; gap:10px; text-align:center; font-size:10px; color:#1e293b;">
                                <div style="flex:1;">KPI chính có xu hướng cải thiện</div>
                                <div style="flex:1;">Giải pháp hiệu quả được chuẩn hóa</div>
                                <div style="flex:1;">Có lịch kiểm tra và họp duy trì</div>
                                <div style="flex:1;">Xác định nội dung cần nhân rộng hoặc đầu tư tiếp</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right column -->
                <div style="flex:1; display:flex; flex-direction:column; gap:15px;">
                    <!-- Timeline -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:15px; flex:1;">
                        <div style="font-weight:bold; color:#1e3a8a; font-size:12px; margin-bottom:20px; text-align:center;">TỔNG QUAN LỘ TRÌNH</div>
                        
                        <div style="position:relative; padding-left:30px; margin-left:15px; border-left:3px solid #16a34a; padding-bottom:30px;">
                            <div style="position:absolute; left:-26px; top:-10px; background:white; border:3px solid #16a34a; width:50px; height:50px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#16a34a; font-weight:bold; z-index:2;">
                                <div style="font-size:18px; line-height:1;">30</div>
                                <div style="font-size:9px;">NGÀY</div>
                            </div>
                            <div style="font-weight:bold; color:#16a34a; font-size:12px; margin-bottom:5px; padding-top:5px;">ỔN ĐỊNH</div>
                            <div style="font-size:10px; color:#475569; line-height:1.5;">Xử lý điểm nóng, giảm sai lệch và thời gian chờ.</div>
                        </div>
                        
                        <div style="position:relative; padding-left:30px; margin-left:15px; border-left:3px solid #1e3a8a; padding-bottom:30px;">
                            <div style="position:absolute; left:-26px; top:-10px; background:white; border:3px solid #ea580c; width:50px; height:50px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#ea580c; font-weight:bold; z-index:2;">
                                <div style="font-size:18px; line-height:1;">60</div>
                                <div style="font-size:9px;">NGÀY</div>
                            </div>
                            <div style="font-weight:bold; color:#ea580c; font-size:12px; margin-bottom:5px; padding-top:5px;">CHUẨN HÓA</div>
                            <div style="font-size:10px; color:#475569; line-height:1.5;">Củng cố hệ thống, chuẩn hóa quy trình và kiểm soát.</div>
                            
                            <div style="position:absolute; left:-7px; bottom:0; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:8px solid #1e3a8a;"></div>
                        </div>
                        
                        <div style="position:relative; padding-left:30px; margin-left:15px; padding-top:10px;">
                            <div style="font-weight:bold; color:#1e3a8a; font-size:12px; margin-bottom:5px;">KẾT QUẢ</div>
                            <div style="font-size:10px; color:#475569; line-height:1.5;">Vận hành ổn định, dữ liệu minh bạch, sẵn sàng mở rộng cải tiến.</div>
                        </div>
                    </div>
                    
                    <!-- Checklist -->
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:15px;">
                        <div style="font-weight:bold; color:#1d4ed8; font-size:11px; margin-bottom:10px;">ĐIỀU KIỆN THÀNH CÔNG</div>
                        <ul style="list-style:none; padding:0; margin:0 0 15px 0; font-size:10px; color:#1e293b; line-height:1.6;">
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Lãnh đạo cam kết và tham gia</li>
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Có người phụ trách rõ ràng</li>
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Theo dõi KPI định kỳ</li>
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Kiểm tra hiện trường thường xuyên</li>
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Đánh giá kết quả trước khi mở rộng</li>
                        </ul>
                        
                        <div style="font-weight:bold; color:#1d4ed8; font-size:11px; margin-bottom:10px; padding-top:10px; border-top:1px dashed #bfdbfe;">TIÊU CHÍ HOÀN THÀNH</div>
                        <ul style="list-style:none; padding:0; margin:0; font-size:10px; color:#1e293b; line-height:1.6;">
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Hoàn thành ≥ 80% hành động theo kế hoạch</li>
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> KPI cải thiện so với hiện trạng</li>
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Sai lệch và bất thường giảm rõ rệt</li>
                            <li><i class="far fa-square text-blue-600" style="margin-right:5px;"></i> Hệ thống có cơ chế theo dõi và duy trì</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div style="border-top:1px solid #1e3a8a; margin-top:5px; padding-top:10px; position:relative;">
                <div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:white; padding:0 15px; font-weight:bold; color:#1e3a8a; font-size:12px;">CHỈ SỐ THEO DÕI CHÍNH</div>
                <div style="display:flex; gap:10px; text-align:center; margin-top:10px;">
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 5px;">
                        <div style="font-size:10px; color:#475569; line-height:1.4;">Tỷ lệ hoàn thành kế hoạch ngày (%)</div>
                    </div>
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 5px;">
                        <div style="font-size:10px; color:#475569; line-height:1.4;">Thời gian chờ trung bình (phút)</div>
                    </div>
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 5px;">
                        <div style="font-size:10px; color:#475569; line-height:1.4;">Tỷ lệ lỗi và làm lại (%)</div>
                    </div>
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 5px;">
                        <div style="font-size:10px; color:#475569; line-height:1.4;">Lead time (ngày)</div>
                    </div>
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 5px;">
                        <div style="font-size:10px; color:#475569; line-height:1.4;">Mức tồn kho hoặc WIP (ngày)</div>
                    </div>
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 5px;">
                        <div style="font-size:10px; color:#475569; line-height:1.4;">Tỷ lệ hoàn thành hành động (%)</div>
                    </div>
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 5px;">
                        <div style="font-size:10px; color:#475569; line-height:1.4;">Tỷ lệ tuân thủ tiêu chuẩn (%)</div>
                    </div>
                </div>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; display: flex; align-items: center; margin-top: 15px;">
                <div style="background: #3b82f6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-bullseye"></i></div>
                <div>
                    <div style="font-size: 13px; font-weight:bold; color: #1e3a8a; margin-bottom:4px;">KẾT LUẬN AI</div>
                    <div style="font-size: 11px; color: #1e293b; line-height:1.5;">
                        Phác đồ 30-60 ngày ưu tiên xử lý nhanh các điểm nóng trong 30 ngày đầu, sau đó chuẩn hóa và củng cố hệ thống trong<br>
                        30 ngày tiếp theo. Chỉ mở rộng khi giải pháp đã được kiểm chứng bằng dữ liệu và xác nhận tại hiện trường.
                    </div>
                </div>
            </div>
        </div>
        ${generatePageFooter(9, 10)}
    </div>
    `;

    // PAGE 10
    html += `
    <div class="a4-page">
        ${generatePageHeader('10. KẾT LUẬN & BƯỚC TIẾP THEO', 'Đồng hành cùng nhà máy kiến tạo vận hành tinh gọn, hiệu suất cao.', 10, 10)}
        <div class="a4-content">
            <!-- 01 -->
            <div style="margin-bottom: 10px;">
                <div style="display:flex; align-items:center; margin-bottom: 10px;">
                    <div style="background:#1e3a8a; color:white; width:36px; height:36px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; margin-right:12px;">01</div>
                    <div style="font-size:16px; font-weight:bold; color:#1e3a8a; text-transform:uppercase;">KẾT LUẬN ĐIỀU HÀNH</div>
                </div>
                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; font-size:12px; color:#1e293b; line-height:1.6; background:white;">
                    Kết quả khảo sát cho thấy nhà máy đang tồn tại một số vấn đề về lãng phí, dấu hiệu bất thường tại hiện trường và hệ thống quản trị. Báo cáo đã xác định các khu vực cần ưu tiên cải thiện và đề xuất phác đồ triển khai trong 30-60 ngày.<br><br>
                    Các nhận định được xây dựng từ dữ liệu khảo sát trực tuyến và cần được xác minh tại hiện trường trước khi quyết định đầu tư hoặc triển khai trên diện rộng.
                </div>
            </div>
            
            <!-- 02 -->
            <div style="margin-bottom: 10px;">
                <div style="display:flex; align-items:center; margin-bottom: 10px;">
                    <div style="background:#1e3a8a; color:white; width:36px; height:36px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; margin-right:12px;">02</div>
                    <div style="font-size:16px; font-weight:bold; color:#1e3a8a; text-transform:uppercase;">TÓM TẮT KẾT QUẢ KHÁM BỆNH</div>
                </div>
                <table style="width:100%; border-collapse:collapse; text-align:center; font-size:12px; background:white;">
                    <thead>
                        <tr style="background:#f8fafc; color:#475569; font-weight:bold; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0;">
                            <th style="padding:12px; border-right:1px solid #e2e8f0; width:16%;">Điểm mắc bệnh<br>tổng thể</th>
                            <th style="padding:12px; border-right:1px solid #e2e8f0; width:16%;">Xếp loại</th>
                            <th style="padding:12px; border-right:1px solid #e2e8f0; width:20%;">Lãng phí<br>ưu tiên</th>
                            <th style="padding:12px; border-right:1px solid #e2e8f0; width:20%;">Dấu hiệu<br>nổi bật</th>
                            <th style="padding:12px; border-right:1px solid #e2e8f0; width:16%;">Module cần<br>ưu tiên</th>
                            <th style="padding:12px; width:12%;">Thời gian điều trị<br>đề xuất</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:15px 12px; border-right:1px solid #e2e8f0; font-size:24px; font-weight:bold; color:#1e3a8a;">${100 - (json.report?.warningScore || 57)}/100</td>
                            <td style="padding:15px 12px; border-right:1px solid #e2e8f0; font-size:16px; font-weight:bold; color:#ef4444;">MẮC BỆNH</td>
                            <td style="padding:15px 12px; border-right:1px solid #e2e8f0; font-size:16px; font-weight:bold; color:#16a34a; text-transform:uppercase;">CHỜ ĐỢI</td>
                            <td style="padding:15px 12px; border-right:1px solid #e2e8f0; font-size:14px; font-weight:bold; color:#ea580c; text-transform:uppercase;">THỜI GIAN CHỜ CAO</td>
                            <td style="padding:15px 12px; border-right:1px solid #e2e8f0; font-size:16px; font-weight:bold; color:#16a34a; text-transform:uppercase;">CAPACITY</td>
                            <td style="padding:15px 12px; font-size:16px; font-weight:bold; color:#1e3a8a;">30-60<br>NGÀY</td>
                        </tr>
                    </tbody>
                </table>
                <div style="border-top:1px solid #e2e8f0;"></div>
            </div>
            
            <!-- 03 -->
            <div style="margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                    <div style="display:flex; align-items:center;">
                        <div style="background:#1e3a8a; color:white; width:36px; height:36px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; margin-right:12px;">03</div>
                        <div style="font-size:16px; font-weight:bold; color:#1e3a8a; text-transform:uppercase;">BA BƯỚC TIẾP THEO</div>
                    </div>
                    <div style="background:#1e3a8a; color:white; font-size:10px; font-weight:bold; padding:4px 10px; border-radius:4px;">KHUYẾN NGHỊ</div>
                </div>
                
                <div style="display:flex; gap:15px;">
                    <!-- Step 1 -->
                    <div style="flex:1; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; background:white; display:flex; flex-direction:column;">
                        <div style="padding:15px; border-bottom:1px solid #e2e8f0;">
                            <div style="display:flex; align-items:center; margin-bottom:15px;">
                                <div style="background:#16a34a; color:white; width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:10px; flex-shrink:0;">1</div>
                                <div style="font-weight:bold; color:#16a34a; font-size:14px;">TỰ TRIỂN KHAI</div>
                            </div>
                            <ul style="padding-left:15px; margin:0; font-size:11px; color:#1e293b; line-height:1.8;">
                                <li>Có đội cải tiến nội bộ.</li>
                                <li>Có năng lực phân tích và triển khai.</li>
                                <li>Có dữ liệu và cơ chế theo dõi KPI.</li>
                            </ul>
                        </div>
                        <div style="padding:15px; background:#f8fafc; flex:1;">
                            <div style="font-weight:bold; color:#16a34a; font-size:11px; margin-bottom:5px;">Hành động đề xuất:</div>
                            <div style="font-size:11px; color:#1e293b; line-height:1.5;">Triển khai 3 giải pháp ưu tiên tại Trang 8 và đánh giá theo phác đồ Trang 9.</div>
                        </div>
                    </div>
                    
                    <!-- Step 2 -->
                    <div style="flex:1; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; background:white; display:flex; flex-direction:column;">
                        <div style="padding:15px; border-bottom:1px solid #e2e8f0;">
                            <div style="display:flex; align-items:center; margin-bottom:15px;">
                                <div style="background:#1d4ed8; color:white; width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:10px; flex-shrink:0;">2</div>
                                <div style="font-weight:bold; color:#1d4ed8; font-size:14px;">XÁC MINH TẠI HIỆN TRƯỜNG</div>
                            </div>
                            <ul style="padding-left:15px; margin:0; font-size:11px; color:#1e293b; line-height:1.8;">
                                <li>Kiểm chứng dữ liệu khảo sát.</li>
                                <li>Xác minh nguyên nhân hệ thống nghi ngờ.</li>
                                <li>Đánh giá mức độ phù hợp của giải pháp.</li>
                                <li>Điều chỉnh kế hoạch theo thực tế nhà máy.</li>
                            </ul>
                        </div>
                        <div style="padding:15px; background:#eff6ff; flex:1;">
                            <div style="font-weight:bold; color:#1d4ed8; font-size:11px; margin-bottom:5px;">Đầu ra đề xuất:</div>
                            <ul style="padding-left:15px; margin:0; font-size:11px; color:#1e293b; line-height:1.5;">
                                <li>Báo cáo xác minh hiện trạng</li>
                                <li>Danh mục vấn đề ưu tiên</li>
                                <li>Kế hoạch triển khai phù hợp nguồn lực</li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Step 3 -->
                    <div style="flex:1; border:1px solid #ea580c; border-radius:8px; overflow:hidden; background:#fff7ed; display:flex; flex-direction:column; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="padding:15px; border-bottom:1px solid #fed7aa;">
                            <div style="display:flex; align-items:flex-start; margin-bottom:15px;">
                                <div style="background:#ea580c; color:white; width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:10px; flex-shrink:0;">3</div>
                                <div style="font-weight:bold; color:#ea580c; font-size:14px; line-height:1.2;">ĐỒNG HÀNH TRIỂN KHAI INVAMAX FOS</div>
                            </div>
                            <ul style="padding-left:15px; margin:0; font-size:11px; color:#1e293b; line-height:1.8;">
                                <li>Ổn định vận hành.</li>
                                <li>Chuẩn hóa hệ thống quản trị.</li>
                                <li>Nâng cao năng lực đội ngũ.</li>
                                <li>Thiết lập nền tảng trước khi số hóa hoặc AI hóa.</li>
                            </ul>
                        </div>
                        <div style="padding:15px; flex:1;">
                            <div style="font-weight:bold; color:#ea580c; font-size:11px; margin-bottom:5px;">Phạm vi:</div>
                            <div style="font-size:11px; color:#1e293b; line-height:1.5;">Tùy theo kết quả xác minh, nguồn lực và quyết định của lãnh đạo nhà máy.</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 04 -->
            <div style="margin-bottom: 10px;">
                <div style="display:flex; align-items:center; margin-bottom: 10px;">
                    <div style="background:#1e3a8a; color:white; width:36px; height:36px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; margin-right:12px;">04</div>
                    <div style="font-size:16px; font-weight:bold; color:#1e3a8a; text-transform:uppercase;">CAM KẾT PHƯƠNG PHÁP</div>
                </div>
                <div style="border:1px solid #bfdbfe; border-radius:8px; padding:15px; background:#eff6ff; display:flex; align-items:center;">
                    <i class="fas fa-check-shield text-blue-600" style="font-size:24px; margin-right:15px; flex-shrink:0;"></i>
                    <div style="font-size:12px; color:#1e293b; line-height:1.5;">
                        INVAMAX ưu tiên nhìn đúng hiện trạng, xử lý nguyên nhân hệ thống và xây giải pháp phù hợp với nguồn lực nhà máy.<br>
                        Mỗi giải pháp phải rõ người chịu trách nhiệm, rõ đầu ra, có chỉ số đo lường và có cơ chế duy trì.
                    </div>
                </div>
            </div>
            
            <!-- 05 -->
            <div>
                <div style="display:flex; align-items:center; margin-bottom: 10px;">
                    <div style="background:#1e3a8a; color:white; width:36px; height:36px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; margin-right:12px;">05</div>
                    <div style="font-size:16px; font-weight:bold; color:#1e3a8a; text-transform:uppercase;">THÔNG TIN LIÊN HỆ & KẾT NỐI</div>
                </div>
                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; background:white; display:flex; justify-content:space-between; align-items:center;">
                    
                    <div style="display:flex; align-items:center;">
                        <div style="background:#eff6ff; color:#3b82f6; width:50px; height:50px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:24px; margin-right:15px; flex-shrink:0;">
                            <i class="far fa-calendar-alt"></i>
                        </div>
                        <div>
                            <div style="font-weight:bold; color:#1e3a8a; font-size:13px; margin-bottom:4px;">BƯỚC ĐỀ XUẤT</div>
                            <div style="font-size:11px; color:#475569; line-height:1.4;">Đặt lịch trao đổi kết quả<br>hoặc khảo sát xác minh<br>tại nhà máy.</div>
                        </div>
                    </div>
                    
                    <div style="border-left:1px solid #e2e8f0; padding-left:30px;">
                        <div style="display:flex; align-items:center; margin-bottom:8px; font-size:12px; color:#1e293b;">
                            <i class="fas fa-globe" style="color:#3b82f6; width:20px;"></i> www.invamax.vn
                        </div>
                        <div style="display:flex; align-items:center; margin-bottom:8px; font-size:12px; color:#1e293b;">
                            <i class="fas fa-envelope" style="color:#3b82f6; width:20px;"></i> info@invamax.vn
                        </div>
                        <div style="display:flex; align-items:center; margin-bottom:8px; font-size:12px; color:#1e293b;">
                            <i class="fas fa-phone-alt" style="color:#3b82f6; width:20px;"></i> 0901 681 668
                        </div>
                        <div style="display:flex; align-items:center; font-size:12px; color:#1e293b;">
                            <i class="fas fa-map-marker-alt" style="color:#3b82f6; width:20px;"></i> Hà Nội – TP. Hồ Chí Minh – Đà Nẵng
                        </div>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; align-items:center; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                        <img src="../assets/images/qr-booking.png" alt="QR Đặt lịch" style="width:80px; height:80px; margin-bottom:5px; object-fit:contain; background:#f8fafc;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><rect width=\'100%\' height=\'100%\' fill=\'%23f1f5f9\'/><text x=\'50%\' y=\'50%\' font-family=\'Arial\' font-size=\'12\' fill=\'%2394a3b8\' text-anchor=\'middle\' dy=\'.3em\'>QR CODE</text></svg>'">
                        <div style="font-weight:bold; color:#1e3a8a; font-size:10px; text-align:center;">QUÉT MÃ<br>ĐẶT LỊCH KHẢO SÁT</div>
                    </div>
                </div>
            </div>
            
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; display: flex; align-items: center; margin-top: 20px;">
                <div style="color: #d97706; font-size: 24px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-exclamation-triangle"></i></div>
                <div style="font-size: 11px; color: #1e293b; line-height:1.5;">
                    Báo cáo là kết quả chẩn đoán sơ bộ dựa trên dữ liệu doanh nghiệp cung cấp.<br>
                    Kết luận nguyên nhân gốc và cam kết hiệu quả chỉ được xác lập sau khi có dữ liệu và xác minh tại hiện trường.
                </div>
            </div>
            
        </div>
        ${generatePageFooter(10, 10)}
    </div>
    `;

    el.innerHTML = html;
}


function initCharts(res) {
    const healthScore = 100 - res.warningScore;
    const gaugeNeedle = {
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

    const radarSymCtx = document.getElementById('radarSymptomsChart');
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
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    borderColor: '#f97316',
                    pointBackgroundColor: '#ea580c',
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
                        min: 0,
                        max: 100,
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 10.5, family: "'Inter', sans-serif", weight: '600' }, color: '#475569' },
                        ticks: { display: false, stepSize: 20, count: 6 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    const radarCtx = document.getElementById('radarChart');
    if (radarCtx && res.wasteScores) {
        if (window.radarChartInst) window.radarChartInst.destroy();
        
        const labels = res.wasteScores.map(w => w.module);
        const data = res.wasteScores.map(w => w.score);
        
        window.radarChartInst = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Điểm Lãng Phí',
                    data: data,
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    borderColor: '#f97316',
                    pointBackgroundColor: '#ea580c',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ea580c'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 10.5, family: "'Inter', sans-serif", weight: '600' }, color: '#475569' },
                        ticks: { display: false, stepSize: 20, count: 6 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}
function exportPDF(type = 'chi-tiet') {
    const element = document.getElementById('pdf-container');
    const companyEl = document.getElementById('a4-company');
    const companyName = companyEl ? companyEl.innerText.replace(/\s+/g, '_') : 'Company';
    
    // Add classes for CSS logic
    element.classList.add('pdf-export-mode');
    
    // TEMPORARY OVERRIDE INLINE STYLES THAT BREAK PDF
    const oldPadding = element.style.padding;
    const oldGap = element.style.gap;
    const oldBackground = element.style.background;
    element.style.padding = '0';
    element.style.gap = '0';
    element.style.background = 'white';

    if (type === 'chi-tiet') {
        element.classList.add('pdf-export-chi-tiet');
    }
    
    // Configure visibility
    const pages = element.querySelectorAll('.a4-page');
    const paywallBox = document.getElementById('paywall-box');
    const qrCodeBox = document.getElementById('qr-code-box');
    
    if (type === 'so-bo') {
        for (let i = 5; i < pages.length; i++) {
            if (pages[i]) pages[i].style.display = 'none';
        }
    } else if (type === 'chi-tiet') {
        if (paywallBox) paywallBox.style.display = 'none';
        if (qrCodeBox) qrCodeBox.style.display = 'none';
        const page5_1 = element.querySelector('.page-5-1');
        if(page5_1) page5_1.style.display = 'none';
    }
    
    const filename = type === 'so-bo' ? "Bao_Cao_So_Bo_INVAMAX_" + companyName + ".pdf" : "Bao_Cao_Chi_Tiet_INVAMAX_" + companyName + ".pdf";

    var opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 1 },
        pagebreak:    { mode: 'css' },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Restore display
        for (let i = 5; i < pages.length; i++) {
            if (pages[i]) pages[i].style.display = '';
        }
        if (paywallBox) paywallBox.style.display = '';
        if (qrCodeBox) qrCodeBox.style.display = '';
        const page5_1 = element.querySelector('.page-5-1');
        if(page5_1) page5_1.style.display = '';
        element.classList.remove('pdf-export-mode');
        element.classList.remove('pdf-export-chi-tiet');
        
        // RESTORE INLINE STYLES
        element.style.padding = oldPadding;
        element.style.gap = oldGap;
        element.style.background = oldBackground;
    });
}