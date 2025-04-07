const PLANS = {
    FREE_TIER: {
      id: 'plan_basic',
      name: 'Basic',
      description: 'For Basic users',
      amount: 0,
      currency: 'INR',
      interval: null, // One-time payment
      promptLimit: 50,
      durationMonths: 0
    },
    ONE_TIME_PAYMENT_PLAN: {
      id: 'one_time_payment_plan',
      name: 'Extended',
      description: 'For Advanced users',
      amount: 1553,
      currency: 'INR',
      interval: null, // One-time payment
      promptLimit: 2100,
      durationMonths: 0
    },
    UNLIMITED_MONTHLY: {
      id: 'unlimited_monthly',
      name: 'Unlimited Monthly Plan',
      amount: 153,
      currency: 'INR',
      interval: 'monthly',
      promptLimit: -1,
      durationMonths: 1
    },
    UNLIMITED_QUARTERLY: {
      id: 'unlimited_quarterly',
      name: 'Unlimited Quarterly Plan',
      amount: 453,
      currency: 'INR',
      interval: 'quarterly',
      promptLimit: -1,
      durationMonths: 3
    },
    UNLIMITED_YEARLY: {
      id: 'unlimited_yearly',
      name: 'Unlimited Yearly Plan',
      amount: 1653,
      currency: 'INR',
      interval: 'yearly',
      promptLimit: -1,
      durationMonths: 12
    }
};

export default PLANS;