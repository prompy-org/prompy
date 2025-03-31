import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="font-bold text-lg text-primary">
              Prompy
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Your AI Prompt Manager
            </p>
          </div>
          
          <div className="flex gap-8">
            <div>
              <h3 className="font-medium mb-2">Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="/#download" className="text-muted-foreground hover:text-primary">Download</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Prompy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}