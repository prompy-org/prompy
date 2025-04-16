import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

/**
 * GET handler for user stats
 * Proxies the request to the backend API
 */
export async function GET(request) {
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
    const data = await fetchWithAuth('/api/user/stats', {}, token);
    
    // Return the data from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user stats API route:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch user stats' },
      { status: error.status || 500 }
    );
  }
}
