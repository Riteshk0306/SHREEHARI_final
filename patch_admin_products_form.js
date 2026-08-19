import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/Products.tsx', 'utf-8');

code = code.replace(/className="col-span-2"/g, 'className="md:col-span-2"');

fs.writeFileSync('src/pages/admin/Products.tsx', code);
