const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/ProductDetails.tsx', 'utf-8');

// Add states for image gallery
code = code.replace(
  "const [quantity, setQuantity] = useState(1);",
  "const [quantity, setQuantity] = useState(1);\n  const [activeImage, setActiveImage] = useState(0);"
);

const imgGalleryHtml = `<div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
            <img src={product.images[activeImage] || product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {product.stock <= 0 ? (
              <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xl font-bold tracking-widest z-10">OUT OF STOCK</span>
            ) : (product.stock < 10 ? (
              <span className="absolute top-4 right-4 bg-amber-500 text-white text-[12px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm z-10">ONLY {product.stock} LEFT</span>
            ) : null)}
            {product.discountPercentage > 0 && (

              <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                {Number(product.discountPercentage || 0).toFixed(0)}% OFF
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={\`aspect-square rounded-lg overflow-hidden border-2 transition-all \${activeImage === idx ? 'border-amber-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}\`}
                >
                  <img src={img} alt={\`\${product.name} thumbnail \${idx + 1}\`} className="w-full h-full object-cover bg-slate-100" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}`;

code = code.replace(
  /<div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">[\s\S]*?<\/div>/m,
  imgGalleryHtml
);

fs.writeFileSync('src/pages/customer/ProductDetails.tsx', code);
