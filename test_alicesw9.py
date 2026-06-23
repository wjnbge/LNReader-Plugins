import urllib.request
import re

req = urllib.request.Request('https://www.alicesw.com/lists/71.html', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'<div[^>]*class="[^"]*pagelink[^"]*"[^>]*>(.*?)</div>', html, re.S)
if match:
    print("Pagination:", match.group(1).strip())
else:
    print("No pagelink class found")

# What about the search page?
req2 = urllib.request.Request('https://www.alicesw.com/search.html?q=1', headers={'User-Agent':'Mozilla/5.0'})
html2 = urllib.request.urlopen(req2).read().decode('utf-8')
match2 = re.search(r'<ul[^>]*class="[^"]*pagination[^"]*"[^>]*>(.*?)</ul>', html2, re.S)
if match2:
    print("Search Pagination:", match2.group(1).strip())
else:
    match3 = re.search(r'<div[^>]*class="[^"]*page[^"]*"[^>]*>(.*?)</div>', html2, re.S)
    if match3:
        print("Search Pagination (div):", match3.group(1).strip())
    else:
        print("No pagination found in search")
