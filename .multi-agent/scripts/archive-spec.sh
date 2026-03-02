#!/bin/bash
# archive-spec.sh — spec 파일을 archive/ 디렉토리로 이동
# 사용법: ./archive-spec.sh spec-blog-xxx.yaml

# PROJECT_ROOT: 스크립트 위치 기준 동적 계산 (Bash 3.2 호환)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SPECS_DIR="$PROJECT_ROOT/.multi-agent/specs"
ARCHIVE_DIR="$SPECS_DIR/archive"

# 인자 없으면 사용법 출력 후 종료
if [ -z "$1" ]; then
  echo "사용법: $0 <spec-파일명>"
  echo "예시: $0 spec-blog-xxx.yaml"
  exit 1
fi

SPEC_FILE="$1"
SPEC_PATH="$SPECS_DIR/$SPEC_FILE"

# 인자로 받은 파일이 specs/ 에 존재하는지 확인
if [ ! -f "$SPEC_PATH" ]; then
  echo "오류: 파일을 찾을 수 없습니다 — $SPEC_PATH"
  exit 1
fi

# archive/ 디렉토리 없으면 생성
if [ ! -d "$ARCHIVE_DIR" ]; then
  mkdir -p "$ARCHIVE_DIR"
fi

# 파일을 archive/ 로 이동
mv "$SPEC_PATH" "$ARCHIVE_DIR/$SPEC_FILE"

if [ $? -eq 0 ]; then
  echo "완료: $SPEC_FILE → archive/"
else
  echo "오류: 파일 이동 실패"
  exit 1
fi
