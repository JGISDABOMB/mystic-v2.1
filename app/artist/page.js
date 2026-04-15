'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function ArtistLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/artist/dashboard');
      else setChecking(false);
    });
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.replace('/artist/dashboard');
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    if (error) { setError(error.message); setLoading(false); }
    else {
      setMessage('Check your email to confirm your account, then log in.');
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ivory)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <a href="/" style={{
          display: 'block', textAlign: 'center', marginBottom: '2.5rem',
          fontFamily: "'Italiana', serif", fontSize: '1.4rem',
          color: 'var(--ink)', textDecoration: 'none', letterSpacing: '.04em'
        }}>Mystic&apos;s Grove</a>

        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--rule)',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--rule)', marginBottom: '2rem' }}>
            {['login', 'signup'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage(''); }}
                style={{
                  flex: 1, background: 'none', border: 'none',
                  borderBottom: mode === m ? '2px solid var(--ink)' : '2px solid transparent',
                  padding: '.75rem', marginBottom: '-1px',
                  fontFamily: "'Jost', sans-serif", fontSize: '.65rem',
                  fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase',
                  color: mode === m ? 'var(--ink)' : 'var(--ink-m)', cursor: 'pointer',
                  transition: 'color .2s'
                }}>
                {m === 'login' ? 'Sign In' : 'Apply to Show'}
              </button>
            ))}
          </div>

          {message ? (
            <div style={{
              padding: '1rem', background: '#f0f7f0', border: '1px solid #c3ddc3',
              fontSize: '.85rem', color: '#2d5a2d', lineHeight: 1.6
            }}>{message}</div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
              {mode === 'signup' && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} type="text" value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name" required />
                </div>
              )}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" required />
              </div>
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'} required />
              </div>

              {error && (
                <div style={{
                  marginBottom: '1.2rem', padding: '.75rem',
                  background: '#fdf0f0', border: '1px solid #e8c5c5',
                  fontSize: '.8rem', color: '#8b2020'
                }}>{error}</div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', background: 'var(--ink)', color: 'var(--ivory)',
                border: 'none', fontFamily: "'Jost', sans-serif",
                fontSize: '.65rem', fontWeight: 400, letterSpacing: '.22em',
                textTransform: 'uppercase', padding: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? .6 : 1, transition: 'background .3s'
              }}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        <p style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '.72rem', color: 'var(--ink-m)', lineHeight: 1.6
        }}>
          Artists keep 60% of every sale.<br />
          Non-exclusive. You ship directly to collectors.
        </p>
      </div>
    </div>
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
  fontSize: '.9rem', padding: '.75rem 1rem', outline: 'none',
  boxSizing: 'border-box'
};
