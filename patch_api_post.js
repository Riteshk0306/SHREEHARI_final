import fs from 'fs';
let code = fs.readFileSync('src/api.ts', 'utf-8');

code = code.replace(
  "if (url === '/api/orders') {",
  `if (url === '/api/contacts') {
        const contactData = { ...data, date: new Date().toISOString() };
        const { data: res, error } = await supabase.from('contacts').insert([contactData]).select().single();
        if (error) throw error;
        return res;
      }
      if (url === '/api/orders') {`
);

code = code.replace(
  "if (url === '/api/orders') {",
  `if (url === '/api/contacts') {
        const contact = { ...data, id: Date.now().toString(), date: new Date().toISOString() };
        mockContacts = [...mockContacts, contact];
        return contact;
      }
      if (url === '/api/orders') {`
);

fs.writeFileSync('src/api.ts', code);
