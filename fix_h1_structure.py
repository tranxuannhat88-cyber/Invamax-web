import io
import re

for filename in ['vi/index.html', 'en/index.html']:
    with io.open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace <span > with <span class="nowrap-desktop"> inside the h1 tag
    # The h1 tag looks like: <h1 class="hero-h1" style="display: block !important;"><span >...</span><br><span >...</span></h1>
    
    # We can just target the exact h1 block
    content = re.sub(
        r'<h1 class="hero-h1" style="display: block !important;"><span[^>]*>(.*?)</span><br><span[^>]*>(.*?)</span></h1>',
        r'<h1 class="hero-h1" style="display: block !important;"><span class="nowrap-desktop">\1</span><br><span class="nowrap-desktop">\2</span></h1>',
        content,
        flags=re.DOTALL
    )
        
    with io.open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Fixed H1 spans!")
