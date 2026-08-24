with open('app_combined.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("document.getElementById('diagnostic-form')", "document.getElementById('assessmentForm')")

with open('app_combined.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Fixed diagnostic-form ID!')
