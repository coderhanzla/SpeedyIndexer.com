import Link from 'next/link';
import Navbar from './Navbar';

export default function StaticInfoPage({ badge, title, description, sections, cta }) {
    return (
        <>
            <Navbar />
            <main className="static-page">
                <section className="static-hero">
                    <div className="container">
                        <span className="badge badge-cyan">{badge}</span>
                        <h1>{title}</h1>
                        <p>{description}</p>
                        {cta && (
                            <div className="static-actions">
                                <Link className="btn btn-primary btn-lg" href={cta.href}>{cta.label}</Link>
                                <Link className="btn btn-outline btn-lg" href="/contact">Contact us</Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="static-content">
                    <div className="container">
                        <div className="static-grid">
                            {sections.map((section) => (
                                <article key={section.title} className="static-card">
                                    <span>{section.kicker}</span>
                                    <h2>{section.title}</h2>
                                    <p>{section.body}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
