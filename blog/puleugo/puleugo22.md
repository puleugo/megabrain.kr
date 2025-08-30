---
authors: puleugo
date: Tue, 16 Apr 2024 01:45:31 +0900
---

# [DDD] 값 객체, Value Object

## 엔티티 식별

우리는 특정 모델의 여러 인스턴스들을 각자 구분할 수 있을 때 엔티티를 통해 도메인 개념을 모델링합니다.  
식별자가 존재하는지의 여부로 '값 객체'인지 '엔티티'인지 구분할 수 있습니다.

다음 예시를 보겠습니다:

우리가 흔히 말하는 User는 엔티티입니다. 왜냐하면 User의 인스턴스는 고유한 식별자(ID)를 가지고 있으며 ID를 통해 다른 각자 다른 User라는 것을 알 수 있기 때문에 User를 엔티티라고 부릅니다.

여기서 사용하는 고유한 식별자 방식은 UUID나 auto-increment 방식입니다.

## 값 객체(Value Object)

VO에서 두 인스턴스의 구조가 같다면 같은 값 객체라고 볼 수 있습니다.

### 구조적 동일성(Structural Equality)

구조적 동일성은 두 객체가 동일한 내용을 갖는다는 것을 의미합니다. 이는 <u>두 객체가 동일하다는 의미는 아닙니다</u>.

두개의 값 객체를 각자 식별하기 위해 객체의 실제 내용 기반으로 비교합니다.

다음 예시를 보겠습니다: User 엔티티에 'Name' 항목이 존재할 수 있습니다.

우리는 'Name'이 같은지 확인할 때 두 문자열을 비교합니다.

```
'puleugo' === 'puleugo' // truthy
'puleugo' === 'haroya' // falsy
```

User 엔티티에서 Name을 다음과 같이 구현하겠습니다:

```
// path: domain/user.ts

interface UserProps {
	name: string;
}

class User extends Entity<UserProps> {

	constructor(props: UserProps) {
		super(props);
	}

	get name(): string {
		return this.props.name;
	}
}
```

좋습니다. 여기에 조건 하나를 추가하겠습니다.

> 사용자의 이름은 항상 2-100자 사이여야 합니다.

간단히 생각해서 User 인스턴스를 생성하기 전에 이를 수행해야하니 다음과 같이 설계할 수도 있습니다.

```
// path: services/CreateUserService.ts

class CreateUserService {

	public createUser(name: string): User {
		if (name === undefined || name === null || name.length <= 2 || name.length > 100) {
			throw new Error('유저명은 2-100자 사이여야 합니다.')
		} else {
			return new User(name)	
		}
	}
}
```

뭐가 문제인지 모르겠다면 계속 개발해봅시다.

이번에는 유저 수정 서비스를 구현해보겠습니다.

```
// path: services/EditUserService.ts

class EditUserSerivce {

	public editUserName(user: User, name: string): void {
		if (name === undefined || name === null || name.length <= 2 || name.length > 100) {
			throw new Error('유저명은 2-100자 사이여야 합니다.')
		} else {
			user.name = name;
			// 저장
		}
	}
}
```

문제를 아시겠나요?

1. 서비스는 이러한 일을 하는 클래스가 아님. (이런 자잘한것까지 하면 추후 유지보수가 굉장히 힘들어짐)
2. 동일한 유효성 검사를 반복하고 있음.

이는 실제로 개발자들이 코딩하면서 자주 겪는 실수입니다.  
서비스가 도메인의 로직, 검증을 담당하게된다면 모델 자체는 도메인 논리를 정확하게 [캡슐화*(객체지향 4요소 중 1)*](https://ko.wikipedia.org/wiki/%EC%BA%A1%EC%8A%90%ED%99%94)하지 못합니다.

우리는 이런 문제가 있는 설계를 [빈약한 도메인 모델](https://ko.wikipedia.org/wiki/%EB%B9%88%EC%95%BD%ED%95%9C_%EB%8F%84%EB%A9%94%EC%9D%B8_%EB%AA%A8%EB%8D%B8#:~:text=%EB%B9%88%EC%95%BD%ED%95%9C%20%EB%8F%84%EB%A9%94%EC%9D%B8%20%EB%AA%A8%EB%8D%B8(anemic,%EB%8F%84%EB%A9%94%EC%9D%B8%20%EB%AA%A8%EB%8D%B8%EC%9D%98%20%EC%9D%B4%EC%9A%A9%EC%9D%B4%EB%8B%A4.)이라고 부릅니다.

(우리는 [풍부한 도메인 모델](https://www.slideshare.net/baejjae93/rich-domain-model)을 지향하며 개발해야합니다, Rich Domain Model은 실제로 정의된 패턴의 명칭은 아닙니다.)

> Q: 그래서 우리는 어디서 Name에 대한 검증을 수행해야 할까요?  
> A: 값 객체에서 하면 됩니다.

## 값 객체

우리는 위에서 User 클래스의 name 속성을 string으로 정의했습니다.

```
// path: domain/user.ts

// 값 객체
interface UserProps {
	name: string;
}

// 엔티티
class User extends Entity<UserProps> { // id 속성을 가지고 있는 Entity 클래스를 상속 받습니다.

	constructor(props: UserProps) {
		super(props);
	}

	get name(): string {
		return this.props.name;
	}
}
```

우리가 만약 name 속성에 대한 클래스를 생성한다면 해당 클래스 자체에 name에 대한 모든 유효성 검증을 떠맡길 수 있습니다.

*겨우 유효성 검증?*이라고도 말할 수 있지만 공백 제거, 올바르지 않은 문자 제거, 길이 검증 등이 수행될 수도 있습니다.

<u>정적 [팩터리 메소드](https://refactoring.guru/ko/design-patterns/factory-method)</u>와 <u>private 생성자</u>를 사용하여 유효한 name을 생성하기 위한 전제조건(precondition)을 확인할 수 있습니다.

```
// path: domain/name.ts

interface NameProps {
	value: string;
}

class Name extends ValueObject<NameProps> {

	public static create(name: string): Name {
		if (name === undefined || name === null || name.length <= 2 || name.length > 100) {
			throw new Error('유저명은 2-100자 사이여야 합니다.');
		} else {
			return new Name({ value: name});
		}
	}
    
	get value(): string {
		return this.props.value;
	}

	private contructor(props: NameProps) {
		super(props);
	}
}
```

그리고 이제 UserProps의 name 속성을 string에서 Name으로 변경하면 됩니다.

```
// path: domain/user.ts

// 값 객체
interface UserProps {
	name: Name;
}

// 엔티티
class User extends Entity<UserProps> { // id 속성을 가지고 있는 Entity 클래스를 상속 받습니다.

	private constructor(props: UserProps) {
		super(props);
	}

	get name(): string {
		return this.props.name;
	}
    
	public static create (props: UserProps) {
		if (props.name === null || props.name === undefined) {
			throw new Error('유저에 name 속성은 필수입니다.');
		} else {
			return new User(props);
		}
	}
}
```

## 값 객체 클래스

```
// path: shared/doamin valueObejct.ts
import { shallowEqual } from 'shallow-equal-object';

interface ValueObjectProps {
	[index: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
	public props: T;

	constructor (props: T) {
		this.props = Object.freeze(props);
	}

	public equals (vo?: ValueObject<T>) : boolean { // 구조적 동일성(Structural Equality) 검증 메소드
		if (vo === null || vo === undefined)
			return false;

		if (vo.props === undefined)
			return false;

		return shallowEqual(this.props, vo.props); // 같은 값을 가지고 있는지 확인
	}
}

// User 클래스 활용
const user = User.create({ name: Name.create('puleugo') });
user // User: { '_id': 1, 'props': {'name': {'props': {'value': 'puleugo'}}}} 
user.name // Name: { 'props': { 'value': 'puleugo' } }
user.name.value // 'puleugo'
```

equals 메서드는 구조적 동일성을 검증하는 메서드로 구현하였습니다.

shallowEqual: 얕은 복사를 검증하는 함수로 메모리 주소를 비교하는 것이 아니라 <u>값을 비교하는 것</u>을 말합니다. (동등성)

이후에 ValueObject의 자식 클래스에 LessThan(vo: ValueObejct<T>), GreaterThan(vo: ValueObejct) 등 편의용 메서드를 구현할 수 있습니다.

