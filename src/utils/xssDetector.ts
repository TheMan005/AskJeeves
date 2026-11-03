import { TriggerDetection } from '../types';

export function analyzeXSSQuery(query: string): TriggerDetection {
  if (!query || query.trim() === '') {
    return {
      detected: false,
      vectorName: 'Safe Input',
      explanation: 'No potential XSS execution vectors or raw HTML elements detected.',
      riskLevel: 'Medium',
      affectedAttributes: [],
      suggestedFix: 'Render safely with standard text encoding.',
    };
  }

  const q = query.toLowerCase();

  // Check 1: Inline Event Handlers (onerror, onload, onclick, onmouseover, etc.)
  const eventHandlerMatch = q.match(/on(error|load|click|mouseover|focus|blur|keydown|submit|mouseenter|mouseleave)\s*=/i);
  if (eventHandlerMatch) {
    const handler = eventHandlerMatch[1];
    return {
      detected: true,
      vectorName: `Inline Event-Handler Injection (on${handler})`,
      explanation: `The input contains an inline 'on${handler}' event attribute. When the browser parses unescaped HTML, it binds this JavaScript snippet as an active listener on the DOM element. When the event triggers (e.g. image error or page element load), the script executes synchronously.`,
      riskLevel: 'Critical',
      affectedAttributes: [`on${handler}`, 'src', 'onload'],
      suggestedFix: `Encode HTML entities (e.g. convert '<' to '&lt;' and '"' to '&quot;') or strip event attributes using DOMPurify.sanitize().`,
    };
  }

  // Check 2: Raw Script Tag
  if (q.includes('<script') || q.includes('</script>')) {
    return {
      detected: true,
      vectorName: 'Direct <script> Tag Execution',
      explanation: 'Direct inline script tag insertion. While some modern frameworks prevent script execution via innerHTML alone without DOM append, unescaped script tags break layout and execute when appended or evaluated.',
      riskLevel: 'Critical',
      affectedAttributes: ['<script>'],
      suggestedFix: 'Disallow raw HTML injection. Enforce strict Content Security Policy (CSP) with script-src restrictions.',
    };
  }

  // Check 3: SVG Element Execution
  if (q.includes('<svg') && (q.includes('onload') || q.includes('script'))) {
    return {
      detected: true,
      vectorName: 'SVG XML Vector (onload trigger)',
      explanation: 'SVG elements are embedded XML documents that support inline scripts and onload event listeners. When inserted via innerHTML, the browser parses the XML graphics and triggers the embedded script immediately.',
      riskLevel: 'Critical',
      affectedAttributes: ['<svg>', 'onload'],
      suggestedFix: 'Sanitize incoming markup to strip <svg> tags or enforce image-only rendering without XML execution.',
    };
  }

  // Check 4: JavaScript Pseudo-Protocol
  if (q.includes('javascript:')) {
    return {
      detected: true,
      vectorName: 'JavaScript Pseudo-Protocol (javascript: URI)',
      explanation: 'The input contains a javascript: pseudo-protocol URL scheme. If rendered inside link href, iframe src, or action attributes, clicking or navigating to the link executes the JavaScript payload in the victim session.',
      riskLevel: 'High',
      affectedAttributes: ['href="javascript:..."', 'src="javascript:..."'],
      suggestedFix: 'Validate and sanitize link URLs against an allowlist of safe protocols (http:, https:, mailto:).',
    };
  }

  // Check 5: Attribute Quotes Breakout
  if (q.includes('"') || q.includes("'")) {
    const hasAttrBreak = /["']\s*(on\w+|style|class|id)\s*=/i.test(query);
    if (hasAttrBreak) {
      return {
        detected: true,
        vectorName: 'Attribute Quote Breakout Injection',
        explanation: 'Unescaped quotes in search query terminate the existing attribute value prematurely, allowing additional malicious attributes (like onmouseover= or style=) to be added to the DOM element.',
        riskLevel: 'High',
        affectedAttributes: ['value=""', 'onmouseover'],
        suggestedFix: 'Use proper attribute-aware HTML entity encoding (e.g., encode quotes as &quot; and &#39;).',
      };
    }
  }

  // Check 6: General Unescaped HTML Tag Defacement
  if (/<[a-z][\s\S]*>/i.test(query)) {
    return {
      detected: true,
      vectorName: 'Unsanitized HTML Tag Injection (UI Defacement)',
      explanation: 'The input contains raw HTML tags (e.g. <h1>, <iframe>, <div>, <style>). Rendering this string directly via innerHTML converts text into executable layout nodes, giving untrusted input styling control over the page.',
      riskLevel: 'Medium',
      affectedAttributes: ['HTML Tags'],
      suggestedFix: 'Use textContent instead of innerHTML to render raw strings as inert plain text.',
    };
  }

  return {
    detected: false,
    vectorName: 'Text String (No Script Vectors)',
    explanation: 'No immediate executable script or event handler tags detected.',
    riskLevel: 'Medium',
    affectedAttributes: [],
    suggestedFix: 'Always practice defense-in-depth by default-encoding user inputs.',
  };
}
