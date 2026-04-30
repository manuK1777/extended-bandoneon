import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Explicitly use Node.js runtime

export async function POST() {
  return NextResponse.json(
    { error: 'Not Found. Use /api/auth/login for authentication.' },
    { status: 404 }
  );
}

// NOTE: Keeping DELETE for backward compatibility if anything still calls /api/auth (DELETE)
// Prefer using /api/auth/logout (if implemented) going forward.
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth_token');
  return response;
}
