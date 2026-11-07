/** Local demo auth — no Supabase Auth required.
 *  Rules: email must end with @gmail.com, password ≥ 8 chars.
 *  The session is stored in localStorage so the user stays logged in
 *  across page refreshes.
 */
const LOCAL_SESSION_KEY = 'psg-local-session';

export type LocalSession = {
  email: string;
  loginAt: number;
};

export function getLocalSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null;
  }
}

export function saveLocalSession(email: string): LocalSession {
  const session: LocalSession = { email, loginAt: Date.now() };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearLocalSession(): void {
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

