-- ============================================================================
-- Blog 프로젝트 초기 설정
-- 파일명: 20240101000000_init_blog.sql
-- ============================================================================

ALTER DEFAULT PRIVILEGES -- 기본 권한을 변경
REVOKE EXECUTE           -- 실행 권한을 제거
ON FUNCTIONS            -- 함수들에 대해
FROM PUBLIC;            -- PUBLIC 역할로부터

-- ============================================================================
-- 1. Storage Bucket 생성
-- ============================================================================

-- blog-images 버킷 생성 (공개적으로 접근 가능)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'blog-images', 
  'blog-images', 
  true,
  5242880, -- 5MB 제한
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. 블로그 포스트 테이블 생성
-- ============================================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (LENGTH(title) > 0),
  slug TEXT UNIQUE NOT NULL CHECK (LENGTH(slug) > 0),
  content TEXT NOT NULL CHECK (LENGTH(content) > 0),
  excerpt TEXT,
  cover_image_path TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. 인덱스 생성
-- ============================================================================

-- 검색 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS posts_metadata_idx ON posts USING GIN(metadata);

-- 전문 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content)
);

-- ============================================================================
-- 4. RLS 정책 설정
-- ============================================================================

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게시된 글을 조회할 수 있음
CREATE POLICY "Anyone can view published posts" ON posts
  FOR SELECT USING (published = true);

-- 인증된 사용자는 모든 글을 조회할 수 있음 (관리자용)
CREATE POLICY "Authenticated users can view all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 작성자만 자신의 글을 수정할 수 있음
CREATE POLICY "Authors can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- 작성자만 자신의 글을 삭제할 수 있음
CREATE POLICY "Authors can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- 인증된 사용자만 새 글을 작성할 수 있음
CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- ============================================================================
-- 5. Storage 정책 설정
-- ============================================================================

-- 인증된 사용자만 이미지 업로드 가능
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND 
    auth.role() = 'authenticated'
  );

-- 모든 사용자가 이미지 조회 가능
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- 업로드한 사용자만 이미지 수정/삭제 가능
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 6. 트리거 함수 생성
-- ============================================================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- posts 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. 유틸리티 함수들
-- ============================================================================

-- slug 생성 함수
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_text, '[^a-zA-Z0-9가-힣\s]', '', 'g'),
        '\s+', '-', 'g'
      ), 
      '-'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 발행일 자동 설정 함수
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- 발행 상태가 false에서 true로 변경될 때만 발행일 설정
  IF OLD.published = FALSE AND NEW.published = TRUE AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  
  -- 발행 취소 시 발행일 삭제
  IF OLD.published = TRUE AND NEW.published = FALSE THEN
    NEW.published_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- posts 테이블에 발행일 트리거 적용
CREATE TRIGGER set_posts_published_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION set_published_at();

-- ============================================================================
-- 8. 검색 함수
-- ============================================================================

-- 블로그 글 검색 함수
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  cover_image_path TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  author_id UUID,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.cover_image_path,
    p.tags,
    p.published_at,
    p.author_id,
    ts_rank(
      to_tsvector('english', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM posts p
  WHERE 
    p.published = true AND
    to_tsvector('english', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content) 
    @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, p.published_at DESC;
END;
$$ LANGUAGE plpgsql;