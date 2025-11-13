import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface DiceProps {
  onRoll: (number: number, color: "green" | "red") => void;
  isRolling?: boolean;
}

export const Dice = ({ onRoll, isRolling = false }: DiceProps) => {
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [currentColor, setCurrentColor] = useState<"green" | "red">("green");

  const handleRoll = () => {
    const number = Math.floor(Math.random() * 6) + 1;
    const color = Math.random() > 0.5 ? "green" : "red";
    
    setCurrentNumber(number);
    setCurrentColor(color);
    
    setTimeout(() => {
      onRoll(number, color);
    }, 500);
  };

  const ledColor = currentColor === "green" 
    ? "bg-game-green shadow-[0_0_20px_hsl(var(--game-green)/0.6)]" 
    : "bg-game-red shadow-[0_0_20px_hsl(var(--game-red)/0.6)]";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={cn(
        "relative w-32 h-32 rounded-2xl bg-gradient-to-br from-card to-secondary",
        "border-4 border-border flex items-center justify-center",
        "transition-all duration-500",
        isRolling && "animate-dice-roll"
      )}
      style={{ boxShadow: "var(--shadow-dice)" }}
      >
        <div className="text-6xl font-bold text-foreground">
          {currentNumber}
        </div>
        
        {/* LED Color Indicator */}
        <div className={cn(
          "absolute -top-3 -right-3 w-8 h-8 rounded-full border-4 border-background",
          "transition-all duration-300",
          ledColor,
          isRolling && "animate-pulse-glow"
        )} />
      </div>

      <Button
        onClick={handleRoll}
        disabled={isRolling}
        className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50"
      >
        {isRolling ? "Rolling..." : "Roll Dice"}
      </Button>
    </div>
  );
};
