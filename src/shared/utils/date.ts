// 날짜 포맷팅
export function formatDate(date: Date | string, format: "short" | "long" | "withTime" = "short"): string {
  const dateObject = new Date(date);

  if (isNaN(dateObject.getTime())) {
    return "잘못된 날짜";
  }

  const year = dateObject.getFullYear();
  const month = dateObject.getMonth() + 1;
  const day = dateObject.getDate();
  const hour = dateObject.getHours();
  const minute = dateObject.getMinutes();

  switch (format) {
    case "short":
      return `${year}.${month}.${day}`;
    case "long":
      return `${year}년 ${month}월 ${day}일`;
    case "withTime":
      return `${year}.${month}.${day} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    default:
      return `${year}.${month}.${day}`;
  }
}

// 상대 시간 표시 (예: "3시간 전", "2일 전")
export function getRelativeTime(date: Date | string): string {
  const dateObject = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObject.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears}년 전`;
  if (diffMonths > 0) return `${diffMonths}개월 전`;
  if (diffWeeks > 0) return `${diffWeeks}주 전`;
  if (diffDays > 0) return `${diffDays}일 전`;
  if (diffHours > 0) return `${diffHours}시간 전`;
  if (diffMinutes > 0) return `${diffMinutes}분 전`;
  if (diffSeconds > 10) return `${diffSeconds}초 전`;
  return "방금 전";
}

// 오늘인지 확인
export function isToday(date: Date | string): boolean {
  const dateObject = new Date(date);
  const today = new Date();

  return (
    dateObject.getFullYear() === today.getFullYear() &&
    dateObject.getMonth() === today.getMonth() &&
    dateObject.getDate() === today.getDate()
  );
}

// 이번 주인지 확인
export function isThisWeek(date: Date | string): boolean {
  const dateObject = new Date(date);
  const today = new Date();

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return dateObject >= weekStart && dateObject <= weekEnd;
}

// 날짜 차이 계산
export function calculateDateDiff(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// 읽기 시간 계산 (단어 수 기준)
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): string {
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));

  return `${minutes}분`;
}

// 월 이름 한국어로
export function getMonthName(monthNumber: number): string {
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  return monthNames[monthNumber - 1] || "잘못된 월";
}

// 요일 이름 한국어로
export function getDayName(dayNumber: number): string {
  const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

  return dayNames[dayNumber] || "잘못된 요일";
}