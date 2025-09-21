// This file holds the Genkit flow for providing similar artwork suggestions on the product detail page.

'use server';

/**
 * @fileOverview Provides AI-powered recommendations for similar artwork based on viewing history.
 *
 * - artworkSuggestions - A function that suggests similar artworks.
 * - ArtworkSuggestionsInput - The input type for the artworkSuggestions function.
 * - ArtworkSuggestionsOutput - The return type for the artworkSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArtworkSuggestionsInputSchema = z.object({
  currentArtworkId: z.string().describe('The ID of the artwork currently being viewed.'),
  userViewingHistory: z.array(z.string()).optional().describe('A list of artwork IDs the user has viewed in the past.'),
  userPurchaseHistory: z.array(z.string()).optional().describe('A list of artwork IDs the user has purchased in the past.'),
});
export type ArtworkSuggestionsInput = z.infer<typeof ArtworkSuggestionsInputSchema>;

const ArtworkSuggestionsOutputSchema = z.object({
  suggestedArtworkIds: z.array(z.string()).describe('A list of artwork IDs that are suggested as similar.'),
});
export type ArtworkSuggestionsOutput = z.infer<typeof ArtworkSuggestionsOutputSchema>;

export async function artworkSuggestions(input: ArtworkSuggestionsInput): Promise<ArtworkSuggestionsOutput> {
  return artworkSuggestionsFlow(input);
}

const artworkSuggestionsPrompt = ai.definePrompt({
  name: 'artworkSuggestionsPrompt',
  input: {schema: ArtworkSuggestionsInputSchema},
  output: {schema: ArtworkSuggestionsOutputSchema},
  prompt: `You are an expert art recommender. Based on the artwork the user is currently viewing (ID: {{{currentArtworkId}}}), their viewing history (IDs: {{{userViewingHistory}}}), and their purchase history (IDs: {{{userPurchaseHistory}}}), suggest other artworks they might be interested in. Only return the artwork IDs in the suggestedArtworkIds array.

Consider artworks that are in the same category, have similar styles, or are by the same artist. Prioritize artworks that the user has not already viewed or purchased.

Return a list of artwork IDs in the suggestedArtworkIds field. Be concise.`,
});

const artworkSuggestionsFlow = ai.defineFlow(
  {
    name: 'artworkSuggestionsFlow',
    inputSchema: ArtworkSuggestionsInputSchema,
    outputSchema: ArtworkSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await artworkSuggestionsPrompt(input);
    return output!;
  }
);
