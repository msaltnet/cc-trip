# 여행 상식 카테고리 통합 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `packing`·`finance` 두 카테고리를 단일 카테고리 "여행 상식"(`travel-tips`)으로 통합하고, 신규 4개 챕터를 추가한다.

**Architecture:** 앱은 완전 데이터 주도(`js/data.js`가 `categories.json`의 `file`을 따라 카테고리 JSON을 읽고, `chapters` 배열을 순서대로 렌더). 따라서 코드 변경 없이 `data/` JSON 편집만으로 완료한다. 신규 파일 `data/travel-tips.json`을 챕터 7개(ch01~ch07) 순서로 구성하고, `categories.json`을 갱신하며, 구 파일 2개를 삭제한다.

**Tech Stack:** 순수 정적 사이트(HTML/CSS/JS, 빌드 없음). 검증은 Node로 JSON 파싱·구조 확인 + 로컬 HTTP 서버 수동 점검.

---

## 콘텐츠 규칙 (모든 신규 챕터 공통 — README 발췌)

- 문제 유형은 두 가지: `multiple_choice`(보기 4개 권장, `answerIndex` 0부터) 또는 `ox`(보기 없음, `answerIndex` 0=O/참, 1=X/거짓).
- **1세트 = 정확히 10문제.** 신규 챕터는 챕터당 **2세트(set01, set02)**.
- 두 세트는 **같은 주제·개념**을 다루되 **지문·보기·순서를 다르게** 만든다(답 암기 방지).
- 문제 `id` 형식: `tt_chNN_setNN_NNN` (예: `tt_ch02_set01_001`).
- 본문(`sections`)은 `heading` + `body` 객체 배열.
- 문체·난이도는 기존 packing/finance 문제와 동일하게(가족 대상, 평이한 한국어, 각 문제에 `explanation` 필수).

## 파일 구조

- **Create:** `data/travel-tips.json` — 통합 카테고리 본체(챕터 7개).
- **Modify:** `data/categories.json` — `packing`·`finance` 제거, `travel-tips` 추가.
- **Delete:** `data/packing.json`, `data/finance.json`.
- **Check:** `README.md` — 본문에 `packing`/`finance` 직접 참조가 있으면 갱신(현재 예시는 가상 `safety`라 영향 없을 가능성 높음 — 확인만).

## 최종 챕터 구성 (배열 순서대로)

| ch   | title            | summary                                   | 출처            |
|------|------------------|-------------------------------------------|-----------------|
| ch01 | 짐 싸기          | 소매치기 방지 용품, 어댑터, 비상약, 운동화 | packing ch01    |
| ch02 | 데이터·eSIM·로밍 | eSIM/유심/로밍 비교, 설정, 데이터 절약     | 신규            |
| ch03 | 여행자보험       | 보장 항목, 사고 대처, 청구 서류           | 신규            |
| ch04 | 비행기·수하물 규정 | 액체 100ml, 수하물 무게, 보조배터리, 환승 | 신규            |
| ch05 | 숙소 체크인·환전 | 체크인, 시티택스·보증금, 현금 환전 요령   | 신규            |
| ch06 | 현지 카드 결제 요령 | DCC 차단, 트래블카드, 소액 현금          | finance ch01    |
| ch07 | 공항 택스리펀(Tax Refund) | 면세 환급 자격·절차·도장          | finance ch02    |

---

### Task 1: travel-tips.json 생성 + ch01(짐 싸기) 이전

기존 `data/packing.json`의 `ch01`을 그대로 옮기되, 카테고리 메타와 문제 `id` 접두사만 바꾼다.

**Files:**
- Create: `data/travel-tips.json`
- Read (출처): `data/packing.json`

- [ ] **Step 1: 파일 골격 + ch01 작성**

`data/travel-tips.json`을 아래 골격으로 만든다. `chapters` 배열의 ch01은 **`data/packing.json`의 `chapters[0]` 내용을 그대로 복사**하되 다음만 바꾼다:
- 챕터 `id`: `ch01` 유지(동일).
- 모든 문제 `id`의 접두사 `packing_ch01_` → `tt_ch01_` (예: `packing_ch01_set01_001` → `tt_ch01_set01_001`). 그 외 `question`/`options`/`answerIndex`/`explanation`/`sections`는 **글자 그대로 유지**.

```json
{
  "id": "travel-tips",
  "title": "여행 상식",
  "chapters": [
    {
      "id": "ch01",
      "title": "짐 싸기",
      "summary": "소매치기 방지 용품, 어댑터, 비상약, 운동화",
      "sections": [ /* packing.json ch01의 sections 3개 그대로 */ ],
      "sets": [ /* packing.json ch01의 set01·set02 그대로, 문제 id 접두사만 tt_ch01_ 로 */ ]
    }
  ]
}
```

> 참고: 기존 packing 챕터 title은 "필수 준비물"이었으나 통합 카테고리에서는 챕터 주제를 명확히 하기 위해 **"짐 싸기"** 로 바꾼다(summary는 동일 유지).

- [ ] **Step 2: 파싱·구조 검증**

Run:
```bash
node -e "const d=require('./data/travel-tips.json'); const c=d.chapters[0]; console.log(d.id, '|', c.id, c.title, '| sections', c.sections.length, '| sets', c.sets.length, '| q', c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('id ok:', ids.every(i=>i.startsWith('tt_ch01_')), '| count', ids.length, '| unique', new Set(ids).size)"
```
Expected: `travel-tips | ch01 짐 싸기 | sections 3 | sets 2 | q [ 10, 10 ] ` 그리고 `id ok: true | count 20 | unique 20`

- [ ] **Step 3: Commit**

```bash
git add data/travel-tips.json
git commit -m "Travel-tips: create category, migrate packing as ch01 짐 싸기"
```

---

### Task 2: ch02 데이터·eSIM·로밍 (신규)

**Files:**
- Modify: `data/travel-tips.json` (`chapters` 배열에 ch02 추가)

- [ ] **Step 1: 본문(sections) 추가**

`chapters` 배열 끝(ch01 다음)에 ch02 객체를 추가한다. `sections`는 아래 내용을 그대로 사용한다:

```json
{
  "id": "ch02",
  "title": "데이터·eSIM·로밍",
  "summary": "eSIM·유심·로밍 비교, 개통·설정, 데이터 절약",
  "sections": [
    { "heading": "eSIM·유심·로밍 비교", "body": "현지 데이터를 쓰는 방법은 크게 세 가지입니다. eSIM은 QR코드로 즉시 개통돼 물리 카드 교체가 필요 없고, 데이터 유심은 사전 구매하거나 현지에서 사서 끼웁니다(기존 한국 번호로 오는 전화·문자는 못 받을 수 있음). 통신사 로밍은 가장 편하지만 보통 가장 비쌉니다. 단기 가족여행에는 eSIM이나 데이터 유심이 가성비가 좋습니다." },
    { "heading": "개통·설정", "body": "eSIM은 출발 전 구매해 QR을 등록해 두고, 현지 도착 후 활성화합니다. 데이터를 쓰려면 휴대폰 설정에서 '데이터 로밍'을 켜야 합니다. 최신 폰은 기존 유심을 빼지 않고 eSIM을 함께 쓰는 듀얼 구성이 가능해, 한국 번호로 오는 문자를 받으면서 현지 데이터를 쓸 수 있습니다." },
    { "heading": "데이터 절약", "body": "숙소·카페의 와이파이를 적극 활용하고, 지도·번역 앱은 오프라인 데이터를 미리 내려받아 두세요. 백그라운드 앱 새로고침과 자동 업데이트를 꺼 두면 데이터 소모를 크게 줄일 수 있습니다." }
  ],
  "sets": [ /* Step 2에서 작성 */ ]
}
```

- [ ] **Step 2: set01·set02 작성 (각 10문제)**

위 sections 3개 주제를 다음 사실들로 분배해 **set01 10문제 + set02 10문제**를 작성한다. 두 세트는 같은 사실을 다루되 지문·보기·순서를 다르게 한다. `multiple_choice`와 `ox`를 섞는다(기존 챕터는 세트당 mc 7 + ox 3 비율 정도).

세트가 반드시 다뤄야 할 사실(각 세트가 아래를 골고루 커버):
1. eSIM은 QR로 즉시 개통, 물리 카드 교체 불필요.
2. 데이터 유심은 카드를 끼우며, 기존 한국 번호 수신이 제한될 수 있음.
3. 통신사 로밍은 가장 편하지만 보통 가장 비쌈.
4. 단기 가족여행엔 eSIM/데이터 유심이 가성비.
5. 데이터를 쓰려면 '데이터 로밍'을 켜야 함.
6. 듀얼(유심+eSIM)로 한국 번호 문자 수신 + 현지 데이터 병행 가능.
7. 숙소·카페 와이파이 활용.
8. 지도·번역 앱 오프라인 데이터 미리 다운로드.
9. 백그라운드 새로고침·자동 업데이트 끄기로 데이터 절약.

작성 예시(형식 참고용 — 그대로 쓰지 말고 위 사실들로 채울 것):
```json
{
  "id": "tt_ch02_set01_001",
  "type": "multiple_choice",
  "question": "물리 유심 카드를 갈아끼우지 않고 QR코드 등록만으로 현지 데이터를 개통하는 방법은?",
  "options": ["eSIM", "여행자 수표", "데이터 로밍 해지", "와이파이 도시락 반납"],
  "answerIndex": 0,
  "explanation": "eSIM은 QR코드로 즉시 개통되어 물리 카드 교체가 필요 없습니다."
}
```

- [ ] **Step 3: 검증**

Run:
```bash
node -e "const d=require('./data/travel-tips.json'); const c=d.chapters.find(x=>x.id==='ch02'); console.log(c.title,'| sections',c.sections.length,'| sets',c.sets.length,'| q',c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('prefix ok:',ids.every(i=>i.startsWith('tt_ch02_')),'| unique',new Set(ids).size,'/',ids.length); console.log('types:',[...new Set(c.sets.flatMap(s=>s.questions.map(q=>q.type)))])"
```
Expected: `데이터·eSIM·로밍 | sections 3 | sets 2 | q [ 10, 10 ]`, `prefix ok: true | unique 20 / 20`, `types: [ 'multiple_choice', 'ox' ]`

- [ ] **Step 4: Commit**

```bash
git add data/travel-tips.json
git commit -m "Travel-tips: add ch02 데이터·eSIM·로밍 (sections + 2 sets)"
```

---

### Task 3: ch03 여행자보험 (신규)

**Files:**
- Modify: `data/travel-tips.json`

- [ ] **Step 1: 본문(sections) 추가**

`chapters` 배열 끝(ch02 다음)에 ch03을 추가한다:

```json
{
  "id": "ch03",
  "title": "여행자보험",
  "summary": "보장 항목, 의료·도난 사고 대처, 청구 서류",
  "sections": [
    { "heading": "보장 항목", "body": "여행자보험은 해외 의료비, 휴대품 도난·파손, 항공기 지연·수하물 분실, 타인에 대한 배상책임 등을 보장합니다. 가족 단위로 한 번에 가입할 수 있고, 보장 한도와 항목은 상품마다 다르므로 출발 전 확인합니다." },
    { "heading": "의료·도난 사고 대처", "body": "현지에서 아파 병원을 이용하면 진단서와 영수증을 꼭 챙깁니다. 물건을 도난당하면 현지 경찰서에서 도난 신고서(폴리스 리포트, police report)를 발급받아야 보상 청구가 가능합니다." },
    { "heading": "청구 서류", "body": "보험금은 보통 귀국 후 보험사에 청구합니다. 진단서·영수증·경찰 신고서 등 원본을 잘 보관하고, 분실에 대비해 사진으로 미리 백업해 두면 좋습니다." }
  ],
  "sets": [ /* Step 2 */ ]
}
```

- [ ] **Step 2: set01·set02 작성 (각 10문제)**

다뤄야 할 사실:
1. 보장 항목: 의료비, 휴대품 도난·파손, 항공 지연·수하물 분실, 배상책임.
2. 가족 단위 가입 가능, 보장 한도·항목은 상품마다 다름(출발 전 확인).
3. 병원 이용 시 진단서·영수증 보관.
4. 도난 시 현지 경찰의 도난 신고서(폴리스 리포트) 발급 필요.
5. 보험금은 보통 귀국 후 보험사에 청구.
6. 서류 원본 보관 + 사진 백업.

작성 예시(참고용):
```json
{
  "id": "tt_ch03_set01_004",
  "type": "ox",
  "question": "여행 중 물건을 도난당했을 때 보험 청구를 하려면 현지 경찰의 도난 신고서(폴리스 리포트)가 필요하다.",
  "answerIndex": 0,
  "explanation": "도난 보상 청구에는 현지 경찰서에서 발급한 도난 신고서가 보통 필요합니다."
}
```

- [ ] **Step 3: 검증**

Run:
```bash
node -e "const d=require('./data/travel-tips.json'); const c=d.chapters.find(x=>x.id==='ch03'); console.log(c.title,'| sections',c.sections.length,'| sets',c.sets.length,'| q',c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('prefix ok:',ids.every(i=>i.startsWith('tt_ch03_')),'| unique',new Set(ids).size,'/',ids.length)"
```
Expected: `여행자보험 | sections 3 | sets 2 | q [ 10, 10 ]`, `prefix ok: true | unique 20 / 20`

- [ ] **Step 4: Commit**

```bash
git add data/travel-tips.json
git commit -m "Travel-tips: add ch03 여행자보험 (sections + 2 sets)"
```

---

### Task 4: ch04 비행기·수하물 규정 (신규)

**Files:**
- Modify: `data/travel-tips.json`

- [ ] **Step 1: 본문(sections) 추가**

`chapters` 배열 끝(ch03 다음)에 ch04를 추가한다:

```json
{
  "id": "ch04",
  "title": "비행기·수하물 규정",
  "summary": "기내 액체 100ml, 수하물 무게, 보조배터리, 환승",
  "sections": [
    { "heading": "기내 액체 규정", "body": "기내(휴대) 수하물의 액체류는 한 용기당 100ml 이하여야 하고, 전체를 1리터 투명 지퍼백 1개에 담아야 합니다. 그보다 큰 액체(화장품·물 등)는 위탁 수하물에 넣습니다." },
    { "heading": "수하물 무게·개수", "body": "위탁 수하물의 무게·개수 제한은 항공사와 요금제마다 다릅니다. 저비용 항공(LCC)은 기내 수하물도 엄격하게 잰다는 점에 주의하세요. 한도를 넘으면 공항에서 비싼 추가요금을 냅니다. 출발 전 항공권의 수하물 규정을 확인합니다." },
    { "heading": "보조배터리·전자기기", "body": "보조배터리와 리튬배터리는 위탁이 금지되어 반드시 기내에 휴대해야 합니다. 용량 제한(보통 100Wh, 약 27,000mAh 이하)이 있으니 확인하세요." },
    { "heading": "환승·도착", "body": "환승이 있으면 연결 시간을 넉넉히 두고, 위탁 수하물이 최종 목적지까지 자동 연결되는지 확인합니다. 도착하면 수하물 수취대(baggage claim)에서 짐을 찾습니다." }
  ],
  "sets": [ /* Step 2 */ ]
}
```

- [ ] **Step 2: set01·set02 작성 (각 10문제)**

다뤄야 할 사실:
1. 기내 액체: 용기당 100ml 이하.
2. 액체 전체를 1L 투명 지퍼백 1개에 담음.
3. 큰 액체는 위탁 수하물로.
4. 위탁 수하물 무게·개수 제한은 항공사·요금제마다 다름(출발 전 확인).
5. LCC는 기내 수하물도 엄격히 잼, 초과 시 추가요금.
6. 보조배터리·리튬배터리는 위탁 금지, 기내 휴대만 가능.
7. 보조배터리 용량 제한(보통 100Wh).
8. 환승 시 연결 시간 여유 + 위탁 수하물 자동 연결 확인.
9. 도착 후 수하물 수취대에서 짐 찾기.

작성 예시(참고용):
```json
{
  "id": "tt_ch04_set01_001",
  "type": "multiple_choice",
  "question": "기내(휴대) 수하물에 넣을 수 있는 액체 용기의 1개당 최대 용량은?",
  "options": ["100ml", "500ml", "1L", "제한 없음"],
  "answerIndex": 0,
  "explanation": "기내 액체류는 한 용기당 100ml 이하여야 하며, 1리터 투명 지퍼백 1개에 모아 담아야 합니다."
}
```

- [ ] **Step 3: 검증**

Run:
```bash
node -e "const d=require('./data/travel-tips.json'); const c=d.chapters.find(x=>x.id==='ch04'); console.log(c.title,'| sections',c.sections.length,'| sets',c.sets.length,'| q',c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('prefix ok:',ids.every(i=>i.startsWith('tt_ch04_')),'| unique',new Set(ids).size,'/',ids.length)"
```
Expected: `비행기·수하물 규정 | sections 4 | sets 2 | q [ 10, 10 ]`, `prefix ok: true | unique 20 / 20`

- [ ] **Step 4: Commit**

```bash
git add data/travel-tips.json
git commit -m "Travel-tips: add ch04 비행기·수하물 규정 (sections + 2 sets)"
```

---

### Task 5: ch05 숙소 체크인·환전 (신규)

**Files:**
- Modify: `data/travel-tips.json`

- [ ] **Step 1: 본문(sections) 추가**

`chapters` 배열 끝(ch04 다음)에 ch05를 추가한다:

```json
{
  "id": "ch05",
  "title": "숙소 체크인·환전",
  "summary": "체크인, 시티택스·보증금, 현금 환전 요령",
  "sections": [
    { "heading": "체크인", "body": "호텔·에어비앤비 모두 체크인 가능 시간을 미리 확인하고, 체크인 시 여권을 제시합니다. 에어비앤비는 호스트와 미리 체크인 방법(직접 만남, 셀프 체크인, 키박스 비밀번호 등)을 조율해 두면 도착 후 헤매지 않습니다." },
    { "heading": "시티택스·보증금", "body": "유럽의 많은 도시는 1박당 시티택스(숙박세, city tax)를 숙소에서 현장 결제로 따로 받습니다. 호텔은 체크인 때 보증금(디포짓)을 카드로 임시 승인(홀드)할 수 있는데, 체크아웃 시 문제가 없으면 해제됩니다." },
    { "heading": "현금 환전 요령", "body": "공항 환전소는 환율이 나쁜 편이라 큰 금액을 바꾸기엔 손해입니다. 꼭 필요한 소액만 바꾸고, 현지 ATM에서 현지통화로 인출하는 편이 보통 유리합니다. 이때도 화면에 원화 환산(DCC)이 뜨면 거절하고 현지통화로 인출하세요." }
  ],
  "sets": [ /* Step 2 */ ]
}
```

> 참고: ch05의 "현금 환전 요령"은 ch06(카드 결제)의 DCC 개념과 연결되지만, 관점이 다르다(현금 인출 vs 카드 결제). 두 챕터에서 DCC 문제가 **동일 지문으로 중복되지 않도록** 주의한다.

- [ ] **Step 2: set01·set02 작성 (각 10문제)**

다뤄야 할 사실:
1. 체크인 가능 시간 미리 확인 + 여권 제시.
2. 에어비앤비는 호스트와 체크인 방법(셀프 체크인/키박스 등) 사전 조율.
3. 많은 도시가 1박당 시티택스(숙박세)를 현장에서 부과.
4. 호텔 보증금(디포짓)을 카드로 임시 홀드, 체크아웃 시 문제없으면 해제.
5. 공항 환전소는 환율이 나빠 큰 금액 환전은 손해.
6. 필요한 소액만 환전, 현지 ATM 현지통화 인출이 보통 유리.
7. ATM 인출 시에도 원화 환산(DCC)은 거절, 현지통화 선택.

작성 예시(참고용):
```json
{
  "id": "tt_ch05_set01_003",
  "type": "ox",
  "question": "유럽의 많은 도시는 숙박 1박당 시티택스(숙박세)를 숙소에서 따로 받는다.",
  "answerIndex": 0,
  "explanation": "여러 유럽 도시는 1박당 시티택스를 숙소 현장에서 별도로 부과합니다."
}
```

- [ ] **Step 3: 검증**

Run:
```bash
node -e "const d=require('./data/travel-tips.json'); const c=d.chapters.find(x=>x.id==='ch05'); console.log(c.title,'| sections',c.sections.length,'| sets',c.sets.length,'| q',c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('prefix ok:',ids.every(i=>i.startsWith('tt_ch05_')),'| unique',new Set(ids).size,'/',ids.length)"
```
Expected: `숙소 체크인·환전 | sections 3 | sets 2 | q [ 10, 10 ]`, `prefix ok: true | unique 20 / 20`

- [ ] **Step 4: Commit**

```bash
git add data/travel-tips.json
git commit -m "Travel-tips: add ch05 숙소 체크인·환전 (sections + 2 sets)"
```

---

### Task 6: ch06(카드 결제)·ch07(택스리펀) 이전

기존 `data/finance.json`의 두 챕터를 그대로 옮기되, 챕터 `id`와 문제 `id` 접두사만 바꾼다.

**Files:**
- Modify: `data/travel-tips.json`
- Read (출처): `data/finance.json`

- [ ] **Step 1: ch06 추가 (finance ch01 이전)**

`chapters` 배열 끝(ch05 다음)에 finance.json `chapters[0]`(현지 카드 결제 요령)을 추가한다. 다음만 바꾼다:
- 챕터 `id`: `ch01` → `ch06`. `title`/`summary`/`sections`는 그대로.
- 모든 문제 `id` 접두사 `finance_ch01_` → `tt_ch06_` (예: `finance_ch01_set01_001` → `tt_ch06_set01_001`). 나머지 필드는 글자 그대로.

- [ ] **Step 2: ch07 추가 (finance ch02 이전)**

`chapters` 배열 끝(ch06 다음)에 finance.json `chapters[1]`(공항 택스리펀)을 추가한다. 다음만 바꾼다:
- 챕터 `id`: `ch02` → `ch07`. `title`/`summary`/`sections`는 그대로.
- 모든 문제 `id` 접두사 `finance_ch02_` → `tt_ch07_`. 나머지 필드는 글자 그대로.

- [ ] **Step 3: 전체 구조 검증**

Run:
```bash
node -e "const d=require('./data/travel-tips.json'); console.log('chapters:', d.chapters.map(c=>c.id).join(',')); d.chapters.forEach(c=>{const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log(c.id, c.title, '| sets', c.sets.length, '| q', c.sets.map(s=>s.questions.length), '| prefix ok', ids.every(i=>i.startsWith('tt_'+c.id+'_')))})"
```
Expected: `chapters: ch01,ch02,ch03,ch04,ch05,ch06,ch07`, 그리고 각 줄이 `| sets 2 | q [ 10, 10 ] | prefix ok true`

- [ ] **Step 4: Commit**

```bash
git add data/travel-tips.json
git commit -m "Travel-tips: migrate finance as ch06 카드 결제·ch07 택스리펀"
```

---

### Task 7: categories.json 갱신 + 구 파일 삭제

**Files:**
- Modify: `data/categories.json`
- Delete: `data/packing.json`, `data/finance.json`

- [ ] **Step 1: categories.json 편집**

`packing`·`finance` 두 항목을 제거하고, `culture` 항목 **다음**에 아래 항목을 추가한다. 최종 순서: survival-english → city-info → culture → travel-tips.

```json
  {
    "id": "travel-tips",
    "icon": "🧳",
    "title": "여행 상식",
    "summary": "짐 싸기, eSIM, 수하물, 숙소·환전, 카드 결제, 택스리펀",
    "file": "travel-tips.json"
  }
```

- [ ] **Step 2: 구 파일 삭제**

```bash
git rm data/packing.json data/finance.json
```

- [ ] **Step 3: 검증**

Run:
```bash
node -e "const cats=require('./data/categories.json'); console.log('ids:', cats.map(c=>c.id).join(',')); const tt=cats.find(c=>c.id==='travel-tips'); console.log('travel-tips file:', tt && tt.file); console.log('packing/finance gone:', !cats.some(c=>['packing','finance'].includes(c.id)))"
ls data/packing.json data/finance.json 2>&1 | head -2
```
Expected: `ids: survival-english,city-info,culture,travel-tips`, `travel-tips file: travel-tips.json`, `packing/finance gone: true`, 그리고 `ls`는 "No such file" 2건.

- [ ] **Step 4: Commit**

```bash
git add data/categories.json
git commit -m "Travel-tips: register category, remove packing/finance"
```

---

### Task 8: 통합 검증 + 수동 점검 + README 확인

**Files:**
- Check/Modify: `README.md`

- [ ] **Step 1: 전체 JSON 무결성 검증**

Run:
```bash
node -e "
const cats=require('./data/categories.json');
let ok=true;
for(const c of cats){
  const d=require('./data/'+c.file);
  for(const ch of d.chapters){
    for(const s of (ch.sets||[])){
      for(const q of s.questions){
        const opts = q.type==='ox' ? 2 : (q.options||[]).length;
        if(q.answerIndex==null || q.answerIndex<0 || q.answerIndex>=opts){ console.log('BAD answerIndex', c.id, q.id); ok=false; }
        if(q.type!=='ox' && (q.options||[]).length<2){ console.log('BAD options', c.id, q.id); ok=false; }
        if(!q.explanation){ console.log('NO explanation', c.id, q.id); ok=false; }
      }
    }
  }
}
console.log('all categories valid:', ok);
"
```
Expected: 위반 출력 없이 `all categories valid: true`

- [ ] **Step 2: 로컬 서버 수동 점검**

```bash
python -m http.server 8000
```
브라우저에서 `http://localhost:8000` 접속 후 확인:
- 메인에 "여행 상식"(🧳) 카드가 보이고, "짐 싸기 체크리스트"·"환전·결제 상식" 카드는 사라졌다.
- 여행 상식 → 챕터 7개(짐 싸기 ~ 택스리펀)가 순서대로 보인다.
- 임의 챕터 본문 표시 → "퀴즈 시작하기" → PIN 입력 → 10문항 출제 → 제출 → 결과·해설 정상.
- 신규 챕터(예: ch02·ch04) 한 번씩 퀴즈를 끝까지 풀어 정답·해설이 어긋나지 않는지 확인.

확인 후 `Ctrl+C`로 서버 종료.

- [ ] **Step 3: README 참조 확인**

Run:
```bash
grep -n -E "packing\.json|finance\.json|\"packing\"|\"finance\"|짐 싸기 체크리스트|환전·결제 상식" README.md || echo "no stale references"
```
- 출력이 `no stale references`이면 다음 단계로.
- 참조가 나오면 해당 서술을 통합 후 구조에 맞게 수정한다(예: 카테고리 목록·예시).

- [ ] **Step 4: 최종 Commit (README 수정 시에만)**

```bash
git add README.md
git commit -m "Docs: update README for travel-tips category merge"
```
README 수정이 없었다면 이 단계는 건너뛴다.

---

## Self-Review (작성자 체크 결과)

- **Spec 커버리지:** 카테고리 통합(Task 1·6·7), 신규 4챕터(Task 2~5), 콘텐츠 분량 2세트(각 Task Step 2 + 검증), 코드 미변경(데이터만), 검증·문서(Task 8) — 스펙의 모든 항목에 대응 태스크 존재.
- **Placeholder 스캔:** 신규 챕터의 sections 본문은 전문이 포함됨. 퀴즈 문제는 "사실 목록 + 형식 예시"로 명세(문제 작성 자체가 구현 작업이므로 사실·형식·검증을 구체화). "적절히 처리" 류 모호 지시 없음.
- **타입 일관성:** 모든 문제 `id`는 `tt_chNN_setNN_NNN`, 챕터 `id`는 ch01~ch07, 카테고리 `id`는 `travel-tips`로 전 태스크에서 일치. 검증 스크립트의 필드명(`chapters`/`sets`/`questions`/`answerIndex`/`options`/`type`/`explanation`)은 실제 스키마와 일치.
