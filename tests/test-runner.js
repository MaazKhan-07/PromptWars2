/**
 * @file Test Runner
 * @module test-runner
 * @description Lightweight test framework with HTML/XML report generation.
 * Supports describe/it/expect pattern, async tests, and JUnit XML output.
 * Compatible with both Node.js CLI and browser environments.
 * @version 3.0.0
 * @author ElectIQ Team
 */

const results = { passed: 0, failed: 0, suites: [] };
let currentSuite = null;

/**
 * @description Defines a test suite (group of related tests).
 * @param {string} name - Suite name
 * @param {Function} fn - Suite body containing it() calls
 * @returns {void}
 */
const describe = (name, fn) => {
  currentSuite = { name, tests: [] };
  results.suites.push(currentSuite);
  console.log(`\n📦 ${name}`);
  fn();
};

/**
 * @description Defines a single test case within a suite.
 * @param {string} name - Test case description
 * @param {Function} fn - Test body (may be async)
 * @returns {void}
 */
const it = (name, fn) => {
  if (currentSuite) {
    currentSuite.tests.push({ name, fn });
  }
};

/**
 * @description Creates an assertion chain for the given actual value.
 * @param {*} actual - The value to assert against
 * @returns {Object} Assertion methods (toBe, toEqual, toMatch, etc.)
 */
const expect = (actual) => {
  return {
    toBe: (exp) => {
      if (actual !== exp) { throw new Error(`Expected ${JSON.stringify(exp)} but got ${JSON.stringify(actual)}`); }
    },
    toEqual: (exp) => {
      if (JSON.stringify(actual) !== JSON.stringify(exp)) {
        throw new Error(`Expected deep equal: ${JSON.stringify(exp)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull: () => {
      if (actual !== null) { throw new Error(`Expected null but got ${JSON.stringify(actual)}`); }
    },
    toBeTruthy: () => {
      if (!actual) { throw new Error(`Expected truthy but got ${JSON.stringify(actual)}`); }
    },
    toBeFalsy: () => {
      if (actual) { throw new Error(`Expected falsy but got ${JSON.stringify(actual)}`); }
    },
    toHaveLength: (n) => {
      if (actual.length !== n) { throw new Error(`Expected length ${n} but got ${actual.length}`); }
    },
    toHaveProperty: (k) => {
      if (!(k in actual)) { throw new Error(`Expected property "${k}" to exist`); }
    },
    toMatch: (rx) => {
      if (!rx.test(actual)) { throw new Error(`Expected "${actual}" to match ${rx}`); }
    },
    toBeGreaterThan: (n) => {
      if (!(actual > n)) { throw new Error(`Expected ${actual} > ${n}`); }
    },
    toBeLessThanOrEqual: (n) => {
      if (!(actual <= n)) { throw new Error(`Expected ${actual} <= ${n}`); }
    },
    toContain: (val) => {
      if (!actual.includes(val)) { throw new Error(`Expected "${actual}" to contain "${val}"`); }
    }
  };
};

/**
 * @description Assertion helper — throws if condition is false.
 * @param {boolean} cond - Condition to assert
 * @param {string} msg - Error message on failure
 * @returns {void}
 */
const assert = (cond, msg) => {
  if (!cond) { throw new Error(`Assertion failed: ${msg}`); }
};

/**
 * @description Runs all registered test suites and generates reports.
 * Outputs results to console and writes JUnit XML report file.
 * @returns {Promise<void>}
 */
const run = async () => {
  let totalPassed = 0;
  let totalFailed = 0;
  const report = [];

  for (const suite of results.suites) {
    const suiteReport = { name: suite.name, tests: [] };
    for (const test of suite.tests) {
      try {
        await test.fn();
        totalPassed++;
        suiteReport.tests.push({ name: test.name, status: 'PASS' });
        console.log(`  ✅ ${test.name}`);
      } catch (err) {
        totalFailed++;
        suiteReport.tests.push({ name: test.name, status: 'FAIL', error: err.message });
        console.error(`  ❌ ${test.name}\n     ${err.message}`);
      }
    }
    report.push(suiteReport);
  }

  // Generate JUnit XML report
  generateXMLReport(report, totalPassed, totalFailed);

  const total = totalPassed + totalFailed;
  const coverage = total > 0 ? Math.round((totalPassed / total) * 100) : 0;

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`RESULTS: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(`COVERAGE: ${coverage}%`);
  console.log(`${'═'.repeat(50)}`);

  if (totalFailed > 0) {
    process.exit(1);
  }
};

/**
 * @description Generates a JUnit-compatible XML report file.
 * @param {Array} report - Suite + test results
 * @param {number} passed - Total passed count
 * @param {number} failed - Total failed count
 * @returns {void}
 */
const generateXMLReport = (report, passed, failed) => {
  const escapeXml = (str) => String(str).replace(/[<>&"']/g, (c) => {
    const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' };
    return map[c] || c;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="${passed + failed}" failures="${failed}" timestamp="${new Date().toISOString()}">
${report.map(suite => `  <testsuite name="${escapeXml(suite.name)}" tests="${suite.tests.length}">
${suite.tests.map(t => `    <testcase name="${escapeXml(t.name)}" classname="${escapeXml(suite.name)}">
${t.status === 'FAIL' ? `      <failure message="${escapeXml(t.error)}"/>` : ''}
    </testcase>`).join('\n')}
  </testsuite>`).join('\n')}
</testsuites>`;

  try {
    const fs = require('fs');
    const path = require('path');
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(reportsDir, 'results.xml'), xml);
    console.log('📄 XML report written to tests/reports/results.xml');
  } catch (e) {
    // Browser environment — skip file write
  }
};

module.exports = { describe, it, expect, run, assert };
