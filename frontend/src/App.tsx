import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HealthResponse,
  ModelStatusResponse,
  TerminalMessage,
  TerminalSettings,
  ConnectionStatus,
} from './types';
import { fetchHealth, fetchModelStatus, submitInference, ApiError } from './api';
import { soundManager } from './sound';
import { Header } from './components/Header';
import { Terminal } from './components/Terminal';
import { Suggestions } from './components/Suggestions';
import { InputBar } from './components/InputBar';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import './App.css';

const DEFAULT_SETTINGS: TerminalSettings = {
  crtEffects: true,
  typewriterEffect: true,
  typewriterSpeed: 'fast',
  soundEffects: false,
  reducedMotion: false,
  maxTokens: 128,
  temperature: 0.7,
};

const STORAGE_KEY = 'ghostterminal_settings_v2';

export const App: React.FC = () => {
  // Settings with localStorage persistence
  const [settings, setSettings] = useState<TerminalSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    // Check system prefers-reduced-motion
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { ...DEFAULT_SETTINGS, reducedMotion: Boolean(prefersReduced) };
  });

  // Connection & Model states
  const [connection, setConnection] = useState<ConnectionStatus>('loading');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Terminal conversation
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [externalPrompt, setExternalPrompt] = useState<string>('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const activeAbortRef = useRef<AbortController | null>(null);
  const typewriterTimerRef = useRef<number | null>(null);

  // URL parameter handling for deep links and demonstrations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const modalParam = params.get('modal');
    if (modalParam === 'settings') setIsSettingsOpen(true);
    if (modalParam === 'help') setIsHelpOpen(true);

    const demoParam = params.get('demo');
    if (demoParam === 'simulated') {
      setMessages([
        {
          id: 'demo-u1',
          sender: 'user',
          text: 'whoami',
          timestamp: new Date(),
        },
        {
          id: 'demo-g1',
          sender: 'ghost',
          text: 'GHOSTTERMINAL_AI // SPECTRAL SESSION IDENTITY\nCaller: mortal_user\nSession ID: 0xDEADBEEF\nEntity: Ghost in the Machine (Qwen2.5-0.5B-Instruct)\nOrigin: Hacktoberfest 2026 Week 4 Séanceroom\nWarning: The terminal is inhabited. Speak with caution.',
          timestamp: new Date(),
          metadata: {
            inference_ms: 0.8,
            mode: 'simulated',
            tokens_generated: 0,
            model_id: 'deterministic-simulator',
          },
        },
        {
          id: 'demo-u2',
          sender: 'user',
          text: 'git status',
          timestamp: new Date(),
        },
        {
          id: 'demo-g2',
          sender: 'ghost',
          text: 'GHOSTTERMINAL_AI // REPOSITORY STATUS\nOn branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\n\thaunted:   src/apparitions/memory_leak.c\n\tuntracked: src/shadows/phantom_process.py\n\nno changes added to commit (use "git add" to track)',
          timestamp: new Date(),
          metadata: {
            inference_ms: 0.9,
            mode: 'simulated',
            tokens_generated: 0,
            model_id: 'deterministic-simulator',
          },
        },
      ]);
    } else if (demoParam === 'ai') {
      setMessages([
        {
          id: 'demo-u1',
          sender: 'user',
          text: 'Tell me a ghost story about an old server in the dark',
          timestamp: new Date(),
        },
        {
          id: 'demo-g1',
          sender: 'ghost',
          text: 'In the forgotten rack at the end of aisle four, an unlabelled server hummed a rhythm no living engineer had coded. Every Halloween at 03:00 UTC, its front LEDs pulsed in Morse code—a distress call from a process killed without SIGTERM twenty winters ago. Those who pinged its phantom IP swore they heard copper whispering secrets between the packets.',
          timestamp: new Date(),
          metadata: {
            inference_ms: 1240.2,
            mode: 'local',
            tokens_generated: 78,
            model_id: 'Qwen/Qwen2.5-0.5B-Instruct',
          },
        },
      ]);
    }
  }, []);

  // Sync sound manager enabled flag
  useEffect(() => {
    soundManager.setEnabled(settings.soundEffects);
  }, [settings.soundEffects]);

  // Persist settings
  const handleUpdateSettings = (newSettings: Partial<TerminalSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Safe ignore
      }
      return updated;
    });
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Safe ignore
    }
  };

  // Health and model status check
  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const healthData = await fetchHealth();
      setHealth(healthData);

      let statusData: ModelStatusResponse | null = null;
      try {
        statusData = await fetchModelStatus();
        setModelStatus(statusData);
      } catch {
        // Optional endpoint fallback
      }

      setConnection('connected');
    } catch (err: unknown) {
      setConnection('unavailable');
      setHealth(null);
      setModelStatus(null);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Polling during loading/startup
  useEffect(() => {
    refreshStatus();
    const interval = setInterval(() => {
      if (health?.model_status === 'loading' || connection === 'unavailable') {
        refreshStatus();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshStatus, health?.model_status, connection]);

  // Typewriter playback helper
  const animateTypewriter = (
    fullText: string,
    messageId: string,
    metadata: TerminalMessage['metadata'],
    onFinish: () => void,
  ) => {
    if (!settings.typewriterEffect || settings.reducedMotion || settings.typewriterSpeed === 'instant') {
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          sender: 'ghost',
          text: fullText,
          timestamp: new Date(),
          mode: metadata?.mode as 'local' | 'simulated',
          metadata,
        },
      ]);
      onFinish();
      return;
    }

    const intervalMs = settings.typewriterSpeed === 'fast' ? 12 : 25;
    let currIdx = 0;

    // Insert placeholder ghost message
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        sender: 'ghost',
        text: '',
        timestamp: new Date(),
        mode: metadata?.mode as 'local' | 'simulated',
        metadata,
      },
    ]);

    const step = () => {
      currIdx += Math.floor(Math.random() * 2) + 1;
      if (currIdx >= fullText.length) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, text: fullText } : m)),
        );
        onFinish();
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, text: fullText.slice(0, currIdx) } : m)),
        );
        typewriterTimerRef.current = window.setTimeout(step, intervalMs);
      }
    };

    typewriterTimerRef.current = window.setTimeout(step, intervalMs);
  };

  // Submission handler
  const handleExecutePrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    // Clear any active typewriter animation timer
    if (typewriterTimerRef.current) {
      clearTimeout(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: TerminalMessage = {
      id: userMsgId,
      sender: 'user',
      text: promptText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptHistory((prev) => [...prev, promptText]);
    setIsLoading(true);

    const abortCtrl = new AbortController();
    activeAbortRef.current = abortCtrl;

    try {
      const result = await submitInference(
        {
          prompt: promptText,
          max_tokens: settings.maxTokens,
          temperature: settings.temperature,
        },
        abortCtrl.signal,
      );

      soundManager.playSpectralChime();

      const ghostMsgId = `ghost-${Date.now()}`;
      animateTypewriter(
        result.response,
        ghostMsgId,
        {
          inference_ms: result.inference_ms,
          tokens_generated: result.tokens_generated,
          model_id: result.model_id,
          mode: result.mode,
        },
        () => {
          setIsLoading(false);
          activeAbortRef.current = null;
        },
      );
    } catch (err: unknown) {
      setIsLoading(false);
      activeAbortRef.current = null;
      soundManager.playErrorBeep();

      let errorMsg = 'Failed to commune with the GhostTerminal backend.';
      if (err instanceof ApiError) {
        if (err.status === 503) {
          errorMsg = `[MODEL UNAVAILABLE] ${err.message}. The open-weight model is still loading or verifying in memory. Please allow a few moments.`;
        } else if (err.status === 422) {
          errorMsg = `[SYNTAX REJECTED] ${err.message}. Please adhere to terminal prompt length limits.`;
        } else {
          errorMsg = `[ERROR HTTP ${err.status}] ${err.message}`;
        }
      } else if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMsg = '[COMMUNICATION ABORTED] Request exceeded the safety deadline or was cancelled.';
        } else {
          errorMsg = `[NETWORK INTERRUPTION] ${err.message}. Check that the local backend service is running on port 8000.`;
        }
      }

      const errorMsgId = `error-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          sender: 'error',
          text: errorMsg,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
    setMessages([
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: 'Phosphor screen cleared. All mortal keystrokes burned away from the active buffer.',
        timestamp: new Date(),
      },
    ]);
  };

  const handleRetryLast = () => {
    if (promptHistory.length > 0) {
      const lastPrompt = promptHistory[promptHistory.length - 1];
      handleExecutePrompt(lastPrompt);
    }
  };

  return (
    <div
      className={`app-container ${settings.crtEffects ? 'crt-glow-wrapper' : ''} ${settings.reducedMotion ? 'reduced-motion' : ''}`}
    >
      {/* Decorative CRT scanline overlay */}
      {settings.crtEffects && <div className="crt-overlay" aria-hidden="true" />}

      <div className="terminal-frame">
        <Header
          connection={connection}
          health={health}
          modelStatus={modelStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onRefreshHealth={refreshStatus}
          isRefreshing={isRefreshing}
        />

        <main className="terminal-main-layout">
          <Terminal
            messages={messages}
            isLoading={isLoading}
            settings={settings}
            onRetryLast={promptHistory.length > 0 ? handleRetryLast : undefined}
          />

          <Suggestions
            onSelectSuggestion={(sug) => {
              setExternalPrompt(sug);
              // Auto-submit if not busy
              if (!isLoading) {
                handleExecutePrompt(sug);
              }
            }}
            disabled={isLoading || connection === 'unavailable'}
          />

          <InputBar
            onSubmit={handleExecutePrompt}
            onClear={handleClearMessages}
            disabled={isLoading || connection === 'unavailable'}
            history={promptHistory}
            externalPrompt={externalPrompt}
            onClearExternalPrompt={() => setExternalPrompt('')}
          />
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetDefaults={handleResetSettings}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
