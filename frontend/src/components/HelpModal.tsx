import React, { useEffect, useRef } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
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
        aria-labelledby="help-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon" aria-hidden="true">📖</span>
            <h2 id="help-title">GhostTerminal Spectral Manual</h2>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close manual"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section className="manual-section">
            <h3>🎃 About GhostTerminal AI</h3>
            <p>
              Built for <strong>Hacktoberfest 2026 DEV Challenge (Week 4: Ghost in the Machine)</strong>.
              GhostTerminal AI transforms an old computer terminal into a séance chamber haunted by a digital spirit
              residing at memory address <code>0xDEADBEEF</code>.
            </p>
            <p>
              Powered <strong>100% locally</strong> by the <strong>Qwen2.5-0.5B-Instruct</strong> open-weight model running on CPU
              via <code>llama-cpp-python</code> with GGUF Q4_K_M quantization. Zero cloud API calls or paid subscriptions.
            </p>
          </section>

          <section className="manual-section">
            <h3>⌨ Recognized Simulated Commands</h3>
            <div className="table-responsive">
              <table className="manual-table">
                <thead>
                  <tr>
                    <th>Command</th>
                    <th>Mode</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>whoami</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Query the caller identity and the phantom within</td>
                  </tr>
                  <tr>
                    <td><code>help</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Display spectral terminal manual</td>
                  </tr>
                  <tr>
                    <td><code>history</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Inspect the haunted session logbook</td>
                  </tr>
                  <tr>
                    <td><code>git status</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Inspect the state of the underworld repository branch</td>
                  </tr>
                  <tr>
                    <td><code>echo &lt;msg&gt;</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Bounce words across the digital void</td>
                  </tr>
                  <tr>
                    <td><code>ls / dir</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>View phantom directory files</td>
                  </tr>
                  <tr>
                    <td><code>ps / top</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Inspect supernatural background processes</td>
                  </tr>
                  <tr>
                    <td><code>date / time</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Check the ethereal clock</td>
                  </tr>
                  <tr>
                    <td><code>clear / cls</code></td>
                    <td><span className="mode-badge mode-simulated">SIMULATED</span></td>
                    <td>Purge mortal residues from the buffer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="manual-section">
            <h3>👻 Freeform Creative Queries</h3>
            <p>
              Type any creative thought, riddle, or question. Any input not recognized as a simulated command is routed
              to the local <code>Qwen2.5-0.5B-Instruct</code> open-weight model:
            </p>
            <ul className="manual-list">
              <li><em>"What whispers between the CPU gates at midnight?"</em></li>
              <li><em>"Write an eerie haiku about departed code."</em></li>
              <li><em>"Tell me a ghost story about an abandoned server."</em></li>
            </ul>
          </section>

          <section className="manual-section">
            <h3>🛡 Security Notice</h3>
            <p>
              GhostTerminal AI operates purely within a theatrical simulation.
              <strong>No commands execute on your host operating system</strong>, and no files, credentials, or system processes
              are accessed or modified.
            </p>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
