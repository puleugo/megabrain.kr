---
authors: puleugo
date: Mon, 12 Aug 2024 12:00:24 +0900
---

# [번역] 방금 당신이 작성한 코드는 도메인 로직인가? | What is domain logic?

## 서론

* 원문: [What is domain logic?](https://enterprisecraftsmanship.com/posts/what-is-domain-logic/) | Vladimir Khorikov

## 도메인 로직 vs 비즈니스 로직?

우리는 코드를 작성하기 전에 두가지를 생각합니다. **<u>해결하고자 하는 문제</u>와 <u>해결 방안</u>입니다.**

여기서 <u>실생활에서 해결하고자 하는 문제</u>가 바로 **도메인**(a.k.a. Problem Domain, Core Domain)이며 <u>해결방안</u>을 **비즈니스 로직**(a.k.a. Domain Logic, Business Rule, Domain Knowledge)이라고 부릅니다.

알고보면 쉽지만 찾아보지 않으면 대화조차 안되는 내용이라 학생 입장에는 슬프다.

![](https://blog.kakaocdn.net/dn/C9mmK/btsI0AKKIUq/K9lQ86u7WQek7vMJkP0Hk1/img.png)

https://enterprisecraftsmanship.com/posts/what-is-domain-logic/

결론은 **도메인 로직과 비즈니스 로직은 동의어**이며 위와 같은 의미라는 것만 알면 된다.

## 도메인 로직

하지만 문제 해결방안(이후 도메인로직)만이 코드에 있으면 너무 좋겠지만 우리들의 코드는 그렇지 않습니다. 예를 들면:

* DB 로직: DB에 도메인 모델을 저장
* 3rd Party API 로직: 외부 서비스를 사용
* UI 로직: UI를 통해 사용자와 상호작용 하는 코드

위 같이 도메인로직이라고 부르기에는 애매모호한 코드도 있을 것입니다. 특히 Transaction Script 아키텍처 패턴을 사용하는 경우에는 더욱 그럴겁니다. *(도메인 모델에게 행위를 안주고 서비스가 전부 처리하는 패턴, DB로직이랑 도메인 로직이 짬뽕된다.) Transaction Script가 단순한 코드에서는 가독성이 좋을지 몰라요.*

그런데 **도메인이 복잡해질 수록 코드 가독성은 떨어지게 돼요.** 더 자주 들어본 안티패턴으로는 [빈약한 도메인 모델](https://martinfowler.com/bliki/AnemicDomainModel.html)이 있어요. 도메인 로직과 이외의 로직을 구분한다면 도메인 모델을 추출하여 코드에서 명확하게 관심사를 분리할 수 있게 돼요. 그렇게되면 DB나 UI같은 세부 사항에 주의를 기울이지 않아도 어떤 도메인을 처리하고자 추론하는 데 필요한 인지적 부하를 줄일 수 있습니다.

그러면 애플리케이션 서비스 예제에서 도메인 로직을 추출해봅시다. **도메인 로직의** **특징**은 <u>비즈니스적인 의미가 있는 결정을 내리는지 여부</u>로 알 수 있습니다. **도메인 모델**은 <u>비즈니스에 중요한 결정</u>을 하고 **그 외의 모든 코드**들은 <u>도메인 모델이 결정을 따라 어떤 작업을 수행</u>하거나 <u>도메인 모델의 결정을 위한 정보를 제공</u>해주는 것에 불과합니다.

## 애플리케이션 서비스 로직에서 도메인 로직 분리하기

### 첫번째 예시: 계좌에서 현금 인출

```
// Application Service
private TakeMoney(amount: number): void {
	if(!this.atm.canTakeMoney) {
		throw AtmHasNotEnoughMoney('인출 불가');
	}
	// 수수료 포함 금액
	const amountWithComission = this.atm.calculateAmountWithComission(amount);
	this.paymentGateway.chargePayment(amountWithComission);
	this.atm.takeMoney(amount);
	this.repository.save(this.atm);
}
```

위 방식은 애플리케이션 서비스 계층의 일부 코드입니다. 도메인 클래스 Atm이 <u>부과할 금액을 결정</u>하고 .canTakeMoney(), .calculateAmountWithComission()를 통해 <u>결정을 위한 정보를 제공</u>받습니다.

이후 애플리케이션 서비스는 그 결정을 듣고 수행하기만 합니다. paymentGatway 인스턴스를 사용하여 금액을 청구하고 데이터베이스를 업데이트합니다.

### 두번째 예시: 메세지 응답

```
private chatMessageReceived(message: string) {
	const event AuctionEvent = AuctionEvent.from(message);
	const command: AuctionCommand = this.auctionSniper.process(event);
	if (command != AuctionCommand.None()) {
		this.chat.sendMessage(command.toString());
	}
}
```

이 메서드는 애플리케이션 서비스 계층의 일부이기도 합니다. 여기서 실질적인 도메인 객체는 AuctionSniper입니다. **앱 서비스가 하는 일**은 <u>외부 세계로부터 오는 메세지를 의사 결정자가 이해할 수 있는 형식(AuctionEvent)으로 변환</u>하고 해당 메세지를 전달하고 <u>도메인 클래스의 결정에 따라 처리</u>하는 것입니다.

위 두가지 코드 샘플 중 어느 것도 스스로 결정을 내리지 않으며, 둘 다 도메인 모델에 위임합니다. 이것이 바로 적절한 관심사의 분리의 모습니다. 애플리케이션 서비스 계층은 상당히 많은 코드를 포함할 수 있지만 그 중 어느것도 비즈니스에 중요한 결정을 내리는 것과는 관련이 없어야합니다. **결정을 내릴 수 있는 유일한 객체는 도메인 모델입니다.**

도메인 로직을 추출했다면 다음으로 해야할 작업은 다른 모든 유형의 로직이 적절히 분리되어있는지 확인하는 것입니다. (DB 로직 등)

## 요약

* 도메인 로직(비즈니스 로직, 비즈니스 규칙, 도메인 지식과 동의어)은 비즈니스에 중요한 결정을 내리는 로직이다.
* 다른 모든 유형의 논리(DB, UI, 애플리케이션 로직 등)는 도메인 모델에서 내린 결정을 처리하고, 데이터를 저장하거나, 사용자에게 보여주거나, 외부 서비스에 전달하는 작업을 처리합니다.
* 도메인 로직을 다른 로직과 분리하는 것은 중요하며, 전반적인 코드 베이스를 더 간당하게 유지하는 데에 도움이 됩니다.

