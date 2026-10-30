import React from 'react';
import { Player, GameState, GamePhase } from '../types/game';
import { BOARD_POINTS, BOARD_LINE_SEGMENTS } from '../logic/boardConstants';
import {
  getPlayerPhase,
  getValidMovesForPiece,
  getValidPlacements,
  isPieceRemovable,
} from '../logic/rules';

interface BoardProps {
  state: GameState;
  onPointClick: (pointIndex: number) => void;
  disabled?: boolean;
}

export const Board: React.FC<BoardProps> = ({ state, onPointClick, disabled = false }) => {
  const current = state.currentPlayer;
  const opponent: Player = current === 'WHITE' ? 'BLACK' : 'WHITE';
  const currentPhase: GamePhase = getPlayerPhase(
    state.placedPieces[current],
    state.piecesOnBoard[current]
  );

  // Compute valid actions for visual feedback
  const validPlacements =
    !state.mustRemovePiece && currentPhase === 'PLACING' && state.status === 'IN_PROGRESS'
      ? getValidPlacements(state.board)
      : [];

  const validMoves =
    !state.mustRemovePiece &&
    state.selectedPoint !== null &&
    state.status === 'IN_PROGRESS'
      ? getValidMovesForPiece(state.board, state.selectedPoint, currentPhase)
      : [];

  // Coordinate axis labels
  const colLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const rowLabels = ['7', '6', '5', '4', '3', '2', '1'];
  const colPositions = [60, 140, 220, 300, 380, 460, 540];
  const rowPositions = [60, 140, 220, 300, 380, 460, 540];

  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto select-none p-3 md:p-5 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 shadow-2xl border-4 border-amber-950/60 ring-1 ring-amber-500/20">
      {/* Decorative Board Corner Accents */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg pointer-events-none" />

      <svg
        viewBox="0 0 600 600"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          {/* Board background texture pattern */}
          <radialGradient id="boardBgGrad" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#25211d" />
            <stop offset="70%" stopColor="#1a1714" />
            <stop offset="100%" stopColor="#12100e" />
          </radialGradient>

          {/* Golden metallic gradient for lines */}
          <linearGradient id="goldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f3e5ab" />
            <stop offset="100%" stopColor="#aa7c11" />
          </linearGradient>

          {/* White piece gradient (Ivory/Pearl marble) */}
          <radialGradient id="whitePieceGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e5e7eb" />
            <stop offset="90%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#6b7280" />
          </radialGradient>

          {/* Black piece gradient (Obsidian/Titanium) */}
          <radialGradient id="blackPieceGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="85%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Drop shadow filter for pieces */}
          <filter id="pieceShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.75" />
          </filter>

          {/* Glow filter for newly formed mill */}
          <filter id="millGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Target pulse filter for removable pieces */}
          <filter id="targetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Board Surface Base Plate */}
        <rect
          x="20"
          y="20"
          width="560"
          height="560"
          rx="24"
          fill="url(#boardBgGrad)"
          stroke="#45382b"
          strokeWidth="3"
        />

        {/* Subtle grid inlays */}
        <rect
          x="26"
          y="26"
          width="548"
          height="548"
          rx="20"
          fill="none"
          stroke="#d4af37"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />

        {/* Grid Axis Coordinate Labels */}
        {colLabels.map((lbl, idx) => (
          <text
            key={`col-${lbl}`}
            x={colPositions[idx]}
            y="42"
            textAnchor="middle"
            className="fill-amber-400/40 text-[13px] font-mono select-none"
          >
            {lbl}
          </text>
        ))}
        {rowLabels.map((lbl, idx) => (
          <text
            key={`row-${lbl}`}
            x="40"
            y={rowPositions[idx] + 4}
            textAnchor="middle"
            className="fill-amber-400/40 text-[13px] font-mono select-none"
          >
            {lbl}
          </text>
        ))}

        {/* Board Lines: Outer, Middle, Inner Squares & Cross Connections */}
        <g stroke="url(#goldLineGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
          {BOARD_LINE_SEGMENTS.map(([p1, p2], idx) => {
            const pt1 = BOARD_POINTS[p1];
            const pt2 = BOARD_POINTS[p2];
            return (
              <line
                key={`line-${idx}`}
                x1={pt1.x}
                y1={pt1.y}
                x2={pt2.x}
                y2={pt2.y}
                className="transition-all duration-300"
              />
            );
          })}
        </g>

        {/* Subtle center mill emblem */}
        <g opacity="0.25" transform="translate(300, 300)">
          <circle r="22" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M -12 0 L 12 0 M 0 -12 L 0 12" stroke="#d4af37" strokeWidth="1.5" />
        </g>

        {/* 24 Interactive Board Points & Pieces */}
        {BOARD_POINTS.map(pt => {
          const piece = state.board[pt.id];
          const isSelected = state.selectedPoint === pt.id;
          const isValidPlacement = validPlacements.includes(pt.id);
          const isValidMoveDest = validMoves.includes(pt.id);
          const isRemovable =
            state.mustRemovePiece &&
            piece === opponent &&
            isPieceRemovable(state.board, pt.id, opponent);

          const isPartOffreshMill = state.highlightedMillPoints.includes(pt.id);
          const isLastMoveDest = state.lastMove?.to === pt.id;

          const isSelectablePiece =
            !state.mustRemovePiece &&
            state.status === 'IN_PROGRESS' &&
            piece === current &&
            currentPhase !== 'PLACING';

          return (
            <g
              key={`pt-${pt.id}`}
              transform={`translate(${pt.x}, ${pt.y})`}
              onClick={() => !disabled && onPointClick(pt.id)}
              className="cursor-pointer group"
            >
              {/* Invisible large hit area for comfortable touches on mobile */}
              <circle r="28" fill="transparent" />

              {/* Point Node Foundation */}
              <circle
                r="8"
                fill="#1c1917"
                stroke="#d4af37"
                strokeWidth="2.5"
                className="transition-all duration-200 group-hover:stroke-amber-300 group-hover:scale-125"
              />
              <circle r="3.5" fill="#d4af37" opacity="0.8" />

              {/* Valid Placement Highlight (Phase 1) */}
              {isValidPlacement && (
                <g className="animate-pulse">
                  <circle
                    r="18"
                    fill="rgba(212, 175, 55, 0.15)"
                    stroke="#d4af37"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="group-hover:fill-amber-400/30"
                  />
                  <circle r="6" fill="#f59e0b" opacity="0.6" />
                </g>
              )}

              {/* Valid Move Destination Highlight (Phase 2/3) */}
              {isValidMoveDest && (
                <g className="animate-pulse">
                  <circle
                    r="20"
                    fill="rgba(6, 182, 212, 0.25)"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    className="group-hover:fill-cyan-400/40"
                  />
                  <circle r="7" fill="#06b6d4" />
                </g>
              )}

              {/* Removable Target Highlight (Mill Capture mode) */}
              {isRemovable && (
                <g filter="url(#targetGlow)" className="animate-pulse">
                  <circle
                    r="22"
                    fill="rgba(239, 68, 68, 0.2)"
                    stroke="#ef4444"
                    strokeWidth="3"
                  />
                  {/* Crosshair target lines */}
                  <line x1="-24" y1="0" x2="-14" y2="0" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="14" y1="0" x2="24" y2="0" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="0" y1="-24" x2="0" y2="-14" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="0" y1="14" x2="0" y2="24" stroke="#ef4444" strokeWidth="2.5" />
                </g>
              )}

              {/* Piece Rendering */}
              {piece !== null && (
                <g
                  filter="url(#pieceShadow)"
                  className={`transition-transform duration-200 ${
                    isSelected ? '-translate-y-1 scale-110' : ''
                  } ${isSelectablePiece ? 'group-hover:scale-105' : ''}`}
                >
                  {/* Mill Golden Halo */}
                  {isPartOffreshMill && (
                    <circle
                      r="25"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                      filter="url(#millGlow)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      r="25"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Stone Body */}
                  <circle
                    r="19"
                    fill={piece === 'WHITE' ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)'}
                    stroke={piece === 'WHITE' ? '#d1d5db' : '#334155'}
                    strokeWidth="1.5"
                  />

                  {/* Inner Stone Ring */}
                  <circle
                    r="13"
                    fill="none"
                    stroke={piece === 'WHITE' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)'}
                    strokeWidth="1.5"
                  />

                  {/* Specular 3D Highlight */}
                  <ellipse
                    cx="-5"
                    cy="-6"
                    rx="6"
                    ry="3.5"
                    fill="rgba(255,255,255,0.35)"
                    transform="rotate(-25, -5, -6)"
                  />

                  {/* Last Move Indicator Dot */}
                  {isLastMoveDest && (
                    <circle
                      r="4"
                      fill="#eab308"
                      stroke="#78350f"
                      strokeWidth="1"
                    />
                  )}
                </g>
              )}

              {/* Point coordinate label for accessibility/clarity */}
              <text
                y="30"
                textAnchor="middle"
                className="fill-stone-500 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                {pt.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
