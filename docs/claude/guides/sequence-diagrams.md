# Sequence Diagrams

## 📊 Overall Application Flow

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant A as AuthGuard
    participant L as LoginForm
    participant H as useAuth Hook
    participant S as Supabase
    participant Q as TanStack Query

    U->>B: Access protected page
    B->>A: Route rendering
    A->>H: Check authentication status
    H->>Q: Query cached user info

    alt No cache
        Q->>S: Check current session
        S-->>Q: Return session info
        Q-->>H: Update user info
    end

    H-->>A: Return authentication status

    alt Not authenticated
        A->>L: Render login form
        L->>U: Display login screen
        U->>L: Enter email/password
        L->>S: signInWithPassword()
        S-->>L: JWT token + user info
        L->>Q: Cache user info
        Q->>A: Update authentication status
        A->>U: Display protected page
    else Authenticated
        A->>U: Display protected page
    end
```

### 2. Markdown Editor Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as MarkdownEditor
    participant P as PreviewPane
    participant R as ReactMarkdown
    participant I as ImageUploader
    participant S as Supabase Storage
    participant D as Database

    U->>E: Access editor
    E->>U: Display editor interface

    loop Real-time editing
        U->>E: Input markdown text
        E->>P: Notify content change
        P->>R: Request markdown parsing
        R-->>P: Return HTML result
        P-->>U: Update preview
    end

    alt Image upload
        U->>I: Drop/select image file
        I->>S: Upload file
        S-->>I: Return uploaded URL
        I->>E: Insert markdown image syntax
        E->>P: Update content
        P-->>U: Preview with image
    end

    alt Draft save
        U->>E: Click save button
        E->>D: Save post data (published: false)
        D-->>E: Save completion response
        E-->>U: Save success notification
    end

    alt Publish
        U->>E: Click publish button
        E->>D: Save post data (published: true)
        D-->>E: Publish completion response
        E-->>U: Publish success notification
    end
```

### 3. Error Handling Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant E as ErrorBoundary
    participant Q as TanStack Query
    participant S as Supabase
    participant M as Monitoring

    U->>C: Perform action
    C->>S: API call

    alt Network error
        S--xC: Connection failure
        C->>Q: Execute retry logic
        Q->>S: Auto retry (3 times)

        alt Retry success
            S-->>Q: Success response
            Q-->>C: Return data
            C-->>U: Display normal result
        else Retry failure
            Q-->>C: Final error
            C->>E: Propagate error
            E->>M: Error logging
            E-->>U: Display error message
        end
    end

    alt Authentication error (401)
        S-->>C: 401 Unauthorized
        C->>Q: Reset user info
        Q->>U: Auto logout
        U->>C: Redirect to login page
    end

    alt Authorization error (403)
        S-->>C: 403 Forbidden
        C-->>U: Display access denied message
    end
```

### 4. Auto-save Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as MarkdownEditor
    participant T as Timer
    participant D as Database
    participant I as Indicator

    U->>E: Start text input
    E->>T: Start debounce timer (2s)

    loop Continuous input
        U->>E: Additional text input
        E->>T: Reset timer
    end

    Note over T: No input for 2 seconds

    T->>E: Trigger auto-save
    E->>I: Display saving
    E->>D: Call draft save API

    alt Save success
        D-->>E: Save complete
        E->>I: Display save complete (3s)
        I-->>U: "Auto-saved" message
    else Save failure
        D--xE: Save failure
        E->>I: Display save failure
        I-->>U: "Save failed" warning
        E->>T: Start retry timer (10s)
    end
```

### 5. Permission-based Routing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Router
    participant A as AuthGuard
    participant H as useAuth
    participant Q as Query Client

    U->>R: Access admin page (/admin)
    R->>A: AuthGuard(requireAdmin=true)
    A->>H: Request current user info
    H->>Q: Check cached user

    alt No user info
        Q-->>H: Return null
        H-->>A: Not authenticated
        A-->>U: Redirect to login page
    else Regular user
        Q-->>H: Regular user info
        H-->>A: Insufficient permission
        A-->>U: Display access denied page
    else Administrator
        Q-->>H: Administrator info
        H-->>A: Permission confirmed
        A->>R: Render admin page
        R-->>U: Display admin dashboard
    end
```

### 6. Image Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as DropZone
    participant V as Validator
    participant P as Processor
    participant S as Supabase Storage
    participant E as Editor

    U->>D: Drag and drop image file
    D->>V: File validation

    alt Invalid file
        V-->>U: Display error message
    else Valid file
        V->>P: Start image processing
        P->>P: Resize (max 1200px)
        P->>P: Convert to WebP format
        P->>P: Compress (80% quality)

        P->>S: Upload optimized image
        S-->>P: Return upload URL

        P->>E: Insert markdown syntax
        Note over E: ![alt text](image_url)

        E-->>U: Display image in editor
    end

    alt Upload failure
        S--xP: Upload error
        P->>P: Retry 3 times

        alt Retry failure
            P-->>U: Upload failure notification
        else Retry success
            P->>E: Continue normal processing
        end
    end
```

### 7. State Synchronization Flow

```mermaid
sequenceDiagram
    participant C1 as Component1
    participant C2 as Component2
    participant Q as TanStack Query
    participant S as Supabase
    participant W as WebSocket

    Note over C1,C2: Multiple components using same data

    C1->>Q: Request post list
    Q->>S: API call
    S-->>Q: Post list data
    Q-->>C1: Return cached data

    C2->>Q: Same post list request
    Q-->>C2: Return from cache immediately

    Note over C1: User creates new post

    C1->>Q: New post creation mutation
    Q->>S: Post creation API
    S-->>Q: Created post info

    Q->>Q: Invalidate post list cache
    Q->>C1: Success response
    Q->>C2: Trigger auto refetch

    alt Real-time update (future expansion)
        S->>W: New post creation event
        W->>Q: Real-time cache update
        Q->>C2: Immediate UI update
    end
```

### 8. Error Recovery Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant E as ErrorBoundary
    participant S as State Management
    participant L as LocalStorage
    participant R as Recovery

    U->>A: Perform action
    A--xE: JavaScript error occurs
    E->>E: Catch error
    E->>S: Backup current state
    S->>L: Save state locally

    E->>R: Start recovery process

    alt Auto recovery possible
        R->>S: Rollback to safe state
        S->>A: Restore state
        A-->>U: Display normal screen
        Note over U: "Temporary error recovered"
    else Manual recovery needed
        R-->>U: Error screen + recovery options
        U->>R: Click "Retry" button
        R->>L: Restore backed up state
        L->>S: Load state
        S->>A: Restart app
        A-->>U: Start with recovered state
    else Complete restart needed
        R-->>U: Critical error message
        U->>R: Click "Refresh" button
        R->>A: window.location.reload()
    end
```