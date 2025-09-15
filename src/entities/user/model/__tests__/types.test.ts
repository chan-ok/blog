import { describe, it, expect } from 'vitest';
import type { User, UserRole, LoginRequest, SignupRequest } from '../types';

describe('사용자 타입 정의', () => {
  it('사용자 인터페이스가 올바른 속성을 가져야 한다', () => {
    const testUser: User = {
      id: 'test-uuid',
      email: 'test@example.com',
      name: '테스트 사용자',
      role: 'admin',
      createdAt: new Date('2025-01-01'),
      lastLoginAt: new Date('2025-01-15'),
    };

    expect(testUser.id).toBe('test-uuid');
    expect(testUser.email).toBe('test@example.com');
    expect(testUser.name).toBe('테스트 사용자');
    expect(testUser.role).toBe('admin');
    expect(testUser.createdAt).toBeInstanceOf(Date);
  });

  it('사용자권한 타입이 올바른 값만 허용해야 한다', () => {
    const adminRole: UserRole = 'admin';
    const userRole: UserRole = 'user';

    expect(adminRole).toBe('admin');
    expect(userRole).toBe('user');
  });

  it('로그인요청 타입이 필수 속성을 가져야 한다', () => {
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123!',
    };

    expect(loginRequest.email).toBe('test@example.com');
    expect(loginRequest.password).toBe('password123!');
  });

  it('회원가입요청 타입이 필수 속성을 가져야 한다', () => {
    const signupRequest: SignupRequest = {
      email: 'newuser@example.com',
      password: 'newpassword123!',
      name: '새 사용자',
    };

    expect(signupRequest.email).toBe('newuser@example.com');
    expect(signupRequest.password).toBe('newpassword123!');
    expect(signupRequest.name).toBe('새 사용자');
  });

  it('최종로그인일자는 선택사항이어야 한다', () => {
    const newUser: User = {
      id: 'new-user-uuid',
      email: 'newuser@example.com',
      name: '새 사용자',
      role: 'user',
      createdAt: new Date(),
      // lastLoginAt는 undefined일 수 있음
    };

    expect(newUser.lastLoginAt).toBeUndefined();
  });
});