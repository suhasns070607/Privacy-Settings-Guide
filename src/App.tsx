import { FormEvent, useEffect, useMemo, useState } from 'react';
import { guidanceItems } from './guidance';
import { getBrowserId } from './lib/browserId';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { ReviewItem } from './types';
import type { LocalSession } from './lib/localAuth';

const today = new Date().toISOString().slice(0, 10);

type Filter = 'all' | 'todo' | 'done' | 'action' | 'overdue';

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${value}T12:00:00`)
  );
}

function isOverdue(item: ReviewItem): boolean {
  return !!item.review_date && item.review_date < today && item.status === 'todo';
}

function App({ session, onSignOut }: { session: LocalSession; onSignOut: () => void }) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customService, setCustomService] = useState('');
  const [customWhat, setCustomWhat] = useState('');
  const [customError, setCustomError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem('psg-help-dismissed'));
  const browserId = useMemo(() => getBrowserId(), []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    async function loadItems() {
      const { data, error: loadError } = await supabase
        .from('review_items')
        .select('*')
        .eq('browser_id', browserId)
        .order('updated_at', { ascending: false });
      if (loadError) setError('Could not load your checklist. Please refresh.');
      else setItems((data ?? []) as ReviewItem[]);
      setLoading(false);
    }
    void loadItems();
  }, [browserId]);

  if (!isSupabaseConfigured) {
    return (
      <div className="config-error">
        <div className="config-error-box">
          <span className="config-error-icon">⚠</span>
          <h2>Supabase is not configured</h2>
          <p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code></p>
        </div>
      </div>
    );
  }

  const reviewedCount = items.filter((i) => i.status === 'done').length;
  const totalCount = items.length;
  const progressPct = totalCount ? Math.round((reviewedCount / totalCount) * 100) : 0;
  const openActionsCount = items.filter((i) => i.status === 'todo' && i.action).length;
  const overdueCount = items.filter(isOverdue).length;

  const addedGuidanceIds = new Set(
    items.map((i) => i.details).filter(Boolean)
  );

  const visibleItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'todo') return item.status === 'todo';
    if (filter === 'done') return item.status === 'done';
    if (filter === 'action') return item.status === 'todo' && !!item.action;
    if (filter === 'overdue') return isOverdue(item);
    return true;
  });

  async function addGuidanceItem(guidanceId: string) {
    const guidance = guidanceItems.find((g) => g.id === guidanceId);
    if (!guidance) return;
    setSavingId(guidanceId);
    setError('');
    const payload = {
      browser_id: browserId,
      title: guidance.label,
      details: guidance.id,
      review_date: null,
      action: '',
      status: 'todo' as const,
    };
    const { data, error: insertError } = await supabase
      .from('review_items')
      .insert(payload)
      .select()
      .maybeSingle();
    if (insertError || !data) {
      setError('Could not add item. Please try again.');
    } else {
      setItems((current) => [data as ReviewItem, ...current]);
    }
    setSavingId(null);
  }

  async function addCustomItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customService.trim() && !customWhat.trim()) {
      setCustomError('Please fill in at least one field.');
      return;
    }
    setCustomError('');
    const title = [customWhat.trim(), customService.trim()].filter(Boolean).join(' · ');
    const payload = {
      browser_id: browserId,
      title,
      details: '',
      review_date: null,
      action: '',
      status: 'todo' as const,
    };
    const { data, error: insertError } = await supabase
      .from('review_items')
      .insert(payload)
      .select()
      .maybeSingle();
    if (insertError || !data) {
      setCustomError('Could not add item. Please try again.');
    } else {
      setItems((current) => [data as ReviewItem, ...current]);
      setCustomService('');
      setCustomWhat('');
    }
  }

  async function toggleStatus(item: ReviewItem) {
    const nextStatus = item.status === 'done' ? 'todo' : 'done';
    if (nextStatus === 'done' && !item.action.trim()) {
      const action = window.prompt('Add a next action to mark this as reviewed:');
      if (!action?.trim()) return;
      const { data, error: updateError } = await supabase
        .from('review_items')
        .update({ status: nextStatus, action: action.trim() })
        .eq('id', item.id)
        .eq('browser_id', browserId)
        .select()
        .maybeSingle();
      if (updateError || !data) setError('Could not update item.');
      else setItems((cur) => cur.map((i) => (i.id === item.id ? (data as ReviewItem) : i)));
      return;
    }
    const { data, error: updateError } = await supabase
      .from('review_items')
      .update({ status: nextStatus })
      .eq('id', item.id)
      .eq('browser_id', browserId)
      .select()
      .maybeSingle();
    if (updateError || !data) setError('Could not update item.');
    else setItems((cur) => cur.map((i) => (i.id === item.id ? (data as ReviewItem) : i)));
  }

  async function deleteItem(item: ReviewItem) {
    if (!window.confirm(`Remove "${item.title}" from your checklist?`)) return;
    setDeletingId(item.id);
    const { error: deleteError } = await supabase
      .from('review_items')
      .delete()
      .eq('id', item.id)
      .eq('browser_id', browserId);
    if (deleteError) setError('Could not delete item.');
    else setItems((cur) => cur.filter((i) => i.id !== item.id));
    setDeletingId(null);
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-icon">🛡</span>
            <div>
              <h1>Privacy Settings Guide</h1>
              <p>Keep track of which privacy settings you've reviewed, when, and what you still want to change.</p>
            </div>
          </div>
          <div className="header-user">
            <span className="header-email" title={session.email}>{session.email}</span>
            <button
              className="signout-btn"
              onClick={onSignOut}
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Left column */}
        <div className="left-col">

          {/* HOW IT WORKS onboarding banner */}
          {showHelp && (
            <div className="onboarding-card">
              <div className="onboarding-header">
                <span className="onboarding-title">👋 How to use this guide</span>
                <button
                  className="onboarding-dismiss"
                  onClick={() => { setShowHelp(false); localStorage.setItem('psg-help-dismissed', '1'); }}
                  aria-label="Dismiss guide"
                >
                  Got it ✓
                </button>
              </div>
              <div className="onboarding-steps">
                <div className="onboarding-step">
                  <span className="step-num">1</span>
                  <div>
                    <strong>Add items →</strong>
                    <p>On the right panel, click <b>Add</b> next to any privacy task (Google, Facebook, etc.) to add it to your checklist. Or type your own service below.</p>
                  </div>
                </div>
                <div className="onboarding-step">
                  <span className="step-num">2</span>
                  <div>
                    <strong>Mark as reviewed ○ →</strong>
                    <p>Click the <b>circle</b> on the left of any checklist item once you've completed that privacy review. It turns green ✓.</p>
                  </div>
                </div>
                <div className="onboarding-step">
                  <span className="step-num">3</span>
                  <div>
                    <strong>Track progress 📊</strong>
                    <p>The progress bar at the top shows how many settings you've reviewed. Use the filter tabs to view open vs completed items.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Progress card */}
          <div className="progress-card">
            <div className="progress-top">
              <span className="progress-label">{reviewedCount} of {totalCount} reviewed</span>
              <span className="progress-pct">{progressPct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="progress-stats">
              <span>{openActionsCount} open actions</span>
              <span className="dot">·</span>
              <span>{overdueCount} due for re-review</span>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-bar" role="group" aria-label="Filter checklist">
            {(['all', 'todo', 'done', 'action', 'overdue'] as Filter[]).map((f) => {
              const labels: Record<Filter, string> = {
                all: 'All',
                todo: 'To review',
                done: 'Reviewed',
                action: 'Open actions',
                overdue: 'Re-review due',
              };
              return (
                <button
                  key={f}
                  className={`filter-btn${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-banner" role="alert">
              <span>⚠ {error}</span>
              <button onClick={() => setError('')} aria-label="Dismiss">×</button>
            </div>
          )}

          {/* Checklist */}
          <div className="checklist">
            {!loading && visibleItems.length > 0 && (
              <div className="checklist-col-header">
                <span>Privacy task</span>
                <span>Status — click to toggle</span>
              </div>
            )}
            {loading ? (
              <div className="empty-state"><div className="spinner" /><p>Loading your checklist…</p></div>
            ) : visibleItems.length === 0 ? (
              <div className="empty-state">
                {totalCount === 0 ? (
                  <>
                    <div className="empty-icon">📋</div>
                    <h3>Your checklist is empty</h3>
                    <p>Click <strong>Add</strong> next to any item in the guidance panel on the right → to start tracking your privacy settings.</p>
                  </>
                ) : (
                  <p>No items match this filter. Try selecting a different tab above.</p>
                )}
              </div>
            ) : (
              <ul className="items-list">
                {visibleItems.map((item) => (
                  <li key={item.id} className={`checklist-item${item.status === 'done' ? ' is-done' : ''}${isOverdue(item) ? ' is-overdue' : ''}`}>
                    {/* Item info */}
                    <div className="item-body">
                      <div className="item-title">{item.title}</div>
                      {item.action && <div className="meta-action">→ {item.action}</div>}
                      {item.review_date && (
                        <div className={`meta-date${isOverdue(item) ? ' overdue' : ''}`}>
                          {isOverdue(item) ? '⚠ Due ' : 'Date: '}{formatDate(item.review_date)}
                        </div>
                      )}
                    </div>

                    {/* Status toggle — prominent button */}
                    <div className="item-actions-right">
                      <button
                        className={`status-toggle-btn${item.status === 'done' ? ' is-reviewed' : ''}`}
                        onClick={() => void toggleStatus(item)}
                        aria-label={item.status === 'done' ? 'Mark as not reviewed' : 'Mark as reviewed'}
                      >
                        {item.status === 'done' ? (
                          <><span className="status-icon">✓</span> Reviewed</>
                        ) : (
                          <><span className="status-icon">○</span> Mark reviewed</>
                        )}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => void deleteItem(item)}
                        aria-label={`Remove ${item.title}`}
                        disabled={deletingId === item.id}
                        title="Remove from checklist"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="right-col">
          <div className="guidance-panel">
            <h2 className="guidance-title">From the project team's guidance</h2>
            <ul className="guidance-list">
              {guidanceItems.map((g) => {
                const alreadyAdded = addedGuidanceIds.has(g.id);
                return (
                  <li key={g.id} className="guidance-row">
                    <div className="guidance-info">
                      <span className="guidance-label">{g.label}</span>
                      <span className="guidance-sub">{g.service} · {g.category}</span>
                    </div>
                    <button
                      className={`add-btn${alreadyAdded ? ' added' : ''}`}
                      onClick={() => !alreadyAdded && void addGuidanceItem(g.id)}
                      disabled={alreadyAdded || savingId === g.id}
                      aria-label={alreadyAdded ? `${g.label} already added` : `Add ${g.label}`}
                    >
                      {savingId === g.id ? '…' : alreadyAdded ? '✓' : 'Add'}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Custom item form */}
            <div className="custom-form-section">
              <h3 className="custom-form-title">Your own item</h3>
              <form className="custom-form" onSubmit={addCustomItem} noValidate>
                <label htmlFor="custom-service">Service or app</label>
                <input
                  id="custom-service"
                  type="text"
                  placeholder="For example: Netflix"
                  value={customService}
                  onChange={(e) => { setCustomService(e.target.value); setCustomError(''); }}
                  maxLength={80}
                />
                <label htmlFor="custom-what">What to review</label>
                <input
                  id="custom-what"
                  type="text"
                  placeholder="For example: Ad personalization"
                  value={customWhat}
                  onChange={(e) => { setCustomWhat(e.target.value); setCustomError(''); }}
                  maxLength={120}
                />
                {customError && <p className="custom-error" role="alert">{customError}</p>}
                <button type="submit" className="add-item-btn">Add item</button>
              </form>
            </div>

            {/* Why Use & Advantages Card */}
            <div className="benefits-card">
              <h3 className="benefits-card-title">💡 Why Use This Guide?</h3>
              <p className="benefits-desc">
                Most platforms (Google, Meta, Amazon) default to tracking and sharing your data. This tool helps you audit and take back control of your digital privacy in one place.
              </p>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">🛡️</span>
                  <div>
                    <strong>Prevent Data Leaks</strong>
                    <p>Review sensitive ad-personalization, location tracking, and microphone permissions.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔒</span>
                  <div>
                    <strong>100% Private to You</strong>
                    <p>No passwords or logins to your accounts are required. Your notes stay strictly in your browser session.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📈</span>
                  <div>
                    <strong>Audit Trail & Follow-ups</strong>
                    <p>Track your completion percentage and set action reminders for settings that need periodic review.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <div>
                    <strong>Direct Guidance Links</strong>
                    <p>Quick access to official privacy dashboards instead of hunting through complex account menus.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>Your checklist is tied to this browser. Clearing site data or switching browsers starts a new checklist. This app stores only your own notes and never connects to your accounts.</p>
      </footer>
    </div>
  );
}

export default App;
