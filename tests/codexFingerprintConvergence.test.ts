import { describe, expect, test } from 'bun:test';
import { parseCodexFingerprintConvergence } from '../src/hooks/useVisualConfig';

describe('parseCodexFingerprintConvergence', () => {
  test('maps recognized values', () => {
    expect(parseCodexFingerprintConvergence('')).toBe('off');
    expect(parseCodexFingerprintConvergence('off')).toBe('off');
    expect(parseCodexFingerprintConvergence('none')).toBe('off');
    expect(parseCodexFingerprintConvergence(' Device ')).toBe('device');
    expect(parseCodexFingerprintConvergence('session')).toBe('session');
    expect(parseCodexFingerprintConvergence('FULL')).toBe('full');
  });

  test('unrecognized values fall back to off', () => {
    expect(parseCodexFingerprintConvergence('sessions')).toBe('off');
    expect(parseCodexFingerprintConvergence('bogus')).toBe('off');
  });
});
