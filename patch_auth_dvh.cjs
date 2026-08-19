const fs = require('fs');

['src/pages/auth/Login.tsx', 'src/pages/auth/Register.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(
    '<div className="min-h-screen',
    '<div className="min-h-[100dvh]'
  );
  fs.writeFileSync(file, code);
});
