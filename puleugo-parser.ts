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

        // JSON 데이터를 Markdown 파일로 변환
        const hasDuplicate = await saveDescriptionsAsMarkdown(jsonData);

        if (hasDuplicate) {
            console.log('No new files created: Duplicate content found.');
        }
    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
    }
}

async function saveDescriptionsAsMarkdown(jsonData: any): Promise<boolean> {
    const htmlToMd = require('html-to-md'); // require로 가져오기
    let fileIndex = 1;

    // JSON에서 item 배열 추출 및 최신 항목부터 역순으로 처리
    if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
        const items = Array.isArray(jsonData.rss.channel.item) ? jsonData.rss.channel.item : [jsonData.rss.channel.item];
        const existingFilesContent: string[] = [];

        // 기존 파일 내용 수집
        for (let i = 1; ; i++) {
            const filePath = `blog/puleugo/puleugo${i}.md`;
            if (!fs.existsSync(filePath)) break; // 더 이상 파일이 없으면 중단
            existingFilesContent.push(fs.readFileSync(filePath, 'utf-8'));
        }

        // 최신 항목부터 처리
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const category = item.category; // 카테고리 추출
            if (item.description && category !== '도서 리뷰') { // '도서 리뷰' 카테고리 제외
                const title = item.title || 'No Title'; // 제목 추출
                const pubDate = item.pubDate; // pubDate 추출
                const markdown = createMarkdown(item.description, title, pubDate);
                const outputPath = `blog/puleugo/puleugo${fileIndex}.md`; // 파일 이름 생성

                // 기존 파일 내용과 비교
                if (!existingFilesContent.includes(markdown)) {
                    saveMarkdownFile(markdown, outputPath);
                    fileIndex++; // 파일 인덱스 증가
                } else {
                    console.log(`Duplicate content found, not creating file: ${outputPath}`);
                    return true; // 중복 내용이 발견되었으므로 true 반환
                }
            }
        }
    }
    return false; // 중복이 없었으므로 false 반환
}

function createMarkdown(description: string, title: string, pubDate: string): string {
    const htmlToMd = require('html-to-md'); // require로 가져오기
    let markdownDescription = htmlToMd(description); // HTML을 Markdown으로 변환

    // 프로필 내용 추가
    const profileContent = `---
authors: puleugo
date: ${pubDate}
---\n\n`;

    // Markdown 형식 생성
    return `${profileContent}# ${title}\n\n${markdownDescription}\n\n`;
}

function saveMarkdownFile(markdown: string, filePath: string): void {
    fs.writeFileSync(filePath, markdown);
    console.log(`Markdown file created: ${filePath}`);
}

fetchAndParseXML();
