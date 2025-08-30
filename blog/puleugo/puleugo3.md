---
authors: puleugo
date: Tue, 6 Jun 2023 17:27:55 +0900
---

# 크롬의 탭은 프로세스일까? 스레드일까?

![](https://blog.kakaocdn.net/dn/bA6mFa/btsiQIG4PmE/oOqwnAxmBGcVF9XknWSVrk/img.jpg)

NEXTERS의 면접 질문이었다.

### 서론

면접 질문으로 크롬의 탭은 프로세스인지 스레드인지, 그리고 왜 그렇게 생각하는지에 대해 질문이 왔다. 이 글에서는 브라우저가 탭을 어떻게 관리하는지, 그리고 왜 그렇게 관리하는지를 조사해보려구 한다.

![](https://blog.kakaocdn.net/dn/btKBwk/btsiOeGUnwC/oc1plZxAzCmAxmC1Vhthxk/img.png)

대부분의 브라우저가 크로미움 기반이다. Naver Whale또한 마찬가지.

고맙게도 Chrome Developer Blog에서 브라우저 관련 내부 동작 원리를 설명해주는 글이 있다.

이 글에서도 설명하겠지만, 자세한 내용은 아래 내용 참고.  
[웹 브라우저의 내부 살펴보기](https://developer.chrome.com/blog/inside-browser-part1/)

### 크롬의 탭은 프로세스다. (멀티 프로세스)

(나는 프로세스로 답했다가, 경량화 문제를 의심하고 멀티 스레드라고 답을 바꿨다.)

크롬은 멀티 프로세스를 사용하며 IPC(Inter Process Communication, 프로세스 간 통신)을 사용한다.  
만약, 특정 탭이 응답하지 않을 때는 **동작하지 않는 탭의 프로세스를 재시작 시켜버리는 방식**을 사용한다.

### 멀티 프로세스는 높은 성능을 요구하지만, 안정적이다.

멀티 프로세스는 무겁다. 다만 크롬 브라우저에서 이런 구조를 선택할 수 밖에 없었던 이유는 **웹 사이트를 개발자가 별도의 심사 없이 배포**하기 때문이다.

악성 개발자가 모든 공유자원의 주도권을 가진 상태로 죽어버린다면 문제가 발생할 수 있다.

이게 크롬이 메모리를 많이 사용하는 이유다. 크롬은 메모리 성능보다 **안정적이고 빠른 사용자 경험**을 선택한 것이다.

### 크롬의 프로세스 처리 방식

크롬은 크게 4가지의 프로세스를 사용한다.

[모든 프로세스는 여기를 읽어보세용.](https://developer.chrome.com/docs/extensions/reference/processes/#type-ProcessType)

|||
|:---:|:---:|
|**프로세스**|**프로세스의 제어영역**|
|브라우저 프로세스|탭 외부의 크롬 내장 기능(URL 표시줄, 북마크 바, 이전페이지, 다음 페이지 등)을 담당|
|렌더러 프로세스|탭 내부의 웹 사이트 표시되는 모든 것을 담당|
|플러그인 프로세스|웹 사이트에서 사용하는 플러그인(flash, PDF, media, music 등)을 담당.|
|CPU 프로세스|GPU 사용하는 부분은 해당 프로세스가 담당.|

아래는 예시입니다.

![](https://blog.kakaocdn.net/dn/AGHbV/btsiQkGfRB1/KKvE94DXsz6qKn8kxo66Vk/img.png)

위의 예시에서 말하는 것 처럼 브라우저의 **탭은 한 프로세스만 지니는게 아니라 여러개의 프로세스**를 지닌다.

### 탭의 핵심은 렌더러 프로세스. (iframe은 어떻게 처리할까요?)

그렇다면 브라우저에서 iframe은 어떻게 처리할까?

> iframe: 사이트 내부에 또 다른 웹 사이트를 삽입하는 것.

![](https://blog.kakaocdn.net/dn/dE56V1/btsiNbX3qHL/lk8vuyv7HMfC0MeyKEITj0/img.png)

이런 느낌..

크롬에서는 iframe을 어떻게 관리할까?

**동일 프로세스로 접근하면 브라우저 사용자의 개인 정보 등 취약한 정보에 접근할 수 있기 때문이다.**

브라우저는 이런 문제를 해결하기 위하여 iframe 별 [**동일 출처 정책**](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)과 [**사이트 별 렌더러 프로세스를 격리**](https://www.chromium.org/Home/chromium-security/site-isolation/)하여 통해 해결한다.

이런 이유때문에 우리가 CORS 문제를 겪기도 한다.

