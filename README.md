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

### 🔹Branch Convention

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

### 🔹Branch Strategy
### Git Flow

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

- 기본적으로 git flow 전략을 사용합니다.
- main, develop, feature 3가지 branch 를 기본으로 합니다.
- main → develop → feature. feature 브랜치는 feat/기능명으로 사용합니다.
- 이슈를 사용하는 경우 브랜치명을 feature/[issue num]-[feature name]로 합니다.

### 🔹Issue Convention
- [FEAT] : 기능 추가
- [FIX] : 에러 수정, 버그 수정
- [DOCS] : README, 문서
- [REFACTOR] : 코드 리펙토링 (기능 변경 없이 코드만 수정할 때)
- [MODIFY] : 코드 수정 (기능의 변화가 있을 때)
- [CHORE] : gradle 세팅, 위의 것 이외에 거의 모든 것

`ex) [feat] user api 구현`
<br><br>

## 💻 팀 소개 
<table>
  <tbody>
    <th align="center">🐢 강승민</th>
    <th align="center">🐔 신동억</th>
    <th align="center">🐷 임성철</th>
    <th align="center">🐰 임하형(팀장)</th>
    <tr>
      <td align="center">사진</td>
      <td align="center">사진</td>
      <td align="center">사진</td>
      <td align="center">사진</td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/SeungMin2055">SeungMin2055</td>
      <td align="center"><a href="https://github.com/shindongeok">shindongeok</td>
      <td align="center"><a href="https://github.com/limsc95">limsc95</td>
      <td align="center"><a href="https://github.com/hahyeong">hahyeong</td>
    </tr>
    <tr>
      <td align="center">안해본 크롤링 같은 거 해보고싶어요</td>
      <td align="center">게시판 빼고<br>새로운거하면 재밌을거 같아요</td>
      <td align="center">이전 프로젝트에서 게시판을 담당해서 게시판 제외하고 다 좋습니다. </td>
      <td align="center">프로젝트 총괄<br>서버 및 CI/CD 하고싶어요</td>
    </tr>
  </tbody>
</table>
<br><br>
