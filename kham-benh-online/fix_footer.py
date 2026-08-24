import io
import re

# Fix footers in admin.html
with io.open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The footer has ID a4-code-f1 to f5, we want to replace the whole content of .a4-footer with just "Trang X / 5"
html = re.sub(r'<div class="a4-footer">.*?Trang 1 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 1 / 5</div>', html)
html = re.sub(r'<div class="a4-footer">.*?Trang 2 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 2 / 5</div>', html)
html = re.sub(r'<div class="a4-footer">.*?Trang 3 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 3 / 5</div>', html)
html = re.sub(r'<div class="a4-footer">.*?Trang 4 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 4 / 5</div>', html)
html = re.sub(r'<div class="a4-footer">.*?Trang 5 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 5 / 5</div>', html)

# Also fix index.html just in case
with io.open('index.html', 'r', encoding='utf-8') as f:
    index = f.read()

index = re.sub(r'<div class="a4-footer">.*?Trang 1 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 1 / 5</div>', index)
index = re.sub(r'<div class="a4-footer">.*?Trang 2 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 2 / 5</div>', index)
index = re.sub(r'<div class="a4-footer">.*?Trang 3 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 3 / 5</div>', index)
index = re.sub(r'<div class="a4-footer">.*?Trang 4 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 4 / 5</div>', index)
index = re.sub(r'<div class="a4-footer">.*?Trang 5 / 5</div>', '<div class="a4-footer" style="text-align: right;">Trang 5 / 5</div>', index)

with io.open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(index)

# Fix font-family in a4_report.css
with io.open('assets/css/a4_report.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace body { font-family: 'Inter', sans-serif; with body { font-family: 'Montserrat', sans-serif;
css = css.replace("font-family: 'Inter', sans-serif;", "font-family: 'Montserrat', sans-serif;")

with io.open('assets/css/a4_report.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Done fixing footer and font")
