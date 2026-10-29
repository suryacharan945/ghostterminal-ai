import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';
import * as api from '../api';

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>();
  return {
    ...actual,
    fetchHealth: vi.fn(),
    fetchModelStatus: vi.fn(),
    submitInference: vi.fn(),
  };
});

describe('GhostTerminal AI App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(
      'ghostterminal_settings_v2',
      JSON.stringify({
        crtEffects: false,
        typewriterEffect: false,
        typewriterSpeed: 'instant',
        soundEffects: false,
        reducedMotion: true,
        maxTokens: 128,
        temperature: 0.7,
      })
    );

    vi.mocked(api.fetchHealth).mockResolvedValue({
      status: 'healthy',
      app: 'GhostTerminal AI',
      version: '0.3.0',
      stage: 'part3',
      environment: 'development',
      model_status: 'ready',
      model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
    });

    vi.mocked(api.fetchModelStatus).mockResolvedValue({
      model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
      model_file: 'models/qwen2.5-0.5b-instruct-q4_k_m.gguf',
      status: 'ready',
      device: 'cpu',
      load_time_ms: 1250,
      total_inferences: 3,
    });
  });

  it('initializes and displays online status and initial messages', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Local AI Ready/i)).toBeInTheDocument();
      expect(screen.getByText(/Qwen2.5-0.5B \(CPU\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/A haunted terminal awakened from cold silicon/i)).toBeInTheDocument();
  });

  it('executes a simulated command through the terminal', async () => {
    vi.mocked(api.submitInference).mockResolvedValue({
      response: 'GHOSTTERMINAL_AI // REPOSITORY STATUS\nOn branch main\nNothing to commit, working tree clean',
      model_id: 'deterministic-simulator',
      mode: 'simulated',
      inference_ms: 0.8,
      tokens_generated: 0,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Local AI Ready/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/terminal prompt input/i);
    fireEvent.change(textarea, { target: { value: 'git status' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByText(/REPOSITORY STATUS/i)).toBeInTheDocument();
    });

    expect(api.submitInference).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'git status' }),
      expect.any(AbortSignal)
    );
  });

  it('executes an AI prompt and renders local model response', async () => {
    vi.mocked(api.submitInference).mockResolvedValue({
      response: 'The machine is awake, whispering echoes through the silicon crypt.',
      model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
      mode: 'local',
      inference_ms: 280.4,
      tokens_generated: 28,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Local AI Ready/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/terminal prompt input/i);
    fireEvent.change(textarea, { target: { value: 'Tell me a ghost story' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByText(/whispering echoes through the silicon crypt/i)).toBeInTheDocument();
    });

    expect(api.submitInference).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'Tell me a ghost story' }),
      expect.any(AbortSignal)
    );
  });

  it('renders atmospheric error message when API fails', async () => {
    vi.mocked(api.submitInference).mockRejectedValue(
      new api.ApiError('Spectral core uninitialized. Model weights not loaded.', 503)
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Local AI Ready/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/terminal prompt input/i);
    fireEvent.change(textarea, { target: { value: 'fail test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByText(/MODEL UNAVAILABLE/i)).toBeInTheDocument();
      expect(screen.getByText(/Spectral core uninitialized/i)).toBeInTheDocument();
    });
  });

  it('clears terminal buffer when Clear button is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Local AI Ready/i)).toBeInTheDocument();
    });

    const clearBtn = screen.getByLabelText(/clear terminal messages/i);
    fireEvent.click(clearBtn);

    expect(screen.getByText(/Phosphor screen cleared/i)).toBeInTheDocument();
  });
});
