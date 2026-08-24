import io
import re
index_html_path = r"index.html"
try:
    with io.open(index_html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    html = re.sub(r'<div class="a4-page">(\s*<div class="a4-section-title">5\.)', r'<div class="a4-page" style="height: auto; min-height: 297mm; page-break-after: always; margin-bottom: 20mm;">\1', html)

    with io.open(index_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated index.html successfully.")
except Exception as e:
    print("Error HTML: " + str(e))
