// 챕터 목록 렌더.
(async function () {
  const UTIL = window.UTIL;
  const esc = UTIL.escapeHtml;
  const titleEl = document.getElementById("cat-title");
  const subEl = document.getElementById("cat-subtitle");
  const listEl = document.getElementById("chapter-list");

  const catId = UTIL.getParam("cat");
  if (!catId) {
    showNotFound();
    return;
  }

  try {
    const result = await window.DATA.loadCategory(catId);
    if (!result) {
      showNotFound();
      return;
    }
    const { meta, detail } = result;
    document.title = detail.title + " · 유럽 가족 여행 준비 Quiz";
    titleEl.textContent = (meta.icon ? meta.icon + " " : "") + detail.title;
    subEl.textContent = meta.summary || "";

    const chapters = detail.chapters || [];
    if (!chapters.length) {
      listEl.innerHTML =
        '<li class="message"><span class="emoji">📭</span>아직 챕터가 없습니다.</li>';
      return;
    }

    listEl.innerHTML = chapters
      .map(function (ch) {
        const playable = window.DATA.hasQuestions(ch);
        const rec = window.PROGRESS ? window.PROGRESS.getChapter(catId, ch.id) : null;
        const done = !!(rec && rec.attempts > 0);

        // 완료 시: 체크 + "최고 8/14" 배지. 미완료 재생 가능: 배지 없음. 문제 없음: "준비 중".
        const badge = done
          ? '<span class="card-badge card-badge--score">최고 ' +
            rec.bestCorrect +
            "/" +
            rec.bestTotal +
            "</span>"
          : playable
          ? ""
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
      })
      .join("");
  } catch (err) {
    console.error(err);
    listEl.innerHTML =
      '<li class="message"><span class="emoji">⚠️</span>콘텐츠를 불러오지 못했습니다. 새로고침 해주세요.</li>';
  }

  function showNotFound() {
    titleEl.textContent = "찾을 수 없는 항목";
    subEl.textContent = "";
    listEl.innerHTML =
      '<li class="message"><span class="emoji">🔍</span>요청한 카테고리를 찾을 수 없습니다.<br /><a class="back-link" href="index.html">목차로 돌아가기</a></li>';
  }
})();
