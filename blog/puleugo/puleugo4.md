---

authors:

  - name: 임채성

    title: 팀장

    url: https://github.com/puleugo

    image_url: https://github.com/puleugo.png

    socials:

      github: puleugo

date: Sun, 11 Aug 2024 12:00:07 +0900

---

# 티스토리에 마진 넣는법

## 서론

티스토리는 기본적으로 css에 포함된 마진을 무시합니다. 그래서 대부분의 블로거들이 줄바꿈을 광클떄려놔서 가독성이 떨어집니다.  
본 글에서는 마진 제거 css인 tt\_article\_useless\_p\_margin 속성을 제거하려고합니다.

## 문제 분석

대충 네트워크 및 동작 흐름 보면 이렇습니다.

1. 게시글 API 호출 (text/html)
2. useLessPMargin.css API 호출
3. tistory에서 보내줄 html과 css를 로드 완료
4. CSSOM 마운트
5. DOM 마운트

## 방법

jQeury를 사용하여 DOM 마운트 시 CSSOM을 통해 최종적으로 추가된 tt\_article\_useless\_p\_margin 클래스를 제거하였습니다.

```
<body>
	<!-- ... 기존 블로그 코드 -->

	<!-- jQuery 설치 -->
	<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
	<!-- 지들 멋대로 margin 삭제해버리는 css 제거 -->
	<script  type="text/javascript">
		$("div").removeClass("tt_article_useless_p_margin")
	</script>
</body>
```

