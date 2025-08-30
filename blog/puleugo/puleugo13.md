---
authors: puleugo
date: Tue, 2 Jan 2024 12:00:51 +0900
---

# #1 Java I/OStream이란

## 서론

이 시리즈는 3개월간 Spring, Docker, Jetbrains ide, Non-standard libraries etc 하이레벨 기술을 사용하지 않고 서비스를 구현해보는 시리즈입니다. 누구보다 자동화, 숏컷, 프레임워크를 좋아하지만 너무 맹목적으로 기술에 의존하지 않기 위해 공부합니다.  
또한, 개인이 작성한 블로그 글을 읽지 않고 공식 문서만을 읽으면서 공부하며 자동완성, 붙여넣기 기능을 사용하지 않습니다.

기준: JDK 8

I/O Stream이 무엇인지 알아볼 것입니다.

## 본론

### Stream이란

Stream은 '[(계속) 흐르다](https://languages.oup.com/google-dictionary-en/)'라는 의미를 가지고 있습니다. 저희가 일상에서 들을 수 있는 용어는 스트리밍(Streaming)으로 Java에서는 자원의 입/출력을 이야기합니다. 자바에서는 데이터를 I/O Stream을 통해 수/송신합니다. 리스코프 치환 원칙에 따라 자원 수/송신에 관한 것들은 전부 I/OStream을 통해 처리 가능합니다.

![](https://blog.kakaocdn.net/dn/bfPFEd/btsCN7AoV35/jO1mLKhKcESC9Seb5RQR81/img.png)

이미지1

자바에서는 [InputStream](https://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html)/[OutputStream](https://docs.oracle.com/javase/8/docs/api/java/io/OutputStream.html)을 통해 이를 구현할 수 있습니다.

[Stream API](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html)이랑은 전혀 관련 없다.

InputStream 살펴보기

InputStream은 데이터 읽기를 담당하는 추상클래스입니다.

InputStream class의 구조는 다음과 같습니다.

```
public abstract class InputStream
extends Object
implements Closeable
```

자주 쓰는 메소드만 살펴보겠습니다.

* abailable(): 더 읽을 수 있는 byte 수를 조회함.
* close(): 연결 끊기(Closeable 구현)
* read(): 다음 byte를 읽어 int로 반환합니다. 더 이상 읽을게 없다면 -1을 반환합니다.
* read(bytes\[\]) **bytes\[\] 변수 사이즈만큼 읽습니다. 읽은 byte 수를 반환하고, 더 이상 읽을게 없다면 -1을 반환합니다.**
* 그 외 Object에서 상속한 것들

read() 메소드를 사용하면 여러번 읽어들여야하기 때문에 read(byte\[\]) 메소드를 권장합니다. 64bit 컴퓨터라면 8kb 단위로 읽는 것을 권장합니다.

### OutputStream 살펴보기

OutputStream은 데이터 쓰기를 담당하는 추상 클래스입니다.

OutputStream class의 구조는 다음과 같습니다.

```
public abstract class OutputStream
extends Object
implements Closeable, Flushable
```

추상클래스인 OutputStream은 아래와 같은 함수를 가지고 있습니다.

* close(): 연결 끊기 (Closeable 구현)
* flush(): 버퍼에 담겨 있는 바이트 보내기(Flushable 구현)
* write(byte\[\] b): 바이트 보내기
* write(byte\[\] b, int offset, int len): **offset부터 len만큼의 바이트 보내기**
* write(int b): int에 해당하는 바이트 보내기
* 그 외 Object에서 상속한 것들

write와 flush의 차이입니다. [flush](https://docs.oracle.com/javase/8/docs/api/java/io/Flushable.html)는 아웃풋 스트림에 write를 통해 쓴 데이터들이 버퍼링된 것을 강제로 보내버립니다.

flush를 이해하시려면 flush의 뜻을 보셔야합니다. flush: ~하지 않던 것을 ~시킨다.

가장 자주 쓰이는 표현은 flush the toilet.(변기물을 내리다), flush somebody out of room.(누군가를 방에서 쫓아냈다) 등이 있습니다. IT에서는 '암시적으로 프로세스에서 관리하고 있던 것들을 강제로 적용시킨다/보낸다.' 같은 의미로 주로 사용됩니다.

### Buffer란

버퍼링(Buffering)란 데이터를 보낼 때 한번에 특정 데이터를 보낼 때 그 데이터를 부분적으로 쪼개는 것을 말합니다. 쪼갠 데이터 조각은 buffer 혹은 chunk라고 부릅니다.

![](https://blog.kakaocdn.net/dn/wW679/btsCOBJpasR/yyj9hJtbyGqamDQpTQ1qgk/img.png)

프로젝트 진행하다보면 이미지나 영상같이 용량이 큰 데이터를 보내는 일이 굉장히 많기 때문에 기본적으로 미리 정해둔 chunk 단위로 데이터를 쪼개서 보냅니다.

### Stream 활용하기

#### 파일 -> 파일

```
import java.io.*;

class FileStreamExample {
	public static void main(String[] args) throws Exception {
		FileInputStream fromFile = new FileInputStream("./test1.jpg");
		FileOutputStream toFile = new FileOutputStream("./test2.jpg");

		byte[] chunk = new byte[1024*8];
		int size;
		while((size = fromFile.read(chunk)) != -1) {
			toFile.write(chunk, 0, size);
			toFile.flush();
		}
		fromFile.close();
		toFile.close();
	}
}
```

아주 심플하게 test1.jpg 파일의 byte\[\]을 읽어 test2.jpg에 쓰는 코드입니다. 파일을 읽고 쓰기에 사용되는 데이터는 모두 byte\[\]입니다.

#### 문자열 -> 문자열(터미널)

```
import java.io.*;

class IOStreamExample {
	public static void main(String[] args) throws Exception {
		InputStream toTerminal = System.in;
		OutputStream fromTerminal = System.out;

		byte[] chunk = new byte[1024*8];
		int size;
		while((size = toTerminal.read(chunk)) != -1) {
			String message = new String(chunk, 0, size, "UTF-8");
			if (message.equals("done\n")) {
				toTerminal.close();
				break;
			}
			fromTerminal.write(message.getBytes());
			fromTerminal.flush();
		}
		fromTerminal.close();
		toTerminal.close();
	}
}
```

문자열이어도 실제로 통신에 사용되는 데이터는 byte\[\]입니다. 파일같은 단순 byte와는 다르게 문자열은 encoding을 고려해야합니다. 문자열을 읽을 때, 쓸 때 encoding 작업을 수행해줘야합니다.
<p data-ke-size="size26">결론</h2> <ul style="list-style-type: disc;" data-ke-list-type="disc"> <li>모든 프로그램은 내부적으로 byte\[\]을 통해 송/수신합니다.</li> </ul> <p data-ke-size="size16">다음 글에는 네트워크를 통해 소켓통신과 HTTP 프로토콜로 데이터를 보내보겠습니다.</p> <div id="gtx-trans" style="position: absolute; left: 886px; top: 4108.12px;"> <div class="gtx-trans-icon"> </div>

