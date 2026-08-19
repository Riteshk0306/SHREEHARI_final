const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Customers.tsx', 'utf-8');

// Add state
code = code.replace(
  "const [paymentAmount, setPaymentAmount] = useState('');",
  "const [paymentAmount, setPaymentAmount] = useState('');\n  const [paymentDate, setPaymentDate] = useState('');"
);

// Update handleOpenModal
code = code.replace(
  "setReminderDate(c.paymentReminderDate || '');",
  "setReminderDate(c.paymentReminderDate || '');\n    // Format current date for datetime-local (YYYY-MM-DDThh:mm)\n    const now = new Date();\n    const offset = now.getTimezoneOffset() * 60000;\n    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);\n    setPaymentDate(localISOTime);"
);

// Update handleUpdateCustomer date creation
code = code.replace(
  "date: new Date().toISOString(),",
  "date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),"
);

// Add input field for payment date/time
const dateInputHtml = `                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Date & Time</label>
                  <input
                    type="datetime-local"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                    disabled={selectedCustomer.totalDue === 0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Set Payment Reminder Date</label>`;

code = code.replace(
  /<\/div>\s*<div>\s*<label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Set Payment Reminder Date<\/label>/m,
  dateInputHtml
);

fs.writeFileSync('src/pages/admin/Customers.tsx', code);
