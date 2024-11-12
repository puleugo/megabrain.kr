import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';

const url = 'https://puleugo.tistory.com/rss'; // RSS 피드 URL

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

        // 기존 파일 내용과 비교 후 모든 파일 재생성
        await updateAllMarkdownFiles(jsonData);
    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
    }
}

async function updateAllMarkdownFiles(jsonData: any): Promise<void> {
    const htmlToMd = require('html-to-md');
    const outputDirectory = 'blog/puleugo/';
    
    // 디렉토리 생성
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const newMarkdownContents: string[] = [];

    // JSON에서 item 배열 추출
    if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
        const items = Array.isArray(jsonData.rss.channel.item)
            ? jsonData.rss.channel.item
            : [jsonData.rss.channel.item];

        // 최신 항목부터 역순으로 처리하여 새로운 Markdown 콘텐츠 생성
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const category = item.category;
            if (item.description && category !== '도서 리뷰') { // '도서 리뷰' 카테고리 제외
                const title = item.title || 'No Title';
                const pubDate = item.pubDate;
                const markdown = createMarkdown(item.description, title, pubDate);
                newMarkdownContents.push(markdown);
            }
        }
    }

    // 기존 파일 내용 수집
    const existingFilesContent: string[] = [];
    for (let i = 1; ; i++) {
        const filePath = `${outputDirectory}puleugo${i}.md`;
        if (!fs.existsSync(filePath)) break;
        existingFilesContent.push(fs.readFileSync(filePath, 'utf-8'));
    }

    // 기존 파일 내용과 새로 생성된 내용 비교
    const hasDifferences = checkForDifferences(existingFilesContent, newMarkdownContents);

    // 차이가 있을 경우 모든 파일을 1번부터 재생성
    if (hasDifferences) {
        console.log('Changes detected. Regenerating all Markdown files...');
        regenerateMarkdownFiles(newMarkdownContents, outputDirectory);
    } else {
        console.log('No changes detected. No files were updated.');
    }
}

// 변경 사항 비교
function checkForDifferences(existingContents: string[], newContents: string[]): boolean {
    if (existingContents.length !== newContents.length) {
        return true; // 파일 개수가 다르면 변경됨
    }

    // 파일 내용 비교
    for (let i = 0; i < existingContents.length; i++) {
        if (existingContents[i] !== newContents[i]) {
            return true; // 내용이 다르면 변경됨
        }
    }
    return false; // 모든 파일이 동일하면 변경 없음
}

// 모든 Markdown 파일 재생성
function regenerateMarkdownFiles(contents: string[], directory: string): void {
    // 기존 파일 삭제
    fs.readdirSync(directory).forEach((file) => {
        if (file.startsWith('puleugo') && file.endsWith('.md')) {
            fs.unlinkSync(path.join(directory, file));
        }
    });

    // 새로운 파일 생성
    contents.forEach((content, index) => {
        const filePath = `${directory}puleugo${index + 1}.md`;
        saveMarkdownFile(content, filePath);
    });
}

// Markdown 콘텐츠 생성
function createMarkdown(description: string, title: string, pubDate: string): string {
    const htmlToMd = require('html-to-md');
    const markdownDescription = htmlToMd(description);

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
