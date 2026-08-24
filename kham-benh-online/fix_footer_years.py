import io
import re

css_path = r"assets\css\a4_report.css"
index_html_path = r"index.html"

# 1. Update CSS
for path in [css_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            css = f.read()
        
        # Make table first column nowrap so "Số năm hoạt động" fits on one line
        target_css_td = ".a4-table-info td:first-child {\n    color: #64748b;\n    width: 120px;\n}"
        replacement_css_td = ".a4-table-info td:first-child {\n    color: #64748b;\n    width: 135px;\n    white-space: nowrap;\n}"
        if target_css_td in css:
            css = css.replace(target_css_td, replacement_css_td)
        
        # Remove display: none !important from .a4-footer
        target_footer_hide = ".a4-footer {\n    display: none !important;\n}"
        replacement_footer = ".a4-footer {\n    /* display: none !important; */\n}"
        if target_footer_hide in css:
            css = css.replace(target_footer_hide, replacement_footer)
            
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(css)
        print("Updated CSS in " + path)
    except Exception as e:
        print("Error with " + path + ": " + str(e))
