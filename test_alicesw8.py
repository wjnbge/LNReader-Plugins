import urllib.request
import re

req = urllib.request.Request('https://www.alicesw.com/novel/47487.html', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'<img[^>]+src="([^"]+)"[^>]*fengmian', html)
if match:
    print("Cover 1:", match.group(1))

match2 = re.search(r'<img[^>]+fengmian[^>]+src="([^"]+)"', html)
if match2:
    print("Cover 2:", match2.group(1))

# Let's also check another novel to see the pattern
req3 = urllib.request.Request('https://www.alicesw.com/novel/33927.html', headers={'User-Agent':'Mozilla/5.0'})
html3 = urllib.request.urlopen(req3).read().decode('utf-8')
match3 = re.search(r'<img[^>]+src="([^"]+)"[^>]*fengmian', html3)
if match3:
    print("Cover 3:", match3.group(1))
match4 = re.search(r'<img[^>]+fengmian[^>]+src="([^"]+)"', html3)
if match4:
    print("Cover 4:", match4.group(1))

# Also extract all categories from the homepage
req_home = urllib.request.Request('https://www.alicesw.com/', headers={'User-Agent':'Mozilla/5.0'})
html_home = urllib.request.urlopen(req_home).read().decode('utf-8')
nav = re.findall(r'<a[^>]+href="(/lists/\d+\.html)"[^>]*>([^<]+)</a>', html_home)
print("Categories:", nav)
