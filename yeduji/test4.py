import urllib.request
import ssl
import re
from html import unescape

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def fetch(url):
    req = urllib.request.Request(url, headers=headers)
    return urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

try:
    print('--- BOOK DETAILS: /book/361634/ ---')
    html = fetch('https://www.yeduji.com/book/361634/')
    
    title = re.search(r'<h1[^>]*>(.*?)</h1>', html)
    print('Title:', title.group(1) if title else 'None')
    
    author = re.search(r'作者：.*?<a[^>]*>(.*?)</a>', html)
    if not author: author = re.search(r'作者：([^<]+)', html)
    print('Author:', author.group(1) if author else 'None')
    
    cover = re.search(r'<img[^>]+src="([^"]+)"[^>]*alt="' + (title.group(1) if title else '') + '"', html)
    if not cover:
        cover = re.search(r'<div class="book-img">.*?<img[^>]+src="([^"]+)"', html, re.S)
    print('Cover:', cover.group(1) if cover else 'None')
    
    summary = re.search(r'<div class="book-intro">.*?<p>(.*?)</p>', html, re.S)
    if not summary:
        summary = re.search(r'<meta name="description" content="([^"]+)"', html)
    print('Summary:', summary.group(1)[:100] if summary else 'None')
    
    # chapters
    print('\n--- CHAPTER LIST ---')
    chapters = re.findall(r'<a[^>]+href="(/book/361634/\d+\.html)"[^>]*>(.*?)</a>', html)
    if not chapters:
        chapters = re.findall(r'<a[^>]+href="(/read/\d+/\d+\.html)"[^>]*>(.*?)</a>', html)
        if not chapters:
            chapters = re.findall(r'<dd><a href="([^"]+)">([^<]+)</a>', html)
    print(f'Found {len(chapters)} chapters.')
    for c in chapters[:5]:
        print(c)
        
    if chapters:
        first_chap = chapters[0][0]
        if not first_chap.startswith('http'):
            if not first_chap.startswith('/'):
                first_chap = '/book/361634/' + first_chap
            first_chap = 'https://www.yeduji.com' + first_chap
        print(f'\n--- FIRST CHAPTER: {first_chap} ---')
        ch_html = fetch(first_chap)
        content = re.search(r'<div id="content"[^>]*>(.*?)</div>', ch_html, re.S)
        if not content:
            content = re.search(r'<div class="read-content[^"]*"[^>]*>(.*?)</div>', ch_html, re.S)
        print('Content length:', len(content.group(1)) if content else 'Not found')
        if content: print(content.group(1)[:200].strip())
        
except Exception as e:
    print('Error:', e)
