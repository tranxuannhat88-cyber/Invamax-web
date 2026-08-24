import re

with open('app_combined.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'//.*', '', text)
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
text = re.sub(r'\"(?:\\.|[^\\\"])*\"', '""', text)
text = re.sub(r'\'(?:\\.|[^\\\'])*\'', "''", text)
text = re.sub(r'\`(?:\\.|[^\\\`])*\`', '``', text)

pairs = {'{':'}', '(':')', '[':']'}
stack = []
for i, c in enumerate(text):
    if c in pairs:
        stack.append((c, i))
    elif c in pairs.values():
        if not stack:
            print(f'Unmatched closing bracket {c} at {i}')
            exit(1)
        last, pos = stack.pop()
        if pairs[last] != c:
            print(f'Mismatched closing bracket {c} at {i}, expected {pairs[last]} from {pos}')
            exit(1)
if stack:
    print(f'Unclosed brackets: {stack}')
else:
    print('Balanced!')
