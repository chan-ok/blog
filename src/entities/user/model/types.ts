/**
 * 사용자 엔티티 타입 정의
 * Supabase Auth와 연동되는 사용자 모델
 */

/**
 * 사용자 권한 타입
 */
export type UserRole = 'admin' | 'user';

/**
 * 기본 사용자 인터페이스
 * Supabase auth.users 테이블과 매핑
 */
export interface User {
  /** Supabase Auth UUID */
  id: string;
  /** 사용자 이메일 (로그인 ID) */
  email: string;
  /** 사용자 표시명 */
  name: string;
  /** 사용자 권한 레벨 */
  role: UserRole;
  /** 계정 생성일 */
  createdAt: Date;
  /** 마지막 로그인 시간 (선택사항) */
  lastLoginAt?: Date;
}

/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  /** 로그인 이메일 */
  email: string;
  /** 로그인 비밀번호 */
  password: string;
}

/**
 * 회원가입 요청 데이터
 */
export interface SignupRequest {
  /** 가입 이메일 */
  email: string;
  /** 가입 비밀번호 */
  password: string;
  /** 사용자 이름 */
  name: string;
}

/**
 * 사용자 프로필 수정 요청
 */
export interface UserUpdateRequest {
  /** 변경할 이름 (선택사항) */
  name?: string;
  /** 현재 비밀번호 (비밀번호 변경시 필수) */
  currentPassword?: string;
  /** 새 비밀번호 (선택사항) */
  newPassword?: string;
}

/**
 * 인증 상태 정보
 */
export interface AuthState {
  /** 현재 로그인된 사용자 */
  user: User | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 인증 여부 */
  isAuthenticated: boolean;
}

/**
 * API 응답 타입들
 */
export interface LoginResponse {
  /** 로그인된 사용자 정보 */
  user: User;
  /** 액세스 토큰 */
  token: string;
}

export interface SignupResponse {
  /** 생성된 사용자 정보 */
  user: User;
  /** 이메일 확인 필요 여부 */
  emailConfirmationRequired: boolean;
}