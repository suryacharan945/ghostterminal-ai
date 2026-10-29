import React from 'react';
import { HealthResponse, ModelStatusResponse, ConnectionStatus } from '../types';

interface HeaderProps {
  connection: ConnectionStatus;
  health: HealthResponse | null;
  modelStatus: ModelStatusResponse | null;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onRefreshHealth: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  connection,
  health,
  modelStatus,
  onOpenSettings,
  onOpenHelp,
  onRefreshHealth,
  isRefreshing,
}) => {
  const getStatusBadge = () => {
    if (connection === 'loading' || isRefreshing) {
      return (
        <span className="status-pill status-loading" aria-label="Status: Probing backend">
          <span className="status-dot pulsing" />
          Probing...
        </span>
      );
    }
    if (connection === 'unavailable' || connection === 'error') {
      return (
        <span className="status-pill status-error" aria-label="Status: Backend offline">
          <span className="status-dot red" />
          Offline
        </span>
      );
    }
    if (health?.model_status === 'loading') {
      return (
        <span className="status-pill status-loading" aria-label="Status: Model loading">
          <span className="status-dot pulsing" />
          Model Loading...
        </span>
      );
    }
    if (health?.model_status === 'ready') {
      return (
        <span className="status-pill status-ready" aria-label="Status: Local AI model ready">
          <span className="status-dot green" />
          Local AI Ready
        </span>
      );
    }
    if (health?.model_status === 'failed') {
      return (
        <span className="status-pill status-error" aria-label="Status: Model failed">
          <span className="status-dot red" />
          Model Error
        </span>
      );
    }
    return (
      <span className="status-pill status-warning" aria-label="Status: Standby">
        <span className="status-dot yellow" />
        Standby
      </span>
    );
  };

  return (
    <header className="terminal-topbar">
      <div className="topbar-left">
        <div className="terminal-buttons" aria-hidden="true">
          <span className="btn-dot red" />
          <span className="btn-dot yellow" />
          <span className="btn-dot green" />
        </div>
        <div className="branding">
          <h1 className="terminal-title">
            <span className="ghost-icon" aria-hidden="true">👻</span>
            GHOSTTERMINAL AI
          </h1>
          <span className="terminal-subtitle">Ghost in the Machine</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="model-indicator" title={modelStatus ? `Model: ${modelStatus.model_id} (${modelStatus.device})` : 'Backend status'}>
          {getStatusBadge()}
          {health?.model_status === 'ready' && (
            <span className="model-chip" aria-label="Active Model">
              Qwen2.5-0.5B (CPU)
            </span>
          )}
        </div>

        <nav className="header-actions" aria-label="Terminal controls">
          <button
            type="button"
            className="action-btn icon-btn"
            onClick={onRefreshHealth}
            disabled={isRefreshing}
            title="Refresh backend and model connection"
            aria-label="Refresh connection"
          >
            ⟳
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={onOpenSettings}
            title="Open terminal settings"
            aria-label="Open settings"
          >
            ⚙ Settings
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={onOpenHelp}
            title="Open spectral manual and command guide"
            aria-label="Open help guide"
          >
            ? Help
          </button>
        </nav>
      </div>
    </header>
  );
};
