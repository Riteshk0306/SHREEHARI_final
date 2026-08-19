import fs from 'fs';

let contactCode = fs.readFileSync('src/pages/customer/Contact.tsx', 'utf-8');

contactCode = contactCode.replace(
  "const [email, setEmail] = useState('');",
  "const [email, setEmail] = useState('');\n  const [mobile, setMobile] = useState('');"
);

contactCode = contactCode.replace(
  "await api.post('/api/contacts', { name, email, message });",
  "await api.post('/api/contacts', { name, email, mobile, message });"
);

contactCode = contactCode.replace(
  "const waMessage = `*New Contact Message!*\\n\\n*Name:* ${name}\\n*Email:* ${email}\\n*Message:* \\n${message}`;",
  "const waMessage = `*New Contact Message!*\\n\\n*Name:* ${name}\\n*Email:* ${email}\\n*Mobile:* ${mobile}\\n*Message:* \\n${message}`;"
);

contactCode = contactCode.replace(
  "setMessage('');",
  "setMobile('');\n      setMessage('');"
);

const formFields = `
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
                <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="Your Mobile Number" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message</label>
`;

contactCode = contactCode.replace(
  `              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message</label>`,
  formFields
);

fs.writeFileSync('src/pages/customer/Contact.tsx', contactCode);

let contactsAdminCode = fs.readFileSync('src/pages/admin/Contacts.tsx', 'utf-8');

contactsAdminCode = contactsAdminCode.replace(
  "import { Mail, Calendar, User } from 'lucide-react';",
  "import { Mail, Calendar, User, Phone } from 'lucide-react';"
);

contactsAdminCode = contactsAdminCode.replace(
  `<span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </span>`,
  `<span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </span>
                    {contact.mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {contact.mobile}
                      </span>
                    )}`
);

fs.writeFileSync('src/pages/admin/Contacts.tsx', contactsAdminCode);
