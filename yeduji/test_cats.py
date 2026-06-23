import urllib.request
import ssl
import re
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request('https://www.yeduji.com/categories/', headers={'User-Agent': 'Mozilla'})
res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

matches = re.findall(r'<a[^>]+href=[\'\"](/category/\d+/)[\'\"][^>]*>(.*?)</a>', res)
for m in matches:
    print(m)
