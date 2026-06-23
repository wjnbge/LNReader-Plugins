import json
import os

plugin_template = r'''var fetchAPI = require("@libs/fetch");
var filterInputs = require("@libs/filterInputs");
var novelStatus = require("@libs/novelStatus");

// --- CRYPTO-JS ---
var CryptoJS_global = {};
%CRYPTOJS%
var CryptoJS = CryptoJS_global.CryptoJS || CryptoJS_global;
// --- END CRYPTO-JS ---

function Bqg998() {
    this.id = 'bqg998';
    this.name = '笔趣阁998';
    this.icon = 'https://m.bqg998.cc/favicon.ico';
    this.site = 'https://m.bqg998.cc';
    this.version = '0.1.8';
    this.fetchOptions = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    this.filters = {
        sort: {
            label: '分类',
            value: 'top',
            options: [
                { label: '排行', value: 'top' },
                { label: '玄幻', value: 'xuanhuan' },
                { label: '武侠', value: 'wuxia' },
                { label: '都市', value: 'dushi' },
                { label: '历史', value: 'lishi' },
                { label: '网游', value: 'wangyou' },
                { label: '科幻', value: 'kehuan' },
                { label: '女频', value: 'mm' },
                { label: '完本', value: 'finish' }
            ],
            type: filterInputs.FilterTypes.Picker
        }
    };
}

Bqg998.prototype.getToken = function(id, chapterid) {
    var codeStr = 'book@token.html';
    var code = CryptoJS.MD5(codeStr).toString();
    var iv = CryptoJS.enc.Utf8.parse(code.substring(0, 16));
    var key = CryptoJS.enc.Utf8.parse(code.substring(16));
    var payload = JSON.stringify({id: parseInt(id), chapterid: parseInt(chapterid)});
    var encrypted = CryptoJS.AES.encrypt(payload, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encodeURIComponent(encrypted.toString());
};

Bqg998.prototype.bookCover = function(id) {
    return this.site + "/bookimg/" + Math.floor(id / 1000) + "/" + id + ".jpg";
};

Bqg998.prototype.popularNovels = function(pageNo, options) {
    var filters = options.filters || { sort: { value: 'top' } };
    var sortVal = filters.sort ? filters.sort.value : 'top';
    var url = this.site + "/api/sort?sort=" + sortVal + "&page=" + pageNo;
    
    var self = this;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        if (!body) return [];
        var res;
        try {
            res = JSON.parse(body);
        } catch(e) {
            return [{
                name: "JSON Error (Sort): " + e.message,
                cover: "",
                path: "",
                author: "Error",
                summary: (body || "").substring(0, 100),
                status: novelStatus.NovelStatus.Ongoing
            }];
        }
        var novels = [];
        var list = res.data || res;
        if (list && list.length) {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                novels.push({
                    name: item.title || item.name,
                    cover: self.bookCover(item.id),
                    path: '/api/book?id=' + item.id,
                    author: item.author,
                    summary: item.intro || item.desc,
                    status: item.full ? novelStatus.NovelStatus.Completed : novelStatus.NovelStatus.Ongoing
                });
            }
        }
        return novels;
    });
};

Bqg998.prototype.searchNovels = function(searchTerm, pageNo) {
    var url = this.site + "/api/search?q=" + encodeURIComponent(searchTerm) + "&page=" + pageNo;
    var self = this;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        if (!body) return [];
        var res;
        try {
            res = JSON.parse(body);
        } catch(e) {
            return [{
                name: "JSON Error (Search): " + e.message,
                cover: "",
                path: "",
                author: "Error",
                summary: (body || "").substring(0, 100),
                status: novelStatus.NovelStatus.Ongoing
            }];
        }
        var novels = [];
        var list = res.data || res;
        if (list && list.length) {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                novels.push({
                    name: item.title || item.name,
                    cover: self.bookCover(item.id),
                    path: '/api/book?id=' + item.id,
                    author: item.author,
                    summary: item.intro || item.desc,
                    status: item.full ? novelStatus.NovelStatus.Completed : novelStatus.NovelStatus.Ongoing
                });
            }
        }
        return novels;
    });
};

Bqg998.prototype.parseNovel = function(novelPath) {
    var url = this.site + novelPath;
    var self = this;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        if (!body) throw new Error('无法获取小说详情');
        var res = JSON.parse(body);
        var novel = {
            path: novelPath,
            name: res.title,
            author: res.author,
            cover: self.bookCover(res.id),
            summary: res.intro,
            genres: res.sortname,
            status: res.full ? novelStatus.NovelStatus.Completed : novelStatus.NovelStatus.Ongoing,
            chapters: []
        };

        var listUrl = self.site + "/api/booklist?id=" + res.dirid;
        return fetchAPI.fetchText(listUrl, self.fetchOptions).then(function(listBody) {
            if (!listBody) return novel;
            var listRes = JSON.parse(listBody);
            if (listRes && listRes.list) {
                for (var i = 0; i < listRes.list.length; i++) {
                    var chapterName = listRes.list[i];
                    var chapterId = i + 1;
                    var token = self.getToken(res.id, chapterId);
                    novel.chapters.push({
                        name: chapterName,
                        path: '/api/chapter?id=' + res.id + '&chapterid=' + chapterId + '&token=' + token
                    });
                }
            }
            return novel;
        });
    });
};

Bqg998.prototype.parseChapter = function(chapterPath) {
    var url = this.site + chapterPath;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        if (!body) return '';
        var res = JSON.parse(body);
        var text = res.txt || res.info || res.content || res.text || res.data || "";
        if (typeof text === 'object') {
            text = text.info || text.content || "";
        }
        // Basic cleanup of spaces to paragraph tags
        text = text.replace(/<br\s*\/?>/gi, '\n');
        var pars = text.split('\n');
        var html = [];
        for (var i = 0; i < pars.length; i++) {
            var p = pars[i].trim();
            if (p) {
                html.push('<p>' + p + '</p>');
            }
        }
        return html.join('\n') || text;
    });
};

exports.default = new Bqg998();
'''

with open('crypto-js.min.js', 'r', encoding='utf-8') as f:
    crypto_js = f.read()

# Make sure crypto js wrapper uses CryptoJS_global and doesn't hijack module.exports
crypto_js = crypto_js.replace('}(this,function(){', '}(CryptoJS_global,function(){')
crypto_js = crypto_js.replace('"object"==typeof exports?module.exports=exports=r():"function"==typeof define&&define.amd?define([],r):t.CryptoJS=r()', 't.CryptoJS=r()')

plugin_code = plugin_template.replace('%CRYPTOJS%', crypto_js)

with open('bqg998.js', 'w', encoding='utf-8') as f:
    f.write(plugin_code)
