---
authors: puleugo
date: Tue, 23 Jan 2024 15:03:27 +0900
---

# Assert를 통해 좋은 코드 작성하기

## 서론

최근 Github에서 코드를 살펴보던 중 [assert 키워드](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.10)의 존재를 알았습니다. 학교에서는 들어보지도 못한 키워드였지만 assert만의 장점이 굉장히 매력적이어서 한번 글로 남겨보고자합니다

예시 코드는 Java로 작성하겠습니다.

## 본론

### Assert란 무엇인가?

assert는 대부분의 언어에 존재하는 코드가 올바르게 동작하는지를 확인하는 용도의 키워드입니다.

assert는 '표명하다'라는 의미로 조건(condition)과 함께 사용할 수 있습니다.

런타임 중에 Assert 키워드를 만나면 condition을 확인합니다. true이면 다음 라인으로 넘어가고 false라면 AssertError를 발생시킵니다.

### Assert의 장점이 무엇인가?

Assert를 사용하지 않아도 if를 활용하여 충분히 올바르게 동작하는지 확인할 수 있습니다.

```
Connection conn = getConnection();
if(conn == null) {
    throw new RuntimeException("Connection is null");
}
```

아래는 assert를 사용한 코드입니다.

```
Connection conn = getConnection();
assert conn != null : "Connection is null";
```

assert는 조건이 false라면 아래와 같이 에러를 발생시킵니다.

```
Exception in thread "main" java.lang.AssertionError: Connection is null
        at com.baeldung.assertion.Assertion.setup(Assertion.java:15)
        at com.baeldung.assertion.Assertion.main(Assertion.java:10)
```

if문과 비교했을때의 assert의 장점은 다음과 같습니다.

1. 코드의 복잡도를 낮춥니다.
2. 코드 가독성이 향상됩니다. 주석을 쓰지 않아도 됩니다.
3. 빌드 속도 및 메모리가 절약됩니다.

개발자는 assert가 항상 true라고 생각하고 생각하고 코드를 작성합니다. 이는 if-else와 같이 여러 중첩된 조건을 기억하고 있을 필요가 없어서 코드의 복잡도를 낮추고 코드의 요구사항을 명시하여 코드 가독성도 향상됩니다.

또한 기본적으로 언어에서는 Assert가 제거된 상태로 빌드됩니다. java에서는 enable assert라는 의미의 -ea 옵션으로 설정할 수 있습니다.

자주 언급되는 테스트보다 간단하고 테스트 전에 어느정도의 에러를 잡을 수 있는 방법입니다.

### Assert는 왜 프로덕션에 포함되면 안되나요?

Assert가 프로덕션에 포함되지 않는 것은 핵심 특징입니다. Assert가 프로덕션에 포함된다면 성능 하락의 문제로 개발자가 Assert를 마음껏 사용할 수 없습니다. 또한, 프로덕션에 포함되면 if문을 통해 처리하는 것과 차이점이 사라집니다.

만약 조건문이 더 가독성이 좋다고 생각하며 성능하락이 크게 문제되지 않는다고 생각하시면 굳이 Assert를 사용할 이유가 없습니다.

요즘 핫한 Nest.js에서는 Typescript의 정적 타입 체킹을 수행하기 때문에 굳이 Assert를 사용하지 않아도 어느정도 검증이 됩니다. 다만 DB url, env 값 등 정적이지 않은 요소들은 Assert를 사용할 수 있습니다.

## 그 외 읽어보면 좋은 글

* [Design by contract](https://en.wikipedia.org/wiki/Design_by_contract)
* [Using Java Assertions](https://www.baeldung.com/java-assert)

