'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const TABS = ['pending', 'approved', 'rejected', 'all'];

const STATUS_COLORS = {
  pending:  { bg: '#fdf6e8', border: '#f0d080', color: '#7a5a00' },
  approved: { bg: '#f0f7f0', border: '#c3ddc3', color: '#2d5a2d' },
  rejected: { bg: '#fdf0f0', border: '#e8c5c5', color: '#8b2020' },
};

export default function AdminArtworks() {
  const router = useRouter();
  const supabase = createClient();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/admin'); return; }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role !== 'admin') { router.replace('/admin'); return; }
    loadArtworks();
  }

  async function loadArtworks() {
    const { data } = await supabase
      .from('artworks')
      .select(`*, artist:profiles(full_name, location, tradition, avatar_emoji)`)
      .order('submitted_at', { ascending: false });
    setArtworks(data ?? []);
    setLoading(false);
  }

  async function handleApprove(id) {
    setActionLoading(true);
    await supabase.from('artworks').update({
      status: 'approved', reviewed_at: new Date().toISOString()
    }).eq('id', id);
    await loadArtworks();
    setSelected(null);
    setActionLoading(false);
  }

  async function handleReject(id) {
    setActionLoading(true);
    await supabase.from('artworks').update({
      status: 'rejected',
      rejection_note: rejectNote || null,
      reviewed_at: new Date().toISOString()
    }).eq('id', id);
    await loadArtworks();
    setSelected(null);
    setRejectNote('');
    setActionLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Permanently delete this artwork?')) return;
    setActionLoading(true);
    await supabase.from('artworks').delete().eq('id', id);
    await loadArtworks();
    setSelected(null);
    setActionLoading(false);
  }

  async function handleToggleSold(id, current) {
    await supabase.from('artworks').update({ sold: !current }).eq('id', id);
    await loadArtworks();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/admin');
  }

  const filtered = tab === 'all' ? artworks : artworks.filter(w => w.status === tab);
  const counts = {
    pending:  artworks.filter(w => w.status === 'pending').length,
    approved: artworks.filter(w => w.status === 'approved').length,
    rejected: artworks.filter(w => w.status === 'rejected').length,
    all:      artworks.length,
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--ink-m)', fontSize: '.85rem' }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--ink)', borderBottom: '1px solid #2a2520',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: '56px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <span style={{ fontFamily: "'Italiana', serif", fontSize: '1.1rem', color: 'var(--ivory)', letterSpacing: '.04em' }}>
            Mystic&apos;s Grove
          </span>
          <span style={{ fontSize: '.55rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(247,243,236,.3)', borderLeft: '1px solid rgba(247,243,236,.15)', paddingLeft: '1.5rem' }}>
            Admin
          </span>
          <div style={{ display: 'flex', gap: '0' }}>
            {[['artworks', 'Artworks'], ['artists', 'Artists']].map(([path, label]) => (
              <a key={path} href={`/admin/${path}`} style={{
                fontSize: '.62rem', letterSpacing: '.18em', textTransform: 'uppercase',
                color: path === 'artworks' ? 'var(--ivory)' : 'rgba(247,243,236,.45)',
                textDecoration: 'none', padding: '0 1rem',
                borderBottom: path === 'artworks' ? '2px solid var(--gold)' : '2px solid transparent',
                height: '56px', display: 'flex', alignItems: 'center', transition: 'color .2s'
              }}>{label}</a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/" target="_blank" style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(247,243,236,.4)', textDecoration: 'none' }}>
            View Site ↗
          </a>
          <button onClick={handleSignOut} style={{
            background: 'none', border: '1px solid rgba(247,243,236,.2)',
            color: 'rgba(247,243,236,.6)', fontFamily: "'Jost', sans-serif",
            fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase',
            padding: '.35rem .9rem', cursor: 'pointer'
          }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.8rem', fontWeight: 300, color: 'var(--ink)' }}>Artworks</h1>
            <p style={{ fontSize: '.8rem', color: 'var(--ink-m)', marginTop: '.3rem' }}>{counts.pending} pending review</p>
          </div>
          <a href="/admin/artworks/new" style={{
            background: 'var(--ink)', color: 'var(--ivory)',
            fontFamily: "'Jost', sans-serif", fontSize: '.62rem',
            letterSpacing: '.2em', textTransform: 'uppercase',
            padding: '.75rem 1.8rem', textDecoration: 'none'
          }}>+ Add Manually</a>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--rule)', marginBottom: '1.5rem' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid var(--ink)' : '2px solid transparent',
              padding: '.7rem 1.2rem', marginBottom: '-1px',
              fontFamily: "'Jost', sans-serif", fontSize: '.62rem',
              letterSpacing: '.18em', textTransform: 'uppercase',
              color: tab === t ? 'var(--ink)' : 'var(--ink-m)',
              cursor: 'pointer'
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span style={{
                marginLeft: '.5rem', fontSize: '.55rem',
                background: tab === t ? 'var(--ink)' : 'var(--rule)',
                color: tab === t ? 'var(--ivory)' : 'var(--ink-m)',
                padding: '.1rem .45rem', borderRadius: '10px'
              }}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {/* ARTWORKS GRID */}
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-m)', fontSize: '.88rem' }}>
            No {tab === 'all' ? '' : tab} artworks.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)' }}>
            {filtered.map((w) => {
              const sc = STATUS_COLORS[w.status];
              return (
                <div key={w.id}
                  onClick={() => setSelected(w)}
                  style={{ background: 'var(--ivory)', cursor: 'pointer', transition: 'background .2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--ivory)'}
                >
                  {/* IMAGE */}
                  <div style={{ aspectRatio: '4/3', background: 'var(--ink)', overflow: 'hidden', position: 'relative' }}>
                    {w.image_url ? (
                      <img src={w.image_url} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(247,243,236,.2)', fontSize: '.7rem', letterSpacing: '.1em' }}>
                        No image
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', top: '.75rem', right: '.75rem',
                      fontSize: '.52rem', letterSpacing: '.12em', textTransform: 'uppercase',
                      padding: '.2rem .6rem', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color
                    }}>{w.status}</div>
                    {w.sold && (
                      <div style={{
                        position: 'absolute', top: '.75rem', left: '.75rem',
                        fontSize: '.52rem', letterSpacing: '.12em', textTransform: 'uppercase',
                        padding: '.2rem .6rem', background: 'rgba(247,243,236,.15)',
                        border: '1px solid rgba(247,243,236,.25)', color: 'rgba(247,243,236,.6)'
                      }}>Sold</div>
                    )}
                  </div>
                  {/* INFO */}
                  <div style={{ padding: '1rem 1.2rem' }}>
                    <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '.2rem' }}>{w.title}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--ink-m)', letterSpacing: '.08em' }}>
                      {w.artist?.full_name || 'Unknown'} · ${Number(w.price).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      {selected && (
        <ArtworkPanel
          artwork={selected}
          rejectNote={rejectNote}
          setRejectNote={setRejectNote}
          actionLoading={actionLoading}
          onApprove={() => handleApprove(selected.id)}
          onReject={() => handleReject(selected.id)}
          onDelete={() => handleDelete(selected.id)}
          onToggleSold={() => handleToggleSold(selected.id, selected.sold)}
          onClose={() => { setSelected(null); setRejectNote(''); }}
          onUpdate={async (updates) => {
            await supabase.from('artworks').update(updates).eq('id', selected.id);
            await loadArtworks();
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function ArtworkPanel({ artwork: w, rejectNote, setRejectNote, actionLoading, onApprove, onReject, onDelete, onToggleSold, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: w.title || '', description: w.description || '',
    tradition: w.tradition || '', price: w.price || '',
    sizes: w.sizes || '', stripe_link: w.stripe_link || '',
    category: w.category || 'other', type: w.type || 'print'
  });

  function handleField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,22,18,.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: 'min(520px, 100vw)', background: 'var(--ivory)',
        borderLeft: '1px solid var(--rule)', overflow: 'auto',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* PANEL HEADER */}
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '.62rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-m)' }}>Review Submission</span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--rule)', color: 'var(--ink-m)', width: '28px', height: '28px', cursor: 'pointer', fontSize: '.8rem' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {/* IMAGE */}
          {w.image_url && (
            <div style={{ marginBottom: '1.5rem', background: 'var(--ink)', aspectRatio: '4/3', overflow: 'hidden' }}>
              <img src={w.image_url} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}

          {/* ARTIST */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem', background: 'var(--card-bg)', border: '1px solid var(--rule)', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{w.artist?.avatar_emoji || '🎨'}</span>
            <div>
              <div style={{ fontSize: '.88rem', fontWeight: 400, color: 'var(--ink)' }}>{w.artist?.full_name || 'Unknown Artist'}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--ink-m)', letterSpacing: '.08em' }}>{w.artist?.location}</div>
            </div>
          </div>

          {editing ? (
            <EditForm form={form} handleField={handleField}
              onSave={() => { onUpdate({ ...form, price: parseFloat(form.price) }); setEditing(false); }}
              onCancel={() => setEditing(false)} />
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.4rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '.25rem' }}>{w.title}</h2>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold-d)' }}>{w.tradition} · {w.type}</div>
                </div>
                <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.4rem', fontWeight: 300, color: 'var(--ink)' }}>${Number(w.price).toLocaleString()}</div>
              </div>

              {w.description && <p style={{ fontSize: '.88rem', color: 'var(--ink-s)', lineHeight: 1.7, marginBottom: '1rem' }}>{w.description}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', fontSize: '.72rem' }}>
                {[['Category', w.category], ['Sizes', w.sizes], ['Stripe Link', w.stripe_link ? '✓ Set' : '— Not set'], ['Submitted', w.submitted_at ? new Date(w.submitted_at).toLocaleDateString() : '—']].map(([l, v]) => (
                  <div key={l} style={{ padding: '.6rem .75rem', background: 'var(--card-bg)', border: '1px solid var(--rule)' }}>
                    <div style={{ fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-m)', marginBottom: '.2rem' }}>{l}</div>
                    <div style={{ color: 'var(--ink)' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setEditing(true)} style={{
                marginTop: '1rem', background: 'none', border: '1px solid var(--rule)',
                color: 'var(--ink-s)', fontFamily: "'Jost', sans-serif",
                fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase',
                padding: '.5rem 1.2rem', cursor: 'pointer', width: '100%'
              }}>Edit Details</button>
            </div>
          )}

          {/* ACTIONS */}
          {!editing && (
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1.5rem' }}>
              {w.status === 'pending' && (
                <>
                  <button onClick={onApprove} disabled={actionLoading} style={{
                    width: '100%', background: '#2d5a2d', color: '#fff',
                    border: 'none', fontFamily: "'Jost', sans-serif",
                    fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase',
                    padding: '.9rem', cursor: 'pointer', marginBottom: '.75rem',
                    opacity: actionLoading ? .6 : 1
                  }}>
                    {actionLoading ? 'Processing…' : '✓ Approve & Publish'}
                  </button>

                  <div style={{ marginBottom: '.75rem' }}>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Optional rejection note for the artist…"
                      style={{
                        width: '100%', background: 'var(--ivory)', border: '1px solid var(--rule)',
                        color: 'var(--ink)', fontFamily: "'Jost', sans-serif",
                        fontSize: '.82rem', padding: '.6rem .8rem', height: '70px',
                        resize: 'none', outline: 'none', boxSizing: 'border-box',
                        marginBottom: '.5rem'
                      }} />
                    <button onClick={onReject} disabled={actionLoading} style={{
                      width: '100%', background: 'none', color: '#8b2020',
                      border: '1px solid #e8c5c5', fontFamily: "'Jost', sans-serif",
                      fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase',
                      padding: '.75rem', cursor: 'pointer', opacity: actionLoading ? .6 : 1
                    }}>Reject</button>
                  </div>
                </>
              )}

              {w.status === 'approved' && (
                <div style={{ display: 'flex', gap: '.75rem', marginBottom: '.75rem' }}>
                  <button onClick={onToggleSold} style={{
                    flex: 1, background: w.sold ? 'var(--ink)' : 'none',
                    color: w.sold ? 'var(--ivory)' : 'var(--ink)',
                    border: '1px solid var(--rule)', fontFamily: "'Jost', sans-serif",
                    fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase',
                    padding: '.7rem', cursor: 'pointer'
                  }}>{w.sold ? 'Mark Available' : 'Mark Sold'}</button>
                  <button onClick={onReject} disabled={actionLoading} style={{
                    flex: 1, background: 'none', border: '1px solid #e8c5c5',
                    color: '#8b2020', fontFamily: "'Jost', sans-serif",
                    fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase',
                    padding: '.7rem', cursor: 'pointer'
                  }}>Unpublish</button>
                </div>
              )}

              {w.status === 'rejected' && (
                <button onClick={onApprove} disabled={actionLoading} style={{
                  width: '100%', background: '#2d5a2d', color: '#fff',
                  border: 'none', fontFamily: "'Jost', sans-serif",
                  fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase',
                  padding: '.9rem', cursor: 'pointer', marginBottom: '.75rem',
                  opacity: actionLoading ? .6 : 1
                }}>Approve & Publish</button>
              )}

              <button onClick={onDelete} style={{
                width: '100%', background: 'none', border: 'none',
                color: 'var(--ink-m)', fontFamily: "'Jost', sans-serif",
                fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase',
                padding: '.5rem', cursor: 'pointer', marginTop: '.5rem'
              }}>Delete Permanently</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditForm({ form, handleField, onSave, onCancel }) {
  const CATS = ['kabbalah','alchemy','archetypes','geometry','sufism','gnostic','other'];
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {[['Title', 'title', 'text'], ['Price', 'price', 'number'], ['Tradition', 'tradition', 'text'], ['Sizes', 'sizes', 'text'], ['Stripe Link', 'stripe_link', 'text']].map(([label, key, type]) => (
        <div key={key} style={{ marginBottom: '.9rem' }}>
          <label style={labelStyle}>{label}</label>
          <input style={inputStyle} type={type} value={form[key]} onChange={(e) => handleField(key, e.target.value)} />
        </div>
      ))}
      <div style={{ marginBottom: '.9rem' }}>
        <label style={labelStyle}>Category</label>
        <select style={inputStyle} value={form.category} onChange={(e) => handleField('category', e.target.value)}>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: '.9rem' }}>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
          value={form.description} onChange={(e) => handleField('description', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '.75rem' }}>
        <button onClick={onSave} style={{
          flex: 1, background: 'var(--ink)', color: 'var(--ivory)', border: 'none',
          fontFamily: "'Jost', sans-serif", fontSize: '.62rem', letterSpacing: '.18em',
          textTransform: 'uppercase', padding: '.75rem', cursor: 'pointer'
        }}>Save Changes</button>
        <button onClick={onCancel} style={{
          flex: 1, background: 'none', color: 'var(--ink-s)',
          border: '1px solid var(--rule)', fontFamily: "'Jost', sans-serif",
          fontSize: '.62rem', letterSpacing: '.18em', textTransform: 'uppercase',
          padding: '.75rem', cursor: 'pointer'
        }}>Cancel</button>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '.6rem', letterSpacing: '.18em',
  textTransform: 'uppercase', color: 'var(--ink-m)', marginBottom: '.4rem'
};
const inputStyle = {
  width: '100%', background: 'var(--ivory)', border: '1px solid var(--rule)',
  color: 'var(--ink)', fontFamily: "'Jost', sans-serif",
  fontSize: '.85rem', padding: '.65rem .9rem', outline: 'none', boxSizing: 'border-box'
};
