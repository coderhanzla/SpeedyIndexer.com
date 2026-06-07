import Link from 'next/link';
import Navbar from '../Navbar';

export const metadata = {
    title: 'Contact',
    description: 'Contact SpeedyIndexer AI for sales, support, and agency indexing plans.',
};

export default function ContactPage() {
    return (
        <>
            <Navbar />
            <main>
                <section style={{
                    minHeight: 'calc(100vh - 74px)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '72px 0',
                }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-xl)',
                            padding: '42px',
                            textAlign: 'center',
                        }}>
                            <span className="badge badge-cyan" style={{ marginBottom: 18 }}>
                                Contact
                            </span>
                            <h1 style={{ marginBottom: 16 }}>
                                Talk to SpeedyIndexer AI
                            </h1>
                            <p style={{ maxWidth: 560, margin: '0 auto 28px' }}>
                                For support, sales, or agency plans, email us and include your domain,
                                expected URL volume, and the indexing channels you want to use.
                            </p>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 12,
                                flexWrap: 'wrap',
                            }}>
                                <a className="btn btn-primary btn-lg" href="mailto:support@speedyindexer.com">
                                    Email Support
                                </a>
                                <Link className="btn btn-outline btn-lg" href="/pricing">
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
