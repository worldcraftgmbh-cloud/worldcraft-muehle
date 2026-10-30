import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  increment,
  writeBatch,
  collection,
} from 'firebase/firestore';
import { Player, MoveRecord } from '../types/game';

// Collections dedicated exclusively to Mühle (Schach collections positions & global_stats are untouched)
export const MUEHLE_GLOBAL_STATS = 'muehle_global_stats';
export const MUEHLE_POSITIONS = 'muehle_positions';

export interface MuehleStatsData {
  initialized: boolean;
  gamesPlayed: number;
  aiWins: number;
  playerWins: number;
  lastUpdated?: any;
}

export class FirestoreService {
  private isInitialized = false;
  private cachedStats: MuehleStatsData = {
    initialized: true,
    gamesPlayed: 0,
    aiWins: 0,
    playerWins: 0,
  };

  constructor() {
    this.initImmediateStats();
  }

  /**
   * 3. Sofortiger Initial-Eintrag beim Start:
   * Lege beim Laden der App direkt ein Dokument in `muehle_global_stats` an:
   * { initialized: true, gamesPlayed: 0, aiWins: 0, playerWins: 0 }
   * Damit die Collection sofort in der Firestore-Konsole erscheint.
   */
  public async initImmediateStats(): Promise<void> {
    try {
      const statsDocRef = doc(db, MUEHLE_GLOBAL_STATS, 'stats');
      const snap = await getDoc(statsDocRef);

      if (!snap.exists()) {
        await setDoc(statsDocRef, {
          initialized: true,
          gamesPlayed: 0,
          aiWins: 0,
          playerWins: 0,
          createdAt: new Date().toISOString(),
        });
        console.log(`[Firestore] Initial-Dokument in '${MUEHLE_GLOBAL_STATS}' erfolgreich angelegt.`);
      } else {
        const data = snap.data();
        this.cachedStats = {
          initialized: true,
          gamesPlayed: data.gamesPlayed ?? 0,
          aiWins: data.aiWins ?? 0,
          playerWins: data.playerWins ?? 0,
        };
        console.log(`[Firestore] '${MUEHLE_GLOBAL_STATS}' geladen:`, this.cachedStats);
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('[Firestore] Fehler beim Initialisieren von muehle_global_stats:', err);
    }
  }

  /**
   * Speichert nach JEDER beendeten Partie die gespielten Stellungen in die neue Collection `muehle_positions`
   * und aktualisiert `muehle_global_stats`.
   */
  public async recordGameEnd(
    moveHistory: MoveRecord[],
    winner: Player | null,
    isDraw: boolean = false
  ): Promise<void> {
    const isAiWin = winner === 'BLACK';
    const isPlayerWin = winner === 'WHITE';

    try {
      // 1. Update muehle_global_stats
      const statsDocRef = doc(db, MUEHLE_GLOBAL_STATS, 'stats');
      await setDoc(
        statsDocRef,
        {
          initialized: true,
          gamesPlayed: increment(1),
          aiWins: isAiWin ? increment(1) : increment(0),
          playerWins: isPlayerWin ? increment(1) : increment(0),
          lastGameAt: new Date().toISOString(),
        },
        { merge: true }
      );

      this.cachedStats.gamesPlayed += 1;
      if (isAiWin) this.cachedStats.aiWins += 1;
      if (isPlayerWin) this.cachedStats.playerWins += 1;

      // 2. Batch-Write aller Stellungen der Partie in muehle_positions
      if (moveHistory.length > 0) {
        const batch = writeBatch(db);
        const timestamp = Date.now();
        const gameId = `game_${timestamp}`;
        const positionsCol = collection(db, MUEHLE_POSITIONS);

        moveHistory.forEach((record, index) => {
          const docRef = doc(positionsCol, `${gameId}_move_${index + 1}`);
          const isMill = record.millFormed === true;
          // Mühlen-Belohnung: Jeder Zug, der eine Mühle schließt, erhält direkt einen Bonus (+100)
          const millBonus = isMill ? 100 : 0;
          const outcomeScore = record.player === winner ? 50 : (winner ? -25 : 0);
          const totalReward = outcomeScore + millBonus;

          batch.set(docRef, {
            gameId,
            step: record.step,
            player: record.player,
            type: record.type,
            from: record.from ?? null,
            to: record.to ?? null,
            removed: record.removed ?? null,
            millFormed: isMill,
            millBonus: millBonus, // 👑 Mühlen-Belohnung in Firestore
            reward: totalReward,  // Gesamtbelohnung inkl. Mühlen-Bonus
            scoreBonus: isMill ? '+100 (MÜHLE GESCHLOSSEN)' : '0',
            notation: record.notation,
            winner: winner ?? (isDraw ? 'DRAW' : 'NONE'),
            timestamp: record.timestamp || timestamp,
          });
        });

        await batch.commit();
        console.log(`[Firestore] ${moveHistory.length} Züge mit Mühlen-Boni in '${MUEHLE_POSITIONS}' gespeichert.`);
      }
    } catch (err) {
      console.warn('[Firestore] Fehler beim Speichern der Partie:', err);
    }
  }

  /**
   * Schreibt sofort beim Schließen einer Mühle eine Belohnung (+100) in muehle_positions
   */
  public async recordMillBonusDirect(record: MoveRecord): Promise<void> {
    try {
      const positionsCol = collection(db, MUEHLE_POSITIONS);
      const docRef = doc(positionsCol, `mill_${Date.now()}_step_${record.step}`);
      await setDoc(docRef, {
        step: record.step,
        player: record.player,
        type: record.type,
        from: record.from ?? null,
        to: record.to ?? null,
        millFormed: true,
        millBonus: 100,
        reward: 100,
        scoreBonus: '+100 (MÜHLE GESCHLOSSEN)',
        notation: record.notation,
        timestamp: Date.now(),
      });
      console.log(`[Firestore] 👑 Mühlen-Belohnung (+100) direkt in '${MUEHLE_POSITIONS}' gespeichert.`);
    } catch (e) {
      console.warn('[Firestore] Fehler beim Speichern des Mühlen-Bonus:', e);
    }
  }

  public getCachedStats(): MuehleStatsData {
    return this.cachedStats;
  }

  public isConnected(): boolean {
    return this.isInitialized || !!db;
  }

  public isCloudConnected(): boolean {
    return this.isConnected();
  }
}

export const firestoreService = new FirestoreService();
