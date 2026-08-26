import glob
import io

# 1. Update all VN files
for file_path in glob.glob('vi/*.html'):
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Menu
    content = content.replace('>Về INVAMAX</a>', '>Triết lý INVAMAX</a>')
    
    # In about.html
    if 'about.html' in file_path:
        content = content.replace('>Về INVAMAX</span>', '>Triết lý INVAMAX</span>')
        content = content.replace('Về INVAMAX -', 'Triết lý INVAMAX -')

    with io.open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Update all EN files
for file_path in glob.glob('en/*.html'):
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Menu
    content = content.replace('>About INVAMAX</a>', '>INVAMAX Philosophy</a>')
    
    # In about.html
    if 'about.html' in file_path:
        content = content.replace('>ABOUT INVAMAX</span>', '>INVAMAX PHILOSOPHY</span>')
        content = content.replace('About INVAMAX -', 'INVAMAX Philosophy -')

    with io.open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Renamed About INVAMAX to INVAMAX Philosophy")
