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
  const shareBtn = document.getElementById("share");
  const toastEl = document.getElementById("toast");

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

  // 진행/점수 localStorage 기록 + 최고 점수 표시.
  if (session.cat && session.ch && window.PROGRESS) {
    var rb = window.PROGRESS.recordResult(session.cat, session.ch, correct, total);
    var rec = window.PROGRESS.getChapter(session.cat, session.ch);
    var note = document.createElement("div");
    note.className = "score-note";
    if (rb.isNewBest) {
      note.textContent = "🎉 최고 점수 경신!";
    } else if (rec) {
      note.textContent = "최고 " + rec.bestCorrect + " / " + rec.bestTotal;
    }
    if (note.textContent) scoreCard.appendChild(note);
  }

  // 해설 리스트.
  reviewEl.innerHTML = picked
    .map(function (q, i) {
      const userIdx = answers[i];
      const isCorrect = userIdx === q.answerIndex;
      const options = q.displayOptions || q.options || [];
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

  // ----- 결과 공유 -----
  function shareText() {
    var who = session.chapterTitle ? session.chapterTitle + " " : "";
    return (
      "유럽 가족 여행 준비 Quiz\n" +
      who +
      "결과: " +
      correct +
      " / " +
      total +
      "점!\n" +
      "https://trip.msalt.net/"
    );
  }

  function dateStr() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "." + mm + "." + dd;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 점수 + 문제별 정오표를 그린 공유용 카드 캔버스를 생성.
  function buildResultCard() {
    var marks = picked.map(function (q, i) {
      return answers[i] === q.answerIndex;
    });
    var n = marks.length || 1;

    var SANS =
      "'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, -apple-system, sans-serif";
    var dpr = 2;
    var W = 560;
    var PAD = 36;
    var cols = n <= 4 ? n : 5;
    var rows = Math.ceil(n / cols);
    var gap = 12;
    var cellW = (W - PAD * 2 - gap * (cols - 1)) / cols;
    var cellH = 46;

    // 세로 레이아웃 좌표.
    var yTitle = PAD + 20;
    var yScore = yTitle + 62;
    var yChapter = yScore + 34;
    var yDate = yChapter + 26;
    var yDivider = yDate + 20;
    var gridTop = yDivider + 22;
    var gridH = rows * cellH + (rows - 1) * gap;
    var yFooter = gridTop + gridH + 34;
    var H = yFooter + 22;

    var canvas = document.createElement("canvas");
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // 배경 그라데이션 (점수 카드와 동일 계열).
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#3b6cf6");
    grad.addColorStop(1, "#6a4bf6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // 헤더.
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 17px " + SANS;
    ctx.fillText("유럽 가족 여행 준비 Quiz", W / 2, yTitle);

    // 점수.
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 54px " + SANS;
    ctx.fillText(correct + " / " + total, W / 2, yScore);

    // 챕터명.
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "700 21px " + SANS;
    ctx.fillText(session.chapterTitle || "퀴즈 결과", W / 2, yChapter);

    // 날짜.
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "400 14px " + SANS;
    ctx.fillText(dateStr(), W / 2, yDate);

    // 구분선.
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, yDivider);
    ctx.lineTo(W - PAD, yDivider);
    ctx.stroke();

    // 문제별 정오 셀.
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (var i = 0; i < n; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var x = PAD + col * (cellW + gap);
      var cy = gridTop + row * (cellH + gap);
      var midY = cy + cellH / 2;

      ctx.fillStyle = "rgba(255,255,255,0.14)";
      roundRect(ctx, x, cy, cellW, cellH, 10);
      ctx.fill();

      // 문항 번호.
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 16px " + SANS;
      ctx.fillText(String(i + 1), x + 14, midY + 1);

      // 정오 마크 (O 초록 링 / X 빨강).
      var mx = x + cellW - 22;
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      if (marks[i]) {
        ctx.strokeStyle = "#34d399";
        ctx.beginPath();
        ctx.arc(mx, midY, 9, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#f87171";
        ctx.beginPath();
        ctx.moveTo(mx - 7, midY - 7);
        ctx.lineTo(mx + 7, midY + 7);
        ctx.moveTo(mx + 7, midY - 7);
        ctx.lineTo(mx - 7, midY + 7);
        ctx.stroke();
      }
    }

    // 푸터 URL.
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "600 14px " + SANS;
    ctx.fillText("trip.msalt.net", W / 2, yFooter);

    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) {
        canvas.toBlob(function (b) {
          resolve(b);
        }, "image/png");
      } else {
        resolve(null);
      }
    });
  }

  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  async function onShare() {
    var text = shareText();
    var fname = "quiz-result.png";
    var blob = null;
    try {
      blob = await canvasToBlob(buildResultCard());
    } catch (e) {
      blob = null;
    }
    var file =
      blob && typeof File !== "undefined"
        ? new File([blob], fname, { type: "image/png" })
        : null;

    // 1) 이미지 파일을 네이티브 공유 시트로 (모바일 등).
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "유럽 가족 여행 준비 Quiz 결과",
          text: text,
        });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
        // 공유 실패 시 아래 다운로드 폴백으로.
      }
    }

    // 2) 폴백: 이미지를 기기에 저장(다운로드).
    if (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      showToast("결과 이미지를 저장했어요 🖼️");
      return;
    }

    // 3) 최후 폴백: 텍스트 클립보드 복사.
    try {
      await navigator.clipboard.writeText(text);
      showToast("결과를 클립보드에 복사했어요 📋");
    } catch (e) {
      window.prompt("아래 내용을 복사해 공유하세요", text);
    }
  }

  if (shareBtn) shareBtn.addEventListener("click", onShare);
})();
