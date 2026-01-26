import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, BrainCircuit, Quote, Network } from "lucide-react";
import { useSimilarity } from "@/hooks/use-similarity";
import { SimilarityCard } from "@/components/SimilarityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Local schema for the form
const formSchema = z.object({
  word: z.string().min(1, "Please enter a word to analyze"),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [searchedWord, setSearchedWord] = useState<string | null>(null);
  const { mutate, isPending, data, reset } = useSimilarity();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (formData: FormData) => {
    setSearchedWord(formData.word);
    mutate({ word: formData.word, topK: 10 });
  };

  return (
    <div className="min-h-screen w-full px-4 py-12 md:py-24 max-w-5xl mx-auto flex flex-col items-center">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 space-y-4 max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-primary/10 shadow-sm mb-4">
          <BrainCircuit className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">NLP Semantic Analysis</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
          Find the perfect <br/>
          <span className="text-gradient">Synonym & Context</span>
        </h1>
        
        <p className="text-lg text-muted-foreground leading-relaxed">
          Powered by Gensim & Word2Vec models to explore semantic relationships 
          between words in high-dimensional vector space.
        </p>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-xl relative z-10"
      >
        <Card className="p-2 pl-6 bg-white shadow-2xl shadow-primary/10 border-primary/10 rounded-2xl flex items-center gap-2">
          <Search className="w-6 h-6 text-muted-foreground shrink-0" />
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-2">
            <Input 
              {...register("word")}
              placeholder="Enter a word (e.g., 'happy', 'computer', 'science')..." 
              className="border-0 shadow-none focus-visible:ring-0 text-lg px-0 h-14 bg-transparent"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              size="lg" 
              disabled={isPending}
              className="h-14 px-8 rounded-xl font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze</span>
                </div>
              )}
            </Button>
          </form>
        </Card>
        {errors.word && (
          <p className="mt-3 text-red-500 text-sm font-medium pl-6 animate-in slide-in-from-top-1">
            {errors.word.message}
          </p>
        )}
      </motion.div>

      {/* Results Section */}
      <div className="w-full mt-16">
        <AnimatePresence mode="wait">
          {data ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Quote className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display text-slate-800">
                      Results for "{searchedWord}"
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Found {data.similar.length} semantic matches
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => { reset(); setSearchedWord(null); }} className="rounded-xl">
                  Clear Results
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.similar.map((result, idx) => (
                  <SimilarityCard key={result.word} result={result} index={idx} />
                ))}
              </div>
            </motion.div>
          ) : !isPending && !searchedWord && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 mt-12"
            >
              <div className="flex flex-col items-center text-center p-6 border rounded-xl bg-white/40">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Network className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Vector Embeddings</h3>
                <p className="text-sm text-muted-foreground">Words are converted to vectors to find mathematical proximity.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-xl bg-white/40">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Context Aware</h3>
                <p className="text-sm text-muted-foreground">Understands nuance better than simple thesaurus lookups.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-xl bg-white/40">
                <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                </div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">High-performance similarity search powered by Gensim.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
