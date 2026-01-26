import { useMutation } from "@tanstack/react-query";
import { api, type SimilarityRequest, type SimilarityResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSimilarity() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SimilarityRequest) => {
      // Validate input before sending using schema from routes
      const validated = api.similarity.find.input.parse(data);
      
      const res = await fetch(api.similarity.find.path, {
        method: api.similarity.find.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          // Try to parse structured validation error first
          try {
            const parsedError = api.similarity.find.responses[400].parse(error);
            throw new Error(parsedError.message);
          } catch {
            throw new Error(error.message || "Invalid request");
          }
        }
        if (res.status === 500) {
           throw new Error("Word not found in vocabulary or model error");
        }
        throw new Error("Failed to fetch similarity results");
      }

      const json = await res.json();
      return api.similarity.find.responses[200].parse(json);
    },
    onError: (error: Error) => {
      toast({
        title: "Error finding synonyms",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
