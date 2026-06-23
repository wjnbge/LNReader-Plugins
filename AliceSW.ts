import { load as parseHTML } from 'cheerio';
import { fetchText } from '@libs/fetch';
import { FilterTypes, Filters } from '@libs/filterInputs';
import { Plugin } from '@/types/plugin';
import { NovelStatus } from '@libs/novelStatus';

class AliceSW implements Plugin.PluginBase {
  private fetchOptions = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Referer': 'https://www.alicesw.com/',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
    },
  };

  id = 'alicesw';
  name = '爱丽丝书屋';
  icon = 'src/cn/alicesw/icon.png';
  site = 'https://www.alicesw.com';
  version = '0.1.0';

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    let url: string;
    
    // pagination seems to be standard, e.g., index_2.html or /page/2.html, but let's assume it doesn't need pagination for rank list or we use a basic form.
    // For rank pages, there might not be easy pagination, but let's try appending page number if > 1. 
    // Actually, if pageNo > 1 we might just return empty if we don't know the format.
    if (pageNo > 1) {
       // Just basic support for page 1 for ranks if we don't know the page format,
       // Or for category: /lists/71_2.html or similar. We'll stick to page 1 for now if we can't be sure.
       return [];
    }

    if (showLatestNovels) {
      url = `${this.site}/all/order/update_time+desc.html`;
    } else if (filters.sort.value === 'none') {
      url = `${this.site}/other/rank_hits/order/${filters.rank.value}.html`;
    } else {
      url = `${this.site}/lists/${filters.sort.value}.html`;
    }

    const body = await fetchText(url, this.fetchOptions);
    if (body === '') throw Error('无法获取小说列表，请检查网络');

    const loadedCheerio = parseHTML(body);
    const novels: Plugin.NovelItem[] = [];

    // The novel list items can be in .class-img or .itemg li or .index_ddg
    loadedCheerio('div.class-img, div.itemg li, ul.itemg li').each((i, el) => {
      const aTag = loadedCheerio(el).find('a[href^="/novel/"]').first();
      if (!aTag.length) return;
      
      const novelPath = aTag.attr('href');
      if (!novelPath) return;

      const novelName = loadedCheerio(el).find('img').attr('alt') || aTag.text().trim();
      let novelCover = loadedCheerio(el).find('img').attr('data-src') || loadedCheerio(el).find('img').attr('src');
      
      if (novelCover && novelCover.startsWith('//')) {
          novelCover = 'https:' + novelCover;
      } else if (novelCover && novelCover.startsWith('/')) {
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

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const url = this.site + novelPath;

    const body = await fetchText(url, this.fetchOptions);
    if (body === '') throw Error('无法获取小说内容，请检查网络');

    const loadedCheerio = parseHTML(body);

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      chapters: [],
      name: loadedCheerio('div.novel_title, h1.book-name, h2').first().text().trim(),
    };

    let novelCover = loadedCheerio('img.fengmian2, img.fengmian, div.pic img, div.cover > img').attr('data-src') || loadedCheerio('img.fengmian2, img.fengmian, div.pic img, div.cover > img').attr('src');
    if (novelCover && novelCover.startsWith('//')) {
        novelCover = 'https:' + novelCover;
    } else if (novelCover && novelCover.startsWith('/')) {
        novelCover = this.site + novelCover;
    }
    novel.cover = novelCover;

    novel.summary = loadedCheerio('.jianjie p, .book-intro, #bookIntro').text().trim();
    
    const infoText = loadedCheerio('.novel_info, .book-info').text();
    const authorMatch = infoText.match(/作\s*者：\s*(\S+)/);
    if (authorMatch) {
        novel.author = authorMatch[1].trim();
    } else {
        novel.author = loadedCheerio('.novel_info p').first().text().replace(/作\s*者：/, '').trim();
    }

    novel.status = infoText.includes('连载') ? NovelStatus.Ongoing : NovelStatus.Completed;

    // Get the ID from novelPath to fetch full chapters
    // novelPath is like /novel/47487.html
    const idMatch = novelPath.match(/\/novel\/(\d+)\.html/);
    if (idMatch) {
        const novelId = idMatch[1];
        const allChaptersUrl = `${this.site}/other/chapters/id/${novelId}.html`;
        try {
            const chaptersBody = await fetchText(allChaptersUrl, this.fetchOptions);
            const chaptersCheerio = parseHTML(chaptersBody);
            
            chaptersCheerio('li a[href^="/book/"]').each((i, el) => {
                const chapterUrl = chaptersCheerio(el).attr('href');
                const chapterName = chaptersCheerio(el).text().trim();
                if (chapterUrl) {
                    novel.chapters.push({
                        name: chapterName,
                        path: chapterUrl.replace(this.site, ''),
                    });
                }
            });
        } catch (e) {
            console.error('Failed to fetch full chapters list, falling back to current page chapters', e);
        }
    }

    // Fallback if no chapters fetched
    if (novel.chapters.length === 0) {
        loadedCheerio('div.book_newchap li a, div.info_ddg li a, .chapter-list a').each((i, el) => {
            const chapterUrl = loadedCheerio(el).attr('href');
            const chapterName = loadedCheerio(el).text().trim();
            if (chapterUrl && chapterUrl.includes('/book/')) {
                novel.chapters.push({
                    name: chapterName,
                    path: chapterUrl.replace(this.site, ''),
                });
            }
        });
    }

    // Remove duplicates
    novel.chapters = novel.chapters.filter((chapter, index, self) =>
        index === self.findIndex(c => c.path === chapter.path)
    );

    return novel;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const chapterUrl = new URL(chapterPath, this.site).toString();
    const body = await fetchText(chapterUrl, this.fetchOptions);

    const loadedCheerio = parseHTML(body);

    const chapterText = loadedCheerio('#content p, #chaptercontent p, .read-content p')
      .map((i, el) => loadedCheerio(el).text().trim())
      .get()
      .filter((line: string) => line !== '')
      .map((line: string) => `<p>${line}</p>`)
      .join('\n');

    return chapterText || loadedCheerio('#content, #chaptercontent, .read-content').html() || '';
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    if (pageNo > 1) return [];

    const searchUrl = `${this.site}/search.html?q=${encodeURIComponent(searchTerm)}&f=_all`;
    
    const body = await fetchText(searchUrl, this.fetchOptions);
    if (body === '') throw Error('无法获取搜索结果，请检查网络');

    const loadedCheerio = parseHTML(body);

    const novels: Plugin.NovelItem[] = [];

    loadedCheerio('div.class-img, div.itemg li, ul.itemg li').each((i, el) => {
      const aTag = loadedCheerio(el).find('a[href^="/novel/"]').first();
      if (!aTag.length) return;

      const novelPath = aTag.attr('href');
      if (!novelPath) return;

      const novelName = loadedCheerio(el).find('img').attr('alt') || aTag.text().trim();
      let novelCover = loadedCheerio(el).find('img').attr('data-src') || loadedCheerio(el).find('img').attr('src');
      
      if (novelCover && novelCover.startsWith('//')) {
          novelCover = 'https:' + novelCover;
      } else if (novelCover && novelCover.startsWith('/')) {
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

  filters = {
    rank: {
      label: '排行榜',
      value: 'hits_day',
      options: [
        { label: '本日排行', value: 'hits_day' },
        { label: '本周排行', value: 'hits_week' },
        { label: '本月排行', value: 'hits_month' },
        { label: '总排行', value: 'hits' },
      ],
      type: FilterTypes.Picker,
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
        { label: '其他', value: '57' },
      ],
      type: FilterTypes.Picker,
    },
  } satisfies Filters;
}

export default new AliceSW();
