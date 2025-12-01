import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

function getAllMdxFiles(dir: string): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 재귀적으로 하위 폴더 탐색
      results.push(...getAllMdxFiles(fullPath));
    } else if (item.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }

  return results;
}

export default function generateIndexJson(locale: 'ko' | 'en' | 'ja') {
  console.log('Generating posts-index/' + locale + '.json...');
  const postsPath = path.join(process.cwd(), 'contents', 'posts', locale);

  const mdxFiles = getAllMdxFiles(postsPath);
  console.log('Found mdx files: ', mdxFiles.length);

  const posts = mdxFiles.map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = matter(content).data;

    // contents/posts 기준 상대 경로 추출
    const relativePath = path.relative(postsPath, filePath);
    const id = relativePath.replace(/\.mdx?$/, '');

    return {
      id,
      ...frontmatter,
      path: '/posts/' + relativePath,
    };
  });

  console.log('Generated posts:', posts);

  // save posts-index.json
  // if folder not exists, create it

  const folderPath = path.join(process.cwd(), 'public', 'posts-index');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  fs.writeFileSync(
    path.join(folderPath, locale + '.json'),
    JSON.stringify(posts, null, 2)
  );

  console.log('✅ posts-index/' + locale + '.json created successfully!\n');
}

generateIndexJson('ko');
generateIndexJson('en');
generateIndexJson('ja');
