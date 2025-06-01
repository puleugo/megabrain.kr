---
authors: puleugo
date: Mon, 11 Nov 2024 12:31:32 +0900
---

# [계왕권 프로젝트] 베타버전 개발기

## 길고 험난했던 베타버전 출시

![](https://blog.kakaocdn.net/dn/pnKrz/btsKDPF1s8X/6wbrYRDZAuxOMbmmorWryk/img.png)

일일 1389 커밋

꽤나 막혔던 프로젝트였습니다. 새로운 프로젝트를 하는게 오랜만인지라 너무 추상적인 계획만 세우고 작업을 들어가서 구체화 과정에서 멀리 돌아간 작업들이 굉장히 많네요. 대표적인 것들만 정리해보겠습니다.

## 1\. 플랫폼에 의존하는 번역글 연결

처음 생각했던 번역 게시글 업로드 후 JS Injection을 통해 게시글 metadata를 수정하는 방식을 생각했습니다.

우선, <u>게시글 본문을 수정</u>해야 하는 문제가 있습니다. 대부분의 블로그 플랫폼(Medium, Dev.to, Qiita, Tistory)의 API는 게시글 수정 기능을 지원하지 않으며 수정기능을 지원한다고 하더라도 JS Injection을 막아둔 경우가 대부분이었습니다.  
Tistory의 API를 분석하여 Reverse Engineering을 통해 HTTP 통신만을 활용하여 게시글 수정을 구현하긴하였다만. 이는 너무 <u>난이도가 높았습니다</u>. 사실 Medium이 GraphQL 방식으로 통신하는 것을 보고 포기했습니다.

이방식은 포기하기 다른방식을 찾아봤습니다.

### 다행히도 Sitemap을 통해서도 Link가 가능하다.

「[구글에게 페이지의 번역본에 대해 알려주기](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=en&visit_id=638593952115326122-859270653&rd=1)」를 읽어보면 다른 방식들도 있습니다.

1. ~~HTML tag에 첨부.~~ (실패)
2. ~~HTTP Header에 첨부.~~ (플랫폼의 응답을 조작하는 방법이 떠오르지 않아 패스)
3. Sitemap에 명시하기. &larr; 이 친구에 대해 알아봅시다.

Sitemap는 구글 크롤러에게 사이트의 페이지, 영상, 기타 파일에 대한 관계를 알려주기 위해 제공하는 파일입니다. 예를 들어 아래와 같은 정보를 제공할 수 있습니다:

* <u>번역본 링크</u>
* 게시글의 마지막 수정일, 제목, 우선순위

굉장히 재미있는 파일입니다. Tistory에서도 제공합니다.  
[https://puleugo.tistory.com/sitemap](https://puleugo.tistory.com/sitemap)

그럼 문제를 정의하면 '티스토리의 사이트 맵을 어떻게 수정하냐?' 일까요? 잠깐.. 아니죠. 문제는 '<u>구글에게 제공할 내 블로그의 Sitemap을 작성하는 방법입니다.</u>'  
문제를 다시 정의하니 '<u>개인 도메인을 발급하여 블로그와 연결하는 방법을 떠올렸습니다</u>.' 개인도메인이라면 Sitemap을 마음대로 수정할 수 있을 것 같았거든요. 이는 정답이었습니다.

[https://www.puleugo.dev/sitemap.xml](https://www.puleugo.dev/sitemap.xml)

Vercel을 활용하여 Github Repository에 업로드된 sitemap.xml을 도메인에 연결하였습니다. 이러면 Free + Serverless + File System으로 작업 가능해졌네요! (5분정도면 작업가능합니다.)

## 2\. 너무너무 많은 외부의존성

본 프로젝트는 프로젝트 규모 대비 외부의존성이 굉장히 많습니다. 간단히 나열해보자면:

* Spread Sheet: 블로그에 대한 정보 입력
* Github: 원 본&sdot;번역 게시글, 무결성 검증을 위한 Metadata 파일, Sitemap 파일
* Github Action: 공짜 실행환경
* ChatGPT: 영어 잘하는 형
* Vercel: 무료 Sitemap 발사대
* Blog Platforms:
  * Tistory: 구글 검색의 GOAT
  * Medium: 영어권 개발 플랫폼 GOAT

다시말해 테스트하기 굉장히 빡셉니다요. Github는 널널하기로 유명해서 그냥 Stub 안 만들고 작업했어요. Medium은 하루 사용량 초과로 429 던지는거 보니 Test Double이 시급하겠네요. 베타배포 후에는 테스트코드로 프로젝트를 조금 더 견고하게 만들어봐야겠습니다.

## 3\. 늘 후회하지만 습관화는 안되는 것들 (고쳐야 할 약점)

1. 코드짜기전에 시뮬레이션 더 많이 돌려보기
2. 새로접하는 작업하는 것들은 방법 다양하게 찾아보고 가장 효율적인 것 생각하기.
   * Tistory RE한건 너무 무식한 방식이었다고 생각합니다요. (Reverse Engineering인지도 모르겠음.)
3. 끝까지 테스트 작성하기.
   * 테스트 작성하기 힘들다면 책임분리가 잘못된 것이라는 것을 또다시 느꼈습니다.

---

## 마치며

내일 중에 베타버전 출시하겠습니다. 베타버전 배포가 끝나면 본격적인 취준을 시작해야겠네요..ㅋㅋ

