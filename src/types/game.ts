export type Player = 'WHITE' | 'BLACK';

export type GamePhase = 'PLACING' | 'MOVING' | 'FLYING';

export type GameMode =
  | 'PVP'
  | 'AI_EASY'
  | 'AI_MEDIUM'
  | 'AI_HARD'
  | 'AI_LEARNING'
  | 'AI_VS_AI';

export type GameStatus = 'IN_PROGRESS' | 'WIN' | 'DRAW';

export interface MoveRecord {
  step: number;
  player: Player;
  type: 'PLACE' | 'MOVE' | 'FLY' | 'REMOVE';
  from?: number;
  to?: number;
  removed?: number;
  millFormed?: boolean;
  notation: string;
  timestamp: number;
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  placedPieces: {
    WHITE: number;
    BLACK: number;
  };
  piecesOnBoard: {
    WHITE: number;
    BLACK: number;
  };
  capturedPieces: {
    WHITE: number; // Pieces of White captured by Black
    BLACK: number; // Pieces of Black captured by White
  };
  selectedPoint: number | null;
  mustRemovePiece: boolean;
  status: GameStatus;
  winner: Player | null;
  winReason: string | null;
  moveHistory: MoveRecord[];
  lastMove: {
    from?: number;
    to?: number;
    removed?: number;
  } | null;
  highlightedMillPoints: number[];
  isAiThinking: boolean;
}

export interface PointCoord {
  id: number;
  x: number;
  y: number;
  level: number; // 0: outer, 1: middle, 2: inner
  label: string; // e.g., 'a1', 'd2', etc.
}

export interface FirestoreConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  collectionName?: string;
}

export interface LearnedStateData {
  stateKey: string;
  visitCount: number;
  wins: number;
  losses: number;
  draws: number;
  bestAction?: string;
  qValue: number;
  lastUpdated: number;
}
