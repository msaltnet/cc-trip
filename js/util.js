// 부수효과 없는 순수 함수 모음. DOM·fetch·전역 상태를 건드리지 않습니다.
window.UTIL = (function () {
  // Fisher-Yates 셔플. 원본을 변경하지 않고 새 배열을 반환합니다.
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 셔플 후 앞에서 min(n, 길이)개 추출.
  function pickRandom(arr, n) {
    return shuffle(arr).slice(0, Math.min(n, arr.length));
  }

  // 출제 문항(picked)과 사용자 답(answers)을 비교해 점수 계산.
  // answers[i]는 picked[i]에 대한 선택 인덱스(미선택은 null/undefined).
  function scoreQuiz(picked, answers) {
    let correct = 0;
    picked.forEach((q, i) => {
      if (answers[i] === q.answerIndex) correct++;
    });
    return { correct: correct, total: picked.length };
  }

  // 초 -> "MM:SS" 문자열.
  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return mm + ":" + ss;
  }

  // 현재 URL의 쿼리 파라미터 조회. 없으면 null.
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // 텍스트를 HTML로 안전하게 이스케이프.
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  return {
    shuffle: shuffle,
    pickRandom: pickRandom,
    scoreQuiz: scoreQuiz,
    formatTime: formatTime,
    getParam: getParam,
    escapeHtml: escapeHtml,
  };
})();
