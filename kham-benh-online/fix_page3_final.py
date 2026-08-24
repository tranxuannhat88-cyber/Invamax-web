import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"
admin_js_path = r"assets\js\admin.js"

# 1. Update HTML files for radar height
target_radar_html = 'height: 260px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 10px;'
replacement_radar_html = 'height: 230px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 5px;'

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        html = html.replace(target_radar_html, replacement_radar_html)
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(html)
    except Exception as e:
        print("Error with " + path + ": " + str(e))

# 2. Update JS file
with io.open(admin_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Radar chart colors
js = js.replace("backgroundColor: 'rgba(59, 130, 246, 0.2)',", "backgroundColor: 'rgba(249, 115, 22, 0.2)',")
js = js.replace("borderColor: '#3b82f6',", "borderColor: '#f97316',")
js = js.replace("pointBackgroundColor: '#2563eb',", "pointBackgroundColor: '#ea580c',")

# Padding of top 3 analysis (padding:15px; -> padding:12px 15px; margin-bottom:12px; -> margin-bottom:8px;)
# In admin.js, inside top3Symp.map and top3.map (waste):
# Let's target the exact style string:
target_top3_card_style = 'padding:15px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);'
replacement_top3_card_style = 'padding:12px 15px; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05);'
js = js.replace(target_top3_card_style, replacement_top3_card_style)

target_top3_card_margin = 'margin-bottom:12px;'
replacement_top3_card_margin = 'margin-bottom:8px;'
# Replace it twice because we have waste and symptoms maps
js = js.replace(target_top3_card_margin, replacement_top3_card_margin)


# Add getSymptomIcon globally
symptom_icon_func = """const getSymptomIcon = (symptomName) => {
    const s = symptomName.toLowerCase();
    if(s.includes('thông tin')) return 'fa-comments-slash';
    if(s.includes('dữ liệu')) return 'fa-database';
    if(s.includes('chữa cháy')) return 'fa-fire-extinguisher';
    if(s.includes('cải tiến')) return 'fa-history';
    if(s.includes('kế hoạch')) return 'fa-calendar-times';
    if(s.includes('tiêu chuẩn')) return 'fa-ruler-combined';
    if(s.includes('nguồn lực')) return 'fa-battery-empty';
    if(s.includes('dòng chảy')) return 'fa-pause-circle';
    return 'fa-exclamation-circle';
};
"""
if "getSymptomIcon" not in js:
    js = js.replace("const getWasteIcon =", symptom_icon_func + "\nconst getWasteIcon =")

# Update icons for symptoms
# The line is currently: <div style="font-size:22px; color:${conf.text}; margin-bottom:8px;"><i class="fas fa-exclamation-circle"></i></div>
# We only want to replace it for symptoms. We can use a regex or specific replacement since it's around `res.symptomsScores.map` but since `admin.js` uses `fa-exclamation-circle` here.
# Let's find it. It's inside `el_symp_scores.innerHTML = scores.symptomsScores.map(item => { ...`
js = js.replace('<i class="fas fa-exclamation-circle"></i></div>\n                <div style="flex: 1; font-size:10px;', 
                '<i class="fas ${getSymptomIcon(item.module)}"></i></div>\n                <div style="flex: 1; font-size:10px;')


with io.open(admin_js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Finished updating page 3 layout, colors and icons.")
