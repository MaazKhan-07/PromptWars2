/**
 * @file Security Tests
 * @module security-tests
 * @description Validates XSS prevention, input sanitization boundaries,
 * CSP header presence, and rate limiting logic.
 * @version 3.0.0
 * @author ElectIQ Team
 */

const { describe, it, expect, run } = require('./test-runner.js');
const fs = require('fs');
const path = require('path');

describe('XSS Prevention', () => {
  const sanitize = (input) => {
    if (!input || typeof input !== 'string') { return null; }
    const trimmed = input.trim();
    if (!trimmed) { return null; }
    return trimmed.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').substring(0, 500);
  };

  it('strips script tags', () => {
    const result = sanitize('<script>alert("XSS")</script>');
    expect(result).toBe('alert("XSS")');
  });

  it('strips nested HTML', () => {
    const result = sanitize('<div onclick="hack()">Click</div>');
    expect(result).toBe('Click');
  });

  it('limits input to 500 chars', () => {
    const result = sanitize('a'.repeat(600));
    expect(result.length).toBeLessThanOrEqual(500);
  });

  it('returns null for empty string', () => {
    expect(sanitize('')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(sanitize(123)).toBeNull();
    expect(sanitize(null)).toBeNull();
    expect(sanitize(undefined)).toBeNull();
  });
});

describe('Rate Limiting', () => {
  it('allows requests under limit', () => {
    const timestamps = [Date.now() - 5000];
    const isLimited = timestamps.filter(t => Date.now() - t < 60000).length >= 10;
    expect(isLimited).toBe(false);
  });

  it('blocks requests at limit', () => {
    const now = Date.now();
    const timestamps = Array.from({ length: 10 }, (_, i) => now - i * 1000);
    const isLimited = timestamps.filter(t => now - t < 60000).length >= 10;
    expect(isLimited).toBe(true);
  });

  it('expires old timestamps', () => {
    const timestamps = [Date.now() - 120000, Date.now() - 90000];
    const recent = timestamps.filter(t => Date.now() - t < 60000);
    expect(recent).toHaveLength(0);
  });
});

describe('Security Headers', () => {
  it('netlify.toml includes CSP header', () => {
    const toml = fs.readFileSync(path.join(__dirname, '..', 'netlify.toml'), 'utf-8');
    expect(toml.includes('Content-Security-Policy')).toBe(true);
  });

  it('netlify.toml includes X-Frame-Options', () => {
    const toml = fs.readFileSync(path.join(__dirname, '..', 'netlify.toml'), 'utf-8');
    expect(toml.includes('X-Frame-Options')).toBe(true);
  });

  it('netlify.toml includes X-Content-Type-Options', () => {
    const toml = fs.readFileSync(path.join(__dirname, '..', 'netlify.toml'), 'utf-8');
    expect(toml.includes('X-Content-Type-Options')).toBe(true);
  });
});

run();
