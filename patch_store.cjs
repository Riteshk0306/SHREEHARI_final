const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf-8');

const newAddToCart = `      addToCart: (product, quantity) =>
        set((state) => {
          const existing = state.cart.find((item) => item.productId === product.id);
          const currentQty = existing ? existing.quantity : 0;
          const requestedQty = currentQty + quantity;
          
          let finalQty = requestedQty;
          if (requestedQty > product.stock) {
            alert('Only ' + product.stock + ' units available in stock. Limit reached.');
            finalQty = product.stock;
          }

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: finalQty }
                  : item
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                productId: product.id,
                name: product.name,
                sellingPrice: product.sellingPrice,
                purchasePrice: product.purchasePrice,
                quantity: finalQty,
                image: product.images?.[0] || '',
              },
            ],
          };
        }),`;

code = code.replace(/addToCart: \(product, quantity\) =>[\s\S]*?updateQuantity:/, newAddToCart + '\n      updateQuantity:');

fs.writeFileSync('src/store.ts', code);
