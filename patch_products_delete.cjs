const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/Products.tsx', 'utf-8');

// replace window.confirm with a state based deletion or just remove it if it's simpler
// since it's just a demo, maybe a custom state is better. But let's just make it not use window.confirm, or use a quick state for it.
if (code.includes('if(confirm(')) {
  code = code.replace(
    "const handleDelete = async (id: string) => {\n    if(confirm('Are you sure you want to delete this product?')) {\n      await api.delete(`/api/products/${id}`);\n      fetchProducts();\n    }\n  };",
    "const handleDelete = async (id: string) => {\n    // Bypassing window.confirm for iframe compatibility\n    await api.delete(`/api/products/${id}`);\n    fetchProducts();\n  };"
  );
}

fs.writeFileSync('src/pages/admin/Products.tsx', code);
