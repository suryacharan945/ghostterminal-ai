import React from 'react';

interface SuggestionsProps {
  onSelectSuggestion: (prompt: string) => void;
  disabled: boolean;
}

const SUGGESTED_COMMANDS = [
  { label: 'whoami', desc: 'Query spectral identity', type: 'cmd' },
  { label: 'help', desc: 'List terminal incantations', type: 'cmd' },
  { label: 'history', desc: 'View phantom session log', type: 'cmd' },
  { label: 'git status', desc: 'Inspect underworld branch', type: 'cmd' },
  { label: 'echo hello mortal', desc: 'Whisper across void', type: 'cmd' },
  { label: 'Tell me a ghost story', desc: 'Generate spooky folklore', type: 'ai' },
  { label: 'Write a haunted haiku', desc: 'Generate eerie poetry', type: 'ai' },
];

export const Suggestions: React.FC<SuggestionsProps> = ({
  onSelectSuggestion,
  disabled,
}) => {
  return (
    <div className="suggestions-container" role="region" aria-label="Suggested terminal commands">
      <div className="suggestions-label">
        <span className="sparkle" aria-hidden="true">✨</span>
        <span>Suggested Incantations:</span>
      </div>
      <div className="suggestions-list">
        {SUGGESTED_COMMANDS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`suggestion-pill ${item.type === 'cmd' ? 'pill-cmd' : 'pill-ai'}`}
            onClick={() => onSelectSuggestion(item.label)}
            disabled={disabled}
            title={item.desc}
            aria-label={`${item.label} - ${item.desc}`}
          >
            <span className="pill-prefix">{item.type === 'cmd' ? '$' : '👻'}</span>
            <span className="pill-text">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
