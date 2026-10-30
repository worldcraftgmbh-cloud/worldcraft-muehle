import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, GameState, Player, GamePhase, MoveRecord } from './types/game';
import { createInitialState, executePlace, executeMove, executeRemovePiece } from './logic/engine';
import { getPlayerPhase, getValidMovesForPiece, isPieceRemovable } from './logic/rules';
import { getBestAIMove } from './ai/minimax';
import { firestoreService } from './services/firestoreService';
import { soundManager } from './sound/soundEffects';

import { Header } from './components/Header';
import { Board } from './components/Board';
import { PlayerCard } from './components/PlayerCard';
import { ActionBanner } from './components/ActionBanner';
import { MoveHistory } from './components/MoveHistory';
import { RulesModal } from './components/RulesModal';
import { FirestoreModal } from './components/FirestoreModal';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [historyStack, setHistoryStack] = useState<GameState[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('AI_HARD');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getIsMuted());
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isFirestoreOpen, setIsFirestoreOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => firestoreService.isCloudConnected());

  const [aiCountdown, setAiCountdown] = useState<number | null>(null);

  const aiTimerRef = useRef<number | null>(null);
  const aiIntervalRef = useRef<number | null>(null);

  const isPlayerAi = useCallback(
    (player: Player): boolean => {
      if (gameMode === 'PVP') return false;
      if (gameMode === 'AI_VS_AI') return true;
      // In single player modes, Black is the AI
      return player === 'BLACK';
    },
    [gameMode]
  );

  const isCurrentAi = isPlayerAi(gameState.currentPlayer);

  // Restart / Reset game
  const handleRestart = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    setAiCountdown(null);
    setGameState(createInitialState());
    setHistoryStack([]);
  }, []);

  // Handle Game Mode change
  const handleSelectGameMode = (mode: GameMode) => {
    setGameMode(mode);
    handleRestart();
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyStack.length === 0 || gameState.status === 'WIN') return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    setAiCountdown(null);

    // In AI mode, undo 2 steps if opponent is AI, so it returns to human's turn
    if (gameMode !== 'PVP' && historyStack.length >= 2 && !isCurrentAi) {
      const targetState = historyStack[historyStack.length - 2];
      setHistoryStack(prev => prev.slice(0, prev.length - 2));
      setGameState({ ...targetState, isAiThinking: false });
    } else {
      const targetState = historyStack[historyStack.length - 1];
      setHistoryStack(prev => prev.slice(0, prev.length - 1));
      setGameState({ ...targetState, isAiThinking: false });
    }
    soundManager.playSelect();
  };

  // Trigger win effects & persist to Firestore muehle_positions
  const handleGameEnd = useCallback((winner: Player | null, finalHistory?: MoveRecord[]) => {
    if (winner) {
      soundManager.playWin();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f3e5ab', '#ffffff', '#38bdf8', '#ef4444'],
      });
    }

    const historyToSave = finalHistory || gameState.moveHistory;
    firestoreService.recordGameEnd(historyToSave, winner, winner === null).catch(console.error);
  }, [gameState.moveHistory]);

  // Execute Human Point Click
  const handlePointClick = (point: number) => {
    if (gameState.status !== 'IN_PROGRESS' || isCurrentAi) return;

    const current = gameState.currentPlayer;
    const opponent: Player = current === 'WHITE' ? 'BLACK' : 'WHITE';
    const currentPhase: GamePhase = getPlayerPhase(
      gameState.placedPieces[current],
      gameState.piecesOnBoard[current]
    );

    // 1. Must remove opponent piece (Mill capture mode)
    if (gameState.mustRemovePiece) {
      if (isPieceRemovable(gameState.board, point, opponent)) {
        setHistoryStack(prev => [...prev, gameState]);
        const { nextState } = executeRemovePiece(gameState, point);
        soundManager.playRemove();
        setGameState(nextState);

        if (nextState.status === 'WIN') {
          handleGameEnd(nextState.winner, nextState.moveHistory);
        }
      }
      return;
    }

    // 2. Phase 1: Placing a piece
    if (currentPhase === 'PLACING') {
      if (gameState.board[point] === null) {
        setHistoryStack(prev => [...prev, gameState]);
        const { nextState, soundEffect } = executePlace(gameState, point);

        if (soundEffect === 'mill') {
          soundManager.playMill();
          const lastMove = nextState.moveHistory[nextState.moveHistory.length - 1];
          if (lastMove) firestoreService.recordMillBonusDirect(lastMove);
        } else if (soundEffect === 'place') {
          soundManager.playPlace();
        } else if (soundEffect === 'win') {
          soundManager.playWin();
        }

        setGameState(nextState);

        if (nextState.status === 'WIN') {
          handleGameEnd(nextState.winner, nextState.moveHistory);
        }
      }
      return;
    }

    // 3. Phase 2 & 3: Moving or Flying
    if (gameState.selectedPoint === null) {
      // Select own piece
      if (gameState.board[point] === current) {
        const moves = getValidMovesForPiece(gameState.board, point, currentPhase);
        if (moves.length > 0) {
          setGameState(prev => ({ ...prev, selectedPoint: point }));
          soundManager.playSelect();
        }
      }
    } else {
      // Piece already selected
      if (point === gameState.selectedPoint) {
        // Deselect
        setGameState(prev => ({ ...prev, selectedPoint: null }));
        soundManager.playSelect();
      } else if (gameState.board[point] === current) {
        // Change selection to another own piece
        const moves = getValidMovesForPiece(gameState.board, point, currentPhase);
        if (moves.length > 0) {
          setGameState(prev => ({ ...prev, selectedPoint: point }));
          soundManager.playSelect();
        }
      } else {
        // Attempt to move to point
        const validMoves = getValidMovesForPiece(
          gameState.board,
          gameState.selectedPoint,
          currentPhase
        );

        if (validMoves.includes(point)) {
          setHistoryStack(prev => [...prev, gameState]);
          const { nextState, soundEffect } = executeMove(
            gameState,
            gameState.selectedPoint,
            point
          );

          if (soundEffect === 'mill') {
            soundManager.playMill();
            const lastMove = nextState.moveHistory[nextState.moveHistory.length - 1];
            if (lastMove) firestoreService.recordMillBonusDirect(lastMove);
          } else if (soundEffect === 'move') {
            soundManager.playMove();
          } else if (soundEffect === 'win') {
            soundManager.playWin();
          }

          setGameState(nextState);

          if (nextState.status === 'WIN') {
            handleGameEnd(nextState.winner, nextState.moveHistory);
          }
        }
      }
    }
  };

  // AI Turn Handler Effect (⏳ Gewünschte Bedenkzeit: 5 Sekunden nach Spielerzug)
  const isAiExecutingRef = useRef(false);

  useEffect(() => {
    if (gameState.status !== 'IN_PROGRESS' || !isCurrentAi) {
      isAiExecutingRef.current = false;
      setAiCountdown(null);
      return;
    }

    if (isAiExecutingRef.current) return;
    isAiExecutingRef.current = true;

    // 5-Sekunden Countdown starten (5 -> 4 -> 3 -> 2 -> 1)
    setAiCountdown(5);
    let count = 5;

    const interval = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setAiCountdown(count);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    aiIntervalRef.current = interval;

    const timer = window.setTimeout(() => {
      clearInterval(interval);
      aiIntervalRef.current = null;
      aiTimerRef.current = null;
      setAiCountdown(null);

      try {
        const aiMove = getBestAIMove(gameState);
        if (!aiMove) {
          isAiExecutingRef.current = false;
          return;
        }

        let resultState: GameState = gameState;

        if (aiMove.type === 'PLACE') {
          const { nextState, soundEffect } = executePlace(gameState, aiMove.point!);
          resultState = nextState;
          if (soundEffect === 'mill') {
            soundManager.playMill();
            const lastMove = nextState.moveHistory[nextState.moveHistory.length - 1];
            if (lastMove) firestoreService.recordMillBonusDirect(lastMove);
          } else {
            soundManager.playPlace();
          }
        } else if (aiMove.type === 'MOVE') {
          const { nextState, soundEffect } = executeMove(gameState, aiMove.from!, aiMove.to!);
          resultState = nextState;
          if (soundEffect === 'mill') {
            soundManager.playMill();
            const lastMove = nextState.moveHistory[nextState.moveHistory.length - 1];
            if (lastMove) firestoreService.recordMillBonusDirect(lastMove);
          } else {
            soundManager.playMove();
          }
        } else if (aiMove.type === 'REMOVE') {
          const { nextState } = executeRemovePiece(gameState, aiMove.point!);
          resultState = nextState;
          soundManager.playRemove();
        }

        // Falls KI eine Mühle gebildet hat, sofort im gleichen Zug einen Stein schlagen
        if (resultState.mustRemovePiece && isPlayerAi(resultState.currentPlayer)) {
          const removeMove = getBestAIMove(resultState);
          if (removeMove && removeMove.type === 'REMOVE') {
            const { nextState } = executeRemovePiece(resultState, removeMove.point!);
            resultState = nextState;
            soundManager.playRemove();
          }
        }

        setGameState(resultState);

        if (resultState.status === 'WIN') {
          handleGameEnd(resultState.winner, resultState.moveHistory);
        }
      } finally {
        isAiExecutingRef.current = false;
      }
    }, 5000); // Exakt 5 Sekunden Bedenkzeit

    aiTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      aiTimerRef.current = null;
      aiIntervalRef.current = null;
      isAiExecutingRef.current = false;
    };
  }, [gameState, isCurrentAi, handleGameEnd, isPlayerAi]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-900">
      {/* Top Navigation & Controls */}
      <Header
        gameMode={gameMode}
        onSelectGameMode={handleSelectGameMode}
        onRestart={handleRestart}
        onUndo={handleUndo}
        canUndo={historyStack.length > 0 && gameState.status === 'IN_PROGRESS'}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenFirestore={() => setIsFirestoreOpen(true)}
        isCloudConnected={isCloudConnected}
      />

      {/* Main Game Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between gap-6">
        {/* Dynamic Instructional Action Banner */}
        <ActionBanner state={gameState} isAiTurn={isCurrentAi} aiCountdown={aiCountdown} />

        {/* Board and Player Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: White Player Card */}
          <div className="lg:col-span-3 order-2 lg:order-1 space-y-4">
            <PlayerCard
              player="WHITE"
              isActive={gameState.currentPlayer === 'WHITE' && gameState.status === 'IN_PROGRESS'}
              placedPieces={gameState.placedPieces.WHITE}
              piecesOnBoard={gameState.piecesOnBoard.WHITE}
              capturedPieces={gameState.capturedPieces.BLACK}
              isAi={isPlayerAi('WHITE')}
              isAiThinking={isPlayerAi('WHITE') && gameState.currentPlayer === 'WHITE' && gameState.status === 'IN_PROGRESS'}
              countdown={gameState.currentPlayer === 'WHITE' ? aiCountdown : null}
            />

            {/* Quick Helper Tips */}
            <div className="hidden lg:block bg-stone-900/60 p-4 rounded-2xl border border-stone-800 text-xs space-y-2">
              <span className="font-bold text-amber-400 block">Taktik-Tipp:</span>
              <p className="text-stone-400 leading-relaxed">
                Achte darauf, Kreuze und Kreuzungspunkte (z. B. d2, d6, b4, f4) zu besetzen. Sie bieten doppelte Zugmöglichkeiten und Mühlen-Chancen!
              </p>
            </div>
          </div>

          {/* Center Column: The Mühle SVG Board */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center">
            <Board
              state={gameState}
              onPointClick={handlePointClick}
              disabled={isCurrentAi || gameState.status !== 'IN_PROGRESS'}
            />
          </div>

          {/* Right Column: Black Player Card & Move History */}
          <div className="lg:col-span-3 order-3 space-y-4">
            <PlayerCard
              player="BLACK"
              isActive={gameState.currentPlayer === 'BLACK' && gameState.status === 'IN_PROGRESS'}
              placedPieces={gameState.placedPieces.BLACK}
              piecesOnBoard={gameState.piecesOnBoard.BLACK}
              capturedPieces={gameState.capturedPieces.WHITE}
              isAi={isPlayerAi('BLACK')}
              isAiThinking={isPlayerAi('BLACK') && gameState.currentPlayer === 'BLACK' && gameState.status === 'IN_PROGRESS'}
              countdown={gameState.currentPlayer === 'BLACK' ? aiCountdown : null}
            />

            <MoveHistory history={gameState.moveHistory} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <FirestoreModal
        isOpen={isFirestoreOpen}
        onClose={() => setIsFirestoreOpen(false)}
        onConfigUpdated={() => setIsCloudConnected(firestoreService.isCloudConnected())}
      />
    </div>
  );
};
