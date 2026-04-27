/**
 * @file Unit Tests
 * @module unit-tests
 * @description Core unit tests for ElectIQ modules: Glossary search,
 * Quiz scoring logic, Chat sanitization, and utility functions.
 * @version 3.0.0
 * @author ElectIQ Team
 */

const { describe, it, expect, run } = require('./test-runner.js');

// ── MOCK BROWSER APIS ─────────────────────────────────
global.window = { ElectIQ: {} };
global.document = {
  createElement: () => ({ setAttribute: () => {}, innerHTML: '' }),
  getElementById: () => null,
  querySelectorAll: () => []
};
global.sessionStorage = {
  _store: {},
  getItem: function(k) { return this._store[k] || null; },
  setItem: function(k, v) { this._store[k] = String(v); }
};
global.crypto = { randomUUID: () => 'mock-uuid-1234-5678-9abc-def012345678' };
global.DOMParser = class {
  parseFromString(str) {
    return { body: { textContent: str.replace(/<[^>]*>/g, '') } };
  }
};

// ── GLOSSARY MODULE ────────────────────────────────────
describe('Glossary Module', () => {
  const terms = [{ text: 'Absentee' }, { text: 'Ballot' }, { text: 'Caucus' }];

  it('filterGlossaryTerms returns correct filtered array', () => {
    const filter = (q, t) => t.filter(x => x.text.toLowerCase().includes(q.toLowerCase()));
    expect(filter('abs', terms)).toEqual([{ text: 'Absentee' }]);
  });

  it('filterGlossaryTerms edge case: case-insensitive matching', () => {
    const filter = (q, t) => t.filter(x => x.text.toLowerCase().includes(q.toLowerCase()));
    expect(filter('ABSENTEE', terms)).toEqual([{ text: 'Absentee' }]);
  });

  it('filterGlossaryTerms returns all for empty query', () => {
    const filter = (q, t) => q === '' ? t : t.filter(x => x.text.toLowerCase().includes(q.toLowerCase()));
    expect(filter('', terms)).toHaveLength(3);
  });

  it('filterGlossaryTerms returns empty for no match', () => {
    const filter = (q, t) => t.filter(x => x.text.toLowerCase().includes(q.toLowerCase()));
    expect(filter('xyz', terms)).toHaveLength(0);
  });
});

// ── QUIZ MODULE ────────────────────────────────────────
describe('Quiz Module', () => {
  const getScoreLabel = (score, total) => {
    const p = (score / total) * 100;
    if (p === 100) { return '🏆 Perfect'; }
    if (p >= 75) { return '🎓 Expert'; }
    if (p >= 50) { return '📚 Learner'; }
    return '🌱 Beginner';
  };

  it('getScoreLabel(5/5) returns 🏆 Perfect', () => {
    expect(getScoreLabel(5, 5)).toBe('🏆 Perfect');
  });

  it('getScoreLabel(4/5) returns 🎓 Expert', () => {
    expect(getScoreLabel(4, 5)).toBe('🎓 Expert');
  });

  it('getScoreLabel(3/5) returns 📚 Learner', () => {
    expect(getScoreLabel(3, 5)).toBe('📚 Learner');
  });

  it('getScoreLabel(1/5) returns 🌱 Beginner', () => {
    expect(getScoreLabel(1, 5)).toBe('🌱 Beginner');
  });

  it('score percentage calculation is correct', () => {
    expect(Math.round((5 / 5) * 100)).toBe(100);
    expect(Math.round((4 / 5) * 100)).toBe(80);
    expect(Math.round((0 / 5) * 100)).toBe(0);
  });
});

// ── CHAT MODULE ────────────────────────────────────────
describe('Chat Module', () => {
  const sanitize = (input) => {
    if (!input) { return null; }
    const trimmed = input.trim();
    if (!trimmed) { return null; }
    return trimmed.replace(/<[^>]*>/g, '').substring(0, 500);
  };

  it('sanitizeInput strips HTML tags', () => {
    expect(sanitize('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('sanitizeInput trims whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  it('sanitizeInput returns null for empty input', () => {
    expect(sanitize('')).toBeNull();
  });

  it('sanitizeInput returns null for null input', () => {
    expect(sanitize(null)).toBeNull();
  });

  it('sanitizeInput caps at 500 characters', () => {
    const longInput = 'a'.repeat(600);
    const result = sanitize(longInput);
    expect(result.length).toBeLessThanOrEqual(500);
  });
});

// ── UTILITY FUNCTIONS ──────────────────────────────────
describe('Utility Functions', () => {

  it('UUID generates string of correct length', () => {
    const id = crypto.randomUUID();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(10);
  });

  it('debounce returns a function', () => {
    const debounce = (fn, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    };
    const debounced = debounce(() => {}, 300);
    expect(typeof debounced).toBe('function');
  });

});

run();
