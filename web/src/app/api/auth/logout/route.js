import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

/**
 * POST handler for user logout
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
    const data = await fetchWithAuth('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to logout' },
      { status: error.status || 500 }
    );
  }
}
