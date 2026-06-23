import urllib.request
import re

req = urllib.request.Request('https://www.alicesw.com/', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

match = re.search(r'<div class="class-img">.*?</div>', html, re.S)
if match:
    print(match.group(0))
