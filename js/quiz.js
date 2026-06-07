// 퀴즈: 랜덤 출제 + 타이머 + 답안 수집 + (수동/자동) 제출.
(async function () {
  const CONFIG = window.CONFIG;
  const UTIL = window.UTIL;
  const esc = UTIL.escapeHtml;

  const titleEl = document.getElementById("quiz-title");
  const subEl = document.getElementById("quiz-subtitle");
  const formEl = document.getElementById("quiz-form");
  const timerBar = document.getElementById("timer-bar");
  const timerEl = document.getElementById("timer");
  const submitArea = document.getElementById("submit-area");
  const submitBtn = document.getElementById("submit-quiz");

  const catId = UTIL.getParam("cat");
  const chId = UTIL.getParam("ch");

  // 가드: PIN 통과 없이 직접 진입하면 챕터로 되돌림.
  const unlock = sessionStorage.getItem(CONFIG.UNLOCK_KEY);
  if (!catId || !chId || unlock !== catId + ":" + chId) {
    redirectToChapter();
    return;
  }

  let picked = [];
  let chapter = null;
  let submitted = false;
  let intervalId = null;

  try {
    const result = await window.DATA.loadCategory(catId);
    if (!result) {
      redirectToChapter();
      return;
    }
    chapter = window.DATA.findChapter(result.detail, chId);
    if (!chapter || !(chapter.questions || []).length) {
      redirectToChapter();
      return;
    }

    document.title = "퀴즈 · " + chapter.title;
    titleEl.textContent = chapter.title + " 퀴즈";

    // 랜덤 추출 (최대 QUIZ_COUNT, 부족하면 있는 만큼).
    picked = UTIL.pickRandom(chapter.questions, CONFIG.QUIZ_COUNT);
    subEl.textContent = "총 " + picked.length + "문항 · 제한 시간 10분";

    renderQuestions(picked);
    submitArea.hidden = false;
    startTimer();
  } catch (err) {
    console.error(err);
    formEl.innerHTML =
      '<div class="message"><span class="emoji">⚠️</span>문제를 불러오지 못했습니다. 새로고침 해주세요.</div>';
    return;
  }

  function renderQuestions(questions) {
    formEl.innerHTML = questions
      .map(function (q, qi) {
        const options = (q.options || [])
          .map(function (opt, oi) {
            return (
              '<label class="option">' +
              '<input type="radio" name="q' +
              qi +
              '" value="' +
              oi +
              '" />' +
              "<span>" +
              esc(opt) +
              "</span>" +
              "</label>"
            );
          })
          .join("");
        return (
          '<div class="question-block">' +
          '<div class="question-number">문제 ' +
          (qi + 1) +
          " / " +
          questions.length +
          "</div>" +
          '<div class="question-text">' +
          esc(q.question) +
          "</div>" +
          '<div class="options">' +
          options +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    // 선택 시 시각 강조.
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
      }
    });
  }

  // 현재까지 선택된 답안 수집. 미선택은 null.
  function collectAnswers() {
    return picked.map(function (q, qi) {
      const checked = formEl.querySelector('input[name="q' + qi + '"]:checked');
      return checked ? Number(checked.value) : null;
    });
  }

  function startTimer() {
    timerBar.hidden = false;
    let remain = CONFIG.QUIZ_TIME_SEC;
    timerEl.textContent = UTIL.formatTime(remain);
    intervalId = setInterval(function () {
      remain -= 1;
      timerEl.textContent = UTIL.formatTime(remain);
      if (remain <= 60) timerEl.classList.add("timer--warning");
      if (remain <= 0) {
        clearInterval(intervalId);
        window.alert("⏰ 시간이 종료되었습니다. 현재 답안으로 자동 제출합니다.");
        finalize(true);
      }
    }, 1000);
  }

  function manualSubmit() {
    const answers = collectAnswers();
    const unanswered = answers.filter(function (a) {
      return a === null;
    }).length;
    if (unanswered > 0) {
      const ok = window.confirm(
        "안 푼 문항이 " + unanswered + "개 있습니다. 제출할까요?"
      );
      if (!ok) return;
    }
    finalize(false);
  }

  function finalize(auto) {
    if (submitted) return;
    submitted = true;
    if (intervalId) clearInterval(intervalId);

    const answers = collectAnswers();
    const session = {
      cat: catId,
      ch: chId,
      chapterTitle: chapter.title,
      picked: picked,
      answers: answers,
      auto: !!auto,
    };
    sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
    // 일회용 진입 플래그 소비.
    sessionStorage.removeItem(CONFIG.UNLOCK_KEY);
    window.location.href = "result.html";
  }

  submitBtn.addEventListener("click", manualSubmit);

  function redirectToChapter() {
    if (catId && chId) {
      window.location.replace(
        "chapter.html?cat=" +
          encodeURIComponent(catId) +
          "&ch=" +
          encodeURIComponent(chId)
      );
    } else {
      window.location.replace("index.html");
    }
  }
})();
