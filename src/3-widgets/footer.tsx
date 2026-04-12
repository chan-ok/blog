export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-10 py-6 text-center text-ink3">
      © {currentYear} Chanho Kim&apos;s dev Blog. All rights reserved.
    </footer>
  );
}
