# 구현 계획

- [x] 1. Button 컴포넌트 기본 구조 구현
  - [x] 1.1 ButtonProps 타입 정의 및 기본 컴포넌트 생성
    - `blog/src/shared/components/ui/button.tsx` 파일에 타입과 컴포넌트 구현
    - Base UI Button을 기반으로 variant, shape, className props 정의
    - _Requirements: 1.5, 2.3, 5.4, 6.1, 6.3_

- [x] 2. Variant 스타일 구현
  - [x] 2.1 variant별 스타일 상수 정의 및 적용
    - primary, default, danger, link 각 variant의 fill/outline 스타일 구현
    - clsx를 사용한 조건부 클래스 적용
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Shape 스타일 및 Link 예외 처리 구현
  - [x] 3.1 shape별 스타일 적용 및 link variant 예외 처리
    - fill, outline shape 스타일 구현
    - link variant일 때 shape 무시 로직 구현
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 4. 다크 모드 및 접근성 구현
  - [x] 4.1 다크 모드 스타일 및 접근성 기능 완성
    - 모든 variant/shape에 dark: 접두사 클래스 추가
    - focus-visible, disabled 상태 스타일 구현
    - _Requirements: 4.1, 4.2, 5.1, 5.3_

- [x] 5. Storybook Stories 작성
  - [x] 5.1 Button 컴포넌트 Stories 생성
    - `blog/src/shared/components/ui/button.stories.tsx` 파일 생성
    - 모든 variant (primary, default, danger, link) Stories
    - 모든 shape (fill, outline) Stories
    - disabled 상태 Story
    - 다크 모드 Story
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 4.1, 5.3_

- [x] 6. Checkpoint - Storybook 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Storybook 통합 테스트 (선택적)
  - [x] 7.1 Storybook Vitest 통합 테스트
    - @storybook/addon-vitest를 활용한 컴포넌트 테스트
    - 접근성(a11y) 테스트 (@storybook/addon-a11y)
    - _Requirements: 5.1, 5.2_
  - [x] 7.2 Property 테스트: Props 전달 검증
    - **Property 4: Props 전달**
    - **Validates: Requirements 5.2, 6.2, 6.3**
  - [x] 7.3 Property 테스트: 일관된 기본 스타일 적용
    - **Property 2: 일관된 기본 스타일 적용**
    - **Validates: Requirements 3.1, 3.2, 3.4**
  - [x] 7.4 Property 테스트: Link variant는 shape을 무시함
    - **Property 1: Link variant는 shape을 무시함**
    - **Validates: Requirements 2.4**
  - [x] 7.5 Property 테스트: 다크 모드 클래스 포함
    - **Property 3: 다크 모드 클래스 포함**
    - **Validates: Requirements 4.1**

- [x] 8. Final Checkpoint - 모든 테스트 통과 확인
  - Ensure all tests pass, ask the user if questions arise.
