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
var url = 'https://puleugo.tistory.com/rss'; // RSS 피드 URL
function fetchAndParseXML() {
    return __awaiter(this, void 0, void 0, function () {
        var response, xmlData, options, parser, jsonData, hasDuplicate, error_1;
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
                    return [4 /*yield*/, saveDescriptionsAsMarkdown(jsonData)];
                case 2:
                    hasDuplicate = _a.sent();
                    if (hasDuplicate) {
                        console.log('No new files created: Duplicate content found.');
                    }
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
function saveDescriptionsAsMarkdown(jsonData) {
    return __awaiter(this, void 0, void 0, function () {
        var htmlToMd, fileIndex, items, existingFilesContent, i, filePath, i, item, category, title, pubDate, markdown, outputPath;
        return __generator(this, function (_a) {
            htmlToMd = require('html-to-md');
            fileIndex = 1;
            // JSON에서 item 배열 추출 및 최신 항목부터 역순으로 처리
            if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
                items = Array.isArray(jsonData.rss.channel.item) ? jsonData.rss.channel.item : [jsonData.rss.channel.item];
                existingFilesContent = [];
                // 기존 파일 내용 수집
                for (i = 1;; i++) {
                    filePath = "blog/puleugo/puleugo".concat(i, ".md");
                    if (!fs.existsSync(filePath))
                        break; // 더 이상 파일이 없으면 중단
                    existingFilesContent.push(fs.readFileSync(filePath, 'utf-8'));
                }
                // 최신 항목부터 처리
                for (i = items.length - 1; i >= 0; i--) {
                    item = items[i];
                    category = item.category;
                    if (item.description && category !== '도서 리뷰') { // '도서 리뷰' 카테고리 제외
                        title = item.title || 'No Title';
                        pubDate = item.pubDate;
                        markdown = createMarkdown(item.description, title, pubDate);
                        outputPath = "blog/puleugo/puleugo".concat(fileIndex, ".md");
                        // 기존 파일 내용과 비교
                        if (!existingFilesContent.includes(markdown)) {
                            saveMarkdownFile(markdown, outputPath);
                            fileIndex++; // 파일 인덱스 증가
                        }
                        else {
                            console.log("Duplicate content found, not creating file: ".concat(outputPath));
                            return [2 /*return*/, true]; // 중복 내용이 발견되었으므로 true 반환
                        }
                    }
                }
            }
            return [2 /*return*/, false]; // 중복이 없었으므로 false 반환
        });
    });
}
function createMarkdown(description, title, pubDate) {
    var htmlToMd = require('html-to-md'); // require로 가져오기
    var markdownDescription = htmlToMd(description); // HTML을 Markdown으로 변환
    // 프로필 내용 추가
    var profileContent = "---\nauthors: puleugo\ndate: ".concat(pubDate, "\n---\n\n");
    // Markdown 형식 생성
    return "".concat(profileContent, "# ").concat(title, "\n\n").concat(markdownDescription, "\n\n");
}
function saveMarkdownFile(markdown, filePath) {
    fs.writeFileSync(filePath, markdown);
    console.log("Markdown file created: ".concat(filePath));
}
fetchAndParseXML();
