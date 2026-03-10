'use client';

import { useState, useCallback } from 'react';
import artists from '@/data/artists.json';
import artworks from '@/data/artworks.json';
import thumbs from '@/data/svgThumbs';

const getArtist = (id) => artists.find((a) => a.id === id);

export default function HomePage() {
  const [cart, setCart] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const addToCart = useCallback((id) => {
    const w = artworks.find((a) => a.id === id);
    if (!w || w.sold) return;
    if (cart.some((c) => c.id === id)) {
      showToast('Already in your collection');
      return;
    }
    setCart((prev) => [...prev, w]);
    showToast(`Added — ${w.title}`);
  }, [cart, showToast]);

  const quickAdd = useCallback((id) => {
    addToCart(id);
    setCartOpen(true);
  }, [addToCart]);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleCheckout = useCallback(() => {
    if (!cart.length) return;
    cart.forEach((item, i) =>
      setTimeout(() => window.open(item.stripeLink, '_blank'), i * 350)
    );
    showToast('Opening checkout…');
  }, [cart, showToast]);

  const filtered =
    currentFilter === 'all'
      ? artworks
      : currentFilter === 'originals'
      ? artworks.filter((w) => w.type === 'original')
      : artworks.filter((w) => w.category === currentFilter);

  const filters = [
    { key: 'all', label: 'All Works' },
    { key: 'kabbalah', label: 'Kabbalah' },
    { key: 'alchemy', label: 'Alchemy' },
    { key: 'archetypes', label: 'Archetypes' },
    { key: 'geometry', label: 'Sacred Geometry' },
    { key: 'originals', label: 'Originals Only' },
  ];

  const cartTotal = cart.reduce((s, c) => s + c.price, 0);

  const traditions = [
    { icon: '🌿', name: 'Kabbalah & Jewish Mysticism', sub: 'Sefirot · Ein Sof · Tikkun' },
    { icon: '◎', name: 'Jungian Depth Psychology', sub: 'Shadow · Anima · Self · Mandala' },
    { icon: '⚗', name: 'Alchemy & Hermetics', sub: 'Solve et Coagula · Emerald Tablet' },
    { icon: '⬡', name: 'Sacred Geometry', sub: 'Flower of Life · Metatron · Ratio' },
    { icon: '✺', name: 'Sufism & Islamic Mysticism', sub: 'Dhikr · Geometry · Calligraphy' },
    { icon: '✦', name: 'Mystical Christianity', sub: 'Sophia · Apophatic · Logos' },
  ];

  const marqueeItems = [
    'Original Works', 'Fine Art Prints', 'Kabbalah', 'Sacred Geometry',
    'Jungian Archetypes', 'Alchemy', 'Sufism', 'Depth Psychology',
    'Artist Ships Direct', '60% to the Artist',
  ];

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <a href="#" className="nav-logo">Mystic&apos;s Grove</a>
        <div className="nav-links">
          <a href="#shop">Collection</a>
          <a href="#traditions">Traditions</a>
          <a href="#artists">Artists</a>
          <a href="#apply">For Artists</a>
        </div>
        <div className="nav-right">
          <button className="nav-cart-btn" onClick={() => setCartOpen(true)}>
            Collection <span className="cart-pill">{cart.length}</span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-label">Sacred Art Gallery · Est. 2025</p>
          <h1 className="hero-h1">
            A Curated<br />Gallery of<br /><em>Sacred &amp;</em><br />Symbolic Art
          </h1>
          <div className="hero-rule"></div>
          <p className="hero-sub">
            A curated gallery at the confluence of the world&apos;s mystical traditions —
            Kabbalah, Jungian depth, alchemy, sacred geometry, Sufism. Original works and
            fine prints from living artists.
          </p>
          <div className="hero-ctas">
            <a href="#shop" className="btn-filled">Enter the Collection</a>
            <a href="#apply" className="btn-outline">Submit Your Work</a>
          </div>
          <div className="hero-traditions">
            {['Kabbalah', 'Jungian', 'Alchemy', 'Sacred Geometry', 'Sufism', 'Hermetics'].map((t) => (
              <span className="trad-tag" key={t}>{t}</span>
            ))}
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-right-inner">
            <div className="hero-art-bg"></div>
            <img
              className="hero-art-svg"
              src="/images/hero.png"
              alt="Sacred art - moonlit forest painting"
              style={{ objectFit: 'cover', width: '100%', height: '100%', maxWidth: 'none', borderRadius: 0 }}
            />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i}>
              <span className="marquee-item">{item}</span>
              <span className="marquee-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* SHOP */}
      <section id="shop">
        <div className="section-head">
          <div>
            <h2 className="section-title">The Collection</h2>
            <p className="section-sub">
              <span>{filtered.length}</span> works across all mystical traditions
            </p>
          </div>
        </div>
        <div className="filters">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-btn${currentFilter === f.key ? ' active' : ''}`}
              onClick={() => setCurrentFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="shop-grid">
          {filtered.map((w) => {
            const artist = getArtist(w.artistId);
            const inCart = cart.some((c) => c.id === w.id);
            return (
              <div className="art-card" key={w.id}>
                <div className="card-img">
                  <div dangerouslySetInnerHTML={{ __html: thumbs[w.svgKey] || '' }} />
                  <div className="card-hover-overlay">
                    {!w.sold && (
                      <button className="overlay-add" onClick={() => quickAdd(w.id)}>
                        Add to Collection
                      </button>
                    )}
                  </div>
                  {w.sold ? (
                    <div className="badge-sold">Sold</div>
                  ) : w.type === 'original' ? (
                    <div className="badge-original">Original</div>
                  ) : null}
                </div>
                <div className="card-body">
                  <div className="card-meta-row">
                    <span className="card-tradition">{w.tradition}</span>
                    <span className="card-type">{w.type === 'original' ? 'Original' : 'Print'}</span>
                  </div>
                  <h3 className="card-title">{w.title}</h3>
                  <div className="card-artist">{artist?.name || ''} · {artist?.loc || ''}</div>
                  <p className="card-desc">{w.desc}</p>
                  <div className="card-footer">
                    <div>
                      <div className="card-price">${w.price.toLocaleString()}</div>
                      <div className="card-sizes">{w.sizes}</div>
                    </div>
                    {w.sold ? (
                      <button className="btn-add" disabled>Sold</button>
                    ) : (
                      <button className="btn-add" onClick={() => addToCart(w.id)}>
                        {inCart ? 'Added ✓' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRADITIONS */}
      <section id="traditions" className="traditions-section">
        <div className="section-head">
          <h2 className="section-title">Traditions We Honor</h2>
        </div>
        <div className="traditions-grid">
          {traditions.map((t, i) => (
            <div className="trad-card" key={i}>
              <span className="trad-icon">{t.icon}</span>
              <div className="trad-name">{t.name}</div>
              <div className="trad-sub">{t.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ARTISTS */}
      <section id="artists">
        <div className="section-head">
          <h2 className="section-title">Our Artists</h2>
        </div>
        <div className="artists-grid">
          {artists.map((a) => (
            <div className="artist-card" key={a.id}>
              <span className="artist-avatar">{a.avatar}</span>
              <div className="artist-name">{a.name}</div>
              <div className="artist-loc">{a.loc}</div>
              <p className="artist-bio">{a.bio}</p>
              <span className="artist-tradition">{a.trad}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="how-left">
          <p className="how-label">How It Works</p>
          <h2 className="how-title">From sacred studio<br />to your walls</h2>
        </div>
        <div className="how-right">
          {[
            { n: '01', t: 'Browse', d: 'Explore works across Kabbalah, Jungian depth, alchemy, sacred geometry, and Sufism.' },
            { n: '02', t: 'Select', d: 'Add originals or archival prints to your collection. Each piece comes with its own story.' },
            { n: '03', t: 'Checkout', d: 'Secure payment via Stripe. Each work processed individually — no middlemen, no warehouse.' },
            { n: '04', t: 'Receive', d: 'The artist ships your piece directly. You support the maker, and the tradition continues.' },
          ].map((s) => (
            <div className="step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h4 className="step-title">{s.t}</h4>
              <p className="step-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="apply-section">
        <div className="apply-left">
          <p className="apply-label">For Artists</p>
          <h2 className="apply-title">Show your sacred work<br />to a devoted audience</h2>
          <p className="apply-desc">
            Mystic&apos;s Grove is a home for artists working from any mystical lineage —
            Kabbalistic, Jungian, alchemical, Sufi, or your own ecstatic vision. Non-exclusive.
            You keep your work and your freedom.
          </p>
          <div className="apply-form">
            <input type="email" id="applyEmail" className="apply-input" placeholder="Your email address" />
            <button className="btn-filled" onClick={() => {
              const el = document.getElementById('applyEmail');
              if (el?.value) {
                showToast('Application received — we\'ll be in touch.');
                el.value = '';
              } else {
                showToast('Please enter your email.');
              }
            }}>
              Apply to Show
            </button>
          </div>
        </div>
        <div className="apply-right">
          <div>
            <div className="split-display">
              <span className="split-num">60</span><span className="split-pct">%</span>
            </div>
            <p className="split-label">of every sale, directly to you</p>
          </div>
          <div className="apply-features">
            <div className="apply-feature">Non-exclusive arrangement</div>
            <div className="apply-feature">You fulfill your own orders</div>
            <div className="apply-feature">All mystical traditions welcome</div>
            <div className="apply-feature">Physical prints &amp; originals only</div>
            <div className="apply-feature">Reviewed within 7 days</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-col">
          <div className="footer-logo">Mystic&apos;s Grove</div>
          <p className="footer-tagline">A gallery at the confluence of the world&apos;s mystical traditions.</p>
          <p className="footer-copy">© 2025 Mystic&apos;s Grove<br />All traditions. All depths.</p>
        </div>
        <div className="footer-col">
          <h4>Navigate</h4>
          <div className="footer-links">
            <a href="#shop">Collection</a>
            <a href="#traditions">Traditions</a>
            <a href="#artists">Artists</a>
            <a href="#apply">For Artists</a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <div className="footer-links">
            <a href="mailto:hello@mysticsgrove.com">hello@mysticsgrove.com</a>
            <a href="#apply">Artist Applications</a>
            <a href="#">Collector Inquiries</a>
          </div>
        </div>
      </footer>

      {/* CART */}
      <div className={`cart-overlay${cartOpen ? ' open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-sidebar${cartOpen ? ' open' : ''}`}>
        <div className="cart-head">
          <h3>Your Collection</h3>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">Your collection is empty.<br />Add a work to begin.</div>
          ) : (
            cart.map((item) => {
              const a = getArtist(item.artistId);
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-thumb" dangerouslySetInnerHTML={{ __html: thumbs[item.svgKey] || '' }} />
                  <div style={{ flex: 1 }}>
                    <div className="cart-item-title">{item.title}</div>
                    <div className="cart-item-artist">{a?.name || ''}</div>
                    <div className="cart-item-price">${item.price.toLocaleString()}</div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                </div>
              );
            })
          )}
        </div>
        <div className="cart-foot">
          <div className="cart-total">
            <div className="cart-total-label">Total</div>
            <div className="cart-total-amount">${cartTotal.toLocaleString()}</div>
          </div>
          <p className="cart-note">Artist ships your piece directly. Each work processed via its own Stripe link.</p>
          <button className="btn-checkout" disabled={!cart.length} onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </>
  );
}
