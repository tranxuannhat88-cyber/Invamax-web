import io
import re

filename = 'vi/index.html'
with io.open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the CSS block
content = content.replace('.nowrap-desktop { }', '.nowrap-desktop { white-space: nowrap; }')
content = content.replace('.nowrap-desktop {  }', '.nowrap-desktop { white-space: nowrap; }')

# 2. Fix the media query max-width
content = content.replace('@media (max-width: 1400px) {', '@media (max-width: 991px) {')

# 3. Fix the h1 nowrap spans
content = re.sub(
    r'<h1 class="hero-h1" style="display: block !important;"><span[^>]*>(.*?)</span><br><span[^>]*>(.*?)</span></h1>',
    r'<h1 class="hero-h1" style="display: block !important;"><span class="nowrap-desktop">\1</span><br><span class="nowrap-desktop">\2</span></h1>',
    content,
    flags=re.DOTALL
)

with io.open(filename, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Cleanly fixed vi/index.html!")
