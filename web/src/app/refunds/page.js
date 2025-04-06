export default function RefundsPage() {
  return (
    <div className="min-h-screen py-16 px-6 sm:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Cancellation and Refund Policy</h1>
        
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-sm text-muted-foreground mb-6">Last updated on Apr 2 2025</p>
          
          <p>
            Prompy believes in helping its customers as far as possible, and has therefore a liberal cancellation and refund policy. Under this policy:
          </p>
          
          <ul className="space-y-4 mt-4">
            <li>
              Cancellations and refund requests for subscription plans will be considered only if the request is made within 1 days of purchasing the subscription. No refunds will be processed after this period.
            </li>
            
            <li>
              For one-time Extended plan purchases, refund requests will be considered within 1 days of purchase if you have used less than 10% of your allocated prompts.
            </li>
            
            <li>
              In case of technical issues preventing the proper functioning of the extension, please report the same to our Customer Service team. Refund requests related to technical issues will be evaluated on a case-by-case basis.
            </li>
            
            <li>
              If you feel that the service does not meet your expectations or was misrepresented, please contact our customer service within 1 days of purchase. The Customer Service Team will review your complaint and make a determination.
            </li>
            
            <li>
              For subscription plans, cancellation will stop future billing cycles, but you will retain access until the end of your current billing period.
            </li>
            
            <li>
              In case of any refunds approved by Prompy, it&apos;ll take 5-7 business days for the refund to be processed to your original payment method.
            </li>
          </ul>
          
          <div className="mt-8 p-4 bg-secondary rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p>
              If you have any questions about our refund policy or need to request a refund, please contact us at:
              <br />
              Email: <a href="mailto:support@prompy.org" className="text-primary hover:underline">support@prompy.org</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
