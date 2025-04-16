import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentStatus({ status, message, redirectPath}) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (status === 'success' && timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timerId); // Cleanup on unmount or re-run
    }
  }, [timeLeft, status]);

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Payment Successful</h2>
        <>
          Your subscription has been activated.
          {timeLeft > 0 && (
            <div className="mt-4 text-muted-foreground">
              <p className="mt-4">Redirecting to dashboard in {timeLeft}...</p>
            </div>
          )}
        </>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Payment Failed</h2>
        <p className="text-muted-foreground mb-6">{message || 'There was an issue processing your payment.'}</p>
        <button
          onClick={() => router.push(redirectPath || '/dashboard/pricing')}
          className="flex items-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Plans
        </button>
      </div>
    );
  }
  
  return null;
}