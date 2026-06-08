# 생존 영어 회화 30챕터 채우기 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `data/survival-english.json`을 여행 시간순 30챕터로 채운다 — 각 챕터는 학습 섹션 2~4개 + 10문항 퀴즈 세트 1개.

**Architecture:** 정적 사이트. 엔진/HTML/CSS/JS는 손대지 않고 **JSON 데이터만** 채운다. 챕터 표시 순서는 JSON `chapters[]` 배열 순서를 따르므로, 배열을 항상 시간순(ch01→ch30)으로 유지한다. 챕터 id는 URL 매칭용이라 기존 챕터의 id 재번호가 안전하다.

**Tech Stack:** 순수 JSON. 검증은 Node 스크립트로 수행.

**스펙:** `docs/superpowers/specs/2026-06-08-survival-english-30-chapters-design.md`

---

## 핵심 규칙 (모든 태스크 공통)

### JSON 구조 (기존 ch01 형식 그대로)

```jsonc
{
  "id": "chNN",                       // 2자리 0패딩, 시간순
  "title": "상황명",                   // 한글
  "summary": "한 줄 요약",             // 한글
  "sections": [
    { "heading": "주제", "body": "핵심 표현 + 한글 설명" }   // 2~4개
  ],
  "sets": [
    {
      "id": "set01",
      "questions": [                  // 정확히 10개
        {
          "id": "se_chNN_set01_001",  // se_<chId>_<setId>_<3자리 순번>
          "type": "multiple_choice",  // 또는 "ox"
          "question": "한글 질문",
          "options": ["..","..","..",".."],   // multiple_choice일 때만, 항상 4개
          "answerIndex": 0,                     // 0-based. ox는 0=O(맞음), 1=X(틀림)
          "explanation": "한글 해설"
        }
      ]
    }
  ]
}
```

### 각 세트 작성 규칙
- 문항 **정확히 10개**.
- `multiple_choice` **6~8개** + `ox` **2~4개** 혼합 (기존 ch01·ch02 비율 참고).
- `multiple_choice`의 `options`는 **항상 4개**, 오답은 그럴듯하게(같은 상황의 다른 표현/엉뚱한 직역 등).
- `ox` 문항에는 `options` 필드를 넣지 않는다.
- `question`·`explanation`·`options`는 **한글 설명 + 영어 표현** 스타일. 기존 ch01·ch02 톤을 따른다.
- 본문(`sections`)에서 가르친 표현이 퀴즈에 반영되도록 한다.

### 배열 순서 불변식
- 작업 후 `chapters[]`는 항상 `ch01, ch02, … chNN` **오름차순**이어야 한다.
- 새 챕터는 자기 번호 위치(시간순)에 삽입한다. 기존 챕터(아래 Task 1에서 ch08/ch15/ch19로 재배치됨)를 앵커로 삼아 그 앞/뒤에 넣는다.

### 챕터별 콘텐츠 브리프 (가르칠 핵심 표현)

각 챕터 본문·퀴즈는 아래 표현을 중심으로 구성한다. (표현은 가이드이며, 자연스러우면 추가·보강 가능)

**A. 출국 준비 & 공항**
- ch01 항공권·온라인 체크인: `I'd like to check in online.` / `Can I choose my seat?` / `What's my seat number?` / `Is my flight on time?` / `boarding pass` / `baggage allowance`
- ch02 체크인 카운터: `I'd like to check in this bag.` / `How many bags can I check?` / `Is this carry-on okay?` / `Window/aisle seat, please.` / `My bag is overweight.` / `Where is the gate?`
- ch03 보안검색·출국심사: `Please take off your jacket.` / `Laptops out of the bag.` / `Liquids must be under 100ml.` / `Empty your pockets.` / `Step through, please.` / `Arms up.`
- ch04 탑승 게이트: `Now boarding group 2.` / `The flight is delayed.` / `gate change` / `Final call for…` / `Can I board with a child?` / `boarding now`

**B. 기내 & 경유**
- ch05 기내(승무원): `Chicken or beef?` / `Can I have some water?` / `Could I get a blanket?` / `What would you like to drink?` / `Is it free?` / `Coffee, please.`
- ch06 기내 편의·불편: `Could you put your seat up?` / `I feel sick.` / `Can I change seats?` / `Where is the restroom?` / `Can you help me with my bag?` / `Excuse me, let me through.`
- ch07 경유·환승: `Where is the transfer desk?` / `I have a connecting flight.` / `Do I need to collect my bags?` / `How do I get to gate B?` / `I have a 2-hour layover.` / `transit`

**C. 입국 (도착)**
- ch08 입국 심사: *(기존 콘텐츠 재사용 — Task 1)* purpose / length of stay / where you'll stay / nothing to declare
- ch09 수하물·세관: `Where is baggage claim?` / `My bag is missing.` / `Which carousel?` / `Nothing to declare.` / `Here is my baggage tag.` / `I'd like to report lost luggage.`
- ch10 공항→시내: `How do I get to the city center?` / `Where can I buy a ticket?` / `Does this bus go downtown?` / `How much is a taxi to…?` / `Which platform for the airport train?`

**D. 숙소**
- ch11 호텔 체크인: `I have a reservation under…` / `Here is my passport.` / `Is breakfast included?` / `What's the Wi-Fi password?` / `What time is check-out?` / `A room with two beds, please.`
- ch12 호텔 시설·요청: `Could I get more towels?` / `The room hasn't been cleaned.` / `The air conditioning isn't working.` / `Can I have a wake-up call?` / `room service` / `Could you send someone up?`
- ch13 에어비앤비·호스트: `How do I check in?` / `Where do I pick up the keys?` / `What's the door code?` / `Is there a washing machine?` / `When is check-out?` / `The heating doesn't work.`
- ch14 호텔 체크아웃: `I'd like to check out.` / `Can I have the receipt?` / `There's a mistake on my bill.` / `Can I leave my luggage here?` / `late check-out` / `Can I store my bags until 5?`

**E. 이동·교통**
- ch15 길 묻기: *(기존 stub 재작성 — Task 1)* `Excuse me, where is…?` / `How do I get to…?` / `Is it far?` / `Turn left/right.` / `Go straight.` / `It's next to/across from…` / `Can you show me on the map?`
- ch16 지하철·버스: `Where can I buy a metro card?` / `Which line goes to…?` / `Do I need to transfer?` / `Does this bus stop at…?` / `How many stops?` / `Where do I get off?`
- ch17 기차: `Which platform for the train to…?` / `Is this seat taken?` / `Tickets, please.` / `Is this the train to…?` / `The train is delayed.` / `reserved seat`
- ch18 택시·라이드앱: `To this address, please.` / `How much will it be?` / `Can you turn on the meter?` / `Keep the change.` / `Can I have a receipt?` / `Please stop here.`

**F. 식사·쇼핑**
- ch19 식당 주문: *(기존 콘텐츠 재사용 — Task 1)* 자리 요청 / 추천 / 주문 / 채식
- ch20 식당 결제·요청: `Check, please.` / `Is service included?` / `Can we split the bill?` / `I'm allergic to nuts.` / `Could I get some more water?` / `Can I pay by card?`
- ch21 카페·패스트푸드·포장: `For here or to go?` / `A small latte, please.` / `Can I get it without ice?` / `To go, please.` / `Can I have a receipt?` / `Is this seat free?`
- ch22 마트·장보기: `How much is this?` / `Where is the milk?` / `Do you have a bag?` / `Do I weigh this myself?` / `self-checkout` / `Do you take cards?`
- ch23 쇼핑·옷가게: `Do you have this in a medium?` / `Can I try this on?` / `Where is the fitting room?` / `Do you have another color?` / `It's too small.` / `How much is it?`
- ch24 면세·택스리펀: `Can I get a tax refund?` / `tax-free form` / `Where is the customs stamp?` / `I'd like to claim VAT.` / `minimum purchase` / `Where is the refund desk?`

**G. 관광·소통**
- ch25 관광지·티켓: `Two adults and two children, please.` / `Is there a family ticket?` / `Is there a discount for kids?` / `Where is the entrance?` / `What time does it close?` / `Do we need to book in advance?`
- ch26 박물관·투어: `Can I take photos?` / `No flash, please.` / `Is there an audio guide?` / `Where does the tour start?` / `Is this the line for…?` / `How long is the tour?`
- ch27 사진 부탁·스몰토크: `Could you take a photo of us?` / `Just press here.` / `Where are you from?` / `Is this your first time here?` / `Have a nice day!` / `Nice to meet you.`
- ch28 환전·ATM·결제: `Where can I exchange money?` / `What's the exchange rate?` / `Can I pay in local currency?` / `No, charge it in euros.` / `decline DCC` / `Is there an ATM nearby?`

**H. 돌발·마무리**
- ch29 약국·병원·응급: `Where is the nearest pharmacy?` / `I have a headache/fever.` / `Do you have medicine for…?` / `My child is sick.` / `Call an ambulance.` / `I need a doctor.`
- ch30 분실·도난·도움: `I lost my passport.` / `My wallet was stolen.` / `Where is the police station?` / `I'd like to report a theft.` / `Can you help me?` / `Where is the Korean embassy?`

---

## Task 1: 검증 스크립트 추가 + 기존 챕터 재배치

기존 챕터를 시간순 위치(ch08·ch15·ch19)로 옮기고, 이후 모든 단계에서 재사용할 JSON 검증 스크립트를 만든다.

**Files:**
- Create: `scripts/validate-survival-english.mjs`
- Modify: `data/survival-english.json`

- [ ] **Step 1: 검증 스크립트 작성**

`scripts/validate-survival-english.mjs`:

```js
// data/survival-english.json 구조 검증. 사이트 런타임과 무관한 개발용 도구.
import { readFileSync } from "node:fs";

const path = "data/survival-english.json";
const data = JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const ids = new Set();

if (!Array.isArray(data.chapters)) errors.push("chapters가 배열이 아님");

let prev = "";
for (const ch of data.chapters || []) {
  if (!/^ch\d{2}$/.test(ch.id)) errors.push(`잘못된 챕터 id: ${ch.id}`);
  if (ch.id <= prev) errors.push(`챕터 순서 오류: ${ch.id} (이전 ${prev})`);
  prev = ch.id;
  if (!ch.title || !ch.summary) errors.push(`${ch.id}: title/summary 누락`);
  if (!Array.isArray(ch.sections) || ch.sections.length < 1)
    errors.push(`${ch.id}: sections 누락`);

  for (const set of ch.sets || []) {
    const qs = set.questions || [];
    // stub(빈 sets)은 허용하지 않음 — 모든 챕터는 완성 상태여야 함
    if (qs.length !== 10)
      errors.push(`${ch.id}/${set.id}: 문항 ${qs.length}개 (10개여야 함)`);
    for (const q of qs) {
      if (ids.has(q.id)) errors.push(`중복 문항 id: ${q.id}`);
      ids.add(q.id);
      const expectId = `se_${ch.id}_${set.id}_`;
      if (!q.id.startsWith(expectId))
        errors.push(`${q.id}: id 접두사가 ${expectId} 와 불일치`);
      if (q.type === "multiple_choice") {
        if (!Array.isArray(q.options) || q.options.length !== 4)
          errors.push(`${q.id}: options 4개여야 함`);
        if (q.answerIndex < 0 || q.answerIndex > 3)
          errors.push(`${q.id}: answerIndex 범위 오류`);
      } else if (q.type === "ox") {
        if (q.options) errors.push(`${q.id}: ox에는 options 불필요`);
        if (q.answerIndex !== 0 && q.answerIndex !== 1)
          errors.push(`${q.id}: ox answerIndex는 0 또는 1`);
      } else {
        errors.push(`${q.id}: 알 수 없는 type ${q.type}`);
      }
      if (!q.explanation) errors.push(`${q.id}: explanation 누락`);
    }
  }
}

const chapterCount = (data.chapters || []).length;
console.log(`챕터 ${chapterCount}개, 문항 ${ids.size}개 검사함`);
if (errors.length) {
  console.error(`\n검증 실패 (${errors.length}건):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("검증 통과 ✅");
```

- [ ] **Step 2: 기존 챕터 재배치 (id 재번호 + 순서)**

`data/survival-english.json`의 `chapters` 배열을 다음 순서로 재배치한다 (현재 ch01·ch02·ch03 → ch08·ch19·ch15):

1. **기존 ch01 "공항 입국 심사"** → `id`를 `"ch08"`로 변경. 내부 문항 id의 `_ch01_`을 `_ch08_`로 모두 치환 (예: `se_ch01_set01_001` → `se_ch08_set01_001`). 세트 id(set01/set02)는 유지.
2. **기존 ch03 "길찾기와 교통 (준비 중)"** → `id`를 `"ch15"`로 변경. (본문·세트는 Task 6에서 재작성하므로 지금은 stub 유지.)
3. **기존 ch02 "식당에서 주문하기"** → `id`를 `"ch19"`로 변경. 내부 문항 id의 `_ch02_`를 `_ch19_`로 모두 치환. 세트 id 유지.

배열 순서는 `[ch08, ch15, ch19]`가 된다.

- [ ] **Step 3: JSON 파싱 확인**

Run: `node -e "JSON.parse(require('fs').readFileSync('data/survival-english.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: 재배치 결과 확인**

Run: `node -e "const d=JSON.parse(require('fs').readFileSync('data/survival-english.json','utf8')); console.log(d.chapters.map(c=>c.id+':'+c.title).join('\n'))"`
Expected (3줄):
```
ch08:공항 입국 심사
ch15:길찾기와 교통 (준비 중)
ch19:식당에서 주문하기
```

> 참고: 이 시점에는 검증 스크립트가 ch15 stub(빈 sets)·순서 때문에 실패할 수 있다. Task 1에서는 위 Step 3·4만 통과하면 된다. 전체 검증 통과는 모든 챕터가 채워진 뒤(Task 9)에 달성된다.

- [ ] **Step 5: 커밋**

```bash
git add scripts/validate-survival-english.mjs data/survival-english.json
git commit -m "Add JSON validator; renumber existing chapters to chronological slots"
```

---

## Task 2: Phase A — 출국 준비 & 공항 (ch01–ch04)

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch01–ch04 작성**

배열 **맨 앞**(기존 ch08 앞)에 ch01, ch02, ch03, ch04 챕터 객체 4개를 시간순으로 삽입한다. 각 챕터는 "핵심 규칙" 섹션의 JSON 구조·세트 규칙을 따르고, 위 콘텐츠 브리프의 ch01–ch04 표현을 본문 섹션(2~4개)과 10문항 세트 1개(set01)로 구현한다.

작성 시 체크:
- `id`: ch01 / ch02 / ch03 / ch04, 각 `sets[0].id` = `"set01"`.
- 문항 id: `se_ch01_set01_001` … `_010` 형식, 챕터마다 번호 갱신.
- multiple_choice 6~8 + ox 2~4, 합계 10.

- [ ] **Step 2: 검증 스크립트 실행 (해당 챕터 한정 통과 확인)**

Run: `node scripts/validate-survival-english.mjs`
Expected: ch01–ch04, ch08, ch19에 대한 오류 없음. (ch15 stub의 "문항 0개" 오류만 남아 있는 상태 — Task 6에서 해소.)

ch15 외 다른 오류가 보이면 수정 후 재실행.

- [ ] **Step 3: 브라우저 스폿 체크 (선택)**

Run: `python3 -m http.server 8000` 후 `http://localhost:8000/category.html?cat=survival-english` 에서 ch01–ch04가 "1세트" 배지로 목록에 보이는지, 챕터 진입·퀴즈 10문항 출제가 되는지 확인. 확인 후 서버 종료.

- [ ] **Step 4: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase A chapters (ch01-ch04): pre-departure & airport"
```

---

## Task 3: Phase B — 기내 & 경유 (ch05–ch07)

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch05–ch07 작성**

ch04 뒤, 기존 ch08 앞에 ch05, ch06, ch07을 삽입한다. 콘텐츠 브리프 ch05–ch07 표현으로 본문 2~4섹션 + 10문항 set01을 작성. 문항 id는 `se_ch05_set01_001` 형식.

- [ ] **Step 2: 검증 실행**

Run: `node scripts/validate-survival-english.mjs`
Expected: ch15 stub 오류만 남고 나머지 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase B chapters (ch05-ch07): in-flight & transfer"
```

---

## Task 4: Phase C — 입국 (ch08–ch10)

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch09–ch10 작성**

ch08(기존 입국 심사, 이미 완성)은 그대로 둔다. ch08 **뒤**에 ch09, ch10을 삽입. 콘텐츠 브리프 ch09–ch10 표현으로 본문 + 10문항 set01 작성. 문항 id `se_ch09_set01_001` / `se_ch10_set01_001` 형식.

- [ ] **Step 2: 검증 실행**

Run: `node scripts/validate-survival-english.mjs`
Expected: ch15 stub 오류만 남음.

- [ ] **Step 3: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase C chapters (ch09-ch10): arrival, baggage & customs"
```

---

## Task 5: Phase D — 숙소 (ch11–ch14)

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch11–ch14 작성**

ch10 뒤, 기존 ch15 앞에 ch11, ch12, ch13, ch14를 삽입. 콘텐츠 브리프 ch11–ch14 표현으로 본문 + 10문항 set01 각각 작성. 문항 id `se_ch11_set01_001` … 형식.

- [ ] **Step 2: 검증 실행**

Run: `node scripts/validate-survival-english.mjs`
Expected: ch15 stub 오류만 남음.

- [ ] **Step 3: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase D chapters (ch11-ch14): accommodation"
```

---

## Task 6: Phase E — 이동·교통 (ch15–ch18)

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch15 stub 재작성 + ch16–ch18 작성**

- **ch15** "길찾기와 교통 (준비 중)" stub을 **재작성**한다: `title`을 `"길 묻기"`로, `summary`를 적절히(예: `"방향·거리·지도 보며 길 묻기"`), 본문 섹션과 10문항 set01을 콘텐츠 브리프 ch15 표현으로 채운다. (빈 `sets: []` → 10문항 set01)
- ch15 **뒤**에 ch16, ch17, ch18을 삽입. 브리프 표현으로 각각 본문 + 10문항 set01.
- 문항 id: `se_ch15_set01_001` … `se_ch18_set01_001` 형식.

- [ ] **Step 2: 검증 실행 (이제 stub 오류도 사라져야 함)**

Run: `node scripts/validate-survival-english.mjs`
Expected: 오류 0건, `검증 통과 ✅`. (ch15가 채워졌으므로 남아 있던 stub 오류 해소.)

- [ ] **Step 3: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase E chapters (ch15-ch18): getting around"
```

---

## Task 7: Phase F — 식사·쇼핑 (ch19–ch24)

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch20–ch24 작성**

ch19(기존 식당 주문, 이미 완성)는 그대로 둔다. ch19 **뒤**에 ch20, ch21, ch22, ch23, ch24를 삽입. 브리프 ch20–ch24 표현으로 각각 본문 + 10문항 set01. 문항 id `se_ch20_set01_001` … 형식.

- [ ] **Step 2: 검증 실행**

Run: `node scripts/validate-survival-english.mjs`
Expected: 오류 0건, `검증 통과 ✅`.

- [ ] **Step 3: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase F chapters (ch20-ch24): dining & shopping"
```

---

## Task 8: Phase G — 관광·소통 (ch25–ch28)

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch25–ch28 작성**

ch24 뒤에 ch25, ch26, ch27, ch28을 삽입. 브리프 ch25–ch28 표현으로 각각 본문 + 10문항 set01. 문항 id `se_ch25_set01_001` … 형식.

- [ ] **Step 2: 검증 실행**

Run: `node scripts/validate-survival-english.mjs`
Expected: 오류 0건, `검증 통과 ✅`.

- [ ] **Step 3: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase G chapters (ch25-ch28): sightseeing & small talk"
```

---

## Task 9: Phase H — 돌발·마무리 (ch29–ch30) + 최종 검증

**Files:**
- Modify: `data/survival-english.json`

- [ ] **Step 1: ch29–ch30 작성**

ch28 뒤(배열 끝)에 ch29, ch30을 삽입. 브리프 ch29–ch30 표현으로 각각 본문 + 10문항 set01. 문항 id `se_ch29_set01_001` / `se_ch30_set01_001` 형식.

- [ ] **Step 2: 최종 검증 (30챕터 전부)**

Run: `node scripts/validate-survival-english.mjs`
Expected: `챕터 30개, 문항 N개 검사함` + `검증 통과 ✅` (오류 0건).

- [ ] **Step 3: 챕터 순서·개수 최종 확인**

Run: `node -e "const d=JSON.parse(require('fs').readFileSync('data/survival-english.json','utf8')); const ids=d.chapters.map(c=>c.id); console.log(ids.join(',')); console.log('count', ids.length)"`
Expected: `ch01,ch02,…,ch30` 순서, `count 30`.

- [ ] **Step 4: 브라우저 전체 스폿 체크**

`python3 -m http.server 8000` → `http://localhost:8000/index.html` → 생존 영어 회화 → 챕터 30개가 시간순으로 보이고 모두 "1세트" 배지. 임의 챕터 3개(예: ch05, ch16, ch29) 진입해 본문 표시·PIN·퀴즈 10문항·결과 해설까지 동작 확인. 확인 후 서버 종료.

- [ ] **Step 5: 커밋**

```bash
git add data/survival-english.json
git commit -m "Add survival-english Phase H chapters (ch29-ch30): emergencies; complete 30 chapters"
```

---

## Self-Review 메모

- **스펙 커버리지:** 30챕터 전부 Task 2~9에 매핑됨(A→2, B→3, C→4, D→5, E→6, F→7, G→8, H→9). 기존 3챕터 재배치는 Task 1. 분량 기준(섹션 2~4 + 세트 1개 10문항)은 "핵심 규칙"에 명시.
- **순서 불변식:** 각 Task에 삽입 위치(앵커 챕터 앞/뒤)를 명시. ch08·ch19는 보존, ch15는 Task 6에서 재작성.
- **검증:** 매 단계 `validate-survival-english.mjs` 실행. ch15 stub 때문에 Task 2~5에서는 "ch15 문항 0개" 오류가 의도적으로 남으며, Task 6에서 해소됨을 각 Task에 명시(거짓 통과/혼동 방지).
- **id 일관성:** 문항 id 접두사 규칙 `se_<chId>_<setId>_NNN`을 검증 스크립트가 강제. 기존 ch01/ch02 재번호 시 문항 id도 함께 치환하도록 Task 1에 명시.
