import './globals.css';

export const metadata = {
  title: "Mystic's Grove — Sacred Art Gallery",
  description: 'A curated gallery at the confluence of the world\'s mystical traditions — Kabbalah, Jungian depth, alchemy, sacred geometry, Sufism.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
