const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');
code = code.replace(
  "import { FileText, Search, MapPin, Eye, Download } , Trash2 } from 'lucide-react';",
  "import { FileText, Search, MapPin, Eye, Download, Trash2 } from 'lucide-react';"
);
fs.writeFileSync('src/pages/admin/Orders.tsx', code);
