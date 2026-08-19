const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

code = code.replace(
  "onClick={() => p.stock > 0 && addToCart(p)}",
  "onClick={() => p.stock > 0 ? addToCart(p) : alert('This product is not available, select another product')}"
);

// We need to also ensure we don't have multiple clicks that we missed.
fs.writeFileSync('src/pages/admin/POS.tsx', code);
