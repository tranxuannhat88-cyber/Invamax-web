import io
import re

for filename in ['vi/index.html', 'en/index.html']:
    with io.open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # The actual HTML in the file is:
    # <span >Chuyển đổi mô hình vận hành,</span>
    # We will use regex to find the h1 line and replace the spans.
    
    if 'vi/' in filename:
        content = re.sub(r'<span[^>]*>(Chuyển đổi mô hình vận hành,)</span>', r'<span class="nowrap-desktop">\1</span>', content)
        content = re.sub(r'<span[^>]*>(thay đổi vị thế thị trường)</span>', r'<span class="nowrap-desktop">\1</span>', content)
    else:
        content = re.sub(r'<span[^>]*>(Transform operating model,)</span>', r'<span class="nowrap-desktop">\1</span>', content)
        content = re.sub(r'<span[^>]*>(change market position)</span>', r'<span class="nowrap-desktop">\1</span>', content)
        
    with io.open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Re-applied nowrap-desktop to H1 using regex!")
