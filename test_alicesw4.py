import urllib.request

req = urllib.request.Request('https://www.alicesw.com/', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
import re
novels = re.findall(r'<a[^>]+href="(/novel/\d+\.html)"', html)
print("Homepage novels:", len(novels))
print("First few:", novels[:5])

req2 = urllib.request.Request('https://www.alicesw.com/all/order/update_time+desc.html', headers={'User-Agent':'Mozilla/5.0'})
html2 = urllib.request.urlopen(req2).read().decode('utf-8')
novels2 = re.findall(r'<a[^>]+href="(/novel/\d+\.html)"', html2)
print("Latest list novels:", len(novels2))

import json
items = re.findall(r'(<[^>]+class="[^"]*item[^"]*"[^>]*>.*?</a>)', html2, re.S)
print("Elements with item class:", len(items))
if items:
    print(items[0][:200])
