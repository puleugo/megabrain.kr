---
authors: puleugo
date: Sun, 16 Feb 2025 12:00:48 +0900
---

# [NestJS] AdminJS 프로덕션 배포하기

![](https://blog.kakaocdn.net/dn/bk4Jtx/btsMiJrJ2oR/FftjBdDZ6rm6uYYsdkUo1K/img.png)

## 무엇이 문제인가?

(잘 알고 있으시겠지만) TypeScript로 작성된 파일들을 JavaScript로 컴파일하여 배포해야합니다. 보통 dist 디렉터리에 모아서 배포합니다.

하지만 AdminJS는 빌드해주는 명령어도 공식문서에 없습니다. 개발 환경에서는 생각못했다가 배포할 때 겪는 문제입니다.

## 어떻게 해야 하는가?

### 1\. 번들링하기

당연하게도 AdminJS 페이지에 해당하는 TypeScript 파일들을 빌드해주면 됩니다. 문서에 안 나와있지만 adminjs에서 지원하는 [bundler](https://github.com/SoftwareBrothers/adminjs-bundler)가 있습니다.

tsconfig.json > compilerOptions.module의 값이

* commonjs인 경우에는 [2.0.0 이하 버전](https://www.puleugo.dev/util/clipboard.html?text=%22@adminjs/bundler%22:%20%22%5E2.0.0%22)을 설치하시면 됩니다.
* 그외(ESM)인 경우에는 [3.0.0 이상 버전](https://www.puleugo.dev/util/clipboard.html?text=%22@adminjs/bundler%22:%20%22%5E3.0.0%22)을 설치하시면 됩니다.

저는 프로젝트가 commonjs이기 때문에 2.0.0 버전을 예시로 듭니다. 큰 차이는 없으니 메서드의 jsDoc을 참고하여 사용하시면 됩니다.  
2.0.0 버전의 경우엔 아래와 같이 사용합니다.

```
//   src/admin/component/index.ts
import { ComponentLoader } from 'adminjs';

export const componentLoader = new ComponentLoader();
export const components = {
  NotEditableInput: componentLoader.add('NotEditableInput','./NotEditableInput',),
};


//   src/bundler.ts
import { bundle } from '@adminjs/bundler';
import { join } from 'path';

void (async () => {
  await bundle({
    // yarn run build 시 compoent들이 전부 초기화되는 파일 경로
    customComponentsInitializationFilePath: 'src/admin/component/index.ts',
    // 초기화된 compoent들을 번들링하여 결과물을 저장할 Directory 경로
    destinationDir: 'dist/public',
  });
})();
```

package.json > scripts를 수정

* ["build": "nest build && node dist/bundler.ts"](https://www.puleugo.dev/util/clipboard.html?text=%22build%22:%20%22nest%20build%20&&%20node%20dist/bundler.ts%22)

yarn run bundle 시 `src/bundler.ts 파일에서 destinationDir로 설정한 위치`에 번들링 결과물이 저장됩니다.

### 2\. 번들링 적용하기

AdminJS는 Client Side Rendering 입니다. 때문에 번들링 파일들의 외부 접근을 제공해줘야만 합니다.  
이후 번들링 결과물을 정적의 형태로 제공해줘야 합니다. 저는 Vercel에서 Serverless를 기능을 활용하고 있으므로 vercel.json을 아래같이 수정하겠습니다.

```
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["dist/**/*"]
      }
    },
    {
      "src": "dist/public/**/*",
      "use": "@vercel/static",
      "config": {
        "outputDirectory": "dist/public"
      }
    }
  ],
  "routes": [
    { "src": "/public/(.*)", "dest": "/dist/public/$1", "methods": ["GET"] },
    { "src": "/(.*)", "dest": "/dist/main.js" }
  ]
}
```

Nest.js만 사용하고 있으시다면 ServeStaticModule을 사용하시면 됩니다.

### 3\. 번들링 파일 불러오기

```
@Module({
    imports: [
        AdminJsModule.createAdminAsync({
            useFactory: () => ({
                adminJsOptions: {
                    rootPath: '/admin',
                    assetsCDN: 'https://serverless-adminjs.vercel.app/public/', // 마지막에 /를 꼭 붙여야함
                }
            }),
        }),
    ],
})
export class AdminModule implements OnModuleInit {
     async onModuleInit() {
        if (process.env.NODE_ENV === 'development') {
            await adminjs.watch();
        }
    }
}
```

이렇게 수행하면 끝.

[코드 예제](https://github.com/puleugo/nestjs-adminjs-serverless)

[GitHub - puleugo/nestjs-adminjs-serverless: NestJS 환경에서 AdminJS를 사용하는 예제 코드입니다.

NestJS 환경에서 AdminJS를 사용하는 예제 코드입니다. Contribute to puleugo/nestjs-adminjs-serverless development by creating an account on GitHub.

github.com](https://github.com/puleugo/nestjs-adminjs-serverless)

---

## 그 외 이슈:

### Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons

AdminJS 라이브러리가 사용하는 React 버전과 설치한 React의 버전이 동일하지 않아서 생기는 경우가 많습니다.  
`yarn list --depth=1` 명령어를 입력해서 AdminJS의 React 버전을 조회해 버전을 통일해줍시다.

### 서버리스 환경에서 배포 실패

서버리스는 근본적으로 서비스를 불변성으로 관리합니다. AdminJS는 `NODE_ENV`와 `사전 번들링 여부`와 상관없이 항상 임시 파일(./adminjs)에 번들링을 수행합니다.  
프로덕션 환경 변수에 `ADMIN_JS_SKIP_BUNDLE=true`를 추가해주면 문제없이 배포됩니다.

### EMS 버전을 사용해도 되나요?

AdminJS 또한 프론트엔드에서의 사용을 지원하기 떄문에 7.0.0 버전 이후로 EMS을 지원합니다. 하지만 Nest.js 같은 Node.js 계열 서버 라이브러리는 아직까지 CJS만을 지원하므로 버전업은 권장하지 않습니다.

### @tiptap/pm/state을 찾을 수 없대요..

별도로 작성했스빈다. [이 글](https://puleugo.tistory.com/217)을 읽어주세요.

