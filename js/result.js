// 결과: 채점 + 점수·해설 렌더.
(function () {
  const CONFIG = window.CONFIG;
  const UTIL = window.UTIL;
  const esc = UTIL.escapeHtml;

  const scoreCard = document.getElementById("score-card");
  const scoreNum = document.getElementById("score-num");
  const scoreLabel = document.getElementById("score-label");
  const reviewEl = document.getElementById("review");
  const actions = document.getElementById("actions");
  const retryLink = document.getElementById("retry");

  const raw = sessionStorage.getItem(CONFIG.SESSION_KEY);
  if (!raw) {
    // 결과 데이터 없이 직접 진입 → 목차로.
    window.location.replace("index.html");
    return;
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch (e) {
    window.location.replace("index.html");
    return;
  }

  const picked = session.picked || [];
  const answers = session.answers || [];
  const { correct, total } = UTIL.scoreQuiz(picked, answers);

  document.title = "결과 · " + (session.chapterTitle || "퀴즈");

  // 점수 카드.
  scoreCard.hidden = false;
  scoreNum.textContent = correct + " / " + total;
  let label = (session.chapterTitle ? session.chapterTitle + " · " : "") + "정답";
  if (session.auto) label += " (시간 만료 자동 제출)";
  scoreLabel.textContent = label;

  // 해설 리스트.
  reviewEl.innerHTML = picked
    .map(function (q, i) {
      const userIdx = answers[i];
      const isCorrect = userIdx === q.answerIndex;
      const options = q.options || [];
      const userText =
        userIdx === null || userIdx === undefined
          ? "(선택 안 함)"
          : esc(options[userIdx]);
      const correctText = esc(options[q.answerIndex]);

      const userClass = isCorrect ? "right" : "wrong";
      const ox = isCorrect
        ? '<span class="ox ox--correct">⭕</span>'
        : '<span class="ox ox--wrong">❌</span>';

      return (
        '<div class="review-item ' +
        (isCorrect ? "is-correct" : "is-wrong") +
        '">' +
        '<div class="review-head">' +
        ox +
        '<span class="review-q">' +
        (i + 1) +
        ". " +
        esc(q.question) +
        "</span>" +
        "</div>" +
        '<div class="review-answer"><span class="label">내 답</span>' +
        '<span class="user-pick ' +
        userClass +
        '">' +
        userText +
        "</span></div>" +
        (isCorrect
          ? ""
          : '<div class="review-answer"><span class="label">정답</span>' +
            '<span class="correct-ans">' +
            correctText +
            "</span></div>") +
        '<div class="explanation"><span class="label">풀이 ·</span> ' +
        esc(q.explanation || "") +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  // 액션 버튼.
  actions.hidden = false;
  if (session.cat && session.ch) {
    // 다시 풀기 = 같은 챕터의 본문 화면(다시 PIN → 새 랜덤).
    retryLink.href =
      "chapter.html?cat=" +
      encodeURIComponent(session.cat) +
      "&ch=" +
      encodeURIComponent(session.ch);
  } else {
    retryLink.style.display = "none";
  }
})();
