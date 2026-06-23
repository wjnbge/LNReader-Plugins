import urllib.request
import re

req = urllib.request.Request('https://www.alicesw.com/', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Mocking cheerio behavior
from bs4 import BeautifulSoup
soup = BeautifulSoup(html, 'html.parser')

novels = []
for el in soup.select('div.class-img, div.itemg li, ul.itemg li'):
    aTag = el.select_one('a[href^="/novel/"]')
    if not aTag: continue
    novelPath = aTag['href']
    
    # Try to find an image in the current element
    imgTag = el.select_one('img')
    novelName = ''
    novelCover = ''
    if imgTag:
        novelName = imgTag.get('alt', '')
        novelCover = imgTag.get('data-src') or imgTag.get('src')
    
    if not novelName:
        novelName = aTag.text.strip()
        
    novels.append({'name': novelName, 'path': novelPath, 'cover': novelCover})

print("Parsed novels:", len(novels))
print("First 5:", novels[:5])
print("Novel with cover:", next((n for n in novels if n['cover']), None))
