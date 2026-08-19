const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  '<div className="min-h-screen bg-slate-50',
  '<div className="min-h-[100dvh] bg-slate-50'
);
fs.writeFileSync('src/App.tsx', code);
