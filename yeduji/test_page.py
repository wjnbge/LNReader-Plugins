import urllib.request
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://www.yeduji.com/cat/13/2.html',
    'https://www.yeduji.com/cat/13/index_2.html',
    'https://www.yeduji.com/cat/13/?page=2'
]

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla'})
    try:
        res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        if '<li><a href="/book/' in res or 'class="novel-list"' in res:
            print('Pagination exists:', url)
    except Exception as e:
        print('Error', url, e)

# Also let's check what a page of category actually looks like to parse the list!
req = urllib.request.Request('https://www.yeduji.com/cat/13/', headers={'User-Agent': 'Mozilla'})
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    import re
    print("Items found:", len(re.findall(r'<a href="(/book/\d+/)">', res)))
except Exception as e:
    print(e)
