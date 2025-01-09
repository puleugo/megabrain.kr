---
authors: puleugo
date: Sun, 24 Nov 2024 18:44:09 +0900
---

# 상호 존중하는 PR 만들기

본 게시글은 주인공들의 이야기, [이한결](https://www.linkedin.com/in/hanlee0707/)님과의 인터뷰 내용을 참고하여 작성했습니다.  
[https://youtu.be/CQj797uQw1U?si=PmCScDRERUUNVmSI](https://youtu.be/CQj797uQw1U?si=PmCScDRERUUNVmSI)

Full Video

## 도입

최근 팀원에게 아래와 같은 코멘트를 받았습니다.

> 하나의 PR에 코드가 너무 많아요.  
> 다음에는 조금 작은 단위로 PR을 만들어주세요.

이한결님과의 인터뷰에는 아래와 같은 답이 있었습니다.

* 가독성 좋은 PR을 만드는 방법
* 가독성 좋은 Commit을 만드는 방법

## 무엇이 상호 존중하는 PR인가?

상호 존중하는 PR은 읽기 좋은 PR이며 리뷰어 입장에서 "**이거 바로 Approve해도 되겠는데?**"라는 말이 나오는 것이 가장 좋습니다.  
읽기 좋은 PR은 글쓰기를 생각하면 됩니다. 가독성 좋은 글은 다음과 같이 구성되어있습니다:

* 각 문단에는 하나의 주제만 설명한다.
* 각 문장에는 하나의 내용만 설명한다.

PR에 적용해보면 PR에는 하나의 주제만을 Commit에는 하나의 내용만으로 구성하는 것이 가독성을 향상하는 간단한 방법입니다.

## 구체적으로 좋은 PR을 만드는 방법

### 1\. 업무에 Check Point를 먼저 정하기

해결해야할 업무를 수행하기 전 미리 작업을 분리할 수 있는 단위로 쪼갭니다. 한결님의 예시:

1. **요구사항 확실하게 하기**: 기획자 혹은 팀원과 커뮤니케이션을 통해 요구사항을 명확히 함.
2. **대략적인 단계 및 세부사항 작성**:
   * 세부적으로 모호한 부분 제거.
   * e.g. Refactor와 Feature는 반드시 별도의 단계로 분리되어야 함.
3. **코딩**: 위 문서화를 기반으로 작업하면 팀원이 이해하기 쉬운 PR이 자연스럽게 만들어짐.

너무 큰 작업인 경우 'Stacked PR'이라는 방법을 활용할 수 있습니다.

### 2\. Stacked PR 활용하기

Stacked PR은 하나의 작업을 여러개의 PR을 활용하여 작업을 쪼개 수행하는 방법을 말합니다.  
'Stacked'이라는 명칭에 맞게 하나의 큰 PR 내부에 작은 PR을 만든 후 LIFO 순서로 PR이 Merge하는 특징을 가지고 있습니다.

만 번 설명하는 것보다는 보는 게 나을 것 같습니다:

#### Stacked PR 예시

PR이 어떻게 열리고 닫히는지 참고해주세요.  
Main PR에서 작업 내용이 이해하기 쉽도록 핵심 내용만 보여줍니다. 세부적인 내용은 내부 PR 안에서 작업하면 좋습니다.

```
PR #1 "feat/movie-list-query-search" // Main PR
- Commit "feat: add basic movie list query with pagination"
- Commit "test: add unit tests for basic query functionality"
* Open PR #2 "feat/search-by-director-title-actor"
    - Commit "feat: implement search by director name, movie title, and actor ID"
    - Commit "test: add tests for search functionality"
    - Commit "refactor: optimize search query structure"
* Merged PR #2 into #1

* Open PR #3 "feat/filter-by-category"
    - Commit "feat: implement category filter with 'All Categories' option"
    - Commit "chore: add category filter validation logic"
    - Commit "test: add tests for category filter feature"
    * Open PR #4 "refactor/category-filter-query-details" // Detailed PR for #3
        - Commit "refactor: move category filter logic into reusable service"
        - Commit "test: update unit tests for refactored category filter"
    * Merged PR #4 into #3
* Merged PR #3 into #1

* Open PR #5 "feat/sort-by-latest-and-viewers"
    - Commit "feat: add sort by latest release date and viewer count"
    - Commit "chore: add validation for sort parameters"
    - Commit "test: add tests for sorting functionality"
* Merged PR #5 into #1

* Open PR #6 "feat/additional-response-fields"
    - Commit "feat: include additional fields (movie ID, category, title, director, price, viewers, created date) in response"
    - Commit "test: validate response fields in integration tests"
* Merged PR #6 into #1
```

### 3\. 작은 Code Change를 유지하기

한결님은 이를 약 400-500줄 정도로 유지하려고 하십니다. 1000줄 이하라면 큰 문제는 없습니다.  
<u>테스트코드는 필수적입니다</u>. 한결님이 작성하신 500줄의 코드 변경은 아래와 같이 구성됩니다.

* 100줄(20%): 기능 변경
* 400줄(80%): (최대한 많은) 테스트 코드

> 이러면 외부 클래스/함수 의존성 때문에 테스트가 실패하지 않나요?

(영상에서는 간략하게 언급하고 지나갔지만) 기능없는 빈 메서드를 만들고, '이후 기능이 구현되었을 때 이러한 모습이겠지.' 를 생각하고 테스트를 작성합니다.

## 상호 존중하지 않는 PR은 Moloco 수석 개발자도 어려워한다.

1,000줄의 코드를 한결님에게 보낸다면 한결님은 다음과 같이 말씀하신다고 합니다.

> 나는 너의 코드를 보고 문제없다고 말할 자신이 없다..  
> 너무 많은 Change를 한번에 넣었기 때문에.

Unit Test가 이미 많이 작성되어 있다면 이를 쪼개서 보내달라고 부탁합니다.

## 팀을 위한 좋은 습관

* 장주영: "상대의 시간을 존중하는 좋은 습관같다."
* 이한결: "그것도 맞지만, 이는 상호 존중이다. 내가 상대를 존중했을 때 <u>이 존중이 나에게 돌아올 확률이 크다.</u>"

## 마치며

주인공들의 이야기는 학생 개발자로서 배워가기 좋은 채널이다. 누구나 잘하고 싶은 욕구가 있지만 경험없이 노력만으로는 잘하기 힘든 것들이 있다. 프로 개발자들에게 이러한 경험을 배워갈 수 있다는 것 자체가 축복받은 사회다.

