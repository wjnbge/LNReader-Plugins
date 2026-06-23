import re
with open('e:/antiproject/alicesw-plugin/read.js.txt', 'r', encoding='utf-16') as f:
    text = f.read()

matches = re.finditer(r'[\"\'\`]/api/.*?[\"\'\`]', text)
for m in set(m.group(0) for m in matches):
    print(m)
