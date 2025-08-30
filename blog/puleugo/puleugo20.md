---
authors: puleugo
date: Thu, 11 Apr 2024 21:03:58 +0900
---

# PostgreSQL Check란? Check를 사용하지 말아야하는 이유

![](https://blog.kakaocdn.net/dn/Ac2sX/btsGw7YMYTV/AZnNhid5UilfhP7fcYrnV1/img.png)

## PostgreSQL에는 Check란?

[SQL 레벨에서 지원하는 제약조건](https://www.w3schools.com/sql/sql_check.asp)입니다. (PostgreSQL만 지원하는 것이 아님.)

데이터 insert 요청 시 PostgreSQL [DBMS가 값 검증을 수행해주는 제약조건](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS)입니다. 다음과 같이 사용할 수 있습니다:

```
CREATE TABLE products (
    product_no integer,
    name text,
    price numeric CHECK (price > 0) -- 가격 컬럼에 항상 양수만 들어갈 수 있도록 검증
);
```

## Check를 사용하면 이점

* 애플리케이션에서 값에 대한 검증을 하지 않아도 됨. <u>서버 코드가 굉장히 간단해짐.</u>

## 반대로 존재하는 큰 단점

1. DBMS 마이그레이션 시 <u>검증 기능의 유실</u>됨. 특정 DBMS에 의존하게 됨. (MySQL 8.0.16 이하버전 등 다른 RDBMS에는 Check 기능이 없음)
2. 올바른 요청이 아님에도 커넥션을 요청하여 불필요한 비용 발생(<u>커넥션 오버헤드</u>)

2가지 큰 단점이 발생하여 존재하는 기능임에도 사용을 비추천드립니다.

