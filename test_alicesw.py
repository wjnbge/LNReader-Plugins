import urllib.request
import re

try:
    req = urllib.request.Request('https://www.alicesw.com/all/order/update_time+desc.html', headers={'User-Agent':'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    print("Length:", len(html))
    print("Novels:", re.findall(r'href="(/novel/\d+\.html)"', html)[:5])
except Exception as e:
    print(e)
