import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { soundManager } from '../sound';

interface InputBarProps {
  onSubmit: (prompt: string) => void;
  onClear: () => void;
  disabled: boolean;
  history: string[];
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

const MAX_CHARS = 2000;

export const InputBar: React.FC<InputBarProps> = ({
  onSubmit,
  onClear,
  disabled,
  history,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [input, setInput] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external prompt when suggested pill clicked
  useEffect(() => {
    if (externalPrompt !== undefined && externalPrompt !== '') {
      setInput(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [externalPrompt, onClearExternalPrompt]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    soundManager.playKeyClick();

    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Command history navigation
    if (e.key === 'ArrowUp' && (!input.includes('\n') || textareaRef.current?.selectionStart === 0)) {
      if (history.length === 0) return;
      e.preventDefault();
      const nextIdx = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInput(history[history.length - 1 - nextIdx] || '');
      return;
    }

    if (e.key === 'ArrowDown' && (!input.includes('\n') || textareaRef.current?.selectionEnd === input.length)) {
      if (historyIndex > 0) {
        e.preventDefault();
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        e.preventDefault();
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setInput('');
    setHistoryIndex(-1);
  };

  const charCount = input.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="terminal-input-bar">
      <div className="input-row">
        <label htmlFor="terminal-prompt-input" className="prompt-label" aria-hidden="true">
          <span className="user-segment">ghost@terminal</span>
          <span className="colon-segment">:</span>
          <span className="path-segment">~</span>
          <span className="symbol-segment">$</span>
        </label>

        <textarea
          id="terminal-prompt-input"
          ref={textareaRef}
          className="prompt-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Waiting for the machine to respond...' : 'Type an incantation or query (Enter to send, Shift+Enter for new line)...'}
          rows={1}
          maxLength={MAX_CHARS + 50}
          aria-label="Terminal prompt input"
          aria-disabled={disabled}
        />

        <div className="input-actions">
          <button
            type="button"
            className="btn-send"
            onClick={handleSend}
            disabled={disabled || !input.trim() || isOverLimit}
            aria-label="Execute command"
          >
            <span className="btn-icon" aria-hidden="true">▶</span>
            <span>Send</span>
          </button>
          <button
            type="button"
            className="btn-clear"
            onClick={onClear}
            disabled={disabled}
            title="Clear terminal buffer"
            aria-label="Clear terminal messages"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="input-footer">
        <span className="hint-text">
          Use <kbd>↑</kbd> <kbd>↓</kbd> for command history • <kbd>Enter</kbd> to send
        </span>
        <span className={`char-counter ${isOverLimit ? 'over-limit' : ''}`} aria-live="polite">
          {charCount} / {MAX_CHARS}
        </span>
      </div>
    </div>
  );
};
