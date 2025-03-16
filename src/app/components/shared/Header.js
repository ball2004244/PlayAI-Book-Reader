export default function Header() {
  return (
    <header className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600 dark:text-blue-400"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <h1 className="text-2xl font-bold">Book Reader</h1>
      </div>

      <div className="text-sm italic text-gray-500 dark:text-gray-400">
        Enhance your reading experience with AI
      </div>
    </header>
  );
}
