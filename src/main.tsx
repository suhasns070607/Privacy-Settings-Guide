import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AuthPage from './AuthPage';
import { getLocalSession, clearLocalSession } from './lib/localAuth';
import type { LocalSession } from './lib/localAuth';
import './styles.css';

function Root() {
  const [session, setSession] = useState<LocalSession | null>(() => getLocalSession());

  function handleLogin(s: LocalSession) {
    setSession(s);
  }

  function handleSignOut() {
    clearLocalSession();
    setSession(null);
  }

  if (!session) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <App session={session} onSignOut={handleSignOut} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
