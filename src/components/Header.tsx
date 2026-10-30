import React from 'react';
import { GameMode } from '../types/game';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Database,
  Users,
  Bot,
  Brain,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  onRestart: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenFirestore: () => void;
  isCloudConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gameMode,
  onSelectGameMode,
  onRestart,
  onUndo,
  canUndo,
  isMuted,
  onToggleSound,
  onOpenRules,
  onOpenFirestore,
  isCloudConnected,
}) => {
  return (
    <header className="w-full bg-stone-900/90 border-b border-amber-900/30 backdrop-blur-md sticky top-0 z-30 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-lg shadow-amber-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
              <span className="font-['Cinzel'] font-bold text-amber-400 text-xl tracking-wider">M</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Cinzel'] text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                Mühle
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                Nine Men's Morris
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">Klassisches Strategiespiel mit adaptiver KI</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-stone-950/80 p-1 rounded-xl border border-stone-800 shadow-inner">
          <button
            onClick={() => onSelectGameMode('PVP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'PVP'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="Lokales 2-Spieler-Spiel"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">2 Spieler</span>
          </button>

          <button
            onClick={() => onSelectGameMode('AI_EASY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'AI_EASY'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="KI Anfänger"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Leicht</span>
          </button>

          <button
            onClick={() => onSelectGameMode('AI_MEDIUM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'AI_MEDIUM'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="KI Fortgeschritten"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Mittel</span>
          </button>

          <button
            onClick={() => onSelectGameMode('AI_HARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'AI_HARD'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="KI Meister (Minimax)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Meister</span>
          </button>

          <button
            onClick={() => onSelectGameMode('AI_LEARNING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'AI_LEARNING'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow-md font-bold'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-stone-900'
            }`}
            title="Lernende KI mit Q-Learning & Firestore"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lern-KI</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg border transition-all ${
              canUndo
                ? 'bg-stone-800 text-stone-200 hover:bg-stone-700 border-stone-700 hover:border-amber-600/50 cursor-pointer'
                : 'bg-stone-900/50 text-stone-600 border-stone-800/50 cursor-not-allowed'
            }`}
            title="Zug rückgängig machen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-300 hover:text-amber-400 hover:border-amber-600/50 transition-all`}
            title={isMuted ? 'Ton einschalten' : 'Ton stummschalten'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={onOpenFirestore}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-300 hover:text-amber-400 hover:border-amber-600/50 transition-all text-xs font-medium"
            title="Firestore & KI-Speicher"
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span className="hidden lg:inline">KI-Speicher</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-500 shadow-glow-cyan' : 'bg-amber-500'
              }`}
              title={isCloudConnected ? 'Mit Cloud verbunden' : 'Lokaler Modus'}
            />
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-600/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 hover:border-amber-500 transition-all text-xs font-medium shadow-sm"
            title="Mühle Spielregeln anzeigen"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Regeln</span>
          </button>

          <button
            onClick={onRestart}
            className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 border border-stone-700 hover:border-amber-500 text-xs font-semibold transition-all shadow-sm"
          >
            Neu
          </button>
        </div>
      </div>
    </header>
  );
};
