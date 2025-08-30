---
authors: puleugo
date: Wed, 17 Apr 2024 07:35:30 +0900
---

# [DDD] 도메인 엔티티, Domain Entity

## 도입

대기업들이 DDD를 지향하는 이유는 비즈니스가 만나는 <u>필연적인 복잡성</u> 때문입니다.

Gitlab, Netlify 등의 서비스만 봐도 우리가 공부할 때 접하는 CRUD 프로젝트와는 비교되지 않는 <u>비즈니스 로직의 복잡성</u>이 존재합니다.

비즈니스 로직의 복잡성을 관리하기 위한 접근 방식이 바로 <u>객체지향 프로그래밍 개념을 사용</u>하여 객체 간 <u>복잡한 동작을 모델링</u> 하는 것 입니다. 자세히 설명하면 특정 영역에서 어떤 행위가 가능한지 불가능 한지를 모방하는 것입니다.  
(e.g. 계좌에 잔고가 있다면 인출할 수 있지만 잔고가 없다면 인출할 수 없음.)

Domain-Driven은 도메인을 모델링하는 데 사용할 수 있는 아티팩트를 도입합니다:

![](https://blog.kakaocdn.net/dn/SYiH0/btsGHmm5iIM/5cljF7HjMam06S6oIYnni1/img.png)

이제 본 아티팩트 중 하나인 엔티티에 대해 이야기해보겠습니다.

## DDD에서 Entity의 역할

아래는 엔티티의 특성 2가지를 설명하겠습니다.

### 1\. (의미가 있다면) 비즈니스 로직을 넣는 첫번째 장소

엔티티는 도메인 로직을 작성할 때 가장 먼저 생각나는 곳이여야 합니다.

특정 모델을 표현하고 싶을 때:

* 할 수 있는가?
* 그 일을 언제 할 수 있는가?
* 그 일을 수행할 수 있는 시기를 결정하는 것은 어떤 조건인가?

우리는 해당 로직이 속한 모델에게 가장 가깝게 배치하는 것을 목표로 합니다.

예를 들어서: 구인 게시판 애플리케이션에서 고용주는 질문을 추가할 수 있습니다. 지원자가 입사 지원 시 답변할 수 있습니다. 여기에 몇가지 규칙을 추가하겠습니다.

* 규칙 1: 이미 지원자가 있는 경우에는 질문을 추가할 수 없습니다.
* 규칙 2: 최대 질문 수를 초과하여 질문을 추가할 수 없습니다.

위 규칙을 적용한 간단한 예제입니다.

```
class Job extends Entity<JobProps> {
	// ... constructor
	// private factory method

	get questions(): Question[] {
		return this.props.questions;
	}

	public hasApplicants(): void {
		return this.props.applicants.length > 0;
	}

	public addQuestion(question: Question) {
		if (this.hasApplicants())
			throw new Error('이미 지원자가 있는 경우에는 질문을 추가할 수 없습니다.');

		if (this.props.questions.length === MAX_QUESTIONS_PER_JOB)
			throw new Error('최대 질문 수를 초과하여 질문을 추가할 수 없습니다.');

		this.props.question.push(question);
	}
}
```

때로는 엔티티 내부에 특정 도메인 로직을 넣는 것이 자연스럽지 않는 경우도 있습니다.

위의 예제에서는 Job과 Question 객체가 서로를 알고 있는 것이 자연스러운 구조입니다. 하지만 관련된 엔티티가 서로에 대해 알 필요가 없는 경우도 존재합니다.*(Aggregate 설계)*

예를 들면, 영화 대여 애플리케이션에서 Customer와 Movie 엔티티가 있습니다. 어떤 엔티티에 buyMovie() 메서드를 배치하는 것이 좋을까요?

얼핏보면 Customer가 영화를 구매하는 것이 올바른 표현으로 보입니다. customer.buyMovie(movie) 처럼요 가독성도 좋아보입니다. 다만 이 경우에 Customer는 Movie를 알 필요가 없습니다.

반대로 Movie 또한 Customer에게 구매된다고 표현할 수도 있으 나 Movie도 Customer를 알 필요가 없습니다.

이런 경우에는 로직을 **Domain Service**에게 배치하는 것이 좋습니다. (API를 통해 호출하는 ApplicationService와는 다른 개념)

## 2\. 모델 불변성을 책임짐

DDD로 애플리케이션을 구현하는 것은 요구사항에 특화된 언어를 만드는 것과 비슷합니다.

그러기 위해서는 의미있고 유효한 연산만 노출해야 합니다. 동시에 클래스 불변성도 보장해야 합니다

객체 생성에 대한 유효성 검증 로직은 일반적으로 Value Objects에 위임되지만, 무엇을 언제 수행하는 것은 객체가 담당합니다.

---

개발자들이 가장 많이 하는 실수 중 하나는 도메인을 모델링할 때 모든 속성에 getter, setter를 다는 것입니다.

> 모든 속성에 getter, setter를 추가하지 마세요.

이것이 안좋은 이유는 우리는 객체의 변경을 제어해야하기 떄문입니다. 객체가 잘못된 상태로 끝나는 것을 막아야합니다.

다시 구인 게시판 예제를 들고왔습니다. (questions에 집중해주세요.)

```
class Job extends Entity<JobProps> {
	// ... constructor
	// private factory method

	get questions(): Questions[] {
		return this.props.questions;
	}

	public addQuestion(question: Question) {
		// ...
		if (this.props.questions.length === MAX_QUESTIONS_PER_JOB)
			throw new Error('최대 질문 수를 초과하여 질문을 추가할 수 없습니다.');

		this.props.question.push(question);
	}
}
```

questions 배열에 setter가 없는 것을 아시겠나요?  
Job의 도메인 로직에는 '최대 질문 수를 초과해서 질문을 추가할 수 없다.'는 조건이 있습니다.

questions에 대한 public setter가 있다면 아래와 같이 처리되어 <u>도메인 로직을 우회</u>하는 것을 막을 수 없습니다:

```
// setter의 경우
job.questions = [{}, {}, {}, {}, {}, ...] // question 객체
```

Job 객체에서는 addQuestion(question)을 통해 도메인 로직을 숨겼습니다.

이것이 바로 캡슐화입니다. 객체지향 4원칙 중에 1이며 데이터 무결성을 가져가는 방법들 중 1 입니다.

또한 캡슐화는 DDD에서 가장 중요한 개념 중 하나입니다.

## Identity와 Loockup

엔티티와 값 객체의 차이점은 [객체 식별](https://puleugo.tistory.com/186#%EC%97%94%ED%8B%B0%ED%8B%B0-%EC%8B%9D%EB%B3%84)이 가능한지 불가능한지입니다. 감이 안오면 아래 예제를 보고 생각히보세요.

* 엔티티: User, Job, Board, ChatRoom, Message
* 값 객체: Name, JobTitle, ChatRoomTitle, MessageText

대부분의 엔티티는 값 객체나 타 엔티티를 참조하게 되는 경우가 많습니다.

다음은 심플한 User 엔티티 예제입니다.

```
interface UserProps {
	name: Name;
	email: Email;
	active: boolean;
}

class User extends Entity<UserProps> {
	get name(): Name {
		return.this.props.name;
	}

	get email(): Email {
		return this.props.email;
	}

	private contructor(props: UserProps, id?: EntityID) {
		super(props, id);
	}

	public isActive(): boolean {
		return this.props.active;
	}
    
	public static create(props: UserProps, id: EntityID): User {
		Guard.againstNullOrUndefined([ // null || undefined 검증
			{propName: 'name', value: props.name},
			{propName: 'email', value: props.email},
			{propName: 'activate', value: props.active},
		]);

		return new User(props, id)
	}
}
```

엔티티의 생명주기 동안 삭제(Deleted), 보관(Archived)하기 전에 데이터베이스에 저장(Store), 재구성(Reconsituted), 수정(Modified)이 필요할 수 있습니다.

## 엔티티 생명주기

다음과 같이 엔티티의 생명주기를 관리합니다.

![](https://blog.kakaocdn.net/dn/E0cAN/btsGGjYKk1T/hjmZUhjzkrlIPkfkkYcoq1/img.png)

### 생성

엔티티를 생성하려면 주로 팩터리 패턴을 주로 사용합니다.

보통 **팩터리 메서드**를 사용합니다.

*팩터리 메서드란?*

이전 예제를 봅시다.

```
class User {
	// ...

	private constructor(props: UserProps, id: EntityID) {
		super(props, id);
	}

	public static create(props: UserProps, id?: EntityID) { // 팩터리 메서드
		const isSuccess = Guard.againstNullOrUndefined([
			{propName: 'name', value: props.name},
			{propName: 'email', value: props.email},
			{propName: 'active', value: props.active}
		]);
        
		if (!isSuccess)
			throw new Error('');

		return new User(props, id);
	}
}
```

create 메서드가 User 엔티티를 생성하는 팩터리 메서드입니다.

외부에서 new 키워드를 사용할 수 없습니다.

```
const user = new User(); // 생성자가 private이기 때문에 호출할 수 없습니다
```

팩터리 메서드를 통해 캡슐화와 데이터 무결성을 유지할 수 있습니다. 우리는 User의 인스턴스가 도메인 계층의 코드 실행에 어떻게 들어가는지를 제어합니다.

만약 100개의 타입의 User가 존재한다면 더 많은 팩터리 메서드를 구현하거나 추상 팩터리를 사용해볼 수 있습니다.

#### 엔티티 베이스 클래스

```
import {EntityID} from './types';

export abstract class Entity<T> {
	protected readonly _id EntityID;
	protected props: T;

	// 집중: id가 optional이네요?
	constructor(props: T, id?: EntityID) {
		this._id = id ? id : new EntityID();
		this.props = props;
	}

	public equals(object?: Entity<T>): boolean {
		if (object === null || object == undefined)
			return false;

		if (this === object)
			return true;

		if (!Entity.isEntity(object))
			return false;

		return this._id.equals(object._id);
	}
    
	public static isEntity(value: any): value is Entity<any> {
		return value instanceof Entity;
	} 
}
```

이제 Entity<T> 클래스에 대해 자세히 읽어봅시다:

1. Entity<T> 클래스는 추상클래스입니다. 직접 인스턴스를 생성할 수 없습니다. 자식클래스에서 인스턴스를 생성할 수 있어요.
2. id는 본 클래스에서 readonly입니다. 다시 말해서 처음 값이 할당되면 이후에 논리적으로 변경할 수 없도록 구현했습니다.
3. id를 비교합니다. 이전 글(Value Object, 구조적 동등성)에서와는 다르게 참조를 비교합니다. 같은 객체인지를 비교해야하기 때문입니다.
4. this.props를 갖습니다. 그 이유는 getter, setter는 props를 정의하는 하위 클래스가 담당하는 것이 올바르기 때문입니다.

#### Optional ID 속성

위에서 id가 옵셔널한 것에 집중하라는 주석을 적었습니다.

왜 옵셔널로 구현했을까요?

1. id를 이미 알고 있는 경우(이미 생성되었는 경우), 이를 패스할 수 있게 했습니다.
2. id가 없는 경우, EntityID 클래스에서 UUID 방식으로 ID를 생성해줍니다.

이를 통해 엔티티 생명주기의 생성과 재구성 이벤트를 모두 해결할 수 있습니다.

![](https://blog.kakaocdn.net/dn/bgSJjT/btsGHcdMog4/2UIxMRKqGMnW3gMDLNpkC0/img.png)

### 저장소(Storage)

우리는 메모리에 생성된 엔티티를 실제 데이터베이스에 저장하기를 원합니다.

이 부분은 Repository와 Mapper가 해결해줍니다.

Repository는 원하는 타입의 영속성 기술(relational database, noSQL database, JSON file, text files)에서 도메인 객체를 영속, 조회에 사용되는 아티팩트입니다.

Mapper는 객체를 데이터베이스에 저장하기 위한 포맷으로 변경하거나 반대로 데이터베이스에서 객체로 변환하기 위한 클래스입니다.

다음은 Sequelize ORM을 이용한 User 레퍼지터리의 스켈레톤 코드입니다.

```
interface IUserRepository {
	exists(userID: string): Promise<boolean>;
	searchUserByEmail(email: string): Promise<User[]>;
	getUsers(config: IUserSearchConfig): Promise<User[]>;
	getUsersByRole(config IUserSearchConfig, role: Role>: Promise<User[]>;
	getUser(userID: string): Promise<User>;
	save(user: User): Promsise<User>;
}

export class SequelizeUserRepository implements IUserRepository {
	private sequelizeModels: any;

	constructor(seuelizeModels: any) {
		this.sequelizeModels = sequelizeModels;
	}

	exists(userID: string): Promise<boolean> {}

	searchUserByEmail(email: string): Promise<User[]> {}

	getUsers(config: IUserSearchConfig): Promise<User[]> {}

	getUsersByRole(config IUserSearchConfig, role: Role>: Promise<User[]>{}

	getUser(userID: string): Promise<User> {}

	save(user: User): Promsise<User> {}
}
```

getUsers 메서드를 한번 구현해보겠습니다.

Sequelize의 문법을 통해 모든 유저를 조회 한 후 Active Records를 통해 User 도메인 객체와 매핑해주겠습니다.

```
import {UserMap} from '../mappers'
export class SequelizeUserRepository implments IUserRepository {
	private sequlizeModels: any;

	// ...

	getUsers(config: IUserSearchConfig): Promise<User[]> {
		const userModel = this.sequelizedModels.BaseUser;
		const queryObject = this.createQueryObject(config);
		const users: any[] = await userModel.findAll(queryObject);
		return users.map((user) => UserMap.toDomain(user));
	}
}
```

Mapper는 다음과 같이 구현할 수 있습니다.

```
export class UserMap extends Mapper<User> {
	public static toDTO(user: User): UserDTO {
		id: usr.id.toString(),
		userName: user.name.value,
		userEmail: user.email.value
	}

	public static toPersistence(user: User): any {
		return {
			user_id: user.id.toString(),
			user_name: user.name.value,
			user_email: user.email.value,
			is_activate: user.isActive()
		}
	}

	public static toDomain(raw: any): User {
		const name = Name.create(raw.user_name);
		const email = Email.create(raw.user_email);
		const password = Password.create(raw.user_password);
		
		return User.create({
			name: name,
			password: password,
			email: email,
			active: raw.is_active,
		}, new EntityID(raw.user_id))
	}
}
```

이 클래스는 굉장히 스코프가 좁습니다. 이렇게 적은 책임을 담당하는 것을 [단일 책임 원칙](https://ko.wikipedia.org/wiki/%EB%8B%A8%EC%9D%BC_%EC%B1%85%EC%9E%84_%EC%9B%90%EC%B9%99)이라고 부릅니다.

#### 재구성

생성된 엔티티가 데이터베이스에 영속 시킨 후 어느 시점에 이 엔티티를 꺼내 사용합니다.

다시 말하지만 이 작업은 Repository와 Mapper클래스에서 쉽게 유지보수할 수 있는 작업입니다.

## 결론

아직 Aggregate Roots, Domain Events같은 도메인 개념들이 있지만, Entity와 Value Object만으로 많은 모델링을 시작할 수 있습니다. 다른 내용은 다음 글에서 이어가겠습니다.

