# 글목록 기능 가이드

블로그 글 목록 조회, 필터링, 검색 기능을 담당합니다.

## 🎯 주요 기능

### 구현 예정 기능
- 글 목록 조회 (페이지네이션)
- 태그별 필터링
- 제목/내용 검색
- 정렬 (최신순, 조회순, 제목순)
- 무한 스크롤 지원
- 글 카드 레이아웃

## 📁 컴포넌트 구조

```
src/features/글목록/
├── components/
│   ├── 글목록.tsx           # 메인 목록 컴포넌트
│   ├── 글카드.tsx           # 개별 글 카드
│   ├── 페이지네이션.tsx     # 페이지 내비게이션
│   ├── 검색필터.tsx         # 검색 및 필터
│   └── 빈상태.tsx           # 글이 없을 때 표시
├── hooks/
│   ├── use글목록.ts         # 목록 조회 로직
│   └── use검색필터.ts       # 검색/필터 로직
└── utils/
    └── 목록정렬.ts          # 정렬 유틸리티
```

## 🔧 사용 예시

### 글목록 컴포넌트
```typescript
// components/글목록.tsx
import { use글목록 } from '../hooks/use글목록';
import { 글카드 } from './글카드';
import { 페이지네이션 } from './페이지네이션';
import { 검색필터 } from './검색필터';

export function 글목록() {
  const {
    목록데이터,
    로딩중,
    검색조건,
    검색조건업데이트,
    페이지변경,
  } = use글목록();

  if (로딩중) return <div>글 목록을 불러오는 중...</div>;

  return (
    <div className="글목록-컨테이너">
      <검색필터
        현재조건={검색조건}
        변경시={검색조건업데이트}
      />

      <div className="글카드-그리드">
        {목록데이터?.글목록.map((글) => (
          <글카드 key={글.아이디} 글정보={글} />
        ))}
      </div>

      {목록데이터 && (
        <페이지네이션
          현재페이지={목록데이터.현재페이지}
          총페이지수={목록데이터.총페이지수}
          페이지변경시={페이지변경}
        />
      )}
    </div>
  );
}
```

### 글카드 컴포넌트
```typescript
// components/글카드.tsx
import { Link } from '@tanstack/react-router';
import { 블로그글목록항목 } from '@/entities/블로그글/model/types';

interface 글카드Props {
  글정보: 블로그글목록항목;
}

export function 글카드({ 글정보 }: 글카드Props) {
  return (
    <article className="글카드">
      {글정보.추천이미지URL && (
        <img
          src={글정보.추천이미지URL}
          alt={글정보.제목}
          className="글카드-이미지"
          loading="lazy"
        />
      )}

      <div className="글카드-내용">
        <h2 className="글카드-제목">
          <Link to={`/posts/${글정보.슬러그}`}>
            {글정보.제목}
          </Link>
        </h2>

        <p className="글카드-요약">{글정보.요약}</p>

        <div className="글카드-메타">
          <time dateTime={글정보.발행일자.toISOString()}>
            {글정보.발행일자.toLocaleDateString()}
          </time>
          <span className="조회수">조회 {글정보.조회수}회</span>
        </div>

        <div className="글카드-태그들">
          {글정보.태그목록.map((태그) => (
            <Link
              key={태그}
              to={`/tags/${태그}`}
              className="태그-링크"
            >
              #{태그}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
```

## 📋 개발 우선순위

1. **핵심 기능**
   - [ ] 기본 목록 조회
   - [ ] 글카드 레이아웃
   - [ ] 페이지네이션
   - [ ] 반응형 그리드

2. **부가 기능**
   - [ ] 검색 기능
   - [ ] 태그 필터링
   - [ ] 정렬 옵션
   - [ ] 무한 스크롤

## 🎨 디자인 고려사항

- **그리드 레이아웃**: 데스크톱 3열, 태블릿 2열, 모바일 1열
- **이미지 최적화**: Lazy loading, 적절한 크기 조절
- **로딩 상태**: 스켈레톤 UI 또는 로딩 스피너
- **빈 상태**: 글이 없을 때 안내 메시지

상세한 데이터 조회 방법은 `/entities/블로그글/CLAUDE.md`를 참조하세요.