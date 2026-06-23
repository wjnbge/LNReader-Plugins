import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
}

# First get the book details for book 62714
print('=== BOOK DETAILS ===')
req = urllib.request.Request('https://m.bqg998.cc/api/book?id=62714', headers=headers)
res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
book = json.loads(res)
print('dirid:', book.get('dirid'))
print('id:', book.get('id'))

print('\n=== BOOKLIST ===')
req = urllib.request.Request('https://m.bqg998.cc/api/booklist?id=' + str(book.get('dirid')), headers=headers)
res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
data = json.loads(res)
chapters = data.get('list', [])
print('Total chapters:', len(chapters))
print('First 3:', chapters[:3])

print('\n=== CHAPTER API (chapterId=1) ===')
# Try to fetch chapter 1 content
req = urllib.request.Request('https://m.bqg998.cc/api/chapter?id=62714&chapterid=1&token=test', headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    print('Response:', res[:300])
except Exception as e:
    print('Error:', e)
