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

  // 한 챕터에서 출제할 세트를 무작위로 1개 골라 그 안의 문제 배열을 반환.
  // - sets가 비어 있으면 빈 배열.
  // - 세트 내 문제 순서를 셔플.
  // - 각 문제는 prepareQuestion으로 보기 순서까지 셔플하고 정답 인덱스를 재매핑.
  function pickSetQuestions(chapter) {
    const sets = (chapter && chapter.sets) || [];
    if (!sets.length) return [];
    const set = sets[Math.floor(Math.random() * sets.length)];
    const questions = (set && set.questions) || [];
    return shuffle(questions).map(prepareQuestion);
  }

  // 문제를 화면 표시용으로 변환.
  // - ox 유형: 보기를 ["O", "X"]로 고정. answerIndex(0=O,1=X) 그대로.
  // - multiple_choice: 보기 순서를 셔플하고, 정답이 옮겨간 새 위치로 answerIndex 재매핑.
  // 반환 객체의 displayOptions / answerIndex는 같은 좌표계를 사용하므로
  // 사용자 선택 인덱스와 곧바로 비교/채점할 수 있다.
  function prepareQuestion(q) {
    if (q.type === "ox") {
      return {
        id: q.id,
        type: "ox",
        question: q.question,
        displayOptions: ["O (맞다)", "X (아니다)"],
        answerIndex: q.answerIndex,
        explanation: q.explanation,
      };
    }
    const options = q.options || [];
    // 원래 인덱스를 함께 들고 셔플한 뒤 정답 위치를 찾는다.
    const order = shuffle(options.map(function (opt, i) {
      return { opt: opt, i: i };
    }));
    const displayOptions = order.map(function (o) {
      return o.opt;
    });
    const answerIndex = order.findIndex(function (o) {
      return o.i === q.answerIndex;
    });
    return {
      id: q.id,
      type: "multiple_choice",
      question: q.question,
      displayOptions: displayOptions,
      answerIndex: answerIndex,
      explanation: q.explanation,
    };
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
    pickSetQuestions: pickSetQuestions,
    prepareQuestion: prepareQuestion,
    scoreQuiz: scoreQuiz,
    formatTime: formatTime,
    getParam: getParam,
    escapeHtml: escapeHtml,
  };
})();
