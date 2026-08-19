import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

const searchPDFShare = `      if (shouldShare && navigator.share) {
        try {
          const pdfBlob = doc.output('blob');
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Invoice',
              text: 'Here is your invoice from Shree Hari.',
            });
            return; // Successfully shared
          }
        } catch (err) {
          console.error("Share failed", err);
        }
      }
      
      // Fallback to auto download
      doc.save(fileName);`;

const replacePDFShare = `      if (shouldShare && navigator.share) {
        try {
          const pdfBlob = doc.output('blob');
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Invoice',
              text: 'Here is your invoice from Shree Hari.',
            });
            return; // Successfully shared
          }
        } catch (err) {
          console.error("Share failed", err);
        }
      }
      
      // Removed auto download per user request`;

code = code.replace(searchPDFShare, replacePDFShare);
fs.writeFileSync('src/pages/admin/POS.tsx', code);
