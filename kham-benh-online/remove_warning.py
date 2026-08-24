import io
import re

filepath = r"assets\js\admin.js"

with io.open(filepath, 'r', encoding='utf-8') as f:
    js = f.read()

# Pattern to find customAssessment assignment and remove the warningStr part
# The line is something like: let customAssessment = `...<span style="color:#ef4444; font-weight:bold;">${warningStr}</span>`;

pattern = r"(let customAssessment = `[^`]+)<br><br><span style=\"color:#ef4444; font-weight:bold;\">\$\{warningStr\}</span>`;"
replacement = r"\1`;"

js = re.sub(pattern, replacement, js)

with io.open(filepath, 'w', encoding='utf-8') as f:
    f.write(js)

print("Removed warningStr from admin.js")
