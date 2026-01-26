import { motion } from "framer-motion";
import { type SimilarityResult } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface SimilarityCardProps {
  result: SimilarityResult;
  index: number;
}

export function SimilarityCard({ result, index }: SimilarityCardProps) {
  // Convert score (0-1) to percentage for progress bar
  const percentage = Math.round(result.score * 100);
  
  // Determine color based on similarity strength
  const getColorClass = (score: number) => {
    if (score > 0.8) return "text-green-600 bg-green-100";
    if (score > 0.6) return "text-blue-600 bg-blue-100";
    return "text-slate-600 bg-slate-100";
  };

  const getProgressColor = (score: number) => {
    if (score > 0.8) return "bg-green-500";
    if (score > 0.6) return "bg-blue-500";
    return "bg-slate-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-slate-800 capitalize group-hover:text-primary transition-colors">
          {result.word}
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getColorClass(result.score)}`}>
          {(result.score).toFixed(3)}
        </span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Similarity match</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${getProgressColor(result.score)}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
