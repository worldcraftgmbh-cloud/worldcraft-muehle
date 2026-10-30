import { GameState, Player, MoveRecord } from '../types/game';
import {
  getPlayerPhase,
  getValidMovesForPiece,
  isPieceRemovable,
  didFormMill,
  evaluateGameEnd,
  getPointLabel,
} from './rules';

export function createInitialState(): GameState {
  return {
    board: Array(24).fill(null),
    currentPlayer: 'WHITE',
    placedPieces: {
      WHITE: 0,
      BLACK: 0,
    },
    piecesOnBoard: {
      WHITE: 0,
      BLACK: 0,
    },
    capturedPieces: {
      WHITE: 0,
      BLACK: 0,
    },
    selectedPoint: null,
    mustRemovePiece: false,
    status: 'IN_PROGRESS',
    winner: null,
    winReason: null,
    moveHistory: [],
    lastMove: null,
    highlightedMillPoints: [],
    isAiThinking: false,
  };
}

export type ActionType =
  | { type: 'PLACE'; point: number }
  | { type: 'SELECT'; point: number | null }
  | { type: 'MOVE'; from: number; to: number }
  | { type: 'REMOVE'; point: number };

/**
 * Execute a piece placement action in Phase 1
 */
export function executePlace(
  state: GameState,
  point: number
): { nextState: GameState; soundEffect: 'place' | 'mill' | 'win' | null } {
  if (state.status !== 'IN_PROGRESS' || state.mustRemovePiece) {
    return { nextState: state, soundEffect: null };
  }

  const current = state.currentPlayer;
  const opponent: Player = current === 'WHITE' ? 'BLACK' : 'WHITE';

  if (state.placedPieces[current] >= 9 || state.board[point] !== null) {
    return { nextState: state, soundEffect: null };
  }

  const newBoard = [...state.board];
  newBoard[point] = current;

  const newPlacedCount = state.placedPieces[current] + 1;
  const newPiecesOnBoard = state.piecesOnBoard[current] + 1;

  const { formed, millPoints } = didFormMill(state.board, newBoard, point, current);

  const moveRecord: MoveRecord = {
    step: state.moveHistory.length + 1,
    player: current,
    type: 'PLACE',
    to: point,
    millFormed: formed,
    notation: `${current === 'WHITE' ? 'W' : 'S'}: ${getPointLabel(point)}${formed ? ' (Mühle!)' : ''}`,
    timestamp: Date.now(),
  };

  if (formed) {
    // Current player formed a mill! Must remove opponent piece
    const updatedState: GameState = {
      ...state,
      board: newBoard,
      placedPieces: {
        ...state.placedPieces,
        [current]: newPlacedCount,
      },
      piecesOnBoard: {
        ...state.piecesOnBoard,
        [current]: newPiecesOnBoard,
      },
      mustRemovePiece: true,
      selectedPoint: null,
      highlightedMillPoints: millPoints,
      lastMove: { to: point },
      moveHistory: [...state.moveHistory, moveRecord],
    };
    return { nextState: updatedState, soundEffect: 'mill' };
  }

  // Turn completes and switches to opponent
  const candidateState: GameState = {
    ...state,
    board: newBoard,
    currentPlayer: opponent,
    placedPieces: {
      ...state.placedPieces,
      [current]: newPlacedCount,
    },
    piecesOnBoard: {
      ...state.piecesOnBoard,
      [current]: newPiecesOnBoard,
    },
    selectedPoint: null,
    mustRemovePiece: false,
    highlightedMillPoints: [],
    lastMove: { to: point },
    moveHistory: [...state.moveHistory, moveRecord],
  };

  const endCheck = evaluateGameEnd(candidateState);
  if (endCheck.isOver) {
    return {
      nextState: {
        ...candidateState,
        status: 'WIN',
        winner: endCheck.winner,
        winReason: endCheck.reason,
      },
      soundEffect: 'win',
    };
  }

  return { nextState: candidateState, soundEffect: 'place' };
}

/**
 * Execute a move or fly action in Phase 2/3
 */
export function executeMove(
  state: GameState,
  from: number,
  to: number
): { nextState: GameState; soundEffect: 'move' | 'mill' | 'win' | null } {
  if (state.status !== 'IN_PROGRESS' || state.mustRemovePiece) {
    return { nextState: state, soundEffect: null };
  }

  const current = state.currentPlayer;
  const opponent: Player = current === 'WHITE' ? 'BLACK' : 'WHITE';
  const currentPhase = getPlayerPhase(
    state.placedPieces[current],
    state.piecesOnBoard[current]
  );

  if (state.board[from] !== current || state.board[to] !== null) {
    return { nextState: state, soundEffect: null };
  }

  const validMoves = getValidMovesForPiece(state.board, from, currentPhase);
  if (!validMoves.includes(to)) {
    return { nextState: state, soundEffect: null };
  }

  const newBoard = [...state.board];
  newBoard[from] = null;
  newBoard[to] = current;

  const { formed, millPoints } = didFormMill(state.board, newBoard, to, current);

  const moveRecord: MoveRecord = {
    step: state.moveHistory.length + 1,
    player: current,
    type: currentPhase === 'FLYING' ? 'FLY' : 'MOVE',
    from,
    to,
    millFormed: formed,
    notation: `${current === 'WHITE' ? 'W' : 'S'}: ${getPointLabel(from)} → ${getPointLabel(to)}${formed ? ' (Mühle!)' : ''}`,
    timestamp: Date.now(),
  };

  if (formed) {
    const updatedState: GameState = {
      ...state,
      board: newBoard,
      selectedPoint: null,
      mustRemovePiece: true,
      highlightedMillPoints: millPoints,
      lastMove: { from, to },
      moveHistory: [...state.moveHistory, moveRecord],
    };
    return { nextState: updatedState, soundEffect: 'mill' };
  }

  const candidateState: GameState = {
    ...state,
    board: newBoard,
    currentPlayer: opponent,
    selectedPoint: null,
    mustRemovePiece: false,
    highlightedMillPoints: [],
    lastMove: { from, to },
    moveHistory: [...state.moveHistory, moveRecord],
  };

  const endCheck = evaluateGameEnd(candidateState);
  if (endCheck.isOver) {
    return {
      nextState: {
        ...candidateState,
        status: 'WIN',
        winner: endCheck.winner,
        winReason: endCheck.reason,
      },
      soundEffect: 'win',
    };
  }

  return { nextState: candidateState, soundEffect: 'move' };
}

/**
 * Execute removing an opponent's piece after closing a mill
 */
export function executeRemovePiece(
  state: GameState,
  point: number
): { nextState: GameState; soundEffect: 'remove' | 'win' | null } {
  if (state.status !== 'IN_PROGRESS' || !state.mustRemovePiece) {
    return { nextState: state, soundEffect: null };
  }

  const current = state.currentPlayer;
  const opponent: Player = current === 'WHITE' ? 'BLACK' : 'WHITE';

  if (!isPieceRemovable(state.board, point, opponent)) {
    return { nextState: state, soundEffect: null };
  }

  const newBoard = [...state.board];
  newBoard[point] = null;

  const newOpponentPieces = state.piecesOnBoard[opponent] - 1;
  const newCaptured = state.capturedPieces[opponent] + 1;

  const moveRecord: MoveRecord = {
    step: state.moveHistory.length + 1,
    player: current,
    type: 'REMOVE',
    removed: point,
    notation: `${current === 'WHITE' ? 'W' : 'S'} schlägt ${getPointLabel(point)}`,
    timestamp: Date.now(),
  };

  const candidateState: GameState = {
    ...state,
    board: newBoard,
    currentPlayer: opponent,
    piecesOnBoard: {
      ...state.piecesOnBoard,
      [opponent]: newOpponentPieces,
    },
    capturedPieces: {
      ...state.capturedPieces,
      [opponent]: newCaptured,
    },
    mustRemovePiece: false,
    selectedPoint: null,
    highlightedMillPoints: [],
    lastMove: {
      ...state.lastMove,
      to: state.lastMove?.to ?? 0,
      removed: point,
    },
    moveHistory: [...state.moveHistory, moveRecord],
  };

  const endCheck = evaluateGameEnd(candidateState);
  if (endCheck.isOver) {
    return {
      nextState: {
        ...candidateState,
        status: 'WIN',
        winner: endCheck.winner,
        winReason: endCheck.reason,
      },
      soundEffect: 'win',
    };
  }

  return { nextState: candidateState, soundEffect: 'remove' };
}
