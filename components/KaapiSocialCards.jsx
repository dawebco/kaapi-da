'use client';

import { Instagram, ArrowUpRight } from 'lucide-react';
import { KAAPI_LINKS } from '@/lib/kaapi-assets';

const cards = [
  { handle: '@kaapi_da', label: 'The brand', href: KAAPI_LINKS.instagramMain + KAAPI_LINKS.utm },
  { handle: '@dosa_and_podi', label: 'The kitchen', href: KAAPI_LINKS.instagramSister + KAAPI_LINKS.utm },
];

export default function KaapiSocialCards({ theme }) {
  const isDark = theme.id === 'dark';
  const accent = theme.colors.accent;
  const accentDeep = theme.colors.accentDeep;
  const border = isDark ? 'border-white/10 hover:border-white/25' : 'border-black/10 hover:border-black/25';
  const cardBg = isDark ? 'bg-white/[0.03]' : 'bg-black/[0.03]';
  const ink = isDark ? 'text-white' : 'text-[#1B1710]';
  const inkMute = isDark ? 'text-white/50' : 'text-[#5C4F3F]/85';
  const arrow = isDark ? 'text-white/60 group-hover:text-white' : 'text-black/50 group-hover:text-black';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {cards.map((c) => (
        <a key={c.handle} href={c.href} target="_blank" rel="noopener noreferrer"
          className={`group relative overflow-hidden rounded-2xl border ${border} ${cardBg} backdrop-blur-md p-5 flex items-center justify-between transition`}
          style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px -20px ${accent}55` }}>
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}, ${accentDeep})` }}>
              <Instagram size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className={`${ink} font-medium`}>{c.handle}</div>
              <div className={`text-[11px] uppercase tracking-[0.25em] ${inkMute}`}>{c.label}</div>
            </div>
          </div>
          <ArrowUpRight size={18} className={`${arrow} transition`} />
        </a>
      ))}
    </div>
  );
}
