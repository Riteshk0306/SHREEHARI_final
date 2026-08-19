import fs from 'fs';
let code = fs.readFileSync('src/api.ts', 'utf-8');
code = code.replace("get: async (url: string) => {", "get: async (url: string): Promise<any> => {");
code = code.replace("post: async (url: string, data: any) => {", "post: async (url: string, data: any): Promise<any> => {");
code = code.replace("put: async (url: string, data: any) => {", "put: async (url: string, data: any): Promise<any> => {");
code = code.replace("delete: async (url: string) => {", "delete: async (url: string): Promise<any> => {");
fs.writeFileSync('src/api.ts', code);
