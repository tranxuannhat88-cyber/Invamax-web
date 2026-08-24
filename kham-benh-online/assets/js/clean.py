import os

# 1. Clean app_combined.js
with open('app_combined.js', 'r', encoding='utf-8') as f:
    js = f.read()

start_idx = js.find('// History Modal Logic')
if start_idx != -1:
    end_idx = js.find('// --- HISTORY MODAL LOGIC ---')
    if end_idx != -1:
        js = js[:start_idx] + js[end_idx:]
        with open('app_combined.js', 'w', encoding='utf-8') as f:
            f.write(js)
        print('Cleaned JS.')

# 2. Clean index.html
with open('../index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_idx = html.find('<!-- History Modal -->')
if start_idx != -1:
    end_idx = html.find('</div>\n\n    </div>', start_idx)
    if end_idx != -1:
        html = html[:start_idx] + html[end_idx + 18:]
        with open('../index.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print('Cleaned HTML.')
