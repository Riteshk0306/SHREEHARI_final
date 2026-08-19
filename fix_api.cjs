const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf-8');

const badMock = `
      if (url.startsWith('/api/customers/')) {
        const id = url.split('/').pop();
        mockCustomers = mockCustomers.map(c => c.id === id ? { ...c, ...data } : c);
        return mockCustomers.find(c => c.id === id);
      }
`;
code = code.replace(badMock, "");

code = code.replace(
  "    } catch(err) {\n      if (url.startsWith('/api/products/')) {",
  "    } catch(err) {" + badMock + "      if (url.startsWith('/api/products/')) {"
);

fs.writeFileSync('src/api.ts', code);
