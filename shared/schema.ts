import { z } from "zod";

export const similarityRequestSchema = z.object({
  word: z.string().min(1, "Please enter a word"),
  topK: z.number().int().min(1).max(20).optional().default(5)
});

export const similarityResultSchema = z.object({
  word: z.string(),
  score: z.number()
});

export const similarityResponseSchema = z.object({
  original: z.string(),
  similar: z.array(similarityResultSchema)
});

export type SimilarityRequest = z.infer<typeof similarityRequestSchema>;
export type SimilarityResult = z.infer<typeof similarityResultSchema>;
export type SimilarityResponse = z.infer<typeof similarityResponseSchema>;
