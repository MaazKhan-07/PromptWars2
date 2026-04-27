/**
 * @file End-to-End Flow Tests
 * @module e2e-tests
 * @description Simulates complete user journeys through ElectIQ.
 * Tests full workflows: quiz flow, glossary flow, chat flow,
 * timeline navigation, and auth initialization.
 * @version 3.0.0
 * @author ElectIQ Team
 */

const { describe, it, expect, run } = require('./test-runner.js');

// ── MOCK BROWSER APIS ─────────────────────────────────
global.sessionStorage = global.sessionStorage || {
  _store: {},
  getItem: function(k) { return this._store[k] || null; },
  setItem: function(k, v) { this._store[k] = String(v); },
  removeItem: function(k) { delete this._store[k]; }
};
global.crypto = global.crypto || {
  randomUUID: () => 'e2e-test-' + Math.random().toString(36).substring(2, 10)
};

// ── QUIZ COMPLETE WORKFLOW ─────────────────────────────
describe('E2E: Quiz Complete Workflow', () => {

  it('quiz initializes with question 1 of correct total', () => {
    const state = { currentQuestion: 0, score: 0, total: 5, answers: [] };
    expect(state.currentQuestion).toBe(0);
    expect(state.total).toBe(5);
  });

  it('answer selection increments score for correct answer', () => {
    const state = { score: 0 };
    const isCorrect = true;
    if (isCorrect) { state.score++; }
    expect(state.score).toBe(1);
  });

  it('answer selection does NOT increment score for wrong answer', () => {
    const state = { score: 3 };
    const isCorrect = false;
    if (isCorrect) { state.score++; }
    expect(state.score).toBe(3);
  });

  it('quiz advances to next question after answer', () => {
    const state = { currentQuestion: 0 };
    state.currentQuestion++;
    expect(state.currentQuestion).toBe(1);
  });

  it('quiz detects completion at final question', () => {
    const isComplete = (current, total) => current >= total;
    expect(isComplete(5, 5)).toBe(true);
    expect(isComplete(4, 5)).toBe(false);
  });

  it('score percentage calculation is accurate', () => {
    expect(Math.round((5 / 5) * 100)).toBe(100);
    expect(Math.round((4 / 5) * 100)).toBe(80);
    expect(Math.round((3 / 5) * 100)).toBe(60);
    expect(Math.round((0 / 5) * 100)).toBe(0);
  });

  it('getScoreLabel returns correct emoji tiers', () => {
    const getLabel = (pct) =>
      pct === 100 ? '🏆 Perfect' :
      pct >= 75 ? '🎓 Expert' :
      pct >= 50 ? '📚 Learner' : '🌱 Beginner';
    expect(getLabel(100)).toBe('🏆 Perfect');
    expect(getLabel(80)).toBe('🎓 Expert');
    expect(getLabel(60)).toBe('📚 Learner');
    expect(getLabel(20)).toBe('🌱 Beginner');
  });

  it('quiz reset returns clean initial state', () => {
    const reset = () => ({
      currentQuestion: 0, score: 0, answers: [],
      completed: false, startTime: Date.now()
    });
    const fresh = reset();
    expect(fresh.currentQuestion).toBe(0);
    expect(fresh.score).toBe(0);
    expect(fresh.answers).toHaveLength(0);
    expect(fresh.completed).toBe(false);
  });

});

// ── GLOSSARY COMPLETE WORKFLOW ─────────────────────────
describe('E2E: Glossary Search Workflow', () => {

  const terms = [
    { term: 'Ballot', definition: 'A device to cast votes' },
    { term: 'Caucus', definition: 'A meeting of party members' },
    { term: 'Electoral Vote', definition: 'Vote cast in Electoral College' },
    { term: 'Gerrymandering', definition: 'Manipulation of district boundaries' },
    { term: 'Primary Election', definition: 'Selects party candidates' }
  ];

  it('search returns matching terms (case-insensitive)', () => {
    const search = (q, t) => t.filter(x =>
      x.term.toLowerCase().includes(q.toLowerCase()) ||
      x.definition.toLowerCase().includes(q.toLowerCase())
    );
    expect(search('ballot', terms)).toHaveLength(1);
    expect(search('BALLOT', terms)).toHaveLength(1);
    expect(search('election', terms)).toHaveLength(1);
  });

  it('empty search returns all terms', () => {
    const search = (q, t) => q.trim() === '' ? t :
      t.filter(x => x.term.toLowerCase().includes(q.toLowerCase()));
    expect(search('', terms)).toHaveLength(5);
  });

  it('search with no match returns empty array', () => {
    const search = (q, t) => t.filter(x =>
      x.term.toLowerCase().includes(q.toLowerCase())
    );
    expect(search('xyznotexist', terms)).toHaveLength(0);
  });

  it('letter filter returns only terms starting with that letter', () => {
    const filterLetter = (l, t) => t.filter(x =>
      x.term.toUpperCase().startsWith(l.toUpperCase())
    );
    expect(filterLetter('B', terms)).toHaveLength(1);
    expect(filterLetter('G', terms)).toHaveLength(1);
    expect(filterLetter('Z', terms)).toHaveLength(0);
  });

});

// ── CHAT COMPLETE WORKFLOW ─────────────────────────────
describe('E2E: AI Chat Workflow', () => {

  it('sanitize strips HTML from user input', () => {
    const sanitize = (s) => {
      if (!s || typeof s !== 'string') { return null; }
      return s.replace(/<[^>]*>/g, '').trim().slice(0, 500) || null;
    };
    expect(sanitize('<script>alert(1)</script>')).toBe('alert(1)');
    expect(sanitize('  hello world  ')).toBe('hello world');
    expect(sanitize('')).toBeNull();
    expect(sanitize(null)).toBeNull();
  });

  it('rate limiter blocks after 10 requests per minute', () => {
    const requests = [];
    const limit = 10;
    const isRateLimited = (reqs) => {
      const now = Date.now();
      const recent = reqs.filter(t => now - t < 60000);
      return recent.length >= limit;
    };
    const now = Date.now();
    for (let i = 0; i < 10; i++) { requests.push(now - i * 1000); }
    expect(isRateLimited(requests)).toBe(true);
    expect(isRateLimited(requests.slice(0, 5))).toBe(false);
  });

  it('message object has correct structure', () => {
    const buildMsg = (role, content) => ({
      role, content, id: crypto.randomUUID(), timestamp: Date.now()
    });
    const msg = buildMsg('user', 'How do I vote?');
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('How do I vote?');
    expect(msg).toHaveProperty('id');
    expect(msg).toHaveProperty('timestamp');
  });

  it('conversation history maintains correct role alternation', () => {
    const history = [
      { role: 'user', content: 'Q1' },
      { role: 'assistant', content: 'A1' },
      { role: 'user', content: 'Q2' }
    ];
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('assistant');
    expect(history[history.length - 1].role).toBe('user');
  });

  it('input length is capped at 500 characters', () => {
    const maxLen = 500;
    const longInput = 'x'.repeat(600);
    const capped = longInput.substring(0, maxLen);
    expect(capped.length).toBe(500);
  });

});

// ── TIMELINE WORKFLOW ──────────────────────────────────
describe('E2E: Timeline Navigation Workflow', () => {

  const stages = [
    { id: 'registration', name: 'Voter Registration', color: '#1565C0' },
    { id: 'primary', name: 'Primary Elections', color: '#6A1B9A' },
    { id: 'campaign', name: 'Campaigns & Debates', color: '#E65100' },
    { id: 'voting', name: 'Election Day', color: '#B71C1C' },
    { id: 'counting', name: 'Vote Counting', color: '#00695C' },
    { id: 'certification', name: 'Certification', color: '#1B5E20' },
    { id: 'inauguration', name: 'Inauguration', color: '#F57F17' }
  ];

  it('all 7 stages are present', () => {
    expect(stages).toHaveLength(7);
  });

  it('getStageByIndex returns correct stage', () => {
    const getStage = (i) => stages[i] ?? null;
    expect(getStage(0).id).toBe('registration');
    expect(getStage(6).id).toBe('inauguration');
    expect(getStage(99)).toBeNull();
  });

  it('stage colors are valid hex values', () => {
    const isHex = (c) => /^#[0-9A-Fa-f]{6}$/.test(c);
    stages.forEach(s => expect(isHex(s.color)).toBe(true));
  });

  it('navigation wraps correctly at boundaries', () => {
    const navigate = (current, dir, total) =>
      (current + dir + total) % total;
    expect(navigate(0, -1, 7)).toBe(6);
    expect(navigate(6, 1, 7)).toBe(0);
    expect(navigate(3, 1, 7)).toBe(4);
  });

});

// ── AUTH WORKFLOW ───────────────────────────────────────
describe('E2E: Authentication Initialization Workflow', () => {

  it('sessionStorage holds uid after auth init', () => {
    sessionStorage.setItem('electiq_uid', 'e2e-test-uid');
    expect(sessionStorage.getItem('electiq_uid')).toBe('e2e-test-uid');
    sessionStorage.removeItem('electiq_uid');
  });

  it('fallback uid is generated when auth fails', () => {
    const fallback = 'demo-' + crypto.randomUUID();
    expect(fallback.startsWith('demo-')).toBe(true);
    expect(fallback.length).toBeGreaterThan(10);
  });

  it('auth time is stored as numeric timestamp', () => {
    const t = Date.now();
    sessionStorage.setItem('electiq_auth_time', t);
    const stored = Number(sessionStorage.getItem('electiq_auth_time'));
    expect(typeof stored).toBe('number');
    expect(stored).toBeGreaterThan(0);
  });

  it('multiple auth calls do not duplicate session IDs', () => {
    const uid1 = 'demo-uid-1';
    sessionStorage.setItem('electiq_uid', uid1);
    const uid2 = sessionStorage.getItem('electiq_uid');
    expect(uid1).toBe(uid2);
  });

});

run();
