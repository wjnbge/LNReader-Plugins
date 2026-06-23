import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

req = urllib.request.Request('https://www.yeduji.com', headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    links = set(re.findall(r'href=[\'\"](/[^\'\"]+)[\'\"]', res))
    for l in list(links)[:20]:
        print(l)
    
    print('Books:')
    books = [l for l in links if 'book' in l or 'info' in l or 'detail' in l]
    for b in books[:10]:
        print(b)
except Exception as e:
    print('Error:', e)
