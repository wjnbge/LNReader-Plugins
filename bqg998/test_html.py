import urllib.request
import ssl
import re
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36'
}

req = urllib.request.Request('https://m.bqg998.cc/book/62714/', headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    print('BOOK HTML LENGTH:', len(res))
    matches = re.findall(r'<a href=\"/book/62714/(\d+)\.html\">', res)
    print('CHAPTER IDs found in HTML:', matches[:10])
except Exception as e:
    print('Error:', e)
