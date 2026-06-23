var cheerio = require("cheerio");
var fetchAPI = require("@libs/fetch");
var filterInputs = require("@libs/filterInputs");
var novelStatus = require("@libs/novelStatus");

function AliceSW() {
    this.id = 'alicesw';
    this.name = '爱丽丝书屋';
    this.icon = 'src/cn/alicesw/icon.png';
    this.site = 'https://www.alicesw.com';
    this.version = '0.2.4';
    this.fetchOptions = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    };
    this.filters = {
        rank: {
            label: '排行榜',
            value: 'home',
            options: [
                { label: '网站首页', value: 'home' },
                { label: '本日排行', value: 'hits_day' },
                { label: '本周排行', value: 'hits_week' },
                { label: '本月排行', value: 'hits_month' },
                { label: '总排行', value: 'hits' },
                { label: '最近更新', value: 'update_time+desc' }
            ],
            type: filterInputs.FilterTypes.Picker
        },
        sort: {
            label: '分类',
            value: 'none',
            options: [
                { label: '无', value: 'none' },
                { label: '科幻', value: '71' },
                { label: '经典', value: '79' },
                { label: '奇幻', value: '75' },
                { label: '系统', value: '69' },
                { label: '武侠', value: '68' },
                { label: '乱伦', value: '65' },
                { label: '都市', value: '64' },
                { label: '乡村', value: '63' },
                { label: '同人', value: '73' },
                { label: '玄幻', value: '62' },
                { label: '校园', value: '61' },
                { label: '穿越', value: '70' },
                { label: '反差', value: '22' },
                { label: '凌辱', value: '46' },
                { label: '堕落', value: '18' },
                { label: '纯爱', value: '19' },
                { label: '伪娘', value: '52' },
                { label: '萝莉', value: '48' },
                { label: '熟女', value: '56' },
                { label: '正太', value: '50' },
                { label: '明星', value: '72' },
                { label: 'NTR', value: '54' },
                { label: '媚黑', value: '53' },
                { label: '调教', value: '58' },
                { label: '言情', value: '59' },
                { label: '百合', value: '47' },
                { label: '耽美', value: '82' },
                { label: '重口', value: '21' },
                { label: '其他', value: '57' }
            ],
            type: filterInputs.FilterTypes.Picker
        },
        searchKeyword: {
            label: '搜索内容',
            value: '',
            type: filterInputs.FilterTypes.TextInput
        },
        searchType: {
            label: '搜索分类',
            value: '_all',
            options: [
                { label: '关键词', value: '_all' },
                { label: '作者', value: 'author' },
                { label: '标签', value: 'tag' }
            ],
            type: filterInputs.FilterTypes.Picker
        },
        searchSort: {
            label: '搜索排序',
            value: 'relevance',
            options: [
                { label: '默认/相关度', value: 'relevance' },
                { label: '总字数', value: 'word_DESC' },
                { label: '创建时间', value: 'create_time_DESC' },
                { label: '更新时间', value: 'update_time_DESC' },
                { label: '点击量', value: 'hits_DESC' }
            ],
            type: filterInputs.FilterTypes.Picker
        }
    };
}

AliceSW.prototype.popularNovels = function(pageNo, options) {
    var filters = options.filters || { rank: { value: 'home' }, sort: { value: 'none' } };
    var url;
    var self = this;
    
    if (filters.searchKeyword && filters.searchKeyword.value) {
        var searchTerm = filters.searchKeyword.value;
        var searchType = filters.searchType ? filters.searchType.value : '_all';
        var searchSort = filters.searchSort ? filters.searchSort.value : 'relevance';
        url = this.site + '/search.html?q=' + encodeURIComponent(searchTerm) + '&f=' + searchType + '&sort=' + searchSort;
        if (pageNo > 1) {
            url += '&p=' + pageNo;
        }
        return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
            if (!body) throw new Error('无法获取搜索结果');
            var $ = cheerio.load(body);
            var novels = [];

            $('div.list-group-item').each(function(i, el) {
                var aTag = $(el).find('h5 a').first();
                if (!aTag.length) return;
                var novelPath = aTag.attr('href');
                if (!novelPath) return;
                
                var novelName = aTag.text().trim().replace(/^\d+\.\s*/, '');
                
                novels.push({
                    name: novelName,
                    cover: '',
                    path: novelPath.replace(self.site, '')
                });
            });
            return novels;
        });
    }
    
    var isHome = options.showLatestNovels || (filters.sort && filters.sort.value === 'none' && filters.rank && filters.rank.value === 'home');
    
    if (isHome) {
        url = this.site + '/';
        if (pageNo > 1) return Promise.resolve([]);
    } else if (filters.sort && filters.sort.value === 'none') {
        var rankVal = filters.rank ? filters.rank.value : 'home';
        if (rankVal === 'update_time+desc') {
            url = this.site + '/all/order/update_time+desc.html';
        } else {
            url = this.site + '/other/rank_hits/order/' + rankVal + '.html';
        }
        if (pageNo > 1) url += '?page=' + pageNo;
    } else {
        url = this.site + '/lists/' + filters.sort.value + '.html';
        if (pageNo > 1) url += '?page=' + pageNo;
    }

    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        if (!body) throw new Error('无法获取小说列表');
        var $ = cheerio.load(body);
        var novels = [];

        if (isHome) {
            $('div.class-img, div.itemg li, ul.itemg li').each(function(i, el) {
                var aTag = $(el).find('a[href^="/novel/"]').first();
                if (!aTag.length) return;
                var novelPath = aTag.attr('href');
                if (!novelPath) return;
                
                var novelName = $(el).find('img').attr('alt') || aTag.text().trim();
                var novelCover = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
                
                if (novelCover && novelCover.indexOf('//') === 0) {
                    novelCover = 'https:' + novelCover;
                } else if (novelCover && novelCover.indexOf('/') === 0) {
                    novelCover = self.site + novelCover;
                }
                
                novels.push({
                    name: novelName,
                    cover: novelCover || '',
                    path: novelPath.replace(self.site, '')
                });
            });
        } else {
            $('div.rec_rullist ul').each(function(i, el) {
                var aTag = $(el).find('li.two a').first();
                if (!aTag.length) return;
                var novelPath = aTag.attr('href');
                if (!novelPath) return;
                
                var novelName = aTag.text().trim();
                
                novels.push({
                    name: novelName,
                    cover: '',
                    path: novelPath.replace(self.site, '')
                });
            });
        }
        return novels;
    });
};

function fallbackChapters($, novel, siteUrl) {
    if (novel.chapters.length === 0) {
        $('div.book_newchap li a, div.info_ddg li a, .chapter-list a').each(function(i, el) {
            var chapterUrl = $(el).attr('href');
            var chapterName = $(el).text().trim();
            if (chapterUrl && chapterUrl.indexOf('/book/') !== -1) {
                novel.chapters.push({
                    name: chapterName,
                    path: chapterUrl.replace(siteUrl, '')
                });
            }
        });
    }
    return Promise.resolve(novel);
}

AliceSW.prototype.parseNovel = function(novelPath) {
    var url = this.site + novelPath;
    var self = this;
    return fetchAPI.fetchText(url, this.fetchOptions).then(function(body) {
        if (!body) throw new Error('无法获取小说详情');
        var $ = cheerio.load(body);
        
        var novel = {
            path: novelPath,
            chapters: [],
            name: $('div.novel_title, h1.book-name, h2').first().text().trim()
        };

        var novelCover = $('img.fengmian2, img.fengmian, div.pic img, div.cover > img').attr('data-src') || $('img.fengmian2, img.fengmian, div.pic img, div.cover > img').attr('src');
        if (novelCover && novelCover.indexOf('//') === 0) {
            novelCover = 'https:' + novelCover;
        } else if (novelCover && novelCover.indexOf('/') === 0) {
            novelCover = self.site + novelCover;
        }
        novel.cover = novelCover;
        
        novel.summary = $('.jianjie p, .book-intro, #bookIntro').text().trim();
        
        var infoText = $('.novel_info, .book-info').text();
        var authorMatch = infoText.match(/作\s*者：\s*(\S+)/);
        if (authorMatch) {
            novel.author = authorMatch[1].trim();
        } else {
            novel.author = $('.novel_info p').first().text().replace(/作\s*者：/, '').trim();
        }
        
        novel.status = infoText.indexOf('连载') !== -1 ? novelStatus.NovelStatus.Ongoing : novelStatus.NovelStatus.Completed;

        var idMatch = novelPath.match(/\/novel\/(\d+)\.html/);
        if (idMatch) {
            var novelId = idMatch[1];
            var allChaptersUrl = self.site + '/other/chapters/id/' + novelId + '.html';
            return fetchAPI.fetchText(allChaptersUrl, self.fetchOptions).then(function(chaptersBody) {
                var $c = cheerio.load(chaptersBody);
                $c('li a[href^="/book/"]').each(function(i, el) {
                    var chapterUrl = $c(el).attr('href');
                    var chapterName = $c(el).text().trim();
                    if (chapterUrl) {
                        novel.chapters.push({
                            name: chapterName,
                            path: chapterUrl.replace(self.site, '')
                        });
                    }
                });
                return fallbackChapters($, novel, self.site);
            }).catch(function(e) {
                return fallbackChapters($, novel, self.site);
            });
        }

        return fallbackChapters($, novel, self.site);
    });
};

AliceSW.prototype.parseChapter = function(chapterPath) {
    var chapterUrl = chapterPath;
    if (chapterUrl.indexOf('http') !== 0) {
        chapterUrl = this.site + chapterUrl;
    }
    return fetchAPI.fetchText(chapterUrl, this.fetchOptions).then(function(body) {
        var $ = cheerio.load(body);
        
        var content = [];
        $('#content p, #chaptercontent p, .read-content p').each(function(i, el) {
            var text = $(el).text().trim();
            if (text) {
                content.push('<p>' + text + '</p>');
            }
        });
        
        if (content.length > 0) {
            return content.join('\n');
        }
        return $('#content, #chaptercontent, .read-content').html() || '';
    });
};

AliceSW.prototype.searchNovels = function(searchTerm, pageNo) {
    var searchUrl = this.site + '/search.html?q=' + encodeURIComponent(searchTerm) + '&f=_all';
    if (pageNo > 1) {
        searchUrl += '&p=' + pageNo;
    }
    var self = this;
    return fetchAPI.fetchText(searchUrl, this.fetchOptions).then(function(body) {
        if (!body) throw new Error('无法获取搜索结果');
        var $ = cheerio.load(body);
        var novels = [];

        $('div.list-group-item').each(function(i, el) {
            var aTag = $(el).find('h5 a').first();
            if (!aTag.length) return;
            var novelPath = aTag.attr('href');
            if (!novelPath) return;
            
            var novelName = aTag.text().trim().replace(/^\d+\.\s*/, '');
            
            novels.push({
                name: novelName,
                cover: '',
                path: novelPath.replace(self.site, '')
            });
        });
        return novels;
    });
};

exports.default = new AliceSW();
