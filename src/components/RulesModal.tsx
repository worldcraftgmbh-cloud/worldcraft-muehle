import React from 'react';
import { X, BookOpen, CheckCircle, ShieldAlert, Zap, Swords, Trophy } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-amber-600/30 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="font-['Cinzel'] text-xl font-bold text-amber-200">
              Offizielle Mühle-Regeln (Standard)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-stone-300">
          {/* Intro */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/20 text-stone-300 leading-relaxed">
            Mühle (engl. <em>Nine Men's Morris</em>) ist eines der ältesten und strategisch tiefgründigsten Brettspiele der Welt. Das Spielbrett besteht aus 24 Punkten auf drei ineinanderliegenden Quadraten, die durch Querlinien miteinander verbunden sind.
          </div>

          {/* Die 3 Phasen */}
          <div>
            <h3 className="font-['Cinzel'] font-bold text-amber-400 text-base mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500" /> Die 3 Spielphasen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800">
                <span className="text-amber-400 font-bold block mb-1">Phase 1: Setzen</span>
                <p className="text-xs text-stone-400">
                  Beide Spieler setzen abwechselnd je 9 Steine auf beliebige freie Punkte des Spielbretts.
                </p>
              </div>

              <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800">
                <span className="text-blue-400 font-bold block mb-1">Phase 2: Ziehen</span>
                <p className="text-xs text-stone-400">
                  Sobald alle 18 Steine gesetzt sind, ziehen die Spieler abwechselnd einen Stein entlang der Linien auf ein benachbartes freies Feld.
                </p>
              </div>

              <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800">
                <span className="text-purple-400 font-bold block mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Phase 3: Springen
                </span>
                <p className="text-xs text-stone-400">
                  Hat ein Spieler nur noch 3 Steine übrig, darf dieser Spieler frei auf jedes beliebige freie Feld des gesamten Brettes springen.
                </p>
              </div>
            </div>
          </div>

          {/* Mühlen & Schlagen */}
          <div className="space-y-3">
            <h3 className="font-['Cinzel'] font-bold text-amber-400 text-base flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-500" /> Mühlen bilden & Steine schlagen
            </h3>
            <ul className="space-y-2 text-xs list-disc pl-5 text-stone-300">
              <li>
                Eine <strong>Mühle</strong> entsteht, wenn drei Steine der gleichen Farbe in einer horizontalen oder vertikalen Reihe liegen (16 mögliche Mühlen auf dem Brett).
              </li>
              <li>
                Jedes Schließen einer Mühle berechtigt dazu, sofort <strong>einen gegnerischen Stein vom Brett zu entfernen</strong>.
              </li>
              <li>
                <strong>Zwickmühle / Klappmühle:</strong> Ein Stein kann aus einer bestehenden Mühle herausgezogen und im nächsten Zug wieder hineingezogen werden, um erneut eine Mühle zu schließen und einen Stein zu schlagen.
              </li>
            </ul>
          </div>

          {/* Schutzregel */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
            <h4 className="font-bold text-red-300 text-xs flex items-center gap-1.5 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Wichtige Schutzregel (Offizieller Standard)
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Steine, die sich aktuell in einer <strong>geschlossenen Mühle</strong> befinden, sind geschützt und dürfen <strong>nicht geschlagen werden</strong>!
              <br />
              <span className="text-amber-300 font-medium">Ausnahme:</span> Hat der Gegner <em>ausschließlich</em> Steine in geschlossenen Mühlen, darf jeder beliebige gegnerische Stein geschlagen werden.
            </p>
          </div>

          {/* Spielende */}
          <div>
            <h3 className="font-['Cinzel'] font-bold text-amber-400 text-base mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Sieg & Niederlage
            </h3>
            <div className="space-y-1.5 text-xs text-stone-300">
              <p>Ein Spieler verliert die Partie sofort, wenn:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                  <span className="text-red-400 font-semibold block">Weniger als 3 Steine:</span>
                  <span className="text-stone-400">
                    Nach Phase 1 hat der Spieler durch Schläge nur noch 2 Steine übrig.
                  </span>
                </div>
                <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                  <span className="text-red-400 font-semibold block">Blockade (Patt):</span>
                  <span className="text-stone-400">
                    Der Spieler ist am Zug, kann aber keinen legalen Zug mehr ausführen (alle Steine eingesperrt).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors shadow-lg shadow-amber-600/20"
          >
            Verstanden, zurück zum Spiel
          </button>
        </div>
      </div>
    </div>
  );
};
