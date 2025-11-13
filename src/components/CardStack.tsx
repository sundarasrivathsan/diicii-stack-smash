import { Card, GameCard } from "./GameCard";
import { cn } from "@/lib/utils";

interface CardStackProps {
  stackNumber: number;
  cards: (Card | null)[];
  isPlayerStack?: boolean;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  className?: string;
}

export const CardStack = ({
  stackNumber,
  cards,
  isPlayerStack = false,
  onDrop,
  onDragOver,
  className,
}: CardStackProps) => {
  const [bottomCard, topCard] = cards;
  const isEmpty = !bottomCard && !topCard;

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={cn(
        "relative flex flex-col items-center gap-4 p-4 rounded-xl",
        "bg-game-stack border-2 border-border/40",
        "transition-all duration-300",
        isEmpty && "opacity-40",
        onDrop && "hover:border-primary/50 hover:bg-game-stack/80",
        className
      )}
      style={{ 
        minHeight: "220px",
        width: "140px",
        boxShadow: "var(--shadow-card)" 
      }}
    >
      <div className="text-sm font-semibold text-muted-foreground mb-2">
        Stack {stackNumber}
      </div>

      <div className="flex flex-col-reverse gap-2 items-center">
        {/* Bottom card (hidden until top is knocked out) */}
        {bottomCard && (
          <div className="relative">
            <GameCard
              card={bottomCard}
              isHidden={!!topCard}
              isKnockedOut={bottomCard.isKnockedOut}
            />
          </div>
        )}

        {/* Top card (always visible if present) */}
        {topCard && (
          <div className="relative -mb-14">
            <GameCard
              card={topCard}
              isKnockedOut={topCard.isKnockedOut}
            />
          </div>
        )}

        {/* Empty stack placeholder */}
        {isEmpty && (
          <div className="w-20 h-28 rounded-lg border-2 border-dashed border-border/20 flex items-center justify-center text-xs text-muted-foreground">
            Empty
          </div>
        )}
      </div>
    </div>
  );
};
