export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-10 py-6 text-center text-ink3">
      <a
        href="mailto:kiss.yagni.dry@gmail.com"
        className="underline-offset-2 hover:text-ink hover:underline"
      >
        kiss.yagni.dry@gmail.com
      </a>
      <p className="mt-1">© {currentYear} Chanho Kim&apos;s dev Blog. All rights reserved.</p>
    </footer>
  );
}
