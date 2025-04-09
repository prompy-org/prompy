const plans = [
    {
      id: 'plan_basic',
      name: 'Basic',
      description: 'Perfect for individuals',
      duration: ' For lifetime',
      amount: 0,
      features: [
        'Up to 50 prompts',
      ]
    },
    {
      id: 'one_time_payment_plan',
      name: 'Extended',
      description: 'Get 2100 prompts with lifetime access',
      duration: ' One-time payment',
      amount: 553,
      popular: true,
      features: [
        '2100 prompts',
        'Priority support',
        'Lifetime access'
      ]
    }, 
    {
      id: 'unlimited_monthly',
      name: 'Unlimited Monthly',
      description: 'Unlimited prompts, monthly subscription',
      duration: ' For a month',
      amount: 153,
      features: [
        'Unlimited prompts',
        'Priority support',
      ]
    },
    {
      id: 'unlimited_quarterly',
      name: 'Unlimited Quarterly',
      description: 'Unlimited prompts, quarterly subscription',
      duration: ' For 3 months',
      amount: 453,
      features: [
        'Unlimited prompts',
        'Priority support',
      ]
    },
    {
      id: 'unlimited_yearly',
      name: 'Unlimited Yearly',
      description: 'Unlimited prompts, yearly subscription',
      duration: ' For a year',
      amount: 1653,
      features: [
        'Unlimited prompts',
        'Priority support',
      ]
    }
];
  
export default plans;