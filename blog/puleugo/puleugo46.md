---
authors: puleugo
date: Tue, 4 Mar 2025 01:51:41 +0900
---

# [AdminJS 에러] Cannot find module '@tiptap/pm/state'

Github 이슈에 해답이 없어서 작성합니다.

# 해결방법

6.8.4 이상의 버전을 사용하면 됩니다.  
[해결 커밋](https://github.com/SoftwareBrothers/adminjs/commit/149ad304dbc6c1f39b4e8054b55d139ca7dde5e1)(버전 반영은 이후에 있습니다.)

CJS 환경을 사용하시는 경우에는 package.json에 아래 코드를 추가해주세요.

```json
    "resolutions": {
        "@tiptap/core": "2.0.3",
        "@tiptap/pm": "2.0.3",
        "@tiptap/starter-kit": "2.0.3"
    },
```

