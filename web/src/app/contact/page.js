export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 px-6 sm:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-lg mb-8">
            Have questions, feedback, or need assistance with Prompy? We&apos;re here to help! Choose the most convenient way to reach us below.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Email Support</h2>
              <p className="mb-4">For general inquiries, feature requests, or technical support:</p>
              <a href="mailto:support@prompy.org" className="text-primary hover:underline text-lg font-medium">
                support@prompy.org
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                We typically respond within 24-48 hours on business days.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Business Inquiries</h2>
              <p className="mb-4">For partnerships, enterprise plans, or business opportunities:</p>
              <a href="mailto:business@prompy.org" className="text-primary hover:underline text-lg font-medium">
                business@prompy.org
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                Please include details about your organization and requirements.
              </p>
            </div>
          </div>
          
          <div className="bg-secondary p-8 rounded-lg mb-12">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              
              <div>
                <h3 className="text-xl font-medium mb-2">Is there a free trial available?</h3>
                <p>
                  Yes! Prompy offers a free tier with limited features. You can upgrade to a premium plan 
                  anytime to access all features.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">What happens if I don&apos;t renew my subscription?</h3>
                <p>
                  If you don&apos;t renew, you&apos;ll continue to have access to the features until the end of your 
                  current billing period. After that, you&apos;ll be downgraded to the free tier, but your extra prompts 
                  will not be lost but you won&apos;t be able to add new prompts.  You can always renew later to regain full access.
                </p>
              </div>
            </div>
            
            <p className="mt-6 text-muted-foreground">
              Don&apos;t see your question here? Contact us directly using the information above.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
