const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Register.tsx', 'utf-8');

const ruleIndicatorCode = `const RuleIndicator = ({ met, text }: { met: boolean, text: string }) => (
  <div className={\`flex items-center gap-2 text-xs font-bold uppercase tracking-wider \${met ? 'text-emerald-500' : 'text-slate-400'}\`}>
    {met ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
    <span>{text}</span>
  </div>
);`;

code = code.replace(/const RuleIndicator = \(\{[\s\S]*?<\/div>\n  \);/, "");

code = code.replace("export default function Register() {", ruleIndicatorCode + "\n\nexport default function Register() {");

fs.writeFileSync('src/pages/auth/Register.tsx', code);
