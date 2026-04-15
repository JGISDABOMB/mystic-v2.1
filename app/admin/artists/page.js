'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AdminArtists() {
  const router = useRouter();
  const supabase = createClient();
  const [artists, setArtists] = useState([]);
  const [artworkCounts, setArtworkCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/admin'); return; }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role !== 'admin') { router.replace('/admin'); return; }
    loadArtists();
  }

  async function loadArtists() {
    const { data: artistData } = await supabase
      .from('profiles').select('*').eq('role', 'artist').order('created_at', { ascending: false });

    const { data: counts } = await supabase
      .from('artworks').select('artist_id, status');

    const countMap = {};
    (counts ?? []).forEach(({ artist_id, status }) => {
      if (!countMap[artist_id]) countMap[artist_id] = { total: 0, approved: 0, pending: 0 };
      countMap[artist_id].total++;
      if (status === 'approved') countMap[artist_id].approved++;
      if (status === 'pending') countMap[artist_id].pending++;
    });

    setArtists(artistData ?? []);
    setArtworkCounts(countMap);
    setLoading(false);
  }

  async function handleRoleChange(id, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    await loadArtists();
    setSelected(null);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/admin');
  }

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
          <div style={{ display: 'flex' }}>
            {[['artworks', 'Artworks'], ['artists', 'Artists']].map(([path, label]) => (
              <a key={path} href={`/admin/${path}`} style={{
                fontSize: '.62rem', letterSpacing: '.18em', textTransform: 'uppercase',
                color: path === 'artists' ? 'var(--ivory)' : 'rgba(247,243,236,.45)',
                textDecoration: 'none', padding: '0 1rem',
                borderBottom: path === 'artists' ? '2px solid var(--gold)' : '2px solid transparent',
                height: '56px', display: 'flex', alignItems: 'center'
              }}>{label}</a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/" target="_blank" style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(247,243,236,.4)', textDecoration: 'none' }}>View Site ↗</a>
          <button onClick={handleSignOut} style={{
            background: 'none', border: '1px solid rgba(247,243,236,.2)',
            color: 'rgba(247,243,236,.6)', fontFamily: "'Jost', sans-serif",
            fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase',
            padding: '.35rem .9rem', cursor: 'pointer'
          }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.8rem', fontWeight: 300, color: 'var(--ink)' }}>Artists</h1>
          <p style={{ fontSize: '.8rem', color: 'var(--ink-m)', marginTop: '.3rem' }}>{artists.length} registered artists</p>
        </div>

        {artists.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--rule)', color: 'var(--ink-m)', fontSize: '.88rem' }}>
            No artists have signed up yet.
          </div>
        ) : (
          <div style={{ border: '1px solid var(--rule)' }}>
            {/* TABLE HEADER */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
              padding: '.6rem 1.5rem', borderBottom: '1px solid var(--rule)',
              background: 'var(--card-bg)'
            }}>
              {['Artist', 'Tradition', 'Total', 'Live', 'Pending'].map((h) => (
                <div key={h} style={{ fontSize: '.58rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-m)' }}>{h}</div>
              ))}
            </div>

            {artists.map((a, i) => {
              const c = artworkCounts[a.id] || { total: 0, approved: 0, pending: 0 };
              return (
                <div key={a.id}
                  onClick={() => setSelected(a)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                    padding: '1rem 1.5rem', alignItems: 'center',
                    borderBottom: i < artists.length - 1 ? '1px solid var(--rule)' : 'none',
                    cursor: 'pointer', transition: 'background .15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{a.avatar_emoji || '🎨'}</span>
                    <div>
                      <div style={{ fontSize: '.9rem', color: 'var(--ink)', fontWeight: 400 }}>{a.full_name || '—'}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--ink-m)' }}>{a.location || '—'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ink-s)' }}>{a.tradition || '—'}</div>
                  <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.1rem', fontWeight: 300, color: 'var(--ink)' }}>{c.total}</div>
                  <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.1rem', fontWeight: 300, color: '#2d5a2d' }}>{c.approved}</div>
                  <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.1rem', fontWeight: 300, color: c.pending > 0 ? '#7a5a00' : 'var(--ink-m)' }}>{c.pending}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ARTIST DETAIL PANEL */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,22,18,.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelected(null)} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 'min(420px, 100vw)', background: 'var(--ivory)',
            borderLeft: '1px solid var(--rule)', overflow: 'auto'
          }}>
            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.62rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-m)' }}>Artist Profile</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: '1px solid var(--rule)', color: 'var(--ink-m)', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem' }}>{selected.avatar_emoji || '🎨'}</span>
                <div>
                  <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.2rem', fontWeight: 300, color: 'var(--ink)' }}>{selected.full_name}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--ink-m)', marginTop: '.2rem' }}>{selected.location}</div>
                </div>
              </div>

              {[['Tradition', selected.tradition], ['Bio', selected.bio], ['Website', selected.website]].map(([l, v]) => v ? (
                <div key={l} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
                  <div style={{ fontSize: '.58rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-m)', marginBottom: '.3rem' }}>{l}</div>
                  <div style={{ fontSize: '.88rem', color: 'var(--ink-s)', lineHeight: 1.6 }}>{v}</div>
                </div>
              ) : null)}

              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ fontSize: '.58rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-m)', marginBottom: '.3rem' }}>Joined</div>
                <div style={{ fontSize: '.88rem', color: 'var(--ink-s)' }}>
                  {selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—'}
                </div>
              </div>

              <a href={`/admin/artworks?artist=${selected.id}`} style={{
                display: 'block', textAlign: 'center',
                border: '1px solid var(--rule)', color: 'var(--ink)',
                fontFamily: "'Jost', sans-serif", fontSize: '.62rem',
                letterSpacing: '.18em', textTransform: 'uppercase',
                padding: '.75rem', textDecoration: 'none', marginBottom: '.75rem'
              }}>View Their Artworks</a>

              <button onClick={() => handleRoleChange(selected.id, selected.role === 'admin' ? 'artist' : 'admin')}
                style={{
                  width: '100%', background: 'none',
                  border: '1px solid #e8c5c5', color: '#8b2020',
                  fontFamily: "'Jost', sans-serif", fontSize: '.6rem',
                  letterSpacing: '.15em', textTransform: 'uppercase',
                  padding: '.6rem', cursor: 'pointer'
                }}>
                {selected.role === 'admin' ? 'Remove Admin Access' : 'Grant Admin Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
