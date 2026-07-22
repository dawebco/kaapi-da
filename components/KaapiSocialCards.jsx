'use client';

import { Instagram, ArrowUpRight } from 'lucide-react';
import { KAAPI_LINKS, KAAPI_THEME } from '@/lib/kaapi-assets';

const cards = [
  {
    handle: '@kaapi_da',
    label: 'The brand',
    href: KAAPI_LINKS.instagramMain + KAAPI_LINKS.utm,
  },
  {
    handle: '@dosa_and_podi',
    label: 'The kitchen',
    href: KAAPI_LINKS.instagramSister + KAAPI_LINKS.utm,
  },
];

export default function KaapiSocialCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {cards.map((c) => (
        <a
          key={c.handle}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 flex items-center justify-between hover:border-white/25 transition"
          style={{
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px -20px ${KAAPI_THEME.colors.accent}55`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${KAAPI_THEME.colors.accent}, ${KAAPI_THEME.colors.accentDeep})` }}
            >
              <Instagram size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">{c.handle}</div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-white/50">{c.label}</div>
            </div>
          </div>
          <ArrowUpRight size={18} className="text-white/60 group-hover:text-white transition" />
        </a>
      ))}
    </div>
  );
}
