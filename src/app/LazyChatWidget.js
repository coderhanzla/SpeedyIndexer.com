'use client';

import { useEffect, useState } from 'react';

export default function LazyChatWidget() {
    const [ChatWidget, setChatWidget] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const show = () => {
            import('./ChatWidget').then((mod) => {
                if (!cancelled) setChatWidget(() => mod.default);
            });
        };

        const hasIdleCallback = typeof window.requestIdleCallback === 'function';
        const idleId = hasIdleCallback
            ? window.requestIdleCallback(show, { timeout: 4000 })
            : window.setTimeout(show, 2500);

        window.addEventListener('pointerdown', show, { once: true });
        window.addEventListener('keydown', show, { once: true });

        return () => {
            cancelled = true;
            if (hasIdleCallback) {
                window.cancelIdleCallback(idleId);
            } else {
                window.clearTimeout(idleId);
            }
            window.removeEventListener('pointerdown', show);
            window.removeEventListener('keydown', show);
        };
    }, []);

    return ChatWidget ? <ChatWidget /> : null;
}
