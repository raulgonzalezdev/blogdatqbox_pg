export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800">
      <div className="container py-10 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <p>© {new Date().getFullYear()} datqbox</p>
        <p>Construido con Next.js, Bun y Postgres</p>
      </div>
    </footer>
  );
}
