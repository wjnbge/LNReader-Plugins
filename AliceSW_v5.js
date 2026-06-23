const cheerio = require("cheerio");
const fetchAPI = require("@libs/fetch");
const filterInputs = require("@libs/filterInputs");
const novelStatus = require("@libs/novelStatus");

class AliceSW {
    constructor() {
        this.id = 'alicesw';
        this.name = '爱丽丝书屋';
        this.icon = 'src/cn/alicesw/icon.png';
        this.site = 'https://www.alicesw.com';
        this.version = '0.1.0';
        this.fetchOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        };
        this.filters = {
            rank: {
                label: '排行榜',
                value: 'hits_day',
                options: [
                    { label: '本日排行', value: 'hits_day' },
                    { label: '本周排行', value: 'hits_week' },
                    { label: '本月排行', value: 'hits_month' },
                    { label: '总排行', value: 'hits' },
                ],
                type: filterInputs.FilterTypes.Picker,
            },
            sort: {
                label: '分类',
                value: 'none',
                options: [
                    { label: '无', value: 'none' },
                    { label: '科幻', value: '71' },
                    { label: '经典', value: '79' },
                    { label: '其他', value: '57' },
                ],
                type: filterInputs.FilterTypes.Picker,
            },
        };
    }

    async popularNovels(pageNo, options) {
        if (pageNo > 1) return [];
        const filters = options.filters || { rank: { value: 'hits_day' }, sort: { value: 'none' } };
        let url;
        if (options.showLatestNovels) {
            url = this.site + '/all/order/update_time+desc.html';
        } else if (filters.sort && filters.sort.value === 'none') {
            url = this.site + '/other/rank_hits/order/' + (filters.rank ? filters.rank.value : 'hits_day') + '.html';
        } else {
            url = this.site + '/lists/' + filters.sort.value + '.html';
        }

        const body = await fetchAPI.fetchText(url, this.fetchOptions);
        if (!body) throw new Error('无法获取小说列表');
        const $ = cheerio.load(body);
        const novels = [];

        $('div.class-img, div.itemg li, ul.itemg li').each((i, el) => {
            const aTag = $(el).find('a[href^="/novel/"]').first();
            if (!aTag.length) return;
            const novelPath = aTag.attr('href');
            if (!novelPath) return;
            
            const novelName = $(el).find('img').attr('alt') || aTag.text().trim();
            let novelCover = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            
            if (novelCover && novelCover.indexOf('//') === 0) {
                novelCover = 'https:' + novelCover;
            } else if (novelCover && novelCover.indexOf('/') === 0) {
                novelCover = this.site + novelCover;
            }
            
            novels.push({
                name: novelName,
                cover: novelCover,
                path: novelPath.replace(this.site, ''),
            });
        });
        return novels;
    }

    async parseNovel(novelPath) {
        const url = this.site + novelPath;
        const body = await fetchAPI.fetchText(url, this.fetchOptions);
        if (!body) throw new Error('无法获取小说详情');
        const $ = cheerio.load(body);
        
        const novel = {
            path: novelPath,
            chapters: [],
            name: $('div.novel_title, h1.book-name, h2').first().text().trim(),
        };

        let novelCover = $('img.fengmian2, img.fengmian, div.pic img, div.cover > img').attr('data-src') || $('img.fengmian2, img.fengmian, div.pic img, div.cover > img').attr('src');
        if (novelCover && novelCover.indexOf('//') === 0) {
            novelCover = 'https:' + novelCover;
        } else if (novelCover && novelCover.indexOf('/') === 0) {
            novelCover = this.site + novelCover;
        }
        novel.cover = novelCover;
        
        novel.summary = $('.jianjie p, .book-intro, #bookIntro').text().trim();
        
        const infoText = $('.novel_info, .book-info').text();
        const authorMatch = infoText.match(/作\s*者：\s*(\S+)/);
        if (authorMatch) {
            novel.author = authorMatch[1].trim();
        } else {
            novel.author = $('.novel_info p').first().text().replace(/作\s*者：/, '').trim();
        }
        
        novel.status = infoText.indexOf('连载') !== -1 ? novelStatus.NovelStatus.Ongoing : novelStatus.NovelStatus.Completed;

        const idMatch = novelPath.match(/\/novel\/(\d+)\.html/);
        if (idMatch) {
            const novelId = idMatch[1];
            const allChaptersUrl = this.site + '/other/chapters/id/' + novelId + '.html';
            try {
                const chaptersBody = await fetchAPI.fetchText(allChaptersUrl, this.fetchOptions);
                const $c = cheerio.load(chaptersBody);
                $c('li a[href^="/book/"]').each((i, el) => {
                    const chapterUrl = $c(el).attr('href');
                    const chapterName = $c(el).text().trim();
                    if (chapterUrl) {
                        novel.chapters.push({
                            name: chapterName,
                            path: chapterUrl.replace(this.site, ''),
                        });
                    }
                });
            } catch (e) {}
        }

        if (novel.chapters.length === 0) {
            $('div.book_newchap li a, div.info_ddg li a, .chapter-list a').each((i, el) => {
                const chapterUrl = $(el).attr('href');
                const chapterName = $(el).text().trim();
                if (chapterUrl && chapterUrl.indexOf('/book/') !== -1) {
                    novel.chapters.push({
                        name: chapterName,
                        path: chapterUrl.replace(this.site, ''),
                    });
                }
            });
        }
        
        return novel;
    }

    async parseChapter(chapterPath) {
        let chapterUrl = chapterPath;
        if (chapterUrl.indexOf('http') !== 0) {
            chapterUrl = this.site + chapterUrl;
        }
        const body = await fetchAPI.fetchText(chapterUrl, this.fetchOptions);
        const $ = cheerio.load(body);
        
        const content = [];
        $('#content p, #chaptercontent p, .read-content p').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                content.push('<p>' + text + '</p>');
            }
        });
        
        if (content.length > 0) {
            return content.join('\n');
        }
        return $('#content, #chaptercontent, .read-content').html() || '';
    }

    async searchNovels(searchTerm, pageNo) {
        if (pageNo > 1) return [];
        const searchUrl = this.site + '/search.html?q=' + encodeURIComponent(searchTerm) + '&f=_all';
        const body = await fetchAPI.fetchText(searchUrl, this.fetchOptions);
        if (!body) throw new Error('无法获取搜索结果');
        const $ = cheerio.load(body);
        const novels = [];

        $('div.class-img, div.itemg li, ul.itemg li').each((i, el) => {
            const aTag = $(el).find('a[href^="/novel/"]').first();
            if (!aTag.length) return;
            const novelPath = aTag.attr('href');
            if (!novelPath) return;
            
            const novelName = $(el).find('img').attr('alt') || aTag.text().trim();
            let novelCover = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            
            if (novelCover && novelCover.indexOf('//') === 0) {
                novelCover = 'https:' + novelCover;
            } else if (novelCover && novelCover.indexOf('/') === 0) {
                novelCover = this.site + novelCover;
            }
            
            novels.push({
                name: novelName,
                cover: novelCover,
                path: novelPath.replace(this.site, ''),
            });
        });
        return novels;
    }
}

exports.default = new AliceSW();
