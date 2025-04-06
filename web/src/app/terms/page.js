export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-6 sm:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-sm text-muted-foreground mb-6">Last updated on Apr 2 2025</p>
          
          <p>
            For the purpose of these Terms and Conditions, the term &quot;we&quot;, &quot;us&quot;, &quot;our&quot; used anywhere on this page shall mean Prompy, owned and operated by MOHAMMAD HUSSAIN, whose registered/operational office is Jabalpur, MP, India Jabalpur MADHYA PRADESH 482002. &quot;you&quot;, &quot;your&quot;, &quot;user&quot;, &quot;visitor&quot; shall mean any natural or legal person who is visiting our website, using our browser extension, and/or agreed to purchase from us.
          </p>
          
          <p className="font-semibold mt-6">Your use of the Prompy extension, website and/or purchase from us are governed by following Terms and Conditions:</p>
          
          <ul className="space-y-4 mt-4">
            <li>
              The content and functionality of the Prompy extension and website are subject to change without notice.
            </li>
            
            <li>
              Prompy uses Razorpay as a payment processor. By making a purchase, you agree to Razorpay&apos;s terms of service in addition to our own.
            </li>
            
            <li>
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered through our extension or website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
            </li>
            
            <li>
              Your use of any information or materials on our extension and/or website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our extension and/or website meet your specific requirements.
            </li>
            
            <li>
              Our extension and website contain material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, graphics, and code. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
            </li>
            
            <li>
              All trademarks reproduced in our extension and website which are not the property of, or licensed to, the operator are acknowledged on the website.
            </li>
            
            <li>
              Unauthorized use of our extension, including exceeding usage limits, reverse engineering, or redistributing our code shall give rise to a claim for damages and/or be a criminal offense.
            </li>
            
            <li>
              From time to time our website may include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).
            </li>
            
            <li>
              You may not create a link to our website from another website or document without Prompy&apos;s prior written consent.
            </li>
            
            <li>
              Any dispute arising out of use of our extension, website and/or purchase with us and/or any engagement with us is subject to the laws of India.
            </li>
            
            <li>
              We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
            </li>
          </ul>
          
          <div className="mt-8 p-4 bg-secondary rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p>
              If you have any questions about our Terms and Conditions, please contact us at:
              <br />
              Email: <a href="mailto:support@prompy.org" className="text-primary hover:underline">support@prompy.org</a>
            </p>
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
