import io

admin_html_path = r"admin.html"
index_html_path = r"index.html"

# The div wrapping the score text below the gauge chart has margin-top: -15px;
target_div = '<div style="text-align: center; margin-top: -15px;">'
replacement_div = '<div style="text-align: center; margin-top: 5px;">'

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        if target_div in html:
            html = html.replace(target_div, replacement_div)
            with io.open(path, 'w', encoding='utf-8') as f:
                f.write(html)
            print("Updated margin in " + path)
        else:
            print("Target string not found in " + path)
            
    except Exception as e:
        print("Error with " + path + ": " + str(e))
