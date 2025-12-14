# 구현 계획

- [x] 1. i18n 기반 설정 구축
  - [x] 1.1 react-i18next 및 i18next 패키지 설치
    - `pnpm add react-i18next i18next`
    - _요구사항: 4.3_
  - [x] 1.2 i18n 설정 파일 생성 (`shared/config/i18n/index.ts`)
    - i18next 초기화 및 react-i18next 연동
    - fallbackLng: 'ko' 설정
    - _요구사항: 4.2, 4.4_
  - [x] 1.3 번역 키 타입 정의 (`shared/config/i18n/types.ts`)
    - TypeScript 타입으로 번역 키 자동완성 지원
    - _요구사항: 4.1_
  - [x] 1.4 Zod 스키마 생성 (`shared/config/i18n/schema.ts`)
    - TranslationResourceSchema 정의
    - 필수 키 검증 로직
    - _요구사항: 5.1, 5.2_

- [x] 2. 번역 리소스 파일 생성
  - [x] 2.1 한국어 번역 파일 생성 (`shared/config/i18n/locales/ko.json`)
    - nav, about, contact 네임스페이스 구성
    - _요구사항: 1.3, 2.2, 3.1, 3.2, 3.3, 3.4_
  - [x] 2.2 영어 번역 파일 생성 (`shared/config/i18n/locales/en.json`)
    - _요구사항: 1.5, 2.3_
  - [x] 2.3 일본어 번역 파일 생성 (`shared/config/i18n/locales/ja.json`)
    - _요구사항: 1.4, 2.4_
  - [x] 2.4 속성 테스트 작성: 번역 키 완전성
    - **Property 1: 번역 키 완전성**
    - **검증: 요구사항 1.1, 2.1, 3.1, 3.2, 3.3, 3.4**
    - 모든 locale에 대해 스키마 검증 통과 확인
  - [x] 2.5 속성 테스트 작성: 라운드트립 일관성
    - **Property 3: 라운드트립 일관성**
    - **검증: 요구사항 5.2**
    - JSON 직렬화/역직렬화 동등성 확인

- [x] 3. LocaleProvider 확장
  - [x] 3.1 LocaleProvider에 I18nextProvider 통합
    - 기존 `shared/providers/locale-provider.tsx` 수정
    - i18n.changeLanguage() 호출 추가
    - _요구사항: 1.2, 4.3_
  - [x] 3.2 속성 테스트 작성: 폴백 동작
    - **Property 2: 폴백 동작**
    - **검증: 요구사항 4.2**
    - 누락된 키에 대해 기본 locale 값 반환 확인

- [x] 4. Checkpoint - 테스트 통과 확인
  - 모든 테스트가 통과하는지 확인, 문제 발생 시 사용자에게 질문

- [x] 5. Header 컴포넌트 다국어 적용
  - [x] 5.1 Header에 useTranslation 훅 적용
    - 메뉴 라벨(About, Posts, Contact)을 번역 키로 교체
    - _요구사항: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. AboutBlock 컴포넌트 다국어 적용
  - [x] 6.1 AboutBlock에 useTranslation 훅 적용
    - 인사말과 소개 텍스트를 번역 키로 교체
    - aria-label 다국어 처리
    - _요구사항: 2.1, 2.2, 2.3, 2.4_

- [x] 7. ContactForm 컴포넌트 다국어 적용
  - [x] 7.1 ContactForm에 useTranslation 훅 적용
    - 폼 라벨, placeholder, 버튼 상태 번역 키로 교체
    - _요구사항: 3.1, 3.2, 3.3, 3.4_

- [x] 8. Final Checkpoint - 모든 테스트 통과 확인
  - 모든 테스트가 통과하는지 확인, 문제 발생 시 사용자에게 질문
