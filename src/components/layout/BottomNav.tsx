import { Eye, FileText, FolderClock, Home, Map, Navigation, Siren } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIncidentStore } from '../../store/incident.store';

const items = [
  { to: '/home', labelKey: 'nav.home', icon: Home },
  { to: '/sos', labelKey: 'nav.sos', icon: Siren },
  { to: '/report', labelKey: 'nav.report', icon: FileText },
  { to: '/map', labelKey: 'nav.map', icon: Map },
  { to: '/routes', labelKey: 'nav.routes', icon: Navigation },
  { to: '/cctv', labelKey: 'nav.cctv', icon: Eye },
  { to: '/history', labelKey: 'nav.history', icon: FolderClock }
] as const;

export function BottomNav(): JSX.Element {
  const { t } = useTranslation();
  const pendingCount = useIncidentStore((state) =>
    state.recentReports.filter((incident) => incident.status === 'PENDING' || incident.status === 'CRITICAL').length
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-7">
        {items.map((item) => {
          const Icon = item.icon;
          const isSos = item.to === '/sos';

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                  isActive ? 'text-secondary' : 'text-slate-500'
                ].join(' ')
              }
            >
              <Icon className={`${isSos ? 'h-6 w-6 text-accent' : 'h-5 w-5'}`} />
              <span>{t(item.labelKey)}</span>
              {item.to === '/history' && pendingCount > 0 ? (
                <span className="absolute right-5 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                  {pendingCount}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
