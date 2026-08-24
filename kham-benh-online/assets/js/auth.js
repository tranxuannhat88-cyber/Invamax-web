const ADMIN_EMAIL = 'info@invamax.com';
const ADMIN_PASS = 'Invamax123456$';
const AUTH_GAS_URL = 'https://script.google.com/macros/s/AKfycbxA0w8vMs95Aswa2nOKhM8EJs2U5Y2nFj4pG_goURBGTDt0w0tJNQlecGsQD9uno0FLnA/exec';

document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    checkAdminProtection();
});

function initAuthUI() {
    const authBtnContainer = document.getElementById('auth-btn-container');
    if (!authBtnContainer) return;

    const user = JSON.parse(localStorage.getItem('invamax_user'));
    
    if (user) {
        // Logged in
        authBtnContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; position: relative;">
                ${user.role === 'admin' ? '<a href="admin.html" style="color:#fcd34d; font-size:0.85rem; font-weight:bold; text-decoration:none;">Tới Admin</a>' : ''}
                <div class="user-dropdown-toggle" onclick="toggleUserDropdown(event)" style="color: white; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-user-circle"></i> ${user.name || user.email}
                    ${user.role === 'admin' ? '<span style="background:#ea580c;color:white;padding:2px 6px;border-radius:4px;font-size:10px;">ADMIN</span>' : ''}
                    <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 3px;"></i>
                </div>
                <div id="user-dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 10px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 8px; min-width: 150px; z-index: 1000;">
                    <button onclick="logout()" style="width: 100%; text-align: left; background: none; border: none; padding: 10px; color: #ef4444; font-weight: 600; cursor: pointer; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'">
                        <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i> Đăng xuất
                    </button>
                </div>
            </div>
        `;
        
        // Auto-fill form if on index.html
        setTimeout(() => {
            const emailInput = document.getElementById('F04');
            const nameInput = document.getElementById('F01');
            if (emailInput && !emailInput.value) emailInput.value = user.email;
            if (nameInput && user.name && !nameInput.value) nameInput.value = user.name;
        }, 500);
        
    } else {
        // Not logged in
        authBtnContainer.innerHTML = `
            <button onclick="showLoginModal()" style="background: #ea580c; border: none; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);">
                <i class="fas fa-sign-in-alt"></i> Đăng nhập
            </button>
        `;
    }
}

function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// Make globally available
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleCredentialResponse = handleCredentialResponse;
window.logout = logout;

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('form-' + tab).classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        localStorage.setItem('invamax_user', JSON.stringify({ email, role: 'admin', name: 'Administrator' }));
        Swal.fire({
            icon: 'success',
            title: 'Đăng nhập thành công',
            text: 'Chào mừng Administrator!',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            if (window.location.pathname.includes('kham-benh-online')) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'kham-benh-online/admin.html';
            }
        });
        return;
    } 
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.disabled = true;

    try {
        const response = await fetch(AUTH_GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'login', email: email, password: pass })
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            localStorage.setItem('invamax_user', JSON.stringify({ email, role: 'customer', name: result.name || email.split('@')[0] }));
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                hideLoginModal();
                initAuthUI();
            });
        } else {
            Swal.fire('Lỗi', result.message || 'Sai email hoặc mật khẩu.', 'error');
        }
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể kết nối máy chủ.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const btn = e.target.querySelector('button');
    
    if (pass.length < 6) {
        Swal.fire('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên.', 'error');
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.disabled = true;

    try {
        const response = await fetch(AUTH_GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'register', name: name, email: email, password: pass })
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            localStorage.setItem('invamax_user', JSON.stringify({ email, role: 'customer', name }));
            Swal.fire({
                icon: 'success',
                title: 'Đăng ký thành công',
                text: 'Tài khoản của bạn đã được tạo.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                hideLoginModal();
                initAuthUI();
            });
        } else {
            Swal.fire('Lỗi', result.message || 'Không thể tạo tài khoản.', 'error');
        }
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể kết nối máy chủ.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    const email = responsePayload.email;
    const name = responsePayload.name;
    
    try {
        const res = await fetch(AUTH_GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'google_login', name: name, email: email })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            localStorage.setItem('invamax_user', JSON.stringify({ email, role: 'customer', name }));
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập Google thành công',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                hideLoginModal();
                initAuthUI();
            });
        } else {
            Swal.fire('Lỗi', result.message || 'Có lỗi xảy ra.', 'error');
        }
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể kết nối máy chủ.', 'error');
    }
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function logout() {
    localStorage.removeItem('invamax_user');
    window.location.reload();
}

function checkAdminProtection() {
    if (window.location.pathname.includes('admin.html')) {
        const user = JSON.parse(localStorage.getItem('invamax_user'));
        if (!user || user.role !== 'admin') {
            document.body.innerHTML = '';
            Swal.fire({
                icon: 'error',
                title: 'Truy cập bị từ chối',
                text: 'Bạn phải đăng nhập bằng tài khoản Quản trị viên để xem trang này.',
                confirmButtonText: 'Quay lại Trang chủ',
                allowOutsideClick: false
            }).then(() => {
                if (window.location.pathname.includes('kham-benh-online')) {
                    window.location.href = '../index.html';
                } else {
                    window.location.href = 'index.html';
                }
            });
        }
    }
}
