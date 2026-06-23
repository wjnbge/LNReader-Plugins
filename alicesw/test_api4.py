import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

req = urllib.request.Request('https://www.alicesw.com/search.html?q=test', headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    matches = re.finditer(r'<select.*?name=\"f\".*?>(.*?)</select>', res, re.S)
    for m in matches:
        options = re.findall(r'<option.*?value=\"(.*?)\".*?>(.*?)</option>', m.group(1))
        for option in options:
            print(option)
except Exception as e:
    print('Error:', e)
