import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Terminal, CheckCircle2, Sparkles, Cookie, Activity } from 'lucide-react';
import { DOMInspector } from './DOMInspector';
import { CodeComparison } from './CodeComparison';
import { AIExploitAssistant } from './AIExploitAssistant';
import { ExecutionLog } from '../types';

interface CollapsibleDetailsDrawerProps {
  logs: ExecutionLog[];
  onClearLogs: () => void;
  searchQuery: string;
}

export const CollapsibleDetailsDrawer: React.FC<CollapsibleDetailsDrawerProps> = ({
  logs,
  onClearLogs,
  searchQuery,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inspector' | 'remediation' | 'ai'>('inspector');

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 border-t border-slate-800/80 pt-4">
      {/* Drawer Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2.5 px-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400 hover:text-slate-200 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-400" />
          <span>Developer Tools & Security Reference ({logs.length} logs captured)</span>
        </div>

        <div className="flex items-center gap-1 font-semibold text-slate-300">
          <span>{isOpen ? 'Hide Reference Tools' : 'Inspect Code & Logs'}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Drawer Body */}
      {isOpen && (
        <div className="mt-4 space-y-6 animate-fade-in">
          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'inspector' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              Runtime Logs & Session Data
            </button>

            <button
              onClick={() => setActiveTab('remediation')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'remediation' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Vulnerable vs Secure Code
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Security Assistant
            </button>
          </div>

          {/* Tab 1: DOM Inspector */}
          {activeTab === 'inspector' && (
            <DOMInspector logs={logs} onClearLogs={onClearLogs} searchQuery={searchQuery} />
          )}

          {/* Tab 2: Code Comparison */}
          {activeTab === 'remediation' && <CodeComparison />}

          {/* Tab 3: AI Assistant */}
          {activeTab === 'ai' && <AIExploitAssistant currentPayload={searchQuery} />}
        </div>
      )}
    </div>
  );
};
