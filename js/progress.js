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
