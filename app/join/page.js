import Link from 'next/link';

export default function Register() {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col row-start-2 items-center">
          <h1 className="text-3xl sm:text-4xl text-center font-bold">
            2025
          </h1>
          <br /><br />
        </main>
  
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
          <Link
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="/"
          >
            Home
          </Link>
          <Link
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="/about"
          >
            About
          </Link>
          <Link
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="/join"
          >
            Join the Team
          </Link>
        </footer>
      </div>
    );
  }
