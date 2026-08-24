import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"

target_css = """.a4-section-title {
    background-color: #ea580c;"""
    
replacement_css = """.a4-section-title {
    background-color: #1e293b;"""

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        html = html.replace(target_css, replacement_css)
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
    except Exception as e:
        print("Error with " + path + ": " + str(e))

print("Updated section title background color.")
