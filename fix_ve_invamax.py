import io

with io.open('vi/about.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Về INVAMAX</span>', 'Triết lý INVAMAX</span>')

with io.open('vi/about.html', 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Fixed Về INVAMAX inside about.html")
