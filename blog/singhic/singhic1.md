---
authors: singhic
date: Mon, 30 Sep 2024 20:48:21 +0900
---

# Megabrain 동아리 블로그 탭 제작기

안녕하세요, Megabrain에서 백엔드 개발자로 활동하고 있는 Singhic입니다!

현재 보이는 블로그 탭이 어떻게 제작되었는지, 어떤 우여곡절끝에 만들어졌는지 알아보도록 하겠습니다.

글에있는 모든 코드는 [Github Repository](https://github.com/inje-megabrain/megabrain.kr)에서 볼 수 있습니다.

## 상상
현재 메가브레인 동아리 부원들의 각각의 블로그는 그저 회원 탭에서 한 명을 콕! 집어서 들어가야 블로그 하이퍼링크를 통해 볼 수 있게 되어있습니다.

![](./img/굳이.png)

여기서 한 번 더생각해 보면 굳이 이렇게 해야 하나? 그냥 블로그 탭에 자동으로 최신 글만 받아오게 만들 수 있지 않을까? 라는 상상에서 시작되었습니다.

## 구상
일단 기본적인 구상부터 시작했습니다. 블로그 탭을 만들려면

1. 사이드바 - 블로그 탭 만들기
2. 블로그 파싱해 오기
3. 가져온 것을 Markdown 파일로 변환하기
4. Github에 커밋올리기

간단히 이렇게 4개의 단계로 구상했습니다.

그럼 이를 바탕으로, 구체적으로게획을 세운 후 실행으로 증명해야 합니다.

## 구체적 계획 및 실행
1. 사이드바 - 블로그 탭 만들기

현재 이 사이트는 [Docusaurus](https://www.docusaurus.io) 라는 페이스북에서 개발한 오픈 소스 문서화 도구를 사용 중입니다.
또한, React를 기반으로 만들어져있어 docusaurus.config.ts 라는 파일 안에서 쉽게 탭을 만들수있었습니다.

2. 블로그 파싱해 오기

블로그에 있는 글들을 자동으로 가져와야 합니다. 이를 손수 맛있게 하면 좋겠지만 제가 갈려 나가는지라.....
그래서 [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser)패키지를 이용하여 파싱하는 Typescript  파일을 생성하였습니다.
또한 같은 문서가 있을 때 자동으로 예외 처리를할 수 있게 try, catch 문으로 작성하였습니다.
```
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

        if (hasDuplicate) {
            console.log('No new files created: Duplicate content found.');
        }
    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
    }
}
```

3. 가져온 것을 Markdown 파일로 변환하기

2단계에서 가져온 것을 토대로 이제 파일을 만들어야 합니다.
Docusaurus에서는 현재 Markdown 파일로 글을 생성, 작성 및 수정하게 되어있습니다.
그럼 이 가져온 글을 .md 파일로 만들어내야 하는데,, 이를 또 어떻게 해야 하나 찾아보는 중!

이게 또 패키지가 있네??? 

![](./img/심봤다.jpg)

사실 많은 패키지중에서 [html-to-md](https://www.npmjs.com/package/html-to-md)를 선택한 이유는

![](./img/바로%20너.jpg)

그냥 다른 방법들과 비교했을때 가장 변환된 결과값이 가장 정확하고, 에러없고, 누가봐도 가독성있게 짤수있었기 떄문!
```
async function saveDescriptionsAsMarkdown(jsonData: any): Promise<boolean> {
    const htmlToMd = require('html-to-md'); // require로 가져오기
    let fileIndex = 1;

    // JSON에서 item 배열 추출 및 최신 항목부터 역순으로 처리
    if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
        const items = Array.isArray(jsonData.rss.channel.item) ? jsonData.rss.channel.item : [jsonData.rss.channel.item];
        const existingFilesContent: string[] = [];

        // 기존 파일 내용 수집
        for (let i = 1; ; i++) {
            const filePath = `blog/authors_name/authors_name${i}.md`;
            if (!fs.existsSync(filePath)) break; // 더 이상 파일이 없으면 중단
            existingFilesContent.push(fs.readFileSync(filePath, 'utf-8'));
        }

        // 최신 항목부터 처리
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const title = item.title || 'No Title'; // 제목 추출
            const pubDate = item.pubDate; // pubDate 추출
            const markdown = createMarkdown(item.description, title, pubDate);
            const outputPath = `blog/authors_name/authors_name${fileIndex}.md`; // 파일 이름 생성
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
    return false; // 중복이 없었으므로 false 반환
}
```
Description을 기점으로 사이에 있는 모든 것을 받아오게 되어있습니다.

지금 생각해 보면 엄청난 돌머리였지만 그대로 코드를 올린 점이 하나 있는데..

주석에 최신 항목부터 처리. 이걸 왜 했을까.. 이것의 의도는 그냥 받아오니 옛날글이 위로 올라오네?? 그럼, 밑으로 내리려면 옛날 거부터 받으면 되잖아? 럭키비키구만 라고 했는데

조금만 더 알아보니 pubDate를 받아와서 적어주면 자동으로 해주더라고요..
이것은 추후에 리펙터링하는걸로.

그리고, 혹시 기존에 있는 것과 새로 만들려는 파일의 내용이 같으면 굳이 안 만들어도 되니깐 if 문을 통해 확인 후 생성되게 했습니다.

4. Github에 커밋올리기

이 단계는 따로 서버를 운영하고 있지 않은 동아리 사이트에서 어떻게 돌릴 것이냐, 라는 의문이 있었습니다.
이것을 위해 서버를 만들어? 그건 아니잖아

![](./img/이건%20아니지.jpg)

이것 또한 찾아보니 [Github Action](https://docs.github.com/ko/actions)을 이용하면 가능하더라고요!
Github Action이란 Github가 공식적으로 제공하는 빌드, 테스트 및 배포 파이프라인을 자동화할 수 있는 CI/CD 플랫폼입니다.
여기에서는 .github\workflows라는 폴더안에 .yml확장자로 된 파일을 만들어 워크플로를 자동화할 수 있었습니다.

```
name: Action name
 
on:
  push:
    branches: [ "main" ] 
  pull_request:
    branches: [ "main" ]
  schedule:
      - cron: "0 20 * * *"
 
jobs:
  build:
 
    runs-on: ubuntu-latest
 
    steps:
    - name: Set up chekcout
      uses: actions/checkout@v2

    - name: Set up node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm install

    - name: Run parser
      run: |
        node authors-parser.js

    - name: Update or add .md file
      if: steps.verify.outputs.changed == 'true'
      run: | 
        git pull
        git add .
        git diff
        git config --local user.email "email@email.com"
        git config --local user.name "github_nickname"
        git commit -m "Commit Message"
        git push
```

일단 1번째로 branch를 설정했습니다.
GitHub에서 호스팅하는 Runner 중에서 저는 ubuntu를 사용하였고, step을 기점으로 밑에서부터는 할 일을 시키는 공간입니다.
이름을 적고 어떤 걸 어떻게시킬 것인지를 적어주면 됩니다. 이름은 밑에 사진처럼 나오게 됩니다.

![](./img/깃액션%20에시.png)

저의 계획은 순차적으로 노드를 가져와 패키지 실행을 위해 npm을 설치하고, 위에서 열심히 만들어둔 파일을 실행한 후 자동으로 커밋을 올리게 됩니다.

하지만 쉽게 된다면 말이 안 되죠. 악당 등장..

![](./img/악당.jpg)

문제는 딱 하나. md 파일이 없어서 만들게 없어. 그래도 커밋을 올려야해? 라는 오류로 펑 * ∞ ...

이를 수정하기 위해 이리저리 돌아 아래와 같이 코드를 하나 추가했더니 성공해 버렸습니다
```
- name: Check if there are any changes
      id: verify
      run: |
        git diff --quiet . || echo "changed=true" >> $GITHUB_OUTPUT

    - name: Update or add .md file
      if: steps.verify.outputs.changed == 'true'
```
딱 저 확인하는 절차 하나에 갈려 나갔습니다.


## 평가
사실 이 프로젝트 아닌 미니(?) 사이드(?) 정도 되는 장난감인데
저는 이렇게 오래 걸릴 줄몰랐거든요.. (사실 이게 5일이나 걸림)

처음으로 이렇게 경험해 보는 거고 군대 전역 후 복학하고 경험해 보고 싶어 이 기능을 구현하게 되었습니다.

주변에 조언도 많이 받고, 이 기능은 레포지터리를 삭제하지 않는 이상 계속 가지고 가는데,
이 글을 끝으로 마무리 짓는 것이 아닌 후에도 문제가 생기면 모두가 처리할 수 있게 리펙터링하고, 주석 자세히 달아두겠습니다.

![](./img/2만.png)