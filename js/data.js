// 데이터 로딩 및 조회 헬퍼. fetch를 래핑합니다.
window.DATA = (function () {
  const CONFIG = window.CONFIG;

  // 카테고리 메타 목록 로드.
  async function loadCategories() {
    const res = await fetch(CONFIG.DATA_DIR + "/categories.json");
    if (!res.ok) throw new Error("categories.json 로드 실패: " + res.status);
    return res.json();
  }

  // 카테고리 id로 상세 데이터(챕터 포함) 로드.
  // categories.json의 file 필드를 따라 해당 파일을 읽습니다.
  async function loadCategory(catId) {
    const categories = await loadCategories();
    const meta = categories.find((c) => c.id === catId);
    if (!meta) return null;
    const res = await fetch(CONFIG.DATA_DIR + "/" + meta.file);
    if (!res.ok) throw new Error(meta.file + " 로드 실패: " + res.status);
    const detail = await res.json();
    // 메타 정보(icon 등)를 함께 반환해 화면에서 활용.
    return { meta: meta, detail: detail };
  }

  // 카테고리 상세에서 챕터 객체 조회. 없으면 null.
  function findChapter(detail, chId) {
    if (!detail || !Array.isArray(detail.chapters)) return null;
    return detail.chapters.find((ch) => ch.id === chId) || null;
  }

  // 챕터의 세트 개수.
  function setCount(chapter) {
    return chapter && Array.isArray(chapter.sets) ? chapter.sets.length : 0;
  }

  // 챕터에 풀 수 있는 문제가 하나라도 있는지 (세트 중 questions가 있는 것).
  function hasQuestions(chapter) {
    if (!chapter || !Array.isArray(chapter.sets)) return false;
    return chapter.sets.some(function (s) {
      return (s.questions || []).length > 0;
    });
  }

  return {
    loadCategories: loadCategories,
    loadCategory: loadCategory,
    findChapter: findChapter,
    setCount: setCount,
    hasQuestions: hasQuestions,
  };
})();
