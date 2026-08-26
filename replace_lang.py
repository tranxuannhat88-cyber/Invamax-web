import re
import glob
import io

pattern = re.compile(
    r'<div class="nav-item lang-switcher"[^>]*>.*?<a\s+href="([^"]+)"[^>]*>VI</a>.*?<a\s+href="([^"]+)"[^>]*>EN</a>.*?</div>',
    re.DOTALL
)

def get_replacement(vi_href, en_href, is_vi):
    vi_active_style = 'color: var(--primary); font-weight: 600; opacity: 1;' if is_vi else 'color: var(--text-muted); opacity: 0.7;'
    en_active_style = 'color: var(--primary); font-weight: 600; opacity: 1;' if not is_vi else 'color: var(--text-muted); opacity: 0.7;'
    
    html = f'''<div class="nav-item lang-switcher" style="display: flex; gap: 12px; align-items: center; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 4px 12px; background: rgba(0,0,0,0.2);">
                        <a href="{vi_href}" onclick="switchLanguage('vi');" style="display: flex; align-items: center; text-decoration: none; padding: 0; transition: 0.3s; {vi_active_style}" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='{'1' if is_vi else '0.7'}'">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" width="18" height="12" style="border-radius: 2px; margin-right: 6px; box-shadow: 0 0 2px rgba(0,0,0,0.5);" alt="VN">Tiếng Việt
                        </a>
                        <span style="color: rgba(255,255,255,0.2);">/</span>
                        <a href="{en_href}" onclick="switchLanguage('en');" style="display: flex; align-items: center; text-decoration: none; padding: 0; transition: 0.3s; {en_active_style}" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='{'1' if not is_vi else '0.7'}'">
                            <img src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" width="18" height="12" style="border-radius: 2px; margin-right: 6px; box-shadow: 0 0 2px rgba(0,0,0,0.5);" alt="EN">English
                        </a>
                    </div>'''
    return html

for file_path in glob.glob('vi/*.html') + glob.glob('en/*.html'):
    is_vi = file_path.startswith('vi')
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def repl(m):
        vi_href = m.group(1)
        en_href = m.group(2)
        return get_replacement(vi_href, en_href, is_vi)

    new_content, count = pattern.subn(repl, content)

    if count > 0:
        with io.open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"Could not match in {file_path}")
