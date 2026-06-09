# 생존 영어 회화 40챕터 재구성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `data/survival-english.json`을 여행 시간순 40챕터로 재구성하고, 모든 챕터를 ch01의 대화 중심 포맷(dialogues+keyExpressions+sets)으로 통일한다.

**Architecture:** 1MB 규모가 될 단일 JSON을 안전하게 다루기 위해 챕터를 `scripts/chapters/chNN.json` 조각 파일 40개로 분리 관리하고, `scripts/build-survival-english.mjs`가 이를 합쳐 `data/survival-english.json`을 생성한다. 검증 규칙을 `scripts/lib/validate-rules.mjs`로 추출해 전체 파일 검증기와 단일 챕터 검증기가 공유하며, 단일 챕터 검증기가 각 챕터 작성 태스크의 TDD 게이트가 된다. 사이트 런타임 코드(js/css/html)는 변경하지 않는다.

**Tech Stack:** Node.js(ESM, v24) 개발 스크립트, 순수 JSON 콘텐츠. 사이트는 의존성 0.

**선행 스펙:** `docs/superpowers/specs/2026-06-09-survival-english-restructure-design.md`

---

## 검증 계약 (모든 챕터가 만족해야 함 — 기존 validator 기준)

- 챕터 `id`는 `ch\d{2}`, 배열 내 오름차순.
- `title`, `summary` 필수.
- `dialogues`: **정확히 10개**. 각 대화: `id`(전역 고유), `title`, `lines`(2줄 이상; 각 `speaker`/`en`/`ko`), `keyExpressions`(1개 이상; 각 `en`/`ko` + `alternatives` 2개 이상, 각 `en`/`ko`).
- `sets`: 각 `set.id`, `questions` **10개 이상**. 문제 `id`는 전역 고유 + 접두사 `se_<chId>_<setId>_`. `question`/`answerIndex` 필수. `multiple_choice`는 `options` 정확히 4개·`answerIndex` 0~3. `ox`는 `options` 없음·`answerIndex` 0(O)/1(X). `explanation` 필수.

**품질 기준(검증기 밖, 작성 시 준수):** 대화는 4줄 내외, 화자는 `나`/상대(직원·승무원 등). keyExpressions는 대화당 3개. 세트는 최소 1개·문항 12~15개 권장(ch01=15). 문제는 해당 챕터 대화·표현에서 출제하고 한국어 해설에 혼동 포인트를 적는다.

---

## 신규→기존 콘텐츠 매핑 (재활용 출처)

| 신규 | 제목 | 기존 출처 | 작성 유형 |
|---|---|---|---|
| ch01 | 안 통할 때 버티기 | — | 신규 |
| ch02 | 정중한 부탁·감사·사과 | — | 신규 |
| ch03 | 숫자·가격·시간·날짜 알아듣기 | — | 신규 |
| ch04 | 체크인·수하물 | 기존 ch01(대화형) + ch02 | **ch01 대화 계승**+병합 |
| ch05 | 보안검색·출국심사 | 기존 ch03 | 변환 |
| ch06 | 탑승 게이트·기내 | 기존 ch04+ch05+ch06 | 병합·변환 |
| ch07 | 경유·환승 | 기존 ch07 | 변환 |
| ch08 | 입국심사·수하물·세관 | 기존 ch08+ch09 | 병합·변환 |
| ch09 | 공항에서 시내로 | 기존 ch10 | 변환 |
| ch10 | 호텔/에어비앤비 체크인 | 기존 ch11+ch13 | 병합·변환 |
| ch11 | 객실 시설·요청·트러블 | 기존 ch12 | 변환·확장 |
| ch12 | 체크아웃 | 기존 ch14 | 변환·확장 |
| ch13 | 통신: 유심/이심·데이터 | — | 신규 |
| ch14 | 길 묻기 | 기존 ch15 | 변환 |
| ch15 | 지하철·버스 | 기존 ch16 | 변환·확장 |
| ch16 | 기차 여행 | 기존 ch17 | 변환 |
| ch17 | 택시·라이드앱 | 기존 ch18 | 변환 |
| ch18 | 렌터카·주유·주차 | — | 신규 |
| ch19 | 식당 주문 | 기존 ch19 | 변환 |
| ch20 | 알레르기·식단제한·아이 메뉴 | — | 신규 |
| ch21 | 결제·팁·요청 | 기존 ch20 | 변환 |
| ch22 | 카페·패스트푸드·포장 | 기존 ch21 | 변환 |
| ch23 | 예약 전화·노쇼 확인 | — | 신규 |
| ch24 | 마트·장보기 | 기존 ch22 | 변환 |
| ch25 | 쇼핑·옷가게 | 기존 ch23 | 변환 |
| ch26 | 환불·교환·하자 항의 | — | 신규 |
| ch27 | 세탁 | — | 신규 |
| ch28 | 면세·택스리펀 | 기존 ch24 | 변환 |
| ch29 | 관광지·티켓 구매 | 기존 ch25 | 변환 |
| ch30 | 박물관·투어 | 기존 ch26 | 변환 |
| ch31 | 종교시설 드레스코드·매너 | — | 신규 |
| ch32 | 놀이공원·가족 액티비티 | — | 신규 |
| ch33 | 예약 확인·취소·환불(투어/공연) | — | 신규 |
| ch34 | 사진 부탁·스몰토크 | 기존 ch27 | 변환 |
| ch35 | 환전·ATM·카드·DCC | 기존 ch28 | 변환 |
| ch36 | 약국 OTC | 기존 ch29(약국 부분) | 변환·분리 |
| ch37 | 병원·진료 | 기존 ch29(병원 부분) | 변환·분리·확장 |
| ch38 | 미아·길 잃음 | — | 신규 |
| ch39 | 분실·도난 신고 | 기존 ch30 | 변환 |
| ch40 | 긴급 도움 요청 | — | 신규 |

---

## Task 1: 검증 규칙 모듈화 + 단일 챕터 검증기

**Files:**
- Create: `scripts/lib/validate-rules.mjs`
- Modify: `scripts/validate-survival-english.mjs`
- Create: `scripts/validate-chapter.mjs`

- [ ] **Step 1: 규칙 모듈 작성** — `scripts/validate-survival-english.mjs`의 챕터 1개 검사 로직을 그대로 함수로 옮긴다.

`scripts/lib/validate-rules.mjs`:
```js
// 단일 챕터 객체를 검사해 에러 문자열 배열을 반환. ids는 전역 중복 검사용 Set.
export function validateChapter(ch, ids = new Set(), prev = "") {
  const errors = [];
  if (!/^ch\d{2}$/.test(ch.id)) errors.push(`잘못된 챕터 id: ${ch.id}`);
  if (prev && ch.id <= prev) errors.push(`챕터 순서 오류: ${ch.id} (이전 ${prev})`);
  if (!ch.title || !ch.summary) errors.push(`${ch.id}: title/summary 누락`);

  const hasDialogues = Array.isArray(ch.dialogues) && ch.dialogues.length > 0;
  const hasSections = Array.isArray(ch.sections) && ch.sections.length > 0;
  if (!hasDialogues && !hasSections)
    errors.push(`${ch.id}: dialogues(또는 sections) 누락`);

  if (hasDialogues) {
    if (ch.dialogues.length !== 10)
      errors.push(`${ch.id}: 대화 ${ch.dialogues.length}개 (10개여야 함)`);
    for (const d of ch.dialogues) {
      if (!d.id) errors.push(`${ch.id}: dialogue.id 누락`);
      else if (ids.has(d.id)) errors.push(`중복 대화 id: ${d.id}`);
      else ids.add(d.id);
      if (!d.title) errors.push(`${d.id || ch.id}: dialogue.title 누락`);
      if (!Array.isArray(d.lines) || d.lines.length < 2)
        errors.push(`${d.id || ch.id}: lines 2줄 이상 필요`);
      for (const ln of d.lines || []) {
        if (!ln.speaker || !ln.en || !ln.ko)
          errors.push(`${d.id || ch.id}: line의 speaker/en/ko 누락`);
      }
      if (!Array.isArray(d.keyExpressions) || d.keyExpressions.length < 1)
        errors.push(`${d.id || ch.id}: keyExpressions 1개 이상 필요`);
      for (const ex of d.keyExpressions || []) {
        if (!ex.en || !ex.ko)
          errors.push(`${d.id || ch.id}: keyExpression의 en/ko 누락`);
        if (!Array.isArray(ex.alternatives) || ex.alternatives.length < 2)
          errors.push(`${d.id || ch.id}: "${ex.en}" 대체표현 2개 이상 필요`);
        for (const alt of ex.alternatives || []) {
          if (!alt.en || !alt.ko)
            errors.push(`${d.id || ch.id}: 대체표현의 en/ko 누락`);
        }
      }
    }
  }

  for (const set of ch.sets || []) {
    if (!set.id) errors.push(`${ch.id}: set.id 누락`);
    const qs = set.questions || [];
    if (qs.length < 10)
      errors.push(`${ch.id}/${set.id}: 문항 ${qs.length}개 (10개 이상이어야 함)`);
    for (const q of qs) {
      if (ids.has(q.id)) errors.push(`중복 문항 id: ${q.id}`);
      ids.add(q.id);
      const expectId = `se_${ch.id}_${set.id}_`;
      if (!q.id.startsWith(expectId))
        errors.push(`${q.id}: id 접두사가 ${expectId} 와 불일치`);
      if (!q.question) errors.push(`${q.id}: question 누락`);
      if (typeof q.answerIndex !== "number")
        errors.push(`${q.id}: answerIndex 누락`);
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
  return errors;
}
```

- [ ] **Step 2: 전체 파일 검증기를 모듈 사용하도록 리팩터** — `scripts/validate-survival-english.mjs` 본문 루프를 교체.

```js
// data/survival-english.json 구조 검증. 사이트 런타임과 무관한 개발용 도구.
import { readFileSync } from "node:fs";
import { validateChapter } from "./lib/validate-rules.mjs";

const path = "data/survival-english.json";
const data = JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const ids = new Set();

if (!Array.isArray(data.chapters)) errors.push("chapters가 배열이 아님");

let prev = "";
for (const ch of data.chapters || []) {
  errors.push(...validateChapter(ch, ids, prev));
  prev = ch.id;
}

console.log(`챕터 ${(data.chapters || []).length}개, 문항/대화 id ${ids.size}개 검사함`);
if (errors.length) {
  console.error(`\n검증 실패 (${errors.length}건):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("검증 통과 ✅");
```

- [ ] **Step 3: 단일 챕터 검증기 작성**

`scripts/validate-chapter.mjs`:
```js
// 단일 챕터 조각 파일을 검사. 사용: node scripts/validate-chapter.mjs scripts/chapters/ch04.json
import { readFileSync } from "node:fs";
import { validateChapter } from "./lib/validate-rules.mjs";

const file = process.argv[2];
if (!file) { console.error("사용: node scripts/validate-chapter.mjs <조각파일>"); process.exit(2); }
const ch = JSON.parse(readFileSync(file, "utf8"));
const errors = validateChapter(ch);
if (errors.length) {
  console.error(`검증 실패 (${errors.length}건):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`${ch.id} 검증 통과 ✅`);
```

- [ ] **Step 4: 기존 파일 회귀 확인**

Run: `node scripts/validate-survival-english.mjs`
Expected: `챕터 30개 ... 검증 통과 ✅` (리팩터 전과 동일하게 통과)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/validate-rules.mjs scripts/validate-survival-english.mjs scripts/validate-chapter.mjs
git commit -m "Refactor validator into shared rules; add single-chapter validator"
```

---

## Task 2: 조각 파일 분리 + 빌드 스크립트 (안전망)

현재 30챕터를 조각 파일로 추출하고 합치기 스크립트를 만들어, **빌드 결과가 현재 파일과 동일**함을 먼저 보장한다 (이후 변경의 안전망).

**Files:**
- Create: `scripts/chapters/_category.json`
- Create: `scripts/chapters/ch01.json` … (현재 30개, **기존 번호 그대로**)
- Create: `scripts/build-survival-english.mjs`
- Create: `scripts/split-survival-english.mjs` (1회용 추출기)

- [ ] **Step 1: 추출 스크립트 작성**

`scripts/split-survival-english.mjs`:
```js
// 1회용: 현재 data/survival-english.json을 조각 파일로 분리.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const data = JSON.parse(readFileSync("data/survival-english.json", "utf8"));
mkdirSync("scripts/chapters", { recursive: true });
const { chapters, ...category } = data;
writeFileSync("scripts/chapters/_category.json", JSON.stringify(category, null, 2) + "\n");
for (const ch of chapters) {
  writeFileSync(`scripts/chapters/${ch.id}.json`, JSON.stringify(ch, null, 2) + "\n");
}
console.log(`분리 완료: ${chapters.length}개 + _category.json`);
```

- [ ] **Step 2: 추출 실행**

Run: `node scripts/split-survival-english.mjs`
Expected: `분리 완료: 30개 + _category.json`, `scripts/chapters/ch01.json`~`ch30.json` 생성.

- [ ] **Step 3: 빌드 스크립트 작성**

`scripts/build-survival-english.mjs`:
```js
// 조각 파일을 합쳐 data/survival-english.json 생성.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const dir = "scripts/chapters";
const category = JSON.parse(readFileSync(`${dir}/_category.json`, "utf8"));
const files = readdirSync(dir)
  .filter((f) => /^ch\d{2}\.json$/.test(f))
  .sort();
const chapters = files.map((f) => JSON.parse(readFileSync(`${dir}/${f}`, "utf8")));
const out = { ...category, chapters };
writeFileSync("data/survival-english.json", JSON.stringify(out, null, 2) + "\n");
console.log(`빌드 완료: ${chapters.length}개 챕터`);
```

- [ ] **Step 4: 빌드가 현재 파일과 동일한지 확인** (안전망)

Run:
```bash
cp data/survival-english.json /tmp/se-before.json
node scripts/build-survival-english.mjs
node -e "const a=require('./data/survival-english.json'),b=require('/tmp/se-before.json');const A=JSON.stringify(a),B=JSON.stringify(b);console.log(A===B?'동일 ✅':'다름 ❌');if(A!==B)process.exit(1)"
node scripts/validate-survival-english.mjs
```
Expected: `빌드 완료: 30개 챕터` → `동일 ✅` → `검증 통과 ✅`. (들여쓰기 차이로 `다름`이 나오면 내용 JSON 동치만 확인되면 통과로 간주하고 진행.)

- [ ] **Step 5: Commit**

```bash
git add scripts/chapters scripts/build-survival-english.mjs scripts/split-survival-english.mjs
git commit -m "Split survival-english into per-chapter fragments + build script"
```

---

## Task 3: 새 번호 스켈레톤으로 재배치

매핑표대로 조각 파일을 새 번호로 옮기고, 신규 14챕터의 스텁을 만든다. 이 시점 이후 콘텐츠는 각 챕터 태스크에서 채운다.

**Files:**
- Rename/Modify: `scripts/chapters/chNN.json` 전체
- Create: 신규 14개 스텁

- [ ] **Step 1: 기존 조각을 임시 보관소로 이동**

Run: `mkdir -p scripts/chapters/_old && git mv scripts/chapters/ch??.json scripts/chapters/_old/`
(빌드 스크립트는 `_old/` 하위는 읽지 않음 — `readdirSync`는 비재귀.)

- [ ] **Step 2: 매핑표대로 새 번호 조각 생성** — 각 "변환/병합/계승" 챕터는 출처 조각의 콘텐츠를 새 파일로 복사하고 내부 `id`를 새 번호로 교체(문제 id 접두사 포함). 예: ch04는 `_old/ch01.json`(대화형) 기반 + `_old/ch02.json` 콘텐츠 병합. 신규 14개(ch01,02,03,13,18,20,23,26,27,31,32,33,38,40)는 다음 스텁으로 생성:

```json
{
  "id": "chNN",
  "title": "<매핑표 제목>",
  "summary": "<요약>",
  "dialogues": [],
  "sets": []
}
```

> 이 스텁은 검증기를 통과하지 못한다(대화 0개). 각 챕터 태스크 완료 시 통과하게 된다.

- [ ] **Step 3: 새 번호 id 중복·연속성 점검**

Run: `ls scripts/chapters/ch??.json | sort` → `ch01.json`~`ch40.json` 40개 확인.

- [ ] **Step 4: Commit**

```bash
git add -A scripts/chapters
git commit -m "Reorder fragments to new 40-chapter numbering; stub new chapters"
```

---

## 챕터 작성 절차 (Task 4~43 공통)

각 챕터 태스크는 아래 절차를 따른다. `chNN`과 콘텐츠 브리프만 다르다.

- [ ] **Step A: 조각 파일 작성** — `scripts/chapters/chNN.json`에 검증 계약을 만족하는 콘텐츠를 작성한다.
  - `dialogues` 정확히 10개. 각 대화: `id`(`chNN_dMM`), `title`(한국어), `lines` 4줄 내외(`speaker` `나`/상대, `en`, `ko`), `keyExpressions` 3개(각 `en`/`ko` 설명 + `alternatives` 2개).
  - `sets` 1개 이상: `set01`, `questions` 12~15개. 문제 `id` = `se_chNN_set01_001`…, `multiple_choice`(보기 4개) 또는 `ox` 혼합, `explanation`에 혼동 포인트.
  - 콘텐츠는 아래 챕터별 "대화 시나리오 10" 브리프를 충실히 반영한다.
- [ ] **Step B: 단일 챕터 검증**

Run: `node scripts/validate-chapter.mjs scripts/chapters/chNN.json`
Expected: `chNN 검증 통과 ✅`. 실패 시 메시지대로 수정 후 재실행.

- [ ] **Step C: 빌드 + 부분 확인**

Run: `node scripts/build-survival-english.mjs`
Expected: `빌드 완료: 40개 챕터`. (전체 검증은 미완 챕터 때문에 실패할 수 있음 — 정상.)

- [ ] **Step D: Commit**

```bash
git add scripts/chapters/chNN.json data/survival-english.json
git commit -m "Author chNN: <제목>"
```

---

## 챕터별 콘텐츠 브리프 (대화 시나리오 10 + 퀴즈 초점)

### Task 4 — ch01 안 통할 때 버티기 `신규`
대화 10: ①다시 말해달라(Sorry?) ②천천히 말해달라 ③영어 잘 못한다고 알리기 ④적어달라(write it down) ⑤스펠링 물어보기 ⑥손가락/숫자로 보여달라 ⑦통역앱 써도 되는지 ⑧"무슨 뜻이에요?"(What does ~ mean?) ⑨못 들었을 때 핵심만 되묻기 ⑩영어 하는 사람 찾기. 퀴즈: 되묻기 정중 표현 vs 무례 표현 구별, "천천히/다시" 동의어.

### Task 5 — ch02 정중한 부탁·감사·사과 `신규`
대화 10: ①Could you~ 부탁 ②Excuse me로 말 걸기 ③Thank you 응대(You're welcome) ④사과 Sorry/My apologies ⑤실례·통과(Excuse me, coming through) ⑥재촉 않고 기다려달라 ⑦거절 정중히(No, thank you) ⑧도움 제안 받기 ⑨양해 구하기(Do you mind if~) ⑩칭찬·감사 확장. 퀴즈: 정중도 차이, please 위치.

### Task 6 — ch03 숫자·가격·시간·날짜 알아듣기 `신규`
대화 10: ①가격 되묻기(How much again?) ②큰 숫자 듣기(€1,250) ③시간 약속(at half past three) ④날짜·요일 ⑤전화번호·방번호 듣기 ⑥수량(a dozen, half) ⑦거스름돈 확인 ⑧운영시간 듣기 ⑨소요시간(about 20 minutes) ⑩층수(ground floor 등). 퀴즈: 숫자 청취, ground floor=1층 혼동, half past/quarter to.

### Task 7 — ch04 체크인·수하물 `ch01 대화 계승+ch02 병합`
**기존 ch01(대화형) 10개 대화를 그대로 계승**하고 id를 `ch04_dMM`으로 변경, 문제 id를 `se_ch04_set01_*`로 변경. 기존 ch02(수하물 맡기기·좌석 요청·게이트 확인) 콘텐츠를 흡수해 필요한 대화를 교체/보강하되 총 10개 유지. 퀴즈: check in vs check out, baggage allowance, aisle/window.

### Task 7-note — ch01 레퍼런스 보존
ch04가 ch01 대화를 계승하므로, 원본 ch01은 스펙의 레퍼런스로 문서에 남는다(별도 파일 보존 불필요 — git 이력 + 스펙 §2.1). 작업 중 ch01 대화 텍스트를 변형하지 말 것.

### Task 8 — ch05 보안검색·출국심사 `변환`
출처 기존 ch03. 대화 10: ①액체 100ml 규정 ②노트북·전자기기 꺼내기 ③벨트·신발 벗기 ④몸수색 동의 ⑤가방 다시 검사 ⑥출국심사 여권 제출 ⑦체류 목적 ⑧면세 한도 ⑨탑승권 제시 ⑩보안 줄 안내. 퀴즈: liquids rule, take off/take out.

### Task 9 — ch06 탑승 게이트·기내 `병합·변환`
출처 ch04+ch05+ch06. 대화 10: ①탑승 방송 이해 ②게이트 변경 ③지연 안내 ④좌석 찾기 ⑤짐칸(overhead bin) ⑥기내식·음료 주문 ⑦담요·헤드폰 요청 ⑧앞좌석 등받이/좌석 조정 ⑨몸 불편·도움 ⑩화장실·착륙 안내. 퀴즈: boarding now/final call, fasten seatbelt.

### Task 10 — ch07 경유·환승 `변환`
출처 ch07. 대화 10: ①환승 데스크 찾기 ②연결편 게이트 ③수하물 자동 연결 여부 ④환승 시간 촉박 ⑤재보안검색 ⑥터미널 이동(셔틀) ⑦연결편 놓침 대처 ⑧라운지 위치 ⑨환승 비자 질문 ⑩탑승권 재발급. 퀴즈: connecting flight, layover, transfer.

### Task 11 — ch08 입국심사·수하물·세관 `병합·변환`
출처 ch08+ch09. 대화 10: ①여권·입국 목적 ②체류 기간 ③숙소 주소 ④왕복 항공권 ⑤수하물 수취대(carousel) 찾기 ⑥수하물 분실 신고 ⑦파손 신고 ⑧세관 신고할 것 없음(nothing to declare) ⑨반입 제한 품목 ⑩초과 물품 신고. 퀴즈: purpose of visit, nothing to declare, baggage claim.

### Task 12 — ch09 공항에서 시내로 `변환`
출처 ch10. 대화 10: ①공항버스 정류장 ②기차/공항철도 표 ③택시 승강장 ④요금 정액제 확인 ⑤목적지 주소 보여주기 ⑥소요시간 ⑦트렁크에 짐 ⑧시내 환승 ⑨우버/볼트 호출 ⑩막차 시간. 퀴즈: How do I get to ~, fixed fare, last train.

### Task 13 — ch10 호텔/에어비앤비 체크인 `병합·변환`
출처 ch11+ch13. 대화 10: ①예약 확인 ②여권 제출 ③조식 포함 여부 ④와이파이 비밀번호 ⑤체크아웃 시간 ⑥에어비앤비 셀프 체크인 ⑦도어코드/키박스 ⑧주차·층 안내 ⑨얼리 체크인 요청 ⑩짐 먼저 맡기기. 퀴즈: reservation under the name, check-out time, door code.

### Task 14 — ch11 객실 시설·요청·트러블 `변환·확장`
출처 ch12. 대화 10: ①수건 추가 ②청소 요청/거절(Do not disturb) ③냉난방 안 됨 ④온수 안 나옴 ⑤와이파이 끊김 ⑥소음 항의 ⑦룸서비스 ⑧모닝콜 ⑨미니바 문의 ⑩방 바꿔달라. 퀴즈: It's not working, too noisy, extra towels.

### Task 15 — ch12 체크아웃 `변환·확장`
출처 ch14. 대화 10: ①체크아웃 요청 ②영수증 요청 ③청구 항목 오류 정정 ④미니바 요금 이의 ⑤늦은 체크아웃 ⑥짐 보관 ⑦택시 불러달라 ⑧조식 추가요금 확인 ⑨보증금 환급 ⑩분실물 문의. 퀴즈: check out, There's a mistake on my bill, store my luggage.

### Task 16 — ch13 통신: 유심/이심·데이터 `신규`
대화 10: ①유심 어디서 사나 ②선불 유심 요청 ③데이터 용량 선택 ④이심(eSIM) QR ⑤기간/요금 ⑥설정 도와달라 ⑦테더링 가능 여부 ⑧여권 등록 필요 ⑨충전(top up) ⑩공용 와이파이 비번. 퀴즈: prepaid SIM, data plan, top up, eSIM.

### Task 17 — ch14 길 묻기 `변환`
출처 ch15. 대화 10: ①~로 가는 길 ②여기서 먼지 ③걸어갈 수 있는지 ④지도에서 위치 ⑤가장 가까운 역 ⑥좌/우/직진 ⑦길 건너편 ⑧몇 번째 모퉁이 ⑨길 잃음, 여기 어디 ⑩랜드마크 기준. 퀴즈: How do I get to, across from, turn left, blocks.

### Task 18 — ch15 지하철·버스 `변환·확장`
출처 ch16. 대화 10: ①티켓 발권기 사용 ②1일권/교통패스 ③노선·환승 ④이 버스 ~가나요 ⑤하차 정류장 ⑥다음 정류장 안내 ⑦태그/개찰 ⑧방향 확인(반대편) ⑨막차 ⑩벌금/검표. 퀴즈: day pass, Does this go to, transfer, validate ticket.

### Task 19 — ch16 기차 여행 `변환`
출처 ch17. 대화 10: ①표 구매·예약 ②플랫폼 확인 ③좌석/예약석 ④지정석 점유 분쟁 ⑤환승역 ⑥연착 안내 ⑦검표 ⑧식당칸 ⑨내릴 역 확인 ⑩짐 보관 선반. 퀴즈: platform, reserved seat, This is my seat, delayed.

### Task 20 — ch17 택시·라이드앱 `변환`
출처 ch18. 대화 10: ①목적지 전달 ②주소 보여주기 ③요금 미터 확인 ④예상 요금 ⑤트렁크 짐 ⑥경로 요청 ⑦여기서 세워주세요 ⑧카드 결제 ⑨영수증 ⑩앱 차량 확인(번호판). 퀴즈: Take me to, turn on the meter, Keep the change, receipt.

### Task 21 — ch18 렌터카·주유·주차 `신규`
대화 10: ①예약 픽업 ②보험 옵션 ③연료 정책(full to full) ④자동/수동 ⑤내비·아이카시트 ⑥주유소 셀프 ⑦경유/휘발유 확인 ⑧주차장 요금 ⑨주차 위반·견인 ⑩반납·손상 점검. 퀴즈: full to full, unleaded vs diesel, deposit, drop off.

### Task 22 — ch19 식당 주문 `변환`
출처 ch19. 대화 10: ①자리 있나요/몇 명 ②메뉴 주세요 ③추천 요청 ④주문하기 ⑤굽기 정도 ⑥음료 ⑦이거 빼주세요 ⑧추가 주문 ⑨물(tap water) ⑩잠시 후 주문. 퀴즈: a table for two, What do you recommend, I'll have, tap water.

### Task 23 — ch20 알레르기·식단제한·아이 메뉴 `신규`
대화 10: ①견과 알레르기 ②글루텐 프리 ③채식/비건 ④이 음식에 ~들어가나요 ⑤유당 ⑥아이 메뉴 ⑦하이체어 요청 ⑧덜 맵게 ⑨반 인분/나눠먹기 ⑩알레르기 응급 주의. 퀴즈: I'm allergic to, Does this contain, kids menu, high chair.

### Task 24 — ch21 결제·팁·요청 `변환`
출처 ch20. 대화 10: ①계산서 요청 ②팁 포함 여부 ③카드 결제 ④따로 계산(split) ⑤현금 결제·잔돈 ⑥영수증 ⑦금액 오류 ⑧추가 냅킨/물 ⑨포장해 가기 ⑩서비스 만족 인사. 퀴즈: Check please, Is service included, split the bill, to go.

### Task 25 — ch22 카페·패스트푸드·포장 `변환`
출처 ch21. 대화 10: ①여기/포장(for here or to go) ②사이즈 선택 ③커피 옵션 ④세트 메뉴 ⑤추가 토핑 ⑥얼음 빼기 ⑦이름 부르기(주문) ⑧빈자리 확인 ⑨와이파이/콘센트 ⑩영수증. 퀴즈: for here or to go, regular/large, no ice.

### Task 26 — ch23 예약 전화·노쇼 확인 `신규`
대화 10: ①식당 예약 전화 ②인원·시간 ③창가/야외석 요청 ④이름·연락처 ⑤예약 변경 ⑥예약 취소 ⑦노쇼 정책 ⑧예약 재확인 ⑨대기 명단 ⑩늦을 것 같다 연락. 퀴즈: I'd like to make a reservation, under the name, cancel/change.

### Task 27 — ch24 마트·장보기 `변환`
출처 ch22. 대화 10: ①상품 위치 ②가격 확인 ③무게 달기(produce scale) ④봉투 필요 ⑤셀프 계산대 ⑥바코드 안 찍힘 ⑦멤버십 묻기 ⑧유통기한 ⑨환불·교환 위치 ⑩현금/카드. 퀴즈: Where can I find, self-checkout, expiration date.

### Task 28 — ch25 쇼핑·옷가게 `변환`
출처 ch23. 대화 10: ①그냥 둘러봄(just looking) ②사이즈 문의 ③다른 색 ④탈의실 ⑤더 큰/작은 사이즈 ⑥가격·세일 ⑦선물 포장 ⑧재고 확인 ⑨카드/면세 ⑩교환·환불 정책. 퀴즈: I'm just looking, fitting room, Do you have this in, on sale.

### Task 29 — ch26 환불·교환·하자 항의 `신규`
대화 10: ①영수증 가져옴 ②사이즈 안 맞아 교환 ③하자 발견 환불 ④다른 색으로 교환 ⑤환불 방법(카드 원복) ⑥교환 기간 ⑦영수증 없음 ⑧가격표·태그 ⑨매니저 요청 ⑩정중한 항의. 퀴즈: I'd like a refund, exchange, It's defective, store credit.

### Task 30 — ch27 세탁 `신규`
대화 10: ①코인 세탁소 위치 ②세탁기 사용법 ③세제 구매 ④건조기 시간·동전 ⑤호텔 세탁 서비스 ⑥요금·기간 ⑦드라이클리닝 ⑧얼룩 제거 요청 ⑨분실/손상 ⑩완료 시각. 퀴즈: laundromat, detergent, dryer, laundry service.

### Task 31 — ch28 면세·택스리펀 `변환`
출처 ch24. 대화 10: ①택스리펀 되나요 ②최소 구매액 ③양식 작성 ④여권 제시 ⑤세관 도장 ⑥환급 창구 위치 ⑦현금/카드 환급 ⑧포장 미개봉 ⑨공항 마감시간 ⑩수수료. 퀴즈: tax refund, customs stamp, minimum purchase.

### Task 32 — ch29 관광지·티켓 구매 `변환`
출처 ch25. 대화 10: ①입장권 가격 ②가족권/할인 ③아동·학생 요금 ④사전 예약했어요 ⑤줄 어디서 ⑥운영시간 ⑦오디오가이드 포함 ⑧패스로 입장 ⑨재입장 가능 ⑩마지막 입장 시간. 퀴즈: family ticket, skip the line, last entry, audio guide.

### Task 33 — ch30 박물관·투어 `변환`
출처 ch26. 대화 10: ①사진 촬영 규칙 ②플래시 금지 ③가방/외투 보관 ④오디오가이드 대여 ⑤투어 집합 장소 ⑥소요 시간 ⑦가이드 언어 ⑧화장실/출구 ⑨기념품샵 ⑩지도·하이라이트. 퀴즈: Is photography allowed, no flash, cloakroom, meeting point.

### Task 34 — ch31 종교시설 드레스코드·매너 `신규`
대화 10: ①복장 규정(어깨/무릎 가리기) ②숄 대여/구매 ③모자 벗기 ④정숙 요청 ⑤사진 가능 여부 ⑥미사 중 입장 ⑦헌금/촛불 ⑧줄서기·보안 ⑨가이드 동반 ⑩성물 만지지 않기. 퀴즈: cover your shoulders, dress code, no photos during mass.

### Task 35 — ch32 놀이공원·가족 액티비티 `신규`
대화 10: ①입장권·패스 ②키 제한(height requirement) ③패스트패스/예약 ④유모차 대여 ⑤미아 보호소 ⑥줄 대기시간 ⑦사진 서비스 ⑧식당·간식 ⑨퍼레이드 시간 ⑩분실물. 퀴즈: height requirement, fast pass, stroller rental, lost child.

### Task 36 — ch33 예약 확인·취소·환불(투어/공연) `신규`
대화 10: ①예약 확인 ②바우처 제시 ③시간 변경 ④취소·환불 정책 ⑤날씨로 취소 ⑥환불 방법 ⑦노쇼 ⑧대체 일정 ⑨인원 변경 ⑩연락처 확인. 퀴즈: confirm my booking, voucher, reschedule, full refund.

### Task 37 — ch34 사진 부탁·스몰토크 `변환`
출처 ch27. 대화 10: ①사진 찍어주세요 ②버튼 설명 ③한 장 더 ④세로/가로 ⑤같이 찍을래요 ⑥출신지 묻기 ⑦첫 방문이세요? ⑧추천 명소 ⑨날씨 스몰토크 ⑩작별 인사. 퀴즈: Could you take a photo, one more, Where are you from.

### Task 38 — ch35 환전·ATM·카드·DCC `변환`
출처 ch28. 대화 10: ①환전소 위치 ②환율·수수료 ③소액권으로 ④ATM 위치 ⑤출금 한도 ⑥카드 결제 되나요 ⑦DCC 거절(현지통화로) ⑧카드 거절됨 ⑨분할 결제 ⑩잔돈. 퀴즈: exchange rate, withdraw, Pay in local currency, declined.

### Task 39 — ch36 약국 OTC `변환`
출처 ch29(약국 부분). 대화 10: ①가까운 약국 ②감기약 ③두통·진통제 ④복용법 ⑤어린이용 용량 ⑥처방 필요 여부 ⑦알레르기약 ⑧소화제/지사제 ⑨밴드·상처 ⑩영업시간. 퀴즈: pharmacy, over the counter, dosage, painkiller.

### Task 40 — ch37 병원·진료 `변환·분리·확장`
출처 ch29(병원 부분) 확장. 대화 10: ①접수·예약 ②증상 설명 ③언제부터 아픈지 ④통증 위치·정도 ⑤아이 환자 ⑥알레르기·기저질환 ⑦진료·검사 안내 ⑧처방전 ⑨진단서·보험 서류 ⑩비용·결제. 퀴즈: I have a fever, since yesterday, prescription, medical certificate.

### Task 41 — ch38 미아·길 잃음 `신규`
대화 10: ①아이가 안 보여요 ②인상착의 설명 ③마지막 본 장소 ④안내방송 요청 ⑤집합 장소 정하기 ⑥직원·경비에게 도움 ⑦아이에게 가르칠 말(I'm lost) ⑧연락처 적은 카드 ⑨발견 알림 ⑩감사. 퀴즈: My child is missing, He's wearing, lost, security.

### Task 42 — ch39 분실·도난 신고 `변환`
출처 ch30. 대화 10: ①지갑 도난 ②여권 분실 ③경찰서 위치 ④신고서 작성 ⑤도난 경위 ⑥대사관 연락 ⑦카드 정지 ⑧분실물센터 ⑨도난 증명서(보험용) ⑩재발급 안내. 퀴즈: My wallet was stolen, lost passport, police report, embassy.

### Task 43 — ch40 긴급 도움 요청 `신규`
대화 10: ①경찰 불러주세요 ②구급차 ③여기 다친 사람 있어요 ④불이야/대피 ⑤긴급번호(112) ⑥위치 알리기 ⑦도와주세요 ⑧주변에 영어 하는 사람 ⑨응급실 어디 ⑩진정시키기. 퀴즈: Call the police/ambulance, emergency, Help, This is an emergency.

---

## Task 44: 전체 통합 검증 + 정리 + 문서화

**Files:**
- Modify: `README.md` (콘텐츠 작성 워크플로 갱신)
- Delete: `scripts/chapters/_old/`, `scripts/split-survival-english.mjs`

- [ ] **Step 1: 전체 검증**

Run: `node scripts/build-survival-english.mjs && node scripts/validate-survival-english.mjs`
Expected: `빌드 완료: 40개 챕터` → `검증 통과 ✅`.

- [ ] **Step 2: 정합성 스폿체크**

Run:
```bash
node -e "const d=require('./data/survival-english.json');console.log('chapters',d.chapters.length);for(const c of d.chapters){if(c.dialogues&&c.dialogues.length!==10)console.log('BAD',c.id,c.dialogues.length)}console.log('ok')"
```
Expected: `chapters 40` → `ok` (BAD 줄 없음).

- [ ] **Step 3: 브라우저 스모크 테스트** — 로컬 서버로 새 챕터 일부 확인.

Run: `python3 -m http.server 8000` 후 `category.html?cat=survival-english`에서 40챕터 노출, `chapter.html?cat=survival-english&ch=ch04`/`ch13`/`ch40`에서 대화 토글·퀴즈 시작이 정상인지 확인.

- [ ] **Step 4: 임시 산출물 정리**

Run: `rm -rf scripts/chapters/_old scripts/split-survival-english.mjs`

- [ ] **Step 5: README 갱신** — "콘텐츠 추가 가이드"에 조각 파일 + 빌드 워크플로를 추가한다.

추가할 내용(요지):
```markdown
### 생존 영어 회화 편집 워크플로
`data/survival-english.json`은 `scripts/chapters/chNN.json` 조각에서 생성됩니다.
1. `scripts/chapters/chNN.json` 편집
2. `node scripts/validate-chapter.mjs scripts/chapters/chNN.json` 로 단일 검증
3. `node scripts/build-survival-english.mjs` 로 재생성
4. `node scripts/validate-survival-english.mjs` 로 전체 검증
챕터는 대화 중심 포맷(dialogues + keyExpressions + sets)을 사용합니다.
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Complete 40-chapter restructure; update README authoring workflow"
```

---

## Self-Review 결과

- **스펙 커버리지:** 스펙 §3의 40챕터 전부 Task 4~43에 1:1 대응. §2.1 포맷·ch01 보존은 Task 4(계승)+검증 계약으로 보장. §4 매핑은 본 계획 매핑표 = 스펙 §4와 일치. §6 비범위(코드/타 카테고리/PIN·타이머 불변) 준수 — 사이트 런타임 파일 미변경.
- **플레이스홀더:** 검증기·빌드·추출 스크립트는 전체 코드 수록. 챕터 콘텐츠의 영어 문장은 실행 단계 산출물이며, 각 챕터는 "대화 시나리오 10 + 퀴즈 초점" 구체 브리프와 객관 검증 게이트(validate-chapter)로 정의됨.
- **타입/명칭 일관성:** `validateChapter(ch, ids, prev)`, `build-survival-english.mjs`(category+chNN 조각→`data/survival-english.json`), 조각 경로 `scripts/chapters/chNN.json`, 문제 id `se_chNN_set01_NNN`, 대화 id `chNN_dMM` — 전 태스크 동일 사용.
- **순서 의존성:** Task1(검증기)→Task2(분리·안전망)→Task3(재배치 스켈레톤)→Task4~43(챕터, 상호 독립·병렬 가능)→Task44(통합·정리). 챕터 태스크는 서로 독립이라 subagent 병렬 적합.
