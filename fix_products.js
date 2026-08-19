import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/Products.tsx', 'utf-8');
code = code.replace(
  "  const fetchProducts\n  \n  useEffect(() => {",
  "  const fetchProducts = () => api.get('/api/products').then(setProducts);\n  \n  useEffect(() => {"
);
fs.writeFileSync('src/pages/admin/Products.tsx', code);
