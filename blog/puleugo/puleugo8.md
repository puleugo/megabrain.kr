---
authors: puleugo
date: Thu, 14 Nov 2024 08:52:43 +0900
---

# 가장 후회하는 블로그 커스터마이징

금년 [4월 즈음에 다크모드를 대응하여 이미지 색상을 반전하는 기능](https://ko.puleugo.dev/190)을 구현하였었는데요.

[css를 활용한 다크모드 이미지 자동 대응

소개다음 영상을 보시면 무슨 말인지 쉽게 이해할 수 있습니다.아이디어https://github.com/joonas-yoon/boj-extended?tab=readme-ov-file GitHub - joonas-yoon/boj-extended: 백준 온라인 저지(BOJ)를 확장된 기능과 함께

ko.puleugo.dev](https://ko.puleugo.dev/190)

다크모드를 굉장히 좋아하는 사람 중 하나로써 제 블로그는 다크모드에 최적화된 환경으로 만들고 싶었습니다. 이는 현재 가장 후회하는 블로그 커스터마이징입니다.

# 재앙의 시작

뭔가 틀렸다는 것을 느낀 것은 [동아리 사이트에 블로그 탭](https://www.megabrain.kr/blog)을 구현할 때 였습니다. 크롤링한 게시글의 이미지가 White Mode에서 볼 수 없는 문제가 발생했습니다. 색상 반전이 되지 않아, 이미지도 하얗고 배경도 하야니까요.  
이는 곧 콘텐츠가 블로그의 css에 의존하게 되는 기이한 현상이 발생합니다.

이는 계왕권을 사용하여 다른 플랫폼에 글을 배포하게 되도 동일한 문제가 발생합니다.  
아래는 Medium 플랫폼에 배포한 이미지입니다.

![](https://blog.kakaocdn.net/dn/DU04n/btsKI4h3IP2/7TXePxaaZt1vEuUlxltHUk/img.png)![](https://blog.kakaocdn.net/dn/I5K8u/btsKIOT4nFk/KKdwKHNyUGESZDOSCy3e80/img.png)

Medium에 동일한 글을 배포하면 이미지가 안보이는 현상 발생

"뭐.. 다크모드로 보면 되겠네."라고 생각하셨겠다면 Medium은 White Mode만 제공합니다. 우측은 Dark Mode Reader라는 구글 확장프로그램으로 CSS를 다크모드처럼 변경한 화면입니다.

정상적인 방법으로는 이미지를 볼 수 없습니다..

# 안하느니 못했나?

![](https://blog.kakaocdn.net/dn/blNcdo/btsKHNID2k4/Q1kQpKDuq2ZNH2RfUKh34k/img.jpg)

세상에 그런일이 어딨습니다. 이게 다 경험이니까요.

White Mode 기반으로 색반전 CSS를 변경하고 과도하게 꺠지는 이미지를 변경해야겠습니다.

