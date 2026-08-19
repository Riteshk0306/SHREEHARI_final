import fs from 'fs';
let code = fs.readFileSync('src/api.ts', 'utf-8');

// Remove the incorrect POST blocks from GET
code = code.replace(
  /      if \(url === '\/api\/contacts'\) \{\n        const contactData = \{ \.\.\.data, date: new Date\(\)\.toISOString\(\) \};\n        const \{ data: res, error \} = await supabase\.from\('contacts'\)\.insert\(\[contactData\]\)\.select\(\)\.single\(\);\n        if \(error\) throw error;\n        return res;\n      \}\n      if \(url === '\/api\/contacts'\) \{\n        const contact = \{ \.\.\.data, id: Date\.now\(\)\.toString\(\), date: new Date\(\)\.toISOString\(\) \};\n        mockContacts = \[\.\.\.mockContacts, contact\];\n        return contact;\n      \}\n/,
  ""
);

// Add the correct POST block to POST try catch
code = code.replace(
  "if (url === '/api/bills') {",
  `if (url === '/api/contacts') {
        const contactData = { ...data, date: new Date().toISOString() };
        const { data: res, error } = await supabase.from('contacts').insert([contactData]).select().single();
        if (error) throw error;
        return res;
      }
      if (url === '/api/bills') {`
);

// Add the correct POST fallback block to POST catch
code = code.replace(
  "if (url === '/api/bills') {",
  `if (url === '/api/contacts') {
        const contact = { ...data, id: Date.now().toString(), date: new Date().toISOString() };
        mockContacts = [...mockContacts, contact];
        return contact;
      }
      if (url === '/api/bills') {`
);

fs.writeFileSync('src/api.ts', code);
