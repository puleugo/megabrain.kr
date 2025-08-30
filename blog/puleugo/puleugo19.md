---
authors: puleugo
date: Mon, 8 Apr 2024 03:32:38 +0900
---

# [개발자 셋업 공유] 집에서 누워서 코딩하기

![](https://blog.kakaocdn.net/dn/cWhJTJ/btsGtT56nOn/X7Jp5WcDmyXbhiMDrkYi90/img.png)

> 마지막 업데이트: 2024.04.08  
> 쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.

## 도입

최근 집에 저만의 코딩 환경을 구축하여서 이를 글로 한번 남겨보려고 합니다. 혹시나 개인 코딩 환경 세팅에 관심이 있으시다면 참고해보시는 것도 추천드리며 세팅에 진심이신분이 계시면 댓글로 공유해주시면 감사하겠습니다.

## 개요

* 가벼운 M1 PRO 사용
* 침대 위 노트북을 둘 수 있는 노트북 거치대
* 눈뽕 방지용 블루라이트, Dark Reader를 활용
* 위와 같은 이유로 키보드 라이트 끔
* 팔에 피쏠릴까봐 블루투스 키보드를 활용
* 마우스 제로를 위해 vim 설정 애용. (ide, chrome은 vim만으로 사용)
* 위와 같은 이유로 github 등 환경에서 명령어 지향
* 목 건강을 위한 라텍스 베게

상세한 설명이 들어갈 수 있는 것들을 아래에 추가로 적겠습니다.

### 노트북 거치대 선택

제가 사용하고 있는 거치대는 [다음](https://www.coupang.com/vp/products/77828617)과 같습니다.

[무한상사 파이프데스크 누워서보는 베드테이블 독서대

COUPANG

www.coupang.com](https://www.coupang.com/vp/products/77828617)

구매 후 불만은 없지만 조금 더 저렴한 모델과 비교했을때 거치대에 키보드를 두고 타이핑을 하려고 더 단단히 잡아주는 모델을 선택했었습니다. 하지만 노트북에 직접 타이핑은 현실적으로 불가능합니다. 팔에 피가 안통해요. 결국 누워서 장기적으로 작업하려면 블루투스 키보드를 필연적으로 선택할 수 밖에 없습니다.

때문에 조금 더 [저렴한 모델](https://link.coupang.com/a/bw0UmN)을 추천드립니다.

[스파인데스크 360도 각도조절 노트북받침대

COUPANG

www.coupang.com](https://link.coupang.com/a/bw0UmN)

두 모델 리뷰 [영상](https://youtu.be/43-L6gmrWcM?si=K9d_1kSi6I7ECGLK)이 있어서 참고했었습니다.

### 눈뽕 방지용 플러그인 추천

우선 ide 다크모드 설정은 기본입니다.  
이 항목에서 추천드리는 것은 [Dark Reader](https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh?hl=ko)라는 크롬 확장 플러그인을 추천드립니다. 저같이 다크모드에 환장하는 사람들 중에는 이미 유명한 플러그인입니다. 크롬으로 접속하는 모든 페이지에 색반전을 통해 다크모드로 바꿔버립니다.

![](https://blog.kakaocdn.net/dn/d6oOyk/btsGqVjEh54/Xk9n3vI87Cd7LD3imavWv1/img.png)

위 같은 느낌으로 티스토리 글 작성 페이지는 다크모드를 지원하지 않음에도 나름 봐줄만 하게 플러그인이 바꿔줍니다.

여기서 잘 안보이는 "ui는 어떻게 클릭하나요?"는 다음 항목에서 다루겠습니다.

### Vim과 short cut 사용

Vim은 마우스 없이 작업을 하기에 아주 적절한 기능입니다. 당연하게도 크롬 확장 플러그인에 [Vimium(vim + chromium)](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb)이 존재합니다. Vimium을 사용하면 다음과 같이 크롬을 활용 할 수 있습니다.

![](https://blog.kakaocdn.net/dn/bWnJ73/btsGqPqkyI1/BUKd8dLHmOckJUiHZM6190/img.png)

모든 인터랙트를 키보드로 할 수 있게 도와줍니다. 이는 ide에서 아주 환상적으로 작업할 수 있습니다.

![](https://blog.kakaocdn.net/dn/b7EwNQ/btsGsW2WAbH/LgcSK0u5KvXpfcyPFzCGyK/img.gif)![](https://blog.kakaocdn.net/dn/p2WSS/btsGqKQcWWH/DlnP0k58KQstJHNGJ3OpjK/img.gif)

vsc, jetbrain ide 전부 vim 플러그인을 제공하니 관심 있으시면 찾아보시는 것을 추천합니다.

![](https://blog.kakaocdn.net/dn/weczt/btsGqxXMOOl/50D5hRSCK5mNQHJKErBg01/img.png)

vim shortcut이 너무 어렵다 싶으면 작업하는 도구의 shortcut을 쓰는 것도 좋습니다!

### 블루투스 키보드

현재 키보드는 Keychron K3를 사용하고 있습니다. 장점은 mac, window 변경이 자유롭고 키보드 하나에 여러 기기를 연결하고 스위칭도 자유롭습니다.

다만 제 환경에서의 문제는 키보드가 생각보다 가벼워서 *타이핑할 때마다 흔들립니다*. 허리 위에 키보드를 두고 타이핑 중인데 이는 해결할 문제를 찾아봐야겠습니다. 키보드에 대한 지식은 부족하여 링크 첨부는 하지 않았습니다.

### 베게 추천

베게는 [라텍스 베게](https://link.coupang.com/a/bw0YqY)를 추천합니다. 목 옆 근육에 문제가 생겼던 적이 있는데 그 때 라텍스 베게로 변경하고 나서 꽤나 만족하고 있습니다.  
다만 제 세팅 환경에서는 베게가 좀 높은건지 오래 누워있으면 *목이 좀 뻐근합니다*. 뻐근할때마다 베게를 빼주면 좀 좋습니다.

[엔씨엘 천연라텍스 굴곡형 베개 XL + 속커버

COUPANG

www.coupang.com](https://link.coupang.com/a/bw0YqY)

