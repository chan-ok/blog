# 콘텐츠와 실행 경계

`.md`와 `.mdx`를 같은 Sätteri Markdown 경로로 읽습니다. MDX-to-JavaScript·eval·JS frontmatter 실행을 사용하지 않습니다. YAML 크기·중복 키·alias를 제한하고 원문은 2 MiB까지 읽습니다. raw HTML AST 노드는 제거하고 최종 HTML은 `sanitize-html` allowlist로 정화합니다.

이미지 참조는 AST에서 수집하고 vault 내부 realpath, 크기 10 MiB, PNG/JPEG/GIF/WebP/AVIF 바이트 형식을 확인합니다. 로컬 SVG는 지원하지 않습니다. 외부 이미지는 기존 HTTPS 콘텐츠/프로필 저장소와 skillicons 정책을 따릅니다. 전체 콘텐츠 저장소를 public에 복사하지 않습니다. 일반 텍스트의 내부 마커 설명은 허용하되 실제 잔여 이미지 마커 속성은 실패합니다.

About HTTPS fetch에는 기존 5초 timeout·2 MiB 응답 제한·redirect 거부·credentials omit을 유지합니다. 오류를 조용히 대체하지 않습니다.

Mermaid는 필요할 때만 로드하고 strict 설정·DOMPurify SVG profile·CSS/URL hardening을 거칩니다. 해제 시 AbortSignal로 미완료 작업을 취소하고 observer와 listener를 정리합니다.

운영에서는 공개 정책을 통과한 글의 HTML·메타데이터·참조 이미지만 출력합니다. 개발 초안 자산 staging은 새 빌드 시작 시 비우며, 클라이언트 props에 sourcePath·vault 경로·비공개 원문을 넣지 않습니다.

패키지 TLS·무결성·minimumReleaseAge 정책과 pre-push 전체 의존성 audit를 유지합니다. 실제 보안 경계는 [검증 대응표](reviews/2026-10-20-astro-implementation-validation.md)와 세 프레임워크 브라우저 fixture로 검사합니다.

배포 연결은 보류 중입니다. 기존 `netlify.toml`의 보안 헤더를 보존했으며, 마지막 배포 단계에 SPA fallback과 Astro 부트스트랩 CSP 정책을 조정해야 합니다. 이 문서는 현재 Netlify 설정이 새 UI 배포에 적합하다는 확인이 아닙니다.
