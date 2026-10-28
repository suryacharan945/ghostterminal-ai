export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  stage: string;
  environment: string;
  model_status: string;
  model_id: string;
}

export type ConnectionStatus = 'loading' | 'connected' | 'unavailable' | 'error';

export interface HealthState {
  status: ConnectionStatus;
  data: HealthResponse | null;
  errorMessage: string | null;
  lastChecked: Date | null;
}
