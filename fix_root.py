import io

filepath = 'index.html'
with io.open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('href="../vi/index.html"', 'href="/"')
content = content.replace('href="/vi/index.html"', 'href="/"')
content = content.replace('href="https://invamax.com/vi/index.html"', 'href="https://invamax.com/"')
content = content.replace('href="https://invamax.com/vi/"', 'href="https://invamax.com/"')
content = content.replace('href="/vi/"', 'href="/"')

content = content.replace('href="../en/index.html"', 'href="/en/"')
content = content.replace('href="/en/index.html"', 'href="/en/"')
content = content.replace('href="https://invamax.com/en/index.html"', 'href="https://invamax.com/en/"')

with io.open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Updated {filepath}")
