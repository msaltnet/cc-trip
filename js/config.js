// 사이트 전역 상수.
window.CONFIG = {
  QUIZ_TIME_SEC: 600, // 제한 시간(초) = 10분
  QUIZ_COUNT: 10, // 챕터당 최대 출제 문항 수
  DATA_DIR: "data", // 데이터 폴더 (현재 페이지 기준 상대 경로)

  // sessionStorage 키
  UNLOCK_KEY: "quizUnlocked", // PIN 통과 플래그 ("cat:ch")
  SESSION_KEY: "quizSession", // 출제 세션 데이터
};
