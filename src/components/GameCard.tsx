import { cn } from "@/lib/utils";

export interface Card {
  id: string;
  number: number;
  color: "green" | "red";
  isKnockedOut: boolean;
}

interface GameCardProps {
  card: Card | null;
  isHidden?: boolean;
  isKnockedOut?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
}

export const GameCard = ({
  card,
  isHidden = false,
  isKnockedOut = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  className,
}: GameCardProps) => {
  if (!card) {
    return (
      <div className={cn(
        "w-20 h-28 rounded-lg border-2 border-dashed border-border/30 bg-muted/20",
        className
      )} />
    );
  }

  if (isKnockedOut) {
    return (
      <div className={cn(
        "w-20 h-28 rounded-lg bg-muted/10 border border-border/20 opacity-30",
        className
      )} />
    );
  }

  const colorClass = card.color === "green" 
    ? "bg-gradient-to-br from-game-green to-game-green/80" 
    : "bg-gradient-to-br from-game-red to-game-red/80";

  const glowClass = card.color === "green"
    ? "shadow-[0_0_20px_hsl(var(--game-green)/0.4)]"
    : "shadow-[0_0_20px_hsl(var(--game-red)/0.4)]";

  return (
    <div
      draggable={!!onDragStart && !isHidden}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "w-20 h-28 rounded-lg transition-all duration-300",
        "flex items-center justify-center cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 scale-95",
        !isHidden && !isDragging && "hover:scale-105 hover:-translate-y-1",
        className
      )}
      style={{ 
        boxShadow: "var(--shadow-card)",
        transition: "var(--transition-smooth)" 
      }}
    >
      {isHidden ? (
        <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/60 rounded-lg border-2 border-border flex items-center justify-center">
          <div className="text-4xl opacity-40">?</div>
        </div>
      ) : (
        <div className={cn(
          "w-full h-full rounded-lg border-2 border-white/20 flex items-center justify-center relative overflow-hidden",
          colorClass,
          glowClass
        )}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <span className="text-5xl font-bold text-white drop-shadow-lg relative z-10">
            {card.number}
          </span>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white/40" />
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-white/40" />
        </div>
      )}
    </div>
  );
};
