import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace btn-show-history with auth-btn-container
html = re.sub(
    r'<button id=\"btn-show-history\"[^>]*>.*?<\/button>',
    '<div id=\"auth-btn-container\" style=\"position: absolute; right: 20px; top: 20px; z-index: 100;\"></div>',
    html,
    flags=re.DOTALL
)

# 2. Add Login Modal HTML
modal_html = '''
    <!-- LOGIN MODAL -->
    <style>
        .login-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(8px);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .login-modal-overlay.active {
            opacity: 1;
        }
        .login-modal {
            background: rgba(255, 255, 255, 0.95);
            width: 90%;
            max-width: 400px;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            position: relative;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        .login-modal-overlay.active .login-modal {
            transform: translateY(0);
        }
        .login-close {
            position: absolute;
            top: 15px; right: 15px;
            cursor: pointer;
            color: #64748b;
            font-size: 20px;
            transition: color 0.2s;
        }
        .login-close:hover { color: #0f172a; }
        
        .auth-tabs {
            display: flex;
            border-bottom: 2px solid #e2e8f0;
            margin-bottom: 20px;
        }
        .auth-tab {
            flex: 1;
            text-align: center;
            padding: 10px;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
            transition: all 0.2s;
        }
        .auth-tab.active {
            color: #ea580c;
            border-bottom: 2px solid #ea580c;
        }
        .auth-form {
            display: none;
        }
        .auth-form.active {
            display: block;
        }
        .auth-input-group {
            margin-bottom: 15px;
        }
        .auth-input-group label {
            display: block;
            font-size: 0.85rem;
            color: #475569;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .auth-input-group input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-family: inherit;
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.2s;
        }
        .auth-input-group input:focus {
            border-color: #ea580c;
        }
        .auth-btn {
            width: 100%;
            padding: 12px;
            background: #ea580c;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .auth-btn:hover { background: #c2410c; }
        .auth-divider {
            display: flex; align-items: center; text-align: center; margin: 20px 0; color: #94a3b8; font-size: 0.85rem;
        }
        .auth-divider::before, .auth-divider::after {
            content: ''; flex: 1; border-bottom: 1px solid #e2e8f0;
        }
        .auth-divider::before { margin-right: 10px; }
        .auth-divider::after { margin-left: 10px; }
        .g_id_signin {
            display: flex; justify-content: center;
        }
    </style>
    
    <div class="login-modal-overlay" id="login-modal">
        <div class="login-modal">
            <i class="fas fa-times login-close" onclick="hideLoginModal()"></i>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 24px; font-weight: 900; color: #0f172a;">INVA<span style="color:#ea580c">MAX</span></div>
                <div style="font-size: 12px; color: #64748b; font-weight: 600;">Factory Diagnosis&trade;</div>
            </div>
            
            <div class="auth-tabs">
                <div class="auth-tab active" id="tab-login" onclick="switchAuthTab('login')">Đăng nhập</div>
                <div class="auth-tab" id="tab-register" onclick="switchAuthTab('register')">Tạo tài khoản</div>
            </div>
            
            <!-- Login Form -->
            <form class="auth-form active" id="form-login" onsubmit="handleLogin(event)">
                <div class="auth-input-group">
                    <label>Email</label>
                    <input type="email" id="login-email" required placeholder="Nhập email...">
                </div>
                <div class="auth-input-group">
                    <label>Mật khẩu</label>
                    <input type="password" id="login-pass" required placeholder="Nhập mật khẩu...">
                </div>
                <button type="submit" class="auth-btn">Đăng nhập</button>
            </form>
            
            <!-- Register Form -->
            <form class="auth-form" id="form-register" onsubmit="handleRegister(event)">
                <div class="auth-input-group">
                    <label>Họ và tên</label>
                    <input type="text" id="reg-name" required placeholder="Tên của bạn...">
                </div>
                <div class="auth-input-group">
                    <label>Email</label>
                    <input type="email" id="reg-email" required placeholder="Nhập email...">
                </div>
                <div class="auth-input-group">
                    <label>Mật khẩu</label>
                    <input type="password" id="reg-pass" required placeholder="Tạo mật khẩu...">
                </div>
                <button type="submit" class="auth-btn">Đăng ký tài khoản</button>
            </form>
            
            <div class="auth-divider">hoặc</div>
            
            <!-- Google Sign-In -->
            <div id="g_id_onload"
                 data-client_id="811195724214-e0v9q3g64q5c18u5t51vqg0t3fdfpq47.apps.googleusercontent.com"
                 data-context="use"
                 data-ux_mode="popup"
                 data-callback="handleCredentialResponse"
                 data-auto_prompt="false">
            </div>
            <div class="g_id_signin"
                 data-type="standard"
                 data-shape="rectangular"
                 data-theme="outline"
                 data-text="signin_with"
                 data-size="large"
                 data-logo_alignment="left">
            </div>
        </div>
    </div>
'''

if 'id="login-modal"' not in html:
    html = html.replace('</body>', modal_html + '\n</body>')

# 3. Add Script tags
scripts = '''
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script src="assets/js/auth.js"></script>
'''
if 'auth.js' not in html:
    html = html.replace('</body>', scripts + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done index.html')
