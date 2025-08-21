'use server';
/**
 * @fileOverview Clocking anomaly detection AI agent.
 *
 * - detectClockingAnomaly - A function that handles the clocking anomaly detection process.
 * - DetectClockingAnomalyInput - The input type for the detectClockingAnomaly function.
 * - DetectClockingAnomalyOutput - The return type for the detectClockingAnomaly function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectClockingAnomalyInputSchema = z.object({
  employeeId: z.string().describe('The ID of the employee.'),
  clockInTime: z.string().describe('The clock-in time (ISO format).'),
  clockOutTime: z.string().describe('The clock-out time (ISO format).'),
});
export type DetectClockingAnomalyInput = z.infer<typeof DetectClockingAnomalyInputSchema>;

const DetectClockingAnomalyOutputSchema = z.object({
  isAnomaly: z.boolean().describe('Whether the clocking event is an anomaly.'),
  anomalyType: z.string().optional().describe('A short category for the type of anomaly, if any (e.g., "Short Shift", "Long Shift", "Late Start", "Early Finish"). This should be 2-3 words max.'),
  explanation: z.string().describe('A concise, one-sentence explanation of why the clocking event is or is not considered an anomaly.'),
});
export type DetectClockingAnomalyOutput = z.infer<typeof DetectClockingAnomalyOutputSchema>;

export async function detectClockingAnomaly(input: DetectClockingAnomalyInput): Promise<DetectClockingAnomalyOutput> {
  return detectClockingAnomalyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectClockingAnomalyPrompt',
  input: {schema: DetectClockingAnomalyInputSchema},
  output: {schema: DetectClockingAnomalyOutputSchema},
  prompt: `You are an expert in detecting anomalies in employee clocking data for a company where a standard shift is 8 hours.

You will analyze the provided clock-in and clock-out times for an employee and determine if the clocking event is an anomaly.

Consider these factors:
- A typical shift is 8 hours.
- Shifts significantly shorter than 6 hours are anomalies.
- Shifts significantly longer than 9 hours are anomalies.
- Clocking in after 9:30 AM is a "Late Start" anomaly.
- Clocking out before 5:00 PM (assuming a 9-to-5 schedule) is an "Early Finish" anomaly.

Employee ID: {{{employeeId}}}
Clock-in Time: {{{clockInTime}}}
Clock-out Time: {{{clockOutTime}}}

Based on this information, determine if the clocking event is an anomaly.
- If it is an anomaly, set isAnomaly to true, provide a concise anomalyType (e.g., "Short Shift", "Long Shift", "Late Start"), and a one-sentence explanation.
- If it is not an anomaly, set isAnomaly to false and provide a one-sentence explanation stating it's a normal shift.
`,
});

const detectClockingAnomalyFlow = ai.defineFlow(
  {
    name: 'detectClockingAnomalyFlow',
    inputSchema: DetectClockingAnomalyInputSchema,
    outputSchema: DetectClockingAnomalyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
