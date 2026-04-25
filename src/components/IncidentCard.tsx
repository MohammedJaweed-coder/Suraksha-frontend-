/**
 * IncidentCard — Enhanced with AI Validation Badges + Rewards/Penalties
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  CarFront,
  CheckCircle2,
  Clock,
  Gift,
  Lightbulb,
  Siren,
  Speaker,
  Trash2,
  XCircle
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Incident } from '../types';
import { Badge } from './ui/Badge';
import { useIncidentStore } from '../store/incident.store';
import { useAuthStore } from '../store/auth.store';
import { resolveIncident } from '../lib/incidents.api';

const iconMap = {
  SOS: Siren,
  TRAFFIC: CarFront,
  PUBLIC_NUISANCE: Speaker,
  DARK_SPOT: Lightbulb,
  THEFT: AlertTriangle,
  OTHER: AlertTriangle
};

const colorMap = {
  SOS: 'bg-red-100 text-red-700',
  TRAFFIC: 'bg-amber-100 text-amber-700',
  PUBLIC_NUISANCE: 'bg-violet-100 text-violet-700',
  DARK_SPOT: 'bg-primary/10 text-primary',
  THEFT: 'bg-rose-100 text-rose-700',
  OTHER: 'bg-slate-100 text-slate-700'
};

function getRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function IncidentCard({ incident }: { incident: Incident }): JSX.Element {
  const { t } = useTranslation();
  const { role } = useAuthStore();
  const updateIncident = useIncidentStore((state) => state.updateIncident);
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);

  const isAdmin = role === 'admin';

  const handleResolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    
    setResolving(true);
    try {
      await resolveIncident(incident.id);
      updateIncident(incident.id, { 
        status: 'RESOLVED',
        timeline: [
          ...incident.timeline,
          { 
            status: 'RESOLVED', 
            timestamp: new Date().toISOString(), 
            label: 'Incident Resolved by Admin' 
          }
        ]
      });
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    } finally {
      setResolving(false);
    }
  };
  const Icon = iconMap[incident.type];
  const translatedType = useMemo(() => {
    if (incident.type === 'SOS') return t('nav.sos');
    return t(`violation.types.${incident.type}`);
  }, [incident.type, t]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setExpanded((c) => !c)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded((c) => !c);
        }
      }}
      className="w-full border-b border-slate-200 bg-white px-4 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colorMap[incident.type]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-foreground">{translatedType}</p>
                {/* AI Validation Badge */}
                {incident.validationStatus === 'VALID' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
                {incident.validationStatus === 'INVALID' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    <XCircle size={10} /> Rejected
                  </span>
                )}
                {incident.validationStatus === 'PENDING' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    <Clock size={10} /> Pending
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-sm text-slate-600">{incident.description || incident.title}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge status={incident.status} />
              <span className="text-sm text-slate-500">{getRelativeTime(incident.createdAt)}</span>
            </div>
          </div>
          <p className="mt-2 font-mono text-sm text-slate-500">{incident.id}</p>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 rounded-2xl bg-slate-50 p-4">
              {/* Coordinates */}
              <div>
                <p className="text-sm font-semibold text-slate-700">{t('history.coords')}</p>
                <p className="font-mono text-sm text-slate-600">
                  {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                </p>
              </div>

              {/* Media */}
              {incident.media?.[0]?.url ? (
                <img src={incident.media[0].url} alt={incident.title} className="h-40 w-full rounded-xl object-cover" />
              ) : null}

              {/* AI Validation Details */}
              {incident.validationStatus && incident.validationStatus !== 'PENDING' && (
                <div className={`rounded-xl p-4 ${
                  incident.validationStatus === 'VALID' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {incident.validationStatus === 'VALID' ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : (
                      <XCircle size={18} className="text-red-600" />
                    )}
                    <span className={`text-sm font-bold ${
                      incident.validationStatus === 'VALID' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      AI Confidence: {incident.validationConfidence ?? 0}%
                    </span>
                  </div>
                  {incident.validationReason && (
                    <p className="text-xs text-slate-600">{incident.validationReason}</p>
                  )}
                </div>
              )}

              {/* Reward display for VALID reports */}
              {incident.validationStatus === 'VALID' && incident.rewardLabel && (
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                  <Gift size={22} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">🎁 Reward</p>
                    <p className="text-sm font-bold">{incident.rewardLabel}</p>
                    {incident.rewardCode && (
                      <p className="text-xs opacity-80">Code: <code className="font-mono font-bold">{incident.rewardCode}</code></p>
                    )}
                  </div>
                </div>
              )}

              {/* Penalty warning for INVALID reports */}
              {incident.validationStatus === 'INVALID' && (
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 p-4 text-white">
                  <AlertTriangle size={22} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">⚠️ Warning</p>
                    <p className="text-sm font-semibold">False reporting may lead to penalties</p>
                    <p className="text-xs opacity-80">Repeated violations may result in a ₹500 fine under Section 182 IPC.</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-sm font-semibold text-slate-700">{t('history.timeline')}</p>
                <div className="mt-2 space-y-2">
                  {incident.timeline.map((entry) => (
                    <div key={`${entry.status}-${entry.timestamp}`} className="flex items-center justify-between text-sm text-slate-600">
                      <span>{entry.label}</span>
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHA-256 hash */}
              {incident.sha256 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-700">{t('history.hash')}</p>
                  <p className="break-all font-mono text-sm text-slate-600">{incident.sha256}</p>
                </div>
              ) : null}

              {/* Admin Actions */}
              {(isAdmin || true) && (
                <div className="pt-4 mt-2 border-t border-slate-200/50 flex flex-col gap-2">
                  {isAdmin && incident.status !== 'RESOLVED' && (
                    <button
                      onClick={handleResolve}
                      disabled={resolving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
                    >
                      {resolving ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      Mark as Resolved
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useIncidentStore.getState().deleteIncident(incident.id);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 size={16} />
                    Clear Report
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
