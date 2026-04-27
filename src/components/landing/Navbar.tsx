import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { LogOut, Menu, X, Zap } from 'lucide-react';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import UserAvatar from '@/components/UserAvatar';
import { useAuthStore } from '@/features/auth/authStore';
import { cn } from '@/lib/utils';

function UserMenu() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
        aria-label="User menu"
      >
        <UserAvatar
          picture={user.picture}
          name={user.name}
          className="w-7 h-7 ring-2 ring-emerald-500/40"
          textClassName="text-xs"
        />
        <span className="text-foreground text-sm font-medium hidden lg:block max-w-30 truncate">
          {user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-foreground text-sm font-semibold truncate">{user.name}</div>
            <div className="text-muted-foreground text-xs truncate">{user.email}</div>
          </div>
          <div className="p-1">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              <LogOut className="w-4 h-4" />
              {t('profile.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user, openAuthModal } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: t('landing.nav.features'), href: '#features' },
    { label: t('landing.nav.howItWorks'), href: '#how-it-works' },
    { label: t('landing.nav.pricing'), href: '#pricing' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border/60 shadow-lg shadow-black/10'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:bg-emerald-400 transition-colors">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">AI Fitness Coach</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <>
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-sm font-semibold transition-colors"
              >
                {t('landing.nav.openApp')}
              </button>
              <UserMenu />
            </>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
            >
              {t('landing.nav.getStarted')}
            </button>
          )}
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-b border-border px-6 py-4 flex flex-col gap-4">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-foreground/80 hover:text-foreground text-base font-medium transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <UserAvatar
                    picture={user.picture}
                    name={user.name}
                    className="w-7 h-7"
                    textClassName="text-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground text-sm font-medium truncate">{user.name}</div>
                    <div className="text-muted-foreground text-xs truncate">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/app/dashboard');
                    }}
                    className="flex-1 text-center px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-sm font-semibold transition-colors"
                  >
                    {t('landing.nav.openApp')}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      useAuthStore.getState().signOut();
                    }}
                    className="text-red-500 text-sm hover:underline"
                  >
                    {t('profile.signOut')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openAuthModal();
                }}
                className="flex-1 text-center px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"
              >
                {t('landing.nav.getStarted')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
