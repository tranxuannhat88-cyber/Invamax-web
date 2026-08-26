import io

filename = 'vi/index.html'
with io.open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Hiệu quả kinh tế vận hành', 'Vận hành xuất sắc')
content = content.replace('HIỆU QUẢ KINH TẾ VẬN HÀNH', 'VẬN HÀNH XUẤT SẮC')

with io.open(filename, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated vi/index.html")
