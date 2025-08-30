---
authors: puleugo
date: Mon, 21 Aug 2023 15:37:05 +0900
---

# Github Convention 깃헙 컨벤션 정리/모음

![](https://blog.kakaocdn.net/dn/yrXYs/btsrSNy5CcW/OYskiqyE3Ui73avUqVV1p1/img.webp)

Github 컨벤션은 목적에 따라 필요할수도 있고, 오히려 과할 수도 있습니다.

팀단위로 진행하는 프로젝트에서 컨벤션이라는 추상화를 통해 불필요한 커뮤니케이션을 줄일 수 있어 유용하며, 이후 취업 준비 중에는 본인의 역량을 github issue, PR에 깔끔하게 정리하여 깔끔하고 매력적인 포트폴리오를 만들 수 있습니다.

글에 들어가기 앞서 본 컨벤션이 적용된 [Repository](https://github.com/gyeongnam-gyeongmae/server)와 [Github Convention 정리 글](https://github.com/gyeongnam-gyeongmae/server/wiki/02.-Convention)을 알려드립니다.

[경남 경매 서버 레퍼지토리(Spring boot)

경남 경매 서버 레퍼지토리 서버 코드

github.com](https://github.com/gyeongnam-gyeongmae/server)

[Code Convention

경남 경매 서버 레퍼지토리 컨벤션 Wiki

github.com](https://github.com/gyeongnam-gyeongmae/server/wiki/02.-Convention)

## 내가 선정한 올바른 Github Convention의 조건

1. 각자가 맡은 Task가 구체적으로 정리되어있어야 합니다.
2. 개발을 하다 겪은 문제들이 Github Issue로 잘 정리되어있어야 합니다.
3. Convention을 제대로 이해한 개발자는 원하는 정보가 어디에 존재할 지 알 수 있습니다.
4. 읽는 환경에 따라 정보가 달라지면 안됩니다. *(OS에 따라 가독성이 변경되는 [gitmogi](https://github.com/carloscuesta/gitmoji)를 사용하지 않는 이유)*

결론  
**컨벤션을 통해 커뮤니케이션이 추상화됨.** **코드 작성자에게 직접 묻지 않아도 문서를 통해 작업 현황을 알 수 있음.**

## Git Branch

브랜치 전략은 가장 유명하고 심플한 Git-flow 전략을 사용하고 있습니다.

종류

* main: 제품 출시 브랜치
* develop: 출시를 위해 개발하는 브랜치
* feat/{기능명}: 새로운 기능 개발하는 브랜치
* refactor/{기능명}: 개발된 기능을 리팩터링하는 브랜치
* hotfix: 출시 버전에서 발생한 버그를 수정하는 브랜치

예시

* main
* dev/feat/login
* dev/feat/register

참고 자료

* [Git Flow란, 깃 브랜치 전략 - 푸르고 개발블로그](https://puleugo.tistory.com/107)
* [우린 Git-flow를 사용하고 있어요. - 우아한 기술 블로그](https://techblog.woowahan.com/2553/)

## Commit

저는 <type>을 제외한 모든 커밋 내용에 한글을 사용하였습니다.

커밋 형식

```
<type><is breakchange>: <subject> // 제목
<BLANK LINE> // 구분줄
<body>       // 내용
<BLANK LINE> // EOF
```

### 제목

제목에는 본 커밋의 종류를 알려줍니다.

**제목 타입**: <type>

* feat: 기능 (feature)
* fix: 버그 수정
* docs: 문서 작업 (documentation)
* style: 포맷팅, 세미콜론 누락 등.
* refactor: 리팩터링
* test: 테스트
* chore: 관리(maintain), 핵심 내용은 아닌 잡일 등  
*// chore: [하기 싫은 따분한 일, 정기적으로 하는 일](https://en.dict.naver.com/#/search?query=chore)이라는 의미를 가지고 있습니다.*

**브레이크 체인지 여부**: <is breakchange>

> 브레이크 체인지란?  
> 기존 개발하는 방식에 비해 많이 변경된 경우를 알리기 위한 표시.  
> 또한, 브레이크 체인지가 존재하는 경우 <u>변경내용에 대한 설명을 body에 작성</u>해야 합니다.

브레이크 체인지가 존재하는 커밋의 경우에는 제목 뒤에 '!' 을 추가합니다.

예시

* feat!: 랭킹 점수 계산 공식 변경 *// 변경(change)되었으니 잠깐 멈춰서(break) 이 커밋을 읽어주세요!*
* feat: 로그인 기능 구현

**제목 내용**: <subject>

제목 내용 규칙:

* 명령조로 작성
* 현재 시제 사용
* 끝에 . 없이 작성

### 메세지 본문

* 커밋에 대한 동기와 이전 코드와의 대조를 설명
* 명령조로 작성
* 현재 시제 사용
* 기본은 선택 사항
* 브레이크 포인트가 존재하는 경우, 반드시 변경 사항의 설명을 body에 명시할 것

예시:

```
feat: 경매품 업로드 기능 구현
```

```
feat!: 랭킹 점수 계산식 변경

기존 계산식은 기여 `횟수 * 영상 시간(분)`이었지만, 기획 변경으로 인해 `횟수 * 영상 시간(초)`로 변경되었습니다.
해당 논의가 포함된 (이슈)[https://github.com/gyeongnam-gyeongmae/server/issues/1]
```

### Issue

* 담당자(Assignees)를 명시 할 것
* Task list 기능을 적극 활용할 것
* 기능에 관련된 Issue라면 Github Project와 PR과 연동하여 진행상황을 공유할 것

예시:

![](https://blog.kakaocdn.net/dn/biuMNW/btsrNmPy6aO/n97UjvtXwqKPwjZcYP4oA1/img.png)

https://github.com/gyeongnam-gyeongmae/server/issues/1

## Pull Request

* 제목은 '\[#기능 번호\] 변경 사항' 구조로 작성할 것
* Issue와 연동할 것

예시:

* \[#2\] 로그인 기능
* \[#11\] 게시글 업로드 기능 구현

![](https://blog.kakaocdn.net/dn/wS3Ek/btsrEypsx82/qfJRZZt621vNkuOFX5zyTk/img.png)

https://github.com/gyeongnam-gyeongmae/server/pull/3

## Projects

* 기능 관련 Issue는 Projects에 연동해서 사용할 것
* Todo, In Progress, Done으로 현황을 공유할 것

![](https://blog.kakaocdn.net/dn/w0fXA/btsrErqoGNi/pKSg1kB1i9MUWUVRJgyNcK/img.png)![](https://blog.kakaocdn.net/dn/7enmF/btsrDDq8JBt/ibxMlYsml1Lf8VK5oQHyKK/img.png)

---

## 팁

### Use Case 작성

![](https://blog.kakaocdn.net/dn/cllEwE/btsrDIlzrfo/sdqoReRYfoUg5IH6pTFN0K/img.png)

https://github.com/gyeongnam-gyeongmae/server/wiki/01.-Use-Case

### Github Wiki 사용

![](https://blog.kakaocdn.net/dn/nNUAK/btsrIf4jlHY/Yd5zCWKGps5BP5S1NcnPHK/img.png)

https://github.com/gyeongnam-gyeongmae/server/wiki/02.-Convention

### 코딩 컨벤션 플러그인

[google-java-format 플러그인](https://plugins.jetbrains.com/plugin/8527-google-java-format)

[google-java-format - IntelliJ IDEs Plugin | Marketplace

Formats source code using the google-java-format tool. This plugin requires additional IDE configuration. For more information, read the documentation.

plugins.jetbrains.com](https://plugins.jetbrains.com/plugin/8527-google-java-format)

저희 팀은  
[Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)를 컨벤션으로 삼고 있습니다. ([자동적용 플러그인 설치](https://github.com/google/google-java-format/blob/master/README.md#intellij-jre-config))

![](https://blog.kakaocdn.net/dn/c94VA3/btsrNngFWvj/MCjC0YeFVBE17LtFazTVK0/img.png)

### 커밋 컨벤션 플러그인

[Conventionla Commit 플러그인](https://plugins.jetbrains.com/plugin/13389-conventional-commit)

[Conventional Commit - IntelliJ IDEs Plugin | Marketplace

The aim of this plugin is to provide completion for conventional commits, also named semantic commits, inside the VCS Commit dialog. The plugin provides: Standard...

plugins.jetbrains.com](https://plugins.jetbrains.com/plugin/13389-conventional-commit)

![](https://blog.kakaocdn.net/dn/uohuu/btsrH3W2Fxq/kfyMOLIvGUY6b4XnxxL0EK/img.png)

### 폴더 구조 명시

예시:

DDD로 분리

```
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── example
    │   │           └── demo
    │   │               ├── DemoApplication.java
    │   │               ├── coupon
    │   │               │   ├── controller
    │   │               │   ├── domain
    │   │               │   ├── exception
    │   │               │   ├── repository
    │   │               │   └── service
    │   │               ├── member
    │   │               │   ├── controller
    │   │               │   ├── domain
    │   │               │   ├── exception
    │   │               │   ├── repository
    │   │               │   └── service
    │   │               └── order
    │   │                   ├── controller
    │   │                   ├── domain
    │   │                   ├── exception
    │   │                   ├── repository
    │   │                   └── service
    │   └── resources
    │       └── application.properties
```

