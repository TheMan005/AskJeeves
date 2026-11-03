export interface XSSPayload {
  id: string;
  name: string;
  category: 'DOM Event' | 'HTML Defacement' | 'SVG Vector' | 'Pseudo Protocol' | 'Attribute Breakout' | 'Cookie Theft';
  query: string;
  description: string;
  triggerExplanation: string;
  riskLevel: 'High' | 'Critical' | 'Medium';
  targetContext: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  payload: string;
  eventType: string;
  triggeredElement: string;
  interceptedMessage: string;
  stolenData?: {
    cookies: string;
    origin: string;
    userAgent: string;
  };
}

export interface TriggerDetection {
  detected: boolean;
  vectorName: string;
  explanation: string;
  riskLevel: 'High' | 'Critical' | 'Medium';
  affectedAttributes: string[];
  suggestedFix: string;
}
