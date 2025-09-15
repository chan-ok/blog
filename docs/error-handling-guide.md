# 에러 처리 및 사용자 경험 가이드

## 📋 개요

이 문서는 블로그 애플리케이션에서 구현된 에러 처리 시스템과 사용자 경험 개선 방안에 대해 설명합니다.

## 🔄 에러 처리 아키텍처

### 1. 계층화된 에러 처리

```typescript
// Layer 1: 입력 검증
const validateInput = (formData: ContactFormData): string | null => {
  if (!formData.name.trim()) return '이름을 입력해주세요.';
  if (!formData.email.trim()) return '이메일을 입력해주세요.';
  if (!formData.privacyConsent) return '개인정보 수집에 동의해주세요.';
  return null;
};

// Layer 2: API 호출 에러
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return '네트워크 연결을 확인해주세요.';
    }
    if (error.message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    if (error.message.includes('unauthorized')) {
      return '로그인이 필요합니다.';
    }
  }
  return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};

// Layer 3: 사용자 피드백
const showUserFeedback = (type: 'success' | 'error', message: string) => {
  setFeedback({ type, message, visible: true });

  if (type === 'success') {
    setTimeout(() => setFeedback(prev => ({ ...prev, visible: false })), 3000);
  }
};
```

### 2. 에러 상태 관리

```typescript
// 통일된 에러 상태 타입
type ErrorState = {
  hasError: boolean;
  message: string;
  type: 'validation' | 'network' | 'server' | 'unknown';
  timestamp: number;
};

// 에러 상태 훅
const useErrorState = () => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: '',
    type: 'unknown',
    timestamp: 0
  });

  const setErrorMessage = (message: string, type: ErrorState['type'] = 'unknown') => {
    setError({
      hasError: true,
      message,
      type,
      timestamp: Date.now()
    });
  };

  const clearError = () => {
    setError({
      hasError: false,
      message: '',
      type: 'unknown',
      timestamp: 0
    });
  };

  return { error, setErrorMessage, clearError };
};
```

## 🔍 구체적인 에러 처리 시나리오

### 1. 연락처 폼 에러 처리

```typescript
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1단계: 클라이언트 검증
  const validationError = validateInput(formData);
  if (validationError) {
    setErrorMessage(validationError, 'validation');
    return;
  }

  setSendingStatus('sending');
  clearError();

  try {
    // 2단계: API 호출
    const { error } = await supabase.functions.invoke('contact-email', {
      body: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }
    });

    if (error) throw error;

    // 성공 처리
    setSendingStatus('success');
    resetForm();
    showUserFeedback('success', '메시지가 성공적으로 전송되었습니다!');

  } catch (error) {
    // 3단계: 에러 처리 및 사용자 피드백
    setSendingStatus('error');
    const errorMessage = handleApiError(error);
    setErrorMessage(errorMessage, 'network');

    // 에러 로깅 (프로덕션에서는 모니터링 서비스로)
    console.error('Contact form submission failed:', {
      error,
      formData: { ...formData, message: '[REDACTED]' }, // 개인정보 제거
      timestamp: new Date().toISOString()
    });
  }
};
```

### 2. 글 작성 에러 처리

```typescript
const handleSave = async () => {
  // 사전 검증
  if (!title.trim()) {
    setErrorMessage('제목을 입력해주세요.', 'validation');
    return;
  }

  setSaveStatus('saving');
  clearError();

  try {
    // 자동 저장 시뮬레이션 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 성공 시 상태 업데이트
    setSaveStatus('saved');
    setLastSaved(new Date());

    // 자동으로 상태 초기화
    setTimeout(() => setSaveStatus('idle'), 2000);

  } catch (error) {
    setSaveStatus('error');
    const errorMessage = handleApiError(error);
    setErrorMessage(errorMessage, 'server');
  }
};

const handlePublish = async () => {
  // 더 엄격한 검증
  if (!title.trim() || !content.trim()) {
    setErrorMessage('제목과 내용을 모두 입력해주세요.', 'validation');
    return;
  }

  if (content.length < 100) {
    setErrorMessage('내용이 너무 짧습니다. 최소 100자 이상 작성해주세요.', 'validation');
    return;
  }

  setPublishStatus('publishing');
  clearError();

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    setStatus('발행됨');
    setPublishStatus('published');
    setLastSaved(new Date());

    showUserFeedback('success', '글이 성공적으로 발행되었습니다!');
    setTimeout(() => setPublishStatus('idle'), 3000);

  } catch (error) {
    setPublishStatus('error');
    const errorMessage = handleApiError(error);
    setErrorMessage(errorMessage, 'server');
  }
};
```

## 🎨 사용자 인터페이스 패턴

### 1. 로딩 상태 표시

```typescript
// 버튼 내 로딩 상태
<button
  disabled={sendingStatus === 'sending'}
  className="flex items-center justify-center space-x-2"
>
  {sendingStatus === 'sending' ? (
    <>
      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      <span>전송 중...</span>
    </>
  ) : (
    '메시지 보내기'
  )}
</button>

// 전체 페이지 로딩
{sendingStatus === 'sending' && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <LoadingSpinner size="lg" text="메시지를 전송하고 있습니다..." />
  </div>
)}
```

### 2. 성공/에러 메시지 표시

```typescript
// 성공 메시지
{sendingStatus === 'success' && (
  <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
    <div className="flex items-center">
      <span className="mr-2">✅</span>
      메시지가 성공적으로 전송되었습니다! 24-48시간 내에 답변드리겠습니다.
    </div>
  </div>
)}

// 에러 메시지
{error.hasError && (
  <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
    <div className="flex items-center">
      <span className="mr-2">❌</span>
      {error.message}
    </div>
  </div>
)}
```

### 3. 폼 필드 비활성화

```typescript
<input
  type="text"
  value={formData.name}
  onChange={handleInputChange}
  disabled={sendingStatus === 'sending'}
  className={`
    w-full px-4 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error.hasError && error.type === 'validation' ? 'border-red-300' : 'border-gray-300'}
  `}
/>
```

## 🔒 보안 고려사항

### 1. 입력 검증 및 삽입화

```typescript
// 클라이언트 사이드 검증
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .slice(0, 1000) // 최대 길이 제한
    .replace(/[<>]/g, ''); // 기본적인 HTML 태그 제거
};

// 이메일 형식 검증
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// 서버 사이드에서 추가 검증 (Supabase Edge Function)
export async function handler(req: Request) {
  const { name, email, subject, message } = await req.json();

  // 서버에서 재검증
  if (!name || !email || !subject || !message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    );
  }

  // 추가 보안 검증...
}
```

### 2. 개인정보 보호

```typescript
// 로그에서 민감한 정보 제거
const logSafeData = (formData: ContactFormData) => ({
  hasName: !!formData.name,
  hasEmail: !!formData.email,
  hasSubject: !!formData.subject,
  messageLength: formData.message.length,
  consentGiven: formData.privacyConsent,
  timestamp: new Date().toISOString()
});

// 성공 후 즉시 폼 데이터 초기화
const resetForm = () => {
  setFormData({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacyConsent: false
  });
};
```

### 3. 레이트 리미팅

```typescript
// 클라이언트 사이드 기본 보호
const useRateLimit = (maxAttempts: number, timeWindow: number) => {
  const [attempts, setAttempts] = useState<number[]>([]);

  const isAllowed = (): boolean => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < timeWindow);

    setAttempts(recentAttempts);
    return recentAttempts.length < maxAttempts;
  };

  const recordAttempt = () => {
    setAttempts(prev => [...prev, Date.now()]);
  };

  return { isAllowed, recordAttempt };
};

// 사용 예
const { isAllowed, recordAttempt } = useRateLimit(3, 60000); // 1분에 3회

const handleSubmit = async () => {
  if (!isAllowed()) {
    setErrorMessage('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.', 'validation');
    return;
  }

  recordAttempt();
  // 폼 제출 로직...
};
```

## 📊 에러 모니터링 및 분석

### 1. 에러 로깅 시스템

```typescript
// 에러 로깅 유틸리티
const logError = (
  error: Error,
  context: {
    component: string;
    action: string;
    userAgent?: string;
    userId?: string;
  }
) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // 개발 환경
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }

  // 프로덕션 환경 (실제로는 모니터링 서비스로)
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket 등으로 전송
    // sendToMonitoringService(errorLog);
  }
};
```

### 2. 사용자 행동 분석

```typescript
// 사용자 상호작용 추적
const trackUserAction = (action: string, data?: Record<string, any>) => {
  const event = {
    action,
    timestamp: new Date().toISOString(),
    data,
    sessionId: getSessionId(),
    page: window.location.pathname
  };

  // 분석 도구로 전송 (Google Analytics 등)
  if (typeof gtag !== 'undefined') {
    gtag('event', action, data);
  }
};

// 사용 예
const handleFormSubmit = async () => {
  trackUserAction('contact_form_submit_attempt');

  try {
    await submitForm();
    trackUserAction('contact_form_submit_success');
  } catch (error) {
    trackUserAction('contact_form_submit_error', {
      errorType: error.name,
      errorMessage: error.message
    });
  }
};
```

## 🚀 성능 최적화

### 1. 에러 바운더리

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      component: 'ErrorBoundary',
      action: 'component_error',
      errorInfo: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          icon="⚠️"
          title="문제가 발생했습니다"
          description="페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
          actionText="새로고침"
          actionHref={window.location.href}
        />
      );
    }

    return this.props.children;
  }
}
```

### 2. 디바운싱과 쓰로틀링

```typescript
// 검색 입력 디바운싱
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 사용 예
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // API 호출
      searchPosts(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="검색..."
    />
  );
}
```

## 📱 접근성 고려사항

### 1. 스크린 리더 지원

```typescript
// ARIA 라벨과 상태 제공
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
  className={error.hasError ? 'block' : 'sr-only'}
>
  {error.message}
</div>

// 로딩 상태 알림
<div
  role="status"
  aria-label="메시지 전송 중"
  className={sendingStatus === 'sending' ? 'block' : 'sr-only'}
>
  메시지를 전송하고 있습니다...
</div>
```

### 2. 키보드 네비게이션

```typescript
// 키보드 이벤트 핸들링
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    // Ctrl+Enter로 폼 제출
    handleSubmit();
  }

  if (e.key === 'Escape') {
    // ESC로 에러 메시지 닫기
    clearError();
  }
};
```

## 🎯 베스트 프랙티스 체크리스트

### ✅ 에러 처리
- [ ] 모든 async 함수에 try-catch 구현
- [ ] 사용자 친화적 에러 메시지 제공
- [ ] 에러 타입별 적절한 대응 방안 제시
- [ ] 개발자용 상세 로그와 사용자용 간단 메시지 분리

### ✅ 사용자 경험
- [ ] 로딩 상태 시각적 피드백 제공
- [ ] 성공/실패 상태 명확한 표시
- [ ] 폼 제출 중 중복 제출 방지
- [ ] 비활성화된 요소에 대한 시각적 표시

### ✅ 보안
- [ ] 클라이언트 및 서버 사이드 검증
- [ ] 입력값 삽입화 처리
- [ ] 개인정보 로깅 방지
- [ ] 레이트 리미팅 구현

### ✅ 접근성
- [ ] 스크린 리더 지원
- [ ] 키보드 네비게이션
- [ ] 적절한 ARIA 라벨
- [ ] 색상 외 추가 시각적 단서 제공

---

이 가이드는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.