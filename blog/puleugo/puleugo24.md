---
authors: puleugo
date: Sun, 21 Apr 2024 18:03:07 +0900
---

# [Typescript] builder 패턴 남용 금지

자바 계열에서 넘어오신 분들이 [builder 패턴](https://refactoring.guru/ko/design-patterns/builder)을 통해 인스턴스 생성 전략을 무분별하게 사용하는 경우가 있습니다. 만약, 인자가 많아 빌더패턴을 적용해야한다는 이유는 TypeScript에서는 적절한 이유가 되지 못합니다. TypeScript에서 named parameter 가능하기 때문에 <u>인자가 많다는 이유로는 builder 패턴을 사용할 필요가 없습니다</u>.

## 코드

```
interface UserProps {
	nickname: string;
	email: string;
	role: UserRoleEnum;
	deletedAt: Date | null;
}

export class User extends Entity<UserProps, UserID> {

	private constructor(props: UserProps, id?: UserID) {
		super(props, id);
	}

	static create(props: UserProps, id?: UserID) {
		const isValid = Guard.againstNullOrUndefined([props.nickname, props.email]);
		if (!isValid)
    		throw new UserRequestPropsNullOrUndefinedException('올바르지 않은 요청 구조입니다. 요청에 대한 구조를 확인해주세요.');

	return new User(props, id);
	}

	get id(): UserID | undefined {
		return this._id;
	}

	get nickname(): UserNickname {
		return this.props.nickname;
	}

	get email(): UserEmail {
		return this.props.email;
	}
}

// 기본적인 사용방법
User.create({
	nickname: raw.nickname,
	email: raw.email,
	role: raw.role,
	deletedAt: raw.deleted_at,
});

//변수명과 속성명이 같다면 키 생략 가능
const [nickname, email, role, deletedAt] = ['puleugo', 'puleugo@gmail.com', UserRoleEnum.USER, null];
User.create({nickname, email, role, deletedAt});
```

