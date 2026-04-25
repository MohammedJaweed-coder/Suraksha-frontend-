/**
 * HomePage.tsx — Premium landing page for Suraksha.ai
 *
 * Sections:
 *  1. Hero with animated gradient + CTAs
 *  2. About the platform
 *  3. Features grid
 *  4. How It Works (timeline steps)
 *  5. Live Status (mock stats)
 *  6. AI Highlight (safe vs risky comparison)
 *  7. Footer slogan
 */

import { motion, useInView } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ChevronRight,
  Clock,
  FileText,
  Flame,
  FolderClock,
  MapPin,
  Navigation,
  Route,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Animation helpers ───────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
};

function AnimatedSection({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Reusable Components ─────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  highlight = false
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: boolean;
}): JSX.Element {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`
        group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300
        ${highlight
          ? 'border-secondary/40 bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-lg shadow-secondary/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }
      `}
    >
      {highlight && (
        <div className="absolute -right-4 -top-4 rounded-full bg-secondary/20 px-4 pb-6 pl-6 pt-2 text-[10px] font-bold uppercase tracking-widest text-secondary">
          AI
        </div>
      )}
      <div className={`
        mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300
        ${highlight
          ? 'bg-secondary/20 text-secondary group-hover:bg-secondary/30'
          : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
        }
      `}>
        <Icon size={24} />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </motion.div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <motion.div variants={fadeUp} className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-blue-500 text-lg font-bold text-white shadow-lg shadow-secondary/30">
          {step}
        </div>
        {step < 4 && <div className="mt-2 h-full w-px bg-gradient-to-b from-secondary/50 to-transparent" />}
      </div>
      {/* Content */}
      <div className="pb-10">
        <div className="mb-2 flex items-center gap-2">
          <Icon size={18} className="text-secondary" />
          <h4 className="text-base font-bold text-white">{title}</h4>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  trend
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  trend?: string;
}): JSX.Element {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.03 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <Icon size={20} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-400">
            <TrendingUp size={12} /> {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </motion.div>
  );
}

// ─── Mock Data ───────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Siren,
    title: 'SOS Emergency Button',
    description: 'One-tap emergency alert with automatic GPS location, audio capture, and instant police notification.',
  },
  {
    icon: FileText,
    title: 'Incident Reporting',
    description: 'Report traffic violations, theft, dark spots, and public nuisance with photo evidence and geolocation.',
  },
  {
    icon: Navigation,
    title: 'AI Safe Routing',
    description: 'Get route suggestions ranked by safety score — not just distance. Avoid high-risk zones automatically.',
    highlight: true,
  },
  {
    icon: Flame,
    title: 'Heatmap Visualization',
    description: 'View real-time incident density across the city. Identify hotspots and safer neighborhoods at a glance.',
  },
  {
    icon: FolderClock,
    title: 'My Reports Tracking',
    description: 'Track all your submitted reports with status updates, timelines, and the ability to clear resolved cases.',
  },
];

const STEPS = [
  {
    icon: Sparkles,
    title: 'Open Suraksha.ai',
    description: 'Launch the PWA on any device — mobile, tablet, or desktop. No app store download needed.',
  },
  {
    icon: Zap,
    title: 'Choose Your Action',
    description: 'Trigger SOS for emergencies, report an incident with evidence, or plan a safe route to your destination.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Processes Your Data',
    description: 'Our safety algorithm analyzes crime data, lighting conditions, police proximity, and time of day in real-time.',
  },
  {
    icon: ShieldCheck,
    title: 'Get Instant Help',
    description: 'Receive safe navigation guidance, track your report status, or get emergency response dispatched to your location.',
  },
];

// ─── Main Page Component ─────────────────────────────────────────────

export default function HomePage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 pb-20">

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary backdrop-blur-sm"
          >
            <Shield size={16} />
            AI-Powered Civic Safety Platform
          </motion.div>

          {/* Title */}
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Your Safety,{' '}
            <span className="bg-gradient-to-r from-secondary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            AI-powered civic safety platform for real-time protection, smarter route decisions, and instant emergency response.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/sos')}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-red-500/30 transition-all hover:shadow-2xl hover:shadow-red-500/40"
            >
              <Siren size={22} className="animate-pulse" />
              Trigger SOS
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/routes')}
              className="group flex items-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 px-8 py-4 text-lg font-bold text-secondary backdrop-blur-sm transition-all hover:bg-secondary/20"
            >
              <MapPin size={22} />
              View Safe Routes
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-6 w-4 rounded-full border-2 border-slate-500/50 p-0.5"
          >
            <div className="h-1.5 w-full rounded-full bg-slate-500/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — ABOUT
          ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="mx-auto max-w-4xl px-4 py-20 text-center">
        <motion.div variants={fadeUp}>
          <span className="mb-4 inline-block rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-secondary">
            About the Platform
          </span>
        </motion.div>
        <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-black text-white sm:text-4xl">
          Making Cities Safer with{' '}
          <span className="text-secondary">Artificial Intelligence</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400">
          Suraksha.ai empowers citizens to <strong className="text-white">report incidents in real-time</strong>,
          receive <strong className="text-white">AI-powered safer route suggestions</strong>, and trigger
          <strong className="text-white"> instant emergency alerts</strong> — all from a single progressive web app.
          Our platform bridges the gap between citizens and law enforcement, creating a safer, smarter city.
        </motion.p>

        {/* Decorative divider */}
        <motion.div variants={fadeUp} className="mx-auto mt-12 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <ShieldCheck size={24} className="text-secondary/50" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </motion.div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — FEATURES GRID
          ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="mx-auto max-w-6xl px-4 py-16">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-secondary">
            Platform Features
          </span>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Everything You Need to{' '}
            <span className="text-secondary">Stay Safe</span>
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(feature => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              highlight={feature.highlight}
            />
          ))}
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
          ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="mx-auto max-w-3xl px-4 py-20">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-secondary">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Safety in{' '}
            <span className="text-secondary">4 Simple Steps</span>
          </h2>
        </motion.div>

        <div className="ml-2">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.title}
              step={i + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 5 — LIVE STATUS (Mock Data)
          ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="mx-auto max-w-5xl px-4 py-16">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-secondary">
            Live Platform Stats
          </span>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Community{' '}
            <span className="text-secondary">Impact</span>
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BarChart3} value="2,847" label="Total Incidents Reported" trend="+12%" />
          <StatCard icon={AlertTriangle} value="34" label="Active Alerts Right Now" />
          <StatCard icon={Users} value="15K+" label="Citizens Protected" trend="+28%" />
          <StatCard icon={Activity} value="87" label="City Safety Score" trend="+5" />
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 6 — AI HIGHLIGHT (Safe vs Risky)
          ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="mx-auto max-w-5xl px-4 py-20">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-secondary">
            Smart AI Engine
          </span>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Safety Over Speed —{' '}
            <span className="text-secondary">Every Time</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Our AI prioritizes safer routes over shortest routes, analyzing real-time crime data, lighting conditions, and police proximity.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Safe Route Card */}
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-6"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10 blur-2xl" />
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">🛡️ Safest Route</h3>
                <p className="text-sm text-green-400">Recommended by AI</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                <span className="text-sm text-slate-300">Safety Score</span>
                <span className="text-lg font-black text-green-400">92 / 100</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                <span className="text-sm text-slate-300">Distance</span>
                <span className="font-semibold text-white">6.8 km</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                <span className="text-sm text-slate-300">Estimated Time</span>
                <span className="font-semibold text-white">24 min</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2.5 text-sm text-green-300">
                <ShieldCheck size={16} />
                Passes near 2 police stations
              </div>
            </div>
          </motion.div>

          {/* Risky Route Card */}
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 p-6"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/10 blur-2xl" />
            <div className="absolute right-4 top-4 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
              NOT RECOMMENDED
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">⚡ Fastest Route</h3>
                <p className="text-sm text-red-400">High risk zones detected</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                <span className="text-sm text-slate-300">Safety Score</span>
                <span className="text-lg font-black text-red-400">38 / 100</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                <span className="text-sm text-slate-300">Distance</span>
                <span className="font-semibold text-white">4.2 km</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                <span className="text-sm text-slate-300">Estimated Time</span>
                <span className="font-semibold text-white">14 min</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                <AlertTriangle size={16} />
                Passes through 2 high-risk areas
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA below comparison */}
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/routes')}
            className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-8 py-4 text-base font-bold text-white shadow-xl shadow-secondary/30 transition-all hover:shadow-2xl"
          >
            <Route size={20} />
            Try Safe Route Planner
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 7 — FOOTER SLOGAN
          ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
            <Shield size={32} />
          </div>
          <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            From Awareness to Action
          </h2>
          <p className="mb-2 text-xl font-semibold text-secondary sm:text-2xl">
            Your Safety Companion.
          </p>
          <p className="mx-auto max-w-md text-slate-500">
            Stay Alert. Stay Safe. Suraksha.ai Protects You.
          </p>

          <div className="mx-auto mt-10 flex items-center justify-center gap-3 text-sm text-slate-600">
            <span>Built with</span>
            <span className="text-red-500">❤️</span>
            <span>for safer communities</span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
