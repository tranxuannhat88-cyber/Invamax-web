import io
import re

filepath = r"assets\js\admin.js"

with io.open(filepath, 'r', encoding='utf-8') as f:
    js = f.read()

# The 4 functions we want to make global
func_names = ['getColorConfig', 'getWasteImpact', 'getWasteIcon', 'getLightColorConfig']

extracted_funcs = []

for fname in func_names:
    # Pattern to match the function definition
    # e.g., const getColorConfig = (score, isHealth) => { ... };
    # We will find the start, then match braces to find the end.
    pattern = r"    const " + fname + r" = \([^)]*\) => \{"
    match = re.search(pattern, js)
    if match:
        start_idx = match.start()
        # Find the matching closing brace
        brace_count = 0
        end_idx = start_idx
        in_string = False
        string_char = ''
        found_start = False
        
        for i in range(start_idx, len(js)):
            c = js[i]
            if not in_string:
                if c in ("'", '"', '`'):
                    in_string = True
                    string_char = c
                elif c == '{':
                    brace_count += 1
                    found_start = True
                elif c == '}':
                    brace_count -= 1
                    if found_start and brace_count == 0:
                        end_idx = i + 1
                        # check for trailing semicolon
                        if end_idx < len(js) and js[end_idx] == ';':
                            end_idx += 1
                        break
            else:
                if c == string_char and js[i-1] != '\\':
                    in_string = False
                    
        func_str = js[start_idx:end_idx]
        extracted_funcs.append(func_str)
        # Remove it from the original place
        js = js[:start_idx] + js[end_idx:]

if extracted_funcs:
    # Insert them right before function renderPreliminary
    insert_pattern = "function renderPreliminary"
    idx = js.find(insert_pattern)
    if idx != -1:
        funcs_text = "\n".join([f.replace("    const ", "const ") for f in extracted_funcs]) + "\n\n"
        js = js[:idx] + funcs_text + js[idx:]
        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(js)
        print("Successfully extracted functions to global scope.")
    else:
        print("Could not find function renderPreliminary.")
else:
    print("Could not extract any functions.")
