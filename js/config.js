// 사이트 전역 상수.
// 주의: PIN은 클라이언트 코드에 노출되므로 실제 보안 장치가 아니라
//       가족이 아닌 사람의 장난 진입을 막는 가벼운 관문일 뿐입니다.
window.CONFIG = {
  QUIZ_PIN: "8188", // 퀴즈 진입 PIN (원하는 값으로 변경하세요)
  QUIZ_TIME_SEC: 600, // 제한 시간(초) = 10분
  QUIZ_COUNT: 10, // 챕터당 최대 출제 문항 수
  DATA_DIR: "data", // 데이터 폴더 (현재 페이지 기준 상대 경로)

  // sessionStorage 키
  UNLOCK_KEY: "quizUnlocked", // PIN 통과 플래그 ("cat:ch")
  SESSION_KEY: "quizSession", // 출제 세션 데이터
};
