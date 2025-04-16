import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

/**
 * POST handler for creating a new order
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
    const data = await fetchWithAuth('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
    
    // Return the data from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in create order API route:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create order' },
      { status: error.status || 500 }
    );
  }
}
