import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, ShieldAlert, Zap, AlertCircle, Info, Code, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { analyzeXSSQuery } from '../utils/xssDetector';
import { ExecutionLog } from '../types';

interface SearchBarArenaProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isVulnerableMode: boolean;
  setIsVulnerableMode: (vulnerable: boolean) => void;
  onReset: () => void;
  onLogExecution: (log: ExecutionLog) => void;
  onTriggerAlertModal: (title: string, message: string, payload: string) => void;
}

export const SearchBarArena: React.FC<SearchBarArenaProps> = ({
  searchQuery,
  setSearchQuery,
  isVulnerableMode,
  setIsVulnerableMode,
  onReset,
  onLogExecution,
  onTriggerAlertModal,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'dom-tree' | 'source'>('preview');
  const [lastExecutedPayload, setLastExecutedPayload] = useState<string>('');
  const outputContainerRef = useRef<HTMLDivElement>(null);

  // Analyze current search query in real time
  const detection = analyzeXSSQuery(searchQuery);

  // Intercept window.alert calls inside search execution scope or image error events
  useEffect(() => {
    if (!isVulnerableMode || !searchQuery) return;

    // Standardize alert capturing
    const handleGlobalAlert = (msg: string) => {
      const newLog: ExecutionLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        payload: searchQuery,
        eventType: 'JavaScript alert() / inline handler execution',
        triggeredElement: detection.vectorName,
        interceptedMessage: msg,
        stolenData: {
          cookies: document.cookie || 'session_token=sec_991823a1; user_role=admin; csrf=8a9b2',
          origin: window.location.origin,
          userAgent: navigator.userAgent,
        },
      };

      onLogExecution(newLog);
      onTriggerAlertModal('⚡ SIMULATED XSS EXPLOIT FIRED!', msg, searchQuery);
      setLastExecutedPayload(searchQuery);
    };

    // Override alert temporarily within sandbox
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      handleGlobalAlert(String(msg ?? 'XSS Execution Confirmed!'));
    };

    // Monitor image onerror triggers inside the output container
    const container = outputContainerRef.current;
    if (container) {
      const handleImageError = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target && target.getAttribute('onerror')) {
          const handlerAttr = target.getAttribute('onerror') || '';
          if (searchQuery !== lastExecutedPayload) {
            handleGlobalAlert(`Image load failed on element <${target.tagName.toLowerCase()}>! Executed onerror: ${handlerAttr}`);
          }
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
  }, [searchQuery, isVulnerableMode, lastExecutedPayload]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-2xl relative">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              Interactive Vulnerable Search Bar
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
              {isVulnerableMode ? 'UNSANITIZED SINK ACTIVE' : 'SECURE TEXT ESCAPED'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Test Reflected XSS Payloads in Real-Time
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switch Pills */}
          <button
            onClick={() => setIsVulnerableMode(!isVulnerableMode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              isVulnerableMode
                ? 'bg-rose-950/90 text-rose-200 border-rose-700 hover:bg-rose-900'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-700 hover:bg-emerald-900'
            }`}
          >
            {isVulnerableMode ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>Mode: {isVulnerableMode ? 'Vulnerable (innerHTML)' : 'Secure (Escaped)'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            Reset State
          </button>
        </div>
      </div>

      {/* Interactive Search Bar Input */}
      <div className="relative mb-6">
        <label htmlFor="xss-search-input" className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
          <span>Search Bar Input Field (Type or select a payload preset):</span>
          <span className="text-[11px] font-mono text-slate-400">
            Target Sink: <code className="text-rose-400 font-semibold">{isVulnerableMode ? 'element.innerHTML' : 'element.textContent'}</code>
          </span>
        </label>

        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            id="xss-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Type search or payload e.g. <img src=x onerror=alert(document.cookie)>'
            className="w-full pl-12 pr-28 py-3.5 bg-slate-950 text-slate-100 placeholder-slate-500 font-mono text-sm border-2 border-slate-700 focus:border-rose-500 focus:outline-none rounded-xl transition-all shadow-inner"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                title="Clear input"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Educational Exploit Trigger Detection Label Callout */}
      {detection.detected && isVulnerableMode && (
        <div className="mb-6 p-4 bg-rose-950/60 border-2 border-rose-600/80 rounded-xl shadow-lg animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-900/80 rounded-lg text-rose-300 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  EDUCATIONAL CALLOUT: EXPLOIT VECTOR TRIGGERED!
                </span>

                <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase rounded bg-red-900 text-rose-200 border border-red-700">
                  Risk Level: {detection.riskLevel}
                </span>
              </div>

              <h4 className="text-base font-bold text-white mt-1">
                {detection.vectorName}
              </h4>

              <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                {detection.explanation}
              </p>

              <div className="mt-3 pt-3 border-t border-rose-800/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="text-rose-300">
                  <span className="text-rose-400 font-semibold">Affected Vector/Attributes:</span>{' '}
                  {detection.affectedAttributes.map((attr, idx) => (
                    <code key={idx} className="bg-rose-900/80 px-1.5 py-0.5 rounded text-rose-100 mx-0.5">
                      {attr}
                    </code>
                  ))}
                </div>

                <div className="text-emerald-300 font-semibold flex items-center gap-1">
                  <span>💡 Defensive Remediation:</span>
                  <span className="text-emerald-200">{detection.suggestedFix}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Rendered DOM Output Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
        {/* Output Stage Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-slate-200">
              Live DOM Search Results Rendering Stage
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              Live Visual DOM
            </button>
            <button
              onClick={() => setActiveTab('source')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'source' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              Raw HTML Source
            </button>
          </div>
        </div>

        {/* Live DOM Preview Container */}
        <div className="p-6 min-h-[160px] flex flex-col justify-center">
          {searchQuery ? (
            activeTab === 'preview' ? (
              <div ref={outputContainerRef} className="w-full">
                <p className="text-xs font-mono text-slate-400 mb-2">
                  Query search results for:
                </p>

                {isVulnerableMode ? (
                  /* VULNERABLE: Direct unsanitized HTML injection via dangerouslySetInnerHTML */
                  <div
                    className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 text-sm break-words overflow-x-auto shadow-md"
                    dangerouslySetInnerHTML={{
                      __html: searchQuery,
                    }}
                  />
                ) : (
                  /* SECURE: Standard React string rendering (HTML entity escaped) */
                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/60 rounded-xl text-emerald-200 text-sm font-mono break-words shadow-md">
                    {searchQuery}
                  </div>
                )}
              </div>
            ) : (
              /* Raw Source View */
              <div className="w-full">
                <p className="text-xs font-mono text-slate-400 mb-2">
                  DOM InnerHTML Structure:
                </p>
                <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-rose-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {isVulnerableMode
                    ? `<div id="search-results">${searchQuery}</div>`
                    : `<div id="search-results">${searchQuery.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</div>`}
                </pre>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>Search query is empty. Type a search term or click a preset payload below to test execution.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
