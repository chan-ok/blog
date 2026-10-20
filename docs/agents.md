# 에이전트 작업 안내

기존 isolated cloud checkout을 사용합니다. 사용자가 요청하지 않으면 Git worktree를 만들지 않습니다. 두 저장소의 상태를 먼저 확인하고 콘텐츠 저장소의 원문·생성 인덱스를 임의로 수정하지 않습니다.

Node.js 24 / pnpm 11.18.0에서 `scripts/cloud-install.sh`로 설치합니다. 지원 startup·검증 명령은 [development.md](development.md)와 [commands.md](commands.md)에 있습니다. `VITE_GIT_RAW_URL`, SPA router, React Compiler와 임시 sharp/svgo 상위 경로 설치를 복원하지 않습니다.

모든 UI 프레임워크의 URL·locale·page 보존과 공개 정책을 검사합니다. 공통 Markdown/CSS만 공유하고 프레임워크 컴포넌트를 서로 import하지 않습니다. 빌드와 개발 서버는 공유 Astro 캐시를 쓰므로 순서대로 실행합니다.

클라우드 설치는 repository manifest·lockfile을 수정하지 않는 frozen 모드로 실행합니다. TLS·패키지 검증·release-age 정책을 끄지 않습니다. setup draft 저장은 실행·게시와 다릅니다. loopback 미리보기 링크를 사용자에게 만들지 않습니다.

배포·Build Hook·콘텐츠 커밋 고정/checkout·Netlify fallback/CSP 변경은 사용자 지시에 따라 마지막 수동 단계로 남겨 둡니다. push·merge·publish를 임의로 실행하지 않습니다.
