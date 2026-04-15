'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const CATEGORIES = ['kabbalah','alchemy','archetypes','geometry','sufism','gnostic','other'];
const TRADITIONS = ['Kabbalah','Alchemy','Jungian','Sacred Geometry','Sufism','Gnostic','Hermetics','Tantra','Other'];

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    title: '', tradition: '', category: 'other',
    type: 'print', price: '', sizes: '', description: '',
    stripe_link: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/artist'); return; }
      setUserId(session.user.id);
      setLoading(false);
    });
  }, []);

  function handleField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function handleFile(f) {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return; }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('Please upload an image of your work.'); return; }
    if (!form.title || !form.price) { setError('Title and price are required.'); return; }
    setSubmitting(true); setError('');

    try {
      // Upload image to Supabase Storage
      const ext = file.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('artwork-images').upload(path, file);
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artwork-images').getPublicUrl(path);

      // Insert artwork record
      const { error: insertError } = await supabase.from('artworks').insert({
        artist_id: userId,
        title: form.title,
        description: form.description,
        tradition: form.tradition,
        category: form.category,
        type: form.type,
        price: parseFloat(form.price),
        sizes: form.sizes,
        stripe_link: form.stripe_link,
        image_url: publicUrl,
        status: 'pending'
      });
      if (insertError) throw insertError;

      router.replace('/artist/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) return null;

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
        <a href="/artist/dashboard" style={ghostLinkStyle}>← Back to Dashboard</a>
      </nav>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '.62rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--ink-m)', marginBottom: '.6rem' }}>Artist Portal</p>
          <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '2rem', fontWeight: 300, color: 'var(--ink)' }}>Submit New Work</h1>
          <p style={{ fontSize: '.88rem', color: 'var(--ink-s)', marginTop: '.75rem', lineHeight: 1.7 }}>
            Your submission will be reviewed within 7 days. Once approved, it will appear live in the gallery.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* IMAGE UPLOAD */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Artwork Image *</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: `1px ${dragOver ? 'solid var(--ink)' : 'dashed var(--rule)'}`,
                background: dragOver ? 'var(--warm)' : 'var(--card-bg)',
                padding: '2.5rem', textAlign: 'center', cursor: 'pointer',
                transition: 'all .2s', position: 'relative'
              }}>
              {preview ? (
                <div style={{ position: 'relative' }}>
                  <img src={preview} alt="Preview"
                    style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                  <p style={{ marginTop: '1rem', fontSize: '.72rem', color: 'var(--ink-m)' }}>
                    {file.name} · Click to change
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: '.75rem', opacity: .3 }}>⬆</div>
                  <p style={{ fontSize: '.8rem', color: 'var(--ink-m)', lineHeight: 1.6 }}>
                    Drag & drop your image here, or click to browse<br />
                    <span style={{ fontSize: '.72rem' }}>JPG, PNG, WEBP · Max 10MB · High resolution preferred</span>
                  </p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          </div>

          {/* TITLE + PRICE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={form.title} onChange={(e) => handleField('title', e.target.value)}
                placeholder="Artwork title" required />
            </div>
            <div>
              <label style={labelStyle}>Price (USD) *</label>
              <input style={inputStyle} type="number" min="1" step="1" value={form.price}
                onChange={(e) => handleField('price', e.target.value)} placeholder="e.g. 250" required />
            </div>
          </div>

          {/* TRADITION + CATEGORY */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Tradition</label>
              <select style={inputStyle} value={form.tradition} onChange={(e) => handleField('tradition', e.target.value)}>
                <option value="">Select tradition…</option>
                {TRADITIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category (for filtering)</label>
              <select style={inputStyle} value={form.category} onChange={(e) => handleField('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* TYPE + SIZES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={form.type} onChange={(e) => handleField('type', e.target.value)}>
                <option value="print">Print</option>
                <option value="original">Original</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sizes Available</label>
              <input style={inputStyle} value={form.sizes} onChange={(e) => handleField('sizes', e.target.value)}
                placeholder='e.g. 16×20" · 24×30"' />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
              value={form.description} onChange={(e) => handleField('description', e.target.value)}
              placeholder="Describe the work, its inspiration, materials, and tradition. This appears on the gallery card." />
          </div>

          {/* STRIPE LINK */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Stripe Payment Link</label>
            <input style={inputStyle} value={form.stripe_link} onChange={(e) => handleField('stripe_link', e.target.value)}
              placeholder="https://buy.stripe.com/…" />
            <p style={{ fontSize: '.72rem', color: 'var(--ink-m)', marginTop: '.4rem', lineHeight: 1.5 }}>
              Create a Payment Link in your Stripe dashboard and paste it here. You can add this later.
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: '1.5rem', padding: '.85rem 1rem',
              background: '#fdf0f0', border: '1px solid #e8c5c5',
              fontSize: '.82rem', color: '#8b2020'
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" disabled={submitting} style={{
              background: submitting ? 'var(--ink-m)' : 'var(--ink)',
              color: 'var(--ivory)', border: 'none',
              fontFamily: "'Jost', sans-serif", fontSize: '.65rem',
              fontWeight: 400, letterSpacing: '.22em', textTransform: 'uppercase',
              padding: '1rem 2.5rem', cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background .3s'
            }}>
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
            <a href="/artist/dashboard" style={ghostLinkStyle}>Cancel</a>
          </div>
        </form>
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
  fontSize: '.88rem', padding: '.7rem 1rem', outline: 'none',
  boxSizing: 'border-box'
};
const ghostLinkStyle = {
  fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase',
  color: 'var(--ink-m)', textDecoration: 'none', transition: 'color .2s'
};
