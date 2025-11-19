import Link from 'next/link';
import styles from './styles.module.css';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          My Blog
        </Link>
        <nav className="space-x-1">
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/posts" className={styles.navLink}>
            Post
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
