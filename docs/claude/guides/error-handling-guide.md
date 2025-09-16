# Error Handling and User Experience Guide

## 📋 Overview

This document explains the error handling system implemented in the blog application and approaches for improving user experience.

## 🔄 Error Handling Architecture

### 1. Layered Error Handling

```typescript
// Layer 1: Input Validation
const validateInput = (formData: ContactFormData): string | null => {
  if (!formData.name.trim()) return 'Please enter your name.';
  if (!formData.email.trim()) return 'Please enter your email.';
  if (!formData.privacyConsent) return 'Please consent to privacy policy.';
  return null;
};

// Layer 2: API Call Errors
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return 'Please check your network connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('unauthorized')) {
      return 'Login required.';
    }
  }
  return 'A temporary error occurred. Please try again later.';
};

// Layer 3: User Feedback
const showUserFeedback = (type: 'success' | 'error', message: string) => {
  setFeedback({ type, message, visible: true });

  if (type === 'success') {
    setTimeout(() => setFeedback(prev => ({ ...prev, visible: false })), 3000);
  }
};
```

### 2. Error State Management

```typescript
// Unified error state type
type ErrorState = {
  hasError: boolean;
  message: string;
  type: 'validation' | 'network' | 'server' | 'unknown';
  timestamp: number;
};

// Error state hook
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

## 🔍 Specific Error Handling Scenarios

### 1. Contact Form Error Handling

```typescript
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Step 1: Client validation
  const validationError = validateInput(formData);
  if (validationError) {
    setErrorMessage(validationError, 'validation');
    return;
  }

  setSendingStatus('sending');
  clearError();

  try {
    // Step 2: API call
    const { error } = await supabase.functions.invoke('contact-email', {
      body: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }
    });

    if (error) throw error;

    // Success handling
    setSendingStatus('success');
    resetForm();
    showUserFeedback('success', 'Message sent successfully!');

  } catch (error) {
    // Step 3: Error handling and user feedback
    setSendingStatus('error');
    const errorMessage = handleApiError(error);
    setErrorMessage(errorMessage, 'network');

    // Error logging (to monitoring service in production)
    console.error('Contact form submission failed:', {
      error,
      formData: { ...formData, message: '[REDACTED]' }, // Remove personal info
      timestamp: new Date().toISOString()
    });
  }
};
```

### 2. Post Writing Error Handling

```typescript
const handleSave = async () => {
  // Pre-validation
  if (!title.trim()) {
    setErrorMessage('Please enter a title.', 'validation');
    return;
  }

  setSaveStatus('saving');
  clearError();

  try {
    // Auto-save simulation (actual API call in real scenario)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update status on success
    setSaveStatus('saved');
    setLastSaved(new Date());

    // Automatically reset status
    setTimeout(() => setSaveStatus('idle'), 2000);

  } catch (error) {
    setSaveStatus('error');
    const errorMessage = handleApiError(error);
    setErrorMessage(errorMessage, 'server');
  }
};

const handlePublish = async () => {
  // Stricter validation
  if (!title.trim() || !content.trim()) {
    setErrorMessage('Please enter both title and content.', 'validation');
    return;
  }

  if (content.length < 100) {
    setErrorMessage('Content too short. Please write at least 100 characters.', 'validation');
    return;
  }

  setPublishStatus('publishing');
  clearError();

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    setStatus('Published');
    setPublishStatus('published');
    setLastSaved(new Date());

    showUserFeedback('success', 'Post published successfully!');
    setTimeout(() => setPublishStatus('idle'), 3000);

  } catch (error) {
    setPublishStatus('error');
    const errorMessage = handleApiError(error);
    setErrorMessage(errorMessage, 'server');
  }
};
```

## 🎨 User Interface Patterns

### 1. Loading State Display

```typescript
// Loading state in button
<button
  disabled={sendingStatus === 'sending'}
  className="flex items-center justify-center space-x-2"
>
  {sendingStatus === 'sending' ? (
    <>
      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      <span>Sending...</span>
    </>
  ) : (
    'Send Message'
  )}
</button>

// Full page loading
{sendingStatus === 'sending' && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <LoadingSpinner size="lg" text="Sending your message..." />
  </div>
)}
```

### 2. Success/Error Message Display

```typescript
// Success message
{sendingStatus === 'success' && (
  <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
    <div className="flex items-center">
      <span className="mr-2">✅</span>
      Message sent successfully! We'll respond within 24-48 hours.
    </div>
  </div>
)}

// Error message
{error.hasError && (
  <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
    <div className="flex items-center">
      <span className="mr-2">❌</span>
      {error.message}
    </div>
  </div>
)}
```

### 3. Form Field Disabling

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

## 🔒 Security Considerations

### 1. Input Validation and Sanitization

```typescript
// Client-side validation
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .slice(0, 1000) // Maximum length limit
    .replace(/[<>]/g, ''); // Remove basic HTML tags
};

// Email format validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Additional validation on server side (Supabase Edge Function)
export async function handler(req: Request) {
  const { name, email, subject, message } = await req.json();

  // Re-validate on server
  if (!name || !email || !subject || !message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    );
  }

  // Additional security validation...
}
```

### 2. Privacy Protection

```typescript
// Remove sensitive information from logs
const logSafeData = (formData: ContactFormData) => ({
  hasName: !!formData.name,
  hasEmail: !!formData.email,
  hasSubject: !!formData.subject,
  messageLength: formData.message.length,
  consentGiven: formData.privacyConsent,
  timestamp: new Date().toISOString()
});

// Immediately reset form data after success
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

### 3. Rate Limiting

```typescript
// Basic client-side protection
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

// Usage example
const { isAllowed, recordAttempt } = useRateLimit(3, 60000); // 3 times per minute

const handleSubmit = async () => {
  if (!isAllowed()) {
    setErrorMessage('Too many requests. Please try again later.', 'validation');
    return;
  }

  recordAttempt();
  // Form submission logic...
};
```

## 📊 Error Monitoring and Analysis

### 1. Error Logging System

```typescript
// Error logging utility
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

  // Development environment
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }

  // Production environment (send to monitoring service)
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
    // sendToMonitoringService(errorLog);
  }
};
```

### 2. User Behavior Analysis

```typescript
// Track user interactions
const trackUserAction = (action: string, data?: Record<string, any>) => {
  const event = {
    action,
    timestamp: new Date().toISOString(),
    data,
    sessionId: getSessionId(),
    page: window.location.pathname
  };

  // Send to analytics tools (Google Analytics, etc.)
  if (typeof gtag !== 'undefined') {
    gtag('event', action, data);
  }
};

// Usage example
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

## 🚀 Performance Optimization

### 1. Error Boundary

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
          title="Something went wrong"
          description="Please refresh the page or try again later."
          actionText="Refresh"
          actionHref={window.location.href}
        />
      );
    }

    return this.props.children;
  }
}
```

### 2. Debouncing and Throttling

```typescript
// Search input debouncing
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

// Usage example
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // API call
      searchPosts(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## 📱 Accessibility Considerations

### 1. Screen Reader Support

```typescript
// Provide ARIA labels and states
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
  className={error.hasError ? 'block' : 'sr-only'}
>
  {error.message}
</div>

// Loading state notification
<div
  role="status"
  aria-label="Sending message"
  className={sendingStatus === 'sending' ? 'block' : 'sr-only'}
>
  Sending your message...
</div>
```

### 2. Keyboard Navigation

```typescript
// Keyboard event handling
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    // Submit form with Ctrl+Enter
    handleSubmit();
  }

  if (e.key === 'Escape') {
    // Close error message with ESC
    clearError();
  }
};
```

## 🎯 Best Practices Checklist

### ✅ Error Handling
- [ ] Implement try-catch in all async functions
- [ ] Provide user-friendly error messages
- [ ] Offer appropriate solutions for each error type
- [ ] Separate detailed developer logs from simple user messages

### ✅ User Experience
- [ ] Provide visual feedback for loading states
- [ ] Clearly display success/failure states
- [ ] Prevent duplicate submissions during form submission
- [ ] Visual indication for disabled elements

### ✅ Security
- [ ] Client and server-side validation
- [ ] Input sanitization handling
- [ ] Prevent personal information logging
- [ ] Implement rate limiting

### ✅ Accessibility
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] Appropriate ARIA labels
- [ ] Additional visual cues beyond color

---

This guide will be continuously updated as the project progresses.