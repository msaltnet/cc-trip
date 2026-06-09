# 🇪🇺 유럽 가족 여행 준비 Quiz

가족의 유럽 여행 준비를 돕고 기대감을 높이기 위한 **모바일 친화 정적 웹사이트**입니다.
카테고리별 학습 본문을 읽고, 챕터 단위로 랜덤 퀴즈를 풀며 복습합니다.

- **서버·DB 없음** — 브라우저(클라이언트)에서만 동작. 가족 개인정보를 외부로 보내지 않습니다.
- **의존성 0** — 순수 HTML/CSS/JS. 빌드 도구·프레임워크 없이 폴더 그대로 배포.
- **무한 확장** — 카테고리·챕터·문제를 **코드 수정 없이** JSON 파일만으로 추가.

## 📂 정보 구조

```
카테고리 (예: 생존 영어 회화)
  └─ 챕터 (예: 공항 입국 심사)
       ├─ 학습 본문
       └─ 퀴즈 문제
```

3단계로 드릴다운합니다: **카테고리 목록 → 챕터 목록 → 본문 + 퀴즈**.

## 🖥️ 화면 흐름

```
index.html                                     메인: 카테고리 목록
  ↓
category.html?cat=survival-english             챕터 목록
  ↓
chapter.html?cat=survival-english&ch=ch01      학습 본문 + [퀴즈 시작하기]
  ↓ (PIN 입력)
quiz.html?cat=survival-english&ch=ch01         랜덤 10문항 + 10분 타이머
  ↓ (제출 / 시간 만료 자동 제출)
result.html                                    점수 + 전체 해설
```

## ✨ 주요 기능

- **PIN 관문**: 퀴즈 시작 시 PIN 입력. (보안이 아닌 가벼운 진입 차단 — 아래 주의 참고)
- **랜덤 출제**: 챕터 문제 중 무작위 10문항 추출. 문제가 10개 미만이면 있는 만큼만 출제.
- **10분 타이머 + 자동 제출**: 상단 고정 카운트다운. 0초가 되면 현재 답안으로 자동 제출.
- **점수 & 해설**: `맞힌 수 / 출제 수` 표시. 출제된 모든 문항의 정·오답과 해설을 한눈에.

## 🚀 실행 방법

정적 파일이므로 별도 빌드가 필요 없습니다. `fetch`로 JSON을 읽기 때문에 **로컬 HTTP 서버**로 열어야 합니다 (`file://`로 직접 열면 CORS로 데이터 로드가 막힙니다).

```bash
# Python 3
python -m http.server 8000
# 그 후 브라우저에서 http://localhost:8000 접속
```

```bash
# Node (npx)
npx serve .
```

## 🌐 배포

폴더를 그대로 정적 호스팅에 업로드하면 됩니다.

- **GitHub Pages**: 저장소 Settings → Pages → 브랜치 지정 후 루트 배포.
- Netlify / Vercel / Cloudflare Pages 등도 빌드 명령 없이 그대로 배포 가능.

## 📏 콘텐츠 작성 규칙

문제를 만들 때 반드시 지키는 규칙입니다. (출제 동작도 이 규칙에 맞춰 구현되어 있습니다.)

1. **문제 유형은 두 가지만** — 4지선다형(`multiple_choice`) 또는 O/X형(`ox`).
2. **10문제 = 1세트.** 한 세트는 정확히 10문제로 구성합니다.
3. **한 챕터에 10세트 정도 준비.** 세트끼리는 같은 주제·개념을 다루되, **문제 구성(지문·보기·순서)을 다르게** 만듭니다. 답을 통째로 외워서 풀 수 없게 하기 위함입니다.
4. **출제는 세트 단위 랜덤 선택.** 퀴즈를 시작하면 챕터의 여러 세트 중 **무작위로 1세트(10문제)** 를 골라 제공합니다.
5. **추가 셔플로 암기 방지 강화.** 같은 세트가 뽑혀도 매번 다르게 보이도록, 출제 시 **세트 안 문제 순서**와 **각 문제의 보기 순서**를 섞습니다.

> 세트가 1개뿐이면 항상 그 세트가 나오고, 10문제 미만이면 있는 만큼만 출제됩니다(타이머는 그대로 10분). 챕터당 10세트를 목표로 채워 주세요.

## ➕ 콘텐츠 추가 가이드

> 코드를 건드릴 필요가 없습니다. `data/` 폴더의 JSON만 편집하세요.
> 구조는 **카테고리 → 챕터 → 세트(10문제)** 입니다.

### 카테고리 추가
1. `data/<새이름>.json` 파일을 생성합니다 (아래 챕터/세트 스키마 참고).
2. `data/categories.json`에 한 줄 등록합니다.

```json
{
  "id": "safety",
  "icon": "🚨",
  "title": "위급 상황·안전 수칙",
  "summary": "여권 분실 대처, 소매치기 수법, 긴급 연락처",
  "file": "safety.json"
}
```

### 생존 영어 회화 편집 워크플로 (조각 파일 + 빌드)

`data/survival-english.json`은 **직접 편집하지 않습니다.** `scripts/chapters/chNN.json` 조각 파일에서 생성됩니다 (챕터당 1파일, 대화 중심 포맷: `dialogues` + `keyExpressions` + `sets`).

```bash
# 1) 챕터 조각 편집
#    scripts/chapters/chNN.json  (대화 10개, 각 핵심표현 3개·대체표현 2개, 세트 14문항)
# 2) 단일 챕터 검증
node scripts/validate-chapter.mjs scripts/chapters/chNN.json
# 3) 전체 파일 재생성
node scripts/build-survival-english.mjs
# 4) 전체 검증
node scripts/validate-survival-english.mjs
```

> 챕터 구성 설계는 [docs/superpowers/specs/2026-06-09-survival-english-restructure-design.md](docs/superpowers/specs/2026-06-09-survival-english-restructure-design.md) 참고. 새 챕터를 추가하려면 `scripts/chapters/`에 `chNN.json`을 만들고 빌드하면 됩니다.

### 챕터 추가 (구버전 `sections` 포맷)
해당 카테고리 파일의 `chapters` 배열에 항목을 추가합니다. 챕터는 본문(`sections`)과 **세트 배열(`sets`)** 을 가집니다. (생존 영어 회화는 위 대화형 워크플로를 사용하세요.)

```json
{
  "id": "ch02",
  "title": "식당에서 주문하기",
  "summary": "메뉴 묻기, 추천 요청, 계산 표현",
  "sections": [
    { "heading": "추천 요청", "body": "What do you recommend? 로 추천을 물어보세요." }
  ],
  "sets": [ /* 아래 세트 스키마. 챕터당 10세트 권장 */ ]
}
```

### 세트 추가
각 세트는 `id`와 10개의 `questions`를 가집니다. 챕터의 `sets` 배열에 추가합니다.

```json
{
  "id": "set01",
  "questions": [ /* 10개 문제. 아래 문제 스키마 */ ]
}
```

### 문제 추가 (4지선다형)

```json
{
  "id": "se_ch02_set01_001",
  "type": "multiple_choice",
  "question": "메뉴 추천을 부탁할 때 적절한 표현은?",
  "options": ["What do you recommend?", "Check, please.", "Where is the toilet?", "How much?"],
  "answerIndex": 0,
  "explanation": "추천을 물을 때는 What do you recommend? 가 자연스럽습니다."
}
```

- `multiple_choice`는 보통 보기 4개를 권장합니다(최소 2개).
- `answerIndex`는 0부터 시작합니다. (`options`의 첫 번째 = 0)

### 문제 추가 (O/X형)

```json
{
  "id": "se_ch02_set01_002",
  "type": "ox",
  "question": "유럽 식당에서 'tap water'는 보통 무료로 받을 수 있는 수돗물이다.",
  "answerIndex": 0,
  "explanation": "tap water는 수돗물로, 대개 무료입니다. 병물은 보통 유료입니다."
}
```

- O/X형은 `options`를 적지 않습니다. 화면에 **O / X** 두 버튼이 자동으로 표시됩니다.
- `answerIndex`는 **0 = O(참), 1 = X(거짓)** 입니다.

> 문제 `id`는 `카테고리약어_챕터_세트_번호` 형식을 권장합니다 (출처 추적용).

## ⚠️ 보안 주의

PIN은 클라이언트 사이드 코드(`js/config.js`)에 들어 있어 소스를 보면 누구나 알 수 있습니다.
**실제 보안 장치가 아니라**, 가족이 아닌 사람이 장난으로 들어오지 않게 하는 **가벼운 관문**일 뿐입니다.
민감 정보를 이 사이트에 넣지 마세요.

## 📑 문서

- [docs/PRD.md](docs/PRD.md) — 제품 요구사항 정의서
- [docs/TRD.md](docs/TRD.md) — 기술 요구사항 정의서
- [설계 문서](docs/superpowers/specs/2026-06-07-europe-family-trip-quiz-design.md) — 통합 설계서

## 🗂️ 폴더 구조

```
cc-trip/
├── index.html / category.html / chapter.html / quiz.html / result.html
├── css/style.css
├── js/   (config, data, util, index, category, chapter, quiz, result)
├── data/ (categories.json + 카테고리별 JSON)
├── docs/ (PRD, TRD, 설계 문서)
└── README.md
```
