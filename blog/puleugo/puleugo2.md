---

authors:

  - name: 임채성

    title: 팀장

    url: https://github.com/puleugo

    image_url: https://github.com/puleugo.png

    socials:

      github: puleugo

date: Wed, 31 Jul 2024 18:49:35 +0900

---

# [Node.js] 트랜잭션을 활용한 테스트 격리 환경 구현하기 (1/2) | 솔루션 찾기

## 서론

* 트랜잭션을 통해 테스트 격리성을 가져가고 싶었습니다.
* 단, TypeORM에는 세션을 관리해주지 않아, 하나의 테스트만 실행해도 여러개의 세션이 연결됩니다.
* 위 제약사항에 대한 접근방식 + 해결방법을 공유하겠습니다.

## 트랜잭션으로 테스트 격리성을 확보한다는게 무슨말이야?

각 테스트 간의 영향을 끼치지 않도록 하는 테스트 방법입니다. 크게 두가지 전략이 있습니다.

* **트랜잭션 전략**: 테스트 시작과 끝에 <u>트랜잭션을 시작하고 롤백</u>하는 전략
* 클린업 전략: 테스트 종료 후 DB의 모든 행을 제거하는 전략

둘다 처음 들어본다면 향로님의 [재미있는 글](https://jojoldu.tistory.com/761)이 있으니 추천드립니다. *([테스트 데이터 초기화에 @Transactional 사용하는 것에 대한 생각](https://jojoldu.tistory.com/761), 향로, 2023. 11. 26.)*

```
beforeEach(async () => {
	await queryRunner.startTransaction();
});

afterEach(async () => {
	await queryRunner.rollbackTransaction();
});
```

그렇다면 위 코드만으로 해결되지 않을까요? 테스트를 실행해봤습니다.

```
it(`변경된 게임을 수정한다`, async () => {
	// given
	await gameFactory.save(GameMother.createGame({ edited: true })); // 1️⃣ DB에 게임 삽입

	// when
	await service.updateEditedGame(); // ❌ DB에 변경된 게임이 없음!

	// then
	expect(gameFactory.findBy({ edited: true })).toHaveLength(0); // ❌ 1개 존재함!
	},
);
```

분명히 given절에서 삽입해줬을 게임을 찾을 수 없다고 합니다.  
MySQL의 트랜잭션 <u>격리수준이 [REPEATABLE READ](https://puleugo.tistory.com/143#REPEATABLE-READ)이기 때문</u>이라고 예상할 수 있지만, 여기서 알 수 있는 점이 한가지 더 있습니다.

트랜잭션의 삽입된 데이터를 못 읽는다는 것은 **서로 세션이 다르다**는 것입니다.

```
it(`변경된 게임을 수정한다`, async () => {
	// given
	await gameFactory.save(GameMother.createGame({ edited: true })); //  ️ DB 세션 A

	// when
	await service.updateEditedGame(); //  ️ DB 세션 B

	// then
	expect(gameFactory.findBy({ edited: true })).toHaveLength(0);
	},
);
```

따라서 <u>Fixture와 Service가 서로 다른 세션을 가지고 있다고 가정</u>할 수 있습니다.

바로 검증을 위한 테스트코드를 작성해보았습니다.

```
it(`Service와 Fixture의 DB 세션이 동일하다`, async () => {
	const factorySession = await gameFactory.query(
		'SELECT * '+
		'FROM information_schema.PROCESSLIST '+
		'WHERE ID = CONNECTION_ID()'
	); // 
	const serviceSession = await service.getCurrentDbSessionInfo();
	
	expect(serviceSession).toStrictEqual.(factorySession); // ❌ 실패! 서로 다른 세션!
    
	// 결과:
	// Object {
	// "COMMAND": "Query",
	// "DB": "test_wtgames",
	// - "HOST": "192.168.65.1:53751",
	// - "ID": "35", //  ️ 서비스의 세션
	// + "HOST": "192.168.65.1:53752",
	// + "ID": "36", //  ️ 팩터리의 세션
	// "INFO": "SELECT ID , USER, HOST, DB, COMMAND, TIME, STATE, INFO
	// FROM information_schema.PROCESSLIST WHERE ID = CONNECTION_ID()",
	// "STATE": "executing",
	// "TIME": 0,
	// "USER": "user",
	// "EXCUTE_ENGINE": "PRIMARY",
});
```

가정대로 세션이 다릅니다.

그럼 이 문제를 해결하기 위해 어떻게 접근하면 좋을까요?

## 격리수준만 낮추면 되는거 아닐까?

![](https://blog.kakaocdn.net/dn/bToeXT/btsIRPm37rh/tfmb7A4LyxBxvUXf87WAxk/img.jpg)

(진짜 모름)

트랜잭션 내의 INSERT된 데이터를 읽기만 하면 되니까 두 트랜잭션을 모두 READ UNCOMMITTED로 변경해보겠습니다.

* READ UNCOMMITTED: 커밋되지 않은 데이터를 읽을 수 있는 격리수준

```
-- TEST_DB
SET GLOBAL TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; -- 격리수준 변경
SELECT @@GLOBAL.transaction_isolation, @@GLOBAL.transaction_read_only; -- 격리수준 조회
-- 격리수준 조회결과
+--------------------------------+--------------------------------+
| @@GLOBAL.transaction_isolation | @@GLOBAL.transaction_read_only |
+--------------------------------+--------------------------------+
| READ-UNCOMMITTED               |                              0 |
+--------------------------------+--------------------------------+
```

**READ UNCOMMITTED으로 변경한다면 삽입된 값을 읽어올 수는 있습니다**. 그런데 데드락이 발생하네요.

```
it(`변경된 게임을 수정한다`, async () => {
	// given
	await gameFactory.save(GameMother.createGame({ edited: true }));

	// when
	await service.updateEditedGame(); // ❌ 데드락 발생! 타임 아웃 실패!

	// then
	expect(gameFactory.findBy({ edited: true })).toHaveLength(0);
    
	// ❌ 결과:
	// Error: Lock wait timeout exceeded; try restarting transaction
	},
);
```

.updateEditedGame 메서드는 당연하게 update 쿼리를 사용합니다. 그러면 다음과 같은 순서로 진행됩니다.

![](https://blog.kakaocdn.net/dn/sIuDh/btsIRxG6u83/ZuYd7DsWYlbkk2LPCQ21l0/img.png)

서로가 종료되기를 기다리고 있다..

그럼 어떻게 해야할까요? **바로 하나의 세션만을 사용하여 테스트를 진행하면 됩니다.**  
Spring의 JPA 경우에도 @Transactional AOP가 @Transactional 어노테이션을 만날 때 기존 세션을 사용합니다. 자세한건 트랜잭션 전파를 검색해봅시다.

우선 여기까지가 제가 작성한 테스트가 실패하는 이유였으며, 이제 해결해봅시다.

## 어떻게 한 테스트에서 하나의 세션만을 사용할까?

TypeORM에는 DataSource라는 커넥션을 관리할 수 있는 객체가 존재합니다. 이를 사용하여 문제를 해결해봅시다.

(ConnectionManager와 관련 Hook은 deprecated되었습니다.)

```
export async function getDbConnection() {
	return await new DataSource({
		...options,
		name: 'default',
	}).initialize();
}
```

DB와 연결하는 부분에 'default' 세션을 생성하도록 했습니다. Fixture를 위한 Repository 인스턴스를 생성해야합니다.

이렇게 하면 해결될 것 같지만 해결해야할 문제가 하나 더 있습니다.

**영속성 레이어가 'default' 세션을 사용하도록 해야합니다.**

```
@Injectable()
export class GameRepo {
	constructor(
		@InjectRepository(GameEntity)
		private readonly repo: Repository<GameEntity>, // &larr; @InjectRepository()를 통해 DI중
	) {}
    
    // ...
}
```

DI는 이번 이슈의 주목할 부분이 아니므로 그냥 아래처럼 해결했습니다. (이런 자잘한건 다음편에서..)

```
beforeAll(async () => {
	queryRunner = (await getDataSource()).createQueryRunner(); // 1️⃣ 커넥션 가져오기

	const module: TestingModule = await Test.createTestingModule({
		imports: [
			getDbModule(),
			TypeOrmModule.forFeature([...]),
			],
		providers: [
			SheetService,
			{
				provide: GameRepoToken,
				useValue: new GameRepo(
					new Repository(GameEntity, queryRunner.manager, queryRunner),
				), // 2️⃣ Repository 인스턴스 생성
			},
			],
	}).complie();
        
	gameFactory = new Repository(GameEntity, queryRunner.manager, queryRunner); // 2️⃣ Fixture 클래스 default 커넥션
	});
    
beforeEach(async () => {
	await queryRunner.startTransaction();
})

afterEach(async () => {
	await queryRunner.rollbackTransaction();
	await queryRunner.release();
})
```

이렇게하면 하나의 테스트가 하나의 세션을 통해 처리됩니다.

테스트 결과는 다음과 같습니다.

```
 // ✅
it(`서비스와 팩터리의 DB 세션이 동일하다`, async () => {
	const factorySession = await gameFactory.query('SELECT CONNECTION_ID()');

	const serviceSession = await gameService.getCurrentDbSession();

	expect(serviceSession).toStrictEqual(factorySession);
});

 // ✅
it(`팩터리에서 생성한 데이터를 서비스에서 수정한다`, async () => {
	await gameFactory.save(GameMother.createGame({ edited: true }));

	const result = sheetService.updateEdited();

	expect(result).resolves.not.toThrow();
});
```

성공적으로 테스트가 수행됩니다.

### QueryRunner vs DataSource vs Repository

번외로 싱글 커넥션만 가질 수 있는 queryRunner라는 클래스가 존재합니다. DataSource에서 .createQueryRunner()를 사용해서 인스턴스를 얻을 수 있습니다.

```
 // ❌ 복수의 세션
it(`DataSource에서 얻은 쿼리러너와 팩터리의 DB 세션이 동일하다`, async () => {
	const dataSource = getDataSource();
	const queryRunner = dataSource.createQueryRunner();

	const factorySession = await factory.query('SELECT CONNECTION_ID()');
	const queryRunnerSession = await queryRunner.query('SELECT CONNECTION_ID()');

	expect(queryRunnerSession).toStrictEqual(factorySession); // ❌ 다른 세션
});

// ✅ ❗ 암묵적인 이슈 존재
it(`쿼리러너와 dataSource의 세션이 동일하다`, async () => {
	const dataSource = getDataSource();
	const factory = dataSource.getRepository(GameEntity);

	const dataSourceSession = await dataSource.query('SELECT CONNECTION_ID()');
	const factorySession = await factory.query('SELECT CONNECTION_ID()');

	expect(dataSourceSession).toStrictEqual(factorySession); // ⭕ 같은 세션
});


// ❌ 지맘대로 커밋
it(`팩터리가 지맘대로 커밋하지 않는다`, async () => {
	const dataSource = getDataSource();
	const factory = dataSource.getRepository(GameEntity)
    
	await dataSource.query('START TRANSACTION');
	await factory.save(GameMother.createGame()); // ❗ 지맘대로 트랜잭션 생성하고 커밋
	await dataSource.qeury('ROLLBACK');

	expect(await factory.find()).toHaveLength(0); // ❌ 이미 커밋되서 롤백안됨.
});

 // ✅ Best Practice.
it(`쿼리러너를 주입한 팩터리와 쿼리러너의 DB 세션이 동일하다`, async () => {
	const queryRunner = getDataSource().createQueryRunner();
	const factory = new Repository(
		GameEntity, 
		queryRunner.manager, 
		queryRunner, // ⭐ 쿼리러너 주입
	);

	const factorySession = await factory.query('SELECT CONNECTION_ID()');
	const queryRunnerSession = await queryRunner.query('SELECT CONNECTION_ID()');

	expect(queryRunnerSession).toStrictEqual(factorySession); // ⭕ 같은 세션
});
```

단, .createQueryRunner 메서드는 무조건 익명 세션을 생성하는 메서드이므로 사용하실 때 참고하셔야합니다.

3번째 테스트 '팩터리가 지맘대로 커밋하지 않는다'는 왜 실패할까요?

```
// ❌ 롤백 실패
it(`팩터리가 지맘대로 커밋하지 않는다`, async () => {
	const dataSource = getDataSource();
	const factory = dataSource.getRepository(GameEntity);

	await dataSource.query('START TRANSACTION');
	await factory.save(GameMother.createGame()); // ❗ 지맘대로 트랜잭션 생성하고 커밋
	await dataSource.query('ROLLBACK');

	expect(await factory.find()).toHaveLength(0); // ❌ 이미 커밋되서 롤백 실패
});

// ✅ Best Practice. 롤백 성공
// queryRunner 주입방식
it(`팩터리가 지맘대로 커밋하지 않는다`, async () => {
	const queryRunner = dataSource.createQueryRunner();
	const factory = new Repository(
		GameEntity,
		queryRunner.manager,
		queryRunner, // ⭐ 쿼리러너 주입
	);

	await queryRunner.startTransaction();
	await factory.save(GameMother.createGame());
	await queryRunner.rollbackTransaction();

	expect(await factory.find()).toHaveLength(0); // ⭕ 롤백 성공
});

// ⭕ 트랜잭션 여부를 알고있다.
it(`queryRunner가 트랜잭션 활성화 여부를 알고 있다..`, async () => {
	const queryRunner = dataSource.createQueryRunner();
    
	await queryRunner.startTransaction();
    
	expect(queryRunner.isTransactionActive).toBeTruthy(); // 트랜잭션이 활성화 여부가 true
});
```

다만, 1번 방식은 repository가 트랜잭션의 활성화 여부를 모르기 때문에 **repository.save 같은 몇몇 메서드에서 의도치 않은 커밋을 발생시킵니다.** 자세한건 ([typeorm/src/persistence /EntityPersistExecutor.ts](https://github.com/typeorm/typeorm/blob/e7649d2746f907ff36b1efb600402dedd5f5a499/src/persistence/EntityPersistExecutor.ts#L162))

---

여기까지가 원하는 트랜잭션만 사용해서 테스트를 수행하는 방법이었습니다.

다음편에서는 주제인 테스트 환경을 구축해보겠습니다.

인프런팀도 TypeORM 환경에서 트랜잭션 전략을 사용하고 있다고 알고 있는데, 개인적으로 관련 글을 작성해주셨으면 좋겠습니다.

