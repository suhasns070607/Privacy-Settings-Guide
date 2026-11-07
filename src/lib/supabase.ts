import { createClient } from '@supabase/supabase-js';
import { getBrowserId } from './browserId';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof document !== 'undefined') {
  const renderConfigError = () => {
    const root = document.getElementById('root');
    const container = document.createElement('div');
    container.style.cssText =
      'display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;padding:24px;background:#f8fafc;color:#0f172a;';
    container.innerHTML = `
      <div style="max-width:480px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);text-align:center;">
        <h2 style="margin:0 0 12px 0;font-size:1.25rem;font-weight:600;color:#dc2626;">Supabase is not configured</h2>
        <p style="margin:0;font-size:0.95rem;line-height:1.5;color:#475569;">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>
        </p>
      </div>
    `;
    if (root) {
      root.replaceChildren(container);
    } else {
      document.body.appendChild(container);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderConfigError);
  } else {
    setTimeout(renderConfigError, 0);
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    global: { headers: { 'x-browser-id': getBrowserId() } },
  }
);
