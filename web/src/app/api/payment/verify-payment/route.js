import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

/**
 * POST handler for verifying a payment
 * Proxies the request to the backend API
 */
export async function POST(request) {
  try {
    // Extract the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Get the request body
    const body = await request.json();
    
    // Make the authenticated request to the backend
    const data = await fetchWithAuth('/api/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
    
    // Return the data from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in verify payment API route:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to verify payment' },
      { status: error.status || 500 }
    );
  }
}
