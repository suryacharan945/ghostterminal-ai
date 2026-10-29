import React, { useEffect, useRef } from 'react';
import { TerminalSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TerminalSettings;
  onUpdateSettings: (newSettings: Partial<TerminalSettings>) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon" aria-hidden="true">⚙</span>
            <h2 id="settings-title">Terminal Configurations</h2>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Visual Effects */}
          <section className="setting-group">
            <h3 className="setting-group-title">Visual Atmosphere</h3>

            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={settings.crtEffects}
                onChange={(e) => onUpdateSettings({ crtEffects: e.target.checked })}
              />
              <span className="toggle-label">
                <strong>CRT Scanlines & Phosphor Glow</strong>
                <span className="toggle-sub">Enables subtle vintage monitor scanlines and chromatic bloom</span>
              </span>
            </label>

            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
              />
              <span className="toggle-label">
                <strong>Reduced Motion</strong>
                <span className="toggle-sub">Disables screen flickers, smooth scrolling, and pulsating animations</span>
              </span>
            </label>
          </section>

          {/* Typing & Audio */}
          <section className="setting-group">
            <h3 className="setting-group-title">Playback & Audio</h3>

            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={settings.typewriterEffect}
                onChange={(e) => onUpdateSettings({ typewriterEffect: e.target.checked })}
              />
              <span className="toggle-label">
                <strong>Typewriter Response Playback</strong>
                <span className="toggle-sub">Simulates retro teletype terminal output character-by-character</span>
              </span>
            </label>

            {settings.typewriterEffect && (
              <div className="setting-sub-control">
                <span className="control-label">Typewriter Cadence:</span>
                <div className="radio-pill-group">
                  {(['fast', 'normal', 'instant'] as const).map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      className={`radio-pill ${settings.typewriterSpeed === speed ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ typewriterSpeed: speed })}
                    >
                      {speed.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
              />
              <span className="toggle-label">
                <strong>Mechanical Sound Effects</strong>
                <span className="toggle-sub">Synthesized Web Audio key clicks and spectral harmonic chimes</span>
              </span>
            </label>
          </section>

          {/* AI Model Parameters */}
          <section className="setting-group">
            <h3 className="setting-group-title">Local Model Parameters</h3>

            <div className="slider-control">
              <div className="slider-header">
                <label htmlFor="temp-slider"><strong>Creativity (Temperature):</strong></label>
                <span className="slider-val">{settings.temperature.toFixed(2)}</span>
              </div>
              <input
                id="temp-slider"
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              />
              <span className="slider-hint">Lower = focused & cryptic; Higher = poetic & supernatural</span>
            </div>

            <div className="slider-control">
              <div className="slider-header">
                <label htmlFor="tokens-slider"><strong>Maximum Generation Length:</strong></label>
                <span className="slider-val">{settings.maxTokens} tokens</span>
              </div>
              <input
                id="tokens-slider"
                type="range"
                min="32"
                max="384"
                step="32"
                value={settings.maxTokens}
                onChange={(e) => onUpdateSettings({ maxTokens: parseInt(e.target.value, 10) })}
              />
              <span className="slider-hint">Limits length of creative responses (CPU generation budget)</span>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onResetDefaults}>
            Reset Defaults
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
