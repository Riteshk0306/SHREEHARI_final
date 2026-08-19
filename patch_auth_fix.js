import fs from 'fs';

let loginCode = fs.readFileSync('src/pages/auth/Login.tsx', 'utf-8');
loginCode = loginCode.replace(/import\.meta\.env/g, "(import.meta as any).env");
fs.writeFileSync('src/pages/auth/Login.tsx', loginCode);

let registerCode = fs.readFileSync('src/pages/auth/Register.tsx', 'utf-8');
registerCode = registerCode.replace(/import\.meta\.env/g, "(import.meta as any).env");
fs.writeFileSync('src/pages/auth/Register.tsx', registerCode);
