---
authors: puleugo
date: Mon, 29 Jul 2024 12:00:55 +0900
---

# [번역] Mocks Aren't Stubs | Classicist vs Mockist

## 서론

* Classicist와 Mockist 방식의 테스트 방식, 사고방식의 차이가 정리된 글입니다.
* 본 글은 대표적인 Classicist TDDer인 martinfowler의 'Mocks Aren't Stubs(2007)'의 글을 기반으로 두고 있습니다.
* 본문의 예제는 TypeScript(with Jest)의 스타일로 코드를 작성했습니다.  
  원문은 Java(with JUnit)로 되어있으니 읽기 편하신 예제로 읽으시면 됩니다.

## 기본적인 테스트 살펴보기

* Order(주문), WareHouse(창고) 객체를 사용하는 <u>주문 시스템 예제</u>입니다.
* Order를 테스트하는 코드입니다.
* 하지만 <u>order.fill 메서드를 테스트하려면 WareHouse의 인스턴스를 필요</u>로 합니다.
* 기존 테스트 방식(Classicist)과 Mock 객체를 사용하는 테스트(Mockist) 방식의 예제가 각각 제공됩니다.

다음 예제에서 Order처럼 테스트하고자 하는 객체를 이를 테스트 대상 객체(object-under-test) 혹은 테스트 대상 시스템(<u>SUT</u>, system-under-test)이라고 부릅니다. (*본 글에서는 SUT이라고 부르겠습니다.*)

## 기존의 테스트(Classicist 방식)

```
import {beforeEach, expect, test} from "@jest/globals";
import {WareHouse} from "./wareHouse";
import {Order} from "./order";

const COCA_COLA = '코카콜라'
const warehouse = new WareHouse();

beforeEach(()=> {
	warehouse.add(COCA_COLA, 10);
})

test('창고에서 재고가 충분할 시 주문을 채운다.',() => {
	const order = new Order(COCA_COLA, 10);
	order.fill(warehouse);
	expect(order.isFilled).toBeTruthy();
	expect(warehouse.get(COCA_COLA)).toBe(0);
})

test('창고에 재고가 불충분할 시 주문을 채우지 않는다.',() => {
	const order = new Order(COCA_COLA, 11);
	order.fill(warehouse);
	expect(order.isFilled).toBeFalsy();
	expect(warehouse.get(COCA_COLA)).toBe(10);
})
```

위 클래식 테스트코드를 Mock 객체를 사용하는 방식으로 변경하면 다음과 같습니다.

### Mock을 활용한 테스트(Mockist 방식)

```
import {expect, jest, test} from "@jest/globals";
import {WareHouse} from "./wareHouse";
import {Order} from "./order";

const COCA_COLA = '코카콜라'

test('창고에서 재고가 충분할 시 주문을 채운다.',() => {
	// given - 데이터
	const order = new Order(COCA_COLA, 10);
	let warehouse: WareHouse;

	// given - 기대치,   추가됨
	warehouse= {
		pop: jest.fn((item: string, count: number)  => (item === COCA_COLA && count === 10) ? 10 : 0),
		get: jest.fn((item: string)  => (item === COCA_COLA) ? 10 : 0),
	} as unknown as WareHouse;

	// when
	order.fill(warehouse);

	// then
	expect(order.isFilled).toBeTruthy();
	// expect(warehouse.get(COCA_COLA)).toBe(0); ❌ 삭제됨
})

test('창고에 재고가 불충분할 시 주문을 채우지 않는다.',() => {
	const order = new Order(COCA_COLA, 11);
	const warehouse= { //   추가됨
		get: jest.fn().mockReturnValue(0),
	} as unknown as WareHouse;


	order.fill(warehouse);

	expect(order.isFilled).toBeFalsy();
	// expect(warehouse.get(COCA_COLA)).toBe(11); ❌ 삭제됨
})
```

## 살펴보기

SUT(= Order)의 준비단계의 검증단계는 동일합니다. <u>차이점은 협력자인 WareHouse 객체</u>에 있습니다:

1. 실제 객체처럼 동작하는 메서드를 주입받아 사용합니다. 동작은 실제 WareHouse와 동일합니다.
2. mockist 방식에서는 wareHouse의 상태를 확인하지 않습니다.

<u>Mockist방식의 약점은 Mock한 메서드가 변경에 취약하는 점</u>입니다. 이를 고려하여 Mockist 예제 2번째의 기대치 처럼 인자를 받지 않는mockReturnValue 방식으로 설계하면 메서드 변경 시의 마이그레이션이 쉬워집니다.  
mockImplement를 사용하지 않는 이유는 변경에 아주 취약하기 때문입니다. Order의 간단한 논리를 변경하더라도 하나의 케이스만 실패하므로 <u>메서드 하나 변경하는데에 수천개의 테스트를 고쳐야하는 사고를 예방</u>할 수 있습니다.

## Mock vs Stub

Mock과 Stub의 차이점을 이해하려면 Mock, Stub을 일컫는 개념인 **테스트더블**을 이해하는 것이 중요합니다. (*테스트더블을 처음들어도 괜찮습니다.*)

테스트를 하는 경우에는 테스트하고자 하는 단일 요소(이후 SUT)에 집중하게 됩니다. 문제는 단위테스트를 수행하려면 SUT가 의존하는 다른 단위(이후 협력자)도 필요하다는 것입니다. 이전 예제에서는 창고 클래스였습니다. <u>이 "협력자"를 처리하는 방식을 바로 테스트더블이라고 부릅니다.</u>

테스트 더블이란 <u>테스트를 목적으로 실제 물체 대신 사용되는 모든 종류의 가짜 물체</u>를 말합니다.([WIkipedia](https://en.wikipedia.org/wiki/Test_double))  
어원은 영화 제작계에서 사용되는 용어인 스턴트 장면에서 실제 배우를 대신하여 활동하는 개념인 [스턴트 더블](https://en.m.wikipedia.org/w/index.php?title=Double_(occupation)&diffonly=true#Stunt_double)입니다. 그리고 크게 5가지의 테스트더블 개념이 존재합니다.  
(본 글은 테스트더블이 본 주제가 아니기 때문에 간략하게 정리만하고 넘어갑니다.)

* Dummy: 테스트하는 인터페이스에 필요하지만 테스트케이스에서 사용되지 않는 값.
* Fake: 실제 객체와 동일하게 작동하지만 더 간단한 구현을 사용합니다. 예를 들어 실제 데이터베이스를 대체하는 인메모리 데이터베이스.
* Spy: 테스트 대상으로부터 "미리 정해진 답변"을 검증하기 위해서 사용한다. 결과, 호출 정보를 기록해 두는 것으로 테스트 코드 실행 후 값을 얻어 검증할 수 있다.
* Stub: 테스트 대상에 "미리 정해진 답변"을 <u>제공</u>하는 데 사용 (아직 협력자가 구현되지 않은 경우 사용)
* Mock: 테스트 대상으로부터 "미리 정해진 답변"을 <u>검증</u>하기 위해서 사용합니다. 테스트코드를 실행하기 전에, 미리 기대하는 결과를 설정해 둔다. 검증은 객체 내부에서 행해진다.

테스트 더블 중에서 Mock만이 <u>동작 검증</u>을 고집합니다. 다른 더블은 상태 검증을 사용할 수 있고 보통 그렇게 합니다. Mock 더블은 실제로 when 단계에서 다른 더블처럼 동작하는데, SUT가 실제 협력자와 소통하고 있는 것처럼 흉내(Mock)내야하기 때문입니다. 하지만 모의 더블은 준비 단계와 검증 단계는 다릅니다.

테스트 더블을 더 이해하기 위해서 예제를 확장해보겠습니다. 많은 사람이 실제 객체가 작업하기 어려울 때만 테스트 더블을 사용하려하는 경향이 있습니다. 테스트 더블의 더 일반적인 사례는 <u>주문을 이행하지 못했을 때 이메일을 보내는 경우</u>입니다. 테스트할 때 마다 고객에게 테스트 이메일을 보낼 수는 없으니 이런 경우에 테스트 더블로 만들어서 이를 제어 조작하면 됩니다.

드디어 Mock과 Stub의 차이를 코드로 살펴보겠습니다. 메일링 서비스의 동작에 대한 테스트를 작성한다면 우리는 다음과 같은 간단한 Stub을 작성할 수 있습니다.

### 더블로 만들어야하는 협력자

```
export interface MailService {
	send(message: Message): void
}

export class MailServiceStub implements MailService {
	private messages: Message[] = [];

	send(message: Message): void {
		this.messages.push(message);
	}

	get sentCount(): number {
		return this.messages.length;
	}
}
```

이런 요구사항을 Stub과 Mock으로 표현하면 이렇게 됩니다.

### **Stub**

```
// stub
test('창고에 재고가 불충분할 시 메일을 발송한다.',() => {
	const order = new Order(COCA_COLA, 11);
	const warehouse = new WareHouse();
	const mailer = new MailServiceStub();

	order.mailer = mailer;

	order.fill(warehouse);

	expect(order.isFilled).toBeFalsy();
	expect(mailer.sentCount).toBe(1); // ✅상태 검증: 보낸 횟수가 1인가?
})
```

### **Mock**

```
// mock
test('창고에 재고가 불충분할 시 메일을 발송한다.',() => {
	const order = new Order(COCA_COLA, 11);
	const warehouse= {
		get: jest.fn().mockReturnValue(0),
	} as unknown as WareHouse;

	const mailer = {
		send: jest.fn(),
	} as unknown as MailService;

	order.mailer = mailer;

	order.fill(warehouse);

	expect(order.isFilled).toBeFalsy();
	expect(mailer.send).toBeCalledTimes(1); // ✅동작 검증: 1번 이상 수행했는가?
})
```

두 테스트케이스 모두 테스트 더블을 사용하지만, <u>Stub은 상태 검증</u>을 사용하는 반면 <u>Mock은 동작 검증</u>을 수행합니다.

Stub 방식을 통해 상태 검증을 사용하려면 검증을 위한 추가메서드를 만들어야 합니다. 그 결과 **Stub은 MailService를 구현하지만 sentCount()라는 추가 메서드를 구현합니다.**

Mock 객체는 무조건 동작 검증을 수행하고, Stub은 양쪽 다 가능합니다. 동작검증을 하는 Stub인 Test Spy도 존재합니다. 차이점은 '<u>더블이 정확히 어떻게 실행되고 검증되는가</u>'에 있습니다.

### Classicist와 Mockist 테스트

이분법적으로 나누었지만 Classicist/Mockist냐보다는 '**언제 어떤 더블을 사용하는가**'가 핵심 문제입니다.

Classicist TDD 스타일은 **가능하면 실체 객체를 사용하고 사용하기 불편한 상황이면 더블을 사용하는 스타일**입니다. 지금까지 봐왔던 예제들에서 Classicist는 실제 창고와 메일서비스 스텁을 사용했습니다. 더블의 종류는 크게 중요하지 않습니다.

그러나 Mockist TDD 실무자들은 **흥미로운 행동을 보이는 모든 객체에 대해 항상 Mock을 사용**합니다. 이 경우에는 창고, 메일서비스 모두 Mock을 사용했습니다.

---

## Classicist와 Mokcist의 살펴볼 요소

## 그래서 어쩌라고..?

지금까지 2가지 차이점을 꾸준히 언급했습니다.

1. 상태 검증과 동작 검증
2. Classicist와 Mockist

위 두가지 중 하나를 선택할 때 염두해놔야할 주장은 무엇일까요

### 상태 검증 vs 동작 검증

가장 먼저 고려해야하는 것은 <u>맥락</u>입니다. 실제 프로젝트에서 주문과 창고같은 쉬운 협업자도 존재하지만 우편서비스 같이 까다로운 협업자도 존재합니다.

<u>구현하기 쉬운 협업자</u>라면 선택은 다음과 같습니다:

* Classicist: 실제 객체와 상태 검증을 사용하면 됩니다.
* Mockist: Mock과 동작검증을 사용합니다.

<u>구현하기 까다로운 협업자</u>의 경우 선택은 다음과 같습니다:

* Classicist: 모든 더블 중 가장 적절한 것을 골라 사용합니다.
* Mockist:Mock과 동작검증을 사용합니다.

애초에 '상태검증이냐 동작검증이냐'는 어려운 선택지가 아닙니다. 오히려 자연스럽게 따라오는 것에 가깝습니다. 문제는 Classicist와 Mockist TDD에 있습니다. 이 선택지가 결국 상태검증과 동작검증을 선택하게 됩니다. 그 전에 Classicist에게 <u>어려운 케이스의 협업자도 생각해봅시다.</u>

### 진짜 어려운 협력자. 캐시

캐시의 중요한 점은 상태검증을 통해 캐시가 호출됐는지 상태를 통해 알 수 없다는 것입니다. 이 경우에 극단적인 Classicist라도 행동 검증을 사용하는 것이 현명한 선택입니다. 다 스타일 모두 예외의 케이스가 존재합니다.

이제 드디어 Classicist와 Mockist가 고려할 요소를 살펴봅시다.

### Classicist vs Mockist

#### TDD에 적용되는 방식

**TDD 개발자들은 설계를 중요시 합니다**. 시스템의 설계는 테스트 작성을 반복하며 진화한다는 생각이 TDD 유저들의 신념이기 때문입니다. 그런데 Mockist들은 이를 특히 더 중요시합니다. Mockist Testing의 근본이 TDD의 부모격인 [XP(Extreme Programming, TDD와 애자일 관련 프로그래밍 기법)](https://ko.wikipedia.org/wiki/%EC%9D%B5%EC%8A%A4%ED%8A%B8%EB%A6%BC_%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D) 커뮤니티이기 때문입니다.

따라서 **Mockist들이 특히 Mockist 테스트가 설계에 미치는 영향에 대해 중요하게 생각합니다**. 특히 [행위 주도 개발(BDD)](https://en.wikipedia.org/wiki/Behavior-driven_development)이라는 스타일을 옹호합니다. 이 스타일에서는 시스템 외부에 대한 첫번째 테스트를 작성하여 [사용자의 스토리](https://martinfowler.com/bliki/UserStory.html)를 개발하기 시작하고 일부 인터페이스는 SUT으로 만듭니다. SUT와 이웃 간 상호 작용을 찾아가며 SUT이 필요로 하는 <u>협력자의 인터페이스를 효과적으로 설계</u>할 수 있습니다. 이는 곧 오버엔지니어링을 예방하는 좋은 방식입니다.

첫 번째 테스트를 실행하면 각 Mockist 테스트에 대한 **기대치가 다음 단계에 대한 사양과 테스트의 시작점을 제공**합니다. 각 기대치를 협력자에 대한 테스트로 전환하고 이 과정을 반복합니다. 한 번에 한 SUT씩 시스템으로 작업하는 과정을 반복합니다. 이 스타일을 outside-in라고 부릅니다.(아주 명확한 네이밍입니다.) 계층화된 시스템에서 잘 작동합니다. 먼저 아래의 Mock 계층을 사용하여 UI를 프로그래밍합니다. 이후 다음 하위 계층에 대한 테스트를 작성하여 한번에 한 계층씩 시스템을 점진적으로 살펴봅니다. <u>이는 매우 체계적이고 관리가능한 접근 방식입니다.</u>

Classicist는 이와 같은 지침을 제공하지 않습니다. Mock대신 Stub된 메서드를 사용하여 유사한 순서의 접근방식을 사용할 수는 있습니다. SUT이 협력자로부터 무언가 필요할 때마다 원하는 응답을 하드코딩하는 방식입니다. 이후 익숙해지면 이를 적절한 코드로 변경합니다.

위 방식이 번거로우면 middle-out(중간에서부터 시작) 방식을 사용할 수 있습니다. 이 방식에서는 특정 기능을 가져와서 이 기능이 작동하도록 도메인에서 무엇이 필요한지 결정합니다. 도메인 객체가 필요한 작업을 시작하고 동작하기 시작하면 그때부터 UI를 계층화합니다. 이렇게하면 아무것도 가짜로 만들 필요가 없을 수도 있습니다. 이 방식이 인기가 많은 이유는 먼저 도메인 모델에 집중하여 도메인 로직이 UI로 세어나가는 것을 방지하기 때문입니다.

#### Fixture 준비하기

Classicist에서는 SUT뿐만 아니라 SUT의 테스트에 필요한 협력자도 만들어야합니다. 이전 예시에서는 객체가 몇개 뿐이었지만 프로덕션의 테스트의 경우 더 많은 협력자가 존재할 것입니다. 이러한 협력자의 객체들은 각 테스트를 실행할 때마다 생성 및 삭제될 것입니다.

그러나 Mockist는 SUT와 협력자의 모의 테스트만 구현하면됩니다. Mockist의 경우에는 복잡한 Fixture를 만드는 데 필요한 대다수의 작업을 피할 수 있습니다. 혹시라도 Mockist 설정이 어렵다면 도구를 제대로 사용하고 있는 지 검토해볼 필요가 있습니다.

실제로 Classicist들은 복잡한 객체의 Fixture를 재사용하려고 합니다. 가장 간단한 방식은 픽스처의 설정 코드를 테스트 라이브러리의 메서드에 넣는 것입니다.(Jest의 경우 BeforeEach/All, AfterEach/All) 더 복잡한 Fixture의 경우 여러 테스트에서 필요하므로 조금 더 효율적인 Fixture 생성 클래스를 필요로 합니다. 이를 [ObjectMother](https://martinfowler.com/bliki/ObjectMother.html)라고 부릅니다. 대규모 Classicist 테스트라면 Mother을 사용하는 것은 필수적이지만, Mother는 유저보수를 해야하는 추가 코드이며 Mother에 대한 모든 변경사항은 테스트 전체에 상당한 영향을 끼칩니다. 또한 Fixture를 삽입하는 데 성능 비용이 발생할 수 있지만 제대로 수행하면 심각한 문제는 발생하지 않을 것입니다. 대부분의 Fixture 객체는 제작 비용이 저렴하지만 그렇지 않은 객체는 일반적으로 더블을 사용합니다.

그 결과 두 방식 모두 상대쪽이 너무 많은 작업이라고 불평합니다. Mockist들은 Fixture를 만드는 것에 시간이 많이 소요된다고 말하지만 Classicist들은 재사용되지만 Mock이 매 테스트마다 작성해야한다며 불평합니다.

#### 테스트 격리하기

Mockist 테스트로 시스템을 관리중일 때 버그가 생기면 <u>버그가 발생한 SUT의 테스트만 실패</u>합니다. 그러나 Classicist 방식을 사용하면 <u>클라이언트 객체에 대한 모든 테스트가 실패</u>할 수 있으며, 버그가 있는 객체가 다른 객체의 테스트에서 협력자로 사용되는 경우 실패로 이어집니다. 결과적으로 많이 사용되는 객체에서 문제가 발생하면 시스템 전체에서 테스트가 실패하게됩니다.

**Mockist들은 이를 주된 문제점이라고 말합니다.** 오류의 근원을 찾고 해결하기 위해 많은 디버깅이 필요하다고 말이죠. 그러나 Classicist들은 이를 문제라고 생각하지 않습니다. 일반적으로 실패하는 테스트케이스에서 공통적으로 사용되는 객체가 범인이라고 유추할 수 있으므로 어떤 실패케이스에서 개발자의 실수가 발생했는 지 알 수 있습니다. 또한 정기적으로 테스트하는 경우 마지막으로 편집한 부분의 영향으로 문제가 발생했음을 알 수 있으므로 문제를 찾는 것은 그렇게 어렵지 않습니다.

위 문제는 <u>테스트의 세분성</u>에 있습니다. Classic 테스트는 여러개의 실제 객체를 실행하기 때문에 종종 하나의 테스트 객체 클러스터(관련 객체들의 그룹)에 대한 기본 테스트로 사용되는 경우가 많습니다. 클러스터가 여러 객체에 거려 있는 경우 버그의 실제 소스를 찾는 것은 훨씬 더 어려울 수 있습니다. 여기서 발생하는 것은 테스트가 너무 거칠다는 것(테스트가 큰 단위로 이루어져 있음.)입니다.

Mockist 테스트는 이 문제로 인해 어려움을 겪은 가능성이 낮습니다. 관례적으로 고유 객체를 제외한 모든 객체를 Mock하는 것이기 때문에 협력자에게는 더 세분화된 테스트가 필요하다는 것이 분명하기 때문입니다. 그렇기에 **지나치게 거친 테스트를 사용한다고 해서 반드시 기술로서의 Classicist 테스트가 실패한 것은 아니며 오히려 Classicist 테스트를 제대로 수행하지 못한 것입니다.** 이를 해결하기 위한 좋은 방식은 모든 클래스에 대해 세분화된 테스트를 분리하는 것입니다. 클러스터가 때로는 합리적일 수도 있지만 아주 적은 객체로만 제한해야합니다. 6개를 넘으면 안됩니다. 또한 지나치게 거친 테스트로 인해 디버깅 문제가 발생하는 경우 테스트 중심 방식으로 디버깅하고 진행하면서 세분화된 테스트를 만들어야 합니다.

본질적으로 **Classicist 테스트는 단위테스트이면서 동시에 미니 통합 테스트**이기도 합니다. 그 결과로 많은 사람들이 클라이언트 테스트가 객체에 대한 주요 테스트에서 놓친 오류, 특히 클래스가 상호작용하는 영역의 오류를 잡을 수 있다는 부분이 장점입니다. Mockist 테스트는 이 부분의 퀄리티를 잃습니다. 또한 Mockist 테스트는 Mock의 기대치를 잘못 입력하여 테스트가 성공으로 표시되지만 <u>내부적으로 오류를 가지고 있는 단위 테스트가 생길 위험</u>도 있습니다.

이 시점에서 강조하는 것은 <u>어떤 유형의 테스트를 사용하던 시스템 전체에서 작동하는 세분화된 인수 테스트와 적용해야 한다</u>는 것입니다. 인수 테스트 늦게 적용하고 후회하는 프로젝트를 자주 봐왔습니다.

#### 구현에 의존하는 테스트

Mockist 테스트를 작성할 때는 SUT의 아웃바운드 호출을 테스트하여 협력자와 제대로 통신하는지 확인합니다. Classicist 테스트는 최종 상태에만 관심있고 그 상태가 어떻게 만들어졌는 지는 신경쓰지 않습니다. 따라서 Mockist 방식은 비교적 메서드 구현에 더 의존하게됩니다. **협력자에 대한 호출의 특성을 변경하면 일반적으로 Mockist 테스트가 실패할 것입니다.**

이러한 의존은 우려사항입니다. 중요한 것은 테스트 주도 개발(TDD)에 미치는 영향입니다. <u>Mockist 테스트의 경우 테스트를 작성하면서 동작의 구현에 대해 생각하게 됩니다</u>. 실제 Mockist 테스터들은 이를 장점으로 보기도 합니다. 그러나 <u>Classicist들은 외부 인터페이스에서 발생하는 일에 대해서만 생각하고 구현에 대한 모든 고려사항은 테스트 작성을 마친 후에 생각하는 것이 옳다고 생각</u>합니다.

구현에 대한 의존은 리팩터링을 방해하기도 하는데, **구현내용이 변경되면 구현내용이 변경되면 Mockist 테스트가 훨씬 실패할 가능성이 높기 때문**입니다.

이는 Mock 라이브러리의 특성으로도 악화될 수도 있는데, 특정 Mockist 라이브러리는 특정 테스트와 관련이 없더라도 매우 구체적인 메서드 호출과 매개변수를 명시를 요구하기도 합니다. 이러한 경우 메서드 시그니처만 변경되어도 모든 테스트가 실패하게 됩니다.

#### 설계 스타일

이러한 테스트 스타일의 가장 흥미로운 부분은 **설계 스타일이 결정에 어떠한 영향을 미치는가** 입니다. 두 케이스의 테스터와 이야기를 나누면서 스타일이 장려하는 설계 간 몇가지의 차이점을 알게되었지만 아직은 너무 뻔한 내용만을 이야기했습니다.

위에서 레이어를 관리에 대한 차이점을 언급했었습니다. Mockist 테스트는 외부에서 내부로 접근(outside-in) 방식을 지원하는 반면, 도메인 모델 외부 스타일을 선호하는 개발자들은 Classicist 테스트를 선호하는 경향이 있습니다.

더 작은 수준에서 Mockist 테스터는 값을 반환하는 메서드에서 벗어나 수집 객체에 작용하는 메서드를 선호하는 경향이 있습니다. Cluster에서 보고서 문자열을 만드는 동작의 예를 들어보겠습니다. 이를 수행하는 일반적인 방법은 보고 메서드가 다양한 객체에서 문자열 반환 메서드를 호출하고 결과 문자열을 임시 변수에 어셈블하는 것입니다. Mockist 테스터는 문자열 버퍼를 다양한 객체에 전달하여 다양한 문자열을 버퍼에 추가하도록 할 가능성이 높습니다. 즉, 문자열 버퍼를 매개변수로 취급할 것입니다.

Mockist 테스터는 '열차 사고'를 피하는 것을 많이 이야기합니다. 다음과 같은 메서드 체이닝 getThis().getThat().getTheOther(). 메서드 체이닝을 피하는 것은 디미터 법칙을 따르는 것으로도 알려져 있습니다. 메서드 체이닝은 냄새나지만 전달 메서드로 비대해진 중간자(Middle Men Objects)의 반대 문제도 냄새납니다.(디미터 법칙이라고 부르는 것보다 디미터 제안이라고 불려도 좋을 것이라 생각합니다.)

객체지향 설계에서 사람들이 가장 이해하기 어려운 것 중 하나는 ["Tell Don't Ask" 규칙](https://martinfowler.com/bliki/TellDontAsk.html)입니다. 간단히 말하면 클라이언트 코드에서 객체의 데이터를 가져온 후 그 정보를 기반으로 작업을 수행하는 것보다는 그냥 하라고 말하는 것을 권장하라는 내용입니다. Mockist들은 Mockist 테스트를 사용하면 이 규칙을 지키며 요즘 코드에 너무 많이 퍼져있는 무지성 Getter 코드를 피할 수 있다고 말합니다. Classicist들은 이러한 장점은 다른 방법에서도 많이 얻을 수 있다고 생각합니다.

상태 기반 검증의 인정된 문제점은 검증을 지원하기 위해 쿼리 메서드를 만들게 될 수 있다는 것입니다. 테스트 목적만으로 객체의 API에 메서드를 추가하는 것은 좀 불편합니다. 동작 검증을 사용하면 이 문제를 피할 수 있긴합니다. 이에 대한 반론은 이러한 수정이 실제로는 보통 규모가 그렇게 크지 않다는 것입니다.

Mockist들은 [역할 인터페이스(Role Interface)](https://martinfowler.com/bliki/RoleInterface.html)를 선호하며, 이러한 스타일의 테스트를 사용하면 모듈 간 협업이 별도로 Mock되므로 역할 인터페이스로 전환될 가능성이 높기 때문에 더 많은 역할 인터페이스를 사용하기를 권장합니다. 따라서 이전 예시였던 문자열 버퍼를 사용하여 보고서를 생성하는 경우 Mockist들은 해당 도메인에서 의미가 있는 특정 역할을 구현할 가능성이 더 높으며 이는 문자열 버퍼로 구현될 수 있습니다.

대부분의 Mockist 개발자에게는 이러한 설계 스타일의 차이에서 매력을 느낀다는 점이 중요합니다. TDD의 기원은 진화적 설계을 지원하는 강력한 자동 회귀 테스트를 얻고자 하는 것이 목적이었습니다. 그 과정에서 실무자들은 테스트를 작성하는 것이 설계 프로세스를 크게 개선한다는 것을 발견했습니다. Mockist 개발자는 어떤 종류의 설계 방식이 좋은 설계 방식인지에 대한 강력한 아이디어를 가지고 있으며 주로 사람들이 이 설계 스타일을 개발할 수 있도록 돕기 위해 Mock 라이브러리를 개발하였습니다.

---

## 그렇다면 나는 Classicist가 되어야 할까, Mockist가 되어야 할까?

저는 이 질문에 자신있게 답하기 어렵다고 생각합니다. 개인적으로는 저는 항상 Classicist TDD 개발자였으며 지금까지 바꿀 이유가 보이지 않습니다. 저는 Mockist TDD에 대한 설득력 있는 이점을 보지 못하고 테스트를 구현에 결합했을 때의 결과가 걱정됩니다.

특히 Mockist 개발자를 관찰했을 때 눈에 띄였던 것은, 테스트를 작성할 때 동작의 결과에 집중하고 어떻게 하는지에 대해 집중하지 않는다는 점은 마음에 듭니다. 다만 Mockist 개발자는 기대치를 작성하기 위해 SUT가 어떻게 구현될 지 끊임없이 생각합ㄴ디ㅏ. 저는 정말 이부분이 부자연스럽다고 생각합니다.

저는 또한 실제 프로덕션에서 Mockist TDD를 시도하지 않아봤기에 제대로 모르는 것이 있을수도 있습니다. 제가 TDD에서 배웠듯이, 진지하게 시도하지 않고는 기술을 판단하기 어려운 경우가 많습니다. 저는 매우 행복하고 확신에 찬 Mockist 개발자를 많이 알고 있습니다. 그래서 저는 여전히 확신있는 Classicist지만 여러분이 스스로 결정을 내릴 수 있도록 두가지 주장을 가능한 공정하게 제시하고 싶었습니다.

따라서 Mockist 테스트가 매력적으로 느껴진다면 시도해봐도 좋다고 생각합니다. 특히 Mockist TDD가 개선하고자 하는 일부 영역에서 문제가 있는 경우 시도해 볼 가치가 있습니다. Mockist에는 두가지 장점이 있습니다.

1. 첫번째는 테스트가 깔끔하게 끊어지지 않고 문제가 있는 곳을 알려주지 않아 실패할 때 디버깅에 많은 시간을 소비하는 경우입니다.(또한 세분화된 Cluster에서 Classicist TDD를 사용하여 이를 개선할 수 있습니다.)
2. 두번째는 객체에 동작이 충분하지 않는 경우 Mockist가 개발팀이 동작이 풍부한 객체를 더 많이 만들도록 할 수 있습니다.

---

## 마지막 생각들

단위 테스트, 테스트 라이브러리, TDD에 대한 관심이 커지면서 점점 더 많은 사람들이 Mock을 접하고 있습니다. 많은 경우 사람들은 Mock 프레임워크에 대해 조금 배우지만, 이를 뒷받침하는 Mockist/Classicist의 구분을 완전히 이해하지 못합니다. 그 구분의 어느 쪽에 기대든 , 저는 이러한 관점의 차이를 이해하는 것이 유용하다고 생각합니다. Mockist가 아니더라도 Mock 프레임워크를 편리하게 찾을 수 있지만 소프트웨어의 많은 설계 결정을 안내하는 사고방식을 이해하는 것이 유용합니다.

이 글의 목적은 이러한 차이점을 지적하고 그 사이의 상충 관계를 설명하는 것이었습니다. Mockist의 사고방식에는 제가 설명하지 못한것보다 더 많은 것이 있습니다. 특히 설계 스타일에서 나타나는 결과입니다. 앞으로 몇년 안에 이에 대한 글이 더 많이 나오길 바라며, 그러면 코드 전에 테스트를 작성하는 것의 흥미로운 결과에 대한 이해가 깊어질 것입니다.
