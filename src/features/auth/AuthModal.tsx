import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { type CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { Shield, X, Zap } from 'lucide-react';

import { type AuthUser, useAuthStore } from '@/features/auth/authStore';

function decodeGoogleJwt(credential: string): AuthUser {
  const payload = JSON.parse(atob(credential.split('.')[1]));
  return {
    id: payload.sub as string,
    name: (payload.name ?? payload.email) as string,
    email: payload.email as string,
    picture: payload.picture as string | undefined,
  };
}

export default function AuthModal() {
  const { t } = useTranslation();
  const { setUser, closeAuthModal } = useAuthStore();
  const navigate = useNavigate();
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

  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) return;
    setUser(decodeGoogleJwt(response.credential));
    closeAuthModal();
    navigate('/app/dashboard');
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
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

        <div className="w-full flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error('Google sign-in failed')}
            useOneTap={false}
            shape="rectangular"
            size="large"
            width="280"
            theme="outline"
          />
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
          {t('auth.privacy', 'We never share your data. Video stays on your device.')}
        </div>
      </div>
    </div>
  );
}
