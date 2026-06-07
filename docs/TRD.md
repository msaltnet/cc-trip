# 🛠️ TRD — 유럽 가족 여행 준비 Quiz 사이트

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-06-07 |
| 대상 | 구현 담당자 |

## 1. 기술 스택 및 원칙

- **순수 HTML/CSS/JS (Vanilla)** — 빌드 도구·외부 라이브러리·프레임워크 0.
- **멀티페이지** 구조: 화면당 HTML 1개. 라우팅 코드 없이 페이지 이동 + URL 파라미터로 상태 전달.
- **모듈 로딩**: 각 HTML이 필요한 JS만 `<script>`로 로드. 공용 모듈(`config`, `data`, `util`)을 먼저 로드.
- **데이터 로딩**: `fetch`로 `data/*.json`을 비동기 로드. → 로컬은 HTTP 서버 필요(`file://` 불가).
- **상태 전달**: 화면 간 일시 데이터는 `sessionStorage`. 영구 저장(localStorage) 미사용.

## 2. 디렉터리 구조

```
cc-trip/
├── index.html              # 메인 목차
├── category.html           # 챕터 목록
├── chapter.html            # 학습 본문 + 퀴즈 시작
├── quiz.html               # 퀴즈 진행
├── result.html             # 결과·해설
├── css/
│   └── style.css
├── js/
│   ├── config.js           # 상수
│   ├── data.js             # 데이터 로더/조회
│   ├── util.js             # 순수 함수
│   ├── index.js
│   ├── category.js
│   ├── chapter.js
│   ├── quiz.js
│   └── result.js
├── data/
│   ├── categories.json
│   └── <category>.json (×N)
├── docs/ (PRD, TRD, 설계 문서)
└── README.md
```

## 3. 모듈 책임 (단일 책임 원칙)

| 모듈 | 책임 | 의존 |
|------|------|------|
| `config.js` | 상수만 노출: `QUIZ_PIN`, `QUIZ_TIME_SEC`(600), `QUIZ_COUNT`(10), `SESSION_KEY` 등 | 없음 |
| `util.js` | 순수 함수: `shuffle(arr)`, `pickRandom(arr, n)`, `pickSetQuestions(chapter)`, `prepareQuestion(q)`, `scoreQuiz(picked, answers)`, `formatTime(sec)`, `getParam(name)` | 없음 |
| `data.js` | `loadCategories()`, `loadCategory(id)`, `findChapter(detail, chId)`, `setCount(chapter)`, `hasQuestions(chapter)` — fetch 래핑 + 조회 헬퍼 | config |
| `index.js` | 메인 목차 렌더 (카테고리 카드) | data |
| `category.js` | 챕터 목록 렌더 | data, util(getParam) |
| `chapter.js` | 본문 렌더 + PIN 모달 + 퀴즈 시작(통과 플래그 기록 후 이동) | data, config, util |
| `quiz.js` | 랜덤 출제 + 타이머 + 답안 수집 + (수동/자동) 제출 | data, config, util |
| `result.js` | 채점 + 점수·해설 렌더 | config, util |

> `config.js` / `util.js`는 **부수효과 없는 순수 모듈**로 유지한다. DOM·fetch·전역 상태를 건드리지 않는다.

## 4. 데이터 스키마 (정식)

### 4.1 `data/categories.json`
배열. 각 원소:

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 카테고리 고유 id (URL `cat` 파라미터로 사용) |
| `icon` | string | 이모지 아이콘 |
| `title` | string | 표시 제목 |
| `summary` | string | 한 줄 요약 |
| `file` | string | 상세 데이터 파일명 (`data/` 기준 상대) |

### 4.2 `data/<category>.json`
객체. 필드:

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 카테고리 id (categories.json과 일치) |
| `title` | string | 카테고리 제목 |
| `chapters` | Chapter[] | 챕터 배열 |

**Chapter**

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 챕터 id (URL `ch` 파라미터, 카테고리 내 유일) |
| `title` | string | 챕터 제목 |
| `summary` | string | 한 줄 요약 |
| `sections` | Section[] | 학습 본문 블록 |
| `sets` | Set[] | 문제 세트 배열 (빈 배열 가능 → "준비 중") |

**Section**

| 필드 | 타입 | 설명 |
|------|------|------|
| `heading` | string | 소제목 |
| `body` | string | 본문 텍스트 |

**Set**

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 세트 id (챕터 내 유일, 예: `set01`) |
| `questions` | Question[] | 문제 배열 (정확히 10문제 권장) |

**Question**

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 문제 id. 권장 형식 `카테고리약어_챕터_세트_번호` |
| `type` | string | `"multiple_choice"` 또는 `"ox"` |
| `question` | string | 문제 문장(ox는 참/거짓 판단 문장) |
| `options` | string[] | (multiple_choice 전용) 보기. ox는 생략, 화면에 O/X 자동 표시 |
| `answerIndex` | number | 정답 인덱스 (0-based). ox는 0=O(참), 1=X(거짓) |
| `explanation` | string | 해설 |

## 5. 핵심 로직 상세

### 5.1 PIN 인증 (`chapter.js`)
```
onClick(퀴즈 시작):
  모달 표시
onSubmit(pin):
  if pin === config.QUIZ_PIN:
    sessionStorage["quizUnlocked"] = `${cat}:${ch}`   # 통과 플래그
    location → quiz.html?cat=...&ch=...
  else:
    모달 내 경고 메시지 표시 (진입 차단)
```

### 5.2 세트 랜덤 출제 (`quiz.js`)
```
가드: sessionStorage["quizUnlocked"] !== `${cat}:${ch}` → chapter.html로 되돌림
chapter = findChapter(detail, ch)
if !hasQuestions(chapter) → chapter로 되돌림
picked = pickSetQuestions(chapter)   # 세트 1개 랜덤 → 문제 셔플 + 보기 셔플
sessionStorage["quizSession"] = { cat, ch, picked, answers: [] }
화면: picked 전 문항 세로 스크롤 렌더 (q.displayOptions 사용)
```
- `pickSetQuestions`: 챕터 `sets` 중 1개를 무작위 선택 → 세트 내 문제 순서 `shuffle` → 각 문제를 `prepareQuestion`으로 변환.
- `prepareQuestion`:
  - `ox` → `displayOptions = ["O (맞다)", "X (아니다)"]`, `answerIndex` 그대로(0=O,1=X).
  - `multiple_choice` → `options`를 셔플해 `displayOptions` 생성, 정답이 옮겨간 새 위치로 `answerIndex` 재매핑.
  - 결과의 `displayOptions`/`answerIndex`는 같은 좌표계 → 사용자 선택 인덱스와 곧바로 채점 가능.

### 5.3 타이머 & 자동 제출 (`quiz.js`)
```
remain = config.QUIZ_TIME_SEC (600)
매 1초:
  remain -= 1
  타이머 텍스트 = formatTime(remain)
  if remain <= 60: 타이머 강조 클래스 추가
  if remain <= 0: alert("시간 종료") → submit(auto=true)
submit():
  현재 선택된 답안 수집 → sessionStorage["quizSession"].answers
  location → result.html
```
- 수동 제출 시 미선택 문항 있으면 confirm("안 푼 문항 N개. 제출할까요?").

### 5.4 채점 & 해설 (`result.js`)
```
session = sessionStorage["quizSession"]
{ correct, total } = scoreQuiz(session.picked, session.answers)
점수 = `${correct} / ${total}`
해설 리스트: picked 순서대로
  - 문제, displayOptions
  - 사용자 선택 표시 / 정답 표시
  - O(초록) / X(빨강)
  - explanation
버튼: [다시 풀기] → chapter.html?cat&ch  /  [목차로] → index.html
```

### 5.5 순수 함수 시그니처 (`util.js`)
```
shuffle(arr) -> arr'              # 원본 비변경, 셔플된 새 배열
pickRandom(arr, n) -> arr'        # shuffle 후 slice(0, min(n, len))
pickSetQuestions(chapter) -> [q'] # 세트 1개 랜덤 → 문제 셔플 → prepareQuestion. 빈 챕터는 []
prepareQuestion(q) -> q'          # displayOptions 생성 + 보기 셔플 시 answerIndex 재매핑
scoreQuiz(picked, answers) -> { correct, total }   # total = picked.length
formatTime(sec) -> "MM:SS"
getParam(name) -> string|null     # location.search 파싱
```

## 6. 에러 처리

| 상황 | 감지 | 처리 |
|------|------|------|
| 없는 cat/ch | 조회 결과 null | "찾을 수 없는 항목" + [목차로] 버튼 |
| fetch 실패 | catch | "콘텐츠를 불러오지 못했습니다. 새로고침 해주세요" |
| 퀴즈 직접 진입 | `quizUnlocked` 플래그 불일치 | chapter.html로 redirect |
| 문제 없는 챕터 | `hasQuestions(chapter) === false` | 퀴즈 버튼 비활성 + "준비 중인 챕터" |
| 결과 화면 직접 진입 | `quizSession` 없음 | index.html로 redirect |

## 7. 스타일 (`style.css`)

- 모바일 우선, CSS 변수로 토큰화 (`--color-primary`, `--space-*`, `--radius` 등).
- 시스템 폰트 스택만 사용. 외부 폰트/CDN 미사용.
- 카드형 리스트, 최소 44px 터치 타깃, 본문 16px 이상.
- 타이머 강조용 클래스(`.timer--warning` 빨강), 정/오답 클래스(`.ox--correct` 초록 / `.ox--wrong` 빨강).

## 8. 수동 검증 체크리스트 (자동 테스트 미도입)

> 로컬 HTTP 서버에서 열어 순서대로 확인.

**네비게이션**
- [ ] index에 5개 카테고리 카드가 표시된다.
- [ ] 카테고리 클릭 → 해당 카테고리 챕터 목록으로 이동한다.
- [ ] 챕터 클릭 → 본문 + [퀴즈 시작하기] 버튼이 보인다.

**PIN**
- [ ] [퀴즈 시작하기] → PIN 모달이 뜬다.
- [ ] 올바른 PIN → 퀴즈로 이동한다.
- [ ] 틀린 PIN → 경고 메시지, 이동하지 않는다.
- [ ] quiz.html에 URL로 직접 접근 → chapter로 되돌아간다.

**출제**
- [ ] 세트가 있는 챕터 → 1세트(10문항) 출제, 재진입마다 세트/문항/보기 순서가 바뀐다(랜덤).
- [ ] 4지선다·OX 문제가 모두 정상 렌더된다 (OX는 O/X 버튼).
- [ ] 보기를 섞어도 결과 화면의 정답 표시가 깨지지 않는다(정답 재매핑).
- [ ] 세트 없는 챕터(빈 sets) → 시작 버튼 비활성 + "준비 중" 표시.

**타이머/제출**
- [ ] 타이머가 10:00부터 1초씩 감소한다.
- [ ] 남은 1:00 이하에서 타이머가 빨강으로 강조된다.
- [ ] 0:00 도달 → 경고 후 자동 제출되어 결과로 이동한다.
- [ ] 미선택 문항이 있는 채로 제출 → 확인 창이 뜬다.

**결과**
- [ ] 점수가 `맞힌수 / 출제수`로 표시된다.
- [ ] 출제 전 문항이 순서대로, 사용자 답·정답·O/X·해설과 함께 나온다.
- [ ] O 초록 / X 빨강으로 구분된다.
- [ ] [다시 풀기] → 같은 챕터를 새 랜덤으로 다시 푼다.
- [ ] result.html에 직접 접근 → index로 되돌아간다.

**에러**
- [ ] 없는 `cat`/`ch` 파라미터 → "찾을 수 없는 항목" 안내가 나온다.

## 9. 배포

- 정적 파일을 그대로 호스팅(GitHub Pages / Netlify / Vercel). 빌드 단계 없음.
- 상대 경로 사용. 서브 경로 배포 시 `fetch("data/...")`가 현재 페이지 기준으로 해석됨에 유의.

## 10. 향후 확장 여지

- `type` 필드 기반 OX·주관식 문제 렌더러 추가.
- 카테고리 종합 퀴즈(전 챕터 통합 출제) 모드.
- localStorage 기반 최근 점수 기록(원하면).
