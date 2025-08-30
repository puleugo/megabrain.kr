---
authors: puleugo
date: Wed, 23 Aug 2023 19:12:21 +0900
---

# [NestJS] eslint를 작성해보자.

eslint 수정을 결심하게 된 계기

기존의 eslint는 프론트 중심적으로 작성되어있거나, git diff 리딩에 불편하게 되어있어요.

## 개요

* **tab indent를 4로 변경했어요.**  
  javascript는 tab indent를 2로 권장하지만, 백엔드에서는 early return 패턴을 사용하기 때문에 tab depth가 깊어질 일이 없어요.  
  코드 가독성은 향상시키고 node.js 특유의 코드 편집기 우측이 텅텅 비어있는 것을 해결했어요.
* **array, object 구조를 설정했어요.**  
  백엔드는 array, object가 길어질 경우가 많은데, 이런 경우 예외처리가 되어있지 않아요.  
  eslint 기능을 사용하여 제약을 걸어 해결했어요.
* **그 외도 코드리딩을 고려해서 작성했어요.**  
  git diff를 읽을 때 온점이나 쉼표 혹은 괄호들을 eslint가 제약이 없어서 불필요한 diff가 생겨요.  
  강제로
* **prettier를 삭제했어요.**  
  하는 역할도 비슷하고 굳이 둘을 함께 사용했을 때의 이점이 없어서 prettier를 삭제하고,  
  eslint만을 사용해서 모든 코딩 컨벤션을 맞췄어요.

## 필수

```
npm install --save-dev eslint @eslint/js @types/eslint__js typescript typescript-eslint
```

## ESLint Gist

## 적용 예시

![](https://blog.kakaocdn.net/dn/3Euz2/btsr5hfNOKs/I4QLFgjXtubf7SQ7XfBYyK/img.png)

![](https://blog.kakaocdn.net/dn/F73IK/btsr0WpJFNa/niqd8tR1IGLODIUAU3FSW0/img.png)

## 적용 방법

자동 적용하지 마시고, .eslintrc.js로 변경하세요.  
아직 webstorm은 .eslintrc.js를 자동으로 못찾아줍니다.

1. eslint 기본 설정을 적용
2. prettier 적용
3. nest.js에서의 lint 설정과 맞지 않기 때문에 한번 더 실행 시 eslint 적용

총 3회를 수행하기 때문에 린트 적용이 느려집니다.

또한, linting 파일도 .ts만 수행하도록 변경하세요.

![](https://blog.kakaocdn.net/dn/bH6kVA/btsr0s3xkpf/nVuv9d1KSS225eaPI48QO1/img.png)

