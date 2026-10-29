export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  stage: string;
  environment: string;
  model_status: 'not_loaded' | 'loading' | 'ready' | 'failed' | string;
  model_id: string;
}

export interface ModelStatusResponse {
  model_id: string;
  model_file: string;
  status: 'not_loaded' | 'loading' | 'ready' | 'failed' | string;
  device: string;
  load_time_ms: number;
  total_inferences: number;
}

export interface InferenceRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
}

export interface InferenceResponse {
  response: string;
  model_id: string;
  inference_ms: number;
  tokens_generated: number;
  mode: 'local' | 'simulated' | string;
}

export interface TerminalMessage {
  id: string;
  sender: 'user' | 'ghost' | 'system' | 'error';
  text: string;
  timestamp: Date;
  mode?: 'local' | 'simulated';
  metadata?: {
    inference_ms?: number;
    tokens_generated?: number;
    model_id?: string;
    mode?: string;
  };
}

export interface TerminalSettings {
  crtEffects: boolean;
  typewriterEffect: boolean;
  typewriterSpeed: 'instant' | 'fast' | 'normal';
  soundEffects: boolean;
  reducedMotion: boolean;
  maxTokens: number;
  temperature: number;
}

export type ConnectionStatus = 'loading' | 'connected' | 'unavailable' | 'error';
