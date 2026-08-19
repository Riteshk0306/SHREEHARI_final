import fs from 'fs';
let code = fs.readFileSync('src/api.ts', 'utf-8');

// The problematic code is inside `get: async (url: string) => {`
// Let's replace the entire `get` body up to `post` to be safe, or just use string replace.

const searchString = `      if (url === '/api/contacts') {
        const contactData = { ...data, date: new Date().toISOString() };
        const { data: res, error } = await supabase.from('contacts').insert([contactData]).select().single();
        if (error) throw error;
        return res;
      }
      if (url === '/api/contacts') {
        const contact = { ...data, id: Date.now().toString(), date: new Date().toISOString() };
        mockContacts = [...mockContacts, contact];
        return contact;
      }`;

code = code.replace(searchString, "");
fs.writeFileSync('src/api.ts', code);
