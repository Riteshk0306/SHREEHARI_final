const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf-8');

code = code.replace(
  "if (email === 'admin@shreehari.com') {",
  "if (email === 'admin@shreehari.com' && password === 'admin123') {"
);

code = code.replace(
  "if (email === 'customer@shreehari.com') {",
  "if (email === 'customer@shreehari.com' && password === 'customer123') {"
);

fs.writeFileSync('src/pages/auth/Login.tsx', code);
