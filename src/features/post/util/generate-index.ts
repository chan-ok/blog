import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import type { Post } from '../model/post.schema';

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
  console.log('Generating post/model/' + locale + '.index.json...');
  const postsPath = path.join(process.cwd(), 'contents', locale, 'posts');

  const mdxFiles = getAllMdxFiles(postsPath);
  console.log('Found mdx files: ', mdxFiles.length);

  const posts = mdxFiles
    .map((filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = matter(content).data;
      const id = path.relative(postsPath, filePath).replace(/\.mdx?$/, '');

      return {
        id,
        ...frontmatter,
        path: '/posts/' + id,
      } as unknown as Post;
    })
    .toSorted(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  console.log('Generated posts:', posts);

  // save posts-index.json
  // if folder not exists, create it

  const folderPath = path.join(process.cwd(), 'src/features/post/model');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  fs.writeFileSync(
    path.join(folderPath, `${locale}.index.json`),
    JSON.stringify(posts, null, 2)
  );

  console.log(
    '✅ post/model/' + locale + '.index.json created successfully!\n'
  );
}

generateIndexJson('ko');
generateIndexJson('en');
generateIndexJson('ja');
