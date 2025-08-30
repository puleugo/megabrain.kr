---
authors: puleugo
date: Mon, 22 Apr 2024 18:10:39 +0900
---

# css를 활용한 다크모드 이미지 자동 대응

## 소개

다음 영상을 보시면 무슨 말인지 쉽게 이해할 수 있습니다.

### 아이디어

[https://github.com/joonas-yoon/boj-extended?tab=readme-ov-file](https://github.com/joonas-yoon/boj-extended?tab=readme-ov-file)

[GitHub - joonas-yoon/boj-extended: 백준 온라인 저지(BOJ)를 확장된 기능과 함께 사용해보세요. 기능 요청

백준 온라인 저지(BOJ)를 확장된 기능과 함께 사용해보세요. 기능 요청과 버그 제보는 언제나 환영합니다. - joonas-yoon/boj-extended

github.com](https://github.com/joonas-yoon/boj-extended?tab=readme-ov-file)

## 코드

아래 코드는 본인이 사용하고 있는 블로그 스킨에 맞게 수정해서 사용하세요.

저는 [berry skin v4](https://bluemiv.tistory.com/59)를 사용하고 있어서 다음과 같은 코드로 작성했습니다.

```
/* 기본 이미지 색상 */
img {
    filter: none;
    -webkit-filter: none;
    -moz-filter: none;
    transition: 0.2s ease-out;
}

/* 다크모드의 게시글 내부 이미지 색상반전 */
.dark .contents_style img {
    filter: invert(100%) hue-rotate(180deg) brightness(120%) contrast(72.5%);
    -webkit-filter: invert(100%) hue-rotate(180deg) brightness(120%) contrast(72.5%);
    -moz-filter: invert(100%) hue-rotate(180deg) brightness(120%) contrast(72.5%);
    transition: 0.2s ease-out;
}
```

## 참고할 사항

회고록 같이 사람 얼굴이 나오는 경우에 좀 무섭게 변합니다.

