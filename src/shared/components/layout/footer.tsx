export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-14 border-t border-rule py-10 text-center text-ink3">
      <div className="app-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© {currentYear} chanho.kim</p>
        <p>
          <a
            href="mailto:kiss.yagni.dry@gmail.com"
            className="underline underline-offset-2 hover:text-ink"
          >
            kiss.yagni.dry@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}
