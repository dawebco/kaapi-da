'use client';

import { motion } from 'framer-motion';
import { MapPin, Snowflake, Coffee, Sparkles, ArrowRight } from 'lucide-react';
import { KAAPI_COPY, KAAPI_LINKS, KAAPI_THEME } from '@/lib/kaapi-assets';
import KaapiSocialCards from './KaapiSocialCards';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] },
};

const Eyebrow = ({ children }) => (
  <div className="text-[11px] uppercase tracking-[0.4em] text-white/50">{children}</div>
);

const Headline = ({ children }) => (
  <h2 className="font-anton text-5xl md:text-7xl leading-[0.95] text-white mt-3">
    {children}
  </h2>
);

const Sub = ({ children }) => (
  <p className="text-white/70 text-base md:text-lg max-w-xl mt-5 leading-relaxed">{children}</p>
);

// A screen-height section that leaves the center clear for the canvas hero.
const ActShell = ({ id, side = 'left', children }) => {
  const sideCls = side === 'right' ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16';
  return (
    <section id={id} className="relative min-h-screen w-full flex items-center px-6">
      <div className={`w-full max-w-7xl mx-auto flex ${sideCls}`}>
        <motion.div {...fadeUp} className="max-w-lg">
          {children}
        </motion.div>
      </div>
    </section>
  );
};

export default function KaapiSections() {
  return (
    <>
      {/* ACT 1 — HERO / DECONSTRUCT */}
      <section id="hero" className="relative min-h-screen w-full flex items-end pb-24 md:pb-32 px-6">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: KAAPI_THEME.colors.accent, boxShadow: `0 0 10px ${KAAPI_THEME.colors.accent}` }}
              />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/80">{KAAPI_COPY.hero.eyebrow}</span>
            </div>
            <h1 className="font-anton text-6xl md:text-8xl lg:text-9xl leading-[0.88] mt-6 text-white">
              {KAAPI_COPY.hero.headline}
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-xl mt-6 leading-relaxed">
              {KAAPI_COPY.hero.sub}
            </p>
            <div className="mt-8 flex items-center gap-3 text-white/50 text-xs uppercase tracking-[0.3em]">
              <span className="h-px w-8 bg-white/30" />
              scroll to brew
            </div>
          </motion.div>
        </div>
        {/* Flavor badge — locked near hero during early acts */}
        <div className="absolute right-6 top-24 md:right-10 md:top-32 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="px-3 py-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur text-[10px] uppercase tracking-[0.35em] text-white/85"
            style={{ boxShadow: `0 0 40px ${KAAPI_THEME.colors.accent}40` }}
          >
            {KAAPI_THEME.flavorBadge}
          </motion.div>
        </div>
      </section>

      {/* ACT 2 — INGREDIENTS / REASSEMBLE */}
      <ActShell id="ingredients" side="right">
        <Eyebrow>{KAAPI_COPY.ingredients.eyebrow}</Eyebrow>
        <Headline>{KAAPI_COPY.ingredients.headline}</Headline>
        <Sub>{KAAPI_COPY.ingredients.sub}</Sub>
        <div className="mt-8 grid gap-3">
          {KAAPI_COPY.ingredients.cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${KAAPI_THEME.colors.accent}22`, color: KAAPI_THEME.colors.accentSoft }}
                >
                  {i === 0 ? <Coffee size={16} /> : i === 1 ? <Sparkles size={16} /> : <Snowflake size={16} />}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{c.title}</div>
                  <div className="text-white/60 text-xs mt-0.5">{c.body}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ActShell>

      {/* ACT 3 — THE BREW / ORBIT */}
      <section id="brew" className="relative min-h-screen w-full flex items-center px-6">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center">
            <Eyebrow>{KAAPI_COPY.brew.eyebrow}</Eyebrow>
            <h2 className="font-anton text-5xl md:text-7xl leading-[0.95] text-white mt-3">{KAAPI_COPY.brew.headline}</h2>
            <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto mt-5">{KAAPI_COPY.brew.sub}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 max-w-5xl mx-auto">
            {KAAPI_COPY.brew.cols.map((c, i) => (
              <motion.div
                key={c.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
                className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-6"
              >
                <div
                  className="font-anton text-3xl"
                  style={{ color: KAAPI_THEME.colors.accentSoft }}
                >
                  {c.k}
                </div>
                <div className="text-white text-lg mt-2">{c.title}</div>
                <div className="text-white/60 text-sm mt-2 leading-relaxed">{c.body}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ACT 4 — THE DROP / BRIDGE */}
      <ActShell id="drop" side="left">
        <Eyebrow>{KAAPI_COPY.drop.eyebrow}</Eyebrow>
        <Headline>{KAAPI_COPY.drop.headline}</Headline>
        <Sub>{KAAPI_COPY.drop.sub}</Sub>
        <div
          className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur px-4 py-3"
          style={{ boxShadow: `0 0 40px ${KAAPI_THEME.colors.accent}30` }}
        >
          <MapPin size={18} style={{ color: KAAPI_THEME.colors.accentSoft }} />
          <div>
            <div className="text-white text-sm">{KAAPI_COPY.drop.address}</div>
            <div className="text-white/50 text-[10px] uppercase tracking-[0.3em] mt-0.5">Central Goa</div>
          </div>
        </div>
      </ActShell>

      {/* ACT 5 — THE ORDER / DETAIL */}
      <section id="order" className="relative min-h-screen w-full flex items-center justify-center px-6">
        <motion.div {...fadeUp} className="w-full max-w-3xl text-center">
          <Eyebrow>{KAAPI_COPY.order.eyebrow}</Eyebrow>
          <h2 className="font-anton text-6xl md:text-8xl leading-[0.9] text-white mt-3">{KAAPI_COPY.order.headline}</h2>
          <p className="text-white/70 text-lg mt-5">{KAAPI_COPY.order.sub}</p>
          <a
            href={KAAPI_LINKS.swiggy + KAAPI_LINKS.utm}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 mt-10 pl-6 pr-3 py-3 rounded-full text-white font-medium"
            style={{
              background: `linear-gradient(135deg, ${KAAPI_THEME.colors.accent}, ${KAAPI_THEME.colors.accentDeep})`,
              boxShadow: `0 30px 80px -20px ${KAAPI_THEME.colors.accent}, inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
          >
            <span>{KAAPI_COPY.order.cta}</span>
            <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center transition group-hover:translate-x-0.5">
              <ArrowRight size={16} />
            </span>
          </a>
          <div className="mt-6 text-[11px] uppercase tracking-[0.35em] text-white/40">
            Delivered chilled · Central Goa
          </div>
        </motion.div>
      </section>

      {/* ACT 6 — OUTRO / REVEAL */}
      <section id="outro" className="relative min-h-screen w-full flex items-center justify-center px-6 pb-16">
        <motion.div {...fadeUp} className="w-full max-w-4xl text-center">
          <Eyebrow>{KAAPI_COPY.outro.eyebrow}</Eyebrow>
          <h2 className="font-anton text-7xl md:text-9xl leading-[0.88] text-white mt-3">{KAAPI_COPY.outro.headline}</h2>
          <p className="text-white/70 text-lg mt-6">{KAAPI_COPY.outro.sub}</p>
          <div className="mt-12">
            <KaapiSocialCards />
          </div>
          <div className="mt-16 text-[10px] uppercase tracking-[0.4em] text-white/40">
            © Kaapi Da · Bean to Heart · Panjim, Goa
          </div>
        </motion.div>
      </section>
    </>
  );
}
