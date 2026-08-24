import re

with open('app_combined.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Instead of removing strings which changes lengths, let's just use a simple state machine to find the line
def get_line_num(index):
    return text[:index].count('\n') + 1

in_string = False
string_char = ''
in_block_comment = False
in_line_comment = False
escape = False

pairs = {'{':'}', '(':')', '[':']'}
stack = []

for i, c in enumerate(text):
    if in_line_comment:
        if c == '\n':
            in_line_comment = False
        continue
    if in_block_comment:
        if c == '/' and text[i-1] == '*':
            in_block_comment = False
        continue
    if in_string:
        if escape:
            escape = False
        elif c == '\\':
            escape = True
        elif c == string_char:
            in_string = False
        continue
        
    if c == '/' and i+1 < len(text) and text[i+1] == '/':
        in_line_comment = True
        continue
    if c == '/' and i+1 < len(text) and text[i+1] == '*':
        in_block_comment = True
        continue
    if c in '"\\'`:
        in_string = True
        string_char = c
        continue
        
    if c in pairs:
        stack.append((c, get_line_num(i)))
    elif c in pairs.values():
        if not stack:
            print(f'Unmatched {c} at line {get_line_num(i)}')
            exit(1)
        last_c, line = stack.pop()
        if pairs[last_c] != c:
            print(f'Mismatched {c} at line {get_line_num(i)}, expected {pairs[last_c]} from line {line}')
            exit(1)

if stack:
    print(f'Unclosed brackets: {stack}')
else:
    print('Balanced!')
