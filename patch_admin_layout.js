import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = `const AdminLayout = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }`;

const replaceStr = `const AdminLayout = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }`;

code = code.replace(searchStr, replaceStr);

const sidebarSearchStr = `      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800 z-10 hidden lg:flex">`;

const sidebarReplaceStr = `      {/* Sidebar */}
      {/* Mobile Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={\`fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 \${menuOpen ? 'translate-x-0' : '-translate-x-full'}\`}>`;

code = code.replace(sidebarSearchStr, sidebarReplaceStr);

const headerSearchStr = `      <main className="flex-1 flex flex-col h-full">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 lg:hidden">
           <h2 className="text-xl font-bold text-amber-500 uppercase tracking-tight">Shree Hari Admin</h2>
           <Link to="/" className="text-sm text-slate-500 hover:text-amber-600 underline">View Store</Link>
        </header>`;

const headerReplaceStr = `      <main className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 lg:hidden">
           <div className="flex items-center gap-3">
             <button onClick={() => setMenuOpen(true)} className="text-slate-600 hover:text-amber-600 transition-colors">
               <Menu className="w-6 h-6" />
             </button>
             <h2 className="text-lg sm:text-xl font-bold text-amber-500 uppercase tracking-tight">Shree Hari Admin</h2>
           </div>
           <Link to="/" className="text-sm text-slate-500 hover:text-amber-600 underline">View Store</Link>
        </header>`;

code = code.replace(headerSearchStr, headerReplaceStr);

const linkSearchStr = `            <Link
              key={link.to}
              to={link.to}
              className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors"
            >`;

const linkReplaceStr = `            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors"
            >`;

code = code.replace(linkSearchStr, linkReplaceStr);
code = code.replace(linkSearchStr, linkReplaceStr);
code = code.replace(linkSearchStr, linkReplaceStr);
code = code.replace(linkSearchStr, linkReplaceStr);
code = code.replace(linkSearchStr, linkReplaceStr);

fs.writeFileSync('src/App.tsx', code);
