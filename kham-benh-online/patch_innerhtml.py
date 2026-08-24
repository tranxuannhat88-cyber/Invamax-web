import io

with io.open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Make the detailed-report assignment safe
old_code = "document.getElementById('detailed-report').innerHTML = p6 + p7 + p8 + p9 + p10;"
new_code = "const el_detailed_report = document.getElementById('detailed-report'); if(el_detailed_report) el_detailed_report.innerHTML = p6 + p7 + p8 + p9 + p10;"

if old_code in content:
    new_content = content.replace(old_code, new_code)
    with io.open('assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully patched innerHTML assignment")
else:
    print("Could not find the assignment code")
