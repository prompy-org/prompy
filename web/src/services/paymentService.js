/**
 * Payment-related API services
 */

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Order creation response
 */
export async function createOrder(orderData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create order: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Verify a payment
 * @param {Object} paymentData - Payment verification data
 * @returns {Promise<Object>} Payment verification response
 */
export async function verifyPayment(paymentData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/payment/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to verify payment: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Get subscription status
 * @returns {Promise<Object>} Subscription status
 */
export async function getSubscriptionStatus() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/payment/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get subscription status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 * @returns {Promise<Object>} Cancellation response
 */
export async function cancelOrder(orderData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/payment/cancel-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to cancel subscription: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}
