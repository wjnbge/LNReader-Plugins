import urllib.request
import re

req = urllib.request.Request('https://www.alicesw.com/search.html?q=1', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'<a[^>]+href="(/novel/\d+\.html)"', html)
if match:
    start = max(0, match.start() - 200)
    end = min(len(html), match.end() + 500)
    print(html[start:end])
