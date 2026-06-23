import urllib.request
import re

req2 = urllib.request.Request('https://www.alicesw.com/all/order/update_time+desc.html', headers={'User-Agent':'Mozilla/5.0'})
html2 = urllib.request.urlopen(req2).read().decode('utf-8')
match = re.search(r'<a[^>]+href="(/novel/\d+\.html)"', html2)
if match:
    start = max(0, match.start() - 200)
    end = min(len(html2), match.end() + 500)
    print(html2[start:end])
