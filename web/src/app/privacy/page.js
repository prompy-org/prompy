export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-6 sm:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-sm text-muted-foreground mb-6">Last updated on Apr 2 2025</p>
          
          <p>
            This privacy policy sets out how Prompy, owned and operated by MOHAMMAD HUSSAIN, uses and protects any information that you provide when you use our browser extension and website.
          </p>
          
          <p>
            Prompy is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using our extension or website, you can be assured that it will only be used in accordance with this privacy statement.
          </p>
          
          <p>
            Prompy may change this policy from time to time by updating this page. You should check this page periodically to ensure that you are comfortable with any changes.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p>We may collect the following information:</p>
          <ul className="space-y-2">
            <li>Name and email address (through Google authentication)</li>
            <li>Usage data such as prompt count and extension interactions</li>
            <li>Payment and subscription information when you purchase a plan</li>
            <li>Browser type and version (for troubleshooting purposes)</li>
            <li>Prompts that you create and save (stored in your account)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do With The Information We Gather</h2>
          <p>
            We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
          </p>
          <ul className="space-y-2">
            <li>To manage your account and provide the extension functionality</li>
            <li>To process payments and manage your subscription</li>
            <li>To improve our extension and services based on your feedback and usage patterns</li>
            <li>To send periodic emails about updates, new features, or other information which we think you may find interesting</li>
            <li>To provide customer support and respond to your inquiries</li>
          </ul>
          
          <p>
            We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have implemented suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Your Prompts and Intellectual Property</h2>
          <p>
            Your prompts are your intellectual property. We do not claim ownership over the content you create and store using our extension. We do not use your prompts for training AI models or share them with third parties without your explicit consent.
          </p>
          
          <p>
            You have the option to store your prompts locally or in your account. If you choose to store them in your account, they are encrypted and only accessible to you when logged in.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p>
            A cookie is a small file which asks permission to be placed on your computer&apos;s hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
          </p>
          
          <p>
            We use cookies to:
          </p>
          <ul className="space-y-2">
            <li>Keep you signed in to your account</li>
            <li>Understand how you use our extension and website</li>
            <li>Remember your preferences</li>
            <li>Improve our extension and website based on the information these cookies collect</li>
          </ul>
          
          <p>
            You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website and extension.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Browser Extension Permissions</h2>
          <p>
            Our extension requires certain permissions to function properly:
          </p>
          <ul className="space-y-2">
            <li><strong>Storage:</strong> To save your preferences and prompts locally</li>
            <li><strong>Tabs and WebNavigation:</strong> To detect when you&apos;re using supported websites</li>
          </ul>
          
          <p>
            We only access the minimum information needed to provide our services and do not collect browsing history or sensitive information from your tabs.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Controlling Your Personal Information</h2>
          <p>
            You may choose to restrict the collection or use of your personal information in the following ways:
          </p>
          <ul className="space-y-2">
            <li>You can review and update your account information at any time through your account settings</li>
            <li>You can delete your account and all associated data by contacting our support team</li>
            <li>You can opt out of marketing emails by clicking the unsubscribe link in any email we send</li>
            <li>You can choose to use the extension in local storage mode, which minimizes data sent to our servers</li>
          </ul>
          
          <p>
            We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about our services which we think you may find interesting if you have indicated that you wish this to happen.
          </p>
          
          <div className="mt-8 p-4 bg-secondary rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p>
              If you have any questions about our Privacy Policy or believe that any information we are holding about you is incorrect or incomplete, please contact us at:
              <br />
              Email: <a href="mailto:support@prompy.org" className="text-primary hover:underline">support@prompy.org</a>
              <br />
              Address: Jabalpur, MP, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
