import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for AI XSS Payload Security Analysis
app.post('/api/analyze-xss', async (req, res) => {
  const { payload, context, question } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        analysis: `### 🎯 Executive Vulnerability Breakdown
The payload \`${payload || '<img src=x onerror=alert(1)>'}\` attempts to execute inline JavaScript within the DOM context.

### ⚡ Browser Execution Pathway
1. The user inputs an unsanitized payload string into the search input.
2. Client-side JavaScript assigns the string directly to an \`innerHTML\` sink.
3. The HTML parser parses tags like \`<img>\` or \`<svg>\`. When an image fails to load, the browser synchronously triggers the inline \`onerror\` event handler.

### 🚨 Exploit Impact & Real-World Risk
- **Session Hijacking**: Attacker can read sensitive un-flagged cookies via \`document.cookie\`.
- **UI Defacement**: Attacker can inject arbitrary HTML markup and overlay fake login forms.

### 🛡️ Secure Remediation
- **Safe Sink**: Use \`textContent\` instead of \`innerHTML\`.
- **Sanitization**: Pass untrusted input through \`DOMPurify.sanitize()\`.
- **Content Security Policy**: Enforce \`Content-Security-Policy: default-src 'self'\`.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Senior Application Security & Vulnerability Analysis Engineer specialized in Web Application Security, Cross-Site Scripting (XSS), and Content Security Policy (CSP).

Analyze the following user input / XSS payload in the context of DOM-based Reflected XSS demonstration:

Payload: "${payload || '<img src=x onerror=alert(1)>'}"
Context: ${context || 'Reflected Search Input inside DOM element'}
User Specific Question: ${question || 'Explain how this payload executes, why it bypasses naive sanitation, and how to remediate it properly.'}

Provide a structured educational response in Markdown with:
1. 🎯 **Executive Vulnerability Breakdown**: High-level overview of what this payload attempts to do.
2. ⚡ **Browser Execution Pathway**: Step-by-step breakdown of how the HTML/JavaScript parser processes and triggers this payload.
3. 🚨 **Exploit Impact & Real-World Risk**: Potential consequences (Cookie theft, session hijacking, defacement, credential harvesting).
4. 🛡️ **Secure Remediation & Defensive Coding**: Code examples showing HTML Entity Encoding, DOMPurify, or CSP headers to prevent this attack.

Keep the tone highly professional, precise, educational, and easy to understand for security students and developers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({
      analysis: response.text || 'No analysis generated.',
    });
  } catch (err: any) {
    console.error('Error analyzing XSS payload:', err);
    return res.json({
      analysis: `### 🎯 Vulnerability Breakdown (${payload || 'Search Input'})

The payload attempts to execute inline JavaScript within the DOM.

### ⚡ Browser Execution Pathway
When untrusted markup is inserted into \`innerHTML\`, inline event handlers execute in the current document origin.

### 🛡️ Remediation
Always escape user input or use \`textContent\` to render plain strings safely.`,
    });
  }
});

async function startServer() {
  const server = createHttpServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
