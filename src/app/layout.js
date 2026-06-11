

import './globals.css'
import CookieConsent from './CookieConsent'

export const metadata = {
    title: {
        default: 'SpeedyIndexer AI - Enterprise URL Indexing Platform',
        template: '%s | SpeedyIndexer AI',
    },
    description:
        'Index thousands of URLs instantly via Google Indexing API, IndexNow, Sitemap Pings and RSS Signals. The fastest SEO indexing platform built for agencies and enterprise teams.',
    keywords: ['URL indexing', 'Google Indexing API', 'IndexNow', 'SEO tools', 'bulk indexing'],
    authors: [{ name: 'SpeedyIndexer AI' }],
    creator: 'SpeedyIndexer AI',
    metadataBase: new URL('https://speedyindexer.com'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://speedyindexer.com',
        title: 'SpeedyIndexer AI - Enterprise URL Indexing Platform',
        description: 'Index thousands of URLs instantly. Built for SEO agencies and enterprise teams.',
        siteName: 'SpeedyIndexer AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SpeedyIndexer AI',
        description: 'Enterprise URL indexing at scale.',
        creator: '@speedyindexer',
    },
    robots: { index: true, follow: true },
    icons: {
        icon: '/favicon.svg',
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#020617',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body>
                {children}
                <CookieConsent />
            </body>
        </html>
    )
}
