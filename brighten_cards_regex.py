import io
import glob
import re

pattern = re.compile(r'gap: 0; background: rgba\(0,0,0,0\.15\); border: 1px solid rgba\(255,255,255,0\.05\);( border-top: 3px solid var\(--primary\);)?')

def repl(m):
    border_top = m.group(1) or ""
    return f"gap: 0; background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.12);{border_top} box-shadow: 0 20px 40px rgba(0,0,0,0.4); backdrop-filter: blur(10px);"

for filepath in glob.glob('vi/*.html') + glob.glob('en/*.html'):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = pattern.subn(repl, content)
    
    if count > 0:
        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath} ({count} replacements)")
