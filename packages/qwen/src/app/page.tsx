'use client';

import { useState } from 'react';
import { Chess, Square, Piece, Move } from 'chess.js';

const PIECE_SYMBOLS: Record<string, string> = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

export default function ChessGame() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>('');

  const makeComputerMove = (currentGame: Chess) => {
    const moves = currentGame.moves();
    if (moves.length === 0) return;
    
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    currentGame.move(randomMove);
    
    if (currentGame.isGameOver()) {
      setGameOver(true);
      if (currentGame.isCheckmate()) {
        setWinner('Computer wins!');
      } else {
        setWinner('Draw!');
      }
    }
  };

  const handleSquareClick = (square: Square) => {
    if (gameOver) return;

    const piece = game.get(square);
    
    if (selectedSquare) {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q' as const
      };
      
      try {
        const newGame = new Chess(game.fen());
        newGame.move(move);
        setGame(newGame);
        setSelectedSquare(null);
        setPossibleMoves([]);
        
        if (newGame.isGameOver()) {
          setGameOver(true);
          if (newGame.isCheckmate()) {
            setWinner('You win!');
          } else {
            setWinner('Draw!');
          }
        } else {
          setTimeout(() => {
            const computerGame = new Chess(newGame.fen());
            makeComputerMove(computerGame);
            setGame(computerGame);
          }, 300);
        }
      } catch {
        if (piece && piece.color === 'w') {
          setSelectedSquare(square);
          const verboseMoves = game.moves({ verbose: true, square: square }) as Move[];
          setPossibleMoves(verboseMoves.map(m => m.to));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
        const verboseMoves = game.moves({ verbose: true, square: square }) as Move[];
        setPossibleMoves(verboseMoves.map(m => m.to));
      }
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setGameOver(false);
    setWinner('');
  };

  const renderSquare = (square: Square, piece: Piece | undefined, rowIndex: number, colIndex: number) => {
    const isLight = (rowIndex + colIndex) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    
    const colors = [
      'from-pink-400 to-purple-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-red-400 to-pink-500',
      'from-indigo-400 to-purple-500',
      'from-teal-400 to-blue-500',
      'from-orange-400 to-red-500'
    ];
    
    const lightColor = colors[(rowIndex + colIndex) % colors.length];
    const darkColor = colors[(rowIndex + colIndex + 1) % colors.length];
    
    return (
      <button
        key={square}
        onClick={() => handleSquareClick(square)}
        className={`
          w-full h-full flex items-center justify-center text-4xl md:text-5xl lg:text-6xl
          transition-all duration-200 relative
          ${isLight ? `bg-gradient-to-br ${lightColor}` : `bg-gradient-to-br ${darkColor}`}
          ${isSelected ? 'ring-4 ring-yellow-300 scale-95' : ''}
          ${isPossibleMove ? 'ring-2 ring-white' : ''}
          hover:scale-95 active:scale-90
        `}
      >
        {piece && (
          <span className={`drop-shadow-lg ${piece.color === 'w' ? 'text-white' : 'text-gray-900'}`}>
            {PIECE_SYMBOLS[piece.color + piece.type]}
          </span>
        )}
        {isPossibleMove && !piece && (
          <div className="absolute w-3 h-3 bg-white rounded-full opacity-60" />
        )}
      </button>
    );
  };

  const board = [];
  for (let i = 0; i < 8; i++) {
    const row = [];
    for (let j = 0; j < 8; j++) {
      const square = (String.fromCharCode(97 + j) + (8 - i)) as Square;
      const piece = game.get(square);
      row.push(renderSquare(square, piece, i, j));
    }
    board.push(
      <div key={i} className="grid grid-cols-8 w-full aspect-[8/1]">
        {row}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6 drop-shadow-lg">
          Colorful Chess
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl">
          <div className="aspect-square w-full rounded-lg overflow-hidden shadow-2xl border-4 border-white/20">
            {board}
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-4">
            {gameOver && (
              <div className="text-2xl md:text-3xl font-bold text-white text-center animate-pulse">
                {winner}
              </div>
            )}
            
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full
                       hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 active:scale-95
                       transition-all duration-200 shadow-lg"
            >
              New Game
            </button>
            
            <div className="text-white/80 text-center text-sm md:text-base">
              {game.turn() === 'w' ? "Your turn (White)" : "Computer's turn (Black)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
