import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

req = urllib.request.Request('https://www.yeduji.com/sort/1/1.html', headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    print('Category HTML (first 2000 chars):')
    print(res[:2000])
    
    links = set(re.findall(r'href=[\'\"](/[^\'\"]+)[\'\"]', res))
    print('\nFound relative links:')
    for l in links:
        if 'book' in l or 'read' in l or 'info' in l or 'detail' in l or 'novel' in l:
            print(l)
except Exception as e:
    print('Error:', e)
