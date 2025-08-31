import { getMotivationalMessage, MotivationalMessageInput } from '@/ai/flows/motivational-messages';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: MotivationalMessageInput = await request.json();
    const result = await getMotivationalMessage(body);
    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error('Error fetching motivational message:', error);
    // Return a generic, positive fallback message in case of an error
    return NextResponse.json(
      { message: "You're doing great, keep it up!" },
      { status: 500 }
    );
  }
}
