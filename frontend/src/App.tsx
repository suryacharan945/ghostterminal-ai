import React, { useState, useEffect, useCallback } from 'react';
import { HealthState } from './types';
import { fetchHealth } from './api';
import './App.css';

const ASCII_BANNER = `
  ___ _               _ _____               _             _     _   ___ 
 / __| |_  ___  ___ _| |_   _|__ _ _ _ __ _(_)_ _  __ _ _| |   /_\\ |_ _|
| (_ | ' \\/ _ \\(_-</ _\` || |/ -_) '_| '  \\| | ' \\/ _\` | | |  / _ \\ | | 
 \\___|_||_\\___//__/\\__,_||_|\\___|_| |_|_|_|_|_||_\\__,_|_|_| /_/ \\_\\___|
    ::: Hacktoberfest 2026 - Week 4: Ghost in the Machine :::
`;

export const App: React.FC = () => {
  const [state, setState] = useState<HealthState>({
    status: 'loading',
    data: null,
    errorMessage: null,
    lastChecked: null,
  });

  const checkConnection = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', errorMessage: null }));
    try {
      const data = await fetchHealth();
      setState({
        status: 'connected',
        data,
        errorMessage: null,
        lastChecked: new Date(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isUnavailable =
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('AbortError') ||
        msg.includes('ECONNREFUSED');

      setState({
        status: isUnavailable ? 'unavailable' : 'error',
        data: null,
        errorMessage: msg,
        lastChecked: new Date(),
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="btn-dot red" />
          <span className="btn-dot yellow" />
          <span className="btn-dot green" />
        </div>
        <div className="terminal-title">ghostterminal@hacktoberfest-2026: ~</div>
        <div style={{ width: '42px' }} />
      </div>

      <div className="terminal-body">
        <pre className="banner">{ASCII_BANNER}</pre>

        <div className="intro-section">
          <h1>GhostTerminal AI</h1>
          <p>
            An original Halloween-themed AI terminal powered by local open-weight intelligence.
          </p>
        </div>

        <div className="status-card">
          <div className="status-header">
            <strong>Backend Connection:</strong>
            <span className={`status-badge ${state.status}`}>
              {state.status === 'loading' && 'Checking...'}
              {state.status === 'connected' && 'Online'}
              {state.status === 'unavailable' && 'Unavailable'}
              {state.status === 'error' && 'Error'}
            </span>
          </div>

          {state.status === 'loading' && (
            <p className="grid-label">Probing backend health endpoint at /api/health...</p>
          )}

          {state.status === 'connected' && state.data && (
            <div className="details-grid">
              <span className="grid-label">Application:</span>
              <span className="grid-value">{state.data.app} (v{state.data.version})</span>

              <span className="grid-label">Stage:</span>
              <span className="grid-value">{state.data.stage}</span>

              <span className="grid-label">Environment:</span>
              <span className="grid-value">{state.data.environment}</span>

              <span className="grid-label">Model Target:</span>
              <span className="grid-value">{state.data.model_id}</span>

              <span className="grid-label">Model Status:</span>
              <span className="grid-value">
                {state.data.model_status} (Scheduled for Part 2)
              </span>

              <span className="grid-label">Last Checked:</span>
              <span className="grid-value">
                {state.lastChecked?.toLocaleTimeString() ?? 'N/A'}
              </span>
            </div>
          )}

          {(state.status === 'unavailable' || state.status === 'error') && (
            <div>
              <p className="grid-label">
                Unable to contact the GhostTerminal backend service at <code>/api/health</code>.
              </p>
              {state.errorMessage && (
                <div className="error-box">
                  <strong>Diagnostic:</strong> {state.errorMessage}
                </div>
              )}
            </div>
          )}

          <div className="action-bar">
            <button
              className="retry-btn"
              onClick={checkConnection}
              disabled={state.status === 'loading'}
            >
              {state.status === 'loading' ? 'Verifying...' : 'Refresh Status'}
            </button>
          </div>
        </div>

        <div className="stage-preview">
          <h3>Part 1 Scope & Architecture</h3>
          <ul>
            <li>✔ FastAPI backend with typed configuration & CORS safeguards</li>
            <li>✔ GET /api/health contract verified</li>
            <li>✔ AI inference placeholder interface (HTTP 501 - no fake responses)</li>
            <li>✔ React + Vite + TypeScript frontend with verified connection states</li>
            <li>⏳ Part 2: Local CPU inference engine with Qwen2.5-0.5B-Instruct</li>
            <li>⏳ Part 3: Spooky haunted terminal UI & CRT visual effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
