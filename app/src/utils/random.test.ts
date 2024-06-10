import { describe, expect, it } from 'vitest';

import { generateSecureAlphanumericString } from './random';

describe('generateSecureAlphanumericString', () => {
  it('should generate a string of the correct length', () => {
    const length = 10;
    const result = generateSecureAlphanumericString(length);
    expect(result).toHaveLength(length);
  });

  it('should only contain alphanumeric characters', () => {
    const length = 20;
    const result = generateSecureAlphanumericString(length);
    expect(result).toMatch(/^[\dA-Za-z]+$/);
  });

  it('should handle zero length', () => {
    const result = generateSecureAlphanumericString(0);
    expect(result).toBe('');
  });

  it('should throw an error for negative lengths', () => {
    expect(() => generateSecureAlphanumericString(-1)).toThrow();
  });

  it('each character should be from the defined character set', () => {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 100;
    const result = generateSecureAlphanumericString(length);
    for (const char of result) {
      expect(charset).toContain(char);
    }
  });

  it('randomness test - check for non-repeating patterns in multiple runs', () => {
    const results = new Set();
    const sampleSize = 100;
    for (let i = 0; i < sampleSize; i++) {
      results.add(generateSecureAlphanumericString(10));
    }
    // Expecting unique results assumes a very low probability of collisions.
    expect(results.size).toBeCloseTo(sampleSize, 0.9 * sampleSize);
  });

  it('generates very long strings without errors', () => {
    const length = 1000;
    const result = generateSecureAlphanumericString(length);
    expect(result).toHaveLength(length);
    expect(result).toMatch(/^[\dA-Za-z]+$/);
  });
});
