import io
import re

with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace document.getElementById('...').innerText = ... with safe assignment
def safe_replace(match):
    id_name = match.group(1)
    value = match.group(2)
    return f"const el_{id_name.replace('-', '_')} = document.getElementById('{id_name}'); if(el_{id_name.replace('-', '_')}) el_{id_name.replace('-', '_')}.innerText = {value};"

new_content = re.sub(r"document\.getElementById\('([^']+)'\)\.innerText\s*=\s*(.+?);", safe_replace, content)

with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Successfully replaced with safe assignments")
