import { FormEvent, useState } from 'react';
import { saveLocalSession } from './lib/localAuth';
import type { LocalSession } from './lib/localAuth';

function validateEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return 'Email is required.';
  if (!trimmed.endsWith('@gmail.com')) return 'Only @gmail.com addresses are allowed.';
  if (trimmed.length < 11) return 'Enter a valid Gmail address (e.g. yourname@gmail.com).';
  return '';
}

function validatePassword(password: string): string {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return '';
}

type Props = { onLogin: (session: LocalSession) => void };

export default function AuthPage({ onLogin }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function switchMode(next: 'signin' | 'signup') {
    setMode(next);
    setEmailError('');
    setPasswordError('');
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    // Small artificial delay so it feels like a real login
    setTimeout(() => {
      const session = saveLocalSession(email.trim().toLowerCase());
      setLoading(false);
      onLogin(session);
    }, 600);
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-icon">🛡</span>
          <div>
            <h1 className="auth-title">Privacy Settings Guide</h1>
            <p className="auth-subtitle">Track and review your privacy settings across all services.</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'signin'}
            className={`auth-tab${mode === 'signin' ? ' active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label htmlFor="auth-email">Gmail address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉</span>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                aria-invalid={!!emailError}
                className={emailError ? 'has-error' : ''}
              />
            </div>
            {emailError
              ? <p className="field-err" role="alert">{emailError}</p>
              : <p className="field-hint">Only @gmail.com addresses are accepted.</p>
            }
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                aria-invalid={!!passwordError}
                className={passwordError ? 'has-error' : ''}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {passwordError
              ? <p className="field-err" role="alert">{passwordError}</p>
              : <p className="field-hint">Minimum 8 characters.</p>
            }
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
              : (mode === 'signup' ? 'Create account' : 'Sign in')
            }
          </button>
        </form>

        <p className="auth-switch-hint">
          {mode === 'signin'
            ? <>Don't have an account? <button className="auth-link-btn" onClick={() => switchMode('signup')}>Create one</button></>
            : <>Already have an account? <button className="auth-link-btn" onClick={() => switchMode('signin')}>Sign in</button></>
          }
        </p>
      </div>

      <p className="auth-footer-note">
        Your checklist is tied to this browser. Clearing site data starts a fresh checklist.
        This app stores only your own notes and never connects to your accounts.
      </p>
    </div>
  );
}
