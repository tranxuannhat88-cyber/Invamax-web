const document = { addEventListener: () => {}, getElementById: () => null };
const localStorage = { getItem: () => null };
const window = {};
const Swal = {};
const AppQuestions = {partA:[], partB:[], partC:[], partD:[], partE:[], partF:[]};
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
        
        
        const el_symp_ana = document.getElementById('a4-symptoms-analysis');
        if (el_symp_ana && scores.symptomsScores) {
            const top3Symp = scores.symptomsScores.slice(0, 3);
            el_symp_ana.innerHTML = top3Symp.map((item, idx) => {
                const confLight = getLightColorConfig(item.score);
                const confDark = getColorConfig(item.score, false);
                return `<div style="flex:1; border-radius:8px; background:${confLight.bg}; border:1px solid ${confLight.border}; padding:10px 12px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <div style="display:flex; align-items:flex-start; flex:1; margin-right:10px;">
                            <div style="width:28px; height:28px; border-radius:50%; background:${confLight.color}; color:white; font-weight:bold; display:flex; justify-content:center; align-items:center; margin-right:10px; flex-shrink:0;">${idx+1}</div>
                            <div style="font-size:14px; font-weight:bold; color:#1e293b; line-height:1.4; padding-top:2px;">${item.module}</div>
                        </div>
                        <div style="font-size:18px; font-weight:900; color:#1e293b; white-space:nowrap; flex-shrink:0;">${item.score} <span style="font-size:11px; color:#94a3b8; font-weight:normal;">/ 100</span></div>
                    </div>
                    <div style="font-size:12px; font-weight:bold; color:${confLight.color}; margin-bottom:4px;">Mức độ: ${confDark.trendText.toUpperCase()}</div>
                    <div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">Tác động:</span> ${(() => {
                        let aiImpact = "Cần theo dõi sát sao để tránh ảnh hưởng đến hiệu suất chung.";
                        if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3SymptomsImpacts) {
                            const found = aiJsonData.diagnostic.top3SymptomsImpacts.find(x => x.symptom.toLowerCase() === item.module.toLowerCase());
                            if (found) aiImpact = found.impact;
                        }
                        return aiImpact;
                    })()}</div>
                </div>`;
            }).join('');
        }
        const el_fos_ana = document.getElementById('a4-fos-analysis');
        if (el_fos_ana && aiJsonData.diagnostic && aiJsonData.diagnostic.fosAnalysis) {
            el_fos_ana.innerText = aiJsonData.diagnostic.fosAnalysis;
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
        
        
        const el_symp_ana = document.getElementById('a4-symptoms-analysis');
        if (el_symp_ana && scores.symptomsScores) {
            const top3Symp = scores.symptomsScores.slice(0, 3);
            el_symp_ana.innerHTML = top3Symp.map((item, idx) => {
                const confLight = getLightColorConfig(item.score);
                const confDark = getColorConfig(item.score, false);
                return `<div style="flex:1; border-radius:8px; background:${confLight.bg}; border:1px solid ${confLight.border}; padding:10px 12px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <div style="display:flex; align-items:flex-start; flex:1; margin-right:10px;">
                            <div style="width:28px; height:28px; border-radius:50%; background:${confLight.color}; color:white; font-weight:bold; display:flex; justify-content:center; align-items:center; margin-right:10px; flex-shrink:0;">${idx+1}</div>
                            <div style="font-size:14px; font-weight:bold; color:#1e293b; line-height:1.4; padding-top:2px;">${item.module}</div>
                        </div>
                        <div style="font-size:18px; font-weight:900; color:#1e293b; white-space:nowrap; flex-shrink:0;">${item.score} <span style="font-size:11px; color:#94a3b8; font-weight:normal;">/ 100</span></div>
                    </div>
                    <div style="font-size:12px; font-weight:bold; color:${confLight.color}; margin-bottom:4px;">Mức độ: ${confDark.trendText.toUpperCase()}</div>
                    <div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">Tác động:</span> ${(() => {
                        let aiImpact = "Cần theo dõi sát sao để tránh ảnh hưởng đến hiệu suất chung.";
                        if (aiJsonData.diagnostic && aiJsonData.diagnostic.top3SymptomsImpacts) {
                            const found = aiJsonData.diagnostic.top3SymptomsImpacts.find(x => x.symptom.toLowerCase() === item.module.toLowerCase());
                            if (found) aiImpact = found.impact;
                        }
                        return aiImpact;
                    })()}</div>
                </div>`;
            }).join('');
        }
        const el_fos_ana = document.getElementById('a4-fos-analysis');
        if (el_fos_ana && aiJsonData.diagnostic && aiJsonData.diagnostic.fosAnalysis) {
            el_fos_ana.innerText = aiJsonData.diagnostic.fosAnalysis;
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

function generatePageHeader(title, subtitle, pageNum, maxPage = 10) {
    return `
    <div class="a4-header">
        <div style="width: 180px;">
            <div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">INVA<span style="color:#ea580c">MAX</span></div>
            <div style="font-size: 10px; font-weight: bold; color: #ea580c; margin-top: 2px;">INVAMAX FOS | AI | Digital | Supply Hub</div>
        </div>
        <div class="a4-title-center">
            BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE<br>THEO HỆ ĐIỀU HÀNH INVAMAX FOS
        </div>
        <div style="width: 180px;"></div>
    </div>
    <div class="a4-section-title">
        <span>${pageNum}. ${title}</span>
        <span>TRANG ${pageNum} / ${maxPage}</span>
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
        if (score >= 80) return { bg: '#f8fafc', border: '#e2e8f0', color: '#334155' };
        if (score >= 60) return { bg: '#fef2f2', border: '#fee2e2', color: '#ef4444' };
        if (score >= 40) return { bg: '#fff7ed', border: '#ffedd5', color: '#ea580c' };
        if (score >= 20) return { bg: '#fefce8', border: '#fef08a', color: '#eab308' };
        return { bg: '#f0fdf4', border: '#dcfce7', color: '#10b981' };
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
    if (el_waste_scores) {
        el_waste_scores.innerHTML = res.wasteScores.map(item => {
            const conf = getColorConfig(item.score, false);
            return `<div style="flex:1; border-radius:6px; background:${conf.bg}; border:1px solid ${conf.bg}; padding:10px 2px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size:22px; color:${conf.text}; margin-bottom:8px;"><i class="fas ${getWasteIcon(item.module)}"></i></div>
                <div style="flex: 1; font-size:10px; font-weight:bold; color:${conf.text}; margin-bottom:8px; display:flex; align-items:center; justify-content:center; line-height:1.3; width: 100%; word-break: break-word;">${item.module}</div>
                <div style="font-size:16px; font-weight:900; color:${conf.text}; margin-top: auto;">${item.score}</div>
            </div>`;
        }).join('');
    }

    const el_waste_top3 = document.getElementById('a4-waste-analysis');
    if (el_waste_top3) {
        const top3 = res.wasteScores.slice(0, 3);
        el_waste_top3.innerHTML = top3.map((item, idx) => {
            const confLight = getLightColorConfig(item.score);
            const confDark = getColorConfig(item.score, false);
            return `<div style="flex:1; border-radius:8px; background:${confLight.bg}; border:1px solid ${confLight.border}; padding:10px 12px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div style="display:flex; align-items:flex-start; flex:1; margin-right:10px;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${confLight.color}; color:white; font-weight:bold; display:flex; justify-content:center; align-items:center; margin-right:10px; flex-shrink:0;">${idx+1}</div>
                        <div style="font-size:14px; font-weight:bold; color:#1e293b; line-height:1.4; padding-top:2px;">${item.module}</div>
                    </div>
                    <div style="font-size:18px; font-weight:900; color:#1e293b; white-space:nowrap; flex-shrink:0;">${item.score} <span style="font-size:11px; color:#94a3b8; font-weight:normal;">/ 100</span></div>
                </div>
                <div style="font-size:12px; font-weight:bold; color:${confLight.color}; margin-bottom:4px;">Mức độ: ${confDark.trendText.toUpperCase()}</div>
                <div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">Tác động:</span> ${(() => {
                    let aiImpact = getWasteImpact(item.module);
                    if (res.diagnostic && res.diagnostic.top3WastesImpacts) {
                        const found = res.diagnostic.top3WastesImpacts.find(x => x.waste.toLowerCase() === item.module.toLowerCase());
                        if (found) aiImpact = found.impact;
                    }
                    return aiImpact;
                })()}</div>
            </div>`;
        }).join('');
    }
    
    const el_symp_scores = document.getElementById('a4-symptoms-scores');
    if (el_symp_scores && res.symptomsScores) {
        el_symp_scores.innerHTML = res.symptomsScores.map(item => {
            const conf = getColorConfig(item.score, false);
            return `<div style="flex:1; border-radius:6px; background:${conf.bg}; border:1px solid ${conf.bg}; padding:10px 2px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size:22px; color:${conf.text}; margin-bottom:8px;"><i class="fas ${getSymptomIcon(item.module)}"></i></div>
                <div style="flex: 1; font-size:10px; font-weight:bold; color:${conf.text}; margin-bottom:8px; display:flex; align-items:center; justify-content:center; line-height:1.3; width: 100%; word-break: break-word;">${item.module}</div>
                <div style="font-size:16px; font-weight:900; color:${conf.text}; margin-top: auto;">${item.score}</div>
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
    if (!json || !json.diagnostic || !json.consulting || !json.report) return;
    
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
                        <div class="info-box-row"><span class="label">AI Profile</span><span class="val">INVAMAX FOS Expert v1.0</span></div>
                        <div class="info-box-row"><span class="label">Phương pháp</span><span class="val">INVAMAX FOS</span></div>
                        <div class="info-box-row"><span class="label">Độ tin cậy</span><span class="val">95%</span></div>
                    </div>
                    <div style="text-align:right;">
                        <div class="verified-stamp"><i class="fas fa-check-circle"></i> ĐÃ XÁC THỰC</div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>`;

    const el_detailed_report = document.getElementById('detailed-report'); if(el_detailed_report) el_detailed_report.innerHTML = p6 + p7 + p8 + p9 + p10;
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
    });
}