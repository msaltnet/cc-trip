// 학습 본문 렌더 + PIN 모달 + 퀴즈 시작.
(async function () {
  const CONFIG = window.CONFIG;
  const UTIL = window.UTIL;
  const esc = UTIL.escapeHtml;

  const titleEl = document.getElementById("chapter-title");
  const subEl = document.getElementById("chapter-subtitle");
  const sectionsEl = document.getElementById("sections");
  const backLink = document.getElementById("back-link");
  const startArea = document.getElementById("start-area");
  const startBtn = document.getElementById("start-quiz");
  const prepNote = document.getElementById("prep-note");

  const catId = UTIL.getParam("cat");
  const chId = UTIL.getParam("ch");

  if (catId) {
    backLink.href = "category.html?cat=" + encodeURIComponent(catId);
  }

  if (!catId || !chId) {
    showNotFound();
    return;
  }

  let chapter = null;

  try {
    const result = await window.DATA.loadCategory(catId);
    if (!result) {
      showNotFound();
      return;
    }
    chapter = window.DATA.findChapter(result.detail, chId);
    if (!chapter) {
      showNotFound();
      return;
    }

    document.title = chapter.title + " · 유럽 가족 여행 준비 Quiz";
    titleEl.textContent = chapter.title;
    subEl.textContent = chapter.summary || "";

    const dialogues = chapter.dialogues || [];
    if (dialogues.length) {
      var hint =
        '<p class="dlg-hint">💡 영어 대사를 누르면 한국어 번역이 나와요. 다시 누르면 숨겨집니다.</p>';
      sectionsEl.innerHTML =
        hint +
        dialogues
        .map(function (d, i) {
          var lines = (d.lines || [])
            .map(function (ln) {
              // 대사를 누르면 한국어 번역이 토글됩니다(기본 숨김).
              return (
                '<div class="dlg-line"><span class="dlg-speaker">' +
                esc(ln.speaker || "") +
                '</span><button type="button" class="dlg-text" aria-expanded="false"><span class="dlg-en">' +
                esc(ln.en || "") +
                '</span><span class="dlg-ko">' +
                esc(ln.ko || "") +
                "</span></button></div>"
              );
            })
            .join("");
          var exprs = (d.keyExpressions || [])
            .map(function (e) {
              var alts = (e.alternatives || [])
                .map(function (a) {
                  return (
                    '<li><code>' +
                    esc(a.en || "") +
                    '</code> <span class="alt-ko">' +
                    esc(a.ko || "") +
                    "</span></li>"
                  );
                })
                .join("");
              var altBlock = alts
                ? '<ul class="dlg-alts">' + alts + "</ul>"
                : "";
              return (
                '<li><code>' +
                esc(e.en || "") +
                "</code> — " +
                esc(e.ko || "") +
                altBlock +
                "</li>"
              );
            })
            .join("");
          var exprBlock = exprs
            ? '<div class="dlg-key"><h4>핵심 표현</h4><ul>' + exprs + "</ul></div>"
            : "";
          return (
            '<div class="dialogue-block"><h3><span class="dlg-num">대화 ' +
            (i + 1) +
            "</span>" +
            esc(d.title || "") +
            "</h3>" +
            '<div class="dlg-lines">' +
            lines +
            "</div>" +
            exprBlock +
            "</div>"
          );
        })
          .join("");

      // 대사 클릭 시 한국어 번역 토글 (이벤트 위임).
      sectionsEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".dlg-text");
        if (!btn) return;
        var revealed = btn.classList.toggle("revealed");
        btn.setAttribute("aria-expanded", revealed ? "true" : "false");
      });
    } else {
      // 구버전 콘텐츠 호환: 설명 본문(sections) 렌더.
      var sections = chapter.sections || [];
      sectionsEl.innerHTML = sections
        .map(function (s) {
          return (
            '<div class="section-block"><h3>' +
            esc(s.heading || "") +
            "</h3><p>" +
            esc(s.body || "") +
            "</p></div>"
          );
        })
        .join("");
    }

    // 문제 유무에 따라 시작 버튼 활성/비활성.
    startArea.hidden = false;
    const hasQuestions = window.DATA.hasQuestions(chapter);
    if (!hasQuestions) {
      startBtn.disabled = true;
      startBtn.textContent = "준비 중인 챕터";
      prepNote.hidden = false;
    }
  } catch (err) {
    console.error(err);
    sectionsEl.innerHTML =
      '<div class="message"><span class="emoji">⚠️</span>콘텐츠를 불러오지 못했습니다. 새로고침 해주세요.</div>';
    return;
  }

  // 퀴즈 시작: 직접 진입 차단용 플래그를 남기고 곧바로 이동.
  function startQuiz() {
    sessionStorage.setItem(CONFIG.UNLOCK_KEY, catId + ":" + chId);
    window.location.href =
      "quiz.html?cat=" +
      encodeURIComponent(catId) +
      "&ch=" +
      encodeURIComponent(chId);
  }

  startBtn.addEventListener("click", startQuiz);

  function showNotFound() {
    titleEl.textContent = "찾을 수 없는 항목";
    subEl.textContent = "";
    sectionsEl.innerHTML =
      '<div class="message"><span class="emoji">🔍</span>요청한 챕터를 찾을 수 없습니다.<br /><a class="back-link" href="index.html">목차로 돌아가기</a></div>';
  }
})();
