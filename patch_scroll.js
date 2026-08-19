import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate } from 'react-router-dom';",
  "import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';"
);

content = content.replace(
  "import { useState } from 'react';",
  "import { useState, useEffect } from 'react';"
);

const scrollToTopCode = `
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {`;

content = content.replace(
  "export default function App() {",
  scrollToTopCode
);

content = content.replace(
  "<BrowserRouter>\n      <Routes>",
  "<BrowserRouter>\n      <ScrollToTop />\n      <Routes>"
);

fs.writeFileSync('src/App.tsx', content);
