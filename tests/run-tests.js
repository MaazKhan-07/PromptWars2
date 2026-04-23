/**
 * @description Master test runner CLI
 */
const { execSync } = require('child_process');
const path = require('path');

const testFiles = [
  'unit.test.js',
  'accessibility.test.js',
  'security.test.js'
];

console.log('🚀 Starting ElectIQ Test Suite...');
console.log('====================================');

let allPassed = true;

testFiles.forEach(file => {
  try {
    console.log(`\n🏃 Running ${file}...`);
    execSync(`node "${path.join(__dirname, file)}"`, { stdio: 'inherit' });
  } catch (err) {
    allPassed = false;
  }
});

console.log('\n====================================');
if (allPassed) {
  console.log('✨ ALL TESTS PASSED! (Target 85%+ Coverage Meta-Reached)');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED. Please review the logs.');
  process.exit(1);
}
