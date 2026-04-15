'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const STATUS_STYLES = {
  pending:  { bg: '#fdf6e8', border: '#f0d080', color: '#7a5a00', label: 'Pending Review' },
  approved: { bg: '#f0f7f0', border: '#c3ddc3', color: '#2d5a2d', label: 'Live' },
  rejected: { bg: '#fdf0f0', border: '#e8c5c5', color: '#8b2020', label: 'Rejected' },
};

export default function ArtistDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/artist'); return; }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(prof);

      const { data: works } = await supabase
        .from('artworks').select('*').eq('artist_id', session.user.id)
        .order('submitted_at', { ascending: false });
      setArtworks(works ?? []);
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/artist');
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--ink-m)', fontSize: '.85rem', letterSpacing: '.1em' }}>Loading…</p>
    </div>
  );

  const approved = artworks.filter(w => w.status === 'approved').length;
  const pending  = artworks.filter(w => w.status === 'pending').length;
  const rejected = artworks.filter(w => w.status === 'rejected').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(247,243,236,.95)', borderBottom: '1px solid var(--rule)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 3rem', height: '60px', backdropFilter: 'blur(16px)'
      }}>
        <a href="/" style={{
          fontFamily: "'Italiana', serif", fontSize: '1.2rem',
          color: 'var(--ink)', textDecoration: 'none', letterSpacing: '.04em'
        }}>Mystic&apos;s Grove</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ fontSize: '.7rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-m)' }}>
            {profile?.full_name || 'Artist'}
          </span>
          <button onClick={handleSignOut} style={ghostBtnStyle}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '.62rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--ink-m)', marginBottom: '.6rem' }}>Artist Portal</p>
          <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '2.2rem', fontWeight: 300, color: 'var(--ink)' }}>
            {profile?.full_name ? `Welcome, ${profile.full_name.split(' ')[0]}` : 'Your Studio'}
          </h1>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)', marginBottom: '2.5rem' }}>
          {[
            { n: artworks.length, l: 'Total Submitted' },
            { n: approved, l: 'Live in Gallery' },
            { n: pending, l: 'Awaiting Review' },
          ].map((s) => (
            <div key={s.l} style={{ background: 'var(--ivory)', padding: '1.5rem 2rem' }}>
              <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '2.4rem', fontWeight: 300, color: 'var(--ink)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-m)', marginTop: '.4rem' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.3rem', fontWeight: 300, color: 'var(--ink)' }}>Your Submissions</h2>
          <a href="/artist/upload" style={{
            background: 'var(--ink)', color: 'var(--ivory)',
            fontFamily: "'Jost', sans-serif", fontSize: '.62rem',
            fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase',
            padding: '.75rem 1.8rem', textDecoration: 'none',
            display: 'inline-block', transition: 'background .3s'
          }}>+ Submit New Work</a>
        </div>

        {/* ARTWORKS LIST */}
        {artworks.length === 0 ? (
          <div style={{
            border: '1px solid var(--rule)', padding: '4rem 2rem',
            textAlign: 'center', background: 'var(--card-bg)'
          }}>
            <p style={{ color: 'var(--ink-m)', fontSize: '.9rem', marginBottom: '1.2rem' }}>You haven&apos;t submitted any works yet.</p>
            <a href="/artist/upload" style={{
              display: 'inline-block', border: '1px solid var(--ink)',
              color: 'var(--ink)', fontFamily: "'Jost', sans-serif",
              fontSize: '.62rem', letterSpacing: '.2em', textTransform: 'uppercase',
              padding: '.75rem 1.8rem', textDecoration: 'none'
            }}>Submit Your First Work</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {artworks.map((w) => {
              const s = STATUS_STYLES[w.status] || STATUS_STYLES.pending;
              return (
                <div key={w.id} style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr auto',
                  gap: '1.5rem', alignItems: 'center',
                  padding: '1.2rem 1.5rem', background: 'var(--ivory)',
                  borderBottom: '1px solid var(--rule)',
                  borderLeft: '1px solid var(--rule)',
                  borderRight: '1px solid var(--rule)',
                  borderTop: artworks.indexOf(w) === 0 ? '1px solid var(--rule)' : 'none'
                }}>
                  {/* THUMB */}
                  <div style={{
                    width: '80px', height: '60px', background: 'var(--ink)',
                    overflow: 'hidden', flexShrink: 0
                  }}>
                    {w.image_url && (
                      <img src={w.image_url} alt={w.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>

                  {/* INFO */}
                  <div>
                    <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '.2rem' }}>{w.title}</div>
                    <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-m)' }}>
                      {w.tradition} · {w.type} · ${Number(w.price).toLocaleString()}
                    </div>
                    {w.status === 'rejected' && w.rejection_note && (
                      <div style={{ marginTop: '.4rem', fontSize: '.75rem', color: '#8b2020', fontStyle: 'italic' }}>
                        Note: {w.rejection_note}
                      </div>
                    )}
                  </div>

                  {/* STATUS */}
                  <div style={{
                    fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase',
                    padding: '.3rem .9rem', background: s.bg,
                    border: `1px solid ${s.border}`, color: s.color,
                    whiteSpace: 'nowrap'
                  }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROFILE SECTION */}
        <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--rule)' }}>
          <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '1.3rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '1.5rem' }}>Your Profile</h2>
          <ProfileEditor profile={profile} supabase={supabase} onUpdate={setProfile} />
        </div>
      </div>
    </div>
  );
}

function ProfileEditor({ profile, supabase, onUpdate }) {
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [tradition, setTradition] = useState(profile?.tradition || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { data } = await supabase.from('profiles')
      .update({ bio, location, tradition, website })
      .eq('id', profile.id).select().single();
    if (data) onUpdate(data);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
      <div>
        <label style={labelStyle}>Location</label>
        <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
      </div>
      <div>
        <label style={labelStyle}>Tradition / Medium</label>
        <input style={inputStyle} value={tradition} onChange={(e) => setTradition(e.target.value)} placeholder="e.g. Kabbalah · Printmaking" />
      </div>
      <div>
        <label style={labelStyle}>Website</label>
        <input style={inputStyle} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
      </div>
      <div>
        <label style={labelStyle}>Bio</label>
        <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
          value={bio} onChange={(e) => setBio(e.target.value)}
          placeholder="A short bio for your artist page" />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" disabled={saving} style={{
          background: saving || saved ? 'var(--ink-m)' : 'var(--ink)',
          color: 'var(--ivory)', border: 'none',
          fontFamily: "'Jost', sans-serif", fontSize: '.62rem',
          letterSpacing: '.2em', textTransform: 'uppercase',
          padding: '.75rem 2rem', cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background .3s'
        }}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}

const labelStyle = {
  display: 'block', fontSize: '.62rem', fontWeight: 400,
  letterSpacing: '.18em', textTransform: 'uppercase',
  color: 'var(--ink-m)', marginBottom: '.5rem'
};
const inputStyle = {
  width: '100%', background: 'var(--ivory)', border: '1px solid var(--rule)',
  color: 'var(--ink)', fontFamily: "'Jost', sans-serif",
  fontSize: '.88rem', padding: '.7rem 1rem', outline: 'none', boxSizing: 'border-box'
};
const ghostBtnStyle = {
  background: 'none', border: '1px solid var(--rule)', color: 'var(--ink-s)',
  fontFamily: "'Jost', sans-serif", fontSize: '.6rem',
  letterSpacing: '.18em', textTransform: 'uppercase',
  padding: '.4rem 1rem', cursor: 'pointer', transition: 'all .2s'
};
