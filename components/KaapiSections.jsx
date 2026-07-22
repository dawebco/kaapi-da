'use client';

import { motion } from 'framer-motion';
import { MapPin, Snowflake, Coffee, Sparkles, ArrowRight } from 'lucide-react';
import { KAAPI_COPY, KAAPI_LINKS, KAAPI_THEME } from '@/lib/kaapi-assets';
import KaapiSocialCards from './KaapiSocialCards';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.35 },
  transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] },
};

// Giant faint ghost watermark sitting BEHIND the can canvas layer (z below canvas).
// Note: canvas is z-0. We render this at z-[1] so it sits above bg but under canvas draw.
// Actually we want it BEHIND everything visible — use fixed layer at z-[1] with clip section.
// Simpler: render inside each section with position: absolute inset-0 -z-10; text at scale.
const Watermark = ({ text }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden -z-10">
    <div
      className="font-anton whitespace-nowrap select-none"
      style={{
        fontSize: 'min(38vw, 28rem)',
        color: 'rgba(199,173,255,0.06)',
        letterSpacing: '-0.04em',
        lineHeight: 1,
      }}
    >
      {text}
    </div>
  </div>
);

const Eyebrow = ({ children }) => (
  <div className="text-[10px] uppercase tracking-[0.45em] text-white/50">{children}</div>
);

const SubHead = ({ children }) => (
  <p className="text-white/60 text-sm md:text-base max-w-md mt-4 leading-relaxed">{children}</p>
);

// Slim glass card style used everywhere.
const glassCard =
  'rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[rgba(139,92,255,0.35)] hover:shadow-[0_0_40px_rgba(139,92,255,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300';

export default function KaapiSections() {
  return (
    <>
      {/* ACT 1 — HERO / DECONSTRUCT */}
      <section id="hero" className="relative min-h-screen w-full flex items-center px-6 pt-24">
        <Watermark text="KAAPI" />
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div {...fadeUp} className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: KAAPI_THEME.colors.accent, boxShadow: `0 0 12px ${KAAPI_THEME.colors.accent}` }}
              />
              <span className="text-[10px] uppercase tracking-[0.38em] text-white/80">{KAAPI_COPY.hero.eyebrow}</span>
            </div>
            <h1 className="font-anton mt-6 leading-[0.88] text-white text-5xl md:text-7xl lg:text-8xl">
              {KAAPI_COPY.hero.headline}<br />
              <span className="text-white/85">{KAAPI_COPY.hero.headlineB}</span>
            </h1>
            <p className="text-white/65 text-base md:text-lg max-w-md mt-6 leading-relaxed">
              {KAAPI_COPY.hero.sub}
            </p>
            <div className="mt-8 flex items-center gap-3 text-white/40 text-[10px] uppercase tracking-[0.4em]">
              <span className="h-px w-8 bg-white/30" />
              scroll to brew
            </div>
          </motion.div>
          <div className="hidden md:block" /> {/* right column reserved for can */}
        </div>
      </section>

      {/* ACT 2 — INGREDIENTS / REASSEMBLE (content on right) */}
      <section id="ingredients" className="relative min-h-screen w-full flex items-center px-6">
        <Watermark text="BERRY" />
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block" />
          <motion.div {...fadeUp} className="max-w-md ml-auto">
            <Eyebrow>{KAAPI_COPY.ingredients.eyebrow}</Eyebrow>
            <h2 className="font-anton text-4xl md:text-5xl leading-[0.95] text-white mt-3">{KAAPI_COPY.ingredients.headline}</h2>
            <SubHead>{KAAPI_COPY.ingredients.sub}</SubHead>
            <div className="mt-8 grid gap-3">
              {KAAPI_COPY.ingredients.cards.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className={`${glassCard} p-4`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center border border-white/10"
                      style={{ background: `${KAAPI_THEME.colors.accent}18`, color: KAAPI_THEME.colors.accentSoft }}
                    >
                      {i === 0 ? <Coffee size={16} /> : i === 1 ? <Sparkles size={16} /> : <Snowflake size={16} />}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{c.title}</div>
                      <div className="text-white/55 text-xs mt-0.5">{c.body}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACT 3 — THE BREW / ORBIT (text top, cards bottom — clear middle for can) */}
      <section id="brew" className="relative min-h-screen w-full px-6 flex flex-col justify-between py-24">
        <Watermark text="BREW" />
        <motion.div {...fadeUp} className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Eyebrow>{KAAPI_COPY.brew.eyebrow}</Eyebrow>
              <h2 className="font-anton text-4xl md:text-5xl leading-[0.95] text-white mt-3">{KAAPI_COPY.brew.headline}</h2>
            </div>
            <p className="text-white/60 text-sm md:text-base max-w-sm">{KAAPI_COPY.brew.sub}</p>
          </div>
        </motion.div>
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
          {KAAPI_COPY.brew.cols.map((c, i) => (
            <motion.div
              key={c.k}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className={`${glassCard} p-5`}
            >
              <div className="font-anton text-2xl" style={{ color: KAAPI_THEME.colors.accentSoft }}>{c.k}</div>
              <div className="text-white text-base mt-1">{c.title}</div>
              <div className="text-white/55 text-xs mt-2 leading-relaxed">{c.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACT 4 — THE DROP / BRIDGE (content on left) */}
      <section id="drop" className="relative min-h-screen w-full flex items-center px-6">
        <Watermark text="PANJIM" />
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div {...fadeUp} className="max-w-md">
            <Eyebrow>{KAAPI_COPY.drop.eyebrow}</Eyebrow>
            <h2 className="font-anton text-4xl md:text-5xl leading-[0.95] text-white mt-3">{KAAPI_COPY.drop.headline}</h2>
            <SubHead>{KAAPI_COPY.drop.sub}</SubHead>
            <div className={`${glassCard} mt-8 inline-flex items-center gap-3 px-4 py-3`}>
              <MapPin size={18} style={{ color: KAAPI_THEME.colors.accentSoft }} />
              <div>
                <div className="text-white text-sm">{KAAPI_COPY.drop.address}</div>
                <div className="text-white/45 text-[10px] uppercase tracking-[0.3em] mt-0.5">Central Goa</div>
              </div>
            </div>
          </motion.div>
          <div className="hidden md:block" />
        </div>
      </section>

      {/* ACT 5 — THE ORDER / DETAIL (content on right, offset from zoomed can) */}
      <section id="order" className="relative min-h-screen w-full flex items-center px-6">
        <Watermark text="ORDER" />
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block" />
          <motion.div {...fadeUp} className="max-w-md ml-auto">
            <Eyebrow>{KAAPI_COPY.order.eyebrow}</Eyebrow>
            <h2 className="font-anton text-5xl md:text-6xl leading-[0.9] text-white mt-3">
              {KAAPI_COPY.order.headline}<br />
              <span className="text-white/85">{KAAPI_COPY.order.headlineB}</span>
            </h2>
            <SubHead>{KAAPI_COPY.order.sub}</SubHead>
            <a
              href={KAAPI_LINKS.swiggy + KAAPI_LINKS.utm}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 mt-8 pl-6 pr-2 py-2 rounded-full text-white text-sm font-medium"
              style={{
                background: `linear-gradient(135deg, ${KAAPI_THEME.colors.accent}, ${KAAPI_THEME.colors.accentDeep})`,
                boxShadow: `0 25px 60px -15px ${KAAPI_THEME.colors.accent}, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              <span>{KAAPI_COPY.order.cta}</span>
              <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center transition group-hover:translate-x-0.5">
                <ArrowRight size={14} />
              </span>
            </a>
            <div className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/40">
              Delivered chilled · Central Goa
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACT 6 — OUTRO / REVEAL */}
      <section id="outro" className="relative min-h-screen w-full flex flex-col justify-between px-6 py-28">
        <Watermark text="KAAPI" />
        <motion.div {...fadeUp} className="w-full max-w-4xl mx-auto text-center">
          <Eyebrow>{KAAPI_COPY.outro.eyebrow}</Eyebrow>
          <h2 className="font-anton text-5xl md:text-7xl leading-[0.9] text-white mt-3">{KAAPI_COPY.outro.headline}</h2>
          <p className="text-white/60 text-base md:text-lg mt-5 max-w-lg mx-auto">{KAAPI_COPY.outro.sub}</p>
        </motion.div>
        <div className="w-full max-w-3xl mx-auto">
          <KaapiSocialCards />
          <div className="mt-10 text-center text-[10px] uppercase tracking-[0.4em] text-white/35">
            © Kaapi Da · Bean to Heart · Panjim, Goa
          </div>
        </div>
      </section>
    </>
  );
}
