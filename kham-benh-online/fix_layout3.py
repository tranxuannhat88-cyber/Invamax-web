import io
import re

# Update admin.js inline style
with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

admin_js = admin_js.replace('<div style="width: 250px;">', '<div style="width: 180px;">')

with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(admin_js)

print("Fixed admin.js widths")
