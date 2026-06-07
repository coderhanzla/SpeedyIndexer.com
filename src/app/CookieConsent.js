'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'speedy-cookie-consent';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(!window.localStorage.getItem(CONSENT_KEY));
    }, []);

    function saveConsent(value) {
        window.localStorage.setItem(CONSENT_KEY, JSON.stringify({
            value,
            date: new Date().toISOString(),
        }));
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <section className="cookie-consent" aria-label="Cookie consent">
            <div>
                <strong>We use cookies</strong>
                <p>
                    SpeedyIndexer uses essential cookies and local storage for sign-in, dashboard preferences,
                    support chat, notifications and service improvements.
                </p>
                <Link href="/cookie-policy">Read Cookie Policy</Link>
            </div>
            <div className="cookie-consent-actions">
                <button type="button" className="secondary" onClick={() => saveConsent('necessary')}>
                    Necessary only
                </button>
                <button type="button" onClick={() => saveConsent('accepted')}>
                    Accept cookies
                </button>
            </div>
        </section>
    );
}
