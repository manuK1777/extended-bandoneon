import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/auth';
import { deleteUserById } from '@/lib/db/models/user';

export async function DELETE() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteUserById(user.id);

    // Clear auth cookie similar to logout
    const response = NextResponse.json({ success: true, message: 'Account deleted' });
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
