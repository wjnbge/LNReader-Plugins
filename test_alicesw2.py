import urllib.request
from bs4 import BeautifulSoup
import traceback

try:
    req = urllib.request.Request('https://www.alicesw.com/all/order/update_time+desc.html', headers={'User-Agent':'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    
    novels = []
    for el in soup.select('div.class-img, div.itemg li, ul.itemg li'):
        a_tag = el.select_one('a[href^="/novel/"]')
        if not a_tag: continue
        
        novelPath = a_tag.get('href')
        img_tag = el.select_one('img')
        
        novelName = img_tag.get('alt') if img_tag and img_tag.get('alt') else a_tag.text.strip()
        novelCover = img_tag.get('data-src') or img_tag.get('src') if img_tag else ""
        
        novels.append({
            'name': novelName,
            'cover': novelCover,
            'path': novelPath
        })
        
    print(f"Found {len(novels)} novels")
    if novels: print(novels[:2])
except Exception as e:
    traceback.print_exc()
