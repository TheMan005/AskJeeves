import React, { useState } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Copy, Check } from 'lucide-react';

export const CodeComparison: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const vulnerableCode = `// ❌ VULNERABLE IMPLEMENTATION
// Directly rendering untrusted search query string into DOM via innerHTML
const searchInput = document.getElementById('search-bar').value;
const resultsContainer = document.getElementById('search-results');

// DANGEROUS SINK: Converts raw string into live executable HTML elements!
resultsContainer.innerHTML = \`<p>Results for: \${searchInput}</p>\`;`;

  const secureTextCode = `// ✅ SECURE FIX 1: Use safe textContent (React default JSX escaping)
const searchInput = document.getElementById('search-bar').value;
const resultsContainer = document.getElementById('search-results');

// SAFE SINK: Treats input strictly as plain text (escapes <script> to &lt;script&gt;)
resultsContainer.textContent = \`Results for: \${searchInput}\`;

// In React, standard JSX expressions escape untrusted strings automatically:
// <div>{searchQuery}</div>`;

  const secureDOMPurifyCode = `// ✅ SECURE FIX 2: Sanitize HTML with DOMPurify if rich markup is required
import DOMPurify from 'dompurify';

const rawQuery = document.getElementById('search-bar').value;

// DOMPurify strips script tags, dangerous inline event handlers (onerror, onload)
const cleanHTML = DOMPurify.sanitize(rawQuery, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});

resultsContainer.innerHTML = cleanHTML;`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Vulnerability Remediation Guide</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">
          Side-by-Side Code Comparison: Vulnerable vs Secure Implementation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Learn how to remediate DOM-based XSS using secure sinks, HTML entity encoding, sanitization libraries, and Content Security Policy (CSP).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vulnerable Code Card */}
        <div className="bg-slate-950 border border-rose-800/80 rounded-xl p-5 relative flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                <XCircle className="w-4 h-4 text-rose-500" />
                Vulnerable Code (Unsafe innerHTML Sink)
              </span>

              <button
                onClick={() => handleCopy(vulnerableCode, 1)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors"
                title="Copy code"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-rose-200 overflow-x-auto leading-relaxed">
              {vulnerableCode}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-950 text-xs text-rose-300/90 leading-relaxed">
            <strong className="text-rose-400">Why it fails:</strong> The browser parses any HTML tags or event attributes inside <code className="text-rose-300">searchInput</code> as live DOM nodes, executing embedded scripts synchronously.
          </div>
        </div>

        {/* Secure Code Card 1 */}
        <div className="bg-slate-950 border border-emerald-800/80 rounded-xl p-5 relative flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Secure Fix 1 (textContent / React JSX)
              </span>

              <button
                onClick={() => handleCopy(secureTextCode, 2)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors"
                title="Copy code"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
              {secureTextCode}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-950 text-xs text-emerald-300/90 leading-relaxed">
            <strong className="text-emerald-400">Why it works:</strong> <code className="text-emerald-300">textContent</code> forces the browser to treat input strictly as string literal data rather than HTML markups.
          </div>
        </div>
      </div>

      {/* CSP & DOMPurify Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs font-mono">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Defense-In-Depth: Content Security Policy (CSP) Header
        </h3>

        <p className="text-slate-400 mb-3 leading-relaxed">
          Even if an application accidentally renders unsanitized input, a strict Content Security Policy (CSP) header instructs the browser to reject unauthorized inline scripts.
        </p>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-cyan-300 font-semibold text-[11px]">
          Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; object-src 'none';
        </div>
      </div>
    </div>
  );
};
