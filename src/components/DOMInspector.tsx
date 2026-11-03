import React, { useState } from 'react';
import { ExecutionLog } from '../types';
import { Terminal, Cookie, Database, Activity, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface DOMInspectorProps {
  logs: ExecutionLog[];
  onClearLogs: () => void;
  searchQuery: string;
}

export const DOMInspector: React.FC<DOMInspectorProps> = ({ logs, onClearLogs, searchQuery }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'cookies' | 'dom'>('logs');

  // Simulated session cookies and token data
  const simulatedCookies = [
    { name: 'session_token', value: 'sec_jwt_89a1f09230198421a', httpOnly: false, expiry: 'Session' },
    { name: 'user_role', value: 'admin_security_lead', httpOnly: false, expiry: '2026-12-31' },
    { name: 'csrf_token', value: '8a91b2c3d4e5f6a7', httpOnly: true, expiry: 'Session' },
  ];

  const simulatedLocalStorage = [
    { key: 'auth_user', value: '{"id":1024,"email":"user@example.com","role":"admin"}' },
    { key: 'theme_pref', value: 'dark' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              Developer & Execution Inspector
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Browser Runtime & Session Data Monitor
          </h2>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            Execution Logs ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'cookies' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cookie className="w-3.5 h-3.5 text-amber-400" />
            Session Storage & Cookies
          </button>
        </div>
      </div>

      {/* Tab 1: Execution Logs */}
      {activeTab === 'logs' && (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span>Captured JavaScript & Event Handler Execution Logs:</span>
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Logs
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800/80 text-slate-500 font-mono text-xs">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
              <span>No XSS execution events captured yet. Try entering an onerror payload in the search bar.</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-950 border border-rose-800/60 rounded-xl text-xs font-mono shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {log.eventType}
                    </span>
                    <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                  </div>

                  <p className="text-slate-300 font-semibold">{log.interceptedMessage}</p>

                  <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-400">
                    <span className="text-slate-500 font-bold">Executed Payload: </span>
                    <code className="text-rose-300 break-all">{log.payload}</code>
                  </div>

                  {log.stolenData && (
                    <div className="mt-2 text-[10px] text-amber-300/90 font-mono">
                      ⚠️ <span className="font-bold">Accessible document.cookie:</span> {log.stolenData.cookies}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Session Storage & Cookies */}
      {activeTab === 'cookies' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <Cookie className="w-4 h-4 text-amber-400" />
              Document Cookies (Accessible via document.cookie unless HttpOnly flag is set)
            </h3>

            <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">HttpOnly Flag</th>
                    <th className="p-3">XSS Vulnerable?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {simulatedCookies.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-amber-300">{c.name}</td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{c.value}</td>
                      <td className="p-3">
                        {c.httpOnly ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                            YES (Protected)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                            NO (Exposed to JS)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {!c.httpOnly ? (
                          <span className="text-rose-400 font-bold">⚠️ Readable via document.cookie</span>
                        ) : (
                          <span className="text-emerald-400">Blocked by Browser</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              LocalStorage Key-Value Store
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              {simulatedLocalStorage.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-cyan-300 font-semibold">{item.key}:</span>
                  <code className="text-slate-300 text-[11px] truncate max-w-md">{item.value}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
