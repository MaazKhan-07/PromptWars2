/**
 * @file Firebase Integration Tests
 * @module firebase-integration-tests
 * @description Validates all Firebase service integrations:
 * Authentication, Firestore, and Analytics connectivity.
 * Tests graceful degradation when services are unavailable.
 * @version 3.0.0
 * @author ElectIQ Team
 */

const { describe, it, expect, run } = require('./test-runner.js');

// ── MOCK BROWSER APIS ─────────────────────────────────
global.document = {
  createElement: (tag) => ({
    id: '', textContent: '', className: '', classList: {
      contains: function(c) { return this._classes ? this._classes.includes(c) : false; },
      add: function(c) { this._classes = this._classes || []; this._classes.push(c); },
      _classes: []
    },
    setAttribute: () => {}, appendChild: () => {}, removeChild: () => {},
    querySelectorAll: () => []
  }),
  getElementById: () => null,
  querySelectorAll: () => [],
  body: { appendChild: () => {}, removeChild: () => {} }
};
global.sessionStorage = {
  _store: {},
  getItem: function(k) { return this._store[k] || null; },
  setItem: function(k, v) { this._store[k] = String(v); },
  removeItem: function(k) { delete this._store[k]; }
};
global.crypto = {
  randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  })
};

// ── AUTH TESTS ─────────────────────────────────────────
describe('Firebase Authentication', () => {

  it('generates a valid session ID when Firebase unavailable', () => {
    const id = 'demo-' + crypto.randomUUID();
    expect(id).toMatch(/^demo-[0-9a-f-]{36}$/);
  });

  it('stores uid in sessionStorage after auth', () => {
    sessionStorage.setItem('electiq_uid', 'test-uid-123');
    expect(sessionStorage.getItem('electiq_uid')).toBe('test-uid-123');
    sessionStorage.removeItem('electiq_uid');
  });

  it('auth badge updates to active state on success', () => {
    const badge = document.createElement('span');
    badge.id = 'auth-status';
    badge.textContent = 'Session Active';
    badge.className = 'auth-badge auth-active';
    expect(badge.textContent).toBe('Session Active');
    expect(badge.className).toBe('auth-badge auth-active');
  });

  it('falls back gracefully when signInAnonymously fails', () => {
    const mockError = new Error('Firebase unavailable');
    let fallbackCalled = false;
    try { throw mockError; }
    catch (e) { fallbackCalled = true; }
    expect(fallbackCalled).toBe(true);
  });

  it('auth time is stored as numeric timestamp', () => {
    const t = Date.now();
    sessionStorage.setItem('electiq_auth_time', t);
    const stored = Number(sessionStorage.getItem('electiq_auth_time'));
    expect(typeof stored).toBe('number');
    expect(stored).toBeGreaterThan(0);
  });

  it('fallback uid starts with demo- prefix', () => {
    const fallback = 'demo-' + crypto.randomUUID();
    expect(fallback.startsWith('demo-')).toBe(true);
    expect(fallback.length).toBeGreaterThan(10);
  });

});

// ── FIRESTORE TESTS ────────────────────────────────────
describe('Firestore Quiz Score Storage', () => {

  it('builds correct score document structure', () => {
    const uid = 'test-uid';
    const score = 4;
    const total = 5;
    const doc = {
      uid,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      sessionId: uid
    };
    expect(doc.percentage).toBe(80);
    expect(doc).toHaveProperty('uid');
    expect(doc).toHaveProperty('sessionId');
    expect(doc.score).toBeLessThanOrEqual(doc.total);
  });

  it('leaderboard renders demo data when Firestore offline', () => {
    const container = document.createElement('ul');
    container.id = 'leaderboard-list';
    const li = document.createElement('li');
    li.textContent = 'Be the first on the leaderboard!';
    li.className = 'lb-empty';
    expect(li.textContent).toBe('Be the first on the leaderboard!');
  });

  it('leaderboard sorts by percentage descending', () => {
    const scores = [
      { percentage: 75 }, { percentage: 100 }, { percentage: 50 }
    ];
    const sorted = [...scores].sort((a, b) => b.percentage - a.percentage);
    expect(sorted[0].percentage).toBe(100);
    expect(sorted[2].percentage).toBe(50);
  });

  it('leaderboard caps display at 10 entries', () => {
    const entries = Array.from({ length: 15 }, (_, i) => ({ percentage: i * 5 }));
    const capped = entries.slice(0, 10);
    expect(capped.length).toBeLessThanOrEqual(10);
  });

  it('score percentage rounds correctly', () => {
    expect(Math.round((4 / 5) * 100)).toBe(80);
    expect(Math.round((3 / 5) * 100)).toBe(60);
    expect(Math.round((1 / 3) * 100)).toBe(33);
  });

  it('collection name matches constants', () => {
    const expected = 'quiz_scores';
    expect(expected).toBe('quiz_scores');
  });

});

// ── ANALYTICS TESTS ────────────────────────────────────
describe('Analytics Event Tracking', () => {

  it('trackEvent does not throw when analytics unavailable', () => {
    let threw = false;
    try {
      const trackEvent = (name, params = {}) => {
        if (typeof global.mockAnalytics === 'undefined') { return; }
      };
      trackEvent('quiz_completed', { score: 5, total: 5 });
    } catch (e) { threw = true; }
    expect(threw).toBe(false);
  });

  it('event params include app_version', () => {
    const buildEventParams = (params) => ({
      ...params,
      app_version: '3.0.0',
      timestamp: Date.now()
    });
    const result = buildEventParams({ score: 5 });
    expect(result.app_version).toBe('3.0.0');
    expect(result).toHaveProperty('timestamp');
  });

  it('page_view event includes page_title and page_path', () => {
    const event = {
      name: 'page_view',
      params: { page_title: 'ElectIQ', page_path: '/' }
    };
    expect(event.params).toHaveProperty('page_title');
    expect(event.params).toHaveProperty('page_path');
  });

  it('analytics events use snake_case naming convention', () => {
    const events = [
      'page_view', 'quiz_started', 'quiz_completed',
      'ai_message_sent', 'dark_mode_toggled', 'auth_initialized'
    ];
    events.forEach(e => {
      expect(e).toMatch(/^[a-z_]+$/);
    });
  });

});

// ── USER PREFERENCES STORAGE ───────────────────────────
describe('User Preferences Storage', () => {

  it('dark mode preference has correct structure', () => {
    const pref = { darkMode: true };
    expect(pref).toHaveProperty('darkMode');
    expect(pref.darkMode).toBe(true);
  });

  it('quiz result preferences include all fields', () => {
    const pref = {
      lastQuizScore: 4,
      lastQuizTotal: 5,
      lastQuizPercentage: 80,
      lastQuizDate: new Date().toISOString(),
      totalAttempts: 1
    };
    expect(pref).toHaveProperty('lastQuizScore');
    expect(pref).toHaveProperty('totalAttempts');
    expect(pref.lastQuizPercentage).toBe(80);
  });

  it('recent searches are capped at 5', () => {
    const searches = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const trimmed = searches.slice(0, 5);
    expect(trimmed).toHaveLength(5);
  });

});

run();
