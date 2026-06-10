// 메인 목차: 카테고리 카드 렌더.
(async function () {
  const listEl = document.getElementById("category-list");
  const esc = window.UTIL.escapeHtml;

  try {
    const categories = await window.DATA.loadCategories();
    if (!categories.length) {
      listEl.innerHTML =
        '<li class="message"><span class="emoji">📭</span>등록된 카테고리가 없습니다.</li>';
      return;
    }
    listEl.innerHTML = categories
      .map(function (c) {
        return (
          '<li><a class="card" href="category.html?cat=' +
          encodeURIComponent(c.id) +
          '">' +
          '<span class="card-icon">' +
          esc(c.icon || "📘") +
          "</span>" +
          '<span class="card-body">' +
          '<span class="card-title">' +
          esc(c.title) +
          "</span>" +
          '<span class="card-summary">' +
          esc(c.summary || "") +
          "</span>" +
          '<span class="card-progress" data-cat="' +
          esc(c.id) +
          '" hidden></span>' +
          "</span>" +
          '<span class="card-arrow">›</span>' +
          "</a></li>"
        );
      })
      .join("");

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
  } catch (err) {
    console.error(err);
    listEl.innerHTML =
      '<li class="message"><span class="emoji">⚠️</span>콘텐츠를 불러오지 못했습니다. 새로고침 해주세요.</li>';
  }
})();
