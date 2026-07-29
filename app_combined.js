// Dữ liệu câu hỏi giờ được tải từ questions_data.js (biến AppQuestions toàn cục)

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
        fosScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 0 : Math.round((getGroupScore(questions) / 4) * 100)
        });
    });

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
    fosScores.sort(sortDesc);

    const top3Wastes = wasteScores.slice(0, 3).map(item => item.module);
    const top3FOS = fosScores.slice(0, 3).map(item => item.module);

    return { warningScore, assessmentLevel, generalAssessment, diseases, nextSteps, top3Wastes, top3FOS, wasteScores, fosScores };
}

const GAS_URL = "https://script.google.com/macros/s/AKfycbxA0w8vMs95Aswa2nOKhM8EJs2U5Y2nFj4pG_goURBGTDt0w0tJNQlecGsQD9uno0FLnA/exec"; 

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
    function renderGroup(groupId, questions) {
        const container = document.getElementById(groupId);
        if (!container) return;
        
        container.innerHTML = questions.map((q, index) => {
            let inputHtml = '';
            let isRequired = q.batBuoc ? 'required' : '';
            
            let loai = (q.loaiTraLoi || '').toLowerCase();
            
            if (loai.includes('văn bản')) {
                if (q.id === 'E04') {
                    inputHtml = `<textarea name="${q.id}" class="form-control" placeholder="${q.huongDan || ''}" rows="3" ${isRequired}></textarea>`;
                } else {
                    inputHtml = `<input type="text" name="${q.id}" class="form-control" placeholder="${q.huongDan || ''}" ${isRequired}>`;
                }
            } else if (loai === 'điền số') {
                inputHtml = `<input type="number" name="${q.id}" class="form-control" placeholder="${q.huongDan || ''}" ${isRequired}>`;
            } else if (loai === 'danh sách') {
                inputHtml = `
                    <select name="${q.id}" class="form-control" ${isRequired}>
                        <option value="">-- Chọn --</option>
                        ${q.dapAn.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                `;
            } else if (loai.includes('nhiều lựa chọn') || loai.includes('tối đa')) {
                inputHtml = `
                    <div class="pill-group" style="display: flex; flex-wrap: wrap; gap: 12px;">
                        ${q.dapAn.map((opt, i) => `
                            <label class="priority-pill">
                                <input type="checkbox" name="${q.id}" value="${opt}" ${q.batBuoc ? 'data-required="true"' : ''}> <span>${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
            } else if (loai === 'check box') {
                inputHtml = `
                    <label style="display:flex; align-items:flex-start; gap:8px;">
                        <input type="checkbox" name="${q.id}" value="Đồng ý" ${q.batBuoc ? 'data-required="true"' : ''} style="margin-top:3px;">
                        <span style="font-size:14px; color:var(--text-color);">${q.cauHoi}</span>
                    </label>
                `;
                q.cauHoi = ''; // Hide default question title
            } else if (loai.includes('thang điểm') || loai.includes('chọn một') || (q.dapAn && q.dapAn.length > 0)) {
                inputHtml = `
                    <div class="options-group">
                        ${q.dapAn.map((optText, optIndex) => `
                            <label class="option-label">
                                <input type="radio" name="${q.id}" value="${optIndex}" ${isRequired}>
                                <span class="option-custom"></span>
                                <span class="option-text">${optText}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
            }

            let moduleHeader = q.nhom ? `<span class="question-module">${q.nhom}</span>` : '';

            return `
                <div class="question-block" id="block-${q.id}">
                    <div class="question-header" style="align-items: flex-start; margin-bottom: 12px;">
                        <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                            <span class="question-number" style="white-space: nowrap; margin-top: -2px;">Câu ${index + 1}</span>
                            <h4 class="question-text" style="margin-bottom: 0; padding-right: 15px;">${q.cauHoi} ${q.batBuoc ? '<span style="color: #ea580c; margin-left: 4px;">*</span>' : ''}</h4>
                        </div>
                        ${moduleHeader}
                    </div>
                    ${q.huongDan ? `<p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">${q.huongDan}</p>` : ''}
                    ${inputHtml}
                </div>
            `;
        }).join('');
    }

    renderGroup('partA-container', AppQuestions.partA);
    renderGroup('partB-container', AppQuestions.partB);
    renderGroup('partC-container', AppQuestions.partC);
    renderGroup('partD-container', AppQuestions.partD);
    renderGroup('partE-container', AppQuestions.partE);
    renderGroup('partF-container', AppQuestions.partF);

    if (AppQuestions.partF && AppQuestions.partF.description) {
        const descEl = document.getElementById('partF-description');
        if (descEl) descEl.innerText = AppQuestions.partF.description;
    }

    AppQuestions.partE.forEach(q => {
        let loai = (q.loaiTraLoi || '').toLowerCase();
        if (loai.includes('nhiều lựa chọn') || loai.includes('tối đa')) {
            const priorityCheckboxes = document.querySelectorAll(`input[name="${q.id}"]`);
            let maxLimit = 3;
            let match = q.loaiTraLoi.match(/\d+/);
            if (match) maxLimit = parseInt(match[0]);
            if (q.id === 'E01') maxLimit = 5; // User specifically requested 5 for Q1

            priorityCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const checkedCount = document.querySelectorAll(`input[name="${q.id}"]:checked`).length;
                    if (checkedCount > maxLimit) {
                        cb.checked = false;
                        alert(`Bạn chỉ được chọn tối đa ${maxLimit} đáp án!`);
                    }
                });
            });
        }
    });

    loadDraft();
    updateUI();

    form.addEventListener('change', saveDraft);
    form.addEventListener('input', saveDraft);

    const modal = document.getElementById('paymentModal');
    const btnShow = document.getElementById('btn-show-payment');
    const spanClose = document.getElementById('closeModal');
    const qrImg = document.getElementById('payment-qr-img');
    const phonePlaceholder = document.getElementById('payment-phone-placeholder');

    if(btnShow && modal && spanClose) {
        btnShow.addEventListener('click', () => {
            const formObj = Object.fromEntries(new FormData(form).entries());
            let phone = formObj['F04'] || '0945530699'; // Tùy chỉnh id theo câu số điện thoại (F04)
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

    const btnDownload = document.getElementById('a4-btn-download');
    if(btnDownload) {
        btnDownload.addEventListener('click', () => {
            const resultElement = document.querySelector(`.form-step[data-step="${totalSteps}"]`);
            resultElement.classList.add('pdf-export-mode');
            
            const ctaBox = resultElement.querySelector('.cta-box');
            if (ctaBox) ctaBox.style.display = 'none';

            var opt = {
                margin:       0,
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

    const checkboxGroups = new Set();
    currentStepElement.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach(cb => {
        checkboxGroups.add(cb.name);
    });

    checkboxGroups.forEach(name => {
        if (currentStepElement.querySelectorAll(`input[name="${name}"]:checked`).length === 0) {
            isValid = false;
            const block = currentStepElement.querySelector(`input[name="${name}"]`).closest('.question-block');
            if (block) {
                block.classList.add('error-border');
            }
        }
    });

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
}

function saveDraft() {
    if(currentStep === totalSteps) return; // Do not save if already at result
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());
    
    // Combine checkboxes
    AppQuestions.partE.forEach(q => {
        let loai = (q.loaiTraLoi || '').toLowerCase();
        if (loai.includes('nhiều lựa chọn') || loai.includes('tối đa')) {
            const vals = formData.getAll(q.id);
            if(vals.length > 0) {
                formObj[q.id] = vals;
            }
        }
    });

    localStorage.setItem(LS_KEY, JSON.stringify({ currentStep, formObj }));
}

function loadDraft() {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.formObj) {
                for (let key in data.formObj) {
                    const el = form.elements[key];
                    if (el) {
                        if (el.type === 'radio') {
                            const radio = Array.from(form.elements[key]).find(r => r.value === data.formObj[key]);
                            if (radio) radio.checked = true;
                        } else if (el.type === 'checkbox' || (el.length && el[0].type === 'checkbox')) {
                            // Part E multiple select
                            const arr = Array.isArray(data.formObj[key]) ? data.formObj[key] : [data.formObj[key]];
                            const checkboxes = document.querySelectorAll(`input[name="${key}"]`);
                            checkboxes.forEach(cb => {
                                if(arr.includes(cb.value)) {
                                    cb.checked = true;
                                }
                            });
                        } else {
                            el.value = data.formObj[key];
                        }
                    }
                }
            }
            if (data.currentStep && data.currentStep < totalSteps) {
                currentStep = data.currentStep;
            }
        } catch(e) {
            console.error('Error loading draft', e);
        }
    }
}

async function submitForm() {
    if (!validateStep(6)) {
        return;
    }
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<i data-lucide="loader" class="spin"></i> Đang phân tích dữ liệu...`;
    btnSubmit.disabled = true;

    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());
    
    // Handle Part E checkboxes (multiple choice)
    AppQuestions.partE.forEach(q => {
        let loai = (q.loaiTraLoi || '').toLowerCase();
        if (loai.includes('nhiều lựa chọn') || loai.includes('tối đa')) {
            formObj[q.id] = formData.getAll(q.id).join(', ');
        }
    });

    const diagnosticAnswers = {};
    const questionIds = [
        ...AppQuestions.partB, 
        ...AppQuestions.partC, 
        ...AppQuestions.partD
    ].map(q => q.id);

    questionIds.forEach(id => {
        if (formObj[id] !== undefined) {
            diagnosticAnswers[id] = formObj[id];
        }
    });

    const results = calculateResults(diagnosticAnswers);

    let factoryInfo = {};
    AppQuestions.partA.forEach(q => {
        factoryInfo[q.id] = formObj[q.id];
    });

    let contactInfo = {};
    AppQuestions.partF.forEach(q => {
        contactInfo[q.id] = formObj[q.id];
    });
    
    let priorityInfo = {};
    AppQuestions.partE.forEach(q => {
        priorityInfo[q.id] = formObj[q.id];
    });

    const payload = {
        factoryInfo: factoryInfo,
        contactInfo: contactInfo,
        priorityInfo: priorityInfo,
        rawAnswers: formObj,
        scores: results
    };

    const isSuccess = await submitDataToGoogleSheet(payload);

    btnSubmit.innerHTML = originalBtnText;
    btnSubmit.disabled = false;
    
    localStorage.removeItem(LS_KEY);

    currentStep = totalSteps;
    renderResults(payload);
    updateUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderResults(payload) {
    const res = payload.scores;
    const info = payload.factoryInfo;
    const contact = payload.contactInfo;

    const findValByMaCau = (maCau, dataObj) => {
        for (const [key, partArray] of Object.entries(AppQuestions)) {
            if (Array.isArray(partArray)) {
                const q = partArray.find(x => x.maCau === maCau);
                if (q && dataObj[q.id] !== undefined) {
                    return dataObj[q.id];
                }
            }
        }
        return '---';
    };

    // Trang 1
    const companyName = findValByMaCau('A01', info);
    const mainProduct = findValByMaCau('A04', info);
    const contactName = findValByMaCau('F01', contact);
    const jobTitle = findValByMaCau('F02', contact);
    const phone = findValByMaCau('F04', contact); // Zalo phone

    document.getElementById('a4-company').innerText = companyName || '---';
    document.getElementById('a4-product').innerText = mainProduct || '---';
    document.getElementById('a4-name').innerText = contactName || '---';
    document.getElementById('a4-job').innerText = jobTitle || '---';
    document.getElementById('a4-phone').innerText = phone || '---';
    
    document.getElementById('a4-general-desc').innerText = res.generalAssessment;

    let levelText = "";
    let levelColor = "";
    let recText = "";
    const s = res.warningScore; 
    const healthPercent = 100 - s;

    if(s <= 20) { 
        levelText = "KHỎE MẠNH"; levelColor = "#10b981"; 
        recText = "Khuyến nghị: Duy trì tiêu chuẩn và tập trung cải tiến liên tục.";
    }
    else if(s <= 40) { 
        levelText = "CẢNH BÁO"; levelColor = "#eab308"; 
        recText = "Khuyến nghị: Kiểm tra các khu vực có điểm cao để ngăn vấn đề lan rộng.";
    }
    else if(s <= 60) { 
        levelText = "MẮC BỆNH"; levelColor = "#f97316"; 
        recText = "Khuyến nghị: Thực hiện đánh giá chuyên sâu và lập kế hoạch cải tiến ưu tiên.";
    }
    else if(s <= 80) { 
        levelText = "BỆNH NẶNG"; levelColor = "#ef4444"; 
        recText = "Khuyến nghị: Triển khai chương trình cải tiến có người chịu trách nhiệm và theo dõi hàng ngày.";
    }
    else { 
        levelText = "NGUY KỊCH"; levelColor = "#334155"; 
        recText = "Khuyến nghị: Ưu tiên đánh giá hiện trường toàn diện và xử lý các vấn đề trọng yếu trước khi mở rộng cải tiến.";
    }
    
    document.getElementById('a4-level-text').innerText = `MỨC ĐỘ: ${levelText}`;
    document.getElementById('a4-level-text').style.color = levelColor;
    document.getElementById('a4-score-text').innerText = `${healthPercent} / 100`;
    document.getElementById('a4-score-text').style.color = levelColor;

    const recTextEl = document.getElementById('a4-recommendation-text');
    if(recTextEl) {
        recTextEl.innerText = recText;
        recTextEl.style.color = levelColor;
    }
    
    const top3IssuesEl = document.getElementById('a4-top-3-issues');
    if (top3IssuesEl) {
        top3IssuesEl.innerHTML = res.diseases.map(disease => `
            <div class="a4-issue-card">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 24px; margin-bottom: 10px;"></i>
                <div class="title" style="font-weight: bold; color: #1e293b;">${disease}</div>
            </div>
        `).join('');
    }

    const fosShortfallsEl = document.getElementById('a4-top3-fos');
    if (fosShortfallsEl) {
        fosShortfallsEl.innerHTML = res.top3FOS.map(item => `
            <div class="a4-issue-card" style="background: #fff1f2; color: #e11d48; padding: 12px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; border-left: 4px solid #e11d48; display: flex; align-items: center; justify-content: space-between;">
                <span>${item}</span>
                <i class="fas fa-exclamation-circle"></i>
            </div>
        `).join('');
    }

    setTimeout(() => {
        if (typeof initCharts === 'function') initCharts(res);
    }, 100);

    // QR Code for the PDF Report inline
    const amount = 990000;
    const bankId = 'MB';
    const accountNo = '5757658888';
    const accountName = 'INVAMAX';
    let cleanPhone = (phone || '0945530699').replace(/\s+/g, '');
    const addInfo = 'KBM ' + cleanPhone;
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
    
    const qrImgInline = document.getElementById('a4-qr-img-inline');
    if (qrImgInline) {
        qrImgInline.src = qrUrl;
    }
    const qrPhoneInline = document.getElementById('a4-qr-phone-inline');
    if (qrPhoneInline) {
        qrPhoneInline.innerText = cleanPhone;
    }
}

function initCharts(res) {
    // 1. Gauge Chart
    const ctxGauge = document.getElementById('gaugeChart');
    if (ctxGauge) {
        // Destroy existing chart if any
        if(window.gaugeChartInstance) window.gaugeChartInstance.destroy();
        
        window.gaugeChartInstance = new Chart(ctxGauge, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [20, 20, 20, 20, 20],
                    backgroundColor: ['#10b981', '#eab308', '#f97316', '#ef4444', '#334155'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270,
                    needleValue: res.warningScore
                }]
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            },
            plugins: [{
                id: 'gaugeNeedle',
                afterDatasetDraw(chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    ctx.save();
                    const needleValue = chart.data.datasets[0].needleValue;
                    const angle = Math.PI + (needleValue / 100) * Math.PI;
                    const cx = chart.chartArea.left + width / 2;
                    const cy = chart.chartArea.top + height;

                    ctx.translate(cx, cy);
                    ctx.rotate(angle);
                    ctx.beginPath();
                    ctx.moveTo(0, -5);
                    ctx.lineTo(height - 20, 0);
                    ctx.lineTo(0, 5);
                    ctx.fillStyle = '#1e293b';
                    ctx.fill();
                    ctx.restore();
                    
                    ctx.beginPath();
                    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
                    ctx.fillStyle = '#1e293b';
                    ctx.fill();
                    ctx.restore();
                }
            }]
        });
    }

    // 2. Radar Chart
    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar) {
        if(window.radarChartInstance) window.radarChartInstance.destroy();
        window.radarChartInstance = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: res.wasteScores.map(w => w.module),
                datasets: [{
                    label: 'Điểm Lãng Phí',
                    data: res.wasteScores.map(w => w.score),
                    backgroundColor: 'rgba(234, 88, 12, 0.2)',
                    borderColor: '#ea580c',
                    pointBackgroundColor: '#ea580c',
                    borderWidth: 2
                }]
            },
            options: {
                animation: false,
                scales: {
                    r: { min: 0, max: 100, ticks: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
    // Render advanced A4 UI components
    if (typeof renderAdvancedUI === 'function') {
        renderAdvancedUI(res);
    }
    
    renderRawDataReview(res, payload.rawAnswers);
    
    // Add default Quick Wins for client preview
    const quickWinsEl = document.getElementById('a4-quick-wins');
    if (quickWinsEl && res.top3FOS && res.top3FOS.length >= 1) {
        quickWinsEl.innerHTML = `
            <li style="margin-bottom: 8px;"><strong>Đào tạo nhận thức cơ bản về Lãng phí:</strong> Mở ngay 1 buổi họp toàn xưởng để định nghĩa lại các Lãng phí (Wastes) đang tồn đọng tại ${res.top3FOS[0]} và ${res.top3FOS[1] || 'các công đoạn'}.</li>
            <li style="margin-bottom: 8px;"><strong>Thiết lập quản lý trực quan (Visual Management):</strong> Dán nhãn, kẻ vạch, quy định rõ ràng vị trí vật tư tại khu vực dễ xảy ra lỗi nhất.</li>
            <li style="margin-bottom: 8px;"><strong>Áp dụng họp giao ban 10 phút (Daily Huddle):</strong> Quản đốc/Tổ trưởng cần đứng họp 10 phút đầu ca để rà soát mục tiêu sản lượng và chất lượng.</li>
            <li style="margin-bottom: 8px;"><strong>Xác định Nút thắt (Bottleneck):</strong> Đo thời gian thao tác tại trạm đang bị ùn ứ nhiều nhất để cân bằng lại nhịp điệu (Takt Time).</li>
            <li style="margin-bottom: 8px;"><strong>Tiêu chuẩn hóa thao tác (SOP):</strong> Viết ra 1 tờ giấy A4 duy nhất quy trình thao tác chuẩn cho công đoạn hay bị lỗi nhất và dán ngay trước mặt công nhân.</li>
        `;
    }
}



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


function renderAdvancedUI(res) {
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
}

