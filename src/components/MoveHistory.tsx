import React, { useEffect, useRef } from 'react';
import { MoveRecord } from '../types/game';
import { History, Swords, Sparkles } from 'lucide-react';

interface MoveHistoryProps {
  history: MoveRecord[];
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="bg-stone-950/70 rounded-2xl border border-stone-800 p-3.5 flex flex-col h-full max-h-[300px] lg:max-h-[500px]">
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-stone-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
          <History className="w-4 h-4 text-amber-500" />
          <span>Zug-Protokoll</span>
        </div>
        <span className="text-[11px] text-stone-400 font-mono">
          {history.length} {history.length === 1 ? 'Zug' : 'Züge'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent text-xs"
      >
        {history.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs italic">
            Noch keine Züge ausgeführt.
          </div>
        ) : (
          history.map(record => {
            const isWhite = record.player === 'WHITE';
            return (
              <div
                key={record.step}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-colors ${
                  record.millFormed
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    : record.type === 'REMOVE'
                    ? 'bg-red-950/20 border-red-900/30 text-red-300'
                    : 'bg-stone-900/60 border-stone-800/60 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-stone-400 w-5">
                    {record.step}.
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isWhite ? 'bg-stone-200' : 'bg-stone-600'
                    }`}
                  />
                  <span className="font-medium">{record.notation}</span>
                </div>

                <div className="flex items-center gap-1">
                  {record.millFormed && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Mühle
                    </span>
                  )}
                  {record.type === 'REMOVE' && (
                    <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                      <Swords className="w-3 h-3 text-red-400" /> Schlag
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
