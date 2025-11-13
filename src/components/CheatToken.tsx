import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheatTokenProps {
  isUsed: boolean;
  onClick?: () => void;
  className?: string;
}

export const CheatToken = ({ isUsed, onClick, className }: CheatTokenProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isUsed}
      className={cn(
        "relative w-16 h-16 rounded-full transition-all duration-300",
        "flex items-center justify-center",
        "border-2",
        isUsed 
          ? "bg-muted/30 border-border/30 cursor-not-allowed opacity-40" 
          : "bg-gradient-to-br from-game-highlight to-game-highlight/70 border-game-highlight/50 hover:scale-110 cursor-pointer shadow-[0_0_15px_hsl(var(--game-highlight)/0.5)]",
        className
      )}
    >
      <Star 
        className={cn(
          "w-8 h-8",
          isUsed ? "text-muted-foreground" : "text-background fill-background"
        )} 
      />
      {!isUsed && (
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-glow" />
      )}
    </button>
  );
};
