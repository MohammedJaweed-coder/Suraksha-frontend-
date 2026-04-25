/**
 * ReportPage — Enhanced with Video Upload + AI Validation
 *
 * Supports image capture (camera), video upload (file picker),
 * and runs AI validation simulation after submission.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Camera,
  CheckCircle2,
  FileVideo,
  MapPin,
  RotateCcw,
  Upload,
  X,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useCamera } from '../hooks/useCamera';
import { useGeolocation } from '../hooks/useGeolocation';
import { postViolation, postReport } from '../lib/incidents.api';
import { simulateAIValidation, generateReward, generatePenalty } from '../lib/validation';
import { useAuthStore } from '../store/auth.store';
import { useIncidentStore } from '../store/incident.store';
import type { Incident, ViolationPayload } from '../types';

const schema = z.object({
  type: z.enum(['TRAFFIC', 'PUBLIC_NUISANCE', 'DARK_SPOT', 'THEFT', 'OTHER']),
  description: z.string().max(500).optional()
});

type FormValues = z.infer<typeof schema>;

// Max video size: 50MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

function buildFallbackIncident(id: string, payload: ViolationPayload): Incident {
  const now = new Date().toISOString();
  return {
    id,
    type: payload.type,
    title: payload.type,
    description: payload.description,
    status: 'PENDING',
    latitude: payload.latitude,
    longitude: payload.longitude,
    createdAt: now,
    updatedAt: now,
    source: 'offline',
    validationStatus: 'PENDING',
    media: [{
      id: `${id}-media`,
      name: 'offline-capture',
      mimeType: 'image/jpeg',
      size: payload.media.size,
      url: URL.createObjectURL(payload.media)
    }],
    timeline: [{ status: 'PENDING', timestamp: now, label: 'Queued offline' }]
  };
}

export default function ReportPage(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { latitude, longitude } = useGeolocation();
  const { videoRef, capture, clearCapture, capturedBlob, error: cameraError } = useCamera({ mode: 'photo' });
  const { deviceId, email } = useAuthStore();
  const addIncident = useIncidentStore((state) => state.addIncident);
  const updateIncident = useIncidentStore((state) => state.updateIncident);
  const pushToast = useIncidentStore((state) => state.pushToast);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [now, setNow] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  // Video upload state
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // AI Validation state
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'VALID' | 'INVALID';
    confidence: number;
    reason: string;
    reward?: { label: string; value: string };
    penalty?: { label: string; description: string };
  } | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!capturedBlob) return;
    const url = URL.createObjectURL(capturedBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [capturedBlob]);

  useEffect(() => {
    async function fetchAddress(): Promise<void> {
      if (latitude == null || longitude == null) return;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = (await response.json()) as { display_name?: string };
        setAddress(data.display_name ?? 'Bengaluru');
      } catch {
        setAddress('Bengaluru');
      }
    }
    void fetchAddress();
  }, [latitude, longitude]);

  const currentCoords = useMemo(() => {
    if (latitude == null || longitude == null) return 'Locating...';
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }, [latitude, longitude]);

  const selectedType = watch('type');

  // ─── Video Upload Handlers ─────────────────────────────────────────

  function handleVideoFile(file: File): void {
    setVideoError(null);

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setVideoError('Only MP4 and WebM formats are accepted.');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setVideoError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 50MB.`);
      return;
    }

    setUploadedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    // Clear camera capture if video is uploaded
    clearCapture();
    setPreviewUrl(null);
  }

  function clearVideo(): void {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setUploadedVideo(null);
    setVideoPreviewUrl(null);
    setVideoError(null);
  }

  // Determine what media we have
  const hasMedia = Boolean(capturedBlob || uploadedVideo);
  const mediaType = uploadedVideo ? 'video' : capturedBlob ? 'image' : undefined;

  // ─── Submit + AI Validation ────────────────────────────────────────

  const onSubmit = handleSubmit(async (values) => {
    const media = uploadedVideo ?? capturedBlob;
    if (!media) {
      pushToast({ id: crypto.randomUUID(), variant: 'error', message: t('violation.validation_photo') });
      return;
    }

    const payload: ViolationPayload = {
      type: values.type,
      description: values.description,
      latitude: latitude ?? Number(import.meta.env.VITE_DEFAULT_LAT),
      longitude: longitude ?? Number(import.meta.env.VITE_DEFAULT_LNG),
      media: media instanceof File ? media : media,
      deviceId,
      address,
      capturedAt: new Date().toISOString()
    };

    setSubmitting(true);
    let incidentId: string;

    try {
      const incident = await postViolation(payload);
      incident.validationStatus = 'PENDING';
      addIncident(incident);
      incidentId = incident.id;

      // STEP: Trigger Email Notification via Backend
      try {
        await postReport({
          email: email || "anonymous@suraksha.ai",
          location: address || currentCoords,
          description: values.description || `Incident Type: ${values.type}`,
          mediaUrl: "evidence_captured_locally" // Since we send file in multipart, this is a placeholder
        });
        pushToast({
          id: crypto.randomUUID(),
          variant: 'success',
          message: "✅ Report submitted successfully. Authorities have been notified."
        });
      } catch (err) {
        console.error("Email notification trigger failed", err);
        pushToast({
          id: crypto.randomUUID(),
          variant: 'error',
          message: "❌ Failed to trigger notification. Report saved locally."
        });
      }

    } catch (error) {
      console.error("Submission failed", error);
      incidentId = crypto.randomUUID();
      addIncident(buildFallbackIncident(incidentId, payload));
      pushToast({
        id: crypto.randomUUID(),
        variant: 'error',
        message: "❌ Failed to submit report. Try again."
      });
    } finally {
      setSubmitting(false);
    }

    // Start AI validation
    setValidating(true);
    setValidationResult(null);

    try {
      const result = await simulateAIValidation({
        hasMedia: true,
        mediaType: mediaType as 'image' | 'video' | 'audio' | undefined,
        descriptionLength: values.description?.length ?? 0,
        hasLocation: latitude != null,
        incidentType: values.type
      });

      const reward = result.status === 'VALID' ? generateReward(values.type) : undefined;
      const penalty = result.status === 'INVALID' ? generatePenalty() : undefined;

      // Update the incident with validation results
      updateIncident(incidentId, {
        validationStatus: result.status,
        validationConfidence: result.confidence,
        validationReason: result.reason,
        rewardCode: reward?.value,
        rewardLabel: reward?.label
      });

      setValidationResult({
        status: result.status as 'VALID' | 'INVALID',
        confidence: result.confidence,
        reason: result.reason,
        reward: reward ? { label: reward.label, value: reward.value } : undefined,
        penalty: penalty ? { label: penalty.label, description: penalty.description } : undefined
      });

      pushToast({
        id: crypto.randomUUID(),
        variant: result.status === 'VALID' ? 'success' : 'error',
        message: result.status === 'VALID'
          ? `✅ Report verified! ${reward?.label ?? ''}`
          : '⚠️ Report flagged for review.'
      });
    } catch {
      // Validation failed silently
    } finally {
      setValidating(false);
    }

    reset();
    clearCapture();
    setPreviewUrl(null);
    clearVideo();
  });

  function dismissValidation(): void {
    setValidationResult(null);
  }

  return (
    <main className="min-h-screen bg-background pb-24 relative">
      {/* ── Home Button ── */}
      <div className="absolute top-4 left-4 z-[600]">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border border-white/10 text-white rounded-xl shadow-xl hover:bg-slate-800 transition-all group active:scale-95"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm text-white">Home</span>
        </button>
      </div>

      <section className="bg-primary px-4 py-6 pt-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">{t('violation.title')}</h1>
          <p className="mt-2 text-sm text-white/75">{address || t('violation.address_loading')}</p>
        </div>
      </section>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">

        {/* ── Camera Capture Card ── */}
        <Card className="p-4">
          <div className="relative overflow-hidden rounded-xl bg-slate-900">
            {previewUrl ? (
              <img src={previewUrl} alt="Captured evidence" className="aspect-video w-full object-cover" />
            ) : videoPreviewUrl ? (
              <video src={videoPreviewUrl} controls className="aspect-video w-full object-cover rounded-xl" />
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 text-white">
              <div className="font-mono text-sm">{now.toLocaleString()}</div>
              <div className="flex items-end justify-between font-mono text-sm">
                <span>{currentCoords}</span>
                <span className="animate-pulse text-red-400">● REC</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            {previewUrl || videoPreviewUrl ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearCapture();
                    setPreviewUrl(null);
                    clearVideo();
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('violation.retake')}
                </Button>
                <Button onClick={() => {}}>{t('violation.use_photo')}</Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Camera capture button */}
                <button
                  type="button"
                  onClick={() => void capture()}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  title="Capture Photo"
                >
                  <Camera className="h-7 w-7 text-primary" />
                </button>
                {/* Video upload button */}
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20 text-secondary transition hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  title="Upload Video"
                >
                  <FileVideo className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>

          {cameraError ? <p className="mt-3 text-sm text-accent">{cameraError}</p> : null}

          {/* Hidden file input */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoFile(file);
            }}
          />
        </Card>

        {/* ── Video Drag & Drop Zone ── */}
        <Card
          className={`relative border-2 border-dashed p-6 text-center transition-all ${
            dragOver
              ? 'border-secondary bg-secondary/5'
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleVideoFile(file);
          }}
        >
          <Upload className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Drag & drop video evidence here
          </p>
          <p className="mt-1 text-xs text-slate-500">MP4 or WebM • Max 50MB</p>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="mt-3 rounded-lg bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary/20"
          >
            Browse Files
          </button>

          {videoError && (
            <p className="mt-3 text-sm font-medium text-red-500">{videoError}</p>
          )}

          {uploadedVideo && (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-green-50 px-4 py-3">
              <FileVideo className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">{uploadedVideo.name}</span>
              <span className="text-xs text-green-500">({(uploadedVideo.size / 1024 / 1024).toFixed(1)} MB)</span>
              <button type="button" onClick={clearVideo} className="ml-2 text-red-400 hover:text-red-600">
                <X size={16} />
              </button>
            </div>
          )}
        </Card>

        {/* ── Form Card ── */}
        <Card className="p-4">
          <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t('violation.type_label')}</label>
              <select
                {...register('type')}
                className="min-h-12 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                defaultValue=""
              >
                <option value="" disabled>{t('violation.type_label')}</option>
                <option value="TRAFFIC">🚗 {t('violation.types.TRAFFIC')}</option>
                <option value="PUBLIC_NUISANCE">📢 {t('violation.types.PUBLIC_NUISANCE')}</option>
                <option value="DARK_SPOT">💡 {t('violation.types.DARK_SPOT')}</option>
                <option value="THEFT">👜 {t('violation.types.THEFT')}</option>
                <option value="OTHER">❓ {t('violation.types.OTHER')}</option>
              </select>
              {errors.type ? <p className="mt-1 text-sm text-accent">{t('violation.validation_type')}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t('violation.description')}</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder={t('violation.description_placeholder')}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-success">
              <MapPin className="h-4 w-4" />
              <span>📍 {t('violation.location_tagged')}</span>
            </div>

            <Button type="submit" fullWidth disabled={!hasMedia || !selectedType || submitting} className="gap-3">
              {submitting ? <Spinner /> : null}
              <span>{t('violation.submit')}</span>
            </Button>
          </form>
        </Card>

        {/* ── AI Validation Overlay ── */}
        <AnimatePresence>
          {validating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="mx-4 max-w-sm rounded-3xl border border-secondary/30 bg-slate-900 p-8 text-center shadow-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20"
                >
                  <BrainCircuit size={36} className="text-secondary" />
                </motion.div>
                <h3 className="text-xl font-bold text-white">AI Verifying Report...</h3>
                <p className="mt-2 text-sm text-slate-400">Analyzing evidence quality, location data, and description.</p>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-blue-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.5, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Validation Result Card ── */}
        <AnimatePresence>
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className={`relative overflow-hidden p-6 border-2 ${
                validationResult.status === 'VALID'
                  ? 'border-green-500/30 bg-green-50'
                  : 'border-red-500/30 bg-red-50'
              }`}>
                <button
                  type="button"
                  onClick={dismissValidation}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  {validationResult.status === 'VALID' ? (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/20">
                      <CheckCircle2 size={28} className="text-green-600" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20">
                      <XCircle size={28} className="text-red-600" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-lg font-bold ${validationResult.status === 'VALID' ? 'text-green-700' : 'text-red-700'}`}>
                      {validationResult.status === 'VALID' ? '✅ Report Verified' : '❌ Possibly False Report'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      AI Confidence: <strong>{validationResult.confidence}%</strong>
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">{validationResult.reason}</p>

                {/* Reward for valid reports */}
                {validationResult.reward && (
                  <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">🎁 Reward Earned</p>
                    <p className="mt-1 text-lg font-black">{validationResult.reward.label}</p>
                    <p className="mt-1 text-sm opacity-80">Coupon Code: <code className="font-mono font-bold">{validationResult.reward.value}</code></p>
                  </div>
                )}

                {/* Penalty for invalid reports */}
                {validationResult.penalty && (
                  <div className="rounded-xl bg-gradient-to-r from-red-500 to-orange-600 p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">⚠️ Warning</p>
                    <p className="mt-1 text-sm font-semibold">{validationResult.penalty.label}</p>
                    <p className="mt-1 text-xs opacity-80">{validationResult.penalty.description}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
