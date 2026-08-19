const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf-8');

const hint = `<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-800">
          <p className="font-bold mb-1 uppercase tracking-wider text-blue-900">Demo Login Details</p>
          <div className="flex flex-col gap-1">
            <p>Admin: <span className="font-bold">admin@shreehari.com</span> / <span className="font-bold">admin123</span></p>
            <p>Customer: <span className="font-bold">customer@shreehari.com</span> / <span className="font-bold">customer123</span></p>
          </div>
        </div>`;

code = code.replace(
  '<div className="relative mb-6">',
  hint + '\n        <div className="relative mb-6">'
);

fs.writeFileSync('src/pages/auth/Login.tsx', code);
