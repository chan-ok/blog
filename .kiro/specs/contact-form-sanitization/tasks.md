# 구현 계획

- [x] 1. 의존성 설치 및 sanitizer 유틸리티 구현
  - [x] 1.1 isomorphic-dompurify 패키지 설치
    - `pnpm add isomorphic-dompurify` 실행
    - _요구사항: 4.1, 4.2_
  - [x] 1.2 sanitizeInput 함수 구현
    - `shared/util/sanitize.ts` 파일 생성
    - DOMPurify.sanitize를 ALLOWED_TAGS: [] 옵션으로 래핑
    - _요구사항: 1.1, 1.2, 1.3, 4.2_
  - [x] 1.3 Property 1 테스트 작성: HTML 태그 제거
    - **Property 1: HTML 태그 제거**
    - **검증: 요구사항 1.1, 1.2, 1.3**
  - [x] 1.4 Property 2 테스트 작성: 안전한 콘텐츠 보존
    - **Property 2: 안전한 콘텐츠 보존**
    - **검증: 요구사항 1.4, 2.2**
  - [x] 1.5 Property 3 테스트 작성: 멱등성
    - **Property 3: 멱등성**
    - **검증: 요구사항 2.3**

- [x] 2. Contact Form 스키마에 sanitization 통합
  - [x] 2.1 ContactFormInputsSchema 수정
    - subject, message 필드에 .transform(sanitizeInput) 추가
    - _요구사항: 2.1, 2.2_
  - [x] 2.2 스키마 통합 테스트 작성
    - XSS 패턴이 포함된 입력이 소독되는지 검증
    - _요구사항: 1.1, 1.2, 3.2_

- [x] 3. 체크포인트 - 모든 테스트 통과 확인
  - 모든 테스트가 통과하는지 확인하고, 문제가 있으면 사용자에게 질문
