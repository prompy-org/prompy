import SubscriptionButton from "@/components/SubscriptionButton";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Prompy - Your AI Prompt Manager
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80">
              Securely store, organize, and manage your AI prompts. Perfect for prompt engineers, 
              content creators, and AI enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="https://chrome.google.com/webstore/detail/prompy/your-extension-id"
                className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] flex items-center justify-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="8 17 12 21 16 17"></polyline>
                  <line x1="12" y1="12" x2="12" y2="21"></line>
                  <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path>
                </svg>
                Install Extension
              </Link>
              <a 
                href="#features"
                className="rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] flex items-center justify-center"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-[320px] h-[240px] sm:w-[480px] sm:h-[360px]">
              <Image
                src="/extension-preview.png"
                alt="Prompy Extension Preview"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 sm:px-20 bg-[#f8f9fa] dark:bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f0f4ff] dark:bg-[#1a1f36] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 sm:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
            Choose the plan that works best for you and your team
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="border border-black/[.08] dark:border-white/[.145] rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-foreground/70 mb-6">Perfect for getting started</p>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-foreground/70">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                <PricingItem>Store up to 50 prompts</PricingItem>
                <PricingItem>Basic organization with tags</PricingItem>
                <PricingItem>Local storage only</PricingItem>
                <PricingItem>Community support</PricingItem>
              </ul>
              
              <Link 
                href="https://chrome.google.com/webstore/detail/prompy/your-extension-id"
                className="mt-auto rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Started
              </Link>
            </div>
            
            {/* Unlimited Plan */}
            <div className="bg-foreground text-background rounded-2xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#4c6ef5] text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <h3 className="text-2xl font-bold mb-2">Unlimited</h3>
              <p className="text-background/70 mb-6">For power users and teams</p>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg font-normal text-background/70">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                <PricingItem dark>Unlimited prompts</PricingItem>
                <PricingItem dark>Advanced organization system</PricingItem>
                <PricingItem dark>Cloud sync across devices</PricingItem>
                <PricingItem dark>Team sharing capabilities</PricingItem>
                <PricingItem dark>Priority support</PricingItem>
                <PricingItem dark>Advanced templates</PricingItem>
              </ul>
              
              <SubscriptionButton planId="unlimited" className="mt-auto rounded-full bg-[#4c6ef5] hover:bg-[#3b5bdb] text-foreground px-6 py-3 font-medium text-center" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 sm:px-20 bg-[#f8f9fa] dark:bg-[#111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to supercharge your AI workflow?</h2>
          <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
            Join thousands of prompt engineers, content creators, and AI enthusiasts who use Prompy every day.
          </p>
          <Link 
            href="https://chrome.google.com/webstore/detail/prompy/your-extension-id"
            className="rounded-full bg-foreground text-background px-8 py-4 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] inline-flex items-center justify-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Install Prompy Now
          </Link>
        </div>
      </section>
    </div>
  );
}

// Helper component for pricing items
function PricingItem({ children, dark = false }) {
  return (
    <li className="flex items-center gap-2">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={dark ? "white" : "currentColor"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span className={dark ? "text-background/90" : "text-foreground/90"}>{children}</span>
    </li>
  );
}

// Features data
const features = [
  {
    title: "Secure Storage",
    description: "Keep all your valuable prompts in one secure place with end-to-end encryption.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    )
  },
  {
    title: "Easy Organization",
    description: "Tag and categorize your prompts for quick access whenever you need them.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
      </svg>
    )
  },
  {
    title: "Instant Search",
    description: "Find exactly what you need with lightning-fast search across all your prompts.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </svg>
    )
  },
  {
    title: "One-Click Copy",
    description: "Copy prompts to clipboard with a single click for maximum efficiency.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
      </svg>
    )
  },
  {
    title: "Detachable Window",
    description: "Pop out into a resizable window that stays open while you work with AI tools.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    )
  },
  {
    title: "Variable Support",
    description: "Create dynamic prompts with customizable variables for flexible use cases.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"></path>
        <path d="M12 13v8"></path>
        <path d="M12 3v3"></path>
      </svg>
    )
  }
];
