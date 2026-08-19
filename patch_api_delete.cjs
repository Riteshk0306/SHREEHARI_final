const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf-8');

const supabaseDelete = `
      if (url.startsWith('/api/products/')) {
        const id = url.split('/').pop();
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      }
      if (url.startsWith('/api/orders/')) {
        const id = url.split('/').pop();
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      }
`;
code = code.replace(
  "if (url.startsWith('/api/products/')) {\n        const id = url.split('/').pop();\n        const { error } = await supabase.from('products').delete().eq('id', id);\n        if (error) throw error;\n        return { success: true };\n      }",
  supabaseDelete
);

const mockDelete = `
      if (url.startsWith('/api/products/')) {
        const id = url.split('/').pop();
        mockProducts = mockProducts.filter(p => p.id !== id);
        return { success: true };
      }
      if (url.startsWith('/api/orders/')) {
        const id = url.split('/').pop();
        mockOrders = mockOrders.filter(o => o.id !== id);
        return { success: true };
      }
`;
code = code.replace(
  "if (url.startsWith('/api/products/')) {\n        const id = url.split('/').pop();\n        mockProducts = mockProducts.filter(p => p.id !== id);\n        return { success: true };\n      }",
  mockDelete
);

fs.writeFileSync('src/api.ts', code);
