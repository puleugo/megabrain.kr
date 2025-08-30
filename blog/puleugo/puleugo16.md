---
authors: puleugo
date: Mon, 5 Feb 2024 17:25:42 +0900
---

# html에서 React로 마이그레이션 시 겪었던 문제점

## 서론

### 난 왜 이걸 하고 있는가?

현재 교수님이 속해 있는 회사의 렌딩페이지를 급하게 만들어야 했습니다. [html5up](https://html5up.net/)이라는 html 예제 모음 사이트에서 가져와서 내부 콘텐츠만 변경하여 작업하기로 결정하였습니다. 다운받은 예제는 외부 라이브러리 없이 html, css, js만으로 구현되어 있습니다. 이를 추후 간편한 수정을 위해 **React로 마이그레이션**을 진행해야만 했습니다.

### 무슨 문제에 봉착했는가?

[다운받은 템플릿(live demo)](https://html5up.net/dimension)에 속해있는 **js 기능이 정상적으로 동작하지 않았습니다**. React에 포함되어 있는 /public/index.html의 body 태그 내 마지막 줄에 js를 불러오는 script 태그를 추가했지만 실패했습니다.

## 본론

### 작업에 실패했던 이유

* React의 동작 방식에 대한 이해 부족
* html5up의 코드의 동작 방식을 모르는 상태에서 작업 시작
* 쉽고 귀찮은 것이라고 인식한 마음가짐의 문제

### 몰랐던 것들

#### React의 동작 방식

React는 index.html을 모두 읽어들인 후 index.html을 실행합니다. index.html에 App.js의 컴포넌트의 render 함수를 호출하여 return하는 데이터를 html으로 파싱해서 index.html의 body 태그에 추가합니다. 이전에는 index.html(header) -> index.html (body의 id "root"를 가진 div) -> React에서 호출한 모든 컴포넌트를 div에 추가 -> index.html의 남은 body 불러오는 순서라고 생각했습니다. 이는 틀렸습니다.

![](https://blog.kakaocdn.net/dn/nS9Dv/btsEngKfvNC/odt0ioBLyoyIiHkm7a0Tuk/img.png)

이번에 깨달은 React의 동작방식

1. public/index.html을 읽어옴.
2. index.js에서 src/App.js을 읽어들임.
3. index.js에서 index.html의 body에 App.js 의 반환값 삽입
4. 마운트

#### html5up의 동작방식

템플릿의 js 파일들은 크게 2가지로 나뉩니다.

1. 특정 기능을 담당하는 feature.js 파일들
2. 그리고 그 파일들을 불러오는 하나의 main.js 파일입니다.

main.js에서는 js에서 DOM을 조작하여 html 요소(element)에 특정 스타일을 조작하거나 feature.js의 기능을 연결시킵니다. main.js가 동작하기 위해서는 index.html에 모든 html 요소가 마운트 되어 있어야합니다. 마운트 되어 있지 않는 경우에는 main.js에서 html 요소를 찾지 못해 main.js가 정상적으로 동작되지 않습니다.

## 결론

### 해결 방법

index.js의 body에 feature.js들을 불러오는 script 태그를 추가하고, App.js가 마운트되었을 때 main.js를 불러오는 script 태그를 삽입했습니다.

