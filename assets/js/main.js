document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = 'var(--bg-card)';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid var(--border-color)';
            }
        });
    }

    // Mobile dropdown toggle
    const navTitles = document.querySelectorAll('.nav-title');
    navTitles.forEach(title => {
        title.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                const parent = title.parentElement;
                
                // Close other dropdowns
                document.querySelectorAll('.nav-item').forEach(item => {
                    if (item !== parent) {
                        item.classList.remove('active');
                    }
                });
                
                // Toggle current
                parent.classList.toggle('active');
            }
        });
    });

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
        const wrapperKhamBenh = document.getElementById('wrapper-kham-benh');
        const wrapperThietKe = document.getElementById('wrapper-thiet-ke');
        const wrapperFos = document.getElementById('wrapper-fos');
        const wrapperAiDigital = document.getElementById('wrapper-ai-digital');
        
        // Only run on dich-vu.html
        if (!wrapperKhamBenh) return;
        
        if (hash === '#kham-benh') {
            wrapperKhamBenh.style.display = 'block';
            wrapperThietKe.style.display = 'none';
            if (wrapperFos) wrapperFos.style.display = 'none';
            wrapperAiDigital.style.display = 'none';
        } else if (hash === '#thiet-ke') {
            wrapperKhamBenh.style.display = 'none';
            wrapperThietKe.style.display = 'block';
            if (wrapperFos) wrapperFos.style.display = 'none';
            wrapperAiDigital.style.display = 'none';
        } else if (hash === '#fos') {
            wrapperKhamBenh.style.display = 'none';
            wrapperThietKe.style.display = 'none';
            if (wrapperFos) wrapperFos.style.display = 'block';
            wrapperAiDigital.style.display = 'none';
        } else if (hash === '#ai-digital') {
            wrapperKhamBenh.style.display = 'none';
            wrapperThietKe.style.display = 'none';
            if (wrapperFos) wrapperFos.style.display = 'none';
            wrapperAiDigital.style.display = 'block';
        } else {
            wrapperKhamBenh.style.display = 'block';
            wrapperThietKe.style.display = 'block';
            if (wrapperFos) wrapperFos.style.display = 'block';
            wrapperAiDigital.style.display = 'block';
        }
    }

    updateActiveMenu();
    filterServices();

    window.addEventListener('hashchange', () => {
        updateActiveMenu();
        filterServices();
    });
});


// Modal Functions
function openContactModal() {
    document.getElementById('contactModal').classList.add('active');
}
function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
    document.getElementById('leadForm').style.display = 'block';
    document.getElementById('formSuccess').style.display = 'none';
    document.getElementById('leadForm').reset();
}

// Thay URL Web App của Google Apps Script vào đây
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwINtrEt8nfP0lzCeTKAbmCgUzsgGs_EkGdmEKjQQfxKubCoIAnhivJK0mNnuHFd4Ds/exec";

async function submitForm(e) {
    e.preventDefault();
    
    
    const form = document.getElementById('leadForm');
    const btn = document.getElementById('btnSubmitForm');
    const formData = new FormData(form);
    
    let data = { formType: 'contact' };
    formData.forEach((value, key) => data[key] = value);
    
    btn.innerHTML = 'Đang gửi...';
    btn.disabled = true;
    
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
            document.getElementById('leadForm').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        } else {
            throw new Error(result.message || "Lỗi không xác định");
        }
    } catch(err) {
        alert("Lỗi chi tiết: " + err.message + "\n\n(Vui lòng chụp ảnh thông báo này hoặc nhấn F12 xem Console)");
        console.error(err);
    } finally {
        btn.innerHTML = '<i data-lucide="send"></i> Gửi Đề Nghị';
        btn.disabled = false;
        lucide.createIcons();
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
