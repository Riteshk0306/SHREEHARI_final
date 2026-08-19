import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldHeader = `<header className="bg-amber-50/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Shree Hari Logo" className="h-10 w-auto object-contain" />
            <span className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight uppercase">Shree Hari</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">`;

const newHeader = `<header className="bg-amber-50/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Shree Hari Logo" className="h-8 sm:h-10 w-auto object-contain" />
            <span className="text-lg sm:text-2xl font-bold text-amber-600 tracking-tight uppercase hidden min-[360px]:block">Shree Hari</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">`;

code = code.replace(oldHeader, newHeader);

const gapSearch = `<div className="flex items-center gap-2 sm:gap-4">`;
const gapReplace = `<div className="flex items-center gap-1 sm:gap-4 shrink-0">`;
code = code.replace(gapSearch, gapReplace);

const menuSearch = `<div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">`;
const menuReplace = `<div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl absolute w-full left-0 top-16 z-50">`;
code = code.replace(menuSearch, menuReplace);

fs.writeFileSync('src/App.tsx', code);
