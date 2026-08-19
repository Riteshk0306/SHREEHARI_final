import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/Products.tsx', 'utf-8');

const imageInputSearch = `<div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Image URL</label>
                  <input required type="url" value={editingProduct.images?.[0]} onChange={e => updateField('images', [e.target.value])} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>`;

const imageInputReplace = `<div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Product Image (Upload)</label>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/jpg" 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateField('images', [reader.result as string]);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" 
                  />
                  {editingProduct.images?.[0] && (
                    <div className="mt-2 relative inline-block">
                      <img src={editingProduct.images[0]} alt="Preview" className="h-16 w-16 object-cover rounded border border-slate-200" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>`;

code = code.replace(imageInputSearch, imageInputReplace);
fs.writeFileSync('src/pages/admin/Products.tsx', code);
