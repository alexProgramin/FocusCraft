'use server';

/**
 * @fileOverview A motivational message generator for focus sessions.
 *
 * - getMotivationalMessage - A function that returns a motivational message.
 * - MotivationalMessageInput - The input type for the getMotivationalMessage function.
 * - MotivationalMessageOutput - The return type for the getMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalMessageInputSchema = z.object({
  sessionProgress: z
    .number()
    .describe(
      'The current progress of the focus session, as a percentage between 0 and 100.'
    ),
  timeRemaining: z
    .number()
    .describe('The time remaining in the focus session, in seconds.'),
});
export type MotivationalMessageInput = z.infer<typeof MotivationalMessageInputSchema>;

const MotivationalMessageOutputSchema = z.object({
  message: z
    .string()
    .describe('A motivational message to encourage the user to focus.'),
});
export type MotivationalMessageOutput = z.infer<typeof MotivationalMessageOutputSchema>;

export async function getMotivationalMessage(input: MotivationalMessageInput): Promise<MotivationalMessageOutput> {
  return motivationalMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationalMessagePrompt',
  input: {schema: MotivationalMessageInputSchema},
  output: {schema: MotivationalMessageOutputSchema},
  prompt: `You are a motivational coach helping a user stay focused during a focus session.

  The user is currently {{sessionProgress}}% of the way through their session, with {{timeRemaining}} seconds remaining.

  If the sessionProgress < 50, encourage the user to stay focused and keep going.
  If the sessionProgress >= 50 and sessionProgress < 80, remind the user of the benefits of completing the session.
  If the sessionProgress >= 80, congratulate the user on their progress and encourage them to finish strong.

  Provide a short motivational message (under 20 words) tailored to the user's current progress.
  `,
});

const motivationalMessageFlow = ai.defineFlow(
  {
    name: 'motivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
