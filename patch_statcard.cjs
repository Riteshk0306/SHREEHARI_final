const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf-8');

const statCardCode = `const StatCard = ({ title, value, color, alert, subtitle, subtitleColor, onClick }: { title: string, value: string | number, color?: string, alert?: boolean, subtitle?: string, subtitleColor?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={\`bg-white p-5 rounded-xl border shadow-sm \${alert ? 'border-red-200 bg-red-50 shadow-red-100' : 'border-slate-200'} \${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}\`}>
    <p className={\`text-xs font-bold uppercase tracking-wider mb-1 \${alert ? 'text-red-600' : 'text-slate-500'}\`}>{title}</p>
    <p className={\`text-2xl font-bold \${alert ? 'text-red-700' : 'text-slate-900'}\`}>{value}</p>
    {subtitle && <p className={\`text-[10px] font-medium mt-1 \${subtitleColor || 'text-emerald-600'}\`}>{subtitle}</p>}
  </div>
);`;

// Remove from inside Dashboard
code = code.replace(/const StatCard = \(\{[\s\S]*?\}\) => \([\s\S]*?<\/div>\n  \);/, "");

// Insert before export default function Dashboard
code = code.replace("export default function Dashboard() {", statCardCode + "\n\nexport default function Dashboard() {");

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
