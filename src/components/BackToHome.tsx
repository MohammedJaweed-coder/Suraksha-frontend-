/**
 * BackToHome — Reusable floating button for navigating back to /home
 * Appears on all pages except Home itself.
 */

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BackToHome(): JSX.Element | null {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page
  if (location.pathname === '/home' || location.pathname === '/') return null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate('/home')}
      className="fixed left-4 top-[4.5rem] z-50 flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white/80 shadow-lg backdrop-blur-md transition-all hover:bg-secondary/20 hover:text-secondary hover:shadow-secondary/20"
    >
      <Home size={16} />
      <span className="hidden sm:inline">Home</span>
    </motion.button>
  );
}
