# 웹 디자인·UX 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 톤을 유지하며 비주얼 마감을 끌어올리고, 다크모드·학습 진행/완료 표시·퀴즈 점수 이력·퀴즈 진행바를 추가한다.

**Architecture:** 기존 구조 유지 + 점진 개선. `css/style.css`를 다듬고(토큰 기반), 작은 부수효과/데이터 모듈 2개(`js/theme.js`, `js/progress.js`)를 추가해 기존 렌더 함수(`index/category/quiz/result.js`)에 연결한다. 모든 상태는 `localStorage`(서버 없음). 의존성 0·빌드 없음 원칙 유지.

**Tech Stack:** 순수 HTML/CSS/JS(ES5 스타일 IIFE, 기존 코드 관례 일치), `localStorage`, `prefers-color-scheme`.

**선행 스펙:** `docs/superpowers/specs/2026-06-10-web-design-ux-improvements-design.md`

---

## 검증 방식 안내

이 프로젝트에는 JS 테스트 프레임워크가 없고(데이터 검증 스크립트만 존재), 변경 대상은 정적 UI다. 따라서 각 태스크의 검증은 **로컬 서버 + 브라우저 확인**으로 한다. 서버 실행:

```bash
cd /Users/massogeum/code/cc-trip
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000/ 접속
```

데이터 무결성은 기존 검증으로 회귀 확인 가능: `node scripts/validate-survival-english.mjs` (이 작업은 데이터를 건드리지 않으므로 항상 통과해야 함).

커밋 메시지에 `Co-Authored-By` 트레일러를 넣지 않는다(사용자 전역 설정).

## 파일 구조

| 파일 | 책임 | 변경 |
|---|---|---|
| `css/style.css` | 전역 스타일·토큰 | 카드 버그 수정, 마감, 다크 팔레트, 토글/진행바/배지 스타일 |
| `js/theme.js` | 다크/라이트 테마 토글·영속 | 신규 |
| `js/progress.js` | localStorage 진행/점수 API | 신규 |
| `js/index.js` | 카테고리 카드 | 진행 표시 추가 |
| `js/category.js` | 챕터 카드 | 완료 체크 + 최고 점수 배지 |
| `js/quiz.js` | 퀴즈 진행 | 진행바 갱신 |
| `js/result.js` | 결과 | 점수 저장 + 최고 경신 표시 |
| `*.html` (5개) | 페이지 | `theme.js` 로드(+일부 `progress.js`), 퀴즈 진행바 마크업 |

---

## Task 1: 비주얼 다듬기 (카드 버그 수정 + 마감 + 포커스)

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: 카드 제목/요약 블록 분리 + 줄간격**

`css/style.css`에서 기존 블록
```css
.card-title {
  font-weight: 700;
  font-size: 1.05rem;
}
.card-summary {
  color: var(--color-text-soft);
  font-size: 0.9rem;
  margin-top: 2px;
}
```
을 다음으로 교체:
```css
.card-title {
  display: block;
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.card-summary {
  display: block;
  color: var(--color-text-soft);
  font-size: 0.9rem;
  line-height: 1.45;
  margin-top: 4px;
}
```

- [ ] **Step 2: primary-soft 토큰 추가 + 하드코딩 색 치환**

`:root` 블록의 `--color-disabled: #b6c0cd;` 다음 줄에 추가:
```css
  --color-primary-soft: #eef3ff;
```
그리고 `css/style.css` 전체에서 하드코딩된 `#eef3ff` 3곳(`.dlg-text.revealed`, `.btn-secondary:hover`, `.option.is-selected`)의 `background`/색상 값을 `var(--color-primary-soft)`로 교체. 예:
```css
.dlg-text.revealed { background: var(--color-primary-soft); }
.btn-secondary:hover { background: var(--color-primary-soft); }
.option.is-selected { border-color: var(--color-primary); background: var(--color-primary-soft); }
```

- [ ] **Step 3: 전역 포커스 가시성(:focus-visible) 추가**

`css/style.css` 끝의 `@media (min-width: 600px) { ... }` 블록 **앞에** 추가:
```css
/* ---------- 접근성: 키보드 포커스 ---------- */
a:focus-visible,
button:focus-visible,
input:focus-visible,
.dlg-text:focus-visible,
.option:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

- [ ] **Step 4: 브라우저 확인**

`python3 -m http.server 8000` 실행 후 `http://localhost:8000/index.html` 와 `http://localhost:8000/category.html?cat=survival-english` 접속.
Expected: 카드에서 제목과 요약이 **두 줄로 분리**되어 보인다(예: "생존 영어 회화" 줄 / "공항·식당·길찾기…" 줄). Tab 키로 카드 이동 시 파란 포커스 링이 보인다.

- [ ] **Step 5: Commit**

```bash
git add css/style.css
git commit -m "Polish cards: fix title/summary stacking, add focus-visible, soft-color token"
```

---

## Task 2: 다크모드 (CSS 팔레트 + theme.js + 전 페이지 로드)

**Files:**
- Modify: `css/style.css`
- Create: `js/theme.js`
- Modify: `index.html`, `category.html`, `chapter.html`, `quiz.html`, `result.html`

- [ ] **Step 1: 다크 팔레트 + 토글 버튼 스타일 추가**

`css/style.css` 끝(맨 아래)에 추가:
```css
/* ---------- 다크 테마 토큰 ---------- */
html[data-theme="dark"] {
  --color-bg: #0f1620;
  --color-surface: #1a2330;
  --color-text: #e6ebf2;
  --color-text-soft: #9aa7b8;
  --color-primary: #5b86ff;
  --color-primary-dark: #9bb4ff;
  --color-primary-soft: #22304d;
  --color-accent: #ff9d5c;
  --color-correct: #3ec98a;
  --color-correct-bg: #14301f;
  --color-wrong: #ff6f63;
  --color-wrong-bg: #371d1b;
  --color-warning: #ff6f63;
  --color-border: #2b3848;
  --color-disabled: #5a6678;
  --shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.35);
}
/* 명시적 선택이 없을 때 시스템 다크 설정을 따른다(첫 페인트 FOUC 방지용 fallback). */
@media (prefers-color-scheme: dark) {
  html:not([data-theme="light"]) {
    --color-bg: #0f1620;
    --color-surface: #1a2330;
    --color-text: #e6ebf2;
    --color-text-soft: #9aa7b8;
    --color-primary: #5b86ff;
    --color-primary-dark: #9bb4ff;
    --color-primary-soft: #22304d;
    --color-accent: #ff9d5c;
    --color-correct: #3ec98a;
    --color-correct-bg: #14301f;
    --color-wrong: #ff6f63;
    --color-wrong-bg: #371d1b;
    --color-warning: #ff6f63;
    --color-border: #2b3848;
    --color-disabled: #5a6678;
    --shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.35);
  }
}
/* ---------- 테마 토글 버튼(JS 주입) ---------- */
.theme-toggle {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 200;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
```

- [ ] **Step 2: theme.js 작성**

`js/theme.js` 신규 생성:
```js
// 다크/라이트 테마: 시스템 기본 + 수동 토글, localStorage 영속. 모든 페이지에 로드.
(function () {
  var KEY = "cctrip:theme";
  var root = document.documentElement;

  function saved() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }
  function store(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) {}
  }
  // 적용할 테마 계산: 명시 선택 우선, 없으면 시스템 설정.
  function current() {
    var s = saved();
    if (s === "light" || s === "dark") return s;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  function apply(theme) {
    root.setAttribute("data-theme", theme);
  }
  apply(current());

  function sync(btn) {
    var dark = root.getAttribute("data-theme") === "dark";
    btn.textContent = dark ? "☀️" : "🌙"; // ☀️ / 🌙
    btn.setAttribute(
      "aria-label",
      dark ? "라이트 모드로 전환" : "다크 모드로 전환"
    );
  }
  function makeButton() {
    var btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.className = "theme-toggle";
    btn.type = "button";
    sync(btn);
    btn.addEventListener("click", function () {
      var next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      store(next);
      apply(next);
      sync(btn);
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeButton);
  } else {
    makeButton();
  }
})();
```

- [ ] **Step 3: 전 페이지에 theme.js 로드**

5개 HTML 파일(`index.html`, `category.html`, `chapter.html`, `quiz.html`, `result.html`)에서 `<script src="js/config.js"></script>` **바로 앞 줄**에 추가:
```html
    <script src="js/theme.js"></script>
```
(`result.html`은 `config.js`를 안 쓰지만 동일하게 첫 스크립트로 `js/result.js` 앞에 `js/theme.js`를 넣는다.)

- [ ] **Step 4: 브라우저 확인**

`http://localhost:8000/index.html` 접속. 우상단 원형 토글(🌙/☀️) 클릭 → 다크↔라이트 전환. 새로고침해도 선택 유지. 다른 페이지(category/chapter/quiz/result)로 이동해도 동일 테마 유지·가독성 OK. macOS 시스템을 다크로 두고 localStorage를 비운 새 탭에서 첫 진입 시 다크로 시작.

- [ ] **Step 5: Commit**

```bash
git add css/style.css js/theme.js index.html category.html chapter.html quiz.html result.html
git commit -m "Add dark mode: palette tokens, theme.js toggle with persistence + system default"
```

---

## Task 3: 진행/점수 데이터 모듈 (progress.js)

**Files:**
- Create: `js/progress.js`

- [ ] **Step 1: progress.js 작성**

`js/progress.js` 신규 생성:
```js
// 학습 진행/점수 기록. localStorage 기반(서버 없음). 모든 데이터는 이 기기에만 저장.
window.PROGRESS = (function () {
  var KEY = "cctrip:progress:v1";

  function readAll() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return {};
      var obj = JSON.parse(raw);
      return obj && typeof obj === "object" ? obj : {};
    } catch (e) {
      return {};
    }
  }
  function writeAll(obj) {
    try {
      localStorage.setItem(KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  // 퀴즈 결과 1건 기록. 반환: { isNewBest: boolean }.
  // isNewBest = 이전 기록이 있고 이번 비율이 기존 최고보다 높을 때만 true(첫 기록은 false).
  function recordResult(catId, chId, correct, total) {
    if (!catId || !chId || !total) return { isNewBest: false };
    var all = readAll();
    if (!all[catId]) all[catId] = {};
    var prev = all[catId][chId] || null;
    var rec = prev || {
      bestCorrect: 0,
      bestTotal: total,
      lastCorrect: 0,
      lastTotal: total,
      attempts: 0,
    };
    rec.attempts += 1;
    rec.lastCorrect = correct;
    rec.lastTotal = total;
    var isNewBest = false;
    var prevRatio = rec.bestTotal ? rec.bestCorrect / rec.bestTotal : -1;
    var newRatio = correct / total;
    if (!prev || newRatio > prevRatio) {
      rec.bestCorrect = correct;
      rec.bestTotal = total;
      isNewBest = !!prev;
    }
    all[catId][chId] = rec;
    writeAll(all);
    return { isNewBest: isNewBest };
  }

  // 챕터 기록 조회. 없으면 null.
  function getChapter(catId, chId) {
    var all = readAll();
    return (all[catId] && all[catId][chId]) || null;
  }

  // 카테고리 진행 통계. attempted = 시도한(attempts>0) 챕터 수.
  function getCategoryStats(catId, totalChapters) {
    var all = readAll();
    var cat = all[catId] || {};
    var attempted = Object.keys(cat).filter(function (chId) {
      return cat[chId] && cat[chId].attempts > 0;
    }).length;
    return { attempted: attempted, total: totalChapters || 0 };
  }

  return {
    recordResult: recordResult,
    getChapter: getChapter,
    getCategoryStats: getCategoryStats,
  };
})();
```

- [ ] **Step 2: 브라우저 콘솔로 동작 확인**

`http://localhost:8000/index.html` 접속 후 콘솔에서:
```js
PROGRESS.recordResult("survival-english","ch01",8,14); // {isNewBest:false}
PROGRESS.recordResult("survival-english","ch01",12,14); // {isNewBest:true}
PROGRESS.recordResult("survival-english","ch01",5,14);  // {isNewBest:false} (낮음)
PROGRESS.getChapter("survival-english","ch01"); // bestCorrect:12,bestTotal:14,lastCorrect:5,attempts:3
PROGRESS.getCategoryStats("survival-english",40); // {attempted:1,total:40}
```
Expected: 위 주석과 일치. 확인 후 콘솔에서 `localStorage.removeItem("cctrip:progress:v1")`로 테스트 데이터 삭제.

> 주의: `index.html`에는 아직 progress.js가 로드되지 않았다. 이 단계 확인을 위해 콘솔에서 먼저 `var s=document.createElement('script');s.src='js/progress.js';document.head.appendChild(s);` 로 임시 로드하거나, Task 6에서 로드된 뒤 확인해도 된다.

- [ ] **Step 3: Commit**

```bash
git add js/progress.js
git commit -m "Add progress.js: localStorage chapter progress + best-score API"
```

---

## Task 4: 결과 화면 점수 저장 + 최고 경신 표시

**Files:**
- Modify: `js/result.js`
- Modify: `result.html`
- Modify: `css/style.css`

- [ ] **Step 1: result.html에 progress.js 로드**

`result.html`에서 `<script src="js/result.js"></script>` **앞**에 추가(이미 Task 2에서 그 앞에 theme.js가 있다면 그 사이/앞 어디든 OK, result.js보다 먼저면 됨):
```html
    <script src="js/progress.js"></script>
```

- [ ] **Step 2: result.js에 기록 + 표시 로직 추가**

`js/result.js`에서 아래 줄
```js
  if (session.auto) label += " (시간 만료 자동 제출)";
  scoreLabel.textContent = label;
```
바로 다음에 추가:
```js

  // 진행/점수 localStorage 기록 + 최고 점수 표시.
  if (session.cat && session.ch && window.PROGRESS) {
    var rb = window.PROGRESS.recordResult(session.cat, session.ch, correct, total);
    var rec = window.PROGRESS.getChapter(session.cat, session.ch);
    var note = document.createElement("div");
    note.className = "score-note";
    if (rb.isNewBest) {
      note.textContent = "🎉 최고 점수 경신!";
    } else if (rec) {
      note.textContent = "최고 " + rec.bestCorrect + " / " + rec.bestTotal;
    }
    if (note.textContent) scoreCard.appendChild(note);
  }
```

- [ ] **Step 3: score-note 스타일 추가**

`css/style.css`의 `.score-card .score-label { ... }` 블록 다음에 추가:
```css
.score-note {
  margin-top: var(--space-3);
  font-weight: 700;
  font-size: 0.95rem;
  opacity: 0.95;
}
```

- [ ] **Step 4: 브라우저 확인(엔드투엔드)**

`http://localhost:8000/chapter.html?cat=survival-english&ch=ch01` → "퀴즈 테스트 시작" → PIN(`0607`, `js/config.js`의 `QUIZ_PIN`) → 몇 문항 풀고 제출.
Expected: 결과 화면 점수카드 아래에 "최고 N / 14"가 표시. 같은 챕터를 다시 더 높은 점수로 풀면 "🎉 최고 점수 경신!"이 표시. 확인 후 `localStorage.removeItem("cctrip:progress:v1")`.

- [ ] **Step 5: Commit**

```bash
git add js/result.js result.html css/style.css
git commit -m "Result: persist score to progress, show best/new-best"
```

---

## Task 5: 챕터 목록에 완료 체크 + 최고 점수 배지

**Files:**
- Modify: `js/category.js`
- Modify: `category.html`
- Modify: `css/style.css`

- [ ] **Step 1: category.html에 progress.js 로드**

`category.html`에서 `<script src="js/category.js"></script>` **앞**에 추가:
```html
    <script src="js/progress.js"></script>
```

- [ ] **Step 2: category.js의 챕터 카드에 기록 반영**

`js/category.js`의 `chapters.map(function (ch) { ... })` 콜백 본문을 다음으로 교체(기존 `const sets`/`const badge` 및 return을 대체):
```js
        const sets = window.DATA.setCount(ch);
        const playable = window.DATA.hasQuestions(ch);
        const rec = window.PROGRESS ? window.PROGRESS.getChapter(catId, ch.id) : null;
        const done = !!(rec && rec.attempts > 0);

        // 완료 시: 체크 + "최고 8/14" 배지. 미완료: 기존 "N세트"/"준비 중" 배지.
        const badge = done
          ? '<span class="card-badge card-badge--score">최고 ' +
            rec.bestCorrect +
            "/" +
            rec.bestTotal +
            "</span>"
          : playable
          ? '<span class="card-badge">' + sets + "세트</span>"
          : '<span class="card-badge">준비 중</span>';
        const check = done
          ? '<span class="card-check" aria-label="완료">✓</span> '
          : "";

        return (
          '<li><a class="card' +
          (done ? " is-done" : "") +
          '" href="chapter.html?cat=' +
          encodeURIComponent(catId) +
          "&ch=" +
          encodeURIComponent(ch.id) +
          '">' +
          '<span class="card-body">' +
          '<span class="card-title">' +
          check +
          esc(ch.title) +
          "</span>" +
          '<span class="card-summary">' +
          esc(ch.summary || "") +
          "</span>" +
          "</span>" +
          badge +
          '<span class="card-arrow">›</span>' +
          "</a></li>"
        );
```

- [ ] **Step 3: 완료 체크/점수 배지 스타일 추가**

`css/style.css`의 `.card-badge { ... }` 블록 다음에 추가:
```css
.card-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--color-correct);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  vertical-align: middle;
}
.card-badge--score {
  color: var(--color-correct);
  background: var(--color-correct-bg);
  font-weight: 700;
}
.card.is-done {
  border-color: var(--color-correct);
}
```

- [ ] **Step 4: 브라우저 확인**

먼저 ch01을 한 번 풀어 기록을 만든 뒤(또는 콘솔: `PROGRESS.recordResult("survival-english","ch01",9,14)`), `http://localhost:8000/category.html?cat=survival-english` 접속.
Expected: ch01 카드에 초록 ✓ 체크와 "최고 9/14" 배지, 좌측 테두리 초록. 나머지 챕터는 "10세트" 배지. 확인 후 테스트 기록 삭제.

- [ ] **Step 5: Commit**

```bash
git add js/category.js category.html css/style.css
git commit -m "Category list: completion check + best-score badge per chapter"
```

---

## Task 6: 메인 목차에 카테고리 진행 표시

**Files:**
- Modify: `js/index.js`
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: index.html에 progress.js 로드**

`index.html`에서 `<script src="js/index.js"></script>` **앞**에 추가:
```html
    <script src="js/progress.js"></script>
```

- [ ] **Step 2: index.js — 카드 렌더 후 진행 표시 비동기 주입**

`js/index.js`의 `listEl.innerHTML = categories.map(...).join("");` 에서, 각 카드 `card-body` 안에 진행 플레이스홀더를 추가하고, 렌더 직후 각 카테고리의 챕터 수를 불러와 채운다. `card-summary` 줄 다음(`"</span>"` 닫은 뒤, `card-body` 닫기 전)에 플레이스홀더를 넣도록 map 콜백의 해당 부분을 교체:

기존:
```js
          '<span class="card-summary">' +
          esc(c.summary || "") +
          "</span>" +
          "</span>" +
          '<span class="card-arrow">›</span>' +
```
교체:
```js
          '<span class="card-summary">' +
          esc(c.summary || "") +
          "</span>" +
          '<span class="card-progress" data-cat="' +
          esc(c.id) +
          '" hidden></span>' +
          "</span>" +
          '<span class="card-arrow">›</span>' +
```

그리고 `.join("");` 다음(같은 try 블록 안, `catch` 앞)에 추가:
```js

    // 각 카테고리의 진행률을 비동기로 채운다(실패해도 카드 자체엔 영향 없음).
    if (window.PROGRESS) {
      categories.forEach(async function (c) {
        try {
          const res = await window.DATA.loadCategory(c.id);
          const totalCh = (res && res.detail && res.detail.chapters
            ? res.detail.chapters
            : []
          ).filter(function (ch) {
            return window.DATA.hasQuestions(ch);
          }).length;
          if (!totalCh) return;
          const stats = window.PROGRESS.getCategoryStats(c.id, totalCh);
          const el = listEl.querySelector(
            '.card-progress[data-cat="' + c.id + '"]'
          );
          if (!el) return;
          const pct = Math.round((stats.attempted / totalCh) * 100);
          el.innerHTML =
            '<span class="card-progress-track"><span class="card-progress-fill" style="width:' +
            pct +
            '%"></span></span>' +
            '<span class="card-progress-text">' +
            stats.attempted +
            " / " +
            totalCh +
            " 챕터</span>";
          el.hidden = false;
        } catch (e) {
          /* 진행 표시는 부가 기능 — 실패 시 조용히 생략 */
        }
      });
    }
```

- [ ] **Step 3: 진행 바 스타일 추가**

`css/style.css`의 `.card-summary { ... }` 블록 다음에 추가:
```css
.card-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.card-progress-track {
  flex: 1 1 auto;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}
.card-progress-fill {
  display: block;
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}
.card-progress-text {
  flex: 0 0 auto;
  font-size: 0.78rem;
  color: var(--color-text-soft);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: 브라우저 확인**

ch01·ch02를 풀어 기록을 만든 뒤(또는 콘솔: `PROGRESS.recordResult("survival-english","ch01",9,14); PROGRESS.recordResult("survival-english","ch02",7,14)`), `http://localhost:8000/index.html` 접속.
Expected: "생존 영어 회화" 카드에 진행 바와 "2 / 40 챕터"가 표시. 기록 없는 카테고리는 진행 표시가 나타나지 않음(부가 기능). 확인 후 `localStorage.removeItem("cctrip:progress:v1")`.

- [ ] **Step 5: Commit**

```bash
git add js/index.js index.html css/style.css
git commit -m "Index: per-category progress bar (attempted/total chapters)"
```

---

## Task 7: 퀴즈 진행바

**Files:**
- Modify: `quiz.html`
- Modify: `js/quiz.js`
- Modify: `css/style.css`

- [ ] **Step 1: quiz.html 타이머 바에 진행바 마크업 추가**

`quiz.html`의 타이머 바를 다음으로 교체:
```html
    <div id="timer-bar" class="timer-bar" hidden>
      <span class="timer-label">남은 시간</span>
      <span id="timer" class="timer">10:00</span>
      <div class="quiz-progress">
        <div class="quiz-progress-track">
          <div id="quiz-progress-fill" class="quiz-progress-fill"></div>
        </div>
        <span id="quiz-progress-text" class="quiz-progress-text">0 / 0 답함</span>
      </div>
    </div>
```

- [ ] **Step 2: quiz.js에 진행바 갱신 추가**

`js/quiz.js` 상단 요소 참조부, 기존
```js
  const submitArea = document.getElementById("submit-area");
  const submitBtn = document.getElementById("submit-quiz");
```
다음에 추가:
```js
  const progFillEl = document.getElementById("quiz-progress-fill");
  const progTextEl = document.getElementById("quiz-progress-text");
```

`renderQuestions` 함수 안, 기존 `formEl.addEventListener("change", function (e) { ... });` 의 콜백 마지막(닫는 `}` 직전)에 `updateProgress();` 호출을 추가하고, 함수 본문 맨 끝(렌더 직후 초기화)에서도 호출. 구체적으로 `renderQuestions`의 change 리스너를 다음으로 교체:
```js
    // 선택 시 시각 강조 + 진행바 갱신.
    formEl.addEventListener("change", function (e) {
      if (e.target && e.target.type === "radio") {
        const group = formEl.querySelectorAll(
          'input[name="' + e.target.name + '"]'
        );
        group.forEach(function (input) {
          input.closest(".option").classList.toggle(
            "is-selected",
            input.checked
          );
        });
        updateProgress();
      }
    });

    updateProgress();
```

그리고 `collectAnswers` 함수 다음에 새 함수 추가:
```js
  // 진행바: 답한 문항 수 / 전체.
  function updateProgress() {
    if (!progFillEl || !progTextEl) return;
    const total = picked.length;
    const answered = collectAnswers().filter(function (a) {
      return a !== null;
    }).length;
    const pct = total ? Math.round((answered / total) * 100) : 0;
    progFillEl.style.width = pct + "%";
    progTextEl.textContent = answered + " / " + total + " 답함";
  }
```

- [ ] **Step 3: 퀴즈 진행바 스타일 추가**

`css/style.css`의 `.timer-label { ... }` 블록 다음에 추가:
```css
.quiz-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  max-width: var(--maxw);
  margin: var(--space-2) auto 0;
}
.quiz-progress-track {
  flex: 1 1 auto;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}
.quiz-progress-fill {
  width: 0;
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.25s ease;
}
.quiz-progress-text {
  flex: 0 0 auto;
  font-size: 0.78rem;
  color: var(--color-text-soft);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: 브라우저 확인**

`http://localhost:8000/chapter.html?cat=survival-english&ch=ch01` → 퀴즈 시작(PIN `0607`).
Expected: 타이머 아래에 진행바와 "0 / 14 답함". 보기를 선택할 때마다 숫자와 바가 증가. 스크롤해도 타이머·진행바가 상단에 고정(sticky).

- [ ] **Step 5: Commit**

```bash
git add quiz.html js/quiz.js css/style.css
git commit -m "Quiz: sticky answered-progress bar under timer"
```

---

## Task 8: 전체 점검 + 마무리

**Files:** 없음(확인·정리)

- [ ] **Step 1: 데이터 회귀 확인**

Run: `node scripts/validate-survival-english.mjs`
Expected: `검증 통과 ✅` (데이터 미변경).

- [ ] **Step 2: 전 페이지 라이트/다크 점검**

`python3 -m http.server 8000` 후 모바일 폭(개발자도구 390px)과 데스크톱 폭에서 5개 페이지를 라이트/다크 양쪽으로 확인:
- index: 카드 제목·요약 분리, 카테고리 진행바
- category: 챕터 완료 체크·점수 배지
- chapter: 대화 토글·핵심표현 가독성(다크 포함)
- quiz: 진행바·타이머 sticky, 옵션 선택 강조
- result: 점수카드·최고 표시·해설 리뷰

Expected: 깨지는 레이아웃·대비 부족 없음, 토글 동작·유지.

- [ ] **Step 3: 정리 확인**

`git status`로 미스테이지 변경이 없는지 확인. 임시 테스트로 만든 `localStorage` 데이터가 커밋에 영향 없음(클라이언트 상태이므로 무관).

- [ ] **Step 4: (선택) 최종 커밋**

추가 변경이 있었다면 커밋. 없으면 생략.

---

## Self-Review 결과

- **스펙 커버리지:** §3.1 비주얼 → Task 1. §3.2 다크모드 → Task 2. §3.3 progress.js → Task 3. §3.4 result → Task 4, category → Task 5, index → Task 6, quiz → Task 7. §6 검증 → Task 8. 모든 스펙 항목에 대응 태스크 존재.
- **플레이스홀더:** 모든 코드 스텝에 실제 코드·정확한 파일/문자열·브라우저 확인 절차 수록. "TBD/etc." 없음.
- **명칭 일관성:** `PROGRESS.recordResult/getChapter/getCategoryStats`, 반환 필드 `bestCorrect/bestTotal/lastCorrect/lastTotal/attempts`, `{isNewBest}`, 토큰 `--color-primary-soft`, 클래스 `theme-toggle/card-check/card-badge--score/card-progress(-track/-fill/-text)/quiz-progress(-track/-fill/-text)/score-note`, 요소 id `quiz-progress-fill/quiz-progress-text` — 태스크 간 동일 사용.
- **순서 의존성:** Task 1(CSS 기반)→2(다크·토큰 primary-soft 사용)→3(progress 모듈)→4~7(모듈 소비, 상호 독립; 각자 자기 페이지에 progress.js 로드)→8(점검). progress.js는 Task 3에서 생성되므로 4·5·6보다 먼저 와야 함(순서 지킬 것).
