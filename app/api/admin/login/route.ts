// app/api/admin/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  
  // Password check happens SERVER-SIDE only
  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_auth', 'true', {
      httpOnly: true, // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
    });
    return response;
  }
  
  return NextResponse.json({ error: 'Invalid' }, { status: 401 });
}