import { GameState } from '../types/game';
import { getBestAIMove, AIMove } from './minimax';

/**
 * Learning AI Engine Placeholder:
 * Minimax is completely removed. Uses the ultra-fast 0ms random AI.
 */
export class LearningAIEngine {
  public async getMove(state: GameState): Promise<AIMove | null> {
    return getBestAIMove(state);
  }

  public recordStep(_state: GameState, _move: AIMove): void {}

  public async learnFromGameEnd(_winner: any, _isDraw?: boolean): Promise<void> {}

  public async trainSelfPlay(
    epochs: number,
    onProgress: (current: number, total: number) => void
  ): Promise<void> {
    for (let i = 1; i <= epochs; i++) {
      onProgress(i, epochs);
    }
  }
}

export const learningAIEngine = new LearningAIEngine();
