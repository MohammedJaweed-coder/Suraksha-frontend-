import { AnimatePresence, motion } from 'framer-motion';
import { BatteryCharging, CheckCircle2, ShieldAlert, MapPin, AlertTriangle, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { postSOS } from '../lib/incidents.api';
import { useCamera } from '../hooks/useCamera';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuthStore } from '../store/auth.store';
import { useIncidentStore } from '../store/incident.store';
import type { BatteryManagerLike, Incident } from '../types';

async function getBatteryLevel(): Promise<number> {
  try {
    const battery = (await navigator.getBattery?.()) as BatteryManagerLike | undefined;
    return battery ? Math.round(battery.level * 100) : 100;
  } catch {
    return 100;
  }
}

function buildFallbackIncident(id: string, latitude: number, longitude: number, batteryLevel: number): Incident {
  const now = new Date().toISOString();
  return {
    id,
    type: 'SOS',
    title: 'Emergency SOS',
    description: 'Offline SOS request queued for sync.',
    status: 'PENDING',
    latitude,
    longitude,
    createdAt: now,
    updatedAt: now,
    source: 'offline',
    batteryLevel,
    timeline: [{ status: 'PENDING', timestamp: now, label: 'Queued offline' }]
  };
}

export default function SOSPage(): JSX.Element {
  const navigate = useNavigate();
  const { latitude, longitude } = useGeolocation();
  const { capture } = useCamera({ mode: 'audio' });
  const { deviceId } = useAuthStore();
  const addIncident = useIncidentStore((state) => state.addIncident);
  const pushToast = useIncidentStore((state) => state.pushToast);
  
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'sending' | 'sent' | 'error'>('idle');
  const [seconds, setSeconds] = useState(3);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(100);

  useEffect(() => {
    void getBatteryLevel().then(setBatteryLevel);
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;

    if (seconds === 0) {
      void sendSOS();
      return;
    }

    const timer = window.setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, seconds]);

  const coordinateText = useMemo(() => {
    if (latitude == null || longitude == null) {
      return 'Acquiring GPS Signal...';
    }
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }, [latitude, longitude]);

  const reset = (): void => {
    setPhase('idle');
    setSeconds(3);
    setTrackingId(null);
  };

  const beginCountdown = (): void => {
    navigator.vibrate?.([200, 100, 200]);
    setPhase('countdown');
    setSeconds(3);
  };

  async function sendSOS(): Promise<void> {
    setPhase('sending');
    const lat = latitude ?? Number(import.meta.env.VITE_DEFAULT_LAT);
    const lng = longitude ?? Number(import.meta.env.VITE_DEFAULT_LNG);
    const latestBattery = await getBatteryLevel();
    setBatteryLevel(latestBattery);

    try {
      const audioClip = (await capture()) ?? new Blob([], { type: 'audio/webm' });
      const incident = await postSOS({
        audioClip,
        latitude: lat,
        longitude: lng,
        batteryLevel: latestBattery,
        deviceId
      });
      addIncident(incident);
      setTrackingId(incident.id);
      setPhase('sent');
      
      // Auto-reset after 5 seconds of success
      window.setTimeout(reset, 5000);
    } catch {
      // Offline fallback handling
      const offlineId = crypto.randomUUID();
      addIncident(buildFallbackIncident(offlineId, lat, lng, latestBattery));
      setTrackingId(offlineId);
      setPhase('sent'); // Show success even if offline (it's queued)
      pushToast({
        id: crypto.randomUUID(),
        variant: 'offline',
        message: 'Network unavailable. Request queued and will sync when online.'
      });
      
      window.setTimeout(reset, 5000);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-between bg-slate-950 px-4 py-6 text-white relative overflow-hidden">
      
      {/* ── Home Button ── */}
      <div className="absolute top-4 left-4 z-[600]">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border border-white/10 text-white rounded-xl shadow-xl hover:bg-slate-800 transition-all group active:scale-95"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Home</span>
        </button>
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse animation-delay-2000"></div>

      {/* Header */}
      <div className="flex w-full max-w-md items-center justify-between z-10 bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/50 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Emergency</h1>
          <p className="text-xs text-slate-400 mt-1">Immediate Assistance</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-950/50 px-2 py-1 rounded-md">
            <MapPin size={12} className={latitude ? "text-green-400" : "text-amber-400 animate-pulse"} />
            {coordinateText}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1 px-2 py-1">
            <BatteryCharging size={12} className={batteryLevel > 20 ? "text-green-400" : "text-red-400 animate-pulse"} />
            {batteryLevel}%
          </div>
        </div>
      </div>

      {/* Main SOS Area */}
      <div className="flex flex-1 flex-col items-center justify-center text-center w-full z-10">
        <AnimatePresence mode="wait">
          
          {/* SUCCESS STATE */}
          {phase === 'sent' ? (
            <motion.div 
              key="sent" 
              initial={{ scale: 0.85, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center bg-green-500/10 backdrop-blur-md p-8 rounded-3xl border border-green-500/30 w-full max-w-sm"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-6">
                <CheckCircle2 className="h-12 w-12 text-slate-950" />
              </div>
              <p className="text-2xl font-bold text-white mb-2">SOS Sent Successfully</p>
              <p className="text-sm text-green-200/80 mb-4">Help is being dispatched to your location.</p>
              {trackingId && (
                <div className="bg-black/20 px-4 py-2 rounded-lg border border-green-500/20">
                  <p className="text-xs text-green-400/70 mb-1 uppercase tracking-wider">Tracking ID</p>
                  <p className="font-mono text-sm text-white">{trackingId.split('-')[0]}</p>
                </div>
              )}
            </motion.div>
          ) : (
            
            /* IDLE, COUNTDOWN, OR SENDING STATE */
            <motion.div 
              key="interactive" 
              className="flex flex-col items-center justify-center h-full w-full max-w-sm"
            >
              <div className="relative flex items-center justify-center">
                
                {/* Ripple Effect Rings */}
                {phase === 'idle' && (
                  <>
                    <motion.div
                      className="absolute rounded-full border border-red-500/30"
                      initial={{ width: 220, height: 220, opacity: 0.8 }}
                      animate={{ width: 350, height: 350, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute rounded-full border border-red-500/20"
                      initial={{ width: 220, height: 220, opacity: 0.8 }}
                      animate={{ width: 450, height: 450, opacity: 0 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />
                  </>
                )}

                <motion.button
                  type="button"
                  layoutId="sos-button"
                  disabled={phase === 'sending'}
                  onClick={phase === 'idle' ? beginCountdown : undefined}
                  className={`
                    relative z-10 flex h-60 w-60 items-center justify-center rounded-full shadow-2xl transition-all duration-300
                    ${phase === 'countdown' ? 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_50px_rgba(245,158,11,0.6)]' : ''}
                    ${phase === 'idle' ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)] cursor-pointer' : ''}
                    ${phase === 'sending' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_50px_rgba(59,130,246,0.5)] cursor-not-allowed' : ''}
                  `}
                  whileTap={phase === 'idle' ? { scale: 0.95 } : {}}
                >
                  <div className="absolute inset-2 rounded-full border border-white/20"></div>
                  
                  {phase === 'countdown' ? (
                    <span className="text-8xl font-black text-white drop-shadow-lg">{seconds}</span>
                  ) : phase === 'sending' ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-lg font-bold text-white tracking-widest uppercase">Transmitting</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white">
                      <ShieldAlert className="h-20 w-20 drop-shadow-md" strokeWidth={1.5} />
                      <span className="text-4xl font-black tracking-wider drop-shadow-md uppercase">SOS</span>
                    </div>
                  )}
                </motion.button>
              </div>

              {/* Status Text & Actions */}
              <div className="mt-12 h-20">
                <AnimatePresence mode="wait">
                  {phase === 'idle' && (
                    <motion.p 
                      key="idle-text"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="text-slate-400 text-center px-6"
                    >
                      Press and hold to immediately dispatch emergency services to your location.
                    </motion.p>
                  )}
                  
                  {phase === 'countdown' && (
                    <motion.div 
                      key="countdown-action"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center"
                    >
                      <p className="text-amber-400 font-medium mb-4 animate-pulse">Release or tap cancel to abort</p>
                      <button
                        type="button"
                        onClick={reset}
                        className="flex items-center gap-2 rounded-full bg-slate-800 hover:bg-slate-700 px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors border border-slate-700"
                      >
                        <X size={18} />
                        CANCEL
                      </button>
                    </motion.div>
                  )}

                  {phase === 'sending' && (
                    <motion.div 
                      key="sending-text"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <p className="text-blue-400 font-medium animate-pulse">Establishing Secure Connection...</p>
                      <p className="text-xs text-slate-500">Encrypting location & audio data</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Security Footer Notice */}
      <div className="w-full text-center pb-4 z-10 flex items-center justify-center gap-2 text-slate-500 text-xs">
        <AlertTriangle size={14} />
        <span>False reporting is a punishable offense</span>
      </div>
    </main>
  );
}
