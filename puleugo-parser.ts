import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';

const url = 'https://puleugo.tistory.com/rss'; // RSS 피드 URL
const MAX_FILES = 10; // 최대 파일 개수

async function fetchAndParseXML(): Promise<void> {
    try {
        // XML 데이터 가져오기
        const response = await axios.get(url);
        const xmlData = response.data;

        // XML 파서 설정
        const options = {
            ignoreAttributes: false,
            attributeNameRaw: true,
        };

        // XML 파싱
        const parser = new XMLParser(options);
        const jsonData = parser.parse(xmlData);

        // 최신 10개 포스트만 처리
        await updateLatest10Posts(jsonData);
    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
    }
}

async function updateLatest10Posts(jsonData: any): Promise<void> {
    const outputDirectory = 'blog/puleugo/';
    
    // 디렉토리 생성
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // JSON에서 item 배열 추출 및 최신 10개만 가져오기
    if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
        const items = Array.isArray(jsonData.rss.channel.item)
            ? jsonData.rss.channel.item
            : [jsonData.rss.channel.item];

        // '도서 리뷰' 카테고리 제외하고 최신 10개 추출
        const validItems = items.filter(item => {
            const category = Array.isArray(item.category) ? item.category.join(', ') : (item.category || '');
            return item.description && category !== '도서 리뷰';
        }).slice(0, MAX_FILES); // 최신 10개만

        if (validItems.length === 0) {
            console.log('No valid posts found.');
            return;
        }

        // 최신 포스트의 마크다운 생성
        const latestPost = validItems[0];
        const latestMarkdown = createMarkdown(latestPost.description, latestPost.title || 'No Title', latestPost.pubDate);

        // 기존 1번 파일과 비교
        const firstFilePath = `${outputDirectory}puleugo1.md`;
        let hasNewPost = true;
        
        if (fs.existsSync(firstFilePath)) {
            const existingContent = fs.readFileSync(firstFilePath, 'utf-8');
            hasNewPost = existingContent !== latestMarkdown;
        }

        if (hasNewPost) {
            console.log('New post detected. Shifting files and updating...');
            shiftFilesAndUpdate(validItems, outputDirectory);
        } else {
            console.log('No new posts. Files remain unchanged.');
        }
    }
}

// 파일 이동 및 업데이트
function shiftFilesAndUpdate(items: any[], directory: string): void {
    // 기존 파일들을 뒤로 이동 (10 → 삭제, 9 → 10, 8 → 9, ..., 1 → 2)
    for (let i = MAX_FILES; i >= 1; i--) {
        const currentPath = `${directory}puleugo${i}.md`;
        const nextPath = `${directory}puleugo${i + 1}.md`;
        
        if (fs.existsSync(currentPath)) {
            if (i === MAX_FILES) {
                // 10번 파일은 삭제
                fs.unlinkSync(currentPath);
                console.log(`Deleted: puleugo${i}.md`);
            } else {
                // 파일을 다음 번호로 이동
                fs.renameSync(currentPath, nextPath);
                console.log(`Moved: puleugo${i}.md → puleugo${i + 1}.md`);
            }
        }
    }

    // 새로운 최신 포스트를 1번 파일로 저장
    const latestItem = items[0];
    const latestMarkdown = createMarkdown(latestItem.description, latestItem.title || 'No Title', latestItem.pubDate);
    const newFilePath = `${directory}puleugo1.md`;
    saveMarkdownFile(latestMarkdown, newFilePath);

    // 빈 자리가 있다면 나머지 포스트들로 채우기 (2번 파일이 없는 경우 등)
    for (let i = 2; i <= MAX_FILES && i <= items.length; i++) {
        const filePath = `${directory}puleugo${i}.md`;
        if (!fs.existsSync(filePath)) {
            const item = items[i - 1];
            const markdown = createMarkdown(item.description, item.title || 'No Title', item.pubDate);
            saveMarkdownFile(markdown, filePath);
        }
    }
}

// Markdown 콘텐츠 생성
function createMarkdown(description: string, title: string, pubDate: string): string {
    const TurndownService = require('turndown');
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '*',
        codeBlockStyle: 'fenced',
        fence: '```'
    });

    // HTML에서 불필요한 요소들 제거
    let cleanHtml = description
        .replace(/<div[^>]*gtx-trans[^>]*>.*?<\/div>/gi, '') // Google Translate 요소 제거
        .replace(/<div[^>]*class="[^"]*gtx-trans[^"]*"[^>]*>.*?<\/div>/gi, '') // GTX 관련 div 제거
        .replace(/style="[^"]*"/gi, '') // 모든 style 속성 제거
        .replace(/data-ke-[^=]*="[^"]*"/gi, '') // Tistory 특정 속성 제거
        .replace(/contenteditable="[^"]*"/gi, '') // contenteditable 속성 제거
        .replace(/onerror="[^"]*"/gi, '') // onerror 속성 제거
        .replace(/loading="lazy"/gi, '') // loading 속성 제거
        .replace(/srcset="[^"]*"/gi, '') // srcset 속성 제거 (srcset은 복잡하므로 제거)
        .replace(/<figure[^>]*data-ke-type="opengraph"[^>]*>.*?<\/figure>/gis, '') // OpenGraph figure 제거
        .replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/gi, '') // 빈 paragraph 제거
        .trim();

    const markdownDescription = turndownService.turndown(cleanHtml);

    // 프로필 내용 추가
    const profileContent = `---
authors: puleugo
date: ${pubDate}
---\n\n`;

    return `${profileContent}# ${title}\n\n${markdownDescription}\n\n`;
}

// Markdown 파일 저장
function saveMarkdownFile(markdown: string, filePath: string): void {
    fs.writeFileSync(filePath, markdown);
    console.log(`Markdown file created: ${filePath}`);
}

// XML 데이터 가져와서 Markdown 파일로 변환
fetchAndParseXML();
