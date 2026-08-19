const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Cart.tsx', 'utf-8');

// Add products state to fetch stock limits
const importApi = `import { api } from '../../api';\nimport { useState, useEffect } from 'react';`;
if (!code.includes("import { api }")) {
  code = code.replace("import { Link, useNavigate } from 'react-router-dom';", importApi + "\nimport { Link, useNavigate } from 'react-router-dom';");
}

const fetchLogic = `  const [products, setProducts] = useState<any[]>([]);
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

code = code.replace(
  "const navigate = useNavigate();",
  "const navigate = useNavigate();\n" + fetchLogic
);

code = code.replace(/updateQuantity\(/g, "handleUpdateQuantity(");
// wait, handleUpdateQuantity in the destruction `const { cart, updateQuantity` will conflict!
// replace `const { cart, updateQuantity, removeFromCart } = useStore();` 
// with `const { cart, updateQuantity, removeFromCart } = useStore();`
// so updateQuantity in destruction is fine, but in onClick we need to use handleUpdateQuantity!
