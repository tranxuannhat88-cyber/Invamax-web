import io

css_path = r"assets\css\a4_report.css"

with io.open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

target_css = """.a4-section-title {
    background-color: #ea580c;"""
    
replacement_css = """.a4-section-title {
    background-color: #1e293b;"""

if target_css in css:
    css = css.replace(target_css, replacement_css)
    with io.open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)
    print("Updated a4_report.css successfully.")
else:
    print("Could not find the target CSS block.")
