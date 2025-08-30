---
authors: puleugo
date: Thu, 6 Jun 2024 12:13:32 +0900
---

# [TypeScript] TypeORM 커스텀 함수 구현하기

## 도입

> 본 케이스는 ORM레벨의 에러 때문에 작성되었기에, ORM에 직접 메서드를 추가하는 접근방식을 사용했습니다.  
> 만약 Data Access Layer에 Customized Method를 추가하고 싶으시다면 TypeORM 레퍼지토리를 참조하는 클래스를 구현하세요.

TypeORM 커스텀함수가 필요하게 되어 구현하게됐다. 처한 상황은 다음과 같다.

* 발생 환경: MySQL, Mac
* 발생 조건: upsert method를 사용하고 충돌 조건을 PK가 아닌 Key를 사용함
* 결과: upsert signature은 Upsert를 시도한 객체를 반환하는데 ORM에서 객체를 찾지 못해 TypeORM 에러 발생

[#10909번 이슈](https://github.com/typeorm/typeorm/issues/10909)

때문에 이를 해결하기 위해 TypeORM에 함수 하나를 추가해보려고 한다.

## 코드

```
//custom-orm-methods.ts

import { InsertResult, ObjectLiteral, Repository, TypeORMError } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

declare module 'typeorm/repository/Repository' {
  interface Repository<Entity extends ObjectLiteral> {
    /**
     * Upsert를 수행하고 upsert 성공한 경우 InsertResult, 실패한 경우 null을 반환합니다.
     * @param entityOrEntities
     * @param conflictPathsOrOptions
     * @description TypeORM에서 제공하는 upsert 메소드는 Mysql 환경에서 PK를 사용하지 않고 Upsert 시 이미 update/insert하지 않아도 되는 동일한 값이 존재하는 경우에 에러가 발생합니다.
     * https://github.com/typeorm/typeorm/issues/10909
     */
    upsertOrNull(
      entityOrEntities:
        | QueryDeepPartialEntity<Entity>
        | QueryDeepPartialEntity<Entity>[],
      conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
    ): Promise<InsertResult | null>;
  }
}

Repository.prototype.upsertOrNull = async function <Entity>(
  entityOrEntities:
    | QueryDeepPartialEntity<Entity>
    | QueryDeepPartialEntity<Entity>[],
  conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
): Promise<InsertResult | null> {
  let result: InsertResult | null = null;
  try {
    result = await this.upsert(entityOrEntities, conflictPathsOrOptions);
  } catch (e) {
    // TypeORMError: Cannot update entity because entity id is not set in the entity.
    if (!(e instanceof TypeORMError)) {
      throw e;
    }
  }
  return result;
};
```

```
// app.module.ts
import './common/utils/customer-orm-methods'; // <- AppModule 첫 라인에서 불러오기
import { Module } from '@nestjs/common';


@Module({
  imports: [
  TypeORM.forRoot({
  	// options ...
  }),
  // Modules ...
  ]
export class AppModule{}
```

# 설명

1. declare 키워드는 이미 선언되어 있는 값을 참조할 수 있음. (typescript 개념)
2. 'typeorm/repository/Repository' 모듈을 참조함.
3. Repository 인터페이스 upsertOrNull 메서드 정의 병합.
4. Repository 클래스의 prototype에 upsertOrNull 메서드 추가함.

```
//custom-orm-methods.ts

import { InsertResult, ObjectLiteral, Repository, TypeORMError } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

// 1. declare 키워드는 이미 선언되어 있는 값을 참조할 수 있음.
// 2. 'typeorm/repository/Repository' 모듈을 참조함.
declare module 'typeorm/repository/Repository' {
  // 3. Repository 인터페이스 upsertOrNull 메서드 정의 병합.
  interface Repository<Entity extends ObjectLiteral> {
    upsertOrNull(
      entityOrEntities:
        | QueryDeepPartialEntity<Entity>
        | QueryDeepPartialEntity<Entity>[],
      conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
    ): Promise<InsertResult | null>;
  }
}

// 4. Repository 클래스의 prototype에 upsertOrNull 메서드 추가함.
Repository.prototype.upsertOrNull = async function <Entity>(
  entityOrEntities:
    | QueryDeepPartialEntity<Entity>
    | QueryDeepPartialEntity<Entity>[],
  conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
): Promise<InsertResult | null> {
  let result: InsertResult | null = null;
  try {
    result = await this.upsert(entityOrEntities, conflictPathsOrOptions);
  } catch (e) {
    if (!(e instanceof TypeORMError)) {
      throw e;
    }
  }
  return result;
};
```

## 왜 이렇게 해야 해?

그냥 Serivce에 구현해서 박으면 안돼? 라고 물어본다면 다음과 같이 답할 수 있다.

1. **Serivce에 구현하면 안돼?**  
   테스트가 힘들다. upsertOrNull를 private으로 하는 경우 Unit 테스트가 굉장히 어려워진다.  
   \-> TypeORMRepository 객체를 참조하는 Repsitory를 구현하는 것을 권장한다.
2. **Repository를 구현하면 안돼?**  
   이번 케이스는 TypeORM의 에러가 발생하는 경우이기 때문에 특정 Repository 클래스에 종속되는 것은 옳지 않다.  
   \-> 그러므로 전역적으로 사용할 수 있는 메서드를 구현하는 것이 옳다.

