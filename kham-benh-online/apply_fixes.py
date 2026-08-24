import io
import re

filepath = r"assets\js\admin.js"

with io.open(filepath, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update radar chart fonts and ticks
js = js.replace("pointLabels: { font: { size: 9,", "pointLabels: { font: { size: 10.5,")
js = js.replace("ticks: { display: false, min: 0, max: 100, stepSize: 20 }", "ticks: { display: false, min: 0, max: 100, stepSize: 20, count: 6 }")
js = js.replace("ticks: { display: false, min: 0, max: 100 }", "ticks: { display: false, min: 0, max: 100, stepSize: 20, count: 6 }")

# 2. Update waste scores flex layout for alignment
js = js.replace('<div style="font-size:10px; font-weight:bold; color:#475569; margin-bottom:8px; min-height:30px; display:flex; align-items:center; justify-content:center; line-height:1.3; width: 100%; word-break: break-word;">${item.module}</div>',
                '<div style="flex: 1; font-size:10px; font-weight:bold; color:#475569; margin-bottom:8px; display:flex; align-items:center; justify-content:center; line-height:1.3; width: 100%; word-break: break-word;">${item.module}</div>')

# 3. Update waste cards background
js = js.replace('const conf = getLightColorConfig(item.score);', 'const conf = getColorConfig(item.score, false);')
js = js.replace('border:1px solid ${conf.border}', 'border:1px solid ${conf.bg}')
js = js.replace('color:${conf.color}', 'color:${conf.text}')

# 4. Update System Prompt for AI analysis
# Since character encoding might be tricky, we'll use a regex replacement
js = re.sub(r'("wasteAnalysis": "[^"]*",)', r'\1 "top3WastesImpacts": [{"waste": "Tên lãng phí", "impact": "Nhận xét phân tích tác động dựa trên kết quả khảo sát chi tiết"}],', js)

# 4. Update the logic to use AI generated impact
# Using a fallback to avoid encoding issues with Tác động
logic_old = '<div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">Tác động:</span> ${getWasteImpact(item.module)}</div>'
logic_old_2 = '<div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">T\xe1c \u0111\u1ed9ng:</span> ${getWasteImpact(item.module)}</div>'

logic_new = '''<div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">Tác động:</span> ${(() => {
                    let aiImpact = getWasteImpact(item.module);
                    if (res.diagnostic && res.diagnostic.top3WastesImpacts) {
                        const found = res.diagnostic.top3WastesImpacts.find(x => x.waste.toLowerCase() === item.module.toLowerCase());
                        if (found) aiImpact = found.impact;
                    }
                    return aiImpact;
                })()}</div>'''

js = js.replace(logic_old, logic_new)
js = js.replace(logic_old_2, logic_new)

# if the exact string wasn't found due to encoding, let's use regex for the impact line:
js = re.sub(r'<div style="font-size:13px; color:#475569; line-height:1.6;"><span style="font-weight:bold;">[^<]+</span> \${getWasteImpact\(item.module\)}</div>', logic_new, js)


with io.open(filepath, 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated admin.js successfully")
