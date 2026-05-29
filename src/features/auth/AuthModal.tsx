import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Eye, EyeOff, Shield, X, Zap } from 'lucide-react';

import { useAuthStore } from '@/features/auth/authStore';
import { clearSessionData } from '@/features/auth/sessionData';
import { useProfileStore } from '@/features/profile/profileStore';
import { ApiError, apiRequest } from '@/lib/api';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    pictureUrl?: string | null;
    emailVerified?: boolean;
  };
  verificationToken?: string;
  emailDelivery?: 'sent' | 'dev';
};

type TokenResponse = {
  message: string;
  resetToken?: string;
  emailDelivery?: 'sent' | 'dev';
};

type AuthModalProps = {
  initialMode?: AuthMode;
  initialResetToken?: string;
};

export default function AuthModal({
  initialMode = 'login',
  initialResetToken = '',
}: AuthModalProps) {
  const { t } = useTranslation();
  const { closeAuthModal, setSession } = useAuthStore();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setResetToken(initialResetToken);
  }, [initialMode, initialResetToken]);

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

  function completeAuth(response: AuthResponse, redirectMode: AuthMode) {
    const currentUser = useAuthStore.getState().user;
    const { profile } = useProfileStore.getState();
    const isDifferentStoredUser = currentUser !== null && currentUser.id !== response.user.id;
    const isDifferentProfile = profile !== null && profile.userId !== response.user.id;
    if (isDifferentStoredUser || isDifferentProfile) clearSessionData();

    setSession({
      token: response.token,
      user: {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        picture: response.user.pictureUrl ?? undefined,
        emailVerified: response.user.emailVerified,
      },
    });
    closeAuthModal();
    navigate(redirectMode === 'register' ? '/onboarding' : '/app/dashboard');
  }

  async function submitEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await apiRequest<AuthResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...(mode === 'register' ? { name } : {}),
          email,
          password,
        }),
      });

      if (response.verificationToken) {
        setNotice(t('auth.verifyEmailDev', { token: response.verificationToken }));
      }

      completeAuth(response, mode);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : t('auth.networkError', 'Could not connect to the server');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const response = await apiRequest<TokenResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setNotice(t('auth.resetTokenDev', { token: response.resetToken }));
        setMode('reset');
      } else if (response.emailDelivery === 'sent') {
        setResetToken('');
        setNotice(t('auth.resetEmailSent', 'Check your email for the reset token.'));
        setMode('reset');
      } else {
        setNotice(response.message);
      }
      setPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.networkError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const response = await apiRequest<TokenResponse>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, password }),
      });
      setNotice(response.message);
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.networkError'));
    } finally {
      setSubmitting(false);
    }
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

      <div className="app-card relative z-10 flex w-full max-w-sm flex-col items-center p-8 text-center shadow-2xl animate-in zoom-in-95 fade-in duration-200">
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
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
          {t('auth.subtitle', 'Track your workouts, save your progress, and unlock AI coaching.')}
        </p>

        {mode !== 'forgot' && mode !== 'reset' && (
          <div className="grid grid-cols-2 w-full p-1 bg-muted rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setNotice(null);
              }}
              className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.loginTab', 'Log in')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setNotice(null);
              }}
              className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.registerTab', 'Sign up')}
            </button>
          </div>
        )}

        {mode !== 'forgot' && mode !== 'reset' && (
          <form onSubmit={submitEmailAuth} className="w-full flex flex-col gap-3 text-left">
            {mode === 'register' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('auth.nameLabel', 'Name')}
                </span>
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  required
                  minLength={2}
                  autoComplete="name"
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-emerald-500"
                />
              </label>
            )}

            <EmailInput email={email} setEmail={setEmail} />

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t('auth.passwordLabel', 'Password')}
              </span>
              <div className="relative">
                <input
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-11 text-sm text-foreground outline-none focus:border-emerald-500"
                />
                <PasswordToggle
                  shown={showPassword}
                  onClick={() => setShowPassword(value => !value)}
                />
              </div>
            </label>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setNotice(null);
                }}
                className="self-end text-xs font-semibold text-emerald-500 hover:text-emerald-400"
              >
                {t('auth.forgotPassword')}
              </button>
            )}

            {notice && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
                {notice}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="app-primary-action h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? t('auth.submitting', 'Please wait...')
                : mode === 'login'
                  ? t('auth.loginAction', 'Log in')
                  : t('auth.registerAction', 'Create account')}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={submitForgotPassword} className="w-full flex flex-col gap-3 text-left">
            <EmailInput email={email} setEmail={setEmail} />
            {notice && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
                {notice}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="app-primary-action h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? t('auth.submitting') : t('auth.sendReset')}
            </button>
            <BackToLogin setMode={setMode} setError={setError} setNotice={setNotice} />
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={submitResetPassword} className="w-full flex flex-col gap-3 text-left">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t('auth.resetTokenLabel')}
              </span>
              <input
                value={resetToken}
                onChange={event => setResetToken(event.target.value)}
                required
                autoComplete="one-time-code"
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-emerald-500"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t('auth.newPasswordLabel')}
              </span>
              <div className="relative">
                <input
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                  minLength={8}
                  type={showResetPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-11 text-sm text-foreground outline-none focus:border-emerald-500"
                />
                <PasswordToggle
                  shown={showResetPassword}
                  onClick={() => setShowResetPassword(value => !value)}
                />
              </div>
            </label>
            {notice && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
                {notice}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="app-primary-action h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? t('auth.submitting') : t('auth.resetPassword')}
            </button>
            <BackToLogin setMode={setMode} setError={setError} setNotice={setNotice} />
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

function EmailInput({ email, setEmail }: { email: string; setEmail: (email: string) => void }) {
  const { t } = useTranslation();
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {t('auth.emailLabel', 'Email')}
      </span>
      <input
        value={email}
        onChange={event => setEmail(event.target.value)}
        required
        type="email"
        autoComplete="email"
        className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-emerald-500"
      />
    </label>
  );
}

function PasswordToggle({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shown ? t('auth.hidePassword') : t('auth.showPassword')}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function BackToLogin({
  setMode,
  setError,
  setNotice,
}: {
  setMode: (mode: AuthMode) => void;
  setError: (message: string | null) => void;
  setNotice: (message: string | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => {
        setMode('login');
        setError(null);
        setNotice(null);
      }}
      className="text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
    >
      {t('auth.backToLogin')}
    </button>
  );
}
