import io
import re

filepath = r"assets\js\admin.js"

with io.open(filepath, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace res.symptomsScores with scores.symptomsScores after el_symp_ana
js = js.replace('if (el_symp_ana && res.symptomsScores) {', 'if (el_symp_ana && scores.symptomsScores) {')
js = js.replace('const top3Symp = res.symptomsScores.slice(0, 3);', 'const top3Symp = scores.symptomsScores.slice(0, 3);')

with io.open(filepath, 'w', encoding='utf-8') as f:
    f.write(js)

print("Fixed res is not defined error")
