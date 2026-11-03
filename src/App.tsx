import React, { useState } from 'react';
import { Header } from './components/Header';
import { JeevesSearchSandbox } from './components/JeevesSearchSandbox';
import { CollapsibleDetailsDrawer } from './components/CollapsibleDetailsDrawer';
import { SimulatedAlertModal } from './components/SimulatedAlertModal';
import { ExecutionLog } from './types';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  // Application State
  const defaultPayload = `<img src="x" onerror="alert('⚠️ DOM XSS Exploit Fired!')">`;
  const [searchQuery, setSearchQuery] = useState<string>(defaultPayload);
  const [isVulnerableMode, setIsVulnerableMode] = useState<boolean>(true);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  // Simulated Alert Modal State
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    payload: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    payload: '',
  });

  // Reset Handler
  const handleReset = () => {
    setSearchQuery('');
    setExecutionLogs([]);
    setAlertModal({ isOpen: false, title: '', message: '', payload: '' });
    setIsVulnerableMode(true);
  };

  const handleLogExecution = (newLog: ExecutionLog) => {
    setExecutionLogs((prev) => [newLog, ...prev]);
  };

  const handleTriggerAlertModal = (title: string, message: string, payload: string) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      payload,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <Header
        onReset={handleReset}
        isVulnerableMode={isVulnerableMode}
        setIsVulnerableMode={setIsVulnerableMode}
      />

      {/* Main Decluttered Jeeves Search View */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pb-12 flex flex-col justify-between">
        <JeevesSearchSandbox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isVulnerableMode={isVulnerableMode}
          onReset={handleReset}
          onLogExecution={handleLogExecution}
          onTriggerAlertModal={handleTriggerAlertModal}
        />

        <CollapsibleDetailsDrawer
          logs={executionLogs}
          onClearLogs={() => setExecutionLogs([])}
          searchQuery={searchQuery}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Ask Jeeves XSS Practical Workbench</span>
          </div>
          <span className="text-[11px] text-slate-500">Educational Demonstration</span>
        </div>
      </footer>

      {/* Intercepted Alert Modal Popup */}
      <SimulatedAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        payload={alertModal.payload}
      />
    </div>
  );
}
