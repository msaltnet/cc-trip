# 문화·에티켓 콘텐츠 확장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `data/culture.json`을 12개 주제별 챕터로 확장한다. 각 챕터는 이야기·유래 중심 본문(섹션 4~6개)과 퀴즈 2~3세트(세트당 10문제)로 구성한다.

**Architecture:** 기존 `sections` + `sets` JSON 포맷을 그대로 사용한다. 코드/렌더러 변경 없음. `js/chapter.js`가 `dialogues` 없을 때 `sections`를 `<h3>heading</h3><p>body</p>`로 렌더링하므로, 하나의 이야기를 여러 제목별 섹션으로 나눠 서술한다.

**Tech Stack:** 순수 JSON. 검증은 `node -e` 일회성 스크립트.

---

## File Structure

- Modify: `data/culture.json` — 12챕터 전면 재작성 (유일한 산출 파일)
- Modify: `data/categories.json:` — `culture` 항목 `summary` 갱신 (Task 8)
- 새 파일/스크립트 없음.

## 콘텐츠 작성 규칙 (모든 챕터 공통)

- 챕터 객체: `{ "id": "chNN", "title", "summary", "sections": [...], "sets": [...] }`
- `sections[]` = `{ "heading", "body" }`. 챕터당 4~6개. body는 1~3문장 이야기형 서술(이스케이프된 단일 문단, 줄바꿈/마크업 불가).
- `sets[]` = `{ "id": "setNN", "questions": [10개] }`. 챕터당 2~3세트.
- 문항: `multiple_choice`(options 4개, answerIndex 0-base) 또는 `ox`(options 없음, answerIndex 0=O/참, 1=X/거짓).
- 문항 `id`: `culture_chNN_setNN_NNN`.
- 모든 문항 `explanation` 필수. 퀴즈는 본문의 유래·상황·행동지침을 묻는다(회화 표현 암기 아님).
- 사실 정확성: 나라별 차이 큰 항목은 "대체로/나라에 따라"로 일반화.

## 검증 명령 (재사용)

각 Task의 검증 단계에서 아래 명령을 실행한다. JSON 파싱 + 세트 10문제 + answerIndex 범위 + ox 규칙을 점검한다.

```bash
node -e '
const d=require("./data/culture.json");
let err=0;
const seen=new Set();
for(const ch of d.chapters){
  if(!ch.id||!ch.title) {console.error("chapter missing id/title",ch.id);err++;}
  for(const s of (ch.sections||[])){ if(!s.heading||!s.body){console.error("bad section in",ch.id);err++;} }
  for(const set of (ch.sets||[])){
    if(!Array.isArray(set.questions)||set.questions.length!==10){console.error("set!=10 q",ch.id,set.id,(set.questions||[]).length);err++;}
    for(const q of set.questions){
      if(seen.has(q.id)){console.error("dup id",q.id);err++;} seen.add(q.id);
      if(!q.explanation){console.error("no explanation",q.id);err++;}
      if(q.type==="multiple_choice"){
        if(!Array.isArray(q.options)||q.options.length<2){console.error("bad options",q.id);err++;}
        else if(q.answerIndex<0||q.answerIndex>=q.options.length){console.error("answerIndex OOR",q.id);err++;}
      } else if(q.type==="ox"){
        if(q.options){console.error("ox has options",q.id);err++;}
        if(q.answerIndex!==0&&q.answerIndex!==1){console.error("ox answerIndex !=0/1",q.id);err++;}
      } else {console.error("unknown type",q.id,q.type);err++;}
    }
  }
}
console.log(err?("FAIL "+err+" errors"):("OK chapters="+d.chapters.length));
process.exit(err?1:0);
'
```

Expected (성공 시): `OK chapters=N`

---

## Task 1: 파일 골격 + ch01·ch02 (팁 / 식사 문화)

기존 ch01(팁과 식사 예절)을 두 챕터로 재구성한다. `data/culture.json`을 새 구조로 다시 쓰되 최상위는 `{ "id": "culture", "title": "문화·에티켓", "chapters": [...] }`.

**Files:**
- Modify: `data/culture.json`

**ch01 — 팁 문화의 유래와 나라별 차이** (`summary`: "봉사료의 역사, 나라별 팁 관습")
- sections (5):
  1. "팁은 어디서 왔나" — 18세기 영국 술집/하인에게 주던 작은 사례에서 유래, 'To Insure Promptness'라는 속설 소개(어원은 불확실하다고 명시).
  2. "미국과 유럽은 다르다" — 미국은 종업원 임금이 팁 의존이라 15~20% 사실상 의무, 유럽은 정규 임금 체계라 강제성 약함.
  3. "봉사료(service charge)가 포함될 때" — 계산서에 'service included/coperto/servizio'가 있으면 추가 팁 불필요. 영수증 확인 습관.
  4. "그래도 남긴다면" — 만족 시 5~10% 또는 잔돈 반올림(round up). 현금으로 두는 게 확실.
  5. "나라별 감각" — 프랑스/이탈리아는 포함된 경우 많음, 동유럽은 5~10% 기대, 카페 에스프레소엔 동전 정도.
- sets: **3세트** (기존 ch01의 팁 관련 문항 재활용·재구성 가능).

**ch02 — 식탁 위의 규칙: 유럽 식사 문화** (`summary`: "느린 식사, 물·빵 관습, 계산 방식")
- sections (5):
  1. "식사는 느리게 즐기는 것" — 유럽 식당은 회전율보다 여유 중시, 종업원이 재촉 안 함이 무례가 아니라 배려.
  2. "물도 주문한다" — 공짜로 안 나오는 경우 많음. tap water(수돗물) 요청 가능하나 거절하는 나라도. 보통 still/sparkling 병물 유료.
  3. "빵과 자릿세(coperto)" — 이탈리아 등은 빵·자리값 'coperto'를 1인당 청구, 바가지가 아니라 관습.
  4. "계산은 테이블에서" — 계산대로 가지 않고 종업원을 불러 'Check, please.' 카드 단말기를 가져다 줌.
  5. "자리 안내를 기다린다" — 입구에서 'Table for two?' 안내 받기. 빈자리 무단 착석은 실례.
- sets: **2세트**.

**Steps:**

- [ ] **Step 1:** `data/culture.json`을 새 구조로 작성: 최상위 객체 + `chapters` 배열에 ch01, ch02 두 챕터를 위 브리프대로 채운다. 문항은 규칙 준수(10/세트, id 규칙, explanation).
- [ ] **Step 2:** 검증 명령 실행. Expected: `OK chapters=2`.
- [ ] **Step 3:** 커밋.

```bash
git add data/culture.json
git commit -m "Culture: restructure into themed chapters (ch01 tipping, ch02 dining)"
```

---

## Task 2: ch03·ch04 (인사 / 공공장소 매너)

**Files:** Modify: `data/culture.json`

**ch03 — "Bonjour"의 힘: 인사와 호칭** (`summary`: "가게 인사, 격식 호칭, 뺨인사")
- sections (5):
  1. "가게에 들어서면 인사부터" — 프랑스 등에서 'Bonjour' 없이 용건부터 말하면 무례하게 느껴짐. 점원·기사·직원에게 먼저 인사.
  2. "헤어질 때도 인사" — 'Au revoir / Merci, bonne journée'. 작은 인사가 관계의 기본.
  3. "격식의 너/당신" — 프랑스 vous, 독일 Sie 처럼 처음 보는 사람·연장자에겐 격식형. 함부로 반말체 금지.
  4. "뺨인사(la bise)" — 친한 사이 볼을 맞대는 인사. 지역마다 횟수 다름(2~4회). 처음 만난 비즈니스에선 악수.
  5. "현지어 한마디의 힘" — Bonjour/Grazie/Danke 같은 인사·감사는 호감을 크게 높임.
- sets: **2세트**.

**ch04 — 줄서기와 공공장소 매너** (`summary`: "정숙한 대중교통, 줄서기, 에스컬레이터")
- sections (5):
  1. "대중교통은 조용히" — 통화·스피커폰·큰 대화 자제. 전화는 짧게, 음악은 이어폰.
  2. "에스컬레이터는 한 줄로" — 런던 등 '서는 사람은 오른쪽, 걷는 사람은 왼쪽'. 가족이 나란히 막지 않기.
  3. "줄서기 문화" — 영국은 'queue' 문화가 강함. 새치기는 큰 결례. 번호표(deli/약국) 뽑는 곳도.
  4. "문 잡아주기·양보" — 뒷사람 위해 문 잡기, 노약자·임산부 자리 양보가 자연스러운 매너.
  5. "공공장소 음식·신발" — 좌석에 발 올리기, 강한 냄새 음식 자제 등 소소한 배려.
- sets: **2세트**.

**Steps:**
- [ ] **Step 1:** ch03, ch04를 `chapters` 배열에 추가.
- [ ] **Step 2:** 검증 명령 실행. Expected: `OK chapters=4`.
- [ ] **Step 3:** 커밋.

```bash
git add data/culture.json
git commit -m "Culture: add ch03 greetings, ch04 public manners"
```

---

## Task 3: ch05·ch06 (종교시설 / 대중교통 신뢰 시스템)

**Files:** Modify: `data/culture.json`

**ch05 — 종교시설 방문 예절** (`summary`: "드레스코드 유래, 정숙·촬영 규범")
- sections (5):
  1. "왜 어깨와 무릎인가" — 성당·교회·모스크는 예배 공간. 노출을 삼가는 단정한 복장은 신성함에 대한 존중의 표현.
  2. "들어가기 전 준비" — 얇은 스카프/숄로 어깨 가리기. 모스크는 신발 벗고 여성 머리 가리기도.
  3. "정숙과 미사 중 방문" — 예배·미사 중에는 관람 자제, 큰 소리·전화 금지.
  4. "촬영 규범" — 플래시·삼각대 금지 많음, 일부는 촬영 전면 금지. 헌금함·촛불 영역 존중.
  5. "모자·자세" — 남성은 성당에서 모자 벗기. 제단 쪽으로 등돌린 셀카 등 무례한 포즈 자제.
- sets: **2세트**.

**ch06 — 대중교통의 신뢰 시스템** (`summary`: "펀칭(validate) 문화, 무임승차 벌금")
- sections (5):
  1. "개찰구가 없다?" — 많은 유럽 도시 트램·버스·기차는 개찰구 없이 신뢰제(honor system)로 운영.
  2. "표는 직접 펀칭(validate)" — 승차 전/직후 노란 기계에 표를 찍어 '사용 개시' 표시. 안 찍으면 미사용표=무임승차로 간주.
  3. "검표원과 벌금" — 사복 검표원이 불시 단속, 유효표 없으면 즉석 고액 벌금(수십~수백 유로).
  4. "기간권·교통카드" — 1일권·존(zone)제 이해, 도시마다 규칙 다름. 탑승 전 확인.
  5. "기차의 좌석·예약" — 고속열차는 좌석 예약 필요, 지역열차는 자유석. 1·2등석 구분 주의.
- sets: **2세트**.

**Steps:**
- [ ] **Step 1:** ch05, ch06 추가.
- [ ] **Step 2:** 검증 명령. Expected: `OK chapters=6`.
- [ ] **Step 3:** 커밋.

```bash
git add data/culture.json
git commit -m "Culture: add ch05 religious sites, ch06 transit honor system"
```

---

## Task 4: ch07·ch08 (쇼핑 / 사진·프라이버시)

**Files:** Modify: `data/culture.json`

**ch07 — 상점·쇼핑 문화** (`summary`: "과일 만지기 금지, 일요일 휴무, 점원 인사")
- sections (5):
  1. "과일·채소는 눈으로" — 마트에서 손으로 만지지 말고 제공된 비닐장갑/집게 사용. 직접 담고 저울에 무게·바코드 찍는 곳도.
  2. "일요일엔 닫는다" — 독일 등은 법으로 일요일 상점 휴무. 영업시간이 짧고 점심휴무 있는 가게도.
  3. "들어가며 인사, 도움 요청은 호출" — 작은 가게는 인사하고 입장. 점원이 다가올 때까지 자유롭게 구경.
  4. "흥정은 보통 없다" — 정찰제가 기본. 벼룩시장·일부 시장 빼고 가격 흥정 안 함.
  5. "장바구니·봉투 유료" — 에코백 지참 문화. 비닐봉투 유료, 짐은 직접 담음.
- sets: **2세트**.

**ch08 — 사진과 프라이버시** (`summary`: "초상권·GDPR, 사람·아이 촬영, 박물관 플래시")
- sections (5):
  1. "사람을 함부로 찍지 않는다" — 유럽은 초상권·프라이버시 의식 강함(GDPR 배경). 모르는 사람, 특히 아이 클로즈업 금물.
  2. "허락을 구하는 습관" — 인물 사진은 'May I take a photo?' 동의 먼저. 거리공연자는 팁 기대하기도.
  3. "박물관 플래시 금지의 이유" — 강한 빛이 안료·유물을 손상. 플래시·삼각대·셀카봉 금지 흔함.
  4. "촬영 금지 구역" — 군사시설·일부 정부청사·공연장 촬영 금지. 표지·직원 안내 따르기.
  5. "SNS 업로드 주의" — 타인이 식별되는 사진 공개 시 동의 고려. 아이 사진은 더 신중히.
- sets: **2세트**.

**Steps:**
- [ ] **Step 1:** ch07, ch08 추가.
- [ ] **Step 2:** 검증 명령. Expected: `OK chapters=8`.
- [ ] **Step 3:** 커밋.

```bash
git add data/culture.json
git commit -m "Culture: add ch07 shopping, ch08 photos & privacy"
```

---

## Task 5: ch09·ch10 (시간·여유 / 아이 동반)

**Files:** Modify: `data/culture.json`

**ch09 — 시간·여유의 문화** (`summary`: "늦은 저녁, 시에스타, 느린 서비스")
- sections (5):
  1. "저녁은 늦게" — 스페인·이탈리아는 저녁 8~10시 식사가 흔함. 이른 저녁엔 주방이 닫혀 있기도.
  2. "시에스타와 점심 휴무" — 남유럽은 오후에 상점·관공서가 잠시 닫음. 일정 짤 때 고려.
  3. "느린 서비스 ≠ 무례" — 음식·계산이 천천히 나오는 건 손님을 재촉 않으려는 문화. 손들어 정중히 부르면 됨.
  4. "약속과 시간 감각" — 북유럽은 정시 중시, 남유럽은 다소 느슨. 교통·예약은 여유 있게.
  5. "휴가·공휴일" — 8월 휴가철엔 현지 가게가 통째로 쉬기도. 공휴일 운영시간 확인.
- sets: **2세트**.

**ch10 — 아이와 함께: 가족 동반 문화** (`summary`: "키즈 메뉴·환대, 아이 매너 기대치")
- sections (5):
  1. "아이 환영, 하지만 차분히" — 식당에서 아이는 환영받지만 뛰어다니기·고성은 자제 기대. 자리에 앉아 식사.
  2. "키즈 메뉴와 하이체어" — 'children's menu/high chair' 요청 가능. 없을 땐 나눠 먹기도.
  3. "가족 할인·패스" — 박물관·교통 가족권(family ticket), 연령별 무료/할인 흔함. 여권으로 나이 증명.
  4. "유모차와 대중교통" — 저상버스·엘리베이터 위치 확인. 혼잡 시 접기. 일부 역은 계단뿐.
  5. "기저귀·수유 공간" — 백화점·대형마트 'baby change' 표시. 공공 수유에 관대한 편이나 가림막은 개인 선택." 
- sets: **2세트**.

**Steps:**
- [ ] **Step 1:** ch09, ch10 추가.
- [ ] **Step 2:** 검증 명령. Expected: `OK chapters=10`.
- [ ] **Step 3:** 커밋.

```bash
git add data/culture.json
git commit -m "Culture: add ch09 time & pace, ch10 traveling with kids"
```

---

## Task 6: ch11·ch12 (화장실·생활 / 흥정·바가지)

**Files:** Modify: `data/culture.json`

**ch11 — 화장실과 생활 습관** (`summary`: "유료 화장실 유래, 수돗물, 조용한 시간")
- sections (5):
  1. "왜 화장실이 유료인가" — 청결 유지·관리 인력 비용 충당이 유래. 0.5~1유로 동전 필요, 동전 준비 습관.
  2. "공중화장실 찾기" — 카페·백화점·박물관 이용. 'WC/Toilette/Servizi' 표기. 식당은 손님용인 경우 많음.
  3. "수돗물은 마실 수 있나" — 서·북유럽 대부분 음용 가능. 식당에선 tap water 요청. 일부 지역은 병물 권장.
  4. "조용한 시간(quiet hours)" — 독일 등은 밤·일요일 'Ruhezeit'에 소음 자제(세탁기·청소기까지). 숙소 규칙 확인.
  5. "분리수거와 에너지" — 쓰레기 분리 엄격, 호텔 카드키로 전원 제어. 물·전기 절약 문화.
- sets: **2세트**.

**ch12 — 흥정·바가지·관광객 주의** (`summary`: "정찰제 문화, 관광지 바가지·소매치기")
- sections (5):
  1. "유럽은 정찰제" — 상점·식당은 표시가가 곧 지불가. 흥정은 벼룩시장·일부 시장에 한정.
  2. "관광지 바가지 수법" — 메뉴에 가격 없는 식당, 호객 식당, '무료' 팔찌·장미 강매, 가짜 청원 서명 후 돈 요구.
  3. "택시·환전 주의" — 미터기·정액요금 확인, 공항·관광지 환전소 수수료 바가지. DCC(원화결제) 거절.
  4. "소매치기 핫스폿" — 지하철·관광명소·계단에서 밀치기·소동으로 시선 끌기. 가방 앞으로, 지퍼 잠그기.
  5. "당했을 때" — 단호히 'No, thank you'. 위협 시 자리 피하기. 도난은 경찰 신고서(보험·재발급용) 받기.
- sets: **2세트**.

**Steps:**
- [ ] **Step 1:** ch11, ch12 추가.
- [ ] **Step 2:** 검증 명령. Expected: `OK chapters=12`.
- [ ] **Step 3:** 커밋.

```bash
git add data/culture.json
git commit -m "Culture: add ch11 toilets & daily life, ch12 scams & haggling"
```

---

## Task 7: 전체 검증 + 브라우저 점검

**Files:** 없음 (확인만)

- [ ] **Step 1:** 전체 검증 명령 실행. Expected: `OK chapters=12`.
- [ ] **Step 2:** 세트 수 점검 — 각 챕터 sets 길이 출력.

```bash
node -e 'const d=require("./data/culture.json"); for(const c of d.chapters) console.log(c.id, c.title, "sets="+c.sets.length, "sections="+c.sections.length);'
```

Expected: 12줄, ch01 sets=3, 나머지 sets=2, 모든 sections>=4.

- [ ] **Step 3:** 로컬 서버로 흐름 점검.

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000` → 문화·에티켓 → 임의 챕터 본문 표시 → 퀴즈 시작 → 결과까지 확인. (PIN은 `js/config.js` 참조)

---

## Task 8: categories.json summary 갱신 + README 점검

**Files:** Modify: `data/categories.json`

- [ ] **Step 1:** `culture` 항목 `summary`를 확장 내용에 맞게 갱신.

현재:
```json
"summary": "팁 문화, 인사, 식사 예절",
```
변경:
```json
"summary": "팁·식사 문화, 인사, 종교시설, 교통 매너, 안전",
```

- [ ] **Step 2:** 커밋.

```bash
git add data/categories.json
git commit -m "Culture: update category summary for expanded chapters"
```

---

## Self-Review (작성자 체크 완료)

- **Spec coverage:** 스펙 §3의 12챕터 전부 Task 1~6에 매핑됨. §4 작성 규칙은 공통 규칙 블록 + 검증 명령으로 강제. §5 산출물(culture.json, categories.json)은 Task 1~6, 8. §6 검증은 Task 7. §7 범위 밖(dialogues/스크립트 미사용)은 본문 어디에도 추가 안 함.
- **Placeholder scan:** "TBD/TODO/적절히" 없음. 각 챕터 섹션 헤딩과 사실 포인트를 구체 명시. 단, 개별 퀴즈 문항 텍스트는 실행 시 규칙에 따라 작성(콘텐츠 저작 특성상 plan이 곧 콘텐츠가 되는 중복 방지).
- **Type consistency:** 모든 챕터가 동일 스키마(`id/title/summary/sections/sets`) 사용. 검증 명령의 필드명이 `js/chapter.js`·`quiz.js`가 읽는 필드(heading/body/questions/type/options/answerIndex/explanation)와 일치.
