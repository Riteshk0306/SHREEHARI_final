import fs from 'fs';

function replaceInFile(filepath, search, replace) {
  let content = fs.readFileSync(filepath, 'utf-8');
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filepath, content);
  } else {
    console.log("NOT FOUND in " + filepath + ":\n" + search);
  }
}

// Admin Orders
replaceInFile('src/pages/admin/Orders.tsx', 
  "import { FileText, Search, MapPin } from 'lucide-react';", 
  "import { FileText, Search, MapPin, Eye, Download } from 'lucide-react';"
);
replaceInFile('src/pages/admin/Orders.tsx',
  "const handleDownloadInvoice = async (order: Order) => {",
  "const handleDownloadInvoice = async (order: Order, action: 'view' | 'download' = 'download') => {"
);
replaceInFile('src/pages/admin/Orders.tsx',
  `doc.save(fileName);`,
  `if (action === 'view') {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(fileName);
      }`
);
replaceInFile('src/pages/admin/Orders.tsx',
  `<button onClick={() => handleDownloadInvoice(order)} className="mt-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors border border-slate-200">
                <FileText className="w-4 h-4" /> Download Invoice
              </button>`,
  `<div className="mt-auto flex gap-2">
                <button onClick={() => handleDownloadInvoice(order, 'view')} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200" title="View Invoice">
                  <Eye className="w-5 h-5" />
                </button>
                <button onClick={() => handleDownloadInvoice(order, 'download')} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200" title="Download Invoice">
                  <Download className="w-5 h-5" />
                </button>
              </div>`
);

// Customer Orders
replaceInFile('src/pages/customer/Orders.tsx', 
  "import { FileText, Package, Mail, MapPin, Phone } from 'lucide-react';", 
  "import { FileText, Package, Mail, MapPin, Phone, Eye, Download } from 'lucide-react';"
);
replaceInFile('src/pages/customer/Orders.tsx',
  "const handleDownloadInvoice = async (order: Order) => {",
  "const handleDownloadInvoice = async (order: Order, action: 'view' | 'download' = 'download') => {"
);
replaceInFile('src/pages/customer/Orders.tsx',
  `doc.save(fileName);`,
  `if (action === 'view') {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(fileName);
      }`
);
replaceInFile('src/pages/customer/Orders.tsx',
  `<button 
                    onClick={() => handleDownloadInvoice(order)}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm uppercase tracking-wider"
                  >
                    <FileText className="w-4 h-4" /> Invoice
                  </button>`,
  `<div className="flex gap-2 w-full">
                    <button 
                      onClick={() => handleDownloadInvoice(order, 'view')}
                      className="flex-1 flex items-center justify-center bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                      title="View Invoice"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDownloadInvoice(order, 'download')}
                      className="flex-1 flex items-center justify-center bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                      title="Download Invoice"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>`
);

// Customer Checkout
replaceInFile('src/pages/customer/Checkout.tsx', 
  "import { FileText, CheckCircle2, Plus, Minus, PlusCircle } from 'lucide-react';", 
  "import { FileText, CheckCircle2, Plus, Minus, PlusCircle, Eye, Download } from 'lucide-react';"
);
replaceInFile('src/pages/customer/Checkout.tsx',
  "const handleDownloadInvoice = async (order: any) => {",
  "const handleDownloadInvoice = async (order: any, action: 'view' | 'download' = 'download') => {"
);
replaceInFile('src/pages/customer/Checkout.tsx',
  `doc.save(fileName);`,
  `if (action === 'view') {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(fileName);
      }`
);
replaceInFile('src/pages/customer/Checkout.tsx',
  `<button onClick={() => handleDownloadInvoice(placedOrder)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 transition-colors">
            <FileText className="w-5 h-5" /> Download Invoice
          </button>`,
  `<div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => handleDownloadInvoice(placedOrder, 'view')} className="flex-1 sm:flex-none px-6 flex items-center justify-center bg-slate-900 text-white py-3.5 rounded-lg hover:bg-slate-800 transition-colors" title="View Invoice">
              <Eye className="w-5 h-5" />
            </button>
            <button onClick={() => handleDownloadInvoice(placedOrder, 'download')} className="flex-1 sm:flex-none px-6 flex items-center justify-center bg-slate-900 text-white py-3.5 rounded-lg hover:bg-slate-800 transition-colors" title="Download Invoice">
              <Download className="w-5 h-5" />
            </button>
          </div>`
);

