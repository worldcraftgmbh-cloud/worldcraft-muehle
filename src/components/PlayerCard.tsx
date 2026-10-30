import React from 'react';
import { Player, GamePhase } from '../types/game';
import { getPlayerPhase } from '../logic/rules';
import { Bot, Sparkles, User, Zap } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  placedPieces: number;
  piecesOnBoard: number;
  capturedPieces: number; // how many pieces of the OTHER player this player captured
  isAi: boolean;
  isAiThinking: boolean;
  countdown?: number | null;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  placedPieces,
  piecesOnBoard,
  capturedPieces,
  isAi,
  isAiThinking,
  countdown,
}) => {
  const isWhite = player === 'WHITE';
  const phase: GamePhase = getPlayerPhase(placedPieces, piecesOnBoard);
  const remainingToPlace = Math.max(0, 9 - placedPieces);

  return (
    <div
      className={`relative rounded-2xl p-4 transition-all duration-300 border ${
        isActive
          ? isWhite
            ? 'bg-stone-900/90 border-amber-400 shadow-glow-gold'
            : 'bg-stone-900/90 border-cyan-400 shadow-glow-cyan'
          : 'bg-stone-950/60 border-stone-800 opacity-75'
      }`}
    >
      {/* Active Turn Indicator Strip */}
      {isActive && (
        <div
          className={`absolute -top-1.5 left-6 right-6 h-1 rounded-full ${
            isWhite ? 'bg-amber-400' : 'bg-cyan-400'
          } animate-pulse`}
        />
      )}

      {/* Header with Name & Role */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar Disc */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md relative ${
              isWhite
                ? 'bg-gradient-to-br from-white via-stone-200 to-stone-400 text-stone-900 border border-stone-300'
                : 'bg-gradient-to-br from-stone-700 via-stone-900 to-black text-amber-400 border border-stone-700'
            }`}
          >
            {isAi ? (
              <Bot className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
            {isActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-900 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-base tracking-wide text-stone-100">
                {isWhite ? 'Weiß' : 'Schwarz'}
              </h2>
              {isAi && (
                <span className="text-[10px] px-1.5 py-0.5 bg-stone-800 text-stone-400 rounded-md font-mono">
                  KI
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              {isAi ? (isAiThinking ? 'Überlegt...' : 'Bereit') : (isActive ? 'Am Zug' : 'Wartet')}
            </p>
          </div>
        </div>

        {/* Phase Pill Badge */}
        <div>
          {phase === 'PLACING' && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
              Phase 1: Setzen
            </span>
          )}
          {phase === 'MOVING' && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 font-medium">
              Phase 2: Ziehen
            </span>
          )}
          {phase === 'FLYING' && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold animate-pulse">
              <Zap className="w-3 h-3 text-purple-400" /> Phase 3: Springen!
            </span>
          )}
        </div>
      </div>

      {/* Piece Counts & Visual Hand Inventory */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-stone-950/70 p-2.5 rounded-xl border border-stone-800/80 mb-3">
        <div>
          <span className="text-stone-400 block text-[11px]">Auf dem Brett</span>
          <span className="text-stone-100 font-bold text-sm">
            {piecesOnBoard} Steine
          </span>
        </div>
        <div>
          <span className="text-stone-400 block text-[11px]">Geschlagen</span>
          <span className="text-emerald-400 font-bold text-sm">
            +{capturedPieces} Steine
          </span>
        </div>
      </div>

      {/* Phase 1 Hand Stones (9 tokens display) */}
      {phase === 'PLACING' ? (
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
            <span>Hand-Vorrat ({remainingToPlace}/9 verbleibend):</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: 9 }).map((_, idx) => {
              const isPlaced = idx < placedPieces;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all border ${
                    isPlaced
                      ? 'opacity-20 bg-stone-700 border-stone-800'
                      : isWhite
                      ? 'bg-stone-200 border-white shadow-sm'
                      : 'bg-stone-900 border-stone-600 shadow-sm'
                  }`}
                  title={isPlaced ? 'Bereits gesetzt' : 'Noch zu setzen'}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-stone-400">
          {phase === 'FLYING' ? (
            <p className="text-purple-300 font-medium">
              3 Steine übrig: Kann frei auf jedes Feld springen!
            </p>
          ) : (
            <p className="text-stone-400">
              Zieht entlang der Linien auf benachbarte Felder.
            </p>
          )}
        </div>
      )}

      {/* AI Thinking Spinner with Countdown */}
      {isAi && isAiThinking && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>KI überlegt...</span>
          </div>
          {countdown !== undefined && countdown !== null && (
            <span className="font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] border border-amber-500/30">
              {countdown}s
            </span>
          )}
        </div>
      )}
    </div>
  );
};
