'use client';

import { supabase } from '../lib/supabase';

export default function TestPage() {

  async function addUrl() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (!token) {
      alert('Please sign in first');
      return;
    }

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: 'https://google.com' }),
    });
    const payload = await response.json().catch(() => ({}));

    alert(response.ok ? 'Queued successfully' : payload.error || 'Submission failed');
  }

  return (
    <div
      style={{
        padding: '40px',
        color: 'white'
      }}
    >
      <h1>Supabase Test</h1>

      <button
        onClick={addUrl}
        style={{
          padding: '12px 20px',
          background: 'cyan',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
      >
        Insert URL
      </button>
    </div>
  );
}
