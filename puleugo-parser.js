"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var fast_xml_parser_1 = require("fast-xml-parser");
var fs = require("fs");
var path = require("path");
var url = 'https://puleugo.tistory.com/rss'; // RSS 피드 URL
function fetchAndParseXML() {
    return __awaiter(this, void 0, void 0, function () {
        var response, xmlData, options, parser, jsonData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    response = _a.sent();
                    xmlData = response.data;
                    options = {
                        ignoreAttributes: false,
                        attributeNameRaw: true,
                    };
                    parser = new fast_xml_parser_1.XMLParser(options);
                    jsonData = parser.parse(xmlData);
                    // 기존 파일 내용과 비교 후 모든 파일 재생성
                    return [4 /*yield*/, updateAllMarkdownFiles(jsonData)];
                case 2:
                    // 기존 파일 내용과 비교 후 모든 파일 재생성
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching or parsing XML:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function updateAllMarkdownFiles(jsonData) {
    return __awaiter(this, void 0, void 0, function () {
        var htmlToMd, outputDirectory, newMarkdownContents, items, i, item, category, title, pubDate, markdown, existingFilesContent, i, filePath, hasDifferences;
        return __generator(this, function (_a) {
            htmlToMd = require('html-to-md');
            outputDirectory = 'blog/puleugo/';
            // 디렉토리 생성
            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory, { recursive: true });
            }
            newMarkdownContents = [];
            // JSON에서 item 배열 추출
            if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
                items = Array.isArray(jsonData.rss.channel.item)
                    ? jsonData.rss.channel.item
                    : [jsonData.rss.channel.item];
                // 최신 항목부터 역순으로 처리하여 새로운 Markdown 콘텐츠 생성
                for (i = items.length - 1; i >= 0; i--) {
                    item = items[i];
                    category = item.category;
                    if (item.description && category !== '도서 리뷰') { // '도서 리뷰' 카테고리 제외
                        title = item.title || 'No Title';
                        pubDate = item.pubDate;
                        markdown = createMarkdown(item.description, title, pubDate);
                        newMarkdownContents.push(markdown);
                    }
                }
            }
            existingFilesContent = [];
            for (i = 1;; i++) {
                filePath = "".concat(outputDirectory, "puleugo").concat(i, ".md");
                if (!fs.existsSync(filePath))
                    break;
                existingFilesContent.push(fs.readFileSync(filePath, 'utf-8'));
            }
            hasDifferences = checkForDifferences(existingFilesContent, newMarkdownContents);
            // 차이가 있을 경우 모든 파일을 1번부터 재생성
            if (hasDifferences) {
                console.log('Changes detected. Regenerating all Markdown files...');
                regenerateMarkdownFiles(newMarkdownContents, outputDirectory);
            }
            else {
                console.log('No changes detected. No files were updated.');
            }
            return [2 /*return*/];
        });
    });
}
// 변경 사항 비교
function checkForDifferences(existingContents, newContents) {
    if (existingContents.length !== newContents.length) {
        return true; // 파일 개수가 다르면 변경됨
    }
    // 파일 내용 비교
    for (var i = 0; i < existingContents.length; i++) {
        if (existingContents[i] !== newContents[i]) {
            return true; // 내용이 다르면 변경됨
        }
    }
    return false; // 모든 파일이 동일하면 변경 없음
}
// 모든 Markdown 파일 재생성
function regenerateMarkdownFiles(contents, directory) {
    // 기존 파일 삭제
    fs.readdirSync(directory).forEach(function (file) {
        if (file.startsWith('puleugo') && file.endsWith('.md')) {
            fs.unlinkSync(path.join(directory, file));
        }
    });
    // 새로운 파일 생성
    contents.forEach(function (content, index) {
        var filePath = "".concat(directory, "puleugo").concat(index + 1, ".md");
        saveMarkdownFile(content, filePath);
    });
}
// Markdown 콘텐츠 생성
function createMarkdown(description, title, pubDate) {
    var htmlToMd = require('html-to-md');
    var markdownDescription = htmlToMd(description);
    // 프로필 내용 추가
    var profileContent = "---\nauthors: puleugo\ndate: ".concat(pubDate, "\n---\n\n");
    return "".concat(profileContent, "# ").concat(title, "\n\n").concat(markdownDescription, "\n\n");
}
// Markdown 파일 저장
function saveMarkdownFile(markdown, filePath) {
    fs.writeFileSync(filePath, markdown);
    console.log("Markdown file created: ".concat(filePath));
}
// XML 데이터 가져와서 Markdown 파일로 변환
fetchAndParseXML();
