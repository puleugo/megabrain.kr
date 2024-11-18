---
authors: puleugo
date: Sun, 17 Nov 2024 21:44:55 +0900
---

# 이미지 로드 속도 향상하기

## 개요

* [waktaverse.games](https://waktaverse.games/) 웹 사이트의 이미지 로드 성능 개선을 수행했다.

## 너무 느려요. 개선해주세요.

![](https://blog.kakaocdn.net/dn/toR2D/btsKKFR12jJ/9FOuaq7CvxG2NGifV90thK/img.png)

상혁이가 Waktaverse 이미지 로드 속도가 느리다고 문의메일을 보냈다.

동아리 친구에서 이미지 성능개선 작업 해보고싶다고 말하니까, 내가 속한 팀에 메일을 보내줬다.

## 어느정도로 느린가?

![](https://blog.kakaocdn.net/dn/l6QRJ/btsKM5IieFD/43aiQCyAsjGDIvFpvnJKyK/img.png)![](https://blog.kakaocdn.net/dn/1DFPs/btsKMM93RNv/1R5zKSyHVIQRIkg4jQ4nPK/img.png)

Slow 4G: 28.54 s, Fast 4G: 5.88 s

Chrome Browser의 Performance 기능을 활용하여 성능을 측정해보았다. 네트워크/메모리 성능을 제한하여 측정해볼 수 있으므로 성능 개선 필요 여부를 확인하는데 추천하는 방법이다.

LCP(가장 큰 콘텐츠 페인트) 소요 시간을 측정했다.

* Slow 4G: 28.54s
* Fast 4G: 5.88s

참고로 2.5초 이하가 GOOD이다.

## 해결하기

저희 팀은 Cloudflare CDN을 사용하고 있습니다. 사용하시는 CDN이 다르다면 아래 내용 중 무엇이 왜, 필요한 지만 참고해주시기 바랍니다.

### 1\. 큰 이미지는 압축합시다.

흔히 사용하는 포맷은 png, jpg가 있지만, 웹 성능 향상을 위해 jpg보다 더 효율적인 압축 형식이 있습니다. 주로 WebP, AVIF가 있습니다.

Cloudflare에서 동일 이미지 URL에 대한 원본 이미지에 대한 압축본을 응답해주는 [Cloudflare Polish](https://developers.cloudflare.com/images/polish/) 기능이 존재합니다.

[Cloudflare Polish | Cloudflare Images docs

Cloudflare Polish is a one-click image optimization product that automatically optimizes images in your site. Polish strips metadata from images and reduces image size through lossy or lossless compression to accelerate the speed of image downloads.

developers.cloudflare.com](https://developers.cloudflare.com/images/polish/)

### 2\. 한번 받아온 이미지는 캐싱합시다. Cache-Control

현재 페이지를 새로고침할 경우 이미 로드한 이미지를 다시 불러오는 문제가 존재합니다. 이때 **HTTP 응답 헤더 Cache-Control**을 사용할 수 있습니다.

Cache-Control은 이미 수신한 리소스의 유효 시간이 지나기 전이라면, 브라우저가 서버로 새로운 요청을 보내지 않고 캐시로부터 리소스를 읽어와서 사용합니다.

![](https://blog.kakaocdn.net/dn/bRpKya/btsKLd8UzDV/GrqY61DcMwOyPxLQkbdmb0/img.png)

리소스가 남아있기에 캐시로부터 리소스를 가져옴.

## 개선결과

![](https://blog.kakaocdn.net/dn/RljS4/btsKLwUETOL/K90VlLUlfyKL0TQXkmMrG0/img.png)![](https://blog.kakaocdn.net/dn/wPgG0/btsKM2Sk16G/JukPyHFUsuBsIQVkfIsf6K/img.png)

Slow 4G: 8.24 s, Fast 4G: 2.39 s

'어떻게 해야겠다'는 명확했습니다.  
Cloudflare가 이렇게 편한줄 알았더라면 훨씬 더 빠르게 작업에 들어갈걸 그랬다.

