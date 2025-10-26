import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDB();
    return NextResponse.json({
      ok: true,
      readyState: mongoose.connection.readyState, // 1 = connected
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}