const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(
  "paymentReminderDate?: string;",
  "paymentReminderDate?: string;\n  paymentHistory?: { date: string; amount: number; }[];"
);

fs.writeFileSync('src/types.ts', code);
