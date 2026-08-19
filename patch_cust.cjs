const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Customers.tsx', 'utf-8');

const updateLogic = `  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      let totalPaid = selectedCustomer.totalPaid;
      let totalDue = selectedCustomer.totalDue;
      
      let newHistory = selectedCustomer.paymentHistory ? [...selectedCustomer.paymentHistory] : [];
      
      const payment = Number(paymentAmount);
      if (payment > 0) {
        totalPaid += payment;
        totalDue = Math.max(0, totalDue - payment);
        newHistory.push({
          date: new Date().toISOString(),
          amount: payment
        });
      }

      await api.put(\`/api/customers/\${selectedCustomer.id}\`, {
        totalPaid,
        totalDue,
        paymentReminderDate: reminderDate || null,
        paymentHistory: newHistory
      });

      setIsModalOpen(false);
      fetchCustomers();`;

code = code.replace(/const handleUpdateCustomer = async \(\) => \{[\s\S]*?fetchCustomers\(\);/, updateLogic);

fs.writeFileSync('src/pages/admin/Customers.tsx', code);
