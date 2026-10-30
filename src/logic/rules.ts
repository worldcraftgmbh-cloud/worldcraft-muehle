import { Player, GamePhase, GameState } from '../types/game';
import { ADJACENCY, ALL_MILLS, POINT_TO_MILLS, BOARD_POINTS } from './boardConstants';

/**
 * Returns the current phase of a player based on their placed and current piece counts.
 */
export function getPlayerPhase(placedCount: number, piecesOnBoard: number): GamePhase {
  if (placedCount < 9) {
    return 'PLACING';
  }
  if (piecesOnBoard === 3) {
    return 'FLYING';
  }
  return 'MOVING';
}

/**
 * Check if a point is part of any closed mill for the given player.
 */
export function isPointInMill(
  board: (Player | null)[],
  point: number,
  player: Player
): boolean {
  if (board[point] !== player) return false;
  const mills = POINT_TO_MILLS[point];
  return mills.some(mill =>
    mill.every(p => board[p] === player)
  );
}

/**
 * Get all closed mills that include the given point for the given player.
 */
export function getMillsAtPoint(
  board: (Player | null)[],
  point: number,
  player: Player
): (readonly [number, number, number])[] {
  if (board[point] !== player) return [];
  const candidateMills = POINT_TO_MILLS[point];
  return candidateMills.filter(mill =>
    mill.every(p => board[p] === player)
  );
}

/**
 * Get all closed mills currently on the board for a player.
 */
export function getAllMillsForPlayer(
  board: (Player | null)[],
  player: Player
): (readonly [number, number, number])[] {
  return ALL_MILLS.filter(mill => mill.every(p => board[p] === player));
}

/**
 * Checks whether an opponent's piece at `point` is legally removable.
 * Standard rule:
 * - The point must contain an opponent's piece.
 * - Pieces in a closed mill are protected, UNLESS all of the opponent's pieces are in mills.
 */
export function isPieceRemovable(
  board: (Player | null)[],
  point: number,
  opponent: Player
): boolean {
  if (board[point] !== opponent) return false;

  const inMill = isPointInMill(board, point, opponent);
  if (!inMill) return true;

  // If in mill, check if opponent has ANY piece that is NOT in a mill
  const hasPieceOutsideMill = board.some((p, idx) =>
    p === opponent && !isPointInMill(board, idx, opponent)
  );

  // If opponent has at least one piece outside mills, this mill piece cannot be removed.
  // If all pieces are inside mills, any piece can be removed.
  return !hasPieceOutsideMill;
}

/**
 * Get all point indices where the opponent has a piece that can legally be removed.
 */
export function getRemovablePieces(
  board: (Player | null)[],
  opponent: Player
): number[] {
  const opponentPoints: number[] = [];
  const nonMillOpponentPoints: number[] = [];

  for (let i = 0; i < 24; i++) {
    if (board[i] === opponent) {
      opponentPoints.push(i);
      if (!isPointInMill(board, i, opponent)) {
        nonMillOpponentPoints.push(i);
      }
    }
  }

  // If there are pieces outside of mills, only those can be removed
  if (nonMillOpponentPoints.length > 0) {
    return nonMillOpponentPoints;
  }

  // Otherwise, all opponent pieces (even in mills) can be removed
  return opponentPoints;
}

/**
 * Get all valid destination points for moving a piece from `fromPoint`.
 */
export function getValidMovesForPiece(
  board: (Player | null)[],
  fromPoint: number,
  phase: GamePhase
): number[] {
  if (phase === 'FLYING') {
    // Flying phase: can jump to any empty spot on the entire board
    const destinations: number[] = [];
    for (let i = 0; i < 24; i++) {
      if (board[i] === null) {
        destinations.push(i);
      }
    }
    return destinations;
  }

  // Moving phase: only adjacent empty spots
  const neighbors = ADJACENCY[fromPoint];
  return neighbors.filter(neighbor => board[neighbor] === null);
}

/**
 * Get all empty points on the board (valid for placement).
 */
export function getValidPlacements(board: (Player | null)[]): number[] {
  const placements: number[] = [];
  for (let i = 0; i < 24; i++) {
    if (board[i] === null) {
      placements.push(i);
    }
  }
  return placements;
}

/**
 * Check if the player has any legal moves available on their turn.
 */
export function hasAnyLegalMove(
  board: (Player | null)[],
  player: Player,
  phase: GamePhase
): boolean {
  if (phase === 'PLACING') {
    return board.some(spot => spot === null);
  }

  if (phase === 'FLYING') {
    // Has 3 pieces, can fly if there is any empty spot
    return board.some(spot => spot === null);
  }

  // Phase is 'MOVING': Check if any piece belonging to `player` has at least 1 adjacent empty spot
  for (let i = 0; i < 24; i++) {
    if (board[i] === player) {
      const neighbors = ADJACENCY[i];
      if (neighbors.some(n => board[n] === null)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if placing or moving to `targetPoint` completed one or more NEW mills.
 */
export function didFormMill(
  _boardBefore: (Player | null)[],
  boardAfter: (Player | null)[],
  targetPoint: number,
  player: Player
): { formed: boolean; millPoints: number[] } {
  // Candidate mills that include targetPoint
  const candidateMills = POINT_TO_MILLS[targetPoint];
  const newMillPoints = new Set<number>();

  for (const mill of candidateMills) {
    const isClosedNow = mill.every(p => boardAfter[p] === player);
    if (!isClosedNow) continue;

    // Was this exact mill already closed by the player before this move?
    // Since targetPoint was empty before (boardBefore[targetPoint] === null),
    // this mill could not have been closed before!
    // Thus, it is guaranteed to be freshly closed.
    mill.forEach(p => newMillPoints.add(p));
  }

  return {
    formed: newMillPoints.size > 0,
    millPoints: Array.from(newMillPoints),
  };
}

/**
 * Format algebraic point label (e.g., 'a7', 'd6')
 */
export function getPointLabel(pointIndex: number): string {
  return BOARD_POINTS[pointIndex]?.label ?? `#${pointIndex}`;
}

/**
 * Check game end conditions:
 * - A player with placedPieces == 9 and piecesOnBoard < 3 LOSES.
 * - A player whose turn it is but has NO legal moves LOSES.
 */
export function evaluateGameEnd(state: GameState): {
  isOver: boolean;
  winner: Player | null;
  reason: string | null;
} {
  const current = state.currentPlayer;
  const opponent: Player = current === 'WHITE' ? 'BLACK' : 'WHITE';

  // Check if either player has less than 3 pieces in Phase 2 or 3
  if (state.placedPieces[current] === 9 && state.piecesOnBoard[current] < 3) {
    return {
      isOver: true,
      winner: opponent,
      reason: `${current === 'WHITE' ? 'Weiß' : 'Schwarz'} hat weniger als 3 Steine verbleibend.`,
    };
  }

  if (state.placedPieces[opponent] === 9 && state.piecesOnBoard[opponent] < 3) {
    return {
      isOver: true,
      winner: current,
      reason: `${opponent === 'WHITE' ? 'Weiß' : 'Schwarz'} hat weniger als 3 Steine verbleibend.`,
    };
  }

  // If not currently waiting for a piece removal, check if current player can move
  if (!state.mustRemovePiece) {
    const currentPhase = getPlayerPhase(
      state.placedPieces[current],
      state.piecesOnBoard[current]
    );

    if (!hasAnyLegalMove(state.board, current, currentPhase)) {
      return {
        isOver: true,
        winner: opponent,
        reason: `${current === 'WHITE' ? 'Weiß' : 'Schwarz'} ist blockiert und kann keinen legalen Zug mehr ausführen!`,
      };
    }
  }

  return {
    isOver: false,
    winner: null,
    reason: null,
  };
}
