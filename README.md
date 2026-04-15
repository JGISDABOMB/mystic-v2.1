# Mystic's Grove — Supabase Integration Files

## What's in this zip

```
lib/
  supabase.js        → Supabase browser client
  auth-context.js    → Auth provider (user session + profile)
app/
  layout.js          → Updated root layout with AuthProvider
.env.local.template  → Copy this to .env.local and fill in your keys
```

## Setup steps

### 1. Copy files into your project
- Drop `lib/supabase.js` and `lib/auth-context.js` into your project's `lib/` folder (create it if it doesn't exist)
- Replace your existing `app/layout.js` with the one included here

### 2. Create your .env.local
- Copy `.env.local.template` → rename it to `.env.local`
- Fill in your real Supabase URL and anon key from:
  Supabase dashboard → Project Settings → API

### 3. Update app/page.js
Add this to the top of your page component to load artworks from Supabase:

```js
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

// Inside your component:
const [artworks, setArtworks] = useState([])
const [artists, setArtists] = useState([])

useEffect(() => {
  const supabase = createClient()

  async function loadData() {
    const { data: artworkData } = await supabase
      .from('artworks')
      .select(`
        *,
        artist:profiles(full_name, location, tradition, avatar_emoji)
      `)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false })

    const { data: artistData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'artist')

    setArtworks(artworkData ?? [])
    setArtists(artistData ?? [])
  }

  loadData()
}, [])
```

### 4. Push to GitHub
```bash
git add .
git commit -m "add supabase auth and data layer"
git push
```

## Important
- NEVER commit `.env.local` to GitHub — make sure it's in your `.gitignore`
- The gallery will show empty until artworks are approved through the admin dashboard
