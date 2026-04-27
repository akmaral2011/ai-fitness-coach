import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Mail, Shield, X, Zap } from 'lucide-react';

import { useAuthStore } from '@/features/auth/authStore';

export default function AuthModal() {
  const { t } = useTranslation();
  const { closeAuthModal, setUser } = useAuthStore();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [closeAuthModal]);

  useEffect(() => {
    function initGoogleButton() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (!g?.accounts?.id || !btnRef.current) return false;

      g.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        callback: (response: { credential: string }) => {
          try {
            const b64 = response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(b64));
            setUser({
              id: payload.sub as string,
              name: (payload.name ?? payload.email) as string,
              email: payload.email as string,
              picture: payload.picture as string | undefined,
            });
            closeAuthModal();
            navigate('/app/dashboard');
          } catch {
            console.error('Failed to decode Google credential');
          }
        },
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      g.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: btnRef.current.offsetWidth || 300,
        logo_alignment: 'center',
      });

      setGoogleLoaded(true);
      return true;
    }

    if (!initGoogleButton()) {
      const interval = setInterval(() => {
        if (initGoogleButton()) clearInterval(interval);
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setShowEmail(true);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [closeAuthModal, navigate, setUser]);

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError(t('auth.emailError', 'Введите корректный email'));
      return;
    }
    const name = trimmed.split('@')[0];
    setUser({
      id: `email_${trimmed}`,
      name,
      email: trimmed,
      picture: undefined,
    });
    closeAuthModal();
    navigate('/app/dashboard');
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="presentation"
      onClick={e => {
        if (e.target === overlayRef.current) closeAuthModal();
      }}
      onKeyDown={e => {
        if (e.key === 'Escape') closeAuthModal();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        <button
          onClick={closeAuthModal}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 sm:mb-5">
          <Zap className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
          {t('auth.title', 'Sign in to AI Fitness Coach')}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5 sm:mb-6 max-w-xs">
          {t('auth.subtitle', 'Track your workouts, save your progress, and unlock AI coaching.')}
        </p>

        {/* Google button */}
        <div ref={btnRef} className="w-full flex justify-center min-h-11" />

        {/* divider */}
        {(googleLoaded || showEmail) && (
          <div className="w-full flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">{t('auth.or', 'или')}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* Email form */}
        {(googleLoaded || showEmail) && !showEmail ? (
          <button
            onClick={() => setShowEmail(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4" />
            {t('auth.continueEmail', 'Продолжить с email')}
          </button>
        ) : null}

        {showEmail && (
          <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
              />
            </div>
            {emailError && <p className="text-red-500 text-xs text-left">{emailError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
            >
              {t('auth.continueBtn', 'Продолжить')}
            </button>
            {googleLoaded && (
              <button
                type="button"
                onClick={() => setShowEmail(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('auth.backToGoogle', '← Войти через Google')}
              </button>
            )}
          </form>
        )}

        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-5">
          <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
          {t('auth.privacy', 'We never share your data. Video stays on your device.')}
        </div>
      </div>
    </div>
  );
}
