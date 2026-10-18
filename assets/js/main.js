const pageLoadTime = Date.now();

// Global robust mobile menu & navbar interaction
let lastMobileNavToggleTime = 0;
function toggleMobileNav(e) {
    const now = Date.now();
    if (now - lastMobileNavToggleTime < 250) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        return;
    }
    lastMobileNavToggleTime = now;

    if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const navLinksElements = document.querySelectorAll('.nav-links, .site-header nav');
    const mobileMenuBtns = document.querySelectorAll('.mobile-menu-btn, .mobile-toggle');

    let shouldOpen = false;
    navLinksElements.forEach(nl => {
        if (!nl.classList.contains('active') && !nl.classList.contains('open')) {
            shouldOpen = true;
        }
    });

    navLinksElements.forEach(nl => {
        if (shouldOpen) {
            nl.classList.add('active');
            nl.classList.add('open');
        } else {
            nl.classList.remove('active');
            nl.classList.remove('open');
        }
    });

    mobileMenuBtns.forEach(btn => {
        if (shouldOpen) {
            btn.classList.add('active');
            btn.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        } else {
            btn.classList.remove('active');
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
}
window.toggleMobileNav = toggleMobileNav;

function initGlobalMobileMenu() {
    const mobileMenuBtns = document.querySelectorAll('.mobile-menu-btn, .mobile-toggle');
    const navLinksElements = document.querySelectorAll('.nav-links, .site-header nav');

    mobileMenuBtns.forEach(btn => {
        if (btn.dataset.menuBound === 'true') return;
        btn.dataset.menuBound = 'true';

        btn.addEventListener('click', (e) => {
            toggleMobileNav(e);
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const isBtn = e.target.closest && e.target.closest('.mobile-menu-btn, .mobile-toggle');
        const isInsideNav = e.target.closest && e.target.closest('.nav-links, .site-header nav');
        if (isBtn || isInsideNav) return;

        navLinksElements.forEach(nl => {
            nl.classList.remove('active');
            nl.classList.remove('open');
        });
        mobileMenuBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking any link inside nav-links on mobile (except dropdown openers)
    const navInnerLinks = document.querySelectorAll('.nav-links a:not(.nav-title), .site-header nav a:not(.nav-title)');
    navInnerLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 980) {
                navLinksElements.forEach(nl => {
                    nl.classList.remove('active');
                    nl.classList.remove('open');
                });
                mobileMenuBtns.forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('open');
                    btn.setAttribute('aria-expanded', 'false');
                });
            }
        });
    });

    // Mobile dropdown accordion inside mobile menu
    const dropdownTitles = document.querySelectorAll('.nav-item .nav-title');
    dropdownTitles.forEach(title => {
        if (title.dataset.dropdownBound === 'true') return;
        title.dataset.dropdownBound = 'true';

        title.addEventListener('click', (e) => {
            if (window.innerWidth <= 980) {
                const parentItem = title.closest('.nav-item');
                const dropdown = parentItem ? parentItem.querySelector('.nav-dropdown') : null;
                if (dropdown) {
                    e.preventDefault();
                    e.stopPropagation();
                    const willOpen = !parentItem.classList.contains('open');
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.remove('open');
                    });
                    if (willOpen) {
                        parentItem.classList.add('open');
                    }
                }
            }
        });
    });
}

// Run immediately & on DOMContentLoaded to guarantee attachment
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalMobileMenu);
} else {
    initGlobalMobileMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    initGlobalMobileMenu();


    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(24, 35, 30, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.backgroundColor = 'rgba(24, 35, 30, 0.85)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Active menu & Service filtering logic
    function updateActiveMenu() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentHash = window.location.hash;
        const currentPathWithHash = currentPage + currentHash;
        
        const navItems = document.querySelectorAll('.nav-links a');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || href === currentPathWithHash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function filterServices() {
        const hash = window.location.hash;
        const wKhamBenh = document.getElementById('wrapper-kham-benh');
        const wThietKe = document.getElementById('wrapper-thiet-ke');
        const wFos = document.getElementById('wrapper-fos');
        const wAi = document.getElementById('wrapper-ai-digital');
        
        // Only run on dich-vu.html
        if (!wKhamBenh) return;
        
        // Helper to hide all
        function hideAll() {
            if (wKhamBenh) wKhamBenh.style.display = 'none';
            if (wThietKe) wThietKe.style.display = 'none';
            if (wFos) wFos.style.display = 'none';
            if (wAi) wAi.style.display = 'none';
        }
        
        hideAll();
        
        if (hash === '#thiet-ke' && wThietKe) {
            wThietKe.style.display = 'block';
        } else if (hash === '#fos' && wFos) {
            wFos.style.display = 'block';
        } else if (hash === '#ai-digital' && wAi) {
            wAi.style.display = 'block';
        } else {
            // Default to kham-benh if no hash or #kham-benh
            if (wKhamBenh) wKhamBenh.style.display = 'block';
        }
    }

    updateActiveMenu();
    filterServices();

    window.addEventListener('hashchange', () => {
        updateActiveMenu();
        filterServices();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});


// Unified Consultation Modal (Single-Screen Common Form across all pages)
function getUnifiedModalContentHTML(isEn) {
    if (isEn) {
        return `
        <div class="modal-content">
            <button class="modal-close" type="button" onclick="closeContactModal()" aria-label="Close">&times;</button>
            <h2>Request a Consultation</h2>
            <p>Please leave your details and an INVAMAX expert will contact you shortly.</p>
            
            <form id="leadForm" onsubmit="submitForm(event)">
                <div style="opacity: 0; position: absolute; top: 0; left: 0; height: 0; width: 0; z-index: -1; overflow: hidden;">
                    <label for="website_url">Website URL</label>
                    <input type="text" id="website_url" name="website_url" tabindex="-1" autocomplete="off">
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="hoTen" required placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label>Job Title *</label>
                        <input type="text" name="chucDanh" required placeholder="Director / Manager">
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" name="soDienThoai" required placeholder="+84 988...">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" required placeholder="email@company.com">
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Factory / Company Name *</label>
                        <input type="text" name="tenNhaMay" required placeholder="XYZ Manufacturing Co., Ltd">
                    </div>
                    <div class="form-group">
                        <label>Factory Address *</label>
                        <input type="text" name="diaChi" required placeholder="Industrial Park, Province...">
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Manufacturing Sector *</label>
                        <select name="linhVuc" required>
                            <option value="">-- Select sector --</option>
                            <option value="Gỗ / nội thất">Wood / Furniture</option>
                            <option value="Cơ khí / kim loại">Mechanical / Metal</option>
                            <option value="May mặc / da giày">Garment / Footwear</option>
                            <option value="Nhựa / cao su">Plastics / Rubber</option>
                            <option value="Thực phẩm / đồ uống">Food / Beverage</option>
                            <option value="Điện tử / điện lạnh">Electronics / Refrigeration</option>
                            <option value="Vật liệu xây dựng">Building Materials</option>
                            <option value="Bao bì / in ấn">Packaging / Printing</option>
                            <option value="Khác">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Company Size *</label>
                        <select name="quyMo" required>
                            <option value="">-- Select size --</option>
                            <option value="Dưới 50 người">Under 50 employees</option>
                            <option value="50 ~ 100 người">50 ~ 100 employees</option>
                            <option value="101 ~ 200 người">101 ~ 200 employees</option>
                            <option value="Trên 200 người">Over 200 employees</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Consultation Topic *</label>
                    <textarea name="noiDung" rows="2" required placeholder="Briefly describe your factory's current challenges or goals..."></textarea>
                </div>
                
                <button type="submit" id="btnSubmitForm" class="btn btn-orange">
                    Submit Request &rarr;
                </button>
            </form>
            
            <div id="formSuccess" style="display: none; text-align: center; padding: 24px 0;">
                <div style="color: #22c55e; font-size: 2.8rem; margin-bottom: 10px;">&#10004;</div>
                <h3 style="color: #16a34a; font-size: 1.25rem; margin: 0;">Submitted Successfully!</h3>
                <p style="color: #475569; margin-top: 8px; font-size: 0.92rem;">Thank you. An INVAMAX expert will contact you shortly.</p>
                <button type="button" class="btn btn-outline" style="margin-top: 16px; color: #17251e; border-color: #cbd5e1;" onclick="closeContactModal()">Close</button>
            </div>
        </div>`;
    }

    return `
        <div class="modal-content">
            <button class="modal-close" type="button" onclick="closeContactModal()" aria-label="Đóng">&times;</button>
            <h2>Đăng ký tư vấn</h2>
            <p>Vui lòng để lại thông tin, chuyên gia INVAMAX sẽ liên hệ lại với bạn.</p>
            
            <form id="leadForm" onsubmit="submitForm(event)">
                <div style="opacity: 0; position: absolute; top: 0; left: 0; height: 0; width: 0; z-index: -1; overflow: hidden;">
                    <label for="website_url">Website URL</label>
                    <input type="text" id="website_url" name="website_url" tabindex="-1" autocomplete="off">
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Họ và tên *</label>
                        <input type="text" name="hoTen" required placeholder="Nguyễn Văn A">
                    </div>
                    <div class="form-group">
                        <label>Chức danh *</label>
                        <input type="text" name="chucDanh" required placeholder="Giám đốc / Trưởng phòng">
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Số điện thoại *</label>
                        <input type="tel" name="soDienThoai" required placeholder="0988...">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" required placeholder="email@congty.com">
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Tên nhà máy / Công ty *</label>
                        <input type="text" name="tenNhaMay" required placeholder="Công ty TNHH XYZ">
                    </div>
                    <div class="form-group">
                        <label>Địa chỉ nhà máy *</label>
                        <input type="text" name="diaChi" required placeholder="KCN abc, Tỉnh xyz...">
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Lĩnh vực sản xuất *</label>
                        <select name="linhVuc" required>
                            <option value="">-- Chọn lĩnh vực --</option>
                            <option value="Gỗ / nội thất">Gỗ / nội thất</option>
                            <option value="Cơ khí / kim loại">Cơ khí / kim loại</option>
                            <option value="May mặc / da giày">May mặc / da giày</option>
                            <option value="Nhựa / cao su">Nhựa / cao su</option>
                            <option value="Thực phẩm / đồ uống">Thực phẩm / đồ uống</option>
                            <option value="Điện tử / điện lạnh">Điện tử / điện lạnh</option>
                            <option value="Vật liệu xây dựng">Vật liệu xây dựng</option>
                            <option value="Bao bì / in ấn">Bao bì / in ấn</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quy mô nhân sự *</label>
                        <select name="quyMo" required>
                            <option value="">-- Chọn quy mô --</option>
                            <option value="Dưới 50 người">Dưới 50 người</option>
                            <option value="50 ~ 100 người">50 ~ 100 người</option>
                            <option value="101 ~ 200 người">101 ~ 200 người</option>
                            <option value="Trên 200 người">Trên 200 người</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Nội dung cần tư vấn *</label>
                    <textarea name="noiDung" rows="2" required placeholder="Mô tả sơ bộ về định hướng, vấn đề hiện tại của nhà máy..."></textarea>
                </div>
                
                <button type="submit" id="btnSubmitForm" class="btn btn-orange">
                    Gửi Yêu Cầu Tư Vấn &rarr;
                </button>
            </form>
            
            <div id="formSuccess" style="display: none; text-align: center; padding: 24px 0;">
                <div style="color: #22c55e; font-size: 2.8rem; margin-bottom: 10px;">&#10004;</div>
                <h3 style="color: #16a34a; font-size: 1.25rem; margin: 0;">Gửi thành công!</h3>
                <p style="color: #475569; margin-top: 8px; font-size: 0.92rem;">Cảm ơn bạn. Chuyên gia INVAMAX sẽ sớm liên hệ lại.</p>
                <button type="button" class="btn btn-outline" style="margin-top: 16px; color: #17251e; border-color: #cbd5e1;" onclick="closeContactModal()">Đóng cửa sổ</button>
            </div>
        </div>`;
}

function injectUnifiedModalStyles() {
    if (document.getElementById('invamax-unified-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'invamax-unified-modal-styles';
    style.textContent = `
        #contactModal.modal-overlay {
            position: fixed !important;
            top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;
            background: rgba(10, 25, 20, 0.78) !important;
            backdrop-filter: blur(6px) !important;
            -webkit-backdrop-filter: blur(6px) !important;
            z-index: 9999 !important;
            display: none;
            align-items: center !important;
            justify-content: center !important;
            padding: 12px 16px !important;
            box-sizing: border-box !important;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        #contactModal.modal-overlay.active {
            display: flex !important;
            opacity: 1 !important;
        }
        #contactModal .modal-content {
            background: #ffffff !important;
            width: 100% !important;
            max-width: 600px !important;
            margin: auto !important;
            border-radius: 16px !important;
            padding: 20px 24px !important;
            position: relative !important;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35) !important;
            color: #17251e !important;
            box-sizing: border-box !important;
            max-height: calc(100vh - 24px) !important;
            overflow-y: auto !important;
            transform: translateY(0) !important;
        }
        #contactModal .modal-close {
            position: absolute !important;
            top: 14px !important; right: 18px !important;
            background: none !important; border: none !important;
            font-size: 24px !important; color: #64748b !important;
            cursor: pointer !important;
            line-height: 1 !important;
            font-weight: bold !important;
            padding: 4px !important;
        }
        #contactModal .modal-close:hover { color: #0f172a !important; }
        #contactModal .modal-content h2 {
            font-size: 1.35rem !important;
            color: #FF6900 !important;
            margin: 0 0 4px 0 !important;
            font-weight: 800 !important;
            line-height: 1.25 !important;
        }
        #contactModal .modal-content > p {
            color: #64748b !important;
            margin: 0 0 12px 0 !important;
            font-size: 0.88rem !important;
            line-height: 1.4 !important;
        }
        #contactModal .form-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0 14px !important;
        }
        #contactModal .form-group { margin-bottom: 10px !important; min-width: 0 !important; }
        #contactModal .form-group label {
            display: block !important;
            font-weight: 600 !important;
            margin-bottom: 4px !important;
            color: #334155 !important;
            font-size: 0.82rem !important;
            line-height: 1.25 !important;
        }
        #contactModal .form-group input,
        #contactModal .form-group textarea,
        #contactModal .form-group select {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            padding: 8px 12px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            font-family: inherit !important;
            font-size: 0.88rem !important;
            line-height: 1.35 !important;
            color: #1e293b !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
            transition: border-color 0.2s !important;
        }
        #contactModal .form-group textarea {
            min-height: 52px !important;
            max-height: 76px !important;
            resize: vertical !important;
        }
        #contactModal .form-group input:focus,
        #contactModal .form-group textarea:focus,
        #contactModal .form-group select:focus {
            outline: none !important;
            border-color: #FF6900 !important;
        }
        #contactModal #btnSubmitForm,
        #contactModal button[type="submit"] {
            width: 100% !important;
            margin-top: 4px !important;
            padding: 10px 20px !important;
            height: 42px !important;
            border-radius: 8px !important;
            background-color: #FF6900 !important;
            color: #ffffff !important;
            border: none !important;
            font-size: 0.95rem !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            box-shadow: 0 4px 14px rgba(255, 105, 0, 0.35) !important;
            transition: all 0.2s ease !important;
        }
        #contactModal #btnSubmitForm:hover,
        #contactModal button[type="submit"]:hover {
            background-color: #e05d00 !important;
            transform: translateY(-1px) !important;
        }
        @media (max-width: 600px) {
            #contactModal.modal-overlay { padding: 8px 10px !important; }
            #contactModal .modal-content { padding: 16px !important; border-radius: 14px !important; max-height: calc(100vh - 16px) !important; }
            #contactModal .modal-content h2 { font-size: 1.2rem !important; margin-bottom: 2px !important; }
            #contactModal .modal-content > p { font-size: 0.8rem !important; margin-bottom: 10px !important; }
            #contactModal .form-grid { grid-template-columns: 1fr 1fr !important; gap: 0 10px !important; }
            #contactModal .form-group { margin-bottom: 8px !important; }
            #contactModal .form-group label { font-size: 0.76rem !important; margin-bottom: 3px !important; }
            #contactModal .form-group input,
            #contactModal .form-group textarea,
            #contactModal .form-group select { padding: 7px 10px !important; font-size: 0.82rem !important; }
            #contactModal .form-group textarea { min-height: 46px !important; }
            #contactModal #btnSubmitForm,
            #contactModal button[type="submit"] { height: 38px !important; font-size: 0.88rem !important; }
        }
    `;
    document.head.appendChild(style);
}

function ensureUnifiedContactModal() {
    injectUnifiedModalStyles();
    const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    let modal = document.getElementById('contactModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'contactModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    if (modal.dataset.unifiedReady !== 'true') {
        modal.className = 'modal-overlay';
        modal.innerHTML = getUnifiedModalContentHTML(isEn);
        modal.dataset.unifiedReady = 'true';
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeContactModal();
        });
    }
    return modal;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureUnifiedContactModal);
} else {
    ensureUnifiedContactModal();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('contactModal');
        if (modal && modal.classList.contains('active')) {
            closeContactModal();
        }
    }
});

// Modal Functions
function openContactModal() {
    const modal = ensureUnifiedContactModal();
    modal.classList.add('active');
}
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (!modal) return;
    modal.classList.remove('active');
    const leadForm = document.getElementById('leadForm');
    const formSuccess = document.getElementById('formSuccess');
    if (leadForm) {
        leadForm.style.display = 'block';
        leadForm.reset();
    }
    if (formSuccess) {
        formSuccess.style.display = 'none';
    }
}

// Thay URL Web App của Google Apps Script vào đây
const _p1 = "https://script.google.com/macros/s/";
const _p2 = "AKfycbxlNh";
const _p3 = "vfg0YdRpQ5LsaqhsGUb6";
const _p4 = "hb6d2oZsdY-56Y2CfbJWOQlYLiaEQmmaDV94Xx92I/exec";
const GOOGLE_SCRIPT_URL = _p1 + _p2 + _p3 + _p4;

async function submitForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const formSuccess = document.getElementById('formSuccess');
    const formData = new FormData(form);
    const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    
    let data = { formType: 'contact' };
    formData.forEach((value, key) => data[key] = value);
    
    // Anti-spam Honeypot & Speed Check
    const timeToFill = Date.now() - pageLoadTime;
    
    if (data['website_url'] || timeToFill < 3000) {
        console.log('Spam bot detected. Aborting.');
        form.reset();
        if (formSuccess && form.id === 'leadForm') {
            form.style.display = 'none';
            formSuccess.style.display = 'block';
        } else {
            closeContactModal();
        }
        if (btn) {
            btn.innerHTML = btn.dataset.originalText || (isEn ? 'Submit Request &rarr;' : 'Gửi Yêu Cầu Tư Vấn &rarr;');
            btn.disabled = false;
        }
        return;
    }
    
    delete data['website_url'];
    
    if(btn) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = isEn ? 'Submitting...' : 'Đang gửi...';
        btn.disabled = true;
    }
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            form.reset();
            if (formSuccess && form.id === 'leadForm') {
                form.style.display = 'none';
                formSuccess.style.display = 'block';
            } else {
                alert(isEn ? 'Submitted successfully! An INVAMAX expert will contact you shortly.' : 'Gửi yêu cầu thành công! Chuyên gia của INVAMAX sẽ sớm liên hệ với bạn.');
                closeContactModal();
            }
        } else {
            throw new Error(result.message || "Lỗi không xác định");
        }
    } catch(err) {
        alert(isEn ? "Error: Could not submit details. Please try again later." : "Lỗi: Không thể gửi thông tin. Vui lòng thử lại sau.");
        console.error(err);
    } finally {
        if(btn) {
            btn.innerHTML = btn.dataset.originalText || (isEn ? 'Submit Request &rarr;' : 'Gửi Yêu Cầu Tư Vấn &rarr;');
            btn.disabled = false;
        }
    }
}


// Auto-load latest posts from kien-thuc.html to index.html
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('latest-posts-container');
    if (!container) return; // Only run on pages that have this container

    fetch('kien-thuc.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const articles = doc.querySelectorAll('.image-card');
            
            if (articles.length > 0) {
                container.innerHTML = ''; // Clear loading text
                
                // Take up to 3 latest articles
                for (let i = 0; i < Math.min(3, articles.length); i++) {
                    const article = articles[i].cloneNode(true);
                    // Optionally fix lucide icons inside cloned nodes if they were already rendered
                    // Or we just call lucide.createIcons() later
                    container.appendChild(article);
                }
                
                // Re-initialize lucide icons for the newly injected HTML
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            } else {
                container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Chưa có bài viết nào.</p>';
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải bài viết:', error);
            // Ignore error UI if it's just CORS from file:/// protocol, so user doesn't see ugly text locally
            // But we can put a gentle fallback
            container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--text-muted);">Không thể tự động tải bài viết (Do chặn CORS trên máy tính). Khi đưa lên mạng web sẽ hoạt động bình thường.</p>';
        });
});




// Language Switcher Logic
window.switchLanguage = function(lang) {
    let currentPath = window.location.pathname;
    
    if (lang === 'en') {
        if (currentPath === '/' || currentPath === '/index.html') {
            window.location.href = '/en/';
        } else if (currentPath.includes('/vi/')) {
            let newPath = currentPath.replace('/vi/', '/en/');
            if (newPath === '/en/index.html') newPath = '/en/';
            window.location.href = newPath;
        } else if (!currentPath.includes('/en/')) {
            window.location.href = '/en/';
        }
    } else if (lang === 'vi') {
        if (currentPath.includes('/en/')) {
            let newPath = currentPath.replace('/en/', '/vi/');
            if (newPath === '/vi/index.html' || newPath === '/vi/') newPath = '/';
            window.location.href = newPath;
        } else if (!currentPath.includes('/vi/') && currentPath !== '/') {
            window.location.href = '/';
        }
    }
};
