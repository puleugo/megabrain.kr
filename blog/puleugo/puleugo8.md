---
authors: puleugo
date: Sun, 29 Dec 2024 17:09:14 +0900
---

# Redis는 항상 옳은가? (Redis vs Another Plans)

![](https://blog.kakaocdn.net/dn/vm3Pl/btsLBjHiNc1/xvEe06pj1IiEpiqQzTk1K0/img.webp)

No Silver Bullet

## 도입

최근 동아리원분과 캐싱 기능의 구현방식에 대해 이야기를 나누다 Redis에 대한 이야기가 나와서 정리해봅니다.  
'Redis 도입이 항상 정답인가?'가 주제였고, 저는 **Redis를 서비스 운영 초기부터 도입하는 것은 항상 정답은 아니며 MSA를 도입, 서비스를 복수의 인스턴스로 운영할 때나 의미가 있다. 작은 서비스의 경우, 애플리케이션의 Dictionary 자료구조를 사용하는 것도 좋은 선택지다.** 라는 의견입니다.

둘다 취준생이라 누가 옳은지는 그 자리에서 알 수 없었지만 Redis가 <u>정확히</u> 무엇인지를 조사해보고자 합니다.

---

## Redis란 무엇인가?

단순한 Cache Server입니다. *이름도 <u>Re</u>mote <u>Di</u>ctionary <u>S</u>erver*취준하면 싹다 Redis를 사용해보라고 하는데 Redis의 대 척점은 없는지, 제목 그대로 항상 Redis는 정답일까요?

먼저, Redis(2011년도) 이전에는 Redis 같은 서비스가 없었을까요?  
아뇨. MemCached(2003)가 존재했으며 MemCached 이전에는 MySQL Table을 Cache처럼 사용하기도 했습니다. 아래와 같은 한계들로 인해 <u>Redis가 주류</u>가 되었습니다.

* MemCached: 가볍지만 큰 서비스에서 사용하기에는 애매하다.
  * Value의 Max Size(1mb): 단점은 아님, 가볍게 사용하는 용도로는 적합.
  * Replication 기능 부재
  * 다양한 데이터 타입의 부재
* MySQL: 구현하기는 편하지만 느리며 서비스가 커지면 큰 트러블 슈팅 문제 발생.
  * 스케일 이슈: 수평적 확장(분산 방식)에서 문제 발생함.
  * (비교적)느린 속도

Redis와 비교했을 떄 위와 같은 단점이 있습니다. 현실적으로 MySQL은 좋은 선택지가 아니지만 MemCached와 Dictionary 자류구조와 비교를 해보겠습니다.

### Redis vs MemCached

둘 다 원격 캐시 서버입니다. 둘을 비교하면 다음과 같습니다.  
중요한 내용은 밑줄쳐두었습니다.

||||
|:---:|:---:|:---:|
|**기준**|**Redis**|**MemCached**|
|**설계 철학**|<u>데이터 저장소</u>, <u>고급 캐싱 솔루션</u>|빠르고 <u>단순한 캐싱 솔루션</u>|
|**속도**|빠름|Redis보다 더 빠름|
|**데이터 구조 지원**|<u>다양한 자료구조 지원</u>(Array, Set, Hash, Sorted Set etc.)|Key-Value(String) Only|
|**데이터 지속성**|<u>File 옵션 제공</u>\- RDB(Redis Database File): 주기적 데이터 스냅샷 저장\- AOF(Append-Only FIle): 쓰기연산을 기록하여 손실 가능성 X|휘발생 메모리 Only|
|**메모리 관리**|압축, [LRU](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU), [TTL](https://en.wikipedia.org/wiki/Time_to_live)|LRU Only|
|**확장성**|<u>Redis Cluster</u> 기능 지원|\-|
|**기타**|Pub/Sub, Transaction etc|\-|

그렇습니다. 이 두 선택지는 케바케입니다.

서비스 확장성과 데이터 영속성의 필요에 따라 갈리는 선택지:

* 단순히 캐싱만 사용할 계획이다. &rarr; MemCached
* 확장성과 데이터 영속성, 분산 캐시 환경이 필요하다. &rarr; Redis

### MemCached vs Dictionary 자료구조 기반

간단히 비교해보겠습니다.

||||
|:---:|:---:|:---:|
|**기준**|**MemCached**|**Dictionary**|
|**데이터 공유**|여러 서버 인스턴스 간 공유|여러 서버의 캐시 공유 불가능|
|**서비스 규모**|분산 서버, 대규모 트래픽의 적합|단일 서버, 소규모 애플리케이션|
|**속도**|네트워크 지연 가능성 존재, 다만 빠름|네트워크 지연 없음, 로컬 메모리로 매우 빠름|

확장 가능성에 따라 갈리는 선택지:

* 단순 로컬 캐시가 필요한 경우 &rarr; Dictionary
* 데이터 공유와 분산 캐시 환경이 필요한 경우 &rarr; MemCached

---

## 결론

우선, 모든 상황까지는 아니여도 대부분의 경우 Redis가 정답입니다. 서비스 규모가 커질수록 안정성, 성능을 함께 잡을 수 있는 선택지가 Redis입니다.

하지만, 첫 문장처럼 '은총알은 없기'때문에주어진 상황에 따라 적절히 선택하는 것이 올바를 것 같습니다.작은 규모의 서비스라면 MemCached나 Dictinary 방식도 고려해 볼 만한 선택지입니다.

||||||
|:---:|:---:|:---:|:---:|:---:|
|**기준**|**Dictionary**|**MemCached**|**Redis**|**MySQL**|
|**속도 순위**|1|2|3|
|**자료구조 지원**|O|X|O|▵|
|**분산 지원**|X|▵|O|X|
|**File 저장 지원**|X|X|O|O|

