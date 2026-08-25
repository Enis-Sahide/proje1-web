import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(
    'https://play.google.com/store/apps/details?id=com.enissahide.esk7layers',
    307
  );
}
