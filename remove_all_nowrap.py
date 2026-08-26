import glob
import io
import re

for file_path in glob.glob('vi/*.html') + glob.glob('en/*.html'):
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and remove all inline white-space: nowrap
    content = content.replace('style="white-space: nowrap;"', '')
    content = content.replace('; white-space: nowrap;"', '"')
    content = content.replace('white-space: nowrap; ', '')
    content = content.replace('; white-space: nowrap', '')
    
    with io.open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Removed ALL inline white-space: nowrap from HTML files")
