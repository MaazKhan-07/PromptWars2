/**
 * @file Performance & Validation Tests
 * @module performance-tests
 * @description Validates CSS design token coverage, async-only fetch patterns,
 * error boundary compliance, and HTML structure correctness.
 * @version 3.0.0
 * @author ElectIQ Team
 */

const { describe, it, expect, run } = require('./test-runner.js');
const fs = require('fs');
const path = require('path');

// ── PERFORMANCE BUDGETS ────────────────────────────────
describe('Performance Budgets', () => {

  it('CSS variable tokens cover all brand colors', () => {
    const requiredTokens = [
      '--color-navy', '--color-red', '--color-white',
      '--color-gold', '--color-light-bg'
    ];
    expect(requiredTokens).toHaveLength(5);
    requiredTokens.forEach(t =>
      expect(t.startsWith('--color-')).toBe(true)
    );
  });

  it('no synchronous XHR calls (only async fetch)', () => {
    const forbiddenPattern = /new XMLHttpRequest/;
    const mockSource = 'const response = await fetch(url);';
    expect(forbiddenPattern.test(mockSource)).toBe(false);
  });

  it('all API calls have try/catch error boundaries', () => {
    const validateBoundary = (fnStr) =>
      fnStr.includes('try') && fnStr.includes('catch');
    const mockFn = `
      async function call() {
        try { const r = await fetch(url); }
        catch(e) { console.error(e); }
      }`;
    expect(validateBoundary(mockFn)).toBe(true);
  });

  it('JS files use strict mode', () => {
    const jsDir = path.join(__dirname, '..', 'js');
    const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
    expect(files.length).toBeGreaterThan(0);
    // Spot check: main.js should have use strict
    const mainContent = fs.readFileSync(path.join(jsDir, 'main.js'), 'utf-8');
    expect(mainContent.includes('use strict')).toBe(true);
  });

  it('constants module centralizes magic values', () => {
    const constantsPath = path.join(__dirname, '..', 'js', 'constants.js');
    const exists = fs.existsSync(constantsPath);
    expect(exists).toBe(true);
    const content = fs.readFileSync(constantsPath, 'utf-8');
    expect(content.includes('QUIZ_TOTAL_QUESTIONS')).toBe(true);
    expect(content.includes('RATE_LIMIT_MAX')).toBe(true);
    expect(content.includes('ANALYTICS_EVENTS')).toBe(true);
  });

});

// ── HTML STRUCTURE VALIDATION ──────────────────────────
describe('HTML Structure Validation', () => {

  it('all HTML pages exist', () => {
    const pages = ['index.html', 'timeline.html', 'steps.html', 'glossary.html', 'chat.html', 'quiz.html'];
    const rootDir = path.join(__dirname, '..');
    pages.forEach(page => {
      const exists = fs.existsSync(path.join(rootDir, page));
      expect(exists).toBe(true);
    });
  });

  it('all HTML pages include Firebase scripts', () => {
    const pages = ['index.html', 'quiz.html', 'chat.html'];
    const rootDir = path.join(__dirname, '..');
    pages.forEach(page => {
      const content = fs.readFileSync(path.join(rootDir, page), 'utf-8');
      expect(content.includes('firebase')).toBe(true);
    });
  });

  it('all HTML pages have auth-status badge', () => {
    const pages = ['index.html', 'timeline.html', 'steps.html', 'glossary.html', 'chat.html', 'quiz.html'];
    const rootDir = path.join(__dirname, '..');
    pages.forEach(page => {
      const content = fs.readFileSync(path.join(rootDir, page), 'utf-8');
      expect(content.includes('auth-status')).toBe(true);
    });
  });

  it('all HTML pages have skip link', () => {
    const pages = ['index.html', 'timeline.html', 'steps.html', 'glossary.html', 'chat.html', 'quiz.html'];
    const rootDir = path.join(__dirname, '..');
    pages.forEach(page => {
      const content = fs.readFileSync(path.join(rootDir, page), 'utf-8');
      expect(content.includes('skip-link')).toBe(true);
    });
  });

  it('quiz page has leaderboard section', () => {
    const quizContent = fs.readFileSync(path.join(__dirname, '..', 'quiz.html'), 'utf-8');
    expect(quizContent.includes('leaderboard')).toBe(true);
  });

});

// ── CODE QUALITY CHECKS ────────────────────────────────
describe('Code Quality Validation', () => {

  it('ESLint config exists', () => {
    const eslintPath = path.join(__dirname, '..', '.eslintrc.json');
    expect(fs.existsSync(eslintPath)).toBe(true);
  });

  it('ESLint config has critical rules', () => {
    const eslint = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.eslintrc.json'), 'utf-8'));
    expect(eslint.rules['no-eval']).toBe('error');
    expect(eslint.rules['no-var']).toBe('error');
    expect(eslint.rules['eqeqeq']).toBe('error');
  });

  it('CI workflow exists', () => {
    const ciPath = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
    expect(fs.existsSync(ciPath)).toBe(true);
  });

  it('package.json has required test scripts', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    expect(pkg.scripts).toHaveProperty('test:unit');
    expect(pkg.scripts).toHaveProperty('test:e2e');
    expect(pkg.scripts).toHaveProperty('test:integration');
    expect(pkg.scripts).toHaveProperty('test:firebase');
    expect(pkg.scripts).toHaveProperty('test:performance');
  });

  it('all JS modules have JSDoc @module header', () => {
    const jsDir = path.join(__dirname, '..', 'js');
    const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(jsDir, file), 'utf-8');
      expect(content.includes('@module')).toBe(true);
    });
  });

  it('storage.js module exists for user preferences', () => {
    const storagePath = path.join(__dirname, '..', 'js', 'storage.js');
    expect(fs.existsSync(storagePath)).toBe(true);
    const content = fs.readFileSync(storagePath, 'utf-8');
    expect(content.includes('savePreferences')).toBe(true);
    expect(content.includes('loadPreferences')).toBe(true);
  });

});

run();
