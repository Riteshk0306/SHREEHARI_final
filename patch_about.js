import fs from 'fs';
let code = `import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Award, Flame } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight">About Shree Hari</h1>
        <p className="text-lg text-slate-600 font-medium leading-relaxed">
          At Shree Hari, we believe that your spiritual journey deserves the purest and most authentic materials. 
          Our mission is to bring premium quality, authentic pooja samagri directly to your doorstep.
        </p>
      </div>

      {/* Hero Section for Our Brand */}
      <div className="bg-amber-50 rounded-3xl p-8 lg:p-12 mb-16 border border-amber-200 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 uppercase tracking-tight">
              Shree Hari Kapoor <span className="text-amber-600">— Our Signature Brand</span>
            </h2>
            <p className="text-lg text-slate-700 font-medium mb-6 leading-relaxed">
              Proudly manufactured in-house, Shree Hari Kapoor is the hallmark of purity. 
              Crafted with traditional methods and rigorous quality control, our camphor ensures a clean, 
              residue-free flame that elevates your daily spiritual practices.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-amber-100">
                  <Flame className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-wide uppercase mb-1">Kapoor Tablets</h3>
                  <p className="text-slate-600 font-medium">Perfectly pressed tablets for your daily aarti. They burn brightly, evenly, and leave no dark soot behind, filling your home with a divine fragrance.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-amber-100">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-wide uppercase mb-1">Bhimseni Kapoor</h3>
                  <p className="text-slate-600 font-medium">The purest, unrefined form of camphor. Renowned for its therapeutic properties and authentic, natural aroma. It evaporates entirely without leaving a trace.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white transform translate-y-4">
              <img src="https://images.unsplash.com/photo-1608933224419-f0eebc8eb675?w=500&q=80" alt="Kapoor Tablets" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white transform -translate-y-4">
              <img src="https://images.unsplash.com/photo-1620577533816-ce2bb622ea13?w=500&q=80" alt="Bhimseni Kapoor" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative">
          <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80" alt="Spiritual Items" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-amber-500/10"></div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 uppercase tracking-wider">Our Heritage</h2>
          <p className="text-slate-600 font-medium mb-6 leading-relaxed">
            Founded with a vision to preserve and promote the sanctity of traditional rituals, Shree Hari curates every item with deep respect for our cultural roots. From sacred threads to rare herbs, every product passes through stringent purity checks.
          </p>
          <p className="text-slate-600 font-medium leading-relaxed">
            Located in the heart of Chhatrapati Sambhaji Nagar, we have served thousands of households, ensuring their daily prayers and special ceremonies are performed with the finest samagri available.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm hover:border-amber-400 transition-colors">
          <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-2">100% Authentic</h3>
          <p className="text-slate-600 font-medium text-sm">Sourced directly from traditional artisans and pure natural origins.</p>
        </div>
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm hover:border-amber-400 transition-colors">
          <Truck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-2">Careful Delivery</h3>
          <p className="text-slate-600 font-medium text-sm">Packed with utmost respect and hygiene to maintain sanctity.</p>
        </div>
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm hover:border-amber-400 transition-colors">
          <RotateCcw className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-2">Customer First</h3>
          <p className="text-slate-600 font-medium text-sm">Dedicated support and easy returns if you are not fully satisfied.</p>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/customer/About.tsx', code);
