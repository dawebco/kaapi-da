'use client';

import { KAAPI_LINKS, KAAPI_LOGO } from '@/lib/kaapi-assets';
import { Sun, Moon } from 'lucide-react';
import Image from 'next/image';

export default function KaapiNav({ theme, onToggleTheme }) {
  const isDark = theme.id === 'dark';
  const bg = isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]';
  const border = isDark ? 'border-white/10' : 'border-black/10';
  const ink = isDark ? 'text-white/90' : 'text-black/85';
  const inkMute = isDark ? 'text-white/60' : 'text-black/55';
  const hoverInk = isDark ? 'hover:text-white' : 'hover:text-black';

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between pointer-events-auto">
        {/* Left — Kaapi Da logo */}
        <a href="#hero" className={`flex items-center gap-3 rounded-full pl-1.5 pr-4 py-1 border ${border} ${bg} backdrop-blur-md`}>
          <span className="h-8 w-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <Image src={KAAPI_LOGO} alt="Kaapi Da" width={32} height={32} className="h-8 w-8 object-cover" />
          </span>
          <span className={`font-anton tracking-[0.32em] text-xs ${ink}`}>KAAPI DA</span>
        </a>

        {/* Center — pill nav */}
        <div className={`hidden md:flex items-center gap-1 rounded-full border ${border} ${bg} backdrop-blur-md px-1.5 py-1.5`}>
          {[
            { label: 'Brew', href: '#brew' },
            { label: 'Panjim', href: '#drop' },
            { label: 'Order', href: '#order' },
          ].map((it) => (
            <a key={it.label} href={it.href}
              className={`text-[11px] uppercase tracking-[0.28em] ${inkMute} ${hoverInk} transition px-3 py-1.5 rounded-full`}>
              {it.label}
            </a>
          ))}
        </div>

        {/* Right — theme toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className={`h-10 w-10 flex items-center justify-center rounded-full border ${border} ${bg} backdrop-blur-md ${ink} transition hover:scale-105`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}
