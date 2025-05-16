![Image](https://github.com/user-attachments/assets/323c3f6d-6812-455a-b40e-54045ddc38d8)

## 📌 프로젝트 소개
이모저모는 언어와 문화의 장벽 없이, 한국은 물론 전 세계 어디에서든<br>
쉽고 편리하게 미용 서비스를 이용할 수 있도록 돕는 글로벌 뷰티 플랫폼입니다.<br>
외국인 관광객이 한국에서 원하는 스타일을 손쉽게 찾고 예약할 수 있도록,<br>
우리는 직관적이고 실용적인 예약 경험과 정보 공유의 새로운 기준을 만들어갑니다.<br>

한국에서, 그리고 전 세계에서 — 당신만의 스타일을 완성해보세요.
<br><br>

## ✨ 링크
- 이모저모(일반 사용자) 바로 가기 👉 <http://www.imjm-hair.com/>
- 이모저모(파트너) 바로 가기 👉 <http://www.imjm-hair-partner.com/>
- 프로젝트 제안서 👉 [프로젝트 이모저모_제안서](https://www.notion.so/hahyeong/1b3e6743b89f81508b29f25e8a82268f?pvs=4)
- 프로젝트 보고서 👉 [프로젝트 이모저모 보고서.pdf](https://github.com/user-attachments/files/20241887/_.pdf)
- 프로젝트 코드 분석 👉 업뎃 예정
<br><br>

## 💻 팀 소개 
<table>
  <tbody>
    <th align="center">🐢 강승민</th>
    <th align="center">🐔 신동억</th>
    <th align="center">🐷 임성철</th>
    <th align="center">🐰 임하형(팀장)</th>
    <tr>
      <td align="center"><img src="https://github.com/user-attachments/assets/d2fafe01-bec6-499a-a153-e692d6b98a7a" width="150" height="150"></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/60741483-7544-451c-b4b4-585427fcdfe5" width="150" height="150"></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/524f37e2-b507-4dad-8a0d-b2aab0c6d2b2" width="120" height="120"></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/baed59fb-67ae-4a83-81c5-d57ffd0a2533" width="150" height="150"></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/SeungMin2055">SeungMin2055</td>
      <td align="center"><a href="https://github.com/shindongeok">shindongeok</td>
      <td align="center"><a href="https://github.com/limsc95">limsc95</td>
      <td align="center"><a href="https://github.com/hahyeong">hahyeong</td>
    </tr>
    <tr>
      <td align="center">아카이브 기능 구현<br>
                        (사진 추가, 댓글,<br>
                        대댓글, 좋아요)<br>
                        위도, 경도로 <br>
                        주변 미용실 찾기 구현<br>
                        (naver map api,<br>
                        kakao map api)<br>
                        미용실 상세 페이지 조회<br>
                        (bitmask,<br>
                        URI scheme 사용)
      </td>
      <td align="center">예약 페이지 기능 구현<br>
                        결제 페이지 구현<br>
                        (Google Pay API)<br>
                        마이 예약 리스트<br>
                        및 상세 페이지 구현<br>
                        마이 리뷰 작성,<br>
                        수정, 조회 페이지<br>
                        및 기능 구현
      </td>
      <td align="center">프로퍼티 암호화(Jasypt)<br>
                        DB 수정 및 엔티티 생성<br>
                        로그인/회원가입 구현<br>
                        (Spring Security, JWT,<br>
                        Google OAuth 2.0<br>
                        Kakao Map api)<br>
                        클라이언트 포인트 구현<br>
                        어드민 사이트 총괄<br>
                        (대시보드, 예약/미용실<br>
                        /고객/리뷰/이벤트 관리)
      </td>
      <td align="center">프로젝트 총괄<br>
                        서버 및 CI/CD 구축<br>
                        (Docker, NCP,<br>
                        Github Actions)<br>
                        채팅 및 번역 기능 총괄<br>
                        (Spring Async, WebSocket,<br>
                        Hyper Clova X)<br>
                        DB 설계 및 생성<br>
                        (PostgreSQL, Flyway)
      </td>
    </tr>
  </tbody>
</table>
<br>
        
## 🔧 기술 스택
![Tech Stack Architecture](https://github.com/user-attachments/assets/0b1e6f70-7367-4c85-9ba4-e4cb1d4f3644)
<br><br>

## 📅 총 개발 기간 2025.03.12 ~ 2025.05.11
- **2025.03.12 ~ 2025.03.21** 👉 프로젝트 기획 및 UI 설계
- **2025.03.25 ~ 2025.03.31** 👉 Database 설계
- **2025.03.31 ~ 2025.05.03** 👉 프로젝트 개발
- **2025.05.04 ~ 2025.05.08** 👉 테스트 및 오류 수정
- **2025.05.09 ~ 2025.05.11** 👉 시연 및 발표 준비
<br><br>

## ✏ Coding Convention
### 함수에 대한 주석
- 백엔드에서 공통적으로 사용하는 함수의 경우, 모듈화를 통해 하나의 파일로 관리한다.
- 하나의 파일의 시작 부분에 주석으로 상세 내용을 작성한다.
### 변수명
- Camel Case로 작성한다.
- 의미를 파악하기 쉬운 변수명을 사용한다.
- 웬만하면 약어는 지양하도록 한다.
- boolean의 경우 'is', 'has', 'can'과 같은 접두어를 사용한다.
- 숫자의 경우 'max', 'min', 'total'과 같은 접두어로 의미를 표기한다.
- 함수일 경우 동사와 명사를 사용하여 `actionResource`의 형식(동사+명사)을 따르도록 한다.
- 상수는 대문자로 표기한다.
### Code
- 중괄호로 묶이지 않은 블록문은 금지한다.
- 들여쓰기의 크기는 4-spaces로 한다.
<br><br>

## ⌨ Git Convention
### Commit Convention
- ✅ [CHORE] : 동작에 영향 없는 코드 or 변경 없는 변경사항(주석 추가 등)
- ✨ [FEAT] : 새로운 기능 구현
- ➕ [ADD] : Feat 이외의 부수적인 코드 추가, 라이브러리 추가, 새로운 파일 생성
- 🔨 [FIX] : 버그, 오류 해결
- ⚰️ [DEL] : 쓸모없는 코드 삭제
- 📝 [DOCS] : README나 WIKI 등의 문서 수정
- ✏️ [CORRECT] : 주로 문법의 오류나 타입의 변경, 이름 변경시
- ⏪️ [RENAME] : 파일 이름 변경시
- ♻️ [REFACTOR] : 전면 수정
- 🔀 [MERGE]: 다른 브랜치와 병합

### 커밋 예시

`ex ) git commit -m "#{이슈번호} [FEAT] 회원가입 기능 완료"`

### Branch Convention

- [develop] : 최종 배포
- [feat] : 기능 추가
- [fix] : 에러 수정, 버그 수정
- [docs] : README, 문서
- [refactor] : 코드 리펙토링 (기능 변경 없이 코드만 수정할 때)
- [modify] : 코드 수정 (기능의 변화가 있을 때)
- [chore] : gradle 세팅, 위의 것 이외에 거의 모든 것

### 브랜치 명 예시

`ex) [타입]/[이슈번호]-[간단한설명]`
`feat/19-login-page`

### Branch Strategy

기본적으로 Git Flow 전략을 이용한다. Fork한 후 나의 repository에서 작업하고 구현 후 원본 repository에 pr을 날린다. 작업 시작 시 선행되어야 할 작업은 다음과 같다.

```java
1. Issue를 생성한다.
2. feature Branch를 생성한다.
3. Add - Commit - Push - Pull Request 의 과정을 거친다.
4. Pull Request가 작성되면 작성자 이외의 다른 팀원이 Code Review를 한다.
5. Code Review가 완료되면 Pull Request 작성자가 develop Branch로 merge 한다.
6. merge된 작업이 있을 경우, 다른 브랜치에서 작업을 진행 중이던 개발자는 본인의 브랜치로 merge된 작업을 Pull 받아온다.
7. 종료된 Issue와 Pull Request의 Label과 Project를 관리한다.
```

### Issue Convention
- [FEAT] : 기능 추가
- [FIX] : 에러 수정, 버그 수정
- [DOCS] : README, 문서
- [REFACTOR] : 코드 리펙토링 (기능 변경 없이 코드만 수정할 때)
- [MODIFY] : 코드 수정 (기능의 변화가 있을 때)
- [CHORE] : gradle 세팅, 위의 것 이외에 거의 모든 것

`ex) [feat] user api 구현`
<br><br>
