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

export default function generateIndexJson() {
  console.log('Generating index.json...');
  const postsPath = path.join(process.cwd(), 'contents', 'posts');

  console.log('target path: ', postsPath);
  const mdxFiles = getAllMdxFiles(postsPath);
  console.log('found mdx files: ', mdxFiles);

  const posts = mdxFiles.map((filePath) => {
    console.log('processing: ', filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = matter(content).data;

    // contents/posts 기준 상대 경로 추출
    const localeRemovedPath = path
      .relative(postsPath, filePath)
      // remove first path block
      .split('/')
      .slice(1);
    const relativePath = localeRemovedPath.join('/');
    const id = localeRemovedPath.join('-').replace(/\.mdx?$/, '');

    return {
      id,
      ...frontmatter,
      path: '/posts/' + relativePath,
    };
  });

  console.log('Generated posts:', posts);

  // save posts-index.json
  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'posts-index.json'),
    JSON.stringify(posts, null, 2)
  );

  console.log('✅ posts-index.json created successfully!');
}

generateIndexJson();
