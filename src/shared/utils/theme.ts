export type ThemeType = "light" | "dark" | "system";

const THEME_KEY = "blog-theme";

// 시스템 다크모드 감지
export function detectSystemDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// 현재 테마 가져오기
export function getCurrentTheme(): ThemeType {
  if (typeof window === "undefined") return "system";

  const storedTheme = localStorage.getItem(THEME_KEY) as ThemeType;
  return storedTheme || "system";
}

// 실제 적용될 테마 계산 (시스템 설정 고려)
export function resolveTheme(theme: ThemeType = getCurrentTheme()): "light" | "dark" {
  if (theme === "system") {
    return detectSystemDarkMode() ? "dark" : "light";
  }
  return theme;
}

// 테마 적용
export function applyTheme(theme: ThemeType): void {
  if (typeof window === "undefined") return;

  const resolvedTheme = resolveTheme(theme);
  const htmlElement = document.documentElement;

  // 클래스 제거 후 추가
  htmlElement.classList.remove("light", "dark");
  htmlElement.classList.add(resolvedTheme);

  // localStorage에 저장
  localStorage.setItem(THEME_KEY, theme);

  // CSS 변수 업데이트
  if (resolvedTheme === "dark") {
    htmlElement.style.colorScheme = "dark";
  } else {
    htmlElement.style.colorScheme = "light";
  }
}

// 테마 전환 (라이트 ↔ 다크)
export function toggleTheme(): void {
  const currentTheme = getCurrentTheme();
  const resolvedTheme = resolveTheme(currentTheme);

  const newTheme: ThemeType = resolvedTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
}

// 시스템 테마 변경 감지 리스너
export function watchSystemThemeChange(callback: (isDark: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = (event: MediaQueryListEvent) => callback(event.matches);

  mediaQuery.addEventListener("change", listener);

  return () => mediaQuery.removeEventListener("change", listener);
}

// 초기 테마 설정
export function initializeTheme(): void {
  const storedTheme = getCurrentTheme();
  applyTheme(storedTheme);
}