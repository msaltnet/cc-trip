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
          "</span>" +
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
})();
