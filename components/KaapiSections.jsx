'use client';

import { motion } from 'framer-motion';
import { MapPin, Snowflake, Coffee, Sparkles } from 'lucide-react';
import { KAAPI_COPY } from '@/lib/kaapi-assets';
import KaapiSocialCards from './KaapiSocialCards';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.35 },
  transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] },
};

const Watermark = ({ text, isDark }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden -z-10">
    <div
      className="font-anton whitespace-nowrap select-none"
      style={{
        fontSize: 'min(38vw, 28rem)',
        color: isDark ? 'rgba(199,173,255,0.06)' : 'rgba(74,42,21,0.06)',
        letterSpacing: '-0.04em',
        lineHeight: 1,
      }}
    >
      {text}
    </div>
  </div>
);

export default function KaapiSections({ theme }) {
  const isDark = theme.id === 'dark';
  const ink = isDark ? 'text-white' : 'text-[#1B1710]';
  const inkMute = isDark ? 'text-white/70' : 'text-[#5C4F3F]';
  const inkDim = isDark ? 'text-white/50' : 'text-[#5C4F3F]/70';
  const cardBg = isDark ? 'bg-white/[0.04]' : 'bg-black/[0.03]';
  const cardBorder = isDark ? 'border-white/10' : 'border-black/10';
  const iconBg = isDark ? 'bg-[#8B5CFF]/18' : 'bg-[#8A5A3C]/15';
  const iconTxt = isDark ? 'text-[#C7ADFF]' : 'text-[#4A2A15]';
  const kickerColor = isDark ? '#C7ADFF' : '#8A5A3C';

  const glass = `rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-md transition-all duration-300`;

  const Eyebrow = ({ children }) => (
    <div className={`text-[10px] uppercase tracking-[0.45em] ${inkDim}`}>{children}</div>
  );

  return (
    <>
      {/* ACT 1 — HERO */}
      <section id="hero" className="relative min-h-screen w-full flex items-center px-4 sm:px-8 pt-24">
        <Watermark text="KAAPI" isDark={isDark} />
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div {...fadeUp} className="max-w-xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${cardBorder} ${cardBg} backdrop-blur`}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: kickerColor, boxShadow: `0 0 12px ${kickerColor}` }} />
              <span className={`text-[10px] uppercase tracking-[0.38em] ${inkMute}`}>{KAAPI_COPY.hero.eyebrow}</span>
            </div>
            <h1 className={`font-anton mt-6 leading-tight md:leading-[0.88] ${ink} text-5xl md:text-7xl lg:text-8xl`}>
              {KAAPI_COPY.hero.headline}<br />
              <span className="opacity-85">{KAAPI_COPY.hero.headlineB}</span>
            </h1>
            <p className={`${inkMute} text-base md:text-lg max-w-md mt-6 leading-relaxed`}>{KAAPI_COPY.hero.sub}</p>
            <div className={`mt-8 flex items-center gap-3 ${inkDim} text-[10px] uppercase tracking-[0.4em]`}>
              <span className={`h-px w-8 ${isDark ? 'bg-white/30' : 'bg-black/25'}`} />scroll to brew
            </div>
          </motion.div>
          <div className="hidden md:block" />
        </div>
      </section>

      {/* ACT 2 — INGREDIENTS */}
      <section id="ingredients" className="relative min-h-screen w-full flex items-center px-4 sm:px-8">
        <Watermark text="BERRY" isDark={isDark} />
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="hidden md:block" />
          <motion.div {...fadeUp} className="max-w-md ml-auto">
            <Eyebrow>{KAAPI_COPY.ingredients.eyebrow}</Eyebrow>
            <h2 className={`font-anton text-4xl md:text-5xl leading-tight md:leading-[0.95] ${ink} mt-3`}>{KAAPI_COPY.ingredients.headline}</h2>
            <p className={`${inkMute} text-sm md:text-base max-w-md mt-4 leading-relaxed`}>{KAAPI_COPY.ingredients.sub}</p>
            <div className="mt-8 grid gap-3">
              {KAAPI_COPY.ingredients.cards.map((c, i) => (
                <motion.div key={c.title}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }} transition={{ delay: i * 0.08, duration: 0.6 }}
                  className={`${glass} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${cardBorder} ${iconBg} ${iconTxt}`}>
                      {i === 0 ? <Coffee size={16} /> : i === 1 ? <Sparkles size={16} /> : <Snowflake size={16} />}
                    </div>
                    <div>
                      <div className={`${ink} text-sm font-medium`}>{c.title}</div>
                      <div className={`${inkMute} text-xs mt-0.5`}>{c.body}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACT 3 — BREW */}
      <section id="brew" className="relative min-h-screen w-full px-4 sm:px-8 flex flex-col justify-between py-24">
        <Watermark text="BREW" isDark={isDark} />
        <motion.div {...fadeUp} className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Eyebrow>{KAAPI_COPY.brew.eyebrow}</Eyebrow>
              <h2 className={`font-anton text-4xl md:text-5xl leading-tight md:leading-[0.95] ${ink} mt-3`}>{KAAPI_COPY.brew.headline}</h2>
            </div>
            <p className={`${inkMute} text-sm md:text-base max-w-sm`}>{KAAPI_COPY.brew.sub}</p>
          </div>
        </motion.div>
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {KAAPI_COPY.brew.cols.map((c, i) => (
            <motion.div key={c.k}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }} transition={{ delay: i * 0.1, duration: 0.7 }}
              className={`${glass} p-5`}>
              <div className="font-anton text-2xl" style={{ color: kickerColor }}>{c.k}</div>
              <div className={`${ink} text-base mt-1`}>{c.title}</div>
              <div className={`${inkMute} text-xs mt-2 leading-relaxed`}>{c.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACT 4 — DROP */}
      <section id="drop" className="relative min-h-screen w-full flex items-center px-4 sm:px-8">
        <Watermark text="PANJIM" isDark={isDark} />
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div {...fadeUp} className="max-w-md">
            <Eyebrow>{KAAPI_COPY.drop.eyebrow}</Eyebrow>
            <h2 className={`font-anton text-4xl md:text-5xl leading-tight md:leading-[0.95] ${ink} mt-3`}>{KAAPI_COPY.drop.headline}</h2>
            <p className={`${inkMute} text-sm md:text-base max-w-md mt-4 leading-relaxed`}>{KAAPI_COPY.drop.sub}</p>
            <div className={`${glass} mt-8 inline-flex items-center gap-3 px-4 py-3`}>
              <MapPin size={18} style={{ color: kickerColor }} />
              <div>
                <div className={`${ink} text-sm`}>{KAAPI_COPY.drop.address}</div>
                <div className={`${inkDim} text-[10px] uppercase tracking-[0.3em] mt-0.5`}>Central Goa</div>
              </div>
            </div>
          </motion.div>
          <div className="hidden md:block" />
        </div>
      </section>

      {/* ACT 5 — ORDER (no CTA — sticky bottom-right handles it) */}
      <section id="order" className="relative min-h-screen w-full flex items-center px-4 sm:px-8">
        <Watermark text="ORDER" isDark={isDark} />
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="hidden md:block" />
          <motion.div {...fadeUp} className="max-w-md ml-auto">
            <Eyebrow>{KAAPI_COPY.order.eyebrow}</Eyebrow>
            <h2 className={`font-anton text-5xl md:text-6xl leading-tight md:leading-[0.9] ${ink} mt-3`}>
              {KAAPI_COPY.order.headline}<br />
              <span className="opacity-85">{KAAPI_COPY.order.headlineB}</span>
            </h2>
            <p className={`${inkMute} text-sm md:text-base max-w-md mt-4 leading-relaxed`}>{KAAPI_COPY.order.sub}</p>
            <div className={`mt-6 text-[10px] uppercase tracking-[0.35em] ${inkDim}`}>
              Delivered chilled · Central Goa
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACT 6 — OUTRO */}
      <section id="outro" className="relative min-h-screen w-full flex flex-col justify-between px-4 sm:px-8 py-28">
        <Watermark text="KAAPI" isDark={isDark} />
        <motion.div {...fadeUp} className="w-full max-w-4xl mx-auto text-center">
          <Eyebrow>{KAAPI_COPY.outro.eyebrow}</Eyebrow>
          <h2 className={`font-anton text-5xl md:text-7xl leading-tight md:leading-[0.9] ${ink} mt-3`}>{KAAPI_COPY.outro.headline}</h2>
          <p className={`${inkMute} text-base md:text-lg mt-5 max-w-lg mx-auto`}>{KAAPI_COPY.outro.sub}</p>
        </motion.div>
        <div className="w-full max-w-3xl mx-auto">
          <KaapiSocialCards theme={theme} />
          <div className={`mt-10 text-center text-[10px] uppercase tracking-[0.4em] ${inkDim}`}>
            © Kaapi Da · Bean to Heart · Panjim, Goa
          </div>
        </div>
      </section>
    </>
  );
}
