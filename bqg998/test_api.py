import urllib.request
import ssl
import json
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36'
}

req = urllib.request.Request('https://m.bqg998.cc/book/111021/', headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('gbk', errors='ignore')
    print('SUCCESS! Length:', len(res))
    matches = re.finditer(r'<a[^>]*href=\"(.*?)\"[^>]*>(.*?)</a>', res)
    for m in matches:
        if '111021' in m.group(1):
            print(m.group(1), m.group(2))
except Exception as e:
    print('Error:', e)
