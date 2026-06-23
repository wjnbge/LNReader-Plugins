import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://www.yeduji.com/book/361634/list/', headers={'User-Agent': 'Mozilla'})
res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
with open('book_list.html', 'w', encoding='utf-8') as f:
    f.write(res)
print('saved', len(res), 'bytes')
