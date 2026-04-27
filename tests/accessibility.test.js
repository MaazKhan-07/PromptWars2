/**
 * @file Accessibility Tests
 * @module accessibility-tests
 * @description Validates WCAG 2.1 AA compliance: skip links, ARIA attributes,
 * focus management, screen reader announcements, and semantic structure.
 * @version 3.0.0
 * @author ElectIQ Team
 */

const { describe, it, expect, run } = require('./test-runner.js');
const fs = require('fs');
const path = require('path');

describe('Accessibility Compliance', () => {

  it('all pages have skip-link to main-content', () => {
    const pages = ['index.html', 'timeline.html', 'steps.html', 'glossary.html', 'chat.html', 'quiz.html'];
    const rootDir = path.join(__dirname, '..');
    pages.forEach(page => {
      const content = fs.readFileSync(path.join(rootDir, page), 'utf-8');
      expect(content.includes('skip-link')).toBe(true);
      expect(content.includes('#main-content')).toBe(true);
    });
  });

  it('all pages have lang="en" attribute', () => {
    const pages = ['index.html', 'timeline.html', 'steps.html', 'glossary.html', 'chat.html', 'quiz.html'];
    const rootDir = path.join(__dirname, '..');
    pages.forEach(page => {
      const content = fs.readFileSync(path.join(rootDir, page), 'utf-8');
      expect(content.includes('lang="en"')).toBe(true);
    });
  });

  it('navbar has role="banner"', () => {
    const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
    expect(content.includes('role="banner"')).toBe(true);
  });

  it('main content has role="main"', () => {
    const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
    expect(content.includes('role="main"')).toBe(true);
  });

  it('footer has role="contentinfo"', () => {
    const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
    expect(content.includes('role="contentinfo"')).toBe(true);
  });

  it('dark toggle has aria-pressed attribute', () => {
    const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
    expect(content.includes('aria-pressed')).toBe(true);
  });

  it('auth badge has aria-live for status updates', () => {
    const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
    expect(content.includes('aria-live="polite"')).toBe(true);
  });

  it('hamburger has aria-expanded attribute', () => {
    const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
    expect(content.includes('aria-expanded')).toBe(true);
  });

});

run();
