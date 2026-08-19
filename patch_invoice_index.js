import fs from 'fs';

function replaceInFile(filepath, search, replace) {
  let content = fs.readFileSync(filepath, 'utf-8');
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filepath, content);
  } else {
    console.log("NOT FOUND in " + filepath + ":\n" + search);
  }
}

const searchAutotable = `const tableColumn = ["Item", "Quantity", "Price", "Total"];
      const tableRows: any[] = [];
      
      order.items.forEach((item: any) => {
        tableRows.push([
          item.name,
          item.quantity,
          \`Rs \${item.sellingPrice.toFixed(2)}\`,
          \`Rs \${(item.sellingPrice * item.quantity).toFixed(2)}\`
        ]);
      });`;

const replaceAutotable = `const tableColumn = ["#", "Item", "Quantity", "Price", "Total"];
      const tableRows: any[] = [];
      
      order.items.forEach((item: any, index: number) => {
        tableRows.push([
          index + 1,
          item.name,
          item.quantity,
          \`Rs \${item.sellingPrice.toFixed(2)}\`,
          \`Rs \${(item.sellingPrice * item.quantity).toFixed(2)}\`
        ]);
      });`;

replaceInFile('src/pages/admin/Orders.tsx', searchAutotable, replaceAutotable);
replaceInFile('src/pages/customer/Orders.tsx', searchAutotable, replaceAutotable);
replaceInFile('src/pages/customer/Checkout.tsx', searchAutotable, replaceAutotable);
