# Mystic's Grove — Sacred Art Gallery

A curated gallery at the confluence of the world's mystical traditions.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select the repo → Deploy

That's it. Vercel auto-detects Next.js.

## Project Structure

```
mystics-grove/
├── app/
│   ├── layout.js        # Root layout, metadata, fonts
│   ├── page.js          # Main page (all sections + cart logic)
│   └── globals.css      # All styles
├── components/          # (Future: break page.js into components)
├── data/
│   ├── artists.json     # Artist roster — edit this to add/remove artists
│   ├── artworks.json    # Artwork inventory — edit this for new pieces
│   └── svgThumbs.js     # SVG placeholder thumbnails
├── public/
│   └── images/
│       └── hero.png     # Hero section artwork
├── package.json
├── next.config.js       # Static export config
└── jsconfig.json        # Path aliases (@/)
```

## Adding a New Artist

Edit `data/artists.json`:
```json
{
  "id": "a9",
  "name": "New Artist Name",
  "loc": "City, Country",
  "bio": "Brief description of their work and tradition.",
  "trad": "Tradition · Medium",
  "avatar": "🔮"
}
```

## Adding a New Artwork

Edit `data/artworks.json`:
```json
{
  "id": "w11",
  "artistId": "a9",
  "title": "Artwork Title",
  "category": "kabbalah",
  "type": "print",
  "tradition": "Kabbalah",
  "price": 200,
  "desc": "Description of the piece.",
  "sizes": "16×20\" · 24×30\"",
  "stripeLink": "https://buy.stripe.com/YOUR_LINK",
  "svgKey": "einSof",
  "sold": false
}
```

Categories: `kabbalah`, `alchemy`, `archetypes`, `geometry`
Types: `print`, `original`

## Roadmap

- **Phase 2**: Supabase backend (move JSON → Postgres, admin dashboard)
- **Phase 3**: Artist portal (auth, self-serve uploads, approval queue)
