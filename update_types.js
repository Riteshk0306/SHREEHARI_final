const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf-8');

types += `
export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalPaid: number;
  totalDue: number;
  lastPurchaseDate?: string;
  paymentReminderDate?: string;
}
`;

types = types.replace(
  "totalAmount: number;",
  "totalAmount: number;\n  paidAmount?: number;\n  dueAmount?: number;"
);

fs.writeFileSync('src/types.ts', types);
