# 문제 해결 가이드

## 🧭 의사 결정 트리

### 메인 문제 분류 트리

```mermaid
flowchart TD
    A[사용자 문제 신고] --> B{문제 유형은?}

    B -->|인증/로그인| C[인증 문제 트리]
    B -->|에디터/편집| D[에디터 문제 트리]
    B -->|성능/속도| E[성능 문제 트리]
    B -->|기타/버그| F[일반 문제 트리]

    C --> C1{에러 메시지 확인}
    C1 -->|"잘못된 자격 증명"| C2[비밀번호 재설정]
    C1 -->|"네트워크 에러"| C3[연결 상태 확인]
    C1 -->|"세션 만료"| C4[재로그인 유도]
    C1 -->|"권한 없음"| C5[관리자 권한 확인]

    D --> D1{어떤 기능?}
    D1 -->|텍스트 입력| D2[에디터 입력 문제]
    D1 -->|이미지 업로드| D3[파일 업로드 문제]
    D1 -->|저장/발행| D4[데이터 저장 문제]
    D1 -->|미리보기| D5[렌더링 문제]

    E --> E1{성능 지표 확인}
    E1 -->|로딩 느림| E2[네트워크 최적화]
    E1 -->|메모리 부족| E3[메모리 정리]
    E1 -->|UI 끊김| E4[렌더링 최적화]

    F --> F1{브라우저 환경}
    F1 -->|Chrome/Edge| F2[표준 브라우저 해결]
    F1 -->|Safari| F3[Safari 특화 해결]
    F1 -->|모바일| F4[모바일 최적화]
```

### 인증 문제 해결 트리

```mermaid
flowchart TD
    A[인증 문제 발생] --> B{로그인 화면 표시되는가?}

    B -->|Yes| C{이메일/비밀번호 입력했는가?}
    B -->|No| D[페이지 새로고침]

    C -->|Yes| E{에러 메시지 있는가?}
    C -->|No| F[입력 필드 확인]

    E -->|"잘못된 자격 증명"| G[비밀번호 확인]
    E -->|"네트워크 에러"| H[인터넷 연결 확인]
    E -->|"서버 에러"| I[Supabase 상태 확인]

    G --> G1{비밀번호 확실한가?}
    G1 -->|Yes| G2[계정 상태 확인]
    G1 -->|No| G3[비밀번호 재설정]

    H --> H1{인터넷 연결됨?}
    H1 -->|Yes| H2[방화벽/프록시 확인]
    H1 -->|No| H3[네트워크 재연결]

    I --> I1[Supabase 대시보드 확인]
    I1 --> I2{서비스 정상?}
    I2 -->|Yes| I3[API 키 확인]
    I2 -->|No| I4[서비스 복구 대기]

    D --> D1{새로고침 후 해결?}
    D1 -->|Yes| D2[완료]
    D1 -->|No| D3[브라우저 캐시 삭제]

    F --> F1[플레이스홀더 텍스트 확인]
    F1 --> F2{올바른 형식?}
    F2 -->|Yes| F3[브라우저 개발자 도구 확인]
    F2 -->|No| F4[이메일 형식 안내]
```

### 에디터 문제 해결 트리

```mermaid
flowchart TD
    A[에디터 문제 발생] --> B{어떤 기능에서?}

    B -->|텍스트 입력| C[입력 문제 진단]
    B -->|이미지 업로드| D[업로드 문제 진단]
    B -->|저장/발행| E[저장 문제 진단]
    B -->|미리보기| F[렌더링 문제 진단]

    C --> C1{텍스트가 입력되는가?}
    C1 -->|No| C2[입력 필드 포커스 확인]
    C1 -->|Yes| C3{한글 입력 문제?}

    C2 --> C4[클릭하여 포커스]
    C3 -->|Yes| C5[IME 설정 확인]
    C3 -->|No| C6{특수문자 문제?}

    D --> D1{파일 선택했는가?}
    D1 -->|No| D2[파일 선택 안내]
    D1 -->|Yes| D3{파일 형식 올바른가?}

    D3 -->|No| D4[지원 형식 안내]
    D3 -->|Yes| D5{파일 크기 적절한가?}

    D5 -->|No| D6[파일 크기 압축]
    D5 -->|Yes| D7{네트워크 상태 양호?}

    E --> E1{저장 버튼 클릭했는가?}
    E1 -->|No| E2[저장 방법 안내]
    E1 -->|Yes| E3{로딩 표시 나타나는가?}

    E3 -->|No| E4[JavaScript 에러 확인]
    E3 -->|Yes| E5{시간 초과?}

    F --> F1{미리보기 영역 보이는가?}
    F1 -->|No| F2[화면 크기 확인]
    F1 -->|Yes| F3{내용이 반영되는가?}

    F3 -->|No| F4[마크다운 문법 확인]
    F3 -->|Yes| F5{스타일 깨짐?}
```

### 성능 문제 해결 트리

```mermaid
flowchart TD
    A[성능 문제 신고] --> B{어떤 성능 문제?}

    B -->|로딩 느림| C[로딩 성능 진단]
    B -->|반응 느림| D[UI 반응성 진단]
    B -->|메모리 부족| E[메모리 사용량 진단]

    C --> C1{첫 로딩인가?}
    C1 -->|Yes| C2[초기 번들 크기 확인]
    C1 -->|No| C3[캐시 상태 확인]

    C2 --> C4{번들 크기 적절?}
    C4 -->|No| C5[코드 분할 적용]
    C4 -->|Yes| C6[네트워크 속도 확인]

    C3 --> C7{캐시 적중률 높음?}
    C7 -->|No| C8[캐시 설정 최적화]
    C7 -->|Yes| C9[서버 응답 시간 확인]

    D --> D1{어떤 상호작용?}
    D1 -->|텍스트 입력| D2[입력 반응성 확인]
    D1 -->|버튼 클릭| D3[이벤트 처리 확인]
    D1 -->|스크롤| D4[스크롤 성능 확인]

    D2 --> D5{debounce 적용됨?}
    D5 -->|No| D6[debounce 구현]
    D5 -->|Yes| D7[렌더링 최적화]

    E --> E1[메모리 사용량 측정]
    E1 --> E2{임계값 초과?}
    E2 -->|Yes| E3[메모리 누수 확인]
    E2 -->|No| E4[브라우저 리소스 확인]

    E3 --> E5{리스너 정리됨?}
    E5 -->|No| E6[cleanup 함수 추가]
    E5 -->|Yes| E7[큰 객체 참조 확인]
```

## 🔧 단계별 해결 가이드

### 1단계: 기본 진단

#### 환경 확인 체크리스트
```bash
# 브라우저 정보
console.log('User Agent:', navigator.userAgent);
console.log('Online:', navigator.onLine);
console.log('Language:', navigator.language);

# 로컬 스토리지 상태
console.log('LocalStorage 항목:', Object.keys(localStorage));
console.log('SessionStorage 항목:', Object.keys(sessionStorage));

# Supabase 연결 상태
const { data } = await supabase.auth.getSession();
console.log('Supabase 세션:', data.session ? '활성' : '비활성');
```

#### 네트워크 진단
```javascript
// 네트워크 상태 확인
const 네트워크진단 = async () => {
  try {
    const response = await fetch('https://api.github.com/zen', {
      method: 'GET',
      mode: 'cors'
    });
    console.log('네트워크 상태:', response.ok ? '정상' : '불안정');
  } catch (error) {
    console.error('네트워크 연결 실패:', error.message);
  }
};
```

### 2단계: 컴포넌트별 진단

#### 인증 컴포넌트 진단
```typescript
const 인증진단도구 = {
  현재상태확인: () => {
    const { 사용자, 로딩중, 인증됨 } = useAuth();
    console.table({ 사용자: !!사용자, 로딩중, 인증됨 });
  },

  세션확인: async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log('세션 데이터:', data);
    console.log('세션 에러:', error);
  },

  토큰확인: async () => {
    const { data } = await supabase.auth.getUser();
    console.log('토큰 유효성:', data.user ? '유효' : '무효');
  }
};
```

#### 에디터 컴포넌트 진단
```typescript
const 에디터진단도구 = {
  상태확인: (에디터상태) => {
    console.table({
      내용길이: 에디터상태.마크다운내용.length,
      변경사항: 에디터상태.변경사항있음,
      자동저장중: 에디터상태.자동저장중,
      마지막저장: 에디터상태.마지막저장시간
    });
  },

  마크다운파싱테스트: (내용) => {
    try {
      // ReactMarkdown 렌더링 테스트
      const div = document.createElement('div');
      ReactDOM.render(<ReactMarkdown>{내용}</ReactMarkdown>, div);
      console.log('마크다운 파싱: 성공');
    } catch (error) {
      console.error('마크다운 파싱 실패:', error);
    }
  },

  이미지업로드테스트: async (file) => {
    try {
      const result = await supabase.storage
        .from('blog-images')
        .upload(`test-${Date.now()}.jpg`, file);
      console.log('이미지 업로드:', result.error ? '실패' : '성공');
    } catch (error) {
      console.error('업로드 에러:', error);
    }
  }
};
```

### 3단계: 자동 복구 시도

#### 캐시 정리
```typescript
const 캐시정리 = () => {
  // TanStack Query 캐시 정리
  queryClient.clear();

  // 브라우저 캐시 정리
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }

  // 로컬 스토리지 정리 (민감하지 않은 데이터만)
  const 보존목록 = ['supabase.auth.token'];
  Object.keys(localStorage).forEach(key => {
    if (!보존목록.some(item => key.includes(item))) {
      localStorage.removeItem(key);
    }
  });
};
```

#### 상태 재초기화
```typescript
const 상태재초기화 = async () => {
  // 인증 상태 재확인
  const { data } = await supabase.auth.refreshSession();
  if (data.session) {
    queryClient.setQueryData(['현재사용자'], data.user);
  }

  // 에디터 상태 초기화
  set에디터상태({
    현재글: null,
    마크다운내용: '',
    변경사항있음: false,
    자동저장중: false,
  });

  // 컴포넌트 강제 리렌더링
  window.location.reload();
};
```

### 4단계: 고급 진단

#### 성능 프로파일링
```typescript
const 성능프로파일링 = {
  메모리사용량: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        사용중: `${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
        전체: `${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
        한계: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`,
        사용률: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`
      };
    }
    return null;
  },

  렌더링성능: () => {
    let 프레임카운트 = 0;
    const 시작시간 = performance.now();

    const 측정 = () => {
      프레임카운트++;
      const 경과시간 = performance.now() - 시작시간;

      if (경과시간 >= 1000) {
        const fps = Math.round((프레임카운트 * 1000) / 경과시간);
        console.log(`FPS: ${fps}`);
        return fps;
      }

      requestAnimationFrame(측정);
    };

    requestAnimationFrame(측정);
  },

  번들크기분석: () => {
    const 스크립트들 = Array.from(document.querySelectorAll('script[src]'));
    스크립트들.forEach(script => {
      fetch(script.src, { method: 'HEAD' })
        .then(response => {
          const 크기 = response.headers.get('content-length');
          console.log(`${script.src}: ${크기 ? `${(parseInt(크기) / 1024).toFixed(1)}KB` : '알 수 없음'}`);
        });
    });
  }
};
```

#### 에러 로깅 시스템
```typescript
const 에러로깅시스템 = {
  설정: {
    최대로그수: 100,
    로그레벨: ['error', 'warn', 'info'],
    자동전송: true
  },

  로그저장소: [] as Array<{
    시간: string;
    레벨: string;
    메시지: string;
    스택: string;
    브라우저정보: string;
  }>,

  로그추가: function(레벨: string, 메시지: string, 에러?: Error) {
    const 로그항목 = {
      시간: new Date().toISOString(),
      레벨,
      메시지,
      스택: 에러?.stack || '',
      브라우저정보: navigator.userAgent
    };

    this.로그저장소.push(로그항목);

    // 최대 개수 초과 시 오래된 로그 제거
    if (this.로그저장소.length > this.설정.최대로그수) {
      this.로그저장소.shift();
    }

    // 자동 전송 (실제 구현에서는 외부 서비스로)
    if (this.설정.자동전송 && 레벨 === 'error') {
      this.에러전송(로그항목);
    }
  },

  에러전송: async function(로그항목: any) {
    try {
      // 실제 구현에서는 Sentry, LogRocket 등으로 전송
      console.log('에러 전송:', 로그항목);
    } catch (error) {
      console.error('에러 전송 실패:', error);
    }
  },

  로그내보내기: function() {
    const 데이터 = JSON.stringify(this.로그저장소, null, 2);
    const blob = new Blob([데이터], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// 전역 에러 핸들러 등록
window.addEventListener('error', (event) => {
  에러로깅시스템.로그추가('error', event.message, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  에러로깅시스템.로그추가('error', `Promise 거부: ${event.reason}`);
});
```

## 📞 에스컬레이션 가이드

### 문제 심각도 분류

#### P0: 치명적 (즉시 대응)
- 애플리케이션 전체 다운
- 데이터 손실 발생
- 보안 취약점 발견

**대응 절차:**
1. 즉시 서비스 중단 (필요시)
2. 기술팀 긴급 소집
3. 임시 해결책 적용
4. 사용자 공지

#### P1: 중요 (2시간 내 대응)
- 주요 기능 작동 불가
- 다수 사용자 영향
- 성능 심각한 저하

**대응 절차:**
1. 문제 범위 파악
2. 임시 우회 방법 제공
3. 수정 계획 수립
4. 정기 업데이트 제공

#### P2: 보통 (24시간 내 대응)
- 일부 기능 문제
- 소수 사용자 영향
- 사용성 불편

**대응 절차:**
1. 문제 재현 및 분석
2. 해결 우선순위 결정
3. 다음 릴리스에 포함

#### P3: 낮음 (주간 대응)
- 개선 요청
- 마이너 버그
- 문서 오류

### 연락처 및 도구

```typescript
const 지원도구 = {
  브라우저콘솔: {
    설명: '개발자 도구 콘솔에서 진단 명령 실행',
    단축키: 'F12 또는 Ctrl+Shift+I',
    명령어: [
      '인증진단도구.현재상태확인()',
      '에디터진단도구.상태확인(에디터상태)',
      '성능프로파일링.메모리사용량()',
      '에러로깅시스템.로그내보내기()'
    ]
  },

  원격진단: {
    설명: '원격으로 사용자 환경 진단',
    접근방법: 'Chrome DevTools Protocol',
    필요권한: '사용자 동의 후 임시 접근'
  },

  로그수집: {
    설명: '자동 에러 로그 수집 시스템',
    저장위치: 'Supabase 로그 테이블',
    보관기간: '30일'
  }
};
```

## 📚 FAQ

### Q: 로그인 후 바로 로그아웃되는 경우
**A:** 세션 쿠키 설정 문제일 가능성이 높습니다.

```javascript
// 해결 방법
1. 브라우저 쿠키 설정 확인
2. 사이트 데이터 삭제 후 재시도
3. 시크릿 모드에서 테스트
4. 브라우저 업데이트 확인
```

### Q: 이미지 업로드가 안 되는 경우
**A:** 파일 크기, 형식, 네트워크 상태를 순서대로 확인하세요.

```javascript
// 진단 명령
console.log('파일 크기:', file.size, '(최대: 5MB)');
console.log('파일 형식:', file.type, '(허용: image/*)');
navigator.onLine && console.log('네트워크 연결됨');
```

### Q: 미리보기가 업데이트되지 않는 경우
**A:** React 상태 업데이트 문제일 수 있습니다.

```javascript
// 강제 리렌더링
setMarkdownContent(prev => prev + ' ');
setTimeout(() => setMarkdownContent(prev => prev.slice(0, -1)), 0);
```

### Q: 자동저장이 작동하지 않는 경우
**A:** debounce 타이머와 네트워크 상태를 확인하세요.

```javascript
// 수동 저장 테스트
handle저장(); // 즉시 저장 시도
console.log('마지막 자동저장:', 마지막저장시간);
```

이 가이드를 통해 대부분의 문제를 체계적으로 해결할 수 있으며, 복잡한 문제의 경우 단계별 에스컬레이션을 통해 신속한 해결이 가능합니다.