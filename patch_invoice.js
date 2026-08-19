import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Orders.tsx', 'utf-8');

code = code.replace(
  `<div class="header">
            <h1>Shree Hari</h1>
            <p>Premium Pooja Samagri</p>
          </div>`,
  `<div class="header" style="display: flex; align-items: center; gap: 20px;">
            <img src="\${window.location.origin}/logo.png" alt="Shree Hari Logo" style="height: 60px; width: auto; object-fit: contain;" />
            <div>
              <h1>Shree Hari</h1>
              <p>Premium Pooja Samagri</p>
            </div>
          </div>`
);

code = code.replace(
  `<p>Status: \${order.orderStatus}</p>`,
  ``
);

fs.writeFileSync('src/pages/customer/Orders.tsx', code);
