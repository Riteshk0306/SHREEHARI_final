import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace("app.use(express.json());", "app.use(express.json({ limit: '10mb' }));\n  app.use(express.urlencoded({ limit: '10mb', extended: true }));");
fs.writeFileSync('server.ts', code);
