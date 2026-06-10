// 다크/라이트 테마: 시스템 기본 + 수동 토글, localStorage 영속. 모든 페이지에 로드.
(function () {
  var KEY = "cctrip:theme";
  var root = document.documentElement;

  function saved() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }
  function store(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) {}
  }
  // 적용할 테마 계산: 명시 선택 우선, 없으면 시스템 설정.
  function current() {
    var s = saved();
    if (s === "light" || s === "dark") return s;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  function apply(theme) {
    root.setAttribute("data-theme", theme);
  }
  apply(current());

  function sync(btn) {
    var dark = root.getAttribute("data-theme") === "dark";
    btn.textContent = dark ? "☀️" : "🌙"; // ☀️ / 🌙
    btn.setAttribute(
      "aria-label",
      dark ? "라이트 모드로 전환" : "다크 모드로 전환"
    );
  }
  function makeButton() {
    var btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.className = "theme-toggle";
    btn.type = "button";
    sync(btn);
    btn.addEventListener("click", function () {
      var next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      store(next);
      apply(next);
      sync(btn);
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeButton);
  } else {
    makeButton();
  }
})();
