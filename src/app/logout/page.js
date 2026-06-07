'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function LogoutPage() {
    useEffect(() => {
        async function signOut() {
            await supabase.auth.signOut();
            window.location.replace('/signin');
        }

        signOut();
    }, []);

    return (
        <main className="auth-shell">
            <section className="auth-card">
                <p>Signing out...</p>
            </section>
        </main>
    );
}
