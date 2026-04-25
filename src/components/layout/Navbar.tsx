import { Languages, ShieldCheck, UserCircle2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिंदी' }
] as const;

export function Navbar(): JSX.Element {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isAdmin = role === 'admin';

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary/95 px-4 py-3 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">{t('common.app_name')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-2xl bg-white/10 p-1">
            <Languages className="ml-2 h-4 w-4 text-white/70" />
            {languages.map((language) => {
              const active = i18n.language === language.code;
              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => void i18n.changeLanguage(language.code)}
                  className={[
                    'min-h-12 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                    active ? 'bg-white text-primary' : 'text-white/80 hover:bg-white/10'
                  ].join(' ')}
                >
                  {language.label}
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin/inbox')}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              title="Admin Inbox"
            >
              <Mail className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-primary" />
            </button>
          )}

          <button
            type="button"
            onClick={() => useAuthStore.getState().clearAuth()}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-red-500/20 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Log out"
          >
            <UserCircle2 className="h-6 w-6" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
