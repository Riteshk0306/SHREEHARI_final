import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

const regex = /const handleDownloadInvoice = \(order: any\) => \{[\s\S]*?win\.document\.close\(\);\n  \};/;
const match = code.match(regex);

if (match) {
  code = code.replace(match[0], ''); // remove from below
  
  // place it above the early returns
  code = code.replace(
    "if (!user) {",
    match[0] + "\n\n  if (!user) {"
  );
  
  fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
} else {
  console.log("Could not find handleDownloadInvoice");
}
