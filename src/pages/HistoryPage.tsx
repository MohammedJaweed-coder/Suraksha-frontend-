import { FileSearch, ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IncidentCard } from '../components/IncidentCard';
import { Card } from '../components/ui/Card';
import { useIncidentStore } from '../store/incident.store';

const filters = ['ALL', 'SOS', 'VIOLATIONS', 'DARK_SPOT'] as const;

export default function HistoryPage(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const incidents = useIncidentStore((state) => state.recentReports);
  const [filter, setFilter] = useState<(typeof filters)[number]>('ALL');

  const filteredIncidents = useMemo(() => {
    switch (filter) {
      case 'SOS':
        return incidents.filter((incident) => incident.type === 'SOS');
      case 'VIOLATIONS':
        return incidents.filter((incident) => incident.type !== 'SOS' && incident.type !== 'DARK_SPOT');
      case 'DARK_SPOT':
        return incidents.filter((incident) => incident.type === 'DARK_SPOT');
      default:
        return incidents;
    }
  }, [filter, incidents]);

  const total = incidents.length;
  const resolved = incidents.filter((incident) => incident.status === 'RESOLVED').length;
  const pending = incidents.filter((incident) => incident.status === 'PENDING' || incident.status === 'CRITICAL').length;

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-6 relative">
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

      <div className="mx-auto max-w-4xl pt-16">
        <header className="rounded-3xl bg-primary px-6 py-5 text-white">
          <h1 className="text-2xl font-bold">{t('history.title')}</h1>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-3xl font-bold text-primary">{total}</p>
            <p className="mt-2 text-sm text-slate-600">{t('history.total')}</p>
          </Card>
          <Card className="border-green-200 p-5">
            <p className="text-3xl font-bold text-success">{resolved}</p>
            <p className="mt-2 text-sm text-slate-600">{t('history.resolved')}</p>
          </Card>
          <Card className="border-amber-200 p-5">
            <p className="text-3xl font-bold text-amber-600">{pending}</p>
            <p className="mt-2 text-sm text-slate-600">{t('history.pending')}</p>
          </Card>
        </section>

        <div className="mt-6 flex gap-6 border-b border-slate-200">
          {filters.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`min-h-12 border-b-2 px-1 text-sm font-semibold ${filter === tab ? 'border-secondary text-secondary' : 'border-transparent text-slate-500'}`}
            >
              {tab === 'ALL'
                ? t('history.all')
                : tab === 'SOS'
                  ? t('nav.sos')
                  : tab === 'VIOLATIONS'
                    ? t('history.violations')
                    : t('history.dark_spots')}
            </button>
          ))}
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => <IncidentCard key={incident.id} incident={incident} />)
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileSearch className="h-8 w-8" />
              </div>
              <p className="mt-4 max-w-sm text-sm text-slate-600">{t('history.empty')}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
