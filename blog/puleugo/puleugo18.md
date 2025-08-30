---
authors: puleugo
date: Thu, 14 Mar 2024 17:36:31 +0900
---

# 티스토리 특정 게시글 광고 제거하는 법

다음 css 코드를 광고 제거하고자 하는 게시글의 html 수정을 통해 삽입하면 됩니다.  
참고로 html 재수정을 하더라도 <script> 태그는 볼 수 없으니 본 글을 북마크 해두시는 것을 추천드립니다.

## 코드

```
<style> .revenue_unit_wrap, .adsbygoogle { display: none !important; } </style>
```

## 원리

1. revenue\_unit\_wrap, adsbygoogle 클래스가 달려있는 광고를 display: none을 통해 제거합니다.
2. adsbygoogle 클래스의 경우 인라인 스타일을 이용하여 display 옵션을 주었기 때문에 css 최상위 우선순위 important을 주었습니다.

## 적용 예시

* 광고 제거 된 글: [5년차 네이버 면접관이 말하는 함께하고 싶은 개발자](https://puleugo.tistory.com/181)
* 광고가 있는 글: [\[한빛미디어 서평단\] 헤드퍼스트 자바 - 자바로 여는 무한한 객체지향 세계](https://puleugo.tistory.com/180)

