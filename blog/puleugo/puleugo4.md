---
authors: puleugo
date: Fri, 21 Jul 2023 20:14:03 +0900
---

# 원클릭 회원가입 승인 구현(telegram bot, AWS s3, Flutter, Nest.js)

### 서론

학교 애플리케이션을 개발 중, 학생증 사본을 통해 학생 인증을 하는 기능을 구현하려고 합니다.

사용 기술:

* nest.js 9.4.1
* node-telegram-bot-api 0.61.0
* aws s3, ec2

결과물:

![](https://blog.kakaocdn.net/dn/m1OAI/btsoypn4hN8/dw0uXqYUqmPScOwk5mipk1/img.png)

실제 운영되는 프로덕션입니다.

### 1\. telegram 봇 발급

이번에 구현 방식을 조사해보며 telegram을 선택하게 된 이유는 아래와 같다.

* p2p 방식으로 높은 기밀성
* 빠르게 개발할 수 있는 개발자 친화적 플랫폼

#### 1\. BotFather 검색 후 추가

![](https://blog.kakaocdn.net/dn/SbJfR/btsoyXdK6p3/irx0bdcaW9EjCP0KQ7ghO0/img.png)

#### 2\. /start 명령어를 입력하여 채팅을 시작해주세요.

![](https://blog.kakaocdn.net/dn/bvSQzy/btsov5EFACt/tRlYFP7SeidTIx6bR0ncvk/img.png)

#### 3\. /newbot 명령어를 입력하여 새로운 봇을 만들어주세요.

![](https://blog.kakaocdn.net/dn/tJ3KU/btsoxaLYe58/sT8h4BMAKDOspeUbKb8LH0/img.png)

#### 4\. 봇 이름을 입력해주세요.

![](https://blog.kakaocdn.net/dn/xPLW6/btsowbx49Cv/8rYgDlIelRWIHzFJjkh8K0/img.png)

네이밍 규칙은 마지막이 bot으로 끝나면 됩니다. (대소문자 무관) 이름이 이미 존재하는 경우, 다른 이름을 입력해주세요.

#### 5\. 봇 생성 완료

![](https://blog.kakaocdn.net/dn/cL2ujq/btsowsTR5JS/gucydDXZHsWBFtbxyG9rjK/img.png)

아래와 같이 API 봇과 API 키가 생성되었습니다.

#### 6\. 생성된 봇 추가 후 채팅 걸기.

![](https://blog.kakaocdn.net/dn/J4KR9/btsoyWlDDNq/M9KKJD2kHaP0GZDIFV9vAK/img.png)

/start 명령어를 보낸 후 <u>채팅을 걸어주세요</u>.

### 7\. chat\_id 가져오기

https://api.telegram.org/bot${bot key}/getUpdates 로 접속해주세요.

![](https://blog.kakaocdn.net/dn/bYoDsc/btsoxGX6rQJ/PZtM2v8cYQCVqjpGkUwWY1/img.png)

chat\_id를 메모해주세요. 유저의pk라고 생각하시면 됩니다.

여기까지 <u>bot api key</u>와 유저의 <u>chat id</u>를 받아야합니다.

### 2\. Nest.js 코드 예제

### 3\. AWS 설정

#### s3 설정

Bucket policy

```
{
    "Version": "2008-10-17",
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ijs-bucket/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::567894824337:distribution/EVE7H18KXODL9"
                }
            }
        }
    ]
}
```

#### IAM 설정

Role의 Trusted entities:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

policy:

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "VisualEditor0",
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:GetObject",
				"s3:ListBucket"
			],
			"Resource": [
				"arn:aws:s3:::ijs-bucket/*",
				"arn:aws:s3:::ijs-bucket"
			]
		},
		{
			"Sid": "VisualEditor1",
			"Effect": "Allow",
			"Action": "s3:ListAllMyBuckets",
			"Resource": "*"
		}
	]
}
```

#### EC2 설정

EC2 > Instances > {이미지를 업로드 하는 인스턴스 선택} > Actions > Security > Modify IAM Role > 위 IAM 등록

#### CloudFront 설정

cloudFront는 너무 길어서 영상 첨부합니다.

---

### 결과물

![](https://blog.kakaocdn.net/dn/m1OAI/btsoypn4hN8/dw0uXqYUqmPScOwk5mipk1/img.png)

### 공식 문서 및 Github

* github [https://github.com/puleugo/IJS/blob/main/src/app/auth/authentication/authentication.service.ts](https://github.com/puleugo/IJS/blob/main/src/app/auth/authentication/authentication.service.ts)
* node telegram bot api docs [https://www.npmjs.com/package/node-telegram-bot-api](https://www.npmjs.com/package/node-telegram-bot-api)

