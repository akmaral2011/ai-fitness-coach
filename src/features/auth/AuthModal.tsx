import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Shield, X, Zap } from 'lucide-react';

import { useAuthStore } from '@/features/auth/authStore';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function buildGoogleOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
    redirect_uri: window.location.origin + '/',
    response_type: 'token',
    scope: 'openid profile email',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export default function AuthModal() {
  const { t } = useTranslation();
  const { closeAuthModal } = useAuthStore();
  const overlayRef = useRef<HTMLDivElement>(null);

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

      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
        <button
          onClick={closeAuthModal}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-5">
          <Zap className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          {t('auth.title', 'Sign in to AI Fitness Coach')}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
          {t('auth.subtitle', 'Track your workouts, save your progress, and unlock AI coaching.')}
        </p>

        <div className="w-full mb-6">
          <a
            href={buildGoogleOAuthUrl()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
          {t('auth.privacy', 'We never share your data. Video stays on your device.')}
        </div>
      </div>
    </div>
  );
}
