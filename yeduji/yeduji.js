var cheerio = require("cheerio");
var fetchAPI = require("@libs/fetch");
var filterInputs = require("@libs/filterInputs");

function Yeduji() {
    this.id = 'yeduji';
    this.name = '夜读集';
    this.icon = 'https://www.yeduji.com/favicon.ico';
    this.site = 'https://www.yeduji.com';
    this.version = '0.1.4';
    this.fetchOptions = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
        }
    };
    this.filters = {
        cat: {
            label: '分类',
            value: '/rank/hot/',
            options: [
                { label: '热门排行', value: '/rank/hot/' },
                { label: '完本专区', value: '/rank/complete/' },
                { label: '历史', value: '/cat/13/' },
                { label: '穿越', value: '/cat/26/' },
                { label: '同人', value: '/cat/39/' },
                { label: '武侠', value: '/cat/52/' },
                { label: '校园', value: '/cat/65/' },
                { label: '都市', value: '/cat/78/' },
                { label: '乱伦', value: '/cat/91/' },
                { label: '科幻', value: '/cat/104/' },
                { label: '奇幻', value: '/cat/117/' },
                { label: '玄幻', value: '/cat/130/' },
                { label: '系统', value: '/cat/143/' },
                { label: '乡村', value: '/cat/156/' },
                { label: '异能', value: '/cat/169/' },
                { label: '明星', value: '/cat/182/' }
            ],
            type: filterInputs.FilterTypes.Picker
        },
        tag: {
            label: '标签',
            value: '',
            options: [
                { label: '无', value: '' },
                { label: '调教', value: '/tag/52/' },
                { label: '剧情', value: '/tag/104/' },
                { label: '制服', value: '/tag/260/' },
                { label: '反差', value: '/tag/117/' },
                { label: '榨精', value: '/tag/130/' },
                { label: '丝袜', value: '/tag/247/' },
                { label: '人妻', value: '/tag/234/' },
                { label: '熟女', value: '/tag/221/' },
                { label: '凌辱', value: '/tag/299/' },
                { label: 'NTR', value: '/tag/195/' },
                { label: '性奴', value: '/tag/143/' },
                { label: '适合女生', value: '/tag/39/' },
                { label: 'NP', value: '/tag/13/' }
            ],
            type: filterInputs.FilterTypes.Picker
        }
    };
}

// Helper: parse .novel-list a structure (used in cat, tag, rank pages)
function parseNovelList($, site) {
    var novels = [];
    $('.novel-list a').each(function() {
        var el = $(this);
        var title = el.find('h4').text().trim();
        var cover = el.find('img').attr('data-src') || el.find('img').attr('src');
        if (cover && cover.indexOf('http') !== 0) cover = site + cover;
        var path = el.attr('href');
        var author = el.find('span').text().trim();
        if (title && path) {
            novels.push({
                name: title,
                cover: cover,
                path: path,
                author: author
            });
        }
    });
    return novels;
}

Yeduji.prototype.popularNovels = function(page, _a) {
    var filters = _a.filters;
    // Tag takes priority if selected
    var cat = '';
    if (filters && filters.tag && filters.tag.value) {
        cat = filters.tag.value;
    } else if (filters && filters.cat && filters.cat.value) {
        cat = filters.cat.value;
    } else {
        cat = '/rank/hot/';
    }
    
    var url = this.site + cat;
    // /cat/xx/ and /tag/xx/ support pagination
    if (cat.indexOf('/cat/') !== -1 || cat.indexOf('/tag/') !== -1) {
        url = url + page + '.html';
    } else {
        if (page > 1) return Promise.resolve([]);
    }
    
    var self = this;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        var $ = cheerio.load(body);
        return parseNovelList($, self.site);
    });
};

Yeduji.prototype.searchNovels = function(keyword, page) {
    // Search URL: /search/?q=xxx  (supports pagination via &p=2)
    var url = this.site + '/search/?q=' + encodeURIComponent(keyword);
    if (page > 1) url += '&p=' + page;
    var self = this;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        var $ = cheerio.load(body);
        var novels = [];
        // Search uses .novel-item structure
        $('.novel-item').each(function() {
            var el = $(this);
            var titleEl = el.find('a.title');
            var title = titleEl.text().trim();
            var path = titleEl.attr('href') || el.find('a.cover').attr('href');
            var cover = el.find('img').attr('data-src') || el.find('img').attr('src');
            if (cover && cover.indexOf('http') !== 0) cover = self.site + cover;
            var author = el.find('.author').text().trim();
            if (title && path) {
                novels.push({
                    name: title,
                    cover: cover,
                    path: path,
                    author: author
                });
            }
        });
        // Fallback: also try .novel-list structure
        if (novels.length === 0) {
            novels = parseNovelList($, self.site);
        }
        return novels;
    });
};

Yeduji.prototype.parseNovel = function(novelPath) {
    var url = this.site + novelPath;
    var self = this;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        var $ = cheerio.load(body);
        var novel = {
            path: novelPath,
            chapters: []
        };
        
        novel.name = $('section.novel .info h1').text().trim() || $('h1').first().text().trim();
        
        novel.author = $('section.novel .info dl').filter(function() {
            return $(this).find('dt').text() === '作者';
        }).find('dd').text().trim();
        
        var cover = $('section.novel .cover img').attr('src');
        if (cover && cover.indexOf('http') !== 0) cover = self.site + cover;
        novel.cover = cover;
        
        novel.summary = $('p.desc-content').text().trim() || $('meta[name="description"]').attr('content');
        
        var statusText = $('section.novel .info dl').filter(function() {
            return $(this).find('dt').text() === '状态';
        }).find('dd').text().trim();
        novel.status = statusText.indexOf('完') !== -1 ? 'Completed' : 'Ongoing';
        
        // Fetch the full chapter list from the list/ subpage
        var listUrl = url;
        if (listUrl.charAt(listUrl.length - 1) !== '/') listUrl += '/';
        listUrl += 'list/';
        
        return fetchAPI.fetchText(listUrl, self.fetchOptions).then(function(listBody) {
            var $l = cheerio.load(listBody);
            $l('.chapter-list a').each(function() {
                var href = $l(this).attr('href');
                var title = $l(this).find('h4').text().trim();
                if (href && title) {
                    novel.chapters.push({
                        name: title,
                        path: href
                    });
                }
            });
            return novel;
        }).catch(function() {
            // Fallback: use chapters from the detail page
            $('.chapter-list a').each(function() {
                var href = $(this).attr('href');
                var title = $(this).find('h4').text().trim();
                if (href && title) {
                    novel.chapters.push({
                        name: title,
                        path: href
                    });
                }
            });
            return novel;
        });
    });
};

Yeduji.prototype.parseChapter = function(chapterPath) {
    var url = this.site + chapterPath;
    if (chapterPath.indexOf('http') === 0) url = chapterPath;
    
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        var $ = cheerio.load(body);
        var content = $('section.chapter .content').html() || $('.content').html() || $('#content').html();
        if (!content) throw new Error('无法解析章节内容');
        
        // Clean up VIP notices and ads
        content = content.replace(/以下内容为VIP专属.*?重试。/g, '');
        content = content.replace(/夜读集由爱发电.*?yeduji\.com/g, '');
        
        return content;
    });
};

exports.default = new Yeduji();
