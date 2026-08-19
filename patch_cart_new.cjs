const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Cart.tsx', 'utf-8');

// Ensure import { api }
if (!code.includes("import { api }")) {
  code = code.replace("import { Link, useNavigate }", "import { api } from '../../api';\nimport { useState, useEffect } from 'react';\nimport { Link, useNavigate }");
}

const originalNav = "const navigate = useNavigate();";
if (code.includes(originalNav) && !code.includes("handleUpdateQuantity")) {
  const newLogic = `const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    api.get('/api/products').then(setProducts);
  }, []);

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (product && newQty > product.stock) {
      alert('Only ' + product.stock + ' units available in stock. Limit reached.');
      updateQuantity(productId, product.stock);
    } else {
      updateQuantity(productId, newQty);
    }
  };`;
  code = code.replace(originalNav, newLogic);
}

// Now replace updateQuantity(item.productId, ...) with handleUpdateQuantity(item.productId, ...) ONLY in the return JSX
// Find the return statement
const returnIndex = code.indexOf("return (");
let beforeReturn = code.slice(0, returnIndex);
let afterReturn = code.slice(returnIndex);

afterReturn = afterReturn.replace(/updateQuantity\(/g, "handleUpdateQuantity(");

fs.writeFileSync('src/pages/customer/Cart.tsx', beforeReturn + afterReturn);
