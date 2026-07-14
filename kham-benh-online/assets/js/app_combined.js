// Dữ liệu câu hỏi giả lập cho hệ thống Khám bệnh nhà máy
const optionsTemplate = [
    "Hoàn toàn không có / Được kiểm soát rất tốt",
    "Thỉnh thoảng xảy ra / Có kiểm soát cơ bản",
    "Thường xuyên xảy ra / Khó kiểm soát",
    "Xảy ra liên tục, ảnh hưởng nghiêm trọng",
    "Không hề đo lường, hoàn toàn mất kiểm soát"
];

const fosOptionsTemplate = [
    "Đã áp dụng triệt để, có hệ thống chuẩn xác",
    "Có áp dụng nhưng chưa đồng bộ",
    "Mới bắt đầu triển khai, còn nhiều bất cập",
    "Chưa triển khai nhưng đang có kế hoạch",
    "Hoàn toàn không có khái niệm hoặc bỏ mặc"
];

const questionsData = {
    waste8: [
        { id: "w1", module: "Lỗi / làm lại", text: "Mức độ sản phẩm bị lỗi, hỏng và phải làm lại trên dây chuyền của bạn?", options: optionsTemplate },
        { id: "w2", module: "Sản xuất thừa", text: "Tình trạng sản xuất vượt quá nhu cầu thực tế của khách hàng hoặc đơn hàng?", options: optionsTemplate },
        { id: "w3", module: "Chờ đợi", text: "Thời gian công nhân hoặc máy móc phải đứng chờ nguyên vật liệu, thông tin?", options: optionsTemplate },
        { id: "w4", module: "Không tận dụng năng lực con người", text: "Mức độ lãng phí chất xám, kỹ năng và ý tưởng đóng góp của nhân viên?", options: optionsTemplate },
        { id: "w5", module: "Vận chuyển thừa", text: "Tình trạng di chuyển nguyên vật liệu, bán thành phẩm qua lại quá nhiều lần?", options: optionsTemplate },
        { id: "w6", module: "Tồn kho", text: "Lượng nguyên vật liệu, bán thành phẩm và thành phẩm tồn đọng trong xưởng?", options: optionsTemplate },
        { id: "w7", module: "Thao tác / di chuyển thừa", text: "Công nhân phải đi lại, tìm kiếm dụng cụ, cúi gập người không cần thiết?", options: optionsTemplate },
        { id: "w8", module: "Gia công thừa", text: "Thực hiện các công đoạn gia công, kiểm tra vượt quá yêu cầu chất lượng của khách hàng?", options: optionsTemplate }
    ],
    fosGroup1: [
        { id: "f1", module: "Core", text: "Sự rõ ràng của mục tiêu cốt lõi (Core) và chiến lược dài hạn được truyền đạt xuống xưởng?", options: fosOptionsTemplate },
        { id: "f2", module: "People", text: "Hệ thống đánh giá, đào tạo và giữ chân nhân sự (People) tại nhà máy?", options: fosOptionsTemplate },
        { id: "f3", module: "Flow", text: "Mức độ trơn tru của dòng chảy sản xuất (Flow) và thông tin xuyên suốt xưởng?", options: fosOptionsTemplate },
        { id: "f4", module: "Standard", text: "Việc áp dụng và tuân thủ các quy trình thao tác chuẩn (Standard Work) của công nhân?", options: fosOptionsTemplate }
    ],
    fosGroup2: [
        { id: "f5", module: "Capacity", text: "Khả năng đo lường, phân bổ và tối ưu hóa năng lực thiết bị, máy móc (Capacity)?", options: fosOptionsTemplate },
        { id: "f6", module: "Daily Management", text: "Hiệu quả của các cuộc họp giao ban hàng ngày (Daily Management) tại xưởng?", options: fosOptionsTemplate },
        { id: "f7", module: "Quality", text: "Hệ thống quản lý chất lượng (Quality) từ đầu vào, trên chuyền đến đầu ra?", options: fosOptionsTemplate },
        { id: "f8", module: "Knowledge", text: "Quá trình lưu trữ, quản trị và kế thừa tri thức (Knowledge), bài học kinh nghiệm?", options: fosOptionsTemplate }
    ],
    fosGroup3: [
        { id: "f9", module: "Digital", text: "Mức độ ứng dụng số hóa (Digital), phần mềm trong quản lý hiện trường?", options: fosOptionsTemplate },
        { id: "f10", module: "Kaizen", text: "Phong trào cải tiến liên tục (Kaizen) và sự chủ động của cấp quản lý / công nhân?", options: fosOptionsTemplate },
        { id: "f11", module: "Sustain", text: "Khả năng duy trì (Sustain) các thành quả cải tiến sau khi dự án kết thúc?", options: fosOptionsTemplate }
    ]
};

function calculateResults(answers) {
    let totalScore = 0;
    let questionCount = 0;
    const wasteScores = [];
    const fosScores = [];

    questionsData.waste8.forEach(q => {
        const score = answers[q.id] !== undefined ? parseInt(answers[q.id]) : 0;
        totalScore += score;
        questionCount++;
        wasteScores.push({ module: q.module, score: score });
    });

    const calculateFOSGroup = (group) => {
        group.forEach(q => {
            const score = answers[q.id] !== undefined ? parseInt(answers[q.id]) : 0;
            totalScore += score;
            questionCount++;
            fosScores.push({ module: q.module, score: score });
        });
    };

    calculateFOSGroup(questionsData.fosGroup1);
    calculateFOSGroup(questionsData.fosGroup2);
    calculateFOSGroup(questionsData.fosGroup3);

    const averageScore = questionCount > 0 ? (totalScore / questionCount) : 0;
    const warningScore = Math.round(averageScore * 25);

    let assessmentLevel = "";
    let generalAssessment = "";
    let diseases = [];
    let nextSteps = "";

    if (warningScore <= 20) {
        assessmentLevel = "Ổn định / Rất tốt";
        generalAssessment = "Nhà máy đang duy trì được các quy trình cơ bản khá tốt. Các lãng phí được kiểm soát ở mức cho phép.";
        diseases = ["Chưa phát hiện bệnh nghiêm trọng", "Một số điểm nghẽn cục bộ nhỏ", "Thiếu sự bứt phá tối ưu"];
        nextSteps = "Tiếp tục duy trì và bắt đầu áp dụng Kaizen nhỏ ở từng bộ phận để tối ưu thêm.";
    } else if (warningScore <= 40) {
        assessmentLevel = "Có vài điểm nghẽn";
        generalAssessment = "Hệ thống bắt đầu bộc lộ các vấn đề ở giai đoạn đầu. Sự liên kết giữa các bộ phận chưa mượt mà.";
        diseases = ["Nút thắt cổ chai ở một số công đoạn", "Bắt đầu xuất hiện lãng phí thời gian chờ", "Quản lý dữ liệu chậm trễ"];
        nextSteps = "Cần rà soát lại quy trình chuẩn (Standard) và tối ưu hóa luồng chảy (Flow) cơ bản.";
    } else if (warningScore <= 60) {
        assessmentLevel = "Có dấu hiệu rối vận hành";
        generalAssessment = "Các triệu chứng lãng phí đang ăn mòn lợi nhuận. Sự thiếu hụt nền tảng quản trị khiến mọi thứ bị phụ thuộc vào con người.";
        diseases = ["Sản xuất ùn ứ, tồn kho mất kiểm soát", "Lỗi hỏng nhiều, chi phí làm lại cao", "Họp hành kém hiệu quả, không có KPI rõ ràng"];
        nextSteps = "Tiến hành khám bệnh chuyên sâu toàn diện 3 ngày, thiết lập lại hệ thống Core & Daily Management.";
    } else if (warningScore <= 80) {
        assessmentLevel = "Bệnh vận hành rõ ràng";
        generalAssessment = "Hệ thống đang trong tình trạng báo động. Mọi hoạt động đều mang tính đối phó, lãng phí lớn.";
        diseases = ["Mất kiểm soát chất lượng và tiến độ", "Chảy máu dòng tiền do lãng phí khổng lồ", "Mất niềm tin nội bộ, quy trình đứt gãy"];
        nextSteps = "Lập tức áp dụng hệ điều hành NỀN FOS Premium để đập đi xây lại nền tảng quản trị xưởng.";
    } else {
        assessmentLevel = "Báo động đỏ (Nguy hiểm)";
        generalAssessment = "Hệ thống đang trong tình trạng khủng hoảng. Rủi ro đứt gãy dây chuyền cực kỳ cao và gây thiệt hại nghiêm trọng.";
        diseases = ["Mất kiểm soát hoàn toàn chất lượng và tiến độ", "Đứt gãy toàn bộ chuỗi cung ứng nội bộ", "Thiếu hụt hoàn toàn khả năng quản trị hiện trường"];
        nextSteps = "Dừng ngay các hoạt động lãng phí, triệu tập ban lãnh đạo để tái cơ cấu toàn diện hệ thống quản lý.";
    }

    const sortDesc = (a, b) => b.score - a.score;
    wasteScores.sort(sortDesc);
    fosScores.sort(sortDesc);

    const top3Wastes = wasteScores.slice(0, 3).map(item => item.module);
    const top3FOS = fosScores.slice(0, 3).map(item => item.module);

    return { warningScore, assessmentLevel, generalAssessment, diseases, nextSteps, top3Wastes, top3FOS };
}

const GAS_URL = "https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec"; 

async function submitDataToGoogleSheet(payload) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const result = await response.json();
            return result.status === "success";
        }
        return false;
    } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error);
        return false;
    }
}

const LS_KEY = 'kham_benh_draft';
const form = document.getElementById('assessmentForm');
const formSteps = Array.from(document.querySelectorAll('.form-step'));
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnSubmit = document.getElementById('btnSubmit');
const progressBar = document.getElementById('progress-bar');
const totalSteps = formSteps.length;
let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
    const waste8Container = document.getElementById('waste8-container');
    if(waste8Container) {
        waste8Container.innerHTML = questionsData.waste8.map((q, index) => `
            <div class="question-block" id="block-${q.id}">
                <div class="question-header">
                    <span class="question-number">Câu ${index + 1}</span>
                    <span class="question-module">${q.module}</span>
                </div>
                <h4 class="question-text">${q.text}</h4>
                <div class="options-group">
                    ${q.options.map((optText, optIndex) => `
                        <label class="option-label">
                            <input type="radio" name="${q.id}" value="${optIndex}" required>
                            <span class="option-custom"></span>
                            <span class="option-text">${optText}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    const renderFos = (groupId, dataList) => {
        const container = document.getElementById(groupId);
        if(container) {
            container.innerHTML = dataList.map((q, index) => `
                <div class="question-block" id="block-${q.id}">
                    <div class="question-header">
                        <span class="question-number">Câu ${index + 1}</span>
                        <span class="question-module">${q.module}</span>
                    </div>
                    <h4 class="question-text">${q.text}</h4>
                    <div class="options-group">
                        ${q.options.map((optText, optIndex) => `
                            <label class="option-label">
                                <input type="radio" name="${q.id}" value="${optIndex}" required>
                                <span class="option-custom"></span>
                                <span class="option-text">${optText}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }
    
    renderFos('fosGroup1-container', questionsData.fosGroup1);
    renderFos('fosGroup2-container', questionsData.fosGroup2);
    renderFos('fosGroup3-container', questionsData.fosGroup3);

    const priorityCheckboxes = document.querySelectorAll('input[name="priority"]');
    priorityCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('input[name="priority"]:checked').length;
            if (checkedCount > 3) {
                cb.checked = false;
                alert("Bạn chỉ được chọn tối đa 3 mức độ ưu tiên!");
            }
        });
    });

    loadDraft();
    updateUI();

    form.addEventListener('change', saveDraft);
    form.addEventListener('input', saveDraft);

    const modal = document.getElementById('paymentModal');
    const btnShow = document.getElementById('btnShowPayment');
    const spanClose = document.getElementById('closeModal');
    const qrImg = document.getElementById('payment-qr-img');
    const phonePlaceholder = document.getElementById('payment-phone-placeholder');

    if(btnShow && modal && spanClose) {
        btnShow.addEventListener('click', () => {
            const formObj = Object.fromEntries(new FormData(form).entries());
            let phone = formObj['phone'] || '0945530699';
            phone = phone.replace(/\s+/g, '');
            phonePlaceholder.innerText = phone;
            const amount = 990000;
            const bankId = 'MB';
            const accountNo = '5757658888';
            const accountName = 'INVAMAX';
            const addInfo = 'KBM ' + phone;
            const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
            qrImg.src = qrUrl;
            modal.style.display = "flex";
        });

        spanClose.addEventListener('click', () => {
            modal.style.display = "none";
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    const btnDownload = document.getElementById('btnDownloadPdf');
    if(btnDownload) {
        btnDownload.addEventListener('click', () => {
            const resultElement = document.querySelector('.form-step[data-step="8"]');
            resultElement.classList.add('pdf-export-mode');
            
            const ctaBox = resultElement.querySelector('.cta-box');
            if (ctaBox) ctaBox.style.display = 'none';

            var opt = {
                margin:       10,
                filename:     'INVAMAX_Bao_Cao_So_Bo.pdf',
                image:        { type: 'jpeg', quality: 1 },
                html2canvas:  { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const originalText = btnDownload.innerText;
            btnDownload.innerText = 'Đang tạo PDF...';
            
            setTimeout(() => {
                html2pdf().set(opt).from(resultElement).save().then(() => {
                    if (ctaBox) ctaBox.style.display = 'block'; 
                    btnDownload.innerText = originalText;
                    resultElement.classList.remove('pdf-export-mode');
                }).catch(e => {
                    console.error('Lỗi khi tạo PDF:', e);
                    if (ctaBox) ctaBox.style.display = 'block';
                    btnDownload.innerText = originalText;
                    resultElement.classList.remove('pdf-export-mode');
                    alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
                });
            }, 500);
        });
    }
});

btnNext.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

btnSubmit.addEventListener('click', submitForm);

function validateStep(stepIndex) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${stepIndex}"]`);
    if (!currentStepElement) return true;

    currentStepElement.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
    let isValid = true;
    
    const radioGroups = new Set();
    currentStepElement.querySelectorAll('input[type="radio"][required]').forEach(radio => {
        radioGroups.add(radio.name);
    });

    radioGroups.forEach(name => {
        if (!currentStepElement.querySelector(`input[name="${name}"]:checked`)) {
            isValid = false;
            const block = currentStepElement.querySelector(`input[name="${name}"]`).closest('.question-block');
            if (block) block.classList.add('error-border');
        }
    });

    const requiredInputs = currentStepElement.querySelectorAll('input[type="text"][required], input[type="email"][required], input[type="tel"][required], input[type="number"][required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') return;
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                const block = input.closest('.question-block, .form-group');
                if (block) block.classList.add('error-border');
            }
        } else {
            if (!input.value.trim()) {
                isValid = false;
                const block = input.closest('.question-block, .form-group'); 
                if (block) block.classList.add('error-border');
            }
        }
    });

    if (stepIndex === 6) {
        const checkedCount = currentStepElement.querySelectorAll('input[name="priority"]:checked').length;
        const errObj = document.getElementById('priority-error');
        if (checkedCount === 0 || checkedCount > 3) {
            isValid = false;
            if(errObj) errObj.style.display = 'block';
        } else {
            if(errObj) errObj.style.display = 'none';
        }
    }

    if (!isValid) alert('Vui lòng điền đầy đủ các trường bắt buộc có dấu (*).');
    return isValid; 
}

function updateUI() {
    formSteps.forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) === currentStep) {
            step.classList.add('active');
        }
    });
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;
    btnPrev.style.display = currentStep === 1 || currentStep === totalSteps ? 'none' : 'inline-flex';
    btnNext.style.display = currentStep >= totalSteps - 1 ? 'none' : 'inline-flex';
    btnSubmit.style.display = currentStep === totalSteps - 1 ? 'inline-flex' : 'none';
    const formFooter = document.getElementById('form-footer');
    if (formFooter) formFooter.style.display = currentStep === totalSteps ? 'none' : 'flex';
}

function saveDraft() {
    const formData = new FormData(form);
    const draft = Object.fromEntries(formData.entries());
    const priorities = formData.getAll("priority");
    if(priorities.length > 0) {
        draft["priority"] = priorities;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(draft));
}

function loadDraft() {
    const draftStr = localStorage.getItem(LS_KEY);
    if (!draftStr) return;
    try {
        const draft = JSON.parse(draftStr);
        for (const key in draft) {
            if(key === 'priority' && Array.isArray(draft[key])) {
                draft[key].forEach(val => {
                    const cb = form.querySelector(`input[name="${key}"][value="${val}"]`);
                    if(cb) cb.checked = true;
                });
            } else {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'radio' || input.type === 'checkbox') {
                        const target = form.querySelector(`[name="${key}"][value="${draft[key]}"]`);
                        if(target) target.checked = true;
                    } else {
                        input.value = draft[key];
                    }
                }
            }
        }
    } catch (e) {
        console.error("Lỗi parse draft", e);
    }
}

async function submitForm() {
    if (!validateStep(7)) {
        return;
    }
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<i data-lucide="loader" class="spin"></i> Đang phân tích dữ liệu...`;
    btnSubmit.disabled = true;

    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());
    formObj['priority'] = formData.getAll('priority').join(', ');

    const diagnosticAnswers = {};
    const questionIds = [
        ...questionsData.waste8, 
        ...questionsData.fosGroup1, 
        ...questionsData.fosGroup2, 
        ...questionsData.fosGroup3
    ].map(q => q.id);

    questionIds.forEach(id => {
        if (formObj[id] !== undefined) {
            diagnosticAnswers[id] = formObj[id];
        }
    });

    const results = calculateResults(diagnosticAnswers);

    const payload = {
        factoryInfo: {
            name: formObj['companyName'],
            industry: formObj['industry'],
            mainProduct: formObj['products'],
            address: formObj['address'],
            years: formObj['years'],
            scale: formObj['employees']
        },
        contactInfo: {
            name: formObj['contactName'],
            jobTitle: formObj['jobTitle'],
            phone: formObj['phone'],
            email: formObj['contactEmail'],
            priority: formObj['priority']
        },
        rawAnswers: formObj,
        scores: results
    };

    const isSuccess = await submitDataToGoogleSheet(payload);

    btnSubmit.innerHTML = originalBtnText;
    btnSubmit.disabled = false;
    
    localStorage.removeItem(LS_KEY);

    currentStep = totalSteps;
    renderResults(results);
    updateUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderResults(res) {
    document.getElementById('res-score').innerText = res.warningScore;
    document.getElementById('res-level').innerText = res.assessmentLevel;
    document.getElementById('res-general').innerText = res.generalAssessment;

    const topWastesEl = document.getElementById('res-top-wastes');
    topWastesEl.innerHTML = res.top3Wastes.map(w => `<li>${w}</li>`).join('');

    const topFosEl = document.getElementById('res-top-fos');
    topFosEl.innerHTML = res.top3FOS.map(f => `<li>${f}</li>`).join('');

    const diseasesEl = document.getElementById('res-diseases');
    diseasesEl.innerHTML = res.diseases.map(d => `<li>${d}</li>`).join('');
    
    const scoreCircle = document.getElementById('score-circle-ui');
    const levelBadge = document.getElementById('res-level');
    let circleColor = "#7f1d1d";
    
    if(res.warningScore <= 20) { circleColor = "#10b981"; }
    else if(res.warningScore <= 40) { circleColor = "#84cc16"; }
    else if(res.warningScore <= 60) { circleColor = "#f59e0b"; }
    else if(res.warningScore <= 80) { circleColor = "#ef4444"; }
    else { circleColor = "#7f1d1d"; }
    
    scoreCircle.style.setProperty('--circle-color', circleColor);
    levelBadge.style.backgroundColor = circleColor;
    // assessmentLevel is already unified from calculateResults
    levelBadge.innerText = res.assessmentLevel;
    
    setTimeout(() => {
        scoreCircle.style.setProperty('--progress', res.warningScore + '%');
    }, 100);
}
