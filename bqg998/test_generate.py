import re
with open('bqg998.js', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r'require\([\'\"].*?[\'\"]\)', '{}', code)
code += '\nconsole.log(exports.default.getToken(\'62714\', 1));\n'

with open('test.js', 'w', encoding='utf-8') as f:
    f.write(code)
