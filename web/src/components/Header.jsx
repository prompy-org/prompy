import Link from "next/link";

export default function Header() {
  return (
    <header className="py-4 px-6 border-b border-border">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-primary">
          Prompy
        </Link>
        <nav>
          <ul className="flex gap-6">
            <li><Link href="/#features" className="hover:text-primary">Features</Link></li>
            <li>
              <Link 
                href="https://chrome.google.com/webstore/detail/prompy/your-extension-id" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}