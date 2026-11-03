import React, { useEffect, useRef } from 'react';
import { Search, RotateCcw, Zap, AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { analyzeXSSQuery } from '../utils/xssDetector';
import { PRESET_PAYLOADS } from '../data/payloads';
import { ExecutionLog } from '../types';

interface JeevesSearchSandboxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isVulnerableMode: boolean;
  onReset: () => void;
  onLogExecution: (log: ExecutionLog) => void;
  onTriggerAlertModal: (title: string, message: string, payload: string) => void;
}

export const JeevesSearchSandbox: React.FC<JeevesSearchSandboxProps> = ({
  searchQuery,
  setSearchQuery,
  isVulnerableMode,
  onReset,
  onLogExecution,
  onTriggerAlertModal,
}) => {
  const outputContainerRef = useRef<HTMLDivElement>(null);

  // Real-time detection analysis
  const detection = analyzeXSSQuery(searchQuery);

  // Monitor image onerror triggers and alert intercepts
  useEffect(() => {
    if (!isVulnerableMode || !searchQuery) return;

    const handleGlobalAlert = (msg: string) => {
      const newLog: ExecutionLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        payload: searchQuery,
        eventType: 'XSS Execution Intercepted',
        triggeredElement: detection.vectorName,
        interceptedMessage: msg,
        stolenData: {
          cookies: document.cookie || 'session_token=sec_991823a1; user_role=admin',
          origin: window.location.origin,
          userAgent: navigator.userAgent,
        },
      };

      onLogExecution(newLog);
      onTriggerAlertModal('⚡ XSS EXPLOIT TRIGGERED!', msg, searchQuery);
    };

    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      handleGlobalAlert(String(msg ?? 'XSS Execution Confirmed!'));
    };

    const container = outputContainerRef.current;
    if (container) {
      const handleImageError = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target && target.getAttribute('onerror')) {
          handleGlobalAlert(`Image onerror fired on <${target.tagName.toLowerCase()}>! Payload: ${target.getAttribute('onerror')}`);
        }
      };

      container.addEventListener('error', handleImageError, true);
      return () => {
        window.alert = originalAlert;
        container.removeEventListener('error', handleImageError, true);
      };
    }

    return () => {
      window.alert = originalAlert;
    };
  }, [searchQuery, isVulnerableMode]);

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      {/* Jeeves Hero Greeting */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Ask Jeeves <span className="italic text-slate-400 font-normal">XSS Sandbox</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Search anything or test unsanitized HTML/JavaScript payloads to observe DOM-based Reflected XSS in action.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative mb-4">
        <div className="relative flex items-center shadow-2xl">
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Type e.g. <img src=x onerror=alert("XSS")>'
            className="w-full pl-12 pr-28 py-4 bg-slate-900 text-slate-100 placeholder-slate-500 font-mono text-sm border-2 border-slate-800 focus:border-rose-500/80 focus:outline-none rounded-2xl transition-all shadow-inner"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={onReset}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors flex items-center gap-1"
                title="Clear input and reset page state"
              >
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Preset Sample Tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-mono">
        <span className="text-slate-500 text-[11px]">Test Vectors:</span>
        {PRESET_PAYLOADS.slice(0, 4).map((p) => (
          <button
            key={p.id}
            onClick={() => setSearchQuery(p.query)}
            className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-800 rounded-lg text-[11px] transition-colors truncate max-w-[160px]"
            title={p.description}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Reflected Search Output Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3 pb-2 border-b border-slate-800/80">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isVulnerableMode ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span>DOM Reflection Sink: <code className="text-slate-200 font-bold">{isVulnerableMode ? 'innerHTML' : 'textContent'}</code></span>
          </span>

          <span className="text-[11px] text-slate-500">
            Mode: {isVulnerableMode ? '⚠️ Vulnerable (Unsanitized)' : '🛡️ Secure (Escaped)'}
          </span>
        </div>

        <div className="min-h-[120px] flex flex-col justify-center">
          {searchQuery ? (
            <div>
              <p className="text-xs font-mono text-slate-400 mb-2">
                Search results for query:
              </p>

              {isVulnerableMode ? (
                /* VULNERABLE: Direct unsanitized HTML rendering */
                <div
                  ref={outputContainerRef}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm break-words overflow-x-auto shadow-inner"
                  dangerouslySetInnerHTML={{ __html: searchQuery }}
                />
              ) : (
                /* SECURE: HTML entity escaped text */
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/60 rounded-xl text-emerald-200 font-mono text-sm break-words shadow-inner">
                  {searchQuery}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              <span>Search query is empty. Enter an XSS payload or select a test vector above.</span>
            </div>
          )}
        </div>
      </div>

      {/* Educational Exploit Trigger Callout Card */}
      {detection.detected && isVulnerableMode && (
        <div className="bg-rose-950/40 border-2 border-rose-600/70 rounded-2xl p-5 shadow-xl animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-900/80 rounded-xl text-rose-300 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Educational Callout: Exploit Triggered
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-900 text-rose-200 border border-rose-700">
                  {detection.riskLevel} Risk
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">
                {detection.vectorName}
              </h3>

              <p className="text-xs text-rose-200/90 mt-1.5 leading-relaxed">
                {detection.explanation}
              </p>

              <div className="mt-4 pt-3 border-t border-rose-800/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="text-rose-300">
                  <span className="text-rose-400 font-semibold">Vector:</span>{' '}
                  {detection.affectedAttributes.map((attr, idx) => (
                    <code key={idx} className="bg-rose-900/80 px-1.5 py-0.5 rounded text-rose-100 mx-0.5">
                      {attr}
                    </code>
                  ))}
                </div>

                <div className="text-emerald-300 font-semibold text-[11px] flex items-center gap-1">
                  <span>Remediation:</span>
                  <span className="text-emerald-200 font-normal">{detection.suggestedFix}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
