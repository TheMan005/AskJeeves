import React from 'react';
import { RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isVulnerableMode: boolean;
  setIsVulnerableMode: (vulnerable: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  isVulnerableMode,
  setIsVulnerableMode,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
      {/* Brand Title */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-serif font-bold text-white tracking-tight">
          Jeeves <span className="font-sans text-xs font-mono font-medium px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300">XSS Lab</span>
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Vulnerable vs Secure Mode Switch */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => setIsVulnerableMode(true)}
            className={`px-3 py-1 rounded-md transition-colors ${
              isVulnerableMode
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/80 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Renders raw unsanitized input to DOM"
          >
            ⚠️ Vulnerable
          </button>
          <button
            onClick={() => setIsVulnerableMode(false)}
            className={`px-3 py-1 rounded-md transition-colors ${
              !isVulnerableMode
                ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-800/80 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Escapes HTML entities safely"
          >
            🛡️ Secure
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all active:scale-95"
          title="Clear search input and restore state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
