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

  const modal = document.getElementById("pin-modal");
  const pinInput = document.getElementById("pin-input");
  const pinError = document.getElementById("pin-error");
  const pinConfirm = document.getElementById("pin-confirm");
  const pinCancel = document.getElementById("pin-cancel");

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

    const sections = chapter.sections || [];
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

  // ----- PIN 모달 동작 -----
  function openModal() {
    pinError.textContent = "";
    pinInput.value = "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    pinInput.focus();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
  function submitPin() {
    if (pinInput.value === String(CONFIG.QUIZ_PIN)) {
      // 통과 플래그 기록 후 퀴즈로 이동 (직접 진입 차단용).
      sessionStorage.setItem(CONFIG.UNLOCK_KEY, catId + ":" + chId);
      window.location.href =
        "quiz.html?cat=" +
        encodeURIComponent(catId) +
        "&ch=" +
        encodeURIComponent(chId);
    } else {
      pinError.textContent = "PIN이 올바르지 않습니다.";
      pinInput.value = "";
      pinInput.focus();
    }
  }

  startBtn.addEventListener("click", openModal);
  pinConfirm.addEventListener("click", submitPin);
  pinCancel.addEventListener("click", closeModal);
  pinInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitPin();
  });
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  function showNotFound() {
    titleEl.textContent = "찾을 수 없는 항목";
    subEl.textContent = "";
    sectionsEl.innerHTML =
      '<div class="message"><span class="emoji">🔍</span>요청한 챕터를 찾을 수 없습니다.<br /><a class="back-link" href="index.html">목차로 돌아가기</a></div>';
  }
})();
