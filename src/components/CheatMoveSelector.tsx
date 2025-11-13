import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface CheatMoveSelectorProps {
  onSelect: (number: number, color: "green" | "red") => void;
  onCancel: () => void;
}

export const CheatMoveSelector = ({ onSelect, onCancel }: CheatMoveSelectorProps) => {
  const numbers = [1, 2, 3, 4, 5, 6];
  const colors: ("green" | "red")[] = ["green", "red"];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border-2 border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold text-center mb-6 text-game-highlight">
          Choose Your Move
        </h3>

        <div className="space-y-6">
          {colors.map((color) => (
            <div key={color} className="space-y-3">
              <div className={cn(
                "text-sm font-semibold uppercase tracking-wide",
                color === "green" ? "text-game-green" : "text-game-red"
              )}>
                {color}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {numbers.map((num) => (
                  <Button
                    key={`${color}-${num}`}
                    onClick={() => onSelect(num, color)}
                    className={cn(
                      "aspect-square text-lg font-bold",
                      color === "green"
                        ? "bg-gradient-to-br from-game-green to-game-green/80 hover:from-game-green/90 hover:to-game-green/70"
                        : "bg-gradient-to-br from-game-red to-game-red/80 hover:from-game-red/90 hover:to-game-red/70",
                      "text-white border-2 border-white/20"
                    )}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full mt-6"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
