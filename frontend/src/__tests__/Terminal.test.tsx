import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../components/Header';
import { Suggestions } from '../components/Suggestions';
import { InputBar } from '../components/InputBar';
import { Terminal } from '../components/Terminal';
import { SettingsModal } from '../components/SettingsModal';
import { HelpModal } from '../components/HelpModal';
import { TerminalMessage, TerminalSettings } from '../types';

describe('Terminal UI Components', () => {
  describe('Header Component', () => {
    it('renders branding and status indicators', () => {
      const onOpenSettings = vi.fn();
      const onOpenHelp = vi.fn();
      const onRefreshHealth = vi.fn();

      render(
        <Header
          connection="connected"
          health={{
            status: 'healthy',
            app: 'GhostTerminal AI',
            version: '0.3.0',
            stage: 'part3',
            environment: 'development',
            model_status: 'ready',
            model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
          }}
          modelStatus={{
            model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
            model_file: 'models/qwen2.5-0.5b-instruct-q4_k_m.gguf',
            status: 'ready',
            device: 'cpu',
            load_time_ms: 1200,
            total_inferences: 5,
          }}
          onOpenSettings={onOpenSettings}
          onOpenHelp={onOpenHelp}
          onRefreshHealth={onRefreshHealth}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('GHOSTTERMINAL AI')).toBeInTheDocument();
      expect(screen.getByText(/Ghost in the Machine/i)).toBeInTheDocument();
      expect(screen.getByText(/Local AI Ready/i)).toBeInTheDocument();
      expect(screen.getByText(/Qwen2.5-0.5B \(CPU\)/i)).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/open settings/i));
      expect(onOpenSettings).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByLabelText(/open help guide/i));
      expect(onOpenHelp).toHaveBeenCalledTimes(1);
    });

    it('shows offline status when disconnected', () => {
      render(
        <Header
          connection="unavailable"
          health={null}
          modelStatus={null}
          onOpenSettings={vi.fn()}
          onOpenHelp={vi.fn()}
          onRefreshHealth={vi.fn()}
          isRefreshing={false}
        />
      );

      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    });
  });

  describe('Suggestions Component', () => {
    it('renders suggested command pills and handles selection', () => {
      const onSelect = vi.fn();
      render(<Suggestions onSelectSuggestion={onSelect} disabled={false} />);

      const whoamiBtn = screen.getByText('whoami');
      expect(whoamiBtn).toBeInTheDocument();

      fireEvent.click(whoamiBtn);
      expect(onSelect).toHaveBeenCalledWith('whoami');

      const storyBtn = screen.getByText('Tell me a ghost story');
      fireEvent.click(storyBtn);
      expect(onSelect).toHaveBeenCalledWith('Tell me a ghost story');
    });

    it('disables buttons when disabled prop is true', () => {
      const onSelect = vi.fn();
      render(<Suggestions onSelectSuggestion={onSelect} disabled={true} />);

      const whoamiBtn = screen.getByText('whoami').closest('button');
      expect(whoamiBtn).toBeDisabled();
    });
  });

  describe('InputBar Component', () => {
    it('prevents empty submissions', () => {
      const onSubmit = vi.fn();
      render(
        <InputBar
          onSubmit={onSubmit}
          onClear={vi.fn()}
          disabled={false}
          history={[]}
        />
      );

      const submitBtn = screen.getByLabelText(/execute command/i);
      expect(submitBtn).toBeDisabled();

      fireEvent.click(submitBtn);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits valid input on Enter key', () => {
      const onSubmit = vi.fn();
      render(
        <InputBar
          onSubmit={onSubmit}
          onClear={vi.fn()}
          disabled={false}
          history={[]}
        />
      );

      const textarea = screen.getByLabelText(/terminal prompt input/i);
      fireEvent.change(textarea, { target: { value: 'whoami' } });

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      expect(onSubmit).toHaveBeenCalledWith('whoami');
    });

    it('supports history navigation with Up and Down arrows', () => {
      const onSubmit = vi.fn();
      render(
        <InputBar
          onSubmit={onSubmit}
          onClear={vi.fn()}
          disabled={false}
          history={['git status', 'whoami']}
        />
      );

      const textarea = screen.getByLabelText(/terminal prompt input/i);

      // Press ArrowUp to recall last command
      fireEvent.keyDown(textarea, { key: 'ArrowUp' });
      expect((textarea as HTMLTextAreaElement).value).toBe('whoami');

      // Press ArrowUp again for previous command
      fireEvent.keyDown(textarea, { key: 'ArrowUp' });
      expect((textarea as HTMLTextAreaElement).value).toBe('git status');

      // Press ArrowDown to move back forward
      fireEvent.keyDown(textarea, { key: 'ArrowDown' });
      expect((textarea as HTMLTextAreaElement).value).toBe('whoami');
    });
  });

  describe('Terminal Component', () => {
    it('renders messages with role and metadata', () => {
      const messages: TerminalMessage[] = [
        {
          id: '1',
          sender: 'user',
          text: 'git status',
          timestamp: new Date(),
        },
        {
          id: '2',
          sender: 'ghost',
          text: 'Spectral git branch clean. Haunted spirits rest.',
          timestamp: new Date(),
          metadata: {
            inference_ms: 12.4,
            mode: 'simulated',
            tokens_generated: 0,
            model_id: 'deterministic-simulator',
          },
        },
      ];

      render(
        <Terminal
          messages={messages}
          isLoading={false}
        />
      );

      expect(screen.getByText('git status')).toBeInTheDocument();
      expect(screen.getByText(/Spectral git branch clean/i)).toBeInTheDocument();
      expect(screen.getByText('SIMULATED')).toBeInTheDocument();
      expect(screen.getByText(/12.4 ms/i)).toBeInTheDocument();
    });

    it('renders thinking state when loading', () => {
      render(
        <Terminal
          messages={[]}
          isLoading={true}
        />
      );

      expect(screen.getByLabelText('Ghost is thinking')).toBeInTheDocument();
      expect(screen.getByText(/Communing through the wires/i)).toBeInTheDocument();
    });
  });

  describe('Modals', () => {
    const defaultSettings: TerminalSettings = {
      crtEffects: true,
      soundEffects: true,
      typewriterEffect: true,
      typewriterSpeed: 'fast',
      reducedMotion: false,
      maxTokens: 120,
      temperature: 0.7,
    };

    it('SettingsModal updates settings correctly', () => {
      const onUpdateSettings = vi.fn();
      const onClose = vi.fn();

      render(
        <SettingsModal
          isOpen={true}
          settings={defaultSettings}
          onUpdateSettings={onUpdateSettings}
          onResetDefaults={vi.fn()}
          onClose={onClose}
        />
      );

      expect(screen.getByText('Terminal Configurations')).toBeInTheDocument();

      const crtCheckbox = screen.getByLabelText(/crt scanlines/i);
      fireEvent.click(crtCheckbox);

      expect(onUpdateSettings).toHaveBeenCalledWith({
        crtEffects: false,
      });

      fireEvent.click(screen.getByLabelText(/close settings/i));
      expect(onClose).toHaveBeenCalled();
    });

    it('HelpModal displays command reference and closes', () => {
      const onClose = vi.fn();
      render(<HelpModal isOpen={true} onClose={onClose} />);

      expect(screen.getByText('GhostTerminal Spectral Manual')).toBeInTheDocument();
      expect(screen.getByText(/Recognized Simulated Commands/i)).toBeInTheDocument();
      expect(screen.getByText(/Freeform Creative Queries/i)).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/close manual/i));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
