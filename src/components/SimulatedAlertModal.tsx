import React from 'react';
import { AlertTriangle, ShieldAlert, X, Cookie, Check } from 'lucide-react';

interface SimulatedAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  payload: string;
}

export const SimulatedAlertModal: React.FC<SimulatedAlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  payload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-500 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-rose-950 border-b border-rose-800 text-rose-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {title || 'Simulated Browser Alert Intercepted'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-rose-400 hover:text-white rounded hover:bg-rose-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-slate-100 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-rose-300 break-words shadow-inner">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">alert() Dialogue Message:</div>
            <div className="text-sm font-semibold">{message || 'XSS Execution Confirmed!'}</div>
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-1">
              Triggering Injected Payload:
            </div>
            <code className="block p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 break-all">
              {payload || '<img src=x onerror=alert(1)>'}
            </code>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs font-mono text-amber-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Cookie className="w-3.5 h-3.5 text-amber-400" />
              Exfiltrated Session Data (Simulated):
            </div>
            <div className="text-[11px] text-amber-300/90 truncate">
              document.cookie = "session_token=sec_jwt_89a1f09230198421a; user_role=admin"
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Click acknowledge to close alert and clear stack
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Acknowledge Exploit
          </button>
        </div>
      </div>
    </div>
  );
};
