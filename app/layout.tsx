import './globals.css'

export const metadata = {
  title: 'Fiacha - Promise Tracker',
  description: 'Irish political accountability platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
