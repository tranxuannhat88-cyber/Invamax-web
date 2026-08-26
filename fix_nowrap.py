import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('vi/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inline style="white-space: nowrap;"
content = content.replace('style="white-space: nowrap;"', 'class="nowrap-desktop"')
content = content.replace('; white-space: nowrap;', '')
content = content.replace('white-space: nowrap;', '')

with open('vi/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed all inline white-space: nowrap from vi/index.html")
