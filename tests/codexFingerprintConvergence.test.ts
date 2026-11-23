import { describe, expect, test } from 'bun:test';
import { parse as parseYaml } from 'yaml';
import {
  applyCodexFingerprintConvergenceToYaml,
  parseCodexFingerprintConvergence,
  readCodexFingerprintConvergenceFromConfig,
  shouldPersistOnlyTypedCodexFingerprintConvergence,
} from '../src/hooks/useVisualConfig';

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

describe('readCodexFingerprintConvergenceFromConfig and YAML v7/v8 round-trip', () => {
  test('reads v8 oauth.providers.codex path before legacy top-level codex', () => {
    const v8Yaml = [
      'oauth:',
      '  providers:',
      '    codex:',
      '      fingerprint-convergence: session',
      'codex:',
      '  fingerprint-convergence: device',
    ].join('\n');
    const parsed = parseYaml(v8Yaml) as Record<string, unknown>;
    expect(readCodexFingerprintConvergenceFromConfig(parsed)).toBe('session');
  });

  test('reads legacy v7 codex path when v8 path is absent', () => {
    const v7Yaml = 'codex:\n  fingerprint-convergence: full\n';
    const parsed = parseYaml(v7Yaml) as Record<string, unknown>;
    expect(readCodexFingerprintConvergenceFromConfig(parsed)).toBe('full');
  });

  test('writes back to v8 path when document uses v8 oauth.providers layout', () => {
    const v8Yaml = [
      'oauth:',
      '  providers:',
      '    codex:',
      '      fingerprint-convergence: off',
      '',
    ].join('\n');
    const nextYaml = applyCodexFingerprintConvergenceToYaml(v8Yaml, 'session');
    const parsed = parseYaml(nextYaml) as Record<string, unknown>;
    expect(readCodexFingerprintConvergenceFromConfig(parsed)).toBe('session');
    expect(parsed.codex).toBeUndefined();
  });

  test('writes back to v7 path when document uses v7 layout', () => {
    const v7Yaml = 'codex:\n  fingerprint-convergence: off\n';
    const nextYaml = applyCodexFingerprintConvergenceToYaml(v7Yaml, 'device');
    const parsed = parseYaml(nextYaml) as Record<string, unknown>;
    expect(readCodexFingerprintConvergenceFromConfig(parsed)).toBe('device');
    expect(parsed.oauth).toBeUndefined();
  });

  test('deduplicates persistence when only codexFingerprintConvergence is dirty', () => {
    expect(
      shouldPersistOnlyTypedCodexFingerprintConvergence(new Set(['codexFingerprintConvergence']))
    ).toBe(true);
    expect(
      shouldPersistOnlyTypedCodexFingerprintConvergence(
        new Set(['codexFingerprintConvergence', 'debug'])
      )
    ).toBe(false);
    expect(shouldPersistOnlyTypedCodexFingerprintConvergence(new Set(['debug']))).toBe(false);
  });
});
