import io
import re

with io.open('assets/js/admin.js.bak', 'r', encoding='utf-8') as f:
    bak_content = f.read()

# Extract renderPreliminary from admin.js.bak
match = re.search(r'(function renderPreliminary.*?)\nfunction initCharts', bak_content, flags=re.DOTALL)
if match:
    render_prelim = match.group(1).strip()
    
    with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
        admin_content = f.read()
        
    # Replace renderPreliminary in admin.js
    # Escape the replacement string so re.sub doesn't interpret backslashes
    new_admin = re.sub(r'function renderPreliminary.*?}\n\nfunction renderDetailedReport', render_prelim.replace('\\', '\\\\') + '\n\nfunction renderDetailedReport', admin_content, flags=re.DOTALL)
    
    with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(new_admin)
    print('Successfully restored renderPreliminary in admin.js')
else:
    print('Could not find renderPreliminary in admin.js.bak')
