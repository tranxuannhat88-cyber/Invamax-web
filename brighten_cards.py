import io
import glob

old_str = "gap: 0; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-top: 3px solid var(--primary);"
new_str = "gap: 0; background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.12); border-top: 3px solid var(--primary); box-shadow: 0 20px 40px rgba(0,0,0,0.4); backdrop-filter: blur(10px);"

for filepath in ['vi/factory-transformation.html', 'en/factory-transformation.html']:
    with io.open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_str in content:
        content = content.replace(old_str, new_str)
        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"String not found in {filepath}")
