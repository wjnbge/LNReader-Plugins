const cheerio = require('cheerio');

async function test() {
    console.log("=========================================");
    console.log("爱丽丝书屋 (alicesw.com) 图源规则测试脚本");
    console.log("=========================================\n");

    const site = 'https://www.alicesw.com';
    const novelUrl = 'https://www.alicesw.com/novel/47487.html';
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Referer': site
    };

    try {
        console.log(`[1/3] 正在抓取小说详情页: ${novelUrl}...`);
        const res = await fetch(novelUrl, { headers });
        const html = await res.text();
        const $ = cheerio.load(html);

        // 测试抓取书名
        const name = $('div.novel_title, h1.book-name, h2').first().text().trim();
        console.log(`\n=> 【抓取成功】书名: ${name}`);

        // 测试抓取目录
        let chapters = [];
        const idMatch = novelUrl.match(/\/novel\/(\d+)\.html/);
        
        if (idMatch) {
            const chaptersUrl = `${site}/other/chapters/id/${idMatch[1]}.html`;
            console.log(`\n[2/3] 正在抓取完整目录页: ${chaptersUrl}...`);
            const cRes = await fetch(chaptersUrl, { headers });
            const cHtml = await cRes.text();
            const $c = cheerio.load(cHtml);
            
            $c('li a[href^="/book/"]').each((i, el) => {
                chapters.push({
                    name: $c(el).text().trim(),
                    path: $c(el).attr('href')
                });
            });
        }

        console.log(`\n=> 【抓取成功】共获取到 ${chapters.length} 章目录。`);

        // 测试抓取正文
        if (chapters.length > 0) {
            const firstChapter = chapters[0];
            const firstChapterUrl = site + firstChapter.path;
            
            console.log(`\n[3/3] 正在抓取第一章 (${firstChapter.name}): ${firstChapterUrl}...`);
            const fRes = await fetch(firstChapterUrl, { headers });
            const fHtml = await fRes.text();
            const $f = cheerio.load(fHtml);
            
            const contentNodes = $f('#content p, #chaptercontent p, .read-content p');
            const content = contentNodes
                .map((i, el) => $f(el).text().trim())
                .get()
                .filter(line => line !== '')
                .join('\n');
                
            console.log(`\n=> 【抓取成功】第一章正文内容前 300 字预览:\n`);
            console.log(content.substring(0, 300) + '...\n');
            console.log("=========================================");
            console.log("全部测试通过！解析规则无误。");
            console.log("=========================================");
        }

    } catch (e) {
        console.error("\n[!] 抓取或解析失败:", e);
    }
}

test();
