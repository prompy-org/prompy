import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

/**
 * DELETE handler for user deletion
 * Proxies the request to the backend API
 */
export async function DELETE(request) {
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
    const data = await fetchWithAuth('/api/user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
    
    // Return the data from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user deletion API route:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete user' },
      { status: error.status || 500 }
    );
  }
}
