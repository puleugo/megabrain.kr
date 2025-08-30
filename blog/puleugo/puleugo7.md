---
authors: puleugo
date: Fri, 8 Sep 2023 02:24:49 +0900
---

# [MySQL 복구 1] .ibd 파일을 이용하여 데이터 복구하기

혹시 저처럼 DB를 날려버리신 분들을 위해 제 삽질과 더 빠른 DB 복구를 위한 본 글을 작성합니다. 도움이 되었으면 좋겠습니다.

## 이해하기

데이터 복구를 시작하기 전에 복구에 필요한 데이터를 설명드리겠습니다.

* **.ibd 파일**: 각 테이블의 데이터가 저장된 파일(<u>I</u>nno<u>DB</u>)
* **MySQL**: ibd파일을 생성했던 MySQL 동일한 버전의 MySQL(완전히 동일해야 합니다.)
* **.frm 파일**: 각 테이블의 스키마가 저장된 파일(**8.0 버전부터 삭제됨**)

.ibd파일은`/var/lib/mysql/{database_name}/{table}.idb` 이런 경로로 존재합니다.

## 데이터베이스 구동 환경 구축

삽질을 하며 시간이 DB 구축과 삭제를 너무 많이 하게 되어서 `docker-compose.yml`으로 환경을 구축하였습니다.

```
# docker-compose.yml
version: '3.6'

services:
  backend: # ORM이 내장되어있는 서비스
    container_name: service-legacy-backend
    image: puleugo/service-legacy
    env_file:
      - .env
    ports:
      - 3000:3000
  mysql:
    container_name: service-legacy-mysql
    image: mysql:8.0.34 # 당신의 MYSQL 버전
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE={데이터베이스 이름} # 당신의 데이터베이스 이름
    ports:
      - 5432:5432
```

MYSQL 버전은 DB 접속 후 `SELECT VERSION();` 혹은 `mysql -V` 명령어를 통해 확인할 수 있습니다.

## ibd파일로 복구하기 전에 알아야 하는 내용

MySQL은 기본적으로 **테이블의 무결성 체크**를 해줍니다. 때문에 MySQL이 복구하려는 테이블을 관리하고 있다면 .ibd 파일을 통해 데이터를 복구할 수 없습니다.

MySQL은 **tablespace라는 물리적인 공간에서 테이블을 관리**하고 있습니다. (c++의 namespace와 유사한 개념) 다행히도 MySQL에서는 <u>tablespace에서 일시적으로 테이블을 관리하지 않도록 수정할 수 있습니다.</u>

## 데이터 복구하기

### 1\. tablespace에서 관리하지 않도록 변경하자.

특정 테이블을 테이블스페이스에서 제외하겠습니다. `ALTER TABLE {table_name} DISCARD TABLESPACE;`테이블스페이스에서 관리하지 않게하여 **ibd 파일에 저장되어 있는 데이터를 강제로 때려박을 수 있게되었습니다**.

### 2\. ibd 파일 적용

1. **로컬 환경에서 작업하는 경우:** 로컬 &rarr; 리모트 서버  
`cp ./{table\_name}.ibd /var/lib/mysql/{database_name}/`
2. **도커 환경에서 작업하는 경우:** 로컬 &rarr; 도커  
`docker cp ./{table\_name}.ibd {docker_container_name}:/var/lib/mysql/{database\_name}/`

ibd 파일을 불러오는 데에 성공했다면, **MySQL이 해당 파일을 읽을 수 있도록 권한을 수정해야 합니다**.

`chown mysql:mysql /var/lib/mysql/{table\_name}.ibd`

혹시 작업 도중 *foreign key constraint fail* 문제가 발생한다면, `SET foreign_key_checks = 0` / `SET foreign_key_checks = 1` 을 통해 FK 옵션을 비활성화시킨 후 작업하시면 됩니다.

### 3\. tablespace에서 다시 관리하도록 불러오기

`ALTER TABLE {table\_name} IMPORT TABLESPACE;`

그 후 MySQL에 접속하실 때는 `mysql -A` 옵션을 추가해서 접속해 주세요.

### 3-1.성공한 경우

![](https://blog.kakaocdn.net/dn/bZrSwc/btsts0pVD5o/lFaeesYDqnZtDCE7AdC2Wk/img.png)

축하합니다.. 그래도 불안하니 **csv파일로 뽑아서 백업하는 쿼리도 알려드리겠습니다.**

```
SELECT *
FROM {당신의 테이블}
INTO OUTFILE '/var/lib/mysql-files/temp.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

참고로 `/var/lib/mysql-files/temp.csv`의 경로가 아니면 권한 문제로 에러가 발생합니다.

이후에는 `docker cp service-legacy-mysql:/var/lib/mysql-files/temp.csv .` 를 입력해서 로컬로 복사해 오면 됩니다.

### 3-2. 실패한 경우

![](https://blog.kakaocdn.net/dn/BkVZN/btstrRz2QC8/XS2b812yK8VfksQtcg15KK/img.png)

Data structure corrpution 에러가 발생한다면 **ibd파일의 데이터와 스키마가 올바르지 않다는 문제**입니다. (ORM이 생성한 Constraint 이름을 랜덤으로 생성하기 때문이지 않을까 추론합니다. )

저도 일부 테이블이 스키마 불일치 문제로 복구되지 않아 <u>아래 방식</u>을 이용하여 남은 테이블도 복구했습니다.

[**바이너리 로그를 통해 데이터를 복구하는 방법**](https://puleugo.tistory.com/168)도 있습니다.

다음 글에서 소개하겠습니다.

## 그 외 1) ibd파일 복구를 좀 더 잘해볼 수 있는 방법

저는 Data structure corrpution가 발생한 이유가 foreign key 선언부의 불일치 문제라고 생각했습니다. 복구 중에는 생각하지 못했지만, real mysql 8.0에서 DB 레벨에서 설정할 수 있는 많은 옵션이 존재한다는 것을 알았습니다.  
[foreign\_key\_checks](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_foreign_key_checks) 옵션을 끈 상태에서 복구를 시도했다면 성공하지 않았을까 합니다. *본문에 추가했습니다.*

## 그 외 2) 왜 더이상 스키마를 .frm 파일로 저장하지 않을까?(.ibd로 테이블 구조 복구)

**mysql 5.7까지는 테이블 구조 정보를 파일 기반(.frm)으로 하드디스크에서 관리했습니다**. 하지만 파일 기반의 정보들은 트랜잭션을 지원하지 못합니다. DDL을 적용 도중 MySQL이 강제로 중지되면 <u>트랜잭션이 지원되지 않기 때문에 구조 일관성 문제가 발생</u>합니다. (같은 이유로 mysql에서는 DML 또한 바로 .ibd 파일에 적용하지 않고 버퍼 풀이라는 메모리에서 관리합니다. [해당 내용 공식 문서](https://dev.mysql.com/doc/refman/8.0/en/innodb-change-buffer.html))

```
# InnoDB에서 관리중인 테이블 보이기
mysql> SHOW CREATE TABLE;
```

이러한 이유로 8.0버전부터는 InnoDB 테이블에서 테이블 구조 정보를 InnoDB 테이블에 저장하도록 업데이트되었습니다. 또한, <u>ibd파일에서 테이블 구조 정보 또한 저장하도록 업데이트 되었습니다.</u>

**만약 DDL도 잃어버린 상태라 DDL 수동 복구를 원하시면 아래 방식도 추천드립니다.**

```
linux> ibd2sdi mysql_data_dir/table_name.ibd > table_name.json
linux> cat table_name.json
```

8.0.3 부터는 SDI(Serialized Dictionary Information) 파일이 존재하며 <u>.frm 파일과 동일한 역할</u>을 합니다. [ibd2sdi 유틸에 대한 내용](https://dev.mysql.com/doc/refman/8.0/en/ibd2sdi.html)

[MySQL :: MySQL 8.0 Reference Manual :: 4.6.1 ibd2sdi &mdash; InnoDB Tablespace SDI Extraction Utility

4.6.1 ibd2sdi &mdash; InnoDB Tablespace SDI Extraction Utility ibd2sdi is a utility for extracting serialized dictionary information (SDI) from InnoDB tablespace files. SDI data is present in all persistent InnoDB tablespace files. ibd2sdi can be run on file-

dev.mysql.com](https://dev.mysql.com/doc/refman/8.0/en/ibd2sdi.html)

## 권장 도서

* DBA가 알려주는 MySQL의 동작원리와 설정들  
[Real MySQL 1판](https://link.coupang.com/a/bNdSWv)

---

*"이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."*

