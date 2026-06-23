import urllib.request
import re

req=urllib.request.Request('https://www.alicesw.com/all/order/update_time+desc.html', headers={'User-Agent':'Mozilla/5.0'})
html=urllib.request.urlopen(req).read().decode('utf-8')
start = html.find('<ul class="itemg">')
end = html.find('</ul>', start)
print(html[start:start+1000])
