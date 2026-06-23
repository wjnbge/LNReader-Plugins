import urllib.request
import re

req = urllib.request.Request('https://www.alicesw.com/lists/71.html', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'<div[^>]*class="[^"]*layui-laypage[^"]*"[^>]*>(.*?)</div>', html, re.S)
if match:
    print("List Pagination:", match.group(1).strip())
else:
    match2 = re.search(r'<div[^>]*class="[^"]*pages[^"]*"[^>]*>(.*?)</div>', html, re.S)
    if match2:
        print("List Pagination (pages):", match2.group(1).strip())
    else:
        print("No pagination found for list")
