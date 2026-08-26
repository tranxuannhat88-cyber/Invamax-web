import io
import glob

for filepath in glob.glob('vi/*.html') + glob.glob('en/*.html'):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Links to Vietnamese homepage
    content = content.replace('href="../vi/index.html"', 'href="/"')
    content = content.replace('href="/vi/index.html"', 'href="/"')
    content = content.replace('href="/vi/"', 'href="/"')
    
    # Links to English homepage
    content = content.replace('href="../en/index.html"', 'href="/en/"')
    content = content.replace('href="/en/index.html"', 'href="/en/"')
    
    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {filepath}")
