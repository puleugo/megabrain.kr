---
authors: puleugo
date: Sun, 23 Jun 2024 16:29:22 +0900
---

# [번역] 개발자 중심 성능 테스트 선언문

## 소개

[https://k6.io/our-beliefs](https://k6.io/our-beliefs)

grafana사의 성능 테스트 툴인 k6의 공식문서에 포함되어 있는 내용입니다.  
성능 테스트에 관심이 있는 개발자 / 학생분들이 읽기 좋은 내용입니다.

저는 자료 번역을 할 때 직역하지 않습니다. 필요해 보이는 내용은 추가하고 불필요하다고 생각되는 내용은 지웁니다. 원래 글을 그대로 읽고 싶으시면 [원문](https://k6.io/our-beliefs)을 읽으시는 것을 추천합니다.

### 간단한 테스트가 테스트를 안하는것보단 낫다.

성능 테스트는 실제 클라이언트의 행동과 환경을 유사하게 모방하는 것이 좋습니다. 하지만 그것보다 중요한 것은 테스트를 수행하는 것입니다. [80:20 규칙](https://en.wikipedia.org/wiki/Pareto_principle)은 상위 20%의 작업만으로 80%의 가치를 얻을 수 있으며 간단한 테스트를 통해 개선하는 것이 아예 안 하는 것보다 훨씬 좋다는 것을 의미합니다. 작고 단순하게 시작하고 테스트로부터 무엇을 얻었는지 확인 후 클라이언트와 개선해 나가도 좋습니다. 다만 중요한 것은 클라이언트 환경과 100% 동일하지 않아도 됩니다. 충분히 목적을 달성했다고 느낄 때까지만 테스트를 작성하면 됩니다

서버 사양이 동일하지 않더라도 서비스의 병목지점 튜닝, 슬로우 쿼리 등을 개선하는 방향으로 사용할 수 있습니다.

실행할 수 있는 성능 테스트에는 크게 2가지 유형이 있습니다. 단위 성능 테스트(Unit Load Test)와 시나리오 성능 테스트(Scenario Load Test)입니다.

단위 성능 테스트는 API 엔드포인트 같은 단위의 상호작용 흐름을 테스트하기 위한 것입니다. 단일 API의 성능회귀(업데이트 변경된 경우 성능이 이전보다 저하된 경우) 알림, 특정 API의 상세한 성능 검증에서 주로 활용됩니다. 단위 성능 테스트는 시나리오 성능 테스트보다 훨씬 간단하므로 처음 간단하게 수행하다가 조금 더 클라이언트 환경과 동일하게 테스트하고 싶다고 생각되면 시나리오 성능 테스트를 고려해 보면 됩니다.

시나리오 성능 테스트는 실제 클라이언트의 상호작용 흐름을 테스트하기 위한 것입니다. 사용자가 로그인 후 일부 활동을 시작하고 작업을 요청하고 작업을 기다린 후 로그아웃합니다. URL/EndPoint에서는 실제 세계에서 볼 수 있는 것과 일치하는 트래픽 대상을 테스트하는 것입니다. 복잡하게 생각할 수도 있지만 단순히하게 말하면 여러 개의 단위 성능 테스트를 사용자의 시나리오에 맞게 임의의 순서대로 실행하는 것과 동일합니다.

```
import { check } from 'k6';
import http from 'k6/http';

// 로그인 API의 단위 성능 테스트
export function testLogin(params) {
  let data = params || { username: 'admin', password: 'test' };
  http.post('http://demo.loadimpact.com/login', data);
}

export default function () {
  testLogin();
}
```

```
import { group } from 'k6';
import { testLogin } from 'units/login';

let users = open('users.csv');

// 로그인이라는 동작의 시나리오 성능 테스트
export default function () {
  group('Login', function () {
    let user = users.getRandom();
    testLogin({ username: user.username, password: user.password });
  });
}
```

### 성능 테스트는 목표지향적이어야 한다.

성공적인 성능 테스트를 위해서는 목표가 필요합니다. 테스트할 공식 [SLA](https://aws.amazon.com/ko/what-is/service-level-agreement/)(*고객과 계약했던 최소 성능 등*)가 있을 수도 있고 API, 앱, 사이트가 빠르게 응답하기라는 목표가 있을 수 있습니다. ([Jakob Nielsen은 100ms정도는 되야한다고 함](https://www.nngroup.com/articles/website-response-times/)). 페이지 로딩을 기다렸던 경험을 떠올려보면 끔찍합니다.

성능 목표는 중요합니다. 예를 들면 API의 최소 응답시간/요청 실패율 등이 있습니다.

코드에서는 [검증(check)](https://k6.io/docs/using-k6/checks/)와 [임계값(thresholds)](https://k6.io/docs/using-k6/thresholds/)을 활용하여 구현할 수 있습니다.

```
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  thresholds: { // 요청 중 95%가 100ms 이하여야 함(조건 미충족 시 테스트 실패).
    'http_req_duration{url:http://demo.loadimpact.com/login}': ['p95<100'],
  },
};

export function testLogin(params) {
  let data = params || { username: 'admin', password: 'test' };
  let res = http.post('http://demo.loadimpact.com/login', data);
  check(res, { // http response의 상태코드가 200이여야 함(조건 미충족 시 기록). 
    'is status 200': (r) => r.status === 200,
  });
}

export default function () {
  testLogin();
}
```

이후에는 환경 설정, 자동화에 대한 팁정도라 링크만 첨부합니다.

* [성능 테스트 자동화](https://k6.io/docs/testing-guides/automated-performance-testing/)
* [예제](https://grafana.com/docs/k6/latest/examples/)

