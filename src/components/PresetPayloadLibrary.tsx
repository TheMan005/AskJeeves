import React from 'react';
import { PRESET_PAYLOADS } from '../data/payloads';
import { XSSPayload } from '../types';
import { Terminal, ArrowUpRight, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';

interface PresetPayloadLibraryProps {
  onSelectPayload: (payload: XSSPayload) => void;
}

export const PresetPayloadLibrary: React.FC<PresetPayloadLibraryProps> = ({ onSelectPayload }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              Payload Vector Presets
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Standard XSS Attack Vectors Library
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          Click any vector below to instantly load its payload into the search bar and observe live DOM execution mechanics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESET_PAYLOADS.map((payload) => (
          <div
            key={payload.id}
            className="bg-slate-950 border border-slate-800 hover:border-rose-500/60 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-rose-950/30 group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  {payload.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    payload.riskLevel === 'Critical'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : payload.riskLevel === 'High'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {payload.riskLevel} Risk
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                {payload.name}
              </h3>

              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {payload.description}
              </p>

              {/* Payload code snippet */}
              <div className="mt-3 p-2 bg-slate-900 border border-slate-800/80 rounded-lg font-mono text-[11px] text-rose-300 break-all line-clamp-2 select-all">
                {payload.query}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                Context: {payload.targetContext}
              </span>

              <button
                onClick={() => onSelectPayload(payload)}
                className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline transition-colors shrink-0"
              >
                Inject Vector
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
