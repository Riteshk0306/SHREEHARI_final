import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

code = code.replace(
  `onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}`,
  `onClick={() => {
                        if (item.quantity <= 1) {
                          removeFromCart(item.productId);
                        } else {
                          updateQuantity(item.productId, item.quantity - 1);
                        }
                      }}`
);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
