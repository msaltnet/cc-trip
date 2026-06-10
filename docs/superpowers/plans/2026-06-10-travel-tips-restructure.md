# 여행 상식 재구성 (7챕터 → 3챕터) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "여행 상식" 카테고리를 주제별 3챕터(각 5세트, 50문항)로 재구성하고, 본문을 보강해 모든 문제가 본문으로 풀리게 한다.

**Architecture:** 정적·데이터 주도 퀴즈 사이트. `data/travel-tips.json`을 3챕터 구조로 재작성한다. 기존 7챕터의 140문항은 **이전 버전(브랜치 `main`)에서 재활용**하고, 부족분만 신규 작성한다. 각 세트는 챕터 전체 주제를 섞는 "테마 통합 세트"다. 코드 변경 없음(카테고리/챕터 id 하드코딩 없음 — 확인됨).

**Tech Stack:** 순수 HTML/CSS/JS(빌드 없음). 검증은 Node JSON 파싱·구조 확인 + 답변 가능성 재감사 + 로컬 HTTP 서버 수동 점검.

---

## 중요: 기존 문항 재활용 출처

이 작업은 새 브랜치에서 진행하며, **이전 7챕터 버전은 `main` 브랜치에 그대로 있다.** 구현자는 재활용할 기존 문항을 다음으로 읽는다:
```bash
git show main:data/travel-tips.json
```
이전 챕터 매핑(소주제 → 기존 챕터):
- 짐 싸기 = main ch01 (20문항) / 데이터·eSIM = main ch02 (20) / 여행자보험 = main ch03 (20)
- 비행기·수하물 = main ch04 (20) / 숙소·환전 = main ch05 (20: **숙소 12 + 환전 8**) / 카드 결제 = main ch06 (20) / 택스리펀 = main ch07 (20)

main ch05의 환전 문항 8개: `set01_006, set01_007, set01_008, set01_010, set02_005, set02_006, set02_007, set02_009`. 나머지 12개는 숙소.

재활용 시 규칙: 기존 문항의 지문·보기·정답을 가져오되, 본 플랜의 보강된 본문과 어긋나면 손질한다. 문제 `id`는 **새 체계 `tt_chNN_setNN_NNN`로 전부 재부여**한다(새 챕터 ch01~ch03 기준).

## 콘텐츠 규칙 (공통 — README 발췌)

- 유형: `multiple_choice`(보기 4개 권장, 0-based `answerIndex`) 또는 `ox`(보기 없음, `answerIndex` 0=O/참, 1=X/거짓).
- 세트 = 정확히 10문항. 챕터당 **5세트**(set01~set05).
- **테마 통합**: 각 세트는 챕터의 모든 소주제를 섞는다(아래 각 Task에 세트당 소주제 배분 명시).
- 세트끼리 같은 사실을 다루되 지문·보기·순서를 다르게(동일 지문 복제 금지).
- 세트당 유형 비율: mc 약 7 + ox 약 3.
- 모든 문제에 비어있지 않은 한국어 `explanation`.
- 대상: 유럽 가족여행 준비 가족. 평이한 한국어.

## 파일 구조

- **Create:** `data/travel-tips.json` (새 3챕터 구조로 재작성 — 기존 파일을 덮어씀)
- **Modify:** `data/categories.json` (`travel-tips`의 `summary`만 갱신)
- 그 외 파일·코드 변경 없음.

## 챕터 / 본문 (sections) — 전문

아래 본문은 각 Task에서 **그대로 사용**한다. 본문은 해당 챕터 문제들의 정답 근거를 모두 담도록 보강돼 있다.

### ch01 출발 전 준비 (8 sections)
```json
"sections": [
  { "heading": "소매치기 방지 용품", "body": "가방에 스프링 줄(시큐리티 와이어)이나 다이얼 자물쇠를 달면 갑작스러운 소매치기를 막는 데 좋습니다. 여권과 비상금은 옷 안쪽에 착용하는 목걸이형 안전 지갑(여권 파우치)에 보관하면 안전합니다." },
  { "heading": "전원·충전", "body": "유럽 대부분은 C타입(둥근 2핀) 콘센트를 씁니다. 여러 나라를 다녀도 다양한 규격을 지원하는 멀티 어댑터 하나면 충분하고, USB 포트가 여러 개인 멀티 충전기를 쓰면 여러 기기를 동시에 충전할 수 있어 편리합니다." },
  { "heading": "상비약·신발", "body": "소화제·진통제·지사제·밴드·멀미약 같은 본인용 상비약(처방전 없이 살 수 있는 약)을 챙깁니다. 다른 사람이 처방받은 약을 대신 가져가는 것은 적절하지 않습니다. 유럽 여행은 걷는 양이 많으므로 새로 산 신발보다 미리 길들여 둔 편한 운동화가 필수입니다." },
  { "heading": "eSIM·유심·로밍 비교", "body": "현지 데이터를 쓰는 방법은 크게 세 가지입니다. eSIM은 QR코드로 즉시 개통돼 물리 카드 교체가 필요 없고, 데이터 유심은 카드를 끼워 쓰지만 기존 한국 번호로 오는 전화·문자는 못 받을 수 있습니다. 통신사 로밍은 가장 편하지만 보통 가장 비쌉니다. 단기 가족여행에는 eSIM이나 데이터 유심이 가성비가 좋습니다." },
  { "heading": "데이터 개통·설정", "body": "eSIM은 출발 전 구매해 QR을 등록해 두고 현지 도착 후 활성화합니다. 데이터를 쓰려면 휴대폰 설정에서 '데이터 로밍'을 켜야 합니다. 최신 폰은 기존 유심을 빼지 않고 eSIM을 함께 쓰는 듀얼 구성이 가능해, 한국 번호로 오는 문자를 받으면서 현지 데이터를 쓸 수 있습니다." },
  { "heading": "데이터 절약", "body": "숙소·카페의 와이파이를 적극 활용하고, 지도·번역 앱은 오프라인 데이터를 미리 내려받아 두세요. 백그라운드 앱 새로고침과 자동 업데이트를 꺼 두면 데이터 소모를 크게 줄일 수 있습니다." },
  { "heading": "여행자보험 보장 항목", "body": "여행자보험은 해외 의료비, 휴대품 도난·파손, 항공기 지연·수하물 분실, 타인에 대한 배상책임 등을 보장합니다. 가족 단위로 한 번에 가입할 수 있고, 보장 한도와 항목은 상품마다 다르므로 출발 전 확인합니다." },
  { "heading": "보험 사고 대처·청구", "body": "현지에서 아파 병원을 이용하면 진단서와 영수증을 꼭 챙기고, 물건을 도난당하면 현지 경찰서에서 도난 신고서(폴리스 리포트, police report)를 발급받아야 보상 청구가 가능합니다. 보험금은 보통 귀국 후 보험사에 청구하며, 진단서·영수증·경찰 신고서 등 원본을 보관하고 사진으로 미리 백업해 둡니다." }
]
```

### ch02 환전·결제·세금환급 (5 sections)
```json
"sections": [
  { "heading": "현금 환전 요령", "body": "공항 환전소는 환율이 나쁜 편이라 큰 금액을 바꾸기엔 손해입니다. 꼭 필요한 소액만 바꾸고, 현지 ATM에서 현지통화로 인출하는 편이 보통 유리합니다. 이때도 화면에 원화 환산(DCC)이 뜨면 거절하고 현지통화로 인출하세요." },
  { "heading": "DCC는 무조건 거절", "body": "현지 카드 단말기에서 'KRW(원화)'와 'EUR(현지통화)' 선택 창이 뜨면 반드시 EUR을 고르세요. KRW를 고르면 가게가 자체 환율을 적용하는 이중 환전 수수료(DCC)가 붙어 더 비싸게 청구됩니다." },
  { "heading": "트래블카드·현금 준비", "body": "트래블로그·트래블월렛 같은 선불 외화 카드를 미리 충전해두면 환전 수수료가 거의 없고, 분실 시 앱에서 즉시 정지할 수 있어 안전합니다. 다만 결제할 때마다 현금이 자동으로 환급되는 기능 같은 것은 없습니다. 대형 상점·백화점·체인점은 카드가 잘 되지만, 재래시장·공중화장실·일부 소규모 상점은 카드가 안 되거나 현금만 받으므로 소액 유로 지폐와 동전을 약간 준비하세요." },
  { "heading": "택스리펀이란", "body": "EU 비거주 여행자가 일정 금액 이상 물건을 사면 부가가치세(VAT) 일부를 돌려받을 수 있습니다. 환급을 받으려면 상점에서 'Tax Free' 서류(택스 프리 폼)를 받아 두어야 하며, 일반 영수증만으로는 환급이 어렵습니다." },
  { "heading": "택스리펀 절차", "body": "출국하는 공항에서 ① 세관(Customs) 도장 → ② 환급 창구(또는 키오스크)에서 환급, 순서로 처리합니다. 세관이 물건을 보여 달라고 할 수 있으니, 환급 대상 물건과 'Tax Free' 서류는 수하물로 부치지 말고 기내(손가방)에 챙겨 두는 것이 안전합니다." }
]
```

### ch03 비행기·수하물·숙소 (5 sections)
```json
"sections": [
  { "heading": "기내 액체 규정", "body": "기내(휴대) 수하물의 액체류는 한 용기당 100ml 이하여야 하고, 전체를 1리터 투명 지퍼백 1개에 담아야 합니다. 그보다 큰 액체(화장품·물 등)는 위탁 수하물에 넣습니다." },
  { "heading": "수하물 무게·개수", "body": "위탁 수하물의 무게·개수 제한은 항공사와 요금제마다 다릅니다. 저비용 항공(LCC)은 기내 수하물도 엄격하게 잰다는 점에 주의하세요. 한도를 넘으면 공항에서 비싼 추가요금을 냅니다. 출발 전 항공권의 수하물 규정을 확인합니다." },
  { "heading": "보조배터리·환승·도착", "body": "보조배터리와 리튬배터리는 위탁이 금지되어 반드시 기내에 휴대해야 하며, 용량 제한(보통 100Wh, 약 27,000mAh 이하)이 있으니 확인하세요. 환승이 있으면 연결 시간을 넉넉히 두고 위탁 수하물이 최종 목적지까지 자동 연결되는지 확인하며, 도착하면 수하물 수취대(baggage claim)에서 짐을 찾습니다." },
  { "heading": "숙소 체크인", "body": "호텔·에어비앤비 모두 체크인 가능 시간을 미리 확인하고, 체크인 시 여권을 제시합니다. 에어비앤비는 호스트와 미리 체크인 방법(직접 만남, 셀프 체크인, 키박스 비밀번호 등)을 조율해 두면 도착 후 헤매지 않습니다." },
  { "heading": "시티택스·보증금", "body": "유럽의 많은 도시는 1박당 시티택스(숙박세, city tax)를 숙소에서 현장 결제로 따로 받습니다. 호텔은 체크인 때 보증금(디포짓)을 카드로 임시 승인(홀드)할 수 있는데, 체크아웃 시 문제가 없으면 해제됩니다." }
]
```

---

### Task 1: travel-tips.json 재작성 + ch01 출발 전 준비

**Files:**
- Create/overwrite: `data/travel-tips.json`
- Source (read-only): `git show main:data/travel-tips.json`

- [ ] **Step 1: 새 파일 골격 + ch01**

`data/travel-tips.json`을 새로 쓴다(기존 내용 폐기). 골격:
```json
{
  "id": "travel-tips",
  "title": "여행 상식",
  "chapters": [ <ch01 객체> ]
}
```
ch01 객체: `id`="ch01", `title`="출발 전 준비", `summary`="짐 싸기, eSIM·로밍, 여행자보험", `sections`=위 "ch01 출발 전 준비 (8 sections)" 전문 그대로, `sets`=Step 2의 5세트.

- [ ] **Step 2: 5세트(set01~set05) 작성 — 테마 통합**

각 세트 10문항, **소주제 배분(세트당)**: 짐 싸기 3 + eSIM 4 + 여행자보험 3. (5세트 합계: 짐싸기 15, eSIM 20, 보험 15 = 50문항.)

문항 출처: `git show main:data/travel-tips.json`의 ch01(짐싸기 20)·ch02(eSIM 20)·ch03(보험 20)에서 재활용한다. eSIM은 20개 전부 활용, 짐싸기·보험은 각 20개 중 15개를 선별. 재활용한 문항을 5세트에 분산하되:
- 같은 세트 안에서 세 소주제가 섞이도록 배치.
- 각 문항 `id`를 `tt_ch01_setNN_NNN`으로 재부여.
- 본 플랜의 ch01 본문과 어긋나는 문항은 손질(특히 짐싸기 처방약 문항은 본문에 "타인 처방약 부적절"이 명시됐으니 그대로 사용 가능).
- 세트 간 동일 지문 복제 금지(원본에서 set01/set02로 나뉜 두 버전을 서로 다른 세트에 배치).

부족하면(예: 보험·짐싸기는 15개만 필요하므로 선별로 충분) 신규 작성 없이 선별만으로 50문항을 채울 수 있다. mc:ox 비율은 세트당 약 7:3 유지.

- [ ] **Step 3: 검증**

Run:
```bash
node -e "const d=require('./data/travel-tips.json'); const c=d.chapters.find(x=>x.id==='ch01'); console.log(c.title,'| sections',c.sections.length,'| sets',c.sets.length,'| q',c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('prefix ok:',ids.every(i=>i.startsWith('tt_ch01_')),'| unique',new Set(ids).size,'/',ids.length); console.log('types:',[...new Set(c.sets.flatMap(s=>s.questions.map(q=>q.type)))]); c.sets.flatMap(s=>s.questions).forEach(q=>{const o=q.type==='ox'?2:(q.options||[]).length; if(q.answerIndex==null||q.answerIndex<0||q.answerIndex>=o||!q.explanation||(q.type==='ox'&&q.options)) console.log('BAD',q.id)})"
```
Expected: `출발 전 준비 | sections 8 | sets 5 | q [ 10, 10, 10, 10, 10 ]`, `prefix ok: true | unique 50 / 50`, `types: [ 'multiple_choice', 'ox' ]`, NO BAD lines. Fix and re-run until clean.

- [ ] **Step 4: Commit**
```bash
git add data/travel-tips.json
git commit -m "Restructure travel-tips: ch01 출발 전 준비 (5 themed sets)"
```
(User's global rule: NO Co-Authored-By / Claude attribution trailer.)

- [ ] **Step 5: Self-review** — 세트마다 세 소주제가 섞였는가? 모든 정답이 ch01 본문으로 풀리는가? 세트 간 동일 지문 없는가? mc:ox ≈ 7:3? 유효 JSON?

---

### Task 2: ch02 환전·결제·세금환급 추가

**Files:**
- Modify: `data/travel-tips.json` (chapters에 ch02 추가)
- Source: `git show main:data/travel-tips.json`

- [ ] **Step 1: ch02 챕터 추가**

ch01 다음에 ch02 객체를 추가한다. `id`="ch02", `title`="환전·결제·세금환급", `summary`="현금 환전, 카드 결제, 택스리펀", `sections`=위 "ch02 (5 sections)" 전문, `sets`=Step 2의 5세트.

- [ ] **Step 2: 5세트 작성 — 테마 통합**

각 세트 10문항, **소주제 배분(세트당)**: 현금 환전 3 + 카드 결제 4 + 택스리펀 3. (5세트 합계: 환전 15, 카드 20, 택스리펀 15 = 50.)

문항 출처:
- 카드 결제: main ch06(20) 전부 활용.
- 택스리펀: main ch07(20) 중 15개 선별.
- 현금 환전: main ch05의 환전 8문항(`set01_006/007/008/010, set02_005/006/007/009`) 재활용 + **신규 ~7문항** 작성(현금 환전 주제 내에서: 공항 환전소 환율 나쁨/소액만, 현지 ATM 현지통화 인출 유리, ATM DCC 거절 등 ch02 본문 사실로).

손질 필수(본문 보강 반영):
- "대형 백화점이 카드가 잘 되는 곳" 류 문항: ch02 본문에 "대형 상점·백화점·체인점은 카드가 잘 됨"이 명시됐으니 그대로 사용 가능.
- "선불카드가 결제 시 자동 현금 환급" 오답: 본문에 "자동 환급 기능 없음"이 명시됐으니 그대로 사용 가능.
- "환급 대상 물건·서류를 손가방에 휴대" 문항: 본문에 명시됐으니 사용 가능.

규칙: 각 문항 `id`=`tt_ch02_setNN_NNN`. 세 소주제를 세트마다 섞기. 세트 간 동일 지문 금지. mc:ox ≈ 7:3.

신규 환전 문항 예시(참고용, 그대로 쓰지 말 것):
```json
{ "id": "tt_ch02_set01_001", "type": "multiple_choice", "question": "유럽 도착 후 필요한 현지 현금을 마련하는 방법으로 가장 유리한 편은?", "options": ["공항 환전소에서 큰 금액을 한 번에 환전", "현지 ATM에서 현지통화로 인출", "호텔 프런트에서 전액 환전", "면세점에서 원화로 환전"], "answerIndex": 1, "explanation": "공항 환전소는 환율이 나쁜 편이라, 소액만 바꾸고 현지 ATM에서 현지통화로 인출하는 편이 보통 유리합니다." }
```

- [ ] **Step 3: 검증**
```bash
node -e "const d=require('./data/travel-tips.json'); console.log('order:',d.chapters.map(c=>c.id)); const c=d.chapters.find(x=>x.id==='ch02'); console.log(c.title,'| sections',c.sections.length,'| sets',c.sets.length,'| q',c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('prefix ok:',ids.every(i=>i.startsWith('tt_ch02_')),'| unique',new Set(ids).size,'/',ids.length); console.log('types:',[...new Set(c.sets.flatMap(s=>s.questions.map(q=>q.type)))]); c.sets.flatMap(s=>s.questions).forEach(q=>{const o=q.type==='ox'?2:(q.options||[]).length; if(q.answerIndex==null||q.answerIndex<0||q.answerIndex>=o||!q.explanation||(q.type==='ox'&&q.options)) console.log('BAD',q.id)})"
```
Expected: `order: [ 'ch01', 'ch02' ]`, `환전·결제·세금환급 | sections 5 | sets 5 | q [ 10, 10, 10, 10, 10 ]`, `prefix ok: true | unique 50 / 50`, `types: [ 'multiple_choice', 'ox' ]`, NO BAD lines.

- [ ] **Step 4: Commit**
```bash
git add data/travel-tips.json
git commit -m "Restructure travel-tips: ch02 환전·결제·세금환급 (5 themed sets)"
```
(NO attribution trailer.)

- [ ] **Step 5: Self-review** — 모든 정답이 ch02 본문으로 풀리는가(특히 백화점/자동환급/손가방 손질 반영)? 세트마다 세 소주제 섞임? 신규 환전 문항 정답 정확? 세트 간 비중복? ch01 무변경?

---

### Task 3: ch03 비행기·수하물·숙소 추가

**Files:**
- Modify: `data/travel-tips.json` (chapters에 ch03 추가)
- Source: `git show main:data/travel-tips.json`

- [ ] **Step 1: ch03 챕터 추가**

ch02 다음에 ch03 객체를 추가한다. `id`="ch03", `title`="비행기·수하물·숙소", `summary`="수하물 규정, 숙소 체크인", `sections`=위 "ch03 (5 sections)" 전문, `sets`=Step 2의 5세트.

- [ ] **Step 2: 5세트 작성 — 테마 통합**

각 세트 10문항, **소주제 배분(세트당)**: 비행기·수하물 5 + 숙소 5. (5세트 합계: 수하물 25, 숙소 25 = 50.)

문항 출처:
- 비행기·수하물: main ch04(20) 전부 활용 + **신규 ~5문항**(본문 사실 내에서: 100ml/1L 지퍼백, LCC 추가요금, 보조배터리 100Wh 기내 휴대, 환승 자동연결, baggage claim 등).
- 숙소: main ch05의 숙소 12문항(`set01_001/002/003/004/005/009, set02_001/002/003/004/008/010`) 재활용 + **신규 ~13문항**(본문 사실 내에서: 체크인 시간 확인·여권, 에어비앤비 호스트 사전 조율·키박스, 시티택스 현장 부과, 보증금 카드 홀드·체크아웃 해제 등).

손질: ch05 숙소 문항 중 "키박스가 가장 많이 쓰임" 류 단정 표현은 "셀프 체크인 방법의 하나"로 완화(본문과 일치).

규칙: 각 문항 `id`=`tt_ch03_setNN_NNN`. 두 소주제를 세트마다 5:5로 섞기. 세트 간 동일 지문 금지. mc:ox ≈ 7:3.

신규 숙소 문항 예시(참고용):
```json
{ "id": "tt_ch03_set01_006", "type": "ox", "question": "유럽의 많은 도시는 숙박비와 별도로 1박당 시티택스(숙박세)를 숙소에서 현장 결제로 받는다.", "answerIndex": 0, "explanation": "여러 유럽 도시는 1박당 시티택스를 숙소 현장에서 별도로 부과합니다." }
```

- [ ] **Step 3: 검증**
```bash
node -e "const d=require('./data/travel-tips.json'); console.log('order:',d.chapters.map(c=>c.id)); const c=d.chapters.find(x=>x.id==='ch03'); console.log(c.title,'| sections',c.sections.length,'| sets',c.sets.length,'| q',c.sets.map(s=>s.questions.length)); const ids=c.sets.flatMap(s=>s.questions.map(q=>q.id)); console.log('prefix ok:',ids.every(i=>i.startsWith('tt_ch03_')),'| unique',new Set(ids).size,'/',ids.length); console.log('types:',[...new Set(c.sets.flatMap(s=>s.questions.map(q=>q.type)))]); c.sets.flatMap(s=>s.questions).forEach(q=>{const o=q.type==='ox'?2:(q.options||[]).length; if(q.answerIndex==null||q.answerIndex<0||q.answerIndex>=o||!q.explanation||(q.type==='ox'&&q.options)) console.log('BAD',q.id)})"
```
Expected: `order: [ 'ch01', 'ch02', 'ch03' ]`, `비행기·수하물·숙소 | sections 5 | sets 5 | q [ 10, 10, 10, 10, 10 ]`, `prefix ok: true | unique 50 / 50`, `types: [ 'multiple_choice', 'ox' ]`, NO BAD lines.

- [ ] **Step 4: Commit**
```bash
git add data/travel-tips.json
git commit -m "Restructure travel-tips: ch03 비행기·수하물·숙소 (5 themed sets)"
```
(NO attribution trailer.)

- [ ] **Step 5: Self-review** — 세트마다 수하물·숙소 5:5 섞임? 신규 문항 정답 정확? 모든 정답이 ch03 본문으로 풀림? 세트 간 비중복? ch01·ch02 무변경?

---

### Task 4: categories.json 갱신 + 통합 검증 + 답변 가능성 재감사

**Files:**
- Modify: `data/categories.json`

- [ ] **Step 1: categories.json summary 갱신**

`travel-tips` 항목의 `summary`만 바꾼다(다른 필드·다른 카테고리 불변):
```json
"summary": "출발 준비, 환전·결제, 수하물·숙소"
```

- [ ] **Step 2: 전체 구조 + 무결성 검증**
```bash
node -e "const d=require('./data/travel-tips.json'); console.log('chapters:',d.chapters.map(c=>c.id+':'+c.title).join(' | ')); const all=d.chapters.flatMap(c=>c.sets.flatMap(s=>s.questions.map(q=>q.id))); console.log('total q:',all.length,'unique:',new Set(all).size,'all tt_:',all.every(i=>i.startsWith('tt_'))); d.chapters.forEach(c=>console.log(c.id,'sets',c.sets.length,'q',c.sets.map(s=>s.questions.length).join(',')))"
node -e "const cats=require('./data/categories.json'); let ok=true,tot=0; for(const c of cats){const d=require('./data/'+c.file); for(const ch of d.chapters)for(const s of (ch.sets||[]))for(const q of s.questions){tot++; const o=q.type==='ox'?2:(q.options||[]).length; if(q.answerIndex==null||q.answerIndex<0||q.answerIndex>=o||!q.explanation||(q.type==='ox'&&q.options)){console.log('BAD',c.id,q.id);ok=false;}}} console.log('site-wide checked',tot,'valid',ok)"
```
Expected: 3 chapters ch01/ch02/ch03, total q 150 unique 150 all tt_ true, each `sets 5 q 10,10,10,10,10`; site-wide valid true, no BAD lines.

- [ ] **Step 3: 답변 가능성 재감사 (서브에이전트 위임 — 컨트롤러가 수행)**

이 단계는 컨트롤러가 별도 검토 서브에이전트로 수행한다(구현자 아님). 각 챕터 본문 대비 모든 문제의 정답 근거가 본문에 있는지 확인하고, 하드 갭이 1건이라도 있으면 해당 문항 또는 본문을 수정한 뒤 재검증한다. 특히 설계에서 해소하기로 한 갭(처방약, 백화점 카드, 자동 현금 환급, 손가방 휴대, 키박스 단정)이 모두 해소됐는지 확인.

- [ ] **Step 4: 로컬 서버 수동 점검**
```bash
python -m http.server 8000
```
브라우저 `http://localhost:8000`: 메인에 "여행 상식"(🧳) → 챕터 3개(출발 전 준비 / 환전·결제·세금환급 / 비행기·수하물·숙소) → 각 챕터 본문 + 퀴즈 시작 → 10문항 → 결과·해설 정상. 각 챕터 1회씩 풀어 정답·해설 일치 확인. 확인 후 `Ctrl+C`.

- [ ] **Step 5: Commit**
```bash
git add data/categories.json
git commit -m "Restructure travel-tips: update category summary"
```
(NO attribution trailer.)

---

## Self-Review (작성자 체크 결과)

- **Spec 커버리지:** 3챕터 통합(Task 1~3), 챕터당 5세트(각 Task Step 2 + 검증), 테마 통합 배분(각 Task에 소주제 배분 명시), 본문 보강 전문(플랜 상단), 갭 해소(Task 2/3 손질 + Task 4 Step 3 재감사), categories summary(Task 4), 검증·수동점검(Task 4) — 스펙 전 항목 대응.
- **Placeholder 스캔:** 본문 8+5+5 섹션 전문 포함. 문항은 "재활용 출처 + 소주제 배분 + 손질 규칙 + 형식 예시"로 구체화(문항 작성/재배치가 구현 작업). "적절히" 류 모호 지시 없음.
- **타입 일관성:** 문제 `id`=`tt_chNN_setNN_NNN`, 챕터 id ch01~ch03, 카테고리 id `travel-tips`, 검증 스크립트 필드명(`chapters/sets/questions/answerIndex/options/type/explanation`) 실제 스키마와 일치. 소주제 배분 합계(50/챕터)와 세트 구조(5×10) 일관.
