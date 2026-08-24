import io

admin_html_path = r"admin.html"
index_html_path = r"index.html"

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        html = html.replace('<div id="a4-cause-chains style="', '<div id="a4-cause-chains" style="')

        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Fixed HTML for " + path)

    except Exception as e:
        print("Error HTML " + path + ": " + str(e))
