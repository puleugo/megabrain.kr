---

authors:

  - name: 임채성

    title: 팀장

    url: https://github.com/puleugo

    image_url: https://github.com/puleugo.png

    socials:

      github: puleugo

date: Mon, 19 Aug 2024 21:59:04 +0900

---

# 당신의 블로그, 계왕권을 쓸 수 있다.

> [발표준비](https://puleugo.tistory.com/209)로 바빠져 10월에 배포 예정입니다.. ㅠㅠ

## 계왕권이 뭔데..

최근 취업 불황으로 인해 국내 개발자들의 평균 스펙이 향상되었습니다. 그러나 <u>해외 블로그의 기술적 난이도는 국내보다 낮습니다</u>. 예시로 일본의 대표적 기술 블로그 플랫폼인 [Qiita 인기 게시글](https://qiita.com/trend)을 보면 이를 확인할 수 있습니다. (08/19 기준)

* 【완전판】 이것 1개로 React의 기본을 마스터할 수 있다! 초보자 튜토리얼!
* 【AWS 컨테이너 입문】간단한 Python 앱을 ECS에 배포해 보자!
* Excel에서 CSV 파일을 '0 내림'이나 '문자화'없이 열기
* 【Vue】VeeVallidate에 의한 커스텀 밸리데이션의 작성

그래서 '**국내 개발자의 글을 해외로 수출하면 수요가 있지 않을까?'** 라는 생각이 들었습니다. 대표적 선진국 9개국의 인구수는 한국의 약 44배이므로, 단순 계산으로 <u>당신의 블로그는 **44배 이상의 영향력**</u>을 얻을 수 있습니다. 드래곤볼의 계왕권을 떠올리며 프로젝트 이름을 이렇게 정했습니다.

![ASDASD](https://blog.kakaocdn.net/dn/CBX8T/btsI5dW2Rr2/EettUYp2gyLk6Ztnpxamb1/img.png)

딸깍 3배.

> \[출시 알림 신청을 받고 있습니다. 많은 관심 부탁드립니다!!\]  
> [\[개발블로그 계왕권\] 프로젝트 출시 알림 신청](https://forms.gle/rQvbYyTxoeLdowmi6)

## 설계 해보자

저는 초등학교 4학년때부터 11년간 블로그를 운영해 온 블로거입니다. 중학생 시절에는 블로그 마케팅도 경험했고, 네이버 블로그에서 누적 조회수 1,028k를 달성했습니다. ([향로](https://jojoldu.tistory.com/)님의 약 10% 정도)

블로그 관련 콘텐츠에는 나름의 인사이트가 있다고 자부합니다. 이 관점에서 가장 큰 이슈는 다음과 같습니다.

### 이슈: 구글은 번역 글을 좋아하지 않는다.

**구글은 유사 문서를 굉장히 싫어합니다**. 당신이 며칠을 고민해서 작성한 글이라도 글의 내용이 유사하다면 검색결과 우선순위가 하락합니다. 특히 이미지를 동일한 이미지를 그대로 쓰면 우선순위가 하락합니다. 모든 검색엔진이 자체제작 콘텐츠를 좋아해요.

![](https://blog.kakaocdn.net/dn/Ck4j8/btsI9wN5tXS/vudkdGWYzi0yzuyxVJrXkK/img.png)

인기글 중 자체 콘텐츠(8/10)

그럼 어떻게 해야할까요?

### 해결 방안: 상호대체 여부를 명시하라.

사실 우리가 고민하는 내용들은 이미 **선대 개발자들이 알잘딱으로 처리해놨을 가능성이 높습니다**. 또한, 이번 케이스도 동일합니다. 각 포스트의 html head에 hreflang 태그를 삽입하면 <u>국가에 맞는 게시글을 안내해주며 중복컨텐츠 문제가 해결</u>됩니다. (명시 방식에는 [다른 방법](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=en&visit_id=638593952115326122-859270653&rd=1)도 존재함)

![](https://blog.kakaocdn.net/dn/cetFp9/btsI6TDnYjZ/ecm8XMOuyQCjE6Afy8NuJ1/img.png)

요로코롬 넣어주면 굴루굴루에서 처리해줌.

게시글 작성할 시에 html 편집모드로 script 태그를 추가하면 됩니다.

```
<script>
document.addEventListener("DOMContentLoaded", function() {
    var link = document.createElement('link');
    link.rel = "alternate";
    link.hreflang = "ja";
    link.href = "https://example.com/ja";
    document.head.appendChild(link);
});
</script>
```

### 내 취향의 기능 구현

* **접근성은 엑셀이 최고**: 모바일에서도 데이터를 조작할 수 있도록 구글 스프레드시트를 통해 데이터를 정리할 것입니다. 엑셀과 DB의 데이터를 CronJob을 사용하여 지속적으로 동기화할거에요.
* **확장성은 markdown이 최고**: html의 ui는 css 의존하므로 너무 의도치 않은 ui 결과가 나올 수 있습니다. 많은 글로벌 블로그에 배포하기 위해서는 github에서 markdown으로 관리 할 것입니다.
* **서버리스로 작업**: 편해지고자 하는 작업인데 서버는 관리하기 귀찮고 비용도 발생할거에요. 모든 처리는 Github Action으로 처리할게요.

## 아키텍처는 이렇습니다.

![](https://blog.kakaocdn.net/dn/dYEaUf/btsI8JHs3IP/UhtzoHZaXrAqI07gNqrrN0/img.png)

특히 마음에 드는 점은 추후에 **다른 블로그 플랫폼으로의 마이그레이션에도 열려있습니다**. 그래서 대표적으로 필요한 기능은 이렇습니다.

1. 티스토리 게시글 md 변환
2. ChatGPT 변역 기능
3. 블로그 플랫폼 별 게시글 업로드 기능 구현
4. 게시글 &harr; 엑셀 동기화*(조작할 필요은 적을 수록 가장 이상적)*

출시되면 많은 관심 바랍니다!!  
(9월 중 오픈소스로 출시 예정)  
[\[개발블로그 계왕권\] 프로젝트 출시 알림 신청](https://forms.gle/rQvbYyTxoeLdowmi6)

[\[개발블로그 계왕권\] 프로젝트 출시 알림 신청

\- 개인정보 수집 항목: 이메일 - 개인정보 수집 목적: 서비스 출시 시 알림 응답 제출 시 개인정보 수집에 동의하는 것으로 간주합니다.

docs.google.com](https://forms.gle/rQvbYyTxoeLdowmi6)

혹시 좋은 아이디어 있으면 위 구글 폼에 의견 달아주시면 감사하겠습니다.

![](https://blog.kakaocdn.net/dn/pDuYs/btsI9GXo1z5/orkbQ0pkKu1KNxiZuFmkMK/img.webp)

개발자들아! 내게 아이디어를 조금만 나눠줘!!

![](https://blog.kakaocdn.net/dn/Egome/btsI83MvG8b/f19SGQkAV6Jcp9nAfFUWEk/img.png)

감사합니다!!!

