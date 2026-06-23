import urllib.request
import urllib.parse
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36',
}

def fetch(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        return res
    except Exception as e:
        return str(e)

print("--- SEARCH ---")
search_url = 'https://www.yeduji.com/search.html?keyword=' + urllib.parse.quote('系统')
html = fetch(search_url)
# Try to find book entries
matches = re.findall(r'<a[^>]+href="(/book/[^"]+)"[^>]*title="([^"]+)"', html)
print("Search results:")
for m in matches[:5]:
    print(m)

print("\n--- CATEGORY ---")
cat_url = 'https://www.yeduji.com/sort/1/1.html'
html = fetch(cat_url)
matches = re.findall(r'<a[^>]+href="(/book/[^"]+)"[^>]*title="([^"]+)"', html)
print("Category results:")
for m in matches[:5]:
    print(m)

if matches:
    book_url = 'https://www.yeduji.com' + matches[0][0]
    print(f"\n--- BOOK DETAILS: {book_url} ---")
    html = fetch(book_url)
    
    # Try to find chapter links
    chapter_matches = re.findall(r'<a[^>]+href="(/book/\d+/\d+\.html)"[^>]*>([^<]+)</a>', html)
    print(f"Chapters found: {len(chapter_matches)}")
    if chapter_matches:
        for m in chapter_matches[:5]:
            print(m)
        
        chapter_url = 'https://www.yeduji.com' + chapter_matches[0][0]
        print(f"\n--- CHAPTER CONTENT: {chapter_url} ---")
        html = fetch(chapter_url)
        # Try to find content div
        content = re.search(r'<div[^>]*id="content"[^>]*>(.*?)</div>', html, re.S)
        if content:
            print("Content length:", len(content.group(1)))
            print(content.group(1)[:200].strip())
        else:
            print("Could not find <div id=\"content\">")
