/**
 * @file Master Test Runner
 * @module run-tests
 * @description Orchestrates execution of all ElectIQ test suites.
 * Runs unit, accessibility, security, Firebase integration, E2E,
 * and performance tests sequentially. Exits with non-zero status on failure.
 * @version 3.0.0
 * @author ElectIQ Team
 */
const { execSync } = require('child_process');
const path = require('path');

const testFiles = [
  'unit.test.js',
  'accessibility.test.js',
  'security.test.js',
  'firebase.integration.test.js',
  'e2e.test.js',
  'performance.test.js'
];

console.log('🚀 Starting ElectIQ Full Test Suite v3.0.0...');
console.log('═'.repeat(50));
console.log(`📋 ${testFiles.length} test files to run`);
console.log('═'.repeat(50));

let allPassed = true;
let passedFiles = 0;
let failedFiles = 0;

testFiles.forEach(file => {
  try {
    console.log(`\n🏃 Running ${file}...`);
    execSync(`node "${path.join(__dirname, file)}"`, { stdio: 'inherit' });
    passedFiles++;
  } catch (err) {
    allPassed = false;
    failedFiles++;
  }
});

console.log('\n' + '═'.repeat(50));
console.log(`📊 Suite Summary: ${passedFiles}/${testFiles.length} files passed, ${failedFiles} failed`);

if (allPassed) {
  console.log('✨ ALL TESTS PASSED! ElectIQ v3.0.0 — 95%+ Target Coverage');
  process.exit(0);
} else {
  console.log('⚠️  SOME TESTS FAILED. Review logs above.');
  process.exit(1);
}
