'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single();
        if (profile?.role === 'admin') router.replace('/admin/artworks');
        else setChecking(false);
      } else setChecking(false);
    });
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setError('Access denied. Admin accounts only.');
      setLoading(false);
      return;
    }
    router.replace('/admin/artworks');
  }

  if (checking) return null;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: "'Italiana', serif", fontSize: '1.4rem', color: 'var(--ivory)', letterSpacing: '.04em', marginBottom: '.4rem' }}>
            Mystic&apos;s Grove
          </div>
          <div style={{ fontSize: '.6rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(247,243,236,.35)' }}>
            Admin Access
          </div>
        </div>

        <div style={{ background: 'rgba(247,243,236,.05)', border: '1px solid rgba(247,243,236,.1)', padding: '2.5rem' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{
                marginBottom: '1.2rem', padding: '.75rem',
                background: 'rgba(139,32,32,.2)', border: '1px solid rgba(139,32,32,.4)',
                fontSize: '.8rem', color: '#f5a0a0'
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: 'var(--ivory)', color: 'var(--ink)',
              border: 'none', fontFamily: "'Jost', sans-serif",
              fontSize: '.65rem', fontWeight: 400, letterSpacing: '.22em',
              textTransform: 'uppercase', padding: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? .7 : 1, transition: 'opacity .2s'
            }}>
              {loading ? 'Signing in…' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '.6rem', fontWeight: 400,
  letterSpacing: '.18em', textTransform: 'uppercase',
  color: 'rgba(247,243,236,.4)', marginBottom: '.5rem'
};
const inputStyle = {
  width: '100%', background: 'rgba(247,243,236,.06)',
  border: '1px solid rgba(247,243,236,.12)', color: 'var(--ivory)',
  fontFamily: "'Jost', sans-serif", fontSize: '.9rem',
  padding: '.75rem 1rem', outline: 'none', boxSizing: 'border-box'
};
