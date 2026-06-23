import urllib.request
import urllib.parse
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# 1. Test search
print('=== SEARCH ===')
search_url = 'https://www.yeduji.com/search.html?keyword=' + urllib.parse.quote('校园')
req = urllib.request.Request(search_url, headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    with open('search.html', 'w', encoding='utf-8') as f:
        f.write(res)
    print('search saved, length:', len(res))
except Exception as e:
    print('search error:', e)

# 2. Test tag page
print('\n=== TAG ===')
tag_url = 'https://www.yeduji.com/tag/52/'
req = urllib.request.Request(tag_url, headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    with open('tag.html', 'w', encoding='utf-8') as f:
        f.write(res)
    print('tag saved, length:', len(res))
except Exception as e:
    print('tag error:', e)

# 3. Test rank page
print('\n=== RANK ===')
rank_url = 'https://www.yeduji.com/rank/hot/'
req = urllib.request.Request(rank_url, headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    with open('rank.html', 'w', encoding='utf-8') as f:
        f.write(res)
    print('rank saved, length:', len(res))
except Exception as e:
    print('rank error:', e)
