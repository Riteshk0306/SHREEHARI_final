const fs = require('fs');

const code = fs.readFileSync('src/pages/customer/Home.tsx', 'utf-8');
const lines = code.split('\n');

const before = lines.slice(0, 66);
const after = lines.slice(110);

const newLines = `            {featured.map(product => (
              <Link key={product.id} to={\`/products/\${product.id}\`} className="group block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-amber-500 transition-all">
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold tracking-wider z-10">
                      OUT OF STOCK
                    </div>
                  )}
                  
                  {product.discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm z-10">
                      {Number(product.discountPercentage || 0).toFixed(0)}% OFF
                    </span>
                  )}
                  
                  {(product.stock > 0 && product.stock < 10) && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm z-10">
                      ONLY {product.stock} LEFT
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm sm:text-base font-bold text-slate-900">₹{product.sellingPrice}</span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">₹{product.mrp}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}`;

const finalCode = [...before, newLines, ...after].join('\n');
fs.writeFileSync('src/pages/customer/Home.tsx', finalCode);
