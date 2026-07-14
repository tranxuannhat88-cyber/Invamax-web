import { questionsData } from './questions.js';
import { calculateResults } from './scoring.js';
import { submitDataToGoogleSheet } from './api.js';

const LS_KEY = 'kham_benh_draft';
const form = document.getElementById('assessmentForm');
const formSteps = Array.from(document.querySelectorAll('.form-step'));
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnSubmit = document.getElementById('btnSubmit');
const progressBar = document.getElementById('progress-bar');
const totalSteps = formSteps.length;
let currentStep = 1;

// Render options cho pháº§n cÃ¢u há»i tráº¯c nghiá»‡m (8W vÃ  FOS)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Render 8W
    const waste8Container = document.getElementById('waste8-container');
    if(waste8Container) {
        waste8Container.innerHTML = questionsData.waste8.map((q, index) => `
            <div class="question-block" id="block-${q.id}">
                <div class="question-header">
                    <span class="question-number">CÃ¢u ${index + 1}</span>
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

    // 2. Render FOS
    const renderFos = (groupId, dataList) => {
        const container = document.getElementById(groupId);
        if(container) {
            container.innerHTML = dataList.map((q, index) => `
                <div class="question-block" id="block-${q.id}">
                    <div class="question-header">
                        <span class="question-number">CÃ¢u ${index + 1}</span>
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
    
    renderFos('fos1-container', questionsData.fosGroup1);
    renderFos('fos2-container', questionsData.fosGroup2);
    renderFos('fos3-container', questionsData.fosGroup3);

    // Xá»­ lÃ½ Checkbox Æ¯u tiÃªn cáº£i tiáº¿n (Tá»‘i Ä‘a 3)
    const priorityCheckboxes = document.querySelectorAll('input[name="priority"]');
    priorityCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('input[name="priority"]:checked').length;
            if (checkedCount > 3) {
                cb.checked = false; // Bá» chá»n náº¿u quÃ¡ 3
                alert("Báº¡n chá»‰ Ä‘Æ°á»£c chá»n tá»‘i Ä‘a 3 má»©c Ä‘á»™ Æ°u tiÃªn!");
            }
        });
    });

    // Load draft náº¿u cÃ³
    loadDraft();
    updateUI();

    // Auto save draft on change
    form.addEventListener('change', saveDraft);
    form.addEventListener('input', saveDraft);
});

// Äiá»u hÆ°á»›ng
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

// Validate Step
function validateStep(stepIndex) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${stepIndex}"]`);
    if (!currentStepElement) return true;

    // Remove old error classes
    currentStepElement.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));

    let isValid = true;
    
    // Check radio buttons
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

    // Check text/select inputs
    const requiredInputs = currentStepElement.querySelectorAll('input[type="text"][required], input[type="email"][required], input[type="tel"][required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') return; // ÄÃ£ check á»Ÿ trÃªn
        
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
                const block = input.closest('.question-block, .form-group'); if (block) block.classList.add('error-border');
            }
        }
    });

    // Valid riÃªng cho bÆ°á»›c 6 (Multi-select Priority)
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

    if (!isValid) alert('Vui lòng điền đầy đủ các trường bắt buộc có dấu (*).'); return isValid; }

// Cáº­p nháº­t giao diá»‡n (áº¨n/hiá»‡n bÆ°á»›c, nÃºt báº¥m, progress bar)
function updateUI() {
    formSteps.forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) === currentStep) {
            step.classList.add('active');
        }
    });

    // Cáº­p nháº­t progress bar
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // áº¨n hiá»‡n nÃºt báº¥m
    btnPrev.style.display = currentStep === 1 || currentStep === totalSteps ? 'none' : 'inline-flex';
    btnNext.style.display = currentStep >= totalSteps - 1 ? 'none' : 'inline-flex';
    btnSubmit.style.display = currentStep === totalSteps - 1 ? 'inline-flex' : 'none';
    
    // áº¨n vÃ¹ng footer nÃºt báº¥m á»Ÿ bÆ°á»›c káº¿t quáº£
    document.getElementById('form-footer').style.display = currentStep === totalSteps ? 'none' : 'flex';
}

// LÆ°u nhÃ¡p vÃ o localStorage
function saveDraft() {
    const formData = new FormData(form);
    // Xá»­ lÃ½ cÃ¡c checkbox multiple values
    const draft = Object.fromEntries(formData.entries());
    const priorities = formData.getAll("priority");
    if(priorities.length > 0) {
        draft["priority"] = priorities;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(draft));
}

// Táº£i nhÃ¡p tá»« localStorage
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
        console.error("Lá»—i parse draft", e);
    }
}

// Submit Form
async function submitForm() {
    if (!validateStep(7)) {
        alert("Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin liÃªn há»‡.");
        return;
    }

    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<i data-lucide="loader" class="spin"></i> Äang phÃ¢n tÃ­ch dá»¯ liá»‡u...`;
    btnSubmit.disabled = true;

    // Thu tháº­p dá»¯ liá»‡u
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());
    // Xá»­ lÃ½ riÃªng trÆ°á»ng priority (tráº£ vá» chuá»—i cÃ¡ch nhau báº±ng dáº¥u pháº©y)
    formObj['priority'] = formData.getAll('priority').join(', ');

    // TÃ¡ch cÃ¢u tráº£ lá»i chuáº©n Ä‘oÃ¡n ra riÃªng Ä‘á»ƒ tÃ­nh Ä‘iá»ƒm
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

    // TÃ­nh Ä‘iá»ƒm
    const results = calculateResults(diagnosticAnswers);

    // Chuáº©n bá»‹ Payload cho API
    const payload = {
        factoryInfo: {
            name: formObj['factoryName'],
            industry: formObj['industry'],
            mainProduct: formObj['mainProduct'],
            address: formObj['address'],
            years: formObj['years'],
            scale: formObj['scale']
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

    console.log("Payload sáº½ gá»­i Ä‘i:", JSON.stringify(payload, null, 2));

    // Gá»i API
    const isSuccess = await submitDataToGoogleSheet(payload);

    btnSubmit.innerHTML = originalBtnText;
    btnSubmit.disabled = false;
    
    // XÃ³a nhÃ¡p vÃ¬ Ä‘Ã£ hoÃ n thÃ nh
    localStorage.removeItem(LS_KEY);

    // Chuyá»ƒn sang bÆ°á»›c káº¿t quáº£
    currentStep = totalSteps;
    renderResults(results);
    updateUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render dá»¯ liá»‡u káº¿t quáº£ ra mÃ n hÃ¬nh
function renderResults(res) {
    document.getElementById('res-score').innerText = res.warningScore;
    document.getElementById('res-level').innerText = res.assessmentLevel;
    document.getElementById('res-general').innerText = res.generalAssessment;
    document.getElementById('res-nextsteps').innerText = res.nextSteps;

    const topWastesEl = document.getElementById('res-top-wastes');
    topWastesEl.innerHTML = res.top3Wastes.map(w => `<li>${w}</li>`).join('');

    const topFosEl = document.getElementById('res-top-fos');
    topFosEl.innerHTML = res.top3FOS.map(f => `<li>${f}</li>`).join('');

    const diseasesEl = document.getElementById('res-diseases');
    diseasesEl.innerHTML = res.diseases.map(d => `<li>${d}</li>`).join('');
    
    // Logic Ä‘á»• mÃ u vá»›i 5 cáº¥p Ä‘á»™
    const scoreCircle = document.getElementById('score-circle-ui');
    const levelBadge = document.getElementById('res-level');
    let circleColor = "#7f1d1d";
    let levelText = "";
    
    if(res.warningScore <= 20) { circleColor = "#10b981"; levelText = "á»”n Ä‘á»‹nh / Ráº¥t tá»‘t"; }
    else if(res.warningScore <= 40) { circleColor = "#84cc16"; levelText = "CÃ³ vÃ i Ä‘iá»ƒm ngháº½n"; }
    else if(res.warningScore <= 60) { circleColor = "#f59e0b"; levelText = "CÃ³ dáº¥u hiá»‡u rá»‘i váº­n hÃ nh"; }
    else if(res.warningScore <= 80) { circleColor = "#ef4444"; levelText = "Bá»‡nh váº­n hÃ nh rÃµ rÃ ng"; }
    else { circleColor = "#7f1d1d"; levelText = "BÃ¡o Ä‘á»™ng Ä‘á» (Nguy hiá»ƒm)"; }
    
    // GÃ¡n style cho vÃ²ng trÃ²n vÃ  label tráº¡ng thÃ¡i
    scoreCircle.style.setProperty('--circle-color', circleColor);
    levelBadge.style.backgroundColor = circleColor;
    levelBadge.innerText = levelText;
    
    // Animate progress
    setTimeout(() => {
        scoreCircle.style.setProperty('--progress', res.warningScore + '%');
    }, 100);
}

// Logic cho Modal Thanh toÃ¡n
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('paymentModal');
    const btnShow = document.getElementById('btnShowPayment');
    const spanClose = document.getElementById('closeModal');
    const qrImg = document.getElementById('payment-qr-img');
    const phonePlaceholder = document.getElementById('payment-phone-placeholder');

    if(btnShow && modal && spanClose) {
        btnShow.addEventListener('click', () => {
            // Láº¥y sá»‘ Ä‘iá»‡n thoáº¡i tá»« form
            const formObj = Object.fromEntries(new FormData(form).entries());
            let phone = formObj['phone'] || '0945530699';
            
            // XÃ³a khoáº£ng tráº¯ng náº¿u cÃ³
            phone = phone.replace(/\s+/g, '');

            // Cáº­p nháº­t text hiá»ƒn thá»‹
            phonePlaceholder.innerText = phone;

            // Táº¡o link QR Code dáº¡ng tiÃªu chuáº©n tá»« VietQR (khÃ´ng dÃ¹ng compact2)
            const amount = 990000;
            const bankId = 'MB';
            const accountNo = '5757658888';
            const accountName = 'INVAMAX';
            const addInfo = 'KBM ' + phone;
            
            const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
            
            qrImg.src = qrUrl;

            // Hiá»ƒn thá»‹ modal
            modal.style.display = "block";
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
});

// Logic táº£i BÃ¡o cÃ¡o sÆ¡ bá»™ PDF
document.addEventListener('DOMContentLoaded', () => {
    const btnDownload = document.getElementById('btnDownloadPdf');
    if(btnDownload) {
        btnDownload.addEventListener('click', () => {
            const resultElement = document.querySelector('.form-step[data-step="8"]');
            resultElement.classList.add('pdf-export-mode');
            setTimeout(() => {
            
            // áº¨n táº¡m nÃºt cta Ä‘á»ƒ khÃ´ng dÃ­nh vÃ o PDF
            const ctaBox = resultElement.querySelector('.cta-box').parentElement;
            ctaBox.style.display = 'none';

            // Cáº¥u hÃ¬nh html2pdf
            var opt = {
                margin:       10,
                filename:     'INVAMAX_Bao_Cao_So_Bo.pdf',
                image:        { type: 'jpeg', quality: 1 },
                html2canvas:  { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Thá»±c hiá»‡n táº£i PDF
            const originalText = btnDownload.innerText;
            btnDownload.innerText = 'Ä ang táº¡o PDF...';
            
            setTimeout(() => {
                html2pdf().set(opt).from(resultElement).save().then(() => {
                    ctaBox.style.display = 'grid'; // Hiển thị lại nút bấm
                    btnDownload.innerText = originalText;
                    resultElement.classList.remove('pdf-export-mode');
                }).catch(e => {
                    console.error('Lỗi khi tạo PDF:', e);
                    ctaBox.style.display = 'grid';
                    btnDownload.innerText = originalText;
                    resultElement.classList.remove('pdf-export-mode');
                    alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
                });
            }, 100);
        });
    }
});
