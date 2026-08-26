import sys
import io

for file_path in ['vi/index.html', 'en/index.html']:
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Safely replace inline styles
    content = content.replace('style="white-space: nowrap;"', 'class="nowrap-desktop"')
    content = content.replace('; white-space: nowrap;"', ';" class="nowrap-desktop"')
    
    with io.open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Fixed", file_path)
