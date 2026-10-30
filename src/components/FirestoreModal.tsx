import React, { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { firebaseConfig } from '../firebase';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface FirestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const FirestoreModal: React.FC<FirestoreModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [stats, setStats] = useState({ gamesPlayed: 0, aiWins: 0 });
  const [isWritingTest, setIsWritingTest] = useState(false);
  const [writeResult, setWriteResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStats(firestoreService.getCachedStats());
      setWriteResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWriteTestDoc = async () => {
    setIsWritingTest(true);
    setWriteResult(null);
    try {
      await firestoreService.initImmediateStats();
      setStats(firestoreService.getCachedStats());
      setWriteResult('Test-Dokument erfolgreich in muehle_global_stats geschrieben!');
      onConfigUpdated();
    } catch (e: any) {
      setWriteResult(`Fehler beim Schreiben: ${e?.message || e}`);
    } finally {
      setIsWritingTest(false);
    }
  };

  const isConnected = firestoreService.isConnected();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-amber-600/30 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-500" />
            <h2 className="font-['Cinzel'] text-xl font-bold text-amber-200">
              Firebase Firestore Live-Synchronisation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-stone-300">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 shadow-glow-cyan' : 'bg-amber-500'
                }`}
              />
              <div>
                <span className="font-bold text-xs text-stone-100 block">
                  {isConnected ? 'Firebase Firestore aktiv & verbunden' : 'Verbindungsaufbau / REST aktiv'}
                </span>
                <span className="text-[11px] text-stone-400">
                  Projekt: <strong className="text-amber-400 font-mono">{firebaseConfig.projectId}</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold font-mono text-base block">
                {stats.gamesPlayed}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                Partien aufgezeichnet
              </span>
            </div>
          </div>

          {/* Firestore Collections Information */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Cloud className="w-4 h-4" />
              <span>Verwendete Firebase Collections (Mühle-Isolation)</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center">
                <div>
                  <span className="font-mono text-amber-300 font-semibold block">muehle_global_stats</span>
                  <span className="text-stone-400 text-[11px]">Globaler Zähler für gespielte Partien & KI-Siege</span>
                </div>
                <span className="text-[11px] font-mono text-stone-300">doc: stats</span>
              </div>

              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center">
                <div>
                  <span className="font-mono text-cyan-300 font-semibold block">muehle_positions</span>
                  <span className="text-stone-400 text-[11px]">Auto-Write aller Züge & Stellungen nach jeder Partie</span>
                </div>
                <span className="text-[11px] font-mono text-stone-300">Auto-Batch</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Schach-Collections (<code>positions</code>, <code>global_stats</code>) bleiben vollständig unangetastet.</span>
            </div>
          </div>

          {/* Test Write Action */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <h3 className="font-bold text-stone-200 text-xs">Initial-Dokument prüfen & schreiben</h3>
            <p className="text-xs text-stone-400">
              Klicke hier, um sofort manuell das Test-Dokument in <code>muehle_global_stats</code> anzulegen, falls es noch nicht in der Firebase Console aufgetaucht ist:
            </p>

            <button
              onClick={handleWriteTestDoc}
              disabled={isWritingTest}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
            >
              {isWritingTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Schreibe nach Firebase...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Test-Dokument jetzt in muehle_global_stats schreiben</span>
                </>
              )}
            </button>

            {writeResult && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{writeResult}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors shadow-lg shadow-amber-600/20"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
