import io

filename = 'en/index.html'
with io.open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Operating Economic Efficiency', 'Operational Excellence')
content = content.replace('OPERATING EFFICIENCY', 'OPERATIONAL EXCELLENCE')

with io.open(filename, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated en/index.html")
