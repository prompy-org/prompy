import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

/**
 * POST handler for getting subscription status
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
    
    // Make the authenticated request to the backend
    const data = await fetchWithAuth('/api/payment/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
    
    // Return the data from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in subscription status API route:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get subscription status' },
      { status: error.status || 500 }
    );
  }
}
