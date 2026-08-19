const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replacePatterns = [
    {
      regex: /product\.discountPercentage\.toFixed/g,
      replacement: "Number(product.discountPercentage || 0).toFixed"
    },
    {
      regex: /item\.sellingPrice\.toFixed/g,
      replacement: "Number(item.sellingPrice || 0).toFixed"
    },
    {
      regex: /\(item\.sellingPrice \* item\.quantity\)\.toFixed/g,
      replacement: "(Number(item.sellingPrice || 0) * Number(item.quantity || 0)).toFixed"
    },
    {
      regex: /order\.totalAmount\.toFixed/g,
      replacement: "Number(order.totalAmount || 0).toFixed"
    },
    {
      regex: /order\.profit\.toFixed/g,
      replacement: "Number(order.profit || 0).toFixed"
    },
    {
      regex: /\(order\.profit \|\| 0\)\.toFixed/g,
      replacement: "Number(order.profit || 0).toFixed"
    },
    {
      regex: /subtotal\.toFixed/g,
      replacement: "Number(subtotal || 0).toFixed"
    },
    {
      regex: /total\.toFixed/g,
      replacement: "Number(total || 0).toFixed"
    },
    {
      regex: /\(subtotal \* 0\.18\)\.toFixed/g,
      replacement: "(Number(subtotal || 0) * 0.18).toFixed"
    },
    {
      regex: /bill\.totalAmount\.toFixed/g,
      replacement: "Number(bill.totalAmount || 0).toFixed"
    },
    {
      regex: /gst\.toFixed/g,
      replacement: "Number(gst || 0).toFixed"
    },
    {
      regex: /totalSales\.toFixed/g,
      replacement: "Number(totalSales || 0).toFixed"
    },
    {
      regex: /totalProfit\.toFixed/g,
      replacement: "Number(totalProfit || 0).toFixed"
    },
    {
      regex: /p\.revenue\.toFixed/g,
      replacement: "Number(p.revenue || 0).toFixed"
    },
    {
      regex: /o\.totalAmount\.toFixed/g,
      replacement: "Number(o.totalAmount || 0).toFixed"
    }
  ];

  let newContent = content;
  replacePatterns.forEach(({regex, replacement}) => {
    newContent = newContent.replace(regex, replacement);
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
