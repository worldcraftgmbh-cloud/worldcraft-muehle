import { Player, GamePhase } from '../types/game';
import { ALL_MILLS, ADJACENCY } from '../logic/boardConstants';
import { getPlayerPhase } from '../logic/rules';

/**
 * Counts the number of 2-in-a-row configurations (2 friendly pieces + 1 empty point in a mill line)
 */
export function getPotentialMills(
  board: (Player | null)[],
  player: Player
): { count: number; emptyPoints: number[] } {
  let count = 0;
  const emptyPoints: number[] = [];

  for (const mill of ALL_MILLS) {
    let friendly = 0;
    let empty = 0;
    let emptyIdx = -1;

    for (const p of mill) {
      if (board[p] === player) friendly++;
      else if (board[p] === null) {
        empty++;
        emptyIdx = p;
      }
    }

    if (friendly === 2 && empty === 1) {
      count++;
      if (emptyIdx !== -1) emptyPoints.push(emptyIdx);
    }
  }

  return { count, emptyPoints };
}

/**
 * Counts how many pieces can move (mobility)
 */
export function getMobility(
  board: (Player | null)[],
  player: Player,
  phase: GamePhase
): number {
  if (phase === 'FLYING') {
    // Flying piece can go to any empty point
    const emptyCount = board.filter(p => p === null).length;
    return emptyCount > 0 ? 10 : 0;
  }

  let moves = 0;
  for (let i = 0; i < 24; i++) {
    if (board[i] === player) {
      const neighbors = ADJACENCY[i];
      for (const n of neighbors) {
        if (board[n] === null) {
          moves++;
        }
      }
    }
  }
  return moves;
}

/**
 * Detects "Klappmühle" (opened mill) or double mill potentials
 */
export function countDoubleMillPotentials(
  board: (Player | null)[],
  player: Player
): number {
  let count = 0;
  // A point where two potential mills intersect
  const { emptyPoints } = getPotentialMills(board, player);
  const freq: { [point: number]: number } = {};
  for (const p of emptyPoints) {
    freq[p] = (freq[p] || 0) + 1;
    if (freq[p] >= 2) {
      count++;
    }
  }
  return count;
}

/**
 * Evaluate the board state from the perspective of `evaluatingPlayer`
 */
export function evaluateBoard(
  board: (Player | null)[],
  evaluatingPlayer: Player,
  placedPieces: { WHITE: number; BLACK: number },
  piecesOnBoard: { WHITE: number; BLACK: number }
): number {
  const opponent: Player = evaluatingPlayer === 'WHITE' ? 'BLACK' : 'WHITE';

  const myPieces = piecesOnBoard[evaluatingPlayer];
  const oppPieces = piecesOnBoard[opponent];

  const myPlaced = placedPieces[evaluatingPlayer];
  const oppPlaced = placedPieces[opponent];

  const myPhase = getPlayerPhase(myPlaced, myPieces);
  const oppPhase = getPlayerPhase(oppPlaced, oppPieces);

  // If opponent has lost (less than 3 pieces in phase 2/3)
  if (oppPlaced >= 9 && oppPieces < 3) return 100000;
  if (myPlaced >= 9 && myPieces < 3) return -100000;

  // Closed mills
  let myClosedMills = 0;
  let oppClosedMills = 0;
  for (const mill of ALL_MILLS) {
    if (mill.every(p => board[p] === evaluatingPlayer)) myClosedMills++;
    if (mill.every(p => board[p] === opponent)) oppClosedMills++;
  }

  // 2-in-a-row (open threats)
  const myPotential = getPotentialMills(board, evaluatingPlayer);
  const oppPotential = getPotentialMills(board, opponent);

  // Mobility
  const myMobility = getMobility(board, evaluatingPlayer, myPhase);
  const oppMobility = getMobility(board, opponent, oppPhase);

  // Check if opponent is completely blocked in moving phase
  if (oppPlaced >= 9 && oppPhase === 'MOVING' && oppMobility === 0) {
    return 90000;
  }
  if (myPlaced >= 9 && myPhase === 'MOVING' && myMobility === 0) {
    return -90000;
  }

  // Double mill threats (Zwickmühle setup)
  const myDoubleThreats = countDoubleMillPotentials(board, evaluatingPlayer);
  const oppDoubleThreats = countDoubleMillPotentials(board, opponent);

  let score = 0;

  if (myPlaced < 9 || oppPlaced < 9) {
    // Phase 1 (Placing)
    score += (myClosedMills - oppClosedMills) * 80;
    score += (myPotential.count - oppPotential.count) * 30;
    score += (myDoubleThreats - oppDoubleThreats) * 45;
    score += (myPieces - oppPieces) * 60;
  } else {
    // Phase 2 or 3 (Moving / Flying)
    score += (myPieces - oppPieces) * 120;
    score += (myClosedMills - oppClosedMills) * 90;
    score += (myPotential.count - oppPotential.count) * 35;
    score += (myMobility - oppMobility) * 8;
    score += (myDoubleThreats - oppDoubleThreats) * 50;
  }

  return score;
}
