import io

def fix_model():
    filepath = 'assets/js/admin.js'
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace all instances of gemini-1.5-flash-latest with gemini-1.5-flash
    content = content.replace('gemini-1.5-flash-latest', 'gemini-1.5-flash')

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Fixed model in admin.js")

    # Also check admin.html
    idx_filepath = 'admin.html'
    with io.open(idx_filepath, 'r', encoding='utf-8') as f:
        idx_content = f.read()
    
    idx_content = idx_content.replace('gemini-1.5-flash-latest', 'gemini-1.5-flash')
    
    with io.open(idx_filepath, 'w', encoding='utf-8') as f:
        f.write(idx_content)
        
    print("Fixed model in admin.html")

fix_model()
