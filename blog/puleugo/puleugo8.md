---
authors: puleugo
date: Fri, 8 Sep 2023 03:01:42 +0900
---

# [MySQL 복구 2] binlog를 통해 데이터베이스 복구하기

로컬 환경에서 [ibd 파일을 이용하여 데이터를 복구](https://puleugo.tistory.com/167)하려고 했습니다. 일부 테이블이 스키마 불일치 문제로 복구되지 않아서 바이너리 로그로 복구를 진행해봤습니다.

혹시 저처럼 DB를 날려버리신 분들을 위해 제 삽질과 더 빠른 DB 복구를 위한 본 글을 작성합니다. 도움이 되었으면 좋겠습니다.

## 이해하기

MySQL에는 바이너리 로그라는 파일이 존재합니다. 사용자가 사용했던 쿼리들이 기록되어 있는 파일입니다. (SELECT는 예외)  
DB 생성 시부터 binlog.000001으로 매일 binlog 파일이 생성되며 1씩 증가합니다.

MySQL에 설정되어 있는 binlog 보존 기간만큼만 저장되다, 보존 기간을 초과한 파일은 삭제됩니다. 때문에 binlog 파일이 1부터 시작하지 않는다면.. 이미 옛 binlog 파일들은 삭제된 상태라서 복구할 수 없습니다.

## 1\. 바이너리 로그 파일 조회하기

기본적으로 binlog 파일은 /var/lib/mysql/binlog.0\* 경로에 존재합니다. 또는 SHOW BINARY LOGS; 명령어를 이용하여 바이너리 로그 목록을 조회할 수 있습니다.

## 2\. 바이너리 로그를 SQL로 변경하기

```
# 단일 파일을 SQL파일으로 변경
mysqlbinlog /var/lib/mysql/binlog.000001 > binlog.000001.sql

# 와일드 카드를 이용하여 단일 SQL파일으로 변경하기
mysqlbinlog /var/lib/mysql/binlog.0* > binlog.sql

# 특정 파일들을 단일 SQL파일으로 변경하기
mysqlbinlog /var/lib/mysql/binlog.000001 /var/lib/mysql/binlog.000002 > binlog.sql
```

이렇게 생성된 binlog.sql 파일을 읽어보면 아래와 같이 잘 병합된 모습을 볼 수 있습니다.

vi binlog.sql

![](https://blog.kakaocdn.net/dn/IdzSW/btsth7LpKSX/m91oGl4IjI8JAVqImkC0vK/img.png)

binlog.sql

> VIM의 일반 모드에서 G를 입력하여 최하단으로, gg를 입력하여 최상단으로 이동할 수 있습니다.

필요없는 쿼리는 # 혹은 /\* \*/ 을 이용하여 주석 처리를 해줄 수 있습니다.

## 3\. MySQL 접속하여 추가하기

```
# 비밀번호가 없는 경우
mysql -u {유저 이름} -f -e "use {당신의 테이블 이름}" < binlog.sql

# 비밀번호가 있는 경우
MYSQL_PWD="{비밀번호}" mysql -u {유저 이름} -e "use {당신의 테이블 이름}" < binlog.sql
```

![](https://blog.kakaocdn.net/dn/ScltJ/btstq7pyNn1/T8Fvdfl8oBn1OqdVwV2aaK/img.png)

잘 복구되었습니다.

## 권장 도서

* DBA가 알려주는 MySQL의 동작원리와 설정들  
[Real MySQL 1판](https://link.coupang.com/a/bNdSWv)

---

*"이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."*

