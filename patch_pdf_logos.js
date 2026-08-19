import fs from 'fs';

const patchFile = (filepath) => {
  let code = fs.readFileSync(filepath, 'utf-8');
  
  // 1. Add import for helper
  if (!code.includes("getLogoBase64")) {
    code = code.replace("import autoTable from 'jspdf-autotable';", "import autoTable from 'jspdf-autotable';\nimport { getLogoBase64 } from '../../utils/pdfHelper';");
  }

  // 2. Make handleDownloadInvoice async
  code = code.replace(/const handleDownloadInvoice = \((.*?)\) => \{/g, 'const handleDownloadInvoice = async ($1) => {');

  // 3. Inject logo logic right after `const doc = new jsPDF();`
  const docCreation = 'const doc = new jsPDF();';
  const logoLogic = `const doc = new jsPDF();
      
      try {
        const logoData = await getLogoBase64();
        doc.addImage(logoData, 'PNG', 14, 10, 16, 16);
      } catch (err) {
        console.warn('Failed to load logo', err);
      }`;
      
  code = code.replace(docCreation, logoLogic);

  // 4. Shift header text
  code = code.replace(/doc\.text\("SHREE HARI", 14, 20\);/g, 'doc.text("SHREE HARI", 35, 20);');
  code = code.replace(/doc\.text\("Premium Pooja Samagri", 14, 26\);/g, 'doc.text("Premium Pooja Samagri", 35, 26);');
  // Specifically for POS which has 28
  code = code.replace(/doc\.text\("Premium Pooja Samagri", 14, 28\);/g, 'doc.text("Premium Pooja Samagri", 35, 28);');

  fs.writeFileSync(filepath, code);
};

const files = [
  'src/pages/admin/Orders.tsx',
  'src/pages/customer/Orders.tsx',
  'src/pages/customer/Checkout.tsx',
  'src/pages/admin/POS.tsx'
];

files.forEach(patchFile);

