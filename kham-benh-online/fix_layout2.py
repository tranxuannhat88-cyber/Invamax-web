import io
import re

# Update a4_report.css
with io.open('assets/css/a4_report.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Fix header width to prevent wrapping "ONLINE"
css = css.replace('.a4-header > div:first-child { width: 250px; }', '.a4-header > div:first-child { width: 180px; }')
css = css.replace('.a4-header > div:last-child { width: 250px; }', '.a4-header > div:last-child { width: 180px; }')

# Add .a4-grid-2 if it doesn't exist
if '.a4-grid-2' not in css:
    css += "\n.a4-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }\n"

with io.open('assets/css/a4_report.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update index.html inline CSS
with io.open('index.html', 'r', encoding='utf-8') as f:
    index = f.read()

index = index.replace('.a4-header > div:first-child { width: 250px; }', '.a4-header > div:first-child { width: 180px; }')
index = index.replace('.a4-header > div:last-child { width: 250px; }', '.a4-header > div:last-child { width: 180px; }')

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(index)

print("Fixed layout issues")
