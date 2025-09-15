import { supabase } from '@/shared/config/supabase';
import type {
  User,
  LoginRequest,
  SignupRequest,
  UserUpdateRequest,
  LoginResponse,
  SignupResponse,
} from '../model/types';

/**
 * 사용자 로그인
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: request.email,
    password: request.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('로그인에 실패했습니다');
  }

  // Supabase 사용자 데이터를 우리 도메인 모델로 변환
  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
    role: data.user.user_metadata?.role || 'user',
    createdAt: new Date(data.user.created_at!),
    lastLoginAt: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
  };

  return {
    user,
    token: data.session.access_token,
  };
}

/**
 * 사용자 로그아웃
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * 회원가입
 */
export async function signup(request: SignupRequest): Promise<SignupResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: request.email,
    password: request.password,
    options: {
      data: {
        name: request.name,
        role: 'user', // 기본값
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('회원가입에 실패했습니다');
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || request.name,
    role: data.user.user_metadata?.role || 'user',
    createdAt: new Date(data.user.created_at!),
  };

  return {
    user,
    emailConfirmationRequired: !data.user.email_confirmed_at,
  };
}

/**
 * 현재 로그인된 사용자 정보 가져오기
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
    role: data.user.user_metadata?.role || 'user',
    createdAt: new Date(data.user.created_at!),
    lastLoginAt: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
  };
}

/**
 * 사용자 정보 업데이트
 */
export async function updateUser(request: UserUpdateRequest): Promise<User> {
  const updateData: Record<string, unknown> = {};

  if (request.name) {
    updateData.data = { name: request.name };
  }

  if (request.newPassword) {
    updateData.password = request.newPassword;
  }

  const { data, error } = await supabase.auth.updateUser(updateData);

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('사용자 정보 업데이트에 실패했습니다');
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
    role: data.user.user_metadata?.role || 'user',
    createdAt: new Date(data.user.created_at!),
    lastLoginAt: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
  };
}

/**
 * 관리자 권한 부여 (시스템 관리자만 사용)
 */
export async function grantAdminRole(userId: string): Promise<void> {
  // RLS 정책에 의해 관리자만 실행 가능
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin' },
  });

  if (error) {
    throw new Error(error.message);
  }
}