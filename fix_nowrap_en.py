import sys
sys.stdout.reconfigure(encoding='utf-8')

for filename in ['vi/index.html', 'en/index.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace inline style="white-space: nowrap;" with class="nowrap-desktop"
    # But ONLY inline styles.
    content = content.replace('style="white-space: nowrap;"', 'class="nowrap-desktop"')
    content = content.replace('; white-space: nowrap;"', ';" class="nowrap-desktop"')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filename}")
