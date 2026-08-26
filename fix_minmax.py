import glob
import io

for file_path in glob.glob('vi/*.html') + glob.glob('en/*.html'):
    with io.open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('minmax(350px', 'minmax(280px')

    if new_content != content:
        with io.open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {file_path}")
