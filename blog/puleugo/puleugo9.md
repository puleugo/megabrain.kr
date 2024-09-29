---
authors: puleugo
date: Mon, 16 Sep 2024 15:34:21 +0900
---

# 괴물 메서드 리팩터링과 성능개선하기

[발표 영상](https://youtu.be/C2ns5fGUxz8)
---

안녕하세요. 왁타버스 게임즈의 백엔드 팀의 임채성입니다. 이번 글에서는 저희 팀의 오랜 과제였던 '구글 스프레드시트 동기화 메서드'의 리팩터링 과정과 성능 개선 방법을 공유하려고 합니다.

## 왁타버스 게임즈와 백엔드 팀의 역할

먼저 왁타버스 게임즈가 어떤 서비스인지 설명드리고 개발팀에서 달성해야하는 목표를 설명드리겠습니다. 저희 서비스는 유튜버 우왁굳의 메타버스 컨텐츠인 왁타버스의 팬 게임 &sdot; 어플리케이션 플랫폼입니다.

* 팬 게임과 랭킹 그리고 도전과제 등 **다양한 기능**
* 스프레드 시트로 어드민 페이지로 사용하기 때문에 DB와 **데이터 일관성** 제공
* 24시간 **무중단 운영**
* 팬 게임&sdot;어플리케이션의 랭킹과 다운로드 수 및 조회수 **통계 제공**

이러한 특성들을 고려했을 때 저희팀은 B2B와 디지털 플랫폼 비즈니스로 **<u>서류작업과 파트너 팀과의 협업이 많은 팀</u>**이라고 볼 수 있습니다. (엄밀히 따지면 비상업 프로젝트이기에 비즈니스는 아닙니다.)

## 스프레드 시트 데이터 동기화 메서드란?

플랫폼 비즈니스에서 가장 중요한 건 콘텐츠입니다. 개발 초기부터 스프레드 시트를 사용하여 팀 간의 의존없이 콘텐츠 수집과 서비스 개발이 이루어지며 왁타버스 게임즈 서비스가 빠르게 성장할 수 있었습니다. 따라서 왁타버스 게임즈의 기반이 되는 기능이라고 볼 수 있습니다.  
서비스의 기반이 된다는 것은 무슨 의미를 가지고 있을까요? 어떤 기능보다 먼저 개발되었으며 가장 오래된 기능이라는 의미기도 합니다. 왁타버스 게임즈는 올해로 2년차에 접어들었고, 파트너 게임도 약 200개을 넘겼습니다. 트래픽도 초창기에 비해서 훨씬 많아졌습니다. 관리하는 도메인의 추가와 시트 내 필드 수 증가로 해당 메서드를 수정 가능하도록 리팩터링해야하는 상황에 도달했습니다. 그렇다면 데이터 동기화 메서드가 어떤 상태였는지 확인해보도록 하겠습니다.

### 괴물 메서드의 문제점

레거시 코드 활용 전략이라는 책에서 아래와 같은 문구가 나옵니다.

> 대규모 메서드는 다루기 힘든 수준이라면, 괴물 메서드는 재앙이라고 부를 만하다. 괴물 메서드는 너무 길고 복잡해서 손대고 싶지 않은 메서드를 의미한다.

왁타버스 게임즈 팀을 운영된 2년동안 이 메서드에는 수많은 도메인들이 추가되었고 복잡한 조건이 추가되면서 끔찍한 괴물 메서드가 되어 있었습니다. 데이터 동기화 메서드 코드의 상황은 다음과 같았습니다.

* 코드 길이가 600줄을 넘음.
* 테스트 코드가 없고, 수정 시 큰 부담을 줌.
* 코드의 동작 범위를 완벽하게 이해하는 사람이 없음.
* 복잡한 조건이 계속 추가되며 유지 보수가 어려워짐.

수정하는 입장에서 굉장히 부담스럽고 어려운 메서드입니다.  
이제 스프레드 시트와 DB의 정보를 동기화하는 메서드를 괴물 메서드라고 부르도록 하겠습니다.

## 리팩터링하기

리팩터링하기 위해서는 이러한 순서로 진행합니다.

1. 분석하기
2. 리팩터링하기
3. 성능 개선하기

### 분석하기

가장 중요한 부분입니다. 메서드가 어떻게 동작하는지, 어떤 부분에서 문제가 발생하는지, 이 기능이 이 메서드에 있는 것이 적절한 코드인지, 또한 기존 코드의 동작 기능인지 아니면 버그인지 분류해야합니다. 팀원의 코드라도 맹목적으로 믿지 않아야 합니다.

![](https://blog.kakaocdn.net/dn/67jYi/btsJDu49Q1E/GTTcdC4u1IqYQjbtbigWck/img.png)

간단히 살펴봤을 때 문제점은 이 모든 처리가 동기 &sdot; 블로킹으로 동작하고 있다는 것입니다.

1. 함수 내 모든 코드가 동기 &sdot; 블로킹으로 처리되고 있음.
2. 3rd party api 호출 시 네트워킹을 불필요하게 반복해서 재연결함.

개선할 부분이 많이 보인다고 해서 이 코드를 바로 변경할 수 없습니다. 리팩터링하는 개발자는 코드의 그 함수의 역사와 영향 범위를 모르고 수정합니다. 이럴 때 필요한게 리팩터링입니다.

### 리팩터링하기

리팩터링이란 함수의 결과의 변경없이 코드의 구조만을 수정하는 방식을 말함. 하지만 리팩터링 또한 실수할 가능성이 없지는 않습니다. 이렇게 몇백줄이 넘는 코드를 리팩터링하는 경우에는 특히 더 실수가 많을 수 밖에 없습니다. 또한 문서가 없기에 코드 내에 어떤 기능이 동작해야하는 지도 정리되어 있지 않는 상황입니다.  
이때 적용할 수 있는 것이 테스트코드입니다. 테스트코드는 리팩터링 시에 다음과 같은 실수를 방지해줍니다.  
  
테스트코드란 정말 심플합니다. 함수가 의도대로 동작하는 지 검사해주는 역할을 합니다.

```
test('유저의 나이를 증가시킨다.', () => {
	let user = new User({age: 1});
	user.incrementAge();
	expect(user.age).toBe(2); // ✅ user.age == 2
})
```

![](https://blog.kakaocdn.net/dn/W4x5e/btsJDrT8J0Y/4fItIK1QKwD2N8n2hekA8K/img.png)

발표용 이미지

이를 통해 리팩터링 이 정상적으로 완료되었는 지 지속적으로 확인할 수 있습니다. 하지만 n백줄의 코드 내에 테스트해야하는 기능이 얼마나 있을까요? 굉장히 많을 것입니다. 특히 애플리케이션 외의 DB, Redis, 3rd Party API 등과 커뮤니케이션이 있는 이 함수의 경우 테스트가 더욱 복잡할 수 밖에 없습니다.  
그렇기에 이 함수를 테스트하기 쉬운 코드로 분리할 필요가 있습니다. 코드의 테스트 가치를 시각화한 표가 있습니다.

![](https://blog.kakaocdn.net/dn/buZToX/btsJDnj0FIu/guwi2upy0Lf6v9ZMJGrttK/img.png)

테스트 가치&sdot;난이도 시각화

현재 리팩터링하고자 하는 코드는 테스트 가치&sdot;난이도가 높은 '복잡한 코드'에 해당합니다. 이 코드를 리팩터링하기 위해서는 도메인 모델, 의존객체가 많고 간단한 코드로 분리할 필요가 있습니다. (자세히 알아보기: [만개의 테스트를 작성하지 마라. 202번째글](https://puleugo.tistory.com/202))

![](https://blog.kakaocdn.net/dn/b94atR/btsJEGCDayp/ejV1J473N9p5QGGVUFk4q0/img.gif)

개선 방안(gif)

이에 대한 해결 방법은 도메인 모델을 구현하여 이 코드 내에 모든 복잡한 로직들을 옮기고 기존의 서비스 레이어는 도메인의 흐름만을 적는 방식으로 개선하는 방안입니다. (자세히 알아보기: [\[번역\] 방금 당신이 작성한 코드는 도메인 로직인가? | What is domain logic? 204번 글](https://puleugo.tistory.com/204))

```
// Application Service: 계좌 출금 예제
private TakeMoney(amount: number): void {
	if(!this.atm.canTakeMoney) { // 인출이 가능한 지 확인한다.
		throw AtmHasNotEnoughMoney('인출 불가');
	}
	const amountWithComission = this.atm.calculateAmountWithComission(amount); // 수수료 포함 금액을 계산한다.
	this.paymentGateway.chargePayment(amountWithComission); // 금액을 청구한다.
	this.atm.takeMoney(amount); // 인출한다.
	this.repository.save(this.atm); // 저장한다.
}
```

간단히 요약하면:

* 도메인 레이어: 모든 의사 결정자
* 서비스 레이어: 도메인 레이어의 의사를 수행

### 도메인 모델로 분리하기

총 3가지 도메인 모델을 구현하였습니다.

* Row(행): CSV 1ROW -> JSON, JSON -> DB QUERY, Validate, Numbering etc
* Rows(행의 1급 콜렉션) -> FILTERING, UPSERT, etc
* SpreadSheet(스프레드 시트) -> FULL CSV ROW -> Rows Array(3차원 배열)

![](https://blog.kakaocdn.net/dn/NALtZ/btsJERKLYl2/HnZqwhjB27MXitwoyW4YLk/img.png)

다음과 같이 사용할 수 있음.

```
export interface SheetDto // DTO 정의
{
	[SheetEnum.GAME]: Rows<GameRow>;
	[SheetEnum.APP]: Rows<AppRow>;
	// ...
}

// 시트 데이터 가져오기
function async getSheetData(sheetRange: Set<SheetEnum>): Promise<SheetDto> 
{
	const sheet = new SpreadSheet();
    
    // 요청된 시트 범위가 없다면 초기값 반환
	if (sheetRange.size === 0)
		return sheet.values;

	const rawRows = await this.googleService.getRawSheet(this.sheetId, sheetRange); //   원시값 요청
	return sheet.fillRaws(rawRows).value; // 원시값을 가공하여 반환
}

// 메서드 사용
const {
	GAME: gameRows,	//   게임 행 데이터
	APP: appRows,	//   어플리케이션 행 데이터
} = this.getSheetData(new Set([SheetEnum.ALL]));
console.log(typeof gameRows); // Rows<GameRow>
console.log(typeof appRows);  // Rows<AppRow>

gameRows.filterBy({edited: true});	// 수정된 데이터를 필터링
gameRows.upsert(gameEntities);		// 데이터가 존재하면 업데이트, 존재하지 않으면 삽입
this.googleService.updateSheet(gameRows); // 구글 시트에 동기화
```

### 쿼리 로직은 영속성 레이어로 분리하기

기존 레거시 코드에서 존재하던 문제점은 비즈니스 레이어에서 쿼리를 작성하는 행위입니다.

![](https://blog.kakaocdn.net/dn/bdsQE6/btsJDW0BQZ0/KB19it7q66yCKKqZNlHqe0/img.png)

Layered Architecture 4Layer

```
class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly ormRepository: Repository<UserEntity>, // 1️⃣ Framework에서 생성한 Repository의 인스턴스를 주입받은 변수
		@Inject(UserRepository)
		private readonly userRepository: UserRepository, // 2️⃣ 내가 등록한 UserRepository의 인스턴스를 주입받은 변수
	) {}

	addUserAge(userId: number) 
	{
		this.ormRepository.createQueryBuilder() // ❌ 영속 레이어에서 처리하세요.
			.update().set({ age: () => 'age + 1' })
			.where({ id: userId })
			.excute();
	}
    
	refactoredAddUserAge(userId: number) 
	{
		this.userRepository.addUserAge(userId); // ✅ 복잡한 처리는 영속 레이어가 처리하자.
	}
}

@Injectable()
class UserRepository {
	constructor(
		@InjectRepository(UserEntity)
		private readonly ormUserRepository: Repository<UserEntity>,
	) {}
    
	addUserAge(userId: number)
	{
		this.ormRepository.createQueryBuilder()
			.update().set({ age: 'age + 1' })
			.where({ id: userId })
			.excute();
	}
}
```

### 리팩터링 결과

#### 폴더 구조

```
wt-games:
├─sheet
│ ├─sheet.module.ts
│ ├─sheet.controller.ts
│ ├─sheet.service.ts	# ⭐ 600 -> 200 lines
│ └─/domain				# ⭐ NEW
│   ├─spread-sheet.ts
│   ├─rows.ts
│   ├─row.ts
│   ├─game-row.ts
│   ├─application-row.ts
│   └─etc-row.ts
│
├─game
│ ├─game.module.ts
│ ├─game.service.ts		# 500 -> 300 lines
│ └─game.repository.ts	# ⭐ NEW
│
├─application
│ ├─application.module.ts
│ ├─application.service.ts		# 500 -> 300 lines
│ └─application.repository.ts	# ⭐ NEW
...
```

### 메서드 구조

```
async private syncGame(gameRows: Rows<Game>): Promise<void>
{
	// 1️⃣ Spreadsheet에서 삭제된 Game을 DB에서 삭제
	const deletedCount = await this.gameRepo.deleteExcludeBy({ids: gameRows.ids});
	// 2️⃣ Database에서 추가/변경된 게임을 조회하여 Rows에 동기화
	const editedGamesFromDb = await this.gameRepo.findEditedGames();
	gameRows.syncWithDbChanges(editedGamesFromDb);

	// 3️⃣ DB에 변경된 내용을 반영
	const gameEntities = gameRows.toEntities;
	await this.gameRepo.upsertMany(gameEntities);

	// 4️⃣ Spreadsheet에 변경된 내용을 반영
	const updatedGameRows = gameRows.updatedRows;
	const updatedRowInfos = updatedGameRows.toRowInfos;
	await this.googleService.updateGoogleDocument(this.sheetId, updatedRowInfos);
}
```

이와 같은 방식으로 리팩터링해줍니다. 복잡한 로직임에도 꽤나 가독성이 향상되었습니다.

## 성능 개선하기

### 과도한 API 호출(Excessive API Call) 개선하기

![](https://blog.kakaocdn.net/dn/upplN/btsJDzSjxjV/tlCY00CoGfNFQn8wJGxk20/img.png)

151개의 영상 정보를 얻기 위해 151회 호출

### 배치 처리(Batch Processing)

유튜브 API 명세상 한번에 50개의 영상 데이터만 조회 가능.

![](https://blog.kakaocdn.net/dn/lOBkj/btsJEDM0sey/6gUVw4DmU7QeGAyJOvikG0/img.png)

151개의 영상 정보를 얻기 위해 4회 호출

간단하게 계산해보겠습니다. 실제 동작 성능과 정확한 지표는 아니고 가정된 상황에 대한 지표임을 알립니다.

#### 가정

* 총 조회할 영상의 수: N = 1,000
* 한 번의 API 호출로 조회할 수 있는 영상의 수: 50
* 각 API 호출에 소요되는 시간: 0.5초 (네트워크 왕복 시간과 서버 응답 시간 포함)
* API 호출의 비용: $0.01/1000회 (예시로 설정한 API 요금 기준)

#### 1\. 기존 방식 (1회에 1개의 영상 조회)

* API 호출 횟수: N = 1,000
* 총 소요 시간: 1,000회 호출 \* 0.5초 = 500초
* 네트워크 비용: 1,000회 호출 \* $0.01/1000 = $0.01

#### 2\. 개선된 방식 (1회에 50개의 영상 조회)

* API 호출 횟수: &lceil; N/50 &rceil; = &lceil; 1,000/50 &rceil; = 20
* 총 소요 시간: 20회 호출 \* 0.5초 = 10초
* 네트워크 비용: 20회 호출 \* $0.01/1000 = $0.0002

|||||
|:---:|:---:|:---:|:---:|
|**항목**|**기존 방식**|**개선된 방식**|**개선 비율**|
|API 호출 횟수|1,000회|20회|98% 감소|
|총 소요 시간|500초|10초|98% 감소|
|네트워크 비용|$0.0.1|$0.0002|98% 감소|

### 동기적 처리로 인한 병목 현상(Synchronous Bottleneck)

![](https://blog.kakaocdn.net/dn/u1EKp/btsJDpJbvGd/wC3NGtKAInaz83KVUp3Fck/img.png)

### 비동기적 처리(Asynchronous Processing)

![](https://blog.kakaocdn.net/dn/cb0lkQ/btsJEovJLmU/ebb3UhCvQDzZEj79Wz5HcK/img.png)

이 방식을 적용해볼 때 중요한 것은 Node.js의 동작원리입니다. Node.js는 특징은 싱글스레드입니다. 데이터베이스와 논 블로킹, 비동기을 적극 사용하면서 훨씬 빠른 실행 결과를 얻을 수 있습니다.

중요한 것은 Promise.all 내부의 DB 커넥션을 고유하게 제공해야합니다. 만약, 하나의 DB 커넥션만 사용한다면 해당 커넥션을 사용중인 함수가 종료될 때까지 Promise Pool에서 대기하여 결과적으로 순차실행이 되기 때문입니다.

```
async syncSheet()
{
	const 
	{
		GAME: gameRows,
		APP: appRows,
		GAME_GENRE: gameGenreRows,
		APP_GENRE: appGenreRows,
		ACHIEVE: achieveRows,
		BANNER: bannerRows,
		GUIDE: guideRows,
		BADGE: badgeRows,
	} = await this.getSheetData();
    
	await Promise.all
	([
		syncGames(gameRows, gameGenreRows),
		syncApps(appRows, appGenreRows),
		syncAchieves(achieveRows),
		syncBanners(bannerRows),
		syncGuides(guideRows),
		syncBadges(badgeRows),
	]);
    
	const images = [gameRows.allImageIds, appRows.allImageIds, achieveRows.allImageIds, bannerRows.allImageIds, badgeRows.allImageIds].flat();
	await this.s3Service.uploadFiles(images);
}
```

관련 실험 글 [Promise.all 과 Transactions (feat. Node.js)](https://jojoldu.tistory.com/639).

### 성능 개선 결과

구동 환경보다 성능이 좋은 환경에서 구동시간 결과입니다.

* 실행 결과: 3s &rarr; 2.7s
* 약 10%의 속도 개선

