import React from 'react';
import { GameState, GamePhase } from '../types/game';
import { getPlayerPhase } from '../logic/rules';
import { Swords, Trophy, Sparkles } from 'lucide-react';

interface ActionBannerProps {
  state: GameState;
  isAiTurn: boolean;
  aiCountdown?: number | null;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({ state, isAiTurn, aiCountdown }) => {
  const current = state.currentPlayer;
  const opponent = current === 'WHITE' ? 'Schwarz' : 'Weiß';
  const currentName = current === 'WHITE' ? 'Weiß' : 'Schwarz';

  const phase: GamePhase = getPlayerPhase(
    state.placedPieces[current],
    state.piecesOnBoard[current]
  );

  // 1. Victory / Game Over
  if (state.status === 'WIN') {
    const winnerName = state.winner === 'WHITE' ? 'Weiß' : 'Schwarz';
    return (
      <div className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-0.5 rounded-2xl shadow-xl shadow-amber-500/20 animate-bounce">
        <div className="bg-stone-950 px-5 py-3 rounded-[15px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-yellow-300">
                Sieg für {winnerName}!
              </h3>
              <p className="text-xs text-stone-300">{state.winReason}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Mill Formed - Piece Removal Prompt
  if (state.mustRemovePiece) {
    return (
      <div className="w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 p-0.5 rounded-2xl shadow-lg shadow-red-500/20 animate-pulse">
        <div className="bg-stone-950 px-5 py-3 rounded-[15px] flex items-center gap-3">
          <Swords className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400 text-sm tracking-wide uppercase">
                Mühle geschlossen!
              </span>
              <span className="text-xs px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded-full font-mono">
                {currentName}
              </span>
            </div>
            <p className="text-xs text-stone-300">
              {isAiTurn
                ? 'KI wählt einen gegnerischen Stein zum Schlagen...'
                : `Wähle einen gegnerischen Stein von ${opponent} zum Schlagen (geschützte Mühlen ausgenommen).`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Normal Turns
  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-3 h-3 rounded-full ${
            current === 'WHITE' ? 'bg-amber-400 shadow-glow-gold' : 'bg-cyan-400 shadow-glow-cyan'
          }`}
        />
        <div className="text-xs">
          <span className="font-bold text-stone-200 mr-1.5">{currentName} ist am Zug:</span>
          {isAiTurn && aiCountdown !== null && aiCountdown !== undefined ? (
            <span className="text-amber-300 font-medium">
              KI überlegt und analysiert das Brett... Zug in <strong className="font-mono text-amber-400">{aiCountdown}s</strong>
            </span>
          ) : (
            <>
              {phase === 'PLACING' && (
                <span className="text-stone-300">
                  Setze einen Stein auf einen beliebigen freien Punkt.
                </span>
              )}
              {phase === 'MOVING' && (
                <span className="text-stone-300">
                  {state.selectedPoint !== null
                    ? 'Wähle ein benachbartes markiertes Feld zum Ziehen.'
                    : 'Klicke auf einen deiner Steine, um ihn auszuwählen.'}
                </span>
              )}
              {phase === 'FLYING' && (
                <span className="text-purple-300 font-medium">
                  Springen aktiv! Wähle deinen Stein und springe auf ein beliebiges freies Feld.
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>3er-Reihe = Schlagen</span>
      </div>
    </div>
  );
};
