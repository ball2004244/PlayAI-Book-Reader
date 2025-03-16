export default function Footer() {
  return (
    <footer className="flex gap-6 flex-wrap items-center justify-center text-sm text-gray-500 dark:text-gray-400 mt-auto">
      <p>© {new Date().getFullYear()} Book Reader</p>
      <a href="#" className="hover:underline">
        Privacy Policy
      </a>
      <a href="#" className="hover:underline">
        Terms of Service
      </a>
    </footer>
  );
}