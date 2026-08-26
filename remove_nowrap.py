import glob
import io
import re

for file_path in glob.glob('vi/*.html') + glob.glob('en/*.html'):
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove class="nowrap-desktop" from <p> and <span>
    content = content.replace('class="nowrap-desktop"', '')
    content = content.replace(' class="nowrap-desktop"', '')
    content = content.replace('class="nowrap-desktop" ', '')
    
    with io.open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Removed nowrap-desktop from HTML elements")
