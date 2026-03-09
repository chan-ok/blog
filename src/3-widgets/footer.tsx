import { Rss } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-10 py-6 text-center text-gray-600 dark:text-gray-400">
      © {currentYear} Chanho Kim&apos;s dev Blog. All rights reserved.
      <a
        href="/api/rss"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="RSS 피드 구독"
        className="ml-2 inline-flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
      >
        <Rss size={16} />
      </a>
    </footer>
  );
}
