import io
import glob
import re

pattern = re.compile(r"onmouseover=\"this\.style\.background='rgba\(255,102,0,0\.05\)'; this\.style\.boxShadow='inset 0 0 40px rgba\(255,102,0,0\.1\)';\"")

replacement = "onmouseover=\"this.style.background='rgba(255,102,0,0.12)'; this.style.boxShadow='inset 0 0 60px rgba(255,102,0,0.25)';\""

for filepath in glob.glob('vi/*.html') + glob.glob('en/*.html'):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = pattern.subn(replacement, content)
    
    if count > 0:
        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath} ({count} replacements)")
