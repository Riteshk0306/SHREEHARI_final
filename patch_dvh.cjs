const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  '<div className="flex h-screen w-full',
  '<div className="flex h-[100dvh] w-full'
);
fs.writeFileSync('src/App.tsx', code);
