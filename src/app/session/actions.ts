"use server";

import { getMotivationalMessage, MotivationalMessageInput } from '@/ai/flows/motivational-messages';

export async function fetchMotivationalMessage(input: MotivationalMessageInput): Promise<string> {
  try {
    const result = await getMotivationalMessage(input);
    return result.message;
  } catch (error) {
    console.error('Error fetching motivational message:', error);
    // Return a generic, positive fallback message in case of an error
    return "You're doing great, keep it up!";
  }
}
