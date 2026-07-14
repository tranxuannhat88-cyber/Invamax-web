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
        const wrapperLean = document.getElementById('wrapper-lean');
        const wrapperSoHoa = document.getElementById('wrapper-so-hoa');
        
        // Only run on dich-vu.html
        if (!wrapperKhamBenh) return;
        
        if (hash === '#kham-benh') {
            wrapperKhamBenh.style.display = 'block';
            wrapperLean.style.display = 'none';
            wrapperSoHoa.style.display = 'none';
        } else if (hash === '#lean') {
            wrapperKhamBenh.style.display = 'none';
            wrapperLean.style.display = 'block';
            wrapperSoHoa.style.display = 'none';
        } else if (hash === '#so-hoa') {
            wrapperKhamBenh.style.display = 'none';
            wrapperLean.style.display = 'none';
            wrapperSoHoa.style.display = 'block';
        } else {
            wrapperKhamBenh.style.display = 'block';
            wrapperLean.style.display = 'block';
            wrapperSoHoa.style.display = 'block';
        }
    }

    updateActiveMenu();
    filterServices();

    window.addEventListener('hashchange', () => {
        updateActiveMenu();
        filterServices();
    });
});
