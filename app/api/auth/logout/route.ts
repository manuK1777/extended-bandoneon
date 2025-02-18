import { NextResponse } from 'next/server';

export async function POST() {
  // Create a response
  const response = NextResponse.json({ success: true });

  // Set the admin token cookie with an expiration date in the past to delete it
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0), // Set expiration to a past date
  });

  return response;
}
