import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchHealth, fetchModelStatus, submitInference } from '../api';
import { HealthResponse, ModelStatusResponse, InferenceResponse } from '../types';

describe('Frontend API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchHealth', () => {
    it('returns health payload when server is responsive', async () => {
      const mockData: HealthResponse = {
        status: 'healthy',
        app: 'GhostTerminal AI',
        version: '0.3.0',
        stage: 'part3',
        environment: 'development',
        model_status: 'ready',
        model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      const result = await fetchHealth();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/health', expect.any(Object));
    });

    it('throws error when server responds with 500', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Ghost malfunction in spectral engine' }),
      } as Response);

      await expect(fetchHealth()).rejects.toThrow('Health check failed (500)');
    });

    it('throws network error when fetch fails completely', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(fetchHealth()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('fetchModelStatus', () => {
    it('returns loaded model status', async () => {
      const mockData: ModelStatusResponse = {
        model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
        model_file: 'models/qwen2.5-0.5b-instruct-q4_k_m.gguf',
        status: 'ready',
        device: 'cpu',
        load_time_ms: 1200,
        total_inferences: 5,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      const result = await fetchModelStatus();
      expect(result.status).toBe('ready');
      expect(result.model_id).toBe('Qwen/Qwen2.5-0.5B-Instruct');
    });

    it('returns uninitialized model status', async () => {
      const mockData: ModelStatusResponse = {
        model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
        model_file: 'none',
        status: 'not_loaded',
        device: 'cpu',
        load_time_ms: 0,
        total_inferences: 0,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      const result = await fetchModelStatus();
      expect(result.status).toBe('not_loaded');
    });
  });

  describe('submitInference', () => {
    it('returns local inference response successfully', async () => {
      const mockResponse: InferenceResponse = {
        response: 'Beware the spectral signal pulsing in memory...',
        model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
        mode: 'local',
        inference_ms: 320.5,
        tokens_generated: 42,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await submitInference({
        prompt: 'Tell me a ghost story',
        max_tokens: 120,
        temperature: 0.7,
      });

      expect(result.mode).toBe('local');
      expect(result.response).toContain('Beware the spectral signal');
      expect(result.tokens_generated).toBe(42);
    });

    it('returns simulated deterministic command response', async () => {
      const mockResponse: InferenceResponse = {
        response: 'GHOSTTERMINAL_AI // REPOSITORY STATUS\nOn branch main',
        model_id: 'deterministic-simulator',
        mode: 'simulated',
        inference_ms: 0.8,
        tokens_generated: 0,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await submitInference({ prompt: 'git status' });

      expect(result.mode).toBe('simulated');
      expect(result.tokens_generated).toBe(0);
    });

    it('handles 503 Service Unavailable when model is not loaded', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ detail: 'Spectral core uninitialized. Model weights not loaded.' }),
      } as Response);

      await expect(
        submitInference({ prompt: 'hello' })
      ).rejects.toThrow('Spectral core uninitialized. Model weights not loaded.');
    });

    it('handles 422 Unprocessable Entity for invalid prompt', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [{ loc: ['body', 'prompt'], msg: 'ensure this value has at least 1 characters' }],
        }),
      } as Response);

      await expect(
        submitInference({ prompt: '' })
      ).rejects.toThrow();
    });
  });
});
