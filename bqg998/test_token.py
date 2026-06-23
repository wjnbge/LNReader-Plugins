import urllib.request
import ssl
import json
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import urllib.parse

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest'
}

def get_token(book_id, chapter_id, code_str):
    code = hashlib.md5(code_str.encode()).hexdigest()
    
    iv = code[:16].encode('utf-8')
    key = code[16:].encode('utf-8')
    
    payload = json.dumps({'id': int(book_id), 'chapterid': int(chapter_id)}, separators=(',', ':')).encode('utf-8')
    
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted = cipher.encrypt(pad(payload, AES.block_size))
    token = base64.b64encode(encrypted).decode('utf-8')
    
    return urllib.parse.quote(token)

book_id = 62714
chapter_id = 1
code_str = 'book@token.html'

token = get_token(book_id, chapter_id, code_str)
chapter_url = f'https://m.bqg998.cc/api/chapter?id={book_id}&chapterid={chapter_id}&token={token}'
print("Token input string:", code_str)
print("Generated token:", token)

req = urllib.request.Request(chapter_url, headers=headers)
try:
    res = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    print(f"SUCCESS! Response length: {len(res)}")
    print(f"Sample response: {res[:500]}")
except Exception as e:
    print(f"Error: {e}")
