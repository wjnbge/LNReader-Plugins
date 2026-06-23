import urllib.request
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# Try different search URL formats
urls = [
    'https://www.yeduji.com/search/?keyword=' + urllib.parse.quote('校园'),
    'https://www.yeduji.com/search?keyword=' + urllib.parse.quote('校园'),
    'https://www.yeduji.com/search/' + urllib.parse.quote('校园') + '/',
    'https://www.yeduji.com/s/' + urllib.parse.quote('校园'),
    'https://www.yeduji.com/search.html?q=' + urllib.parse.quote('校园'),
    'https://www.yeduji.com/search/?q=' + urllib.parse.quote('校园'),
]

for url in urls:
    req = urllib.request.Request(url, headers=headers)
    try:
        res = urllib.request.urlopen(req, context=ctx)
        body = res.read().decode('utf-8', errors='ignore')
        if 'novel-list' in body or 'search-result' in body or len(body) > 2000:
            print('OK', url, 'length:', len(body))
            with open('search_ok.html', 'w', encoding='utf-8') as f:
                f.write(body)
        else:
            print('EMPTY', url, 'length:', len(body))
    except Exception as e:
        print('FAIL', url, str(e)[:50])

# Try POST search
print('\n--- POST search ---')
import json
data = urllib.parse.urlencode({'keyword': '校园'}).encode()
req = urllib.request.Request('https://www.yeduji.com/search/', data=data, headers=headers)
req.add_header('Content-Type', 'application/x-www-form-urlencoded')
try:
    res = urllib.request.urlopen(req, context=ctx)
    body = res.read().decode('utf-8', errors='ignore')
    print('POST OK, length:', len(body))
    with open('search_post.html', 'w', encoding='utf-8') as f:
        f.write(body)
except Exception as e:
    print('POST FAIL:', e)
