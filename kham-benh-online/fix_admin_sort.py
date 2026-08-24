import io

admin_js_path = r"assets\js\admin.js"

try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    target = "const sortDesc = (a, b) => b.score - a.score;\n    wasteScores.sort(sortDesc);\n    fosScores.sort(sortDesc);"
    replacement = "const sortDesc = (a, b) => b.score - a.score;\n    wasteScores.sort(sortDesc);\n    fosScores.sort((a, b) => a.score - b.score);"
    
    if target in js:
        js = js.replace(target, replacement)
        with io.open(admin_js_path, 'w', encoding='utf-8') as f:
            f.write(js)
        print("Updated admin.js")
    else:
        print("Target string not found in admin.js!")
except Exception as e:
    print("Error JS: " + str(e))
