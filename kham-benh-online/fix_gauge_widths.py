import io

def update_file(filepath):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the flex container
    old_container = '<div style="display: flex; gap: 15px; margin-top: 20px;">'
    new_container = '<div style="display: flex; justify-content: space-between; margin-top: 20px;">'

    if old_container in html:
        html = html.replace(old_container, new_container)
        # Replace the flex: 1 styles
        old_child = 'class="a4-box" style="flex: 1; padding: 15px; margin-bottom: 0;"'
        new_child = 'class="a4-box" style="width: 31%; padding: 15px; margin-bottom: 0; box-sizing: border-box;"'
        html = html.replace(old_child, new_child)
        
        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated", filepath)
    else:
        print("Container not found in", filepath)

update_file('admin.html')
update_file('index.html')
