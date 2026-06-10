# 웹 디자인·UX 개선 설계서

- 작성일: 2026-06-10
- 대상: 정적 퀴즈 사이트 전반 (`index/category/chapter/quiz/result.html`, `css/style.css`, `js/*`)
- 원칙(불변): **의존성 0 · 빌드 없음 · 순수 HTML/CSS/JS · 서버 없음**(데이터는 클라이언트에만).

## 1. 배경 / 목표

현재 사이트는 토큰 기반 CSS와 모바일 우선 레이아웃으로 기본기는 갖췄으나, 다음 문제가 있다.

- **카드 제목·요약이 붙어서 렌더링**됨(예: "생존 영어 회화공항·식당…"). `card-title`/`card-summary`가 인라인 `<span>`이라 줄바꿈·간격이 없음.
- 전반적으로 밋밋하고 마감 디테일(타이포 위계, 포커스 상태, 카드 강조)이 부족.
- 학습앱인데 **진행/완료 표시, 점수 이력**이 없어 반복 학습 동기·맥락이 약함.
- 퀴즈 중 **진행 표시(몇/몇 문항)** 가 없음.
- **다크모드** 없음.

목표: 현재의 깔끔한 톤을 유지하면서 (1) 비주얼 마감을 끌어올리고 (2) 진행·완료 표시, 점수 이력, 퀴즈 진행바, 다크모드를 추가한다.

## 2. 설계 결정

- 접근: **기존 구조 유지 + 점진 개선**. CSS를 다듬고 작은 모듈 2개(`theme.js`, `progress.js`)를 추가해 기존 렌더 함수에 연결.
- 비주얼 톤: 현재 파랑·보라 팔레트 유지, 마감만 향상.
- 영속성: `localStorage`(서버 없음 — 프라이버시 원칙 유지).
- 다크모드 토글: 각 페이지 헤더 마크업을 건드리지 않도록 **JS가 떠 있는(fixed) 토글 버튼을 주입**.

## 3. 컴포넌트 설계

### 3.1 비주얼 다듬기 — `css/style.css`
- **버그 수정**: `.card-title`, `.card-summary`를 블록으로 분리(`display:block`), 요약에 줄간격·여백. 제목/요약이 명확히 2줄로 분리되도록.
- 타이포 위계: 카드 제목 크기·자간, 요약 색/크기 정리.
- 인터랙션: 카드 `hover/active` 디테일 유지·정돈, 모든 인터랙티브 요소에 `:focus-visible` 링 추가(접근성).
- 마감: 배지(`card-badge`), 점수카드, 리뷰 항목 여백·정렬 다듬기.
- 토큰만 조정하므로 전역 일관 반영.

### 3.2 다크모드 — 신규 `js/theme.js` + `css/style.css`
- CSS: `:root` 토큰에 대응하는 다크 팔레트를 **`html[data-theme="dark"]`** 에 정의. 명시적 선택이 없을 때를 위해 `@media (prefers-color-scheme: dark)` 에도 동일 토큰 적용(단, `html[data-theme="light"]`이면 무시).
- `theme.js` (모든 페이지 로드):
  - 초기 테마 = `localStorage["cctrip:theme"]`("light"|"dark") 있으면 그것, 없으면 시스템 설정 반영(=`data-theme` 미설정, CSS 미디어쿼리에 위임).
  - 우상단에 `position:fixed` 토글 버튼(☀/🌙)을 DOM에 주입, 클릭 시 light↔dark 토글 + `data-theme` 설정 + `localStorage` 저장.
  - 버튼은 `aria-label` 제공, 스크롤·모달 위 z-index 적절히.
- 인터페이스: 전역 부수효과 모듈. 다른 스크립트가 의존하지 않음.

### 3.3 진행·점수 이력 — 신규 `js/progress.js`
- 순수 데이터 모듈. `localStorage` 키 `cctrip:progress:v1`.
- 스키마: `{ [catId]: { [chId]: { bestCorrect, bestTotal, lastCorrect, lastTotal, attempts } } }`.
- API:
  - `recordResult(catId, chId, correct, total)` → 기록 갱신. `attempts++`, `last*` 갱신, 비율(correct/total)이 기존 best 비율보다 크면 `best*` 갱신. `{isNewBest: boolean}` 반환.
  - `getChapter(catId, chId)` → 기록 객체 또는 `null`.
  - `getCategoryStats(catId, totalChapters)` → `{ attempted, total }` (attempted = attempts>0 인 챕터 수).
- 손상된 JSON은 안전하게 무시(빈 상태로 시작).

### 3.4 페이지 연결
- **index** (`js/index.js`): 각 카테고리 카드에 진행 표시. 카테고리의 총 챕터 수가 필요 → 카드 렌더 시 해당 카테고리 파일을 읽어 챕터 수를 얻고 `getCategoryStats`로 "n/N 챕터" + 작은 진행 바 표시. (이미 `categories.json`만 읽으므로, 진행 표시를 위해 각 카테고리 파일을 추가 fetch — 5개 수준이라 부담 없음. 실패 시 진행 표시 생략하고 카드만.)
- **category** (`js/category.js`): 각 챕터 카드에 `getChapter` 기록이 있으면 완료 체크(✓)와 "최고 8/14" 배지 표시.
- **quiz** (`js/quiz.js` + `quiz.html`): 타이머 바 아래 `position:sticky` 진행바 추가. 답한 문항 수/전체("7/14 답함") + 채워지는 바. 보기 선택 이벤트에서 갱신.
- **result** (`js/result.js`): 채점 후 `recordResult` 호출로 저장. `isNewBest`면 "🎉 최고 점수 경신!" 배지를 점수카드에 표시. 이전 최고가 있으면 "이전 최고 X/Y"도 표시.

## 4. 파일 영향 요약

| 파일 | 변경 |
|---|---|
| `css/style.css` | 카드 버그 수정·마감 다듬기, 다크 팔레트, 진행바·토글·신규 배지 스타일 |
| `js/theme.js` | 신규: 다크모드 토글·영속·시스템 기본 |
| `js/progress.js` | 신규: localStorage 진행/점수 API |
| `js/index.js` | 카테고리 진행 표시 |
| `js/category.js` | 챕터 완료 체크 + 최고 점수 배지 |
| `js/quiz.js` | 진행바 갱신 |
| `js/result.js` | 점수 저장 + 최고 경신 표시 |
| `index/category/chapter/quiz/result.html` | `theme.js`(+ index·category·result는 `progress.js`) 스크립트 1줄 추가; `quiz.html`에 진행바 마크업 |

## 5. 비범위 (Out of Scope)

- 콘텐츠(JSON) 변경, 퀴즈 출제·PIN·타이머 로직 변경.
- 다국어, 계정/로그인, 서버·DB.
- 전면 리디자인(레이아웃 구조 재편).

## 6. 검증

- 로컬 서버에서 5개 페이지를 모바일(390px)·데스크톱 폭으로 확인.
- 카드 제목·요약 분리 확인.
- 다크모드: 토글 동작·새로고침 후 유지·시스템 기본 반영, 모든 페이지 가독성.
- 진행/점수: 퀴즈 제출 → category·index에 반영, 최고 경신 표시, `localStorage` 비었을 때/손상 시 안전.
- 퀴즈 진행바: 답할수록 갱신, sticky 유지.
- 접근성: 키보드 포커스 링, 토글 `aria-label`.

## 7. 열린 항목

- index 진행 표시를 위해 카테고리 파일을 추가 fetch하는 비용 — 5개 수준이라 허용. 추후 카테고리 메타에 chapterCount를 넣으면 fetch 제거 가능(이번 범위 외).
