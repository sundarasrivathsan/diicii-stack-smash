import { useState, useEffect } from "react";
import { Card, GameCard } from "@/components/GameCard";
import { CardStack } from "@/components/CardStack";
import { Dice } from "@/components/Dice";
import { CheatToken } from "@/components/CheatToken";
import { CheatMoveSelector } from "@/components/CheatMoveSelector";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type GamePhase = "arrangement" | "gameplay" | "victory";
type PlayerNumber = 1 | 2;

const createDeck = (playerId: string, playerColor: "green" | "red"): Card[] => {
  const cards: Card[] = [];
  
  // Each player gets 12 cards of their color (numbers 1-6, two of each)
  for (let num = 1; num <= 6; num++) {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `${playerId}-${num}-${playerColor}-${i}`,
        number: num,
        color: playerColor,
        isKnockedOut: false,
      });
    }
  }
  return cards;
};


const Index = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("arrangement");
  const [currentArrangingPlayer, setCurrentArrangingPlayer] = useState<PlayerNumber>(1);
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<PlayerNumber>(1);
  
  // Player stacks: array of 6 stacks, each with 2 cards [bottom, top]
  const [player1Stacks, setPlayer1Stacks] = useState<(Card | null)[][]>(
    Array(6).fill(null).map(() => [null, null])
  );
  const [player2Stacks, setPlayer2Stacks] = useState<(Card | null)[][]>(
    Array(6).fill(null).map(() => [null, null])
  );
  
  const [unplacedCards, setUnplacedCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  
  const [player1CheatTokens, setPlayer1CheatTokens] = useState(3);
  const [player2CheatTokens, setPlayer2CheatTokens] = useState(3);
  const [showingCheatSelector, setShowingCheatSelector] = useState(false);
  
  const [winner, setWinner] = useState<PlayerNumber | null>(null);
  const [lastRoll, setLastRoll] = useState<{ number: number; color: "green" | "red" } | null>(null);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
  setGamePhase("arrangement");
  setCurrentArrangingPlayer(1);
  setCurrentTurnPlayer(1);
  setPlayer1Stacks(Array(6).fill(null).map(() => [null, null]));
  setPlayer2Stacks(Array(6).fill(null).map(() => [null, null]));
  setUnplacedCards(createDeck("p1", "green")); // Player 1 gets green
  setPlayer1CheatTokens(3);
  setPlayer2CheatTokens(3);
  setWinner(null);
  setLastRoll(null);
  setIsRolling(false);
  setShowingCheatSelector(false);
};

  const handleDragStart = (card: Card) => {
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleStackDrop = (stackIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedCard) return;

    const stacks = currentArrangingPlayer === 1 ? player1Stacks : player2Stacks;
    const setStacks = currentArrangingPlayer === 1 ? setPlayer1Stacks : setPlayer2Stacks;
    
    const stack = stacks[stackIndex];
    
    // Find first empty slot (bottom first, then top)
    if (stack[0] === null) {
      const newStacks = [...stacks];
      newStacks[stackIndex] = [draggedCard, stack[1]];
      setStacks(newStacks);
      setUnplacedCards(unplacedCards.filter(c => c.id !== draggedCard.id));
    } else if (stack[1] === null) {
      const newStacks = [...stacks];
      newStacks[stackIndex] = [stack[0], draggedCard];
      setStacks(newStacks);
      setUnplacedCards(unplacedCards.filter(c => c.id !== draggedCard.id));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const canLockArrangement = () => {
    const stacks = currentArrangingPlayer === 1 ? player1Stacks : player2Stacks;
    return stacks.every(stack => stack[0] !== null && stack[1] !== null);
  };

  const handleLockArrangement = () => {
  if (currentArrangingPlayer === 1) {
    setCurrentArrangingPlayer(2);
    setUnplacedCards(createDeck("p2", "red")); // Player 2 gets red
  } else {
    setGamePhase("gameplay");
  }
};


  const handleDiceRoll = (number: number, color: "green" | "red") => {
    setIsRolling(true);
    setLastRoll({ number, color });
    
    setTimeout(() => {
      processKnockout(number, color);
      setIsRolling(false);
    }, 600);
  };

  const handleCheatMove = () => {
    setShowingCheatSelector(true);
  };

  const handleCheatSelect = (number: number, color: "green" | "red") => {
    if (currentTurnPlayer === 1) {
      setPlayer1CheatTokens(prev => prev - 1);
    } else {
      setPlayer2CheatTokens(prev => prev - 1);
    }
    setShowingCheatSelector(false);
    handleDiceRoll(number, color);
  };

  const processKnockout = (number: number, color: "green" | "red") => {
  const opponentStacks = currentTurnPlayer === 1 ? player2Stacks : player1Stacks;
  const setOpponentStacks = currentTurnPlayer === 1 ? setPlayer2Stacks : setPlayer1Stacks;

  let knockedOut = false;

  const newStacks = opponentStacks.map(stack => {
    const [bottom, top] = stack;
    
    // Check if top card exists and matches
    if (top && !top.isKnockedOut && top.number === number && top.color === color) {
      knockedOut = true;
      // Remove top card, bottom card becomes visible (moves to top position)
      return [null, bottom]; // Bottom card is now the visible top card
    }
    
    // If only bottom card exists (top was already knocked out), check it
    if (!top && bottom && !bottom.isKnockedOut && bottom.number === number && bottom.color === color) {
      knockedOut = true;
      return [null, { ...bottom, isKnockedOut: true }];
    }
    
    return stack;
  });

  setOpponentStacks(newStacks);

  // Check win condition
  setTimeout(() => {
    checkWinCondition(newStacks);
    if (winner) return;
    
    // Switch turn only if no knockout or after processing
    setCurrentTurnPlayer(prev => prev === 1 ? 2 : 1);
  }, knockedOut ? 800 : 100);
};


  const checkWinCondition = (stacks: (Card | null)[][]) => {
    const allKnockedOut = stacks.every(stack => 
      stack.every(card => card === null || card.isKnockedOut)
    );

    if (allKnockedOut) {
      setWinner(currentTurnPlayer);
      setGamePhase("victory");
    }
  };

  const currentCheatTokens = currentTurnPlayer === 1 ? player1CheatTokens : player2CheatTokens;

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-board to-background flex flex-col items-center p-8">
      {/* Header */}
      <div className="w-full max-w-7xl mb-8">
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Diicii Knockout
        </h1>
        <p className="text-center text-muted-foreground">
          {gamePhase === "arrangement" && `Player ${currentArrangingPlayer}: Arrange your cards`}
          {gamePhase === "gameplay" && `Player ${currentTurnPlayer}'s Turn`}
          {gamePhase === "victory" && `Player ${winner} Wins!`}
        </p>
      </div>

      {/* Arrangement Phase */}
      {gamePhase === "arrangement" && (
        <div className="w-full max-w-7xl space-y-8">
          {/* Unplaced Cards */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Available Cards (drag to stacks below)</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {unplacedCards.map(card => (
                <div key={card.id}>
                  <GameCard
                    card={card}
                    isDragging={draggedCard?.id === card.id}
                    onDragStart={() => handleDragStart(card)}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stack Zones */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Your Card Stacks</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(currentArrangingPlayer === 1 ? player1Stacks : player2Stacks).map((stack, idx) => (
                <CardStack
                  key={idx}
                  stackNumber={idx + 1}
                  cards={stack}
                  isPlayerStack
                  onDrop={handleStackDrop(idx)}
                  onDragOver={handleDragOver}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleLockArrangement}
              disabled={!canLockArrangement()}
              size="lg"
              className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-primary to-accent"
            >
              Lock Arrangement
            </Button>
          </div>
        </div>
      )}

      {/* Gameplay Phase */}
      {gamePhase === "gameplay" && (
        <div className="w-full max-w-7xl space-y-8">
          {/* Opponent's Stacks */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Player {currentTurnPlayer === 1 ? 2 : 1}'s Cards
              </h3>
              <div className="flex gap-2">
                {Array.from({ length: currentTurnPlayer === 1 ? player2CheatTokens : player1CheatTokens }).map((_, i) => (
                  <CheatToken key={i} isUsed={false} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(currentTurnPlayer === 1 ? player2Stacks : player1Stacks).map((stack, idx) => (
                <CardStack
                  key={idx}
                  stackNumber={idx + 1}
                  cards={stack}
                />
              ))}
            </div>
          </div>

          {/* Dice Area */}
          <div className="flex flex-col items-center gap-6">
            {lastRoll && (
              <div className="text-center text-lg text-muted-foreground">
                Last Roll: <span className={cn("font-bold", lastRoll.color === "green" ? "text-game-green" : "text-game-red")}>
                  {lastRoll.number} ({lastRoll.color})
                </span>
              </div>
            )}
            
            <Dice onRoll={handleDiceRoll} isRolling={isRolling} />

            {/* Cheat Tokens */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">Cheat Moves: {currentCheatTokens}</p>
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CheatToken
                    key={i}
                    isUsed={i >= currentCheatTokens}
                    onClick={i < currentCheatTokens ? handleCheatMove : undefined}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Current Player's Stacks */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Your Cards</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(currentTurnPlayer === 1 ? player1Stacks : player2Stacks).map((stack, idx) => (
                <CardStack
                  key={idx}
                  stackNumber={idx + 1}
                  cards={stack}
                  isPlayerStack
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Victory Phase */}
      {gamePhase === "victory" && winner && (
        <div className="flex flex-col items-center gap-8 animate-celebration">
          <Trophy className="w-32 h-32 text-game-highlight animate-pulse-glow" />
          <h2 className="text-6xl font-bold bg-gradient-to-r from-game-highlight to-primary bg-clip-text text-transparent">
            Player {winner} Wins!
          </h2>
          <Button
            onClick={resetGame}
            size="lg"
            className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-primary to-accent"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            Play Again
          </Button>
        </div>
      )}

      {/* Cheat Move Selector */}
      {showingCheatSelector && (
        <CheatMoveSelector
          onSelect={handleCheatSelect}
          onCancel={() => setShowingCheatSelector(false)}
        />
      )}
    </div>
  );
};

export default Index;
