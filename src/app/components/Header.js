import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full">
      <div className="flex items-center gap-4">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h1 className="text-2xl font-bold">Book Reader</h1>
      </div>
      
      <nav>
        <ul className="flex gap-6">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">About</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}