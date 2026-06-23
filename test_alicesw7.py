import urllib.request
import re

req = urllib.request.Request('https://www.alicesw.com/lists/71.html', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'<a[^>]+href="(/novel/\d+\.html)"', html)
if match:
    start = max(0, match.start() - 200)
    end = min(len(html), match.end() + 500)
    print("CATEGORY LIST:")
    print(html[start:end])

req2 = urllib.request.Request('https://www.alicesw.com/other/rank_hits/order/hits_week.html', headers={'User-Agent':'Mozilla/5.0'})
html2 = urllib.request.urlopen(req2).read().decode('utf-8')
match2 = re.search(r'<a[^>]+href="(/novel/\d+\.html)"', html2)
if match2:
    start = max(0, match2.start() - 200)
    end = min(len(html2), match2.end() + 500)
    print("\n\nRANKING LIST:")
    print(html2[start:end])

