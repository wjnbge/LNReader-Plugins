import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36'
}

print('=== common.js ===')
try:
    res = urllib.request.urlopen(urllib.request.Request('https://m.bqg998.cc/js/common.js', headers=headers), context=ctx).read().decode('utf-8')
    matches = re.finditer(r'[\"\'\`]/api/.*?[\"\'\`]', res)
    for m in set(m.group(0) for m in matches):
        print(m)
except Exception as e:
    print(e)

print('=== read.js ===')
try:
    res = urllib.request.urlopen(urllib.request.Request('https://m.bqg998.cc/js/read.js', headers=headers), context=ctx).read().decode('utf-8')
    matches = re.finditer(r'[\"\'\`]/api/.*?[\"\'\`]', res)
    for m in set(m.group(0) for m in matches):
        print(m)
except Exception as e:
    print(e)
