import io
import re

scoring_path = r"assets\js\scoring.js"
admin_js_path = r"assets\js\admin.js"

# 1. Update scoring.js for top3FOS (lowest scores instead of highest)
try:
    with io.open(scoring_path, 'r', encoding='utf-8') as f:
        scoring_js = f.read()
    
    # We want fosScores.sort((a,b) => a.score - b.score);
    target_fos = "fosScores.sort(sortDesc);"
    replacement_fos = "fosScores.sort((a, b) => a.score - b.score);"
    if target_fos in scoring_js:
        scoring_js = scoring_js.replace(target_fos, replacement_fos)
        with io.open(scoring_path, 'w', encoding='utf-8') as f:
            f.write(scoring_js)
        print("Updated scoring.js")
    else:
        print("Could not find sortDesc in scoring.js")
except Exception as e:
    print("Error scoring.js: " + str(e))

# 2. Update admin.js to reduce padding/margin in renderHeatmapGroup
try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        admin_js = f.read()
    
    # Reduce padding: 12px 6px; to 6px;
    admin_js = admin_js.replace('padding: 12px 6px;', 'padding: 6px;')
    
    # Reduce icon margin-bottom: 5px; to 2px;
    # We can use regex to target the icon div inside renderHeatmapGroup
    admin_js = re.sub(
        r'<div style="font-size: 16px; margin-bottom: 5px; opacity: 0\.9;">', 
        r'<div style="font-size: 16px; margin-bottom: 2px; opacity: 0.9;">', 
        admin_js
    )
    
    # Reduce modName margin-bottom: 2px; to 0px;
    admin_js = re.sub(
        r'margin-bottom: 2px; text-transform: uppercase;">\$\{modName\}</div>', 
        r'margin-bottom: 0px; text-transform: uppercase;">${modName}</div>', 
        admin_js
    )
    
    # Reduce modInfo.vi margin-bottom: 5px; to 2px;
    admin_js = re.sub(
        r'margin-bottom: 5px; opacity: 0\.9;">\(\$\{modInfo\.vi\}\)</div>',
        r'margin-bottom: 2px; opacity: 0.9;">(${modInfo.vi})</div>',
        admin_js
    )
    
    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(admin_js)
    print("Updated admin.js")
except Exception as e:
    print("Error admin.js: " + str(e))
