'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { KAAPI_LINKS, KAAPI_THEME } from '@/lib/kaapi-assets';

export default function KaapiStickyOrder({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          key="sticky-swiggy"
          href={KAAPI_LINKS.swiggy + KAAPI_LINKS.utm}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 pl-4 pr-5 py-3 rounded-full text-white font-medium tracking-wide"
          style={{
            background: `linear-gradient(135deg, ${KAAPI_THEME.colors.accent}, ${KAAPI_THEME.colors.accentDeep})`,
            boxShadow: `0 20px 60px -10px ${KAAPI_THEME.colors.accent}80, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        >
          <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
            <ShoppingBag size={16} />
          </span>
          <span className="text-sm">Order on Swiggy · Panjim</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
