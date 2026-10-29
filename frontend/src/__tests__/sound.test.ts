import { describe, it, expect, beforeEach, vi } from 'vitest';
import { soundManager } from '../sound';

describe('Sound Effects Synthesizer', () => {
  beforeEach(() => {
    soundManager.setEnabled(true);
  });

  it('toggles sound on and off', () => {
    soundManager.setEnabled(false);
    expect(soundManager.isEnabled()).toBe(false);
    soundManager.setEnabled(true);
    expect(soundManager.isEnabled()).toBe(true);
  });

  it('safely handles missing AudioContext in test environments without throwing', () => {
    expect(() => soundManager.playKeyClick()).not.toThrow();
    expect(() => soundManager.playSpookyChime()).not.toThrow();
    expect(() => soundManager.playCommandBeep()).not.toThrow();
    expect(() => soundManager.playErrorBeep()).not.toThrow();
  });

  it('does not attempt playback when disabled', () => {
    soundManager.setEnabled(false);
    expect(() => soundManager.playKeyClick()).not.toThrow();
    expect(() => soundManager.playSpookyChime()).not.toThrow();
  });

  it('runs safely with mocked AudioContext', () => {
    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockContext = {
      state: 'running',
      currentTime: 0,
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {},
    };

    // Mock window AudioContext
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn().mockImplementation(() => mockContext);

    soundManager.setEnabled(true);
    expect(() => soundManager.playKeyClick()).not.toThrow();
    expect(() => soundManager.playCommandBeep()).not.toThrow();
    expect(() => soundManager.playSpookyChime()).not.toThrow();
    expect(() => soundManager.playErrorBeep()).not.toThrow();
  });
});
