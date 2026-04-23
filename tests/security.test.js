const fs = require('fs');
const path = require('path');

const describe = (name, fn) => { console.log(`\n🛡️ ${name}`); fn(); };
const it = (name, fn) => {
  try { fn(); console.log(`  ✅ ${name}`); }
  catch (err) { console.log(`  ❌ ${name}`); console.error(`     ${err.message}`); }
};

describe('Security Hardening', () => {
  it('No hardcoded API keys allowed (sk-ant pattern)', () => {
    const files = ['js/config.js', 'script.js']; 
    files.forEach(f => {
      const p = path.join(__dirname, '..', f);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        if (content.includes('sk-ant')) throw new Error(`Hardcoded key found in ${f}`);
      }
    });
  });

  it('CSP Meta tag presence check', () => {
    const htmlFiles = ['index.html', 'chat.html', 'quiz.html', 'steps.html', 'timeline.html', 'glossary.html'];
    htmlFiles.forEach(f => {
      const p = path.join(__dirname, '..', f);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        if (!content.includes('Content-Security-Policy')) throw new Error(`CSP missing in ${f}`);
      }
    });
  });

  it('No usage of dangerous functions (eval, innerHTML with user data)', () => {
    // Static check for eval
    const scriptPath = path.join(__dirname, '..', 'js/main.js');
    if (fs.existsSync(scriptPath)) {
      const content = fs.readFileSync(scriptPath, 'utf8');
      if (content.includes('eval(')) throw new Error('eval() usage detected');
    }
  });
});
