import io

admin_js_path = r"assets\js\admin.js"

try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # The backslash escaped the $ sign in JS template strings
    js = js.replace('\${', '${')

    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Fixed escaped template strings in admin.js successfully.")

except Exception as e:
    print("Error JS: " + str(e))
