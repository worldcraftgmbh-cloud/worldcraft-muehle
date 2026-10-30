import { Player, GameState, GamePhase } from '../types/game';
import {
  getPlayerPhase,
  getValidPlacements,
  getValidMovesForPiece,
  getRemovablePieces,
  didFormMill,
} from '../logic/rules';
import { ALL_MILLS } from '../logic/boardConstants';

export interface AIMove {
  type: 'PLACE' | 'MOVE' | 'REMOVE';
  point?: number;
  from?: number;
  to?: number;
}

/**
 * Findet alle leeren Punkte, an denen der angegebene Spieler mit einem Stein sofort eine Mühle vollenden würde.
 */
function findMillCompletingPoints(
  board: (Player | null)[],
  player: Player
): number[] {
  const completingPoints: number[] = [];

  for (const [p1, p2, p3] of ALL_MILLS) {
    const pieces = [board[p1], board[p2], board[p3]];
    const playerCount = pieces.filter(p => p === player).length;
    const emptyCount = pieces.filter(p => p === null).length;

    if (playerCount === 2 && emptyCount === 1) {
      if (board[p1] === null && !completingPoints.includes(p1)) completingPoints.push(p1);
      if (board[p2] === null && !completingPoints.includes(p2)) completingPoints.push(p2);
      if (board[p3] === null && !completingPoints.includes(p3)) completingPoints.push(p3);
    }
  }

  return completingPoints;
}

/**
 * 🎯 Intelligente Mühle-KI-Entscheidungslogik:
 * 1. Priorität 1: Sofort eigene Mühle schließen (100% Priorität, kein Zufall)
 * 2. Priorität 2: Gegnerische Mühle sofort blockieren (100% Priorität)
 * 3. Fallback: Zufallsauswahl unter den verbleibenden legalen Zügen
 */
export function getBestAIMove(
  state: GameState,
  _difficulty?: string
): AIMove | null {
  const current = state.currentPlayer;
  const opponent: Player = current === 'WHITE' ? 'BLACK' : 'WHITE';

  // -------------------------------------------------------------
  // SCHRITT 0: Mühle geschlossen -> Gegnerischen Stein schlagen
  // -------------------------------------------------------------
  if (state.mustRemovePiece) {
    const removable = getRemovablePieces(state.board, opponent);
    if (removable.length === 0) return null;

    // Taktischer Bonus: Falls der Gegner eine offene 2er-Reihe hat, bevorzugt diesen Stein schlagen!
    const opponentThreats = findMillCompletingPoints(state.board, opponent);
    for (const p of removable) {
      // Prüfe, ob das Entfernen dieses Steins eine gegnerische 2er-Reihe zerstört
      const tempBoard = [...state.board];
      tempBoard[p] = null;
      const afterThreats = findMillCompletingPoints(tempBoard, opponent);
      if (afterThreats.length < opponentThreats.length) {
        console.log(`[KI Taktik] Schlage gegnerischen Droh-Stein auf #${p}`);
        return { type: 'REMOVE', point: p };
      }
    }

    // Andernfalls zufällig einen erlaubten Stein entfernen
    const randomIdx = Math.floor(Math.random() * removable.length);
    return { type: 'REMOVE', point: removable[randomIdx] };
  }

  const phase: GamePhase = getPlayerPhase(
    state.placedPieces[current],
    state.piecesOnBoard[current]
  );

  // -------------------------------------------------------------
  // PHASE 1: SETZEN (PLACING)
  // -------------------------------------------------------------
  if (phase === 'PLACING') {
    const freePoints = getValidPlacements(state.board);
    if (freePoints.length === 0) return null;

    // PRIORITÄT 1: Kann die KI sofort eine eigene Mühle schließen?
    for (const point of freePoints) {
      const tempBoard = [...state.board];
      tempBoard[point] = current;
      if (didFormMill(state.board, tempBoard, point, current).formed) {
        console.log(`[KI Prio 1] 👑 Eigene Mühle vollendet durch Setzen auf #${point}!`);
        return { type: 'PLACE', point };
      }
    }

    // PRIORITÄT 2: Droht der Gegner eine Mühle zu vollenden? Sofort blockieren!
    const opponentThreatPoints = findMillCompletingPoints(state.board, opponent);
    for (const blockPoint of opponentThreatPoints) {
      if (freePoints.includes(blockPoint)) {
        console.log(`[KI Prio 2] 🛡️ Gegnerische Mühle blockiert auf #${blockPoint}!`);
        return { type: 'PLACE', point: blockPoint };
      }
    }

    // PRIORITÄT 3: Zufallszug auf freies Feld
    const chosenPoint = freePoints[Math.floor(Math.random() * freePoints.length)];
    return { type: 'PLACE', point: chosenPoint };
  }

  // -------------------------------------------------------------
  // PHASE 2 & 3: ZIEHEN & SPRINGEN (MOVING & FLYING)
  // -------------------------------------------------------------
  const legalMoves: { from: number; to: number }[] = [];

  for (let from = 0; from < 24; from++) {
    if (state.board[from] === current) {
      const dests = getValidMovesForPiece(state.board, from, phase);
      for (const to of dests) {
        legalMoves.push({ from, to });
      }
    }
  }

  if (legalMoves.length === 0) return null;

  // PRIORITÄT 1: Kann die KI durch Ziehen/Springen eine eigene Mühle schließen?
  for (const move of legalMoves) {
    const tempBoard = [...state.board];
    tempBoard[move.from] = null;
    tempBoard[move.to] = current;

    if (didFormMill(state.board, tempBoard, move.to, current).formed) {
      console.log(`[KI Prio 1] 👑 Eigene Mühle vollendet durch Zug von #${move.from} nach #${move.to}!`);
      return { type: 'MOVE', from: move.from, to: move.to };
    }
  }

  // PRIORITÄT 2: Droht der Gegner eine Mühle zu vollenden? Sofort blockieren!
  const opponentThreatPoints = findMillCompletingPoints(state.board, opponent);
  if (opponentThreatPoints.length > 0) {
    for (const move of legalMoves) {
      if (opponentThreatPoints.includes(move.to)) {
        console.log(`[KI Prio 2] 🛡️ Gegnerische Mühle blockiert durch Zug von #${move.from} nach #${move.to}!`);
        return { type: 'MOVE', from: move.from, to: move.to };
      }
    }
  }

  // PRIORITÄT 3: Zufallsauswahl unter den legalen Zügen
  const chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  return { type: 'MOVE', from: chosenMove.from, to: chosenMove.to };
}
