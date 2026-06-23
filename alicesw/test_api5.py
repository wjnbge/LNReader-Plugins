import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

req = urllib.request.Request('https://www.alicesw.com/', headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    matches = re.finditer(r'<select.*?name=\"f\".*?</select>', res, re.S)
    for m in matches:
        print(m.group(0))
except Exception as e:
    print('Error:', e)
