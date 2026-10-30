import { PointCoord } from '../types/game';

// 24 Board Points definition on a 600x600 viewBox
export const BOARD_POINTS: PointCoord[] = [
  // Outer square (level 0)
  { id: 0, x: 60, y: 60, level: 0, label: 'a7' },
  { id: 1, x: 300, y: 60, level: 0, label: 'd7' },
  { id: 2, x: 540, y: 60, level: 0, label: 'g7' },
  { id: 3, x: 540, y: 300, level: 0, label: 'g4' },
  { id: 4, x: 540, y: 540, level: 0, label: 'g1' },
  { id: 5, x: 300, y: 540, level: 0, label: 'd1' },
  { id: 6, x: 60, y: 540, level: 0, label: 'a1' },
  { id: 7, x: 60, y: 300, level: 0, label: 'a4' },

  // Middle square (level 1)
  { id: 8, x: 140, y: 140, level: 1, label: 'b6' },
  { id: 9, x: 300, y: 140, level: 1, label: 'd6' },
  { id: 10, x: 460, y: 140, level: 1, label: 'f6' },
  { id: 11, x: 460, y: 300, level: 1, label: 'f4' },
  { id: 12, x: 460, y: 460, level: 1, label: 'f2' },
  { id: 13, x: 300, y: 460, level: 1, label: 'd2' },
  { id: 14, x: 140, y: 460, level: 1, label: 'b2' },
  { id: 15, x: 140, y: 300, level: 1, label: 'b4' },

  // Inner square (level 2)
  { id: 16, x: 220, y: 220, level: 2, label: 'c5' },
  { id: 17, x: 300, y: 220, level: 2, label: 'd5' },
  { id: 18, x: 380, y: 220, level: 2, label: 'e5' },
  { id: 19, x: 380, y: 300, level: 2, label: 'e4' },
  { id: 20, x: 380, y: 380, level: 2, label: 'e3' },
  { id: 21, x: 300, y: 380, level: 2, label: 'd3' },
  { id: 22, x: 220, y: 380, level: 2, label: 'c3' },
  { id: 23, x: 220, y: 300, level: 2, label: 'c4' },
];

// Adjacency graph: points directly connected by lines
export const ADJACENCY: readonly (readonly number[])[] = [
  // Outer
  [1, 7],             // 0
  [0, 2, 9],          // 1
  [1, 3],             // 2
  [2, 4, 11],         // 3
  [3, 5],             // 4
  [4, 6, 13],         // 5
  [5, 7],             // 6
  [0, 6, 15],         // 7
  // Middle
  [9, 15],            // 8
  [1, 8, 10, 17],     // 9
  [9, 11],            // 10
  [3, 10, 12, 19],    // 11
  [11, 13],           // 12
  [5, 12, 14, 21],    // 13
  [13, 15],           // 14
  [7, 8, 14, 23],     // 15
  // Inner
  [17, 23],           // 16
  [9, 16, 18],        // 17
  [17, 19],           // 18
  [11, 18, 20],       // 19
  [19, 21],           // 20
  [13, 20, 22],       // 21
  [21, 23],           // 22
  [15, 16, 22],       // 23
];

// All 16 possible mills (lines of 3 points)
export const ALL_MILLS: readonly (readonly [number, number, number])[] = [
  // Outer square
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],
  // Middle square
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],
  // Inner square
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],
  // Cross connections
  [1, 9, 17],   // North / Top
  [3, 11, 19],  // East / Right
  [5, 13, 21],  // South / Bottom
  [7, 15, 23],  // West / Left
];

// Pre-computed map: for each point index, which mills include it
export const POINT_TO_MILLS: readonly (readonly (readonly [number, number, number])[])[] =
  BOARD_POINTS.map((_, idx) =>
    ALL_MILLS.filter(mill => mill.includes(idx as any))
  );

// SVG Board Segments for rendering lines
export const BOARD_LINE_SEGMENTS = [
  // Outer square
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  // Middle square
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  // Inner square
  [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 16],
  // Cross lines
  [1, 9], [9, 17],
  [3, 11], [11, 19],
  [5, 13], [13, 21],
  [7, 15], [15, 23],
];
