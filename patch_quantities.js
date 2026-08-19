import fs from 'fs';

function replaceInFile(filepath, search, replace) {
  let content = fs.readFileSync(filepath, 'utf-8');
  content = content.replace(search, replace);
  fs.writeFileSync(filepath, content);
}

replaceInFile(
  'src/pages/admin/POS.tsx',
  '<span className="w-4 text-center font-bold text-slate-900">{item.quantity}</span>',
  `<input 
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) updateQuantity(item.productId, 1); }}
                        className="w-12 text-center font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                      />`
);

replaceInFile(
  'src/pages/customer/Cart.tsx',
  '<span className="font-bold w-4 text-center text-slate-900">{item.quantity}</span>',
  `<input 
                      type="number" 
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                      onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) updateQuantity(item.productId, 1); }}
                      className="font-bold w-12 text-center text-slate-900 bg-transparent border-none focus:ring-0 p-0" 
                    />`
);

replaceInFile(
  'src/pages/customer/Checkout.tsx',
  '<span className="font-bold text-xs w-4 text-center text-slate-900">{item.quantity}</span>',
  `<input 
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                      onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) updateQuantity(item.productId, 1); }}
                      className="font-bold text-xs w-12 text-center text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                    />`
);

