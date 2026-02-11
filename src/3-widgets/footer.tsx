export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-10 py-6 text-center text-gray-600 dark:text-gray-400">
      © {currentYear} Chanho Kim&apos;s dev Blog. All rights reserved.
    </footer>
  );
}
