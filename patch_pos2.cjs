const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

const newHandlers = `  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      const reqQty = existing ? existing.quantity + 1 : 1;
      let finalQty = reqQty;
      if (reqQty > p.stock) {
        alert('Only ' + p.stock + ' units available in stock. Limit reached.');
        finalQty = p.stock;
      }
      if (existing) {
        return prev.map(item => item.productId === p.id ? { ...item, quantity: finalQty } : item);
      }
      return [...prev, { productId: p.id, name: p.name, sellingPrice: p.sellingPrice, purchasePrice: p.purchasePrice, quantity: finalQty, image: p.images?.[0] }];
    });
  };

  const updateQuantity = (id: string, q: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    if (q > p.stock) {
      alert('Only ' + p.stock + ' units available in stock. Limit reached.');
      q = p.stock;
    }
    if (q <= 0) setCart(prev => prev.filter(item => item.productId !== id));
    else setCart(prev => prev.map(item => item.productId === id ? { ...item, quantity: q } : item));
  };`;

code = code.replace(/const addToCart = \(p: Product\) => \{[\s\S]*?updateQuantity = \(id: string, q: number\) => \{[\s\S]*?\n  \};/, newHandlers);

// Add Low Stock badge rendering
const outOfStockBadge = `{p.stock <= 0 && <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold tracking-wider">OUT OF STOCK</span>}`;
const updatedBadges = `{p.stock <= 0 ? <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold tracking-wider">OUT OF STOCK</span> : (p.stock < 10 ? <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">ONLY {p.stock} LEFT</span> : null)}`;

code = code.replace(outOfStockBadge, updatedBadges);

fs.writeFileSync('src/pages/admin/POS.tsx', code);
