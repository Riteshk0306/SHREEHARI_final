const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Customers.tsx', 'utf-8');

// Add handleClearHistory
code = code.replace(
  "const handleUpdateCustomer = async () => {",
  `const handleClearHistory = async () => {
    if (!selectedCustomer) return;
    if (!window.confirm("Are you sure you want to delete this customer's payment history?")) return;
    try {
      await api.put(\`/api/customers/\${selectedCustomer.id}\`, {
        paymentHistory: []
      });
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Failed to clear history');
    }
  };

  const handleUpdateCustomer = async () => {`
);

// Fix modal layout for scrolling
code = code.replace(
  '<div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">',
  '<div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">'
);

code = code.replace(
  '<div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">',
  '<div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">'
);

code = code.replace(
  '<div className="p-6 space-y-6">',
  '<div className="p-6 space-y-6 overflow-y-auto">'
);

// Replace button and add clear history
const saveChangesRegex = /<button\s*onClick=\{handleUpdateCustomer\}\s*className="w-full bg-slate-900 text-white font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-slate-800 transition-colors"\s*>\s*Save Changes\s*<\/button>/m;

const saveChangesReplacement = `<button
                onClick={handleUpdateCustomer}
                className="w-full bg-slate-900 text-white font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                Save Changes
              </button>
              {selectedCustomer.totalDue === 0 && selectedCustomer.paymentHistory && selectedCustomer.paymentHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="w-full bg-red-50 text-red-600 border border-red-200 font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-red-100 transition-colors mt-2 shrink-0"
                >
                  Delete Payment History
                </button>
              )}`;

code = code.replace(saveChangesRegex, saveChangesReplacement);

// Make the X button slightly larger hit area
code = code.replace(
  '<span className="text-xl leading-none">&times;</span>',
  '<span className="text-3xl leading-none px-2">&times;</span>'
);

fs.writeFileSync('src/pages/admin/Customers.tsx', code);
