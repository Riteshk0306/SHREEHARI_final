import fs from 'fs';

// Patch Cart.tsx
let cartCode = fs.readFileSync('src/pages/customer/Cart.tsx', 'utf-8');
cartCode = cartCode.replace(/const gst = subtotal \* 0\.18; \/\/ 18% GST example/g, '');
cartCode = cartCode.replace(/const total = subtotal \+ gst;/g, 'const total = subtotal;');
cartCode = cartCode.replace(/<div className="flex justify-between">\s*<span>GST \(18%\)<\/span>\s*<span className="font-bold text-slate-900">₹\{gst\.toFixed\(2\)\}<\/span>\s*<\/div>/g, '');
fs.writeFileSync('src/pages/customer/Cart.tsx', cartCode);

// Patch Checkout.tsx
let checkoutCode = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');
checkoutCode = checkoutCode.replace(/const gst = subtotal \* 0\.18;/g, '');
checkoutCode = checkoutCode.replace(/const total = subtotal \+ gst;/g, 'const total = subtotal;');
fs.writeFileSync('src/pages/customer/Checkout.tsx', checkoutCode);

