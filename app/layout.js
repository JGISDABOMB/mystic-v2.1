import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata = {
  title: "Mystic's Grove — Sacred Art Gallery",
  description: "A curated gallery at the confluence of the world's mystical traditions.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
