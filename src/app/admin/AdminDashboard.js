'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    BarChart3,
    Bell,
    BookOpen,
    Bot,
    BriefcaseBusiness,
    CheckCircle2,
    Cloud,
    CreditCard,
    FilePenLine,
    Gauge,
    Globe2,
    IndianRupee,
    Landmark,
    LayoutDashboard,
    LifeBuoy,
    Lock,
    LogOut,
    Mail,
    Menu,
    MessageSquareText,
    Plus,
    Rocket,
    Search,
    SearchCheck,
    Send,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'admin1@yopmail.com';

const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'blog', label: 'Blog posts', icon: BookOpen },
    { id: 'pages', label: 'Pages', icon: FilePenLine },
    { id: 'services', label: 'Services', icon: BriefcaseBusiness },
    { id: 'indexing', label: 'Indexing', icon: Rocket },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'operations', label: 'Operations', icon: Gauge },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'support', label: 'Support tickets', icon: LifeBuoy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const initialPosts = [
    { id: 1, title: 'How to Index New URLs Faster', slug: 'how-to-index-new-urls-faster', excerpt: 'A practical guide to speeding up crawl discovery and indexing.', content: 'Use IndexNow, Google API submissions, sitemap pings and clean internal links to improve URL discovery.', seoTitle: 'How to Index New URLs Faster', seoDescription: 'Learn how to index new URLs faster with SpeedyIndexer.', author: 'Admin', status: 'Published', category: 'SEO', views: 12840, updated: 'Today' },
    { id: 2, title: 'IndexNow Setup Guide for Agencies', slug: 'indexnow-setup-guide-for-agencies', excerpt: 'How agencies can configure IndexNow for bulk client workflows.', content: 'Connect IndexNow keys, submit verified URLs and monitor job status from the dashboard.', seoTitle: 'IndexNow Setup Guide for Agencies', seoDescription: 'Agency guide for IndexNow setup and monitoring.', author: 'Admin', status: 'Draft', category: 'Guides', views: 3480, updated: 'Yesterday' },
    { id: 3, title: 'Google Indexing API Limits Explained', slug: 'google-indexing-api-limits-explained', excerpt: 'Understand limits, quotas and safe submission patterns.', content: 'Google Indexing API usage depends on project quotas, API eligibility and request hygiene.', seoTitle: 'Google Indexing API Limits Explained', seoDescription: 'A clear guide to Google Indexing API limits.', author: 'Editor', status: 'Review', category: 'API', views: 7920, updated: 'May 21' },
];

const initialPages = [
    { id: 1, title: 'Homepage', slug: '/', hero: 'Get Your URLs Indexed Faster Than Ever Before', body: 'Enterprise URL indexing platform for agencies and teams.', seoTitle: 'SpeedyIndexer AI - Enterprise URL Indexing Platform', seoDescription: 'Index thousands of URLs instantly via Google Indexing API, IndexNow and sitemaps.', owner: 'Marketing', status: 'Live', seo: 98, updated: '2 hours ago' },
    { id: 2, title: 'Pricing', slug: '/pricing', hero: 'Credit packs for every indexing workflow', body: 'Choose Starter, Basic, Pro, Growth, Agency or Enterprise credit packs.', seoTitle: 'Pricing - SpeedyIndexer AI', seoDescription: 'Compare SpeedyIndexer credit packs and URL submission credits.', owner: 'Revenue', status: 'Live', seo: 94, updated: '1 day ago' },
    { id: 3, title: 'API Docs', slug: '/api-docs', hero: 'SpeedyIndexer API Documentation', body: 'Submit URLs, check queue status and integrate indexing workflows.', seoTitle: 'API Docs - SpeedyIndexer AI', seoDescription: 'Developer documentation for SpeedyIndexer API.', owner: 'Product', status: 'Live', seo: 91, updated: '3 days ago' },
    { id: 4, title: 'Contact', slug: '/contact', hero: 'Contact SpeedyIndexer', body: 'Reach the support and sales team.', seoTitle: 'Contact - SpeedyIndexer AI', seoDescription: 'Contact SpeedyIndexer support and sales.', owner: 'Support', status: 'Draft', seo: 86, updated: '1 week ago' },
];

const initialServices = [
    { id: 1, name: 'Google discovery credits', plan: 'Pro', status: 'Active', queue: 1000, price: '$45' },
    { id: 2, name: 'Starter credit pack', plan: 'Starter', status: 'Active', queue: 40, price: '$3' },
    { id: 3, name: 'Agency bulk credits', plan: 'Agency', status: 'Active', queue: 5000, price: '$199' },
    { id: 4, name: 'Enterprise credits', plan: 'Enterprise', status: 'Paused', queue: 15000, price: '$350' },
];

const initialUsers = [
    { id: 1, name: 'Agency Admin', email: ADMIN_EMAIL, role: 'Owner', plan: 'Agency', status: 'Active', urls: 58210 },
    { id: 2, name: 'Sarah Client', email: 'sarah@example.com', role: 'User', plan: 'Pro', status: 'Active', urls: 14220 },
    { id: 3, name: 'Jordan SEO', email: 'jordan@example.com', role: 'Manager', plan: 'Starter', status: 'Review', urls: 4800 },
    { id: 4, name: 'Demo Account', email: 'demo@example.com', role: 'User', plan: 'Starter', status: 'Suspended', urls: 320 },
];

const initialPaymentRequests = [];
const initialSupportTickets = [];
const initialNotifications = [];
const initialChatSettings = {
    enabled: true,
    title: 'SpeedyIndexer AI Assistant',
    welcome: 'Hi, I can help with indexing, pricing, orders and support.',
    whatsapp: '+15550000000',
    prompt: 'Act as a helpful SEO indexing support assistant for SpeedyIndexer customers.',
};

const initialAdminSettings = {
    recaptcha: {
        provider: 'google-recaptcha-v3',
        siteKey: '',
        secretKey: '',
        login: true,
        signup: true,
        contact: false,
        threshold: '0.5',
    },
    integrations: {
        searchConsole: 'https://speedyindexer.com',
        analyticsId: '',
        cloudflareZoneId: '',
        cloudflareApiToken: '',
        cachePurge: true,
    },
    smtp: {
        provider: 'custom',
        host: '',
        port: '587',
        username: '',
        password: '',
        fromEmail: 'support@speedyindexer.com',
        signupEmail: true,
        passwordReset: true,
        orderReceipt: true,
        adminAlert: true,
    },
    seo: {
        siteTitle: 'SpeedyIndexer AI - Enterprise URL Indexing Platform',
        description: 'Index thousands of URLs instantly via Google Indexing API, IndexNow, Sitemap Pings and RSS Signals.',
        robots: 'index-follow',
        sitemapPing: true,
        bingIndexNow: true,
        yandexIndexNow: true,
        schema: true,
    },
    alerts: {
        newUserSignup: true,
        paymentFailed: true,
        queueFailure: true,
        blogReview: true,
        securityLogin: true,
        dailyReport: true,
    },
};

const initialPaymentGateways = [
    { id: 'stripe', name: 'Stripe', region: 'International', type: 'Card gateway', status: 'Active', fee: '2.9% + 30c', apiKey: '', secretKey: '', merchantId: '', webhookUrl: '', instructions: 'Cards, Apple Pay and Google Pay for international customers.' },
    { id: 'paypal', name: 'PayPal', region: 'International', type: 'Wallet gateway', status: 'Disabled', fee: 'Gateway fee', apiKey: '', secretKey: '', merchantId: '', webhookUrl: '', instructions: 'PayPal checkout for international wallet payments.' },
    { id: 'bank-transfer', name: 'Bank transfer', region: 'Local Bank', type: 'Manual bank', status: 'Active', fee: 'Manual', apiKey: '', secretKey: '', merchantId: '', webhookUrl: '', instructions: 'Customer sends bank transfer proof for admin approval.' },
    { id: 'razorpay', name: 'Razorpay / UPI', region: 'Indian gateways', type: 'UPI and card', status: 'Active', fee: 'Gateway fee', apiKey: '', secretKey: '', merchantId: '', webhookUrl: '', instructions: 'Razorpay cards, net banking, UPI and QR payments.' },
];

const initialPaymentSettings = {
    defaultCurrency: 'usd',
    mode: 'live',
    minTopup: 10,
    autoApprove: false,
    manualBankReview: true,
    stripe: true,
    paypal: false,
    razorpay: true,
    bankTransfer: true,
    gateways: initialPaymentGateways,
};

const statusTone = {
    Active: 'green',
    Live: 'green',
    Published: 'green',
    Draft: 'amber',
    Review: 'cyan',
    Paused: 'amber',
    Suspended: 'red',
    Pending: 'amber',
    Approved: 'green',
    Rejected: 'red',
    Disabled: 'red',
    Optional: 'cyan',
    Answered: 'cyan',
    'In Progress': 'cyan',
    Resolved: 'green',
};

function readStoredState(key, fallback) {
    if (typeof window === 'undefined') return fallback;

    try {
        const stored = window.localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch {
        return fallback;
    }
}

function useStoredState(key, fallback) {
    const [value, setValue] = useState(fallback);
    const [storageReady, setStorageReady] = useState(false);

    useEffect(() => {
        setValue(readStoredState(key, fallback));
        setStorageReady(true);
    }, [key, fallback]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!storageReady) return;
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, storageReady, value]);

    useEffect(() => {
        function syncStoredState(event) {
            if (event?.key && event.key !== key) return;
            setValue(readStoredState(key, fallback));
        }

        function syncCustomState(event) {
            if (event.detail?.key !== key) return;
            setValue(event.detail.value);
        }

        window.addEventListener('storage', syncStoredState);
        window.addEventListener('speedy-storage', syncCustomState);
        const timer = window.setInterval(() => setValue(readStoredState(key, fallback)), 2500);

        return () => {
            window.removeEventListener('storage', syncStoredState);
            window.removeEventListener('speedy-storage', syncCustomState);
            window.clearInterval(timer);
        };
    }, [key, fallback]);

    function setSyncedValue(nextValue) {
        setValue((current) => {
            const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue;
            window.localStorage.setItem(key, JSON.stringify(resolved));
            window.dispatchEvent(new CustomEvent('speedy-storage', { detail: { key, value: resolved } }));
            return resolved;
        });
    }

    return [value, setSyncedValue];
}

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getNotificationSection(item, context = 'user') {
    const text = [item.type, item.title, item.message].join(' ').toLowerCase();

    if (text.includes('support') || text.includes('ticket') || text.includes('handover') || text.includes('chat')) {
        return 'support';
    }

    if (text.includes('payment') || text.includes('top-up') || text.includes('topup') || text.includes('billing') || text.includes('invoice')) {
        return context === 'admin' ? 'payments' : 'payments';
    }

    if (text.includes('order') || text.includes('pricing') || text.includes('plan')) {
        return context === 'admin' ? 'payments' : 'orders';
    }

    if (text.includes('index') || text.includes('url') || text.includes('queue') || text.includes('sitemap')) {
        return 'indexing';
    }

    if (text.includes('user') || text.includes('signup')) {
        return context === 'admin' ? 'users' : 'profile';
    }

    return context === 'admin' ? 'overview' : 'notifications';
}

function parseUrlList(value) {
    return Array.from(
        new Set(
            value
                .split(/[\s,]+/)
                .map((item) => item.trim())
                .filter((item) => {
                    try {
                        const parsed = new URL(item);
                        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
                    } catch {
                        return false;
                    }
                })
        )
    );
}

function blankGatewayForm() {
    return {
        name: '',
        region: 'International',
        type: 'Card gateway',
        fee: '',
        apiKey: '',
        secretKey: '',
        merchantId: '',
        webhookUrl: '',
        instructions: '',
    };
}

function normalizePaymentGateway(gateway) {
    return {
        id: gateway.id || `${slugify(gateway.name || 'gateway')}-${Date.now().toString().slice(-5)}`,
        name: gateway.name || 'Payment gateway',
        region: gateway.region || 'International',
        type: gateway.type || 'Card gateway',
        status: gateway.status || 'Active',
        fee: gateway.fee || 'Custom fee',
        apiKey: gateway.apiKey || '',
        secretKey: gateway.secretKey || '',
        merchantId: gateway.merchantId || '',
        webhookUrl: gateway.webhookUrl || '',
        instructions: gateway.instructions || 'Admin managed payment gateway.',
    };
}

function normalizePaymentGateways(gateways) {
    const source = Array.isArray(gateways) && gateways.length > 0 ? gateways : initialPaymentGateways;
    return source.map(normalizePaymentGateway);
}

export default function AdminDashboard() {
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [email, setEmail] = useState(ADMIN_EMAIL);
    const [password, setPassword] = useState('');
    const [active, setActive] = useState('overview');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState('Admin workspace ready.');
    const [posts, setPosts] = useStoredState('speedy-admin-posts', initialPosts);
    const [pages, setPages] = useStoredState('speedy-admin-pages', initialPages);
    const [services, setServices] = useStoredState('speedy-admin-services', initialServices);
    const [indexingRules, setIndexingRules] = useStoredState('speedy-admin-indexing-rules', {
        googleApi: true,
        indexNow: true,
        sitemapPing: true,
        rssPing: false,
        autoRetry: true,
        dailyLimit: 10000,
        batchSize: 500,
        priority: 'balanced',
    });
    const [users, setUsers] = useStoredState('speedy-admin-users', initialUsers);
    const [paymentRequests, setPaymentRequests] = useStoredState('speedy-payment-requests', initialPaymentRequests);
    const [paymentSettings, setPaymentSettings] = useStoredState('speedy-admin-payment-settings', initialPaymentSettings);
    const [supportTickets, setSupportTickets] = useStoredState('speedy-support-tickets', initialSupportTickets);
    const [notifications, setNotifications] = useStoredState('speedy-notifications', initialNotifications);
    const [chatSettings, setChatSettings] = useStoredState('speedy-chat-settings', initialChatSettings);
    const [adminSettings, setAdminSettings] = useStoredState('speedy-admin-settings', initialAdminSettings);
    const [notificationForm, setNotificationForm] = useState({ to: 'all', title: '', message: '' });
    const [serviceForm, setServiceForm] = useState({ name: '', plan: 'Starter', price: '$3' });
    const adminUnreadNotifications = notifications.filter((item) => item.to === 'admin' && item.status === 'Unread').length;

    useEffect(() => {
        let mounted = true;

        async function loadSession() {
            const { data } = await supabase.auth.getSession();
            const currentSession = data?.session || null;
            const currentEmail = currentSession?.user?.email?.toLowerCase();

            if (mounted) {
                setSession(currentEmail === ADMIN_EMAIL ? currentSession : null);
                setAuthLoading(false);
            }
        }

        loadSession();

        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            const currentEmail = nextSession?.user?.email?.toLowerCase();
            setSession(currentEmail === ADMIN_EMAIL ? nextSession : null);
        });

        return () => {
            mounted = false;
            data?.subscription?.unsubscribe();
        };
    }, []);

    const filteredUsers = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return users;

        return users.filter((user) =>
            [user.name, user.email, user.role, user.plan, user.status].join(' ').toLowerCase().includes(needle)
        );
    }, [query, users]);

    async function handleLogin(event) {
        event.preventDefault();
        setAuthError('');

        if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
            setAuthError('This admin area only accepts the configured owner account.');
            return;
        }

        setLoginLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            setAuthError(error.message);
        } else {
            setSession(data.session);
            setNotice('Signed in as admin owner.');
        }

        setLoginLoading(false);
    }

    async function signOut() {
        await supabase.auth.signOut();
        setSession(null);
        setPassword('');
    }

    function addService(event) {
        event.preventDefault();
        if (!serviceForm.name.trim()) return;

        setServices((items) => [
            {
                id: Date.now(),
                name: serviceForm.name.trim(),
                plan: serviceForm.plan,
                status: 'Active',
                queue: 0,
                price: serviceForm.price,
            },
            ...items,
        ]);
        setServiceForm({ name: '', plan: 'Starter', price: '$3' });
        setNotice('Service added and marked active.');
    }

    function toggleService(id) {
        setServices((items) =>
            items.map((service) =>
                service.id === id
                    ? { ...service, status: service.status === 'Active' ? 'Paused' : 'Active' }
                    : service
            )
        );
    }

    function cycleUserStatus(id) {
        const nextStatus = { Active: 'Review', Review: 'Suspended', Suspended: 'Active' };
        setUsers((items) =>
            items.map((user) => (user.id === id ? { ...user, status: nextStatus[user.status] || 'Active' } : user))
        );
    }

    function switchSection(id) {
        setActive(id);
        setDrawerOpen(false);
    }

    if (authLoading) {
        return (
            <main className="admin-auth-shell">
                <div className="admin-auth-card">
                    <div className="spinner admin-spinner" />
                    <p>Loading admin access...</p>
                </div>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="admin-auth-shell">
                <section className="admin-auth-card" aria-labelledby="admin-login-title">
                    <Link href="/" className="admin-auth-brand">
                        <span>Speedy</span>Indexer Admin
                    </Link>
                    <div className="admin-auth-heading">
                        <span>Secure owner access</span>
                        <h1 id="admin-login-title">Admin dashboard</h1>
                        <p>Sign in with the owner account to manage content, services, users and operations.</p>
                    </div>

                    <form onSubmit={handleLogin} className="admin-auth-form">
                        <label>
                            <span>Admin email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                            />
                        </label>

                        <label>
                            <span>Password</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="current-password"
                                placeholder="Enter admin password"
                            />
                        </label>

                        {authError && <p className="admin-auth-error">{authError}</p>}

                        <button type="submit" disabled={loginLoading}>
                            <Lock size={18} />
                            {loginLoading ? 'Checking...' : 'Sign in to admin'}
                        </button>
                    </form>
                </section>
            </main>
        );
    }

    return (
        <main className="admin-shell">
            <aside className={`admin-sidebar ${drawerOpen ? 'open' : ''}`}>
                <div className="admin-brand">
                    <Link href="/">
                        <span>Speedy</span>Indexer
                    </Link>
                    <small>Control center</small>
                </div>

                <nav className="admin-nav" aria-label="Admin sections">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={active === item.id ? 'active' : ''}
                                onClick={() => switchSection(item.id)}
                            >
                                <Icon size={18} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-card">
                    <ShieldCheck size={20} />
                    <strong>Owner session</strong>
                    <span>{ADMIN_EMAIL}</span>
                </div>
            </aside>

            {drawerOpen && <button className="admin-drawer-backdrop" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close admin menu" />}

            <section className="admin-main">
                <header className="admin-topbar">
                    <button className="admin-menu-button" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open admin menu">
                        <Menu size={20} />
                    </button>

                    <div>
                        <span>Admin Panel</span>
                        <h1>{navItems.find((item) => item.id === active)?.label || 'Overview'}</h1>
                    </div>

                    <div className="admin-search">
                        <Search size={17} />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search users, plans, roles"
                        />
                    </div>

                    <button className="admin-icon-button" type="button" aria-label="Notifications" onClick={() => switchSection('notifications')}>
                        <Bell size={18} />
                        {adminUnreadNotifications > 0 && <span className="admin-bell-badge">{adminUnreadNotifications}</span>}
                    </button>

                    <button className="admin-signout" type="button" onClick={signOut}>
                        <LogOut size={17} />
                        Sign out
                    </button>
                </header>

                {notice && (
                    <div className="admin-notice">
                        <CheckCircle2 size={18} />
                        {notice}
                        <button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {active === 'overview' && (
                    <OverviewPanel posts={posts} pages={pages} services={services} users={users} />
                )}

                {active === 'blog' && (
                    <BlogPanel posts={posts} setPosts={setPosts} setNotice={setNotice} />
                )}

                {active === 'pages' && (
                    <PagesPanel pages={pages} setPages={setPages} setNotice={setNotice} />
                )}

                {active === 'services' && (
                    <ServicesPanel
                        services={services}
                        serviceForm={serviceForm}
                        setServiceForm={setServiceForm}
                        addService={addService}
                        toggleService={toggleService}
                    />
                )}

                {active === 'indexing' && (
                    <IndexingPanel
                        session={session}
                        rules={indexingRules}
                        setRules={setIndexingRules}
                        setNotice={setNotice}
                    />
                )}

                {active === 'users' && (
                    <UsersPanel users={filteredUsers} cycleUserStatus={cycleUserStatus} />
                )}

                {active === 'operations' && <OperationsPanel />}

                {active === 'payments' && (
                    <PaymentsAdminPanel
                        requests={paymentRequests}
                        setRequests={setPaymentRequests}
                        settings={paymentSettings}
                        setSettings={setPaymentSettings}
                        setNotice={setNotice}
                    />
                )}

                {active === 'support' && (
                    <SupportTicketsAdminPanel
                        tickets={supportTickets}
                        setTickets={setSupportTickets}
                        setNotifications={setNotifications}
                        setNotice={setNotice}
                    />
                )}

                {active === 'notifications' && (
                    <NotificationsAdminPanel
                        notifications={notifications}
                        setNotifications={setNotifications}
                        users={users}
                        form={notificationForm}
                        setForm={setNotificationForm}
                        setNotice={setNotice}
                        switchSection={switchSection}
                    />
                )}

                {active === 'settings' && (
                    <SettingsPanel
                        chatSettings={chatSettings}
                        setChatSettings={setChatSettings}
                        adminSettings={adminSettings}
                        setAdminSettings={setAdminSettings}
                    />
                )}
            </section>
        </main>
    );
}

function OverviewPanel({ posts, pages, services, users }) {
    const activeServices = services.filter((service) => service.status === 'Active').length;
    const activeUsers = users.filter((user) => user.status === 'Active').length;

    return (
        <div className="admin-section-grid">
            <MetricCard title="Blog posts" value={posts.length} label="Content library" Icon={BookOpen} />
            <MetricCard title="Managed pages" value={pages.length} label="CMS entries" Icon={FilePenLine} />
            <MetricCard title="Active services" value={activeServices} label="Running products" Icon={SlidersHorizontal} />
            <MetricCard title="Active users" value={activeUsers} label="Healthy accounts" Icon={Users} />

            <section className="admin-panel admin-wide">
                <PanelHeader title="Publishing workflow" subtitle="Today" Icon={BarChart3} />
                <div className="admin-pipeline">
                    {['Idea', 'Draft', 'Review', 'Scheduled', 'Published'].map((step, index) => (
                        <div key={step}>
                            <span>{step}</span>
                            <strong>{[12, 7, 3, 5, 18][index]}</strong>
                        </div>
                    ))}
                </div>
            </section>

            <section className="admin-panel">
                <PanelHeader title="System health" subtitle="Live" Icon={Gauge} />
                <StatusList
                    items={[
                        ['Frontend', 'Operational', 'green'],
                        ['Supabase auth', 'Connected', 'green'],
                        ['Redis queue', 'Monitoring', 'cyan'],
                        ['Indexing workers', 'Stable', 'green'],
                    ]}
                />
            </section>

            <section className="admin-panel">
                <PanelHeader title="Quick actions" subtitle="Recommended" Icon={Plus} />
                <div className="admin-action-list">
                    <button type="button">Create blog post</button>
                    <button type="button">Add landing page</button>
                    <button type="button">Invite user</button>
                    <button type="button">Review failed URLs</button>
                </div>
            </section>
        </div>
    );
}

function BlogPanel({ posts, setPosts, setNotice }) {
    const blankPost = {
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        seoTitle: '',
        seoDescription: '',
        category: 'SEO',
        status: 'Draft',
        author: 'Admin',
    };
    const [editingId, setEditingId] = useState(posts[0]?.id || 'new');
    const selectedPost = posts.find((post) => post.id === editingId);
    const [draft, setDraft] = useState(selectedPost || blankPost);

    useEffect(() => {
        const nextPost = posts.find((post) => post.id === editingId);
        setDraft(nextPost || blankPost);
    }, [editingId, posts]);

    function startNewPost() {
        setEditingId('new');
        setDraft(blankPost);
    }

    function savePost(event) {
        event.preventDefault();
        if (!draft.title.trim()) return;

        const normalized = {
            ...blankPost,
            ...draft,
            id: editingId === 'new' ? Date.now() : editingId,
            title: draft.title.trim(),
            slug: draft.slug?.trim() || slugify(draft.title),
            seoTitle: draft.seoTitle?.trim() || draft.title.trim(),
            updated: 'Just now',
            views: Number(draft.views || 0),
        };

        setPosts((items) =>
            editingId === 'new'
                ? [normalized, ...items]
                : items.map((item) => (item.id === editingId ? normalized : item))
        );
        setEditingId(normalized.id);
        setNotice(editingId === 'new' ? 'Blog post created.' : 'Blog post updated.');
    }

    function duplicatePost(post) {
        const copy = {
            ...post,
            id: Date.now(),
            title: `${post.title} Copy`,
            slug: `${post.slug || slugify(post.title)}-copy`,
            status: 'Draft',
            updated: 'Just now',
            views: 0,
        };
        setPosts((items) => [copy, ...items]);
        setEditingId(copy.id);
        setNotice('Blog post duplicated as draft.');
    }

    function deletePost(id) {
        setPosts((items) => items.filter((item) => item.id !== id));
        setEditingId('new');
        setNotice('Blog post deleted.');
    }

    function quickStatus(post, status) {
        setPosts((items) =>
            items.map((item) => (item.id === post.id ? { ...item, status, updated: 'Just now' } : item))
        );
        setNotice(`Blog post marked ${status}.`);
    }

    return (
        <div className="admin-two-column">
            <section className="admin-panel">
                <PanelHeader title={editingId === 'new' ? 'Create blog post' : 'Edit blog post'} subtitle="Dynamic CMS editor" Icon={BookOpen} />
                <form className="admin-form admin-editor-form" onSubmit={savePost}>
                    <label>
                        <span>Post title</span>
                        <input value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="New article title" />
                    </label>
                    <label>
                        <span>Slug</span>
                        <input value={draft.slug || ''} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder="article-url-slug" />
                    </label>
                    <label>
                        <span>Category</span>
                        <select value={draft.category || 'SEO'} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                            <option>SEO</option>
                            <option>Guides</option>
                            <option>API</option>
                            <option>Product</option>
                        </select>
                    </label>
                    <label>
                        <span>Status</span>
                        <select value={draft.status || 'Draft'} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                            <option>Draft</option>
                            <option>Review</option>
                            <option>Published</option>
                        </select>
                    </label>
                    <label>
                        <span>Excerpt</span>
                        <textarea value={draft.excerpt || ''} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} placeholder="Short summary for blog cards and SEO previews" />
                    </label>
                    <label>
                        <span>Content</span>
                        <textarea value={draft.content || ''} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Write the article content here" />
                    </label>
                    <label>
                        <span>SEO title</span>
                        <input value={draft.seoTitle || ''} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} placeholder="SEO title" />
                    </label>
                    <label>
                        <span>SEO description</span>
                        <textarea value={draft.seoDescription || ''} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} placeholder="SEO meta description" />
                    </label>
                    <div className="admin-editor-actions">
                        <button type="submit">
                            <CheckCircle2 size={17} />
                            Save post
                        </button>
                        <button type="button" onClick={startNewPost}>
                            <Plus size={17} />
                            New post
                        </button>
                    </div>
                </form>
            </section>

            <section className="admin-panel admin-table-panel">
                <PanelHeader title="Blog library" subtitle={`${posts.length} posts`} Icon={MessageSquareText} />
                <div className="admin-list">
                    {posts.map((post) => (
                        <article key={post.id} className={`admin-list-row admin-edit-row ${post.id === editingId ? 'active' : ''}`}>
                            <div>
                                <strong>{post.title}</strong>
                                <span>{post.category} by {post.author} - {(post.views || 0).toLocaleString()} views - /blog/{post.slug || slugify(post.title)}</span>
                                <small>{post.excerpt || 'No excerpt yet.'}</small>
                            </div>
                            <div className="admin-row-actions">
                                <Badge tone={statusTone[post.status]}>{post.status}</Badge>
                                <button type="button" onClick={() => setEditingId(post.id)}>Edit</button>
                                <button type="button" onClick={() => quickStatus(post, post.status === 'Published' ? 'Draft' : 'Published')}>
                                    {post.status === 'Published' ? 'Unpublish' : 'Publish'}
                                </button>
                                <button type="button" onClick={() => duplicatePost(post)}>Duplicate</button>
                                <button type="button" className="danger" onClick={() => deletePost(post.id)}>Delete</button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

function PagesPanel({ pages, setPages, setNotice }) {
    const blankPage = {
        title: '',
        slug: '',
        hero: '',
        body: '',
        seoTitle: '',
        seoDescription: '',
        owner: 'Marketing',
        status: 'Draft',
        seo: 72,
    };
    const [editingId, setEditingId] = useState(pages[0]?.id || 'new');
    const selectedPage = pages.find((page) => page.id === editingId);
    const [draft, setDraft] = useState(selectedPage || blankPage);

    useEffect(() => {
        const nextPage = pages.find((page) => page.id === editingId);
        setDraft(nextPage || blankPage);
    }, [editingId, pages]);

    function startNewPage() {
        setEditingId('new');
        setDraft(blankPage);
    }

    function savePage(event) {
        event.preventDefault();
        if (!draft.title.trim() || !draft.slug.trim()) return;

        const normalized = {
            ...blankPage,
            ...draft,
            id: editingId === 'new' ? Date.now() : editingId,
            title: draft.title.trim(),
            slug: draft.slug.trim().startsWith('/') ? draft.slug.trim() : `/${draft.slug.trim()}`,
            seoTitle: draft.seoTitle?.trim() || draft.title.trim(),
            seo: Math.min(100, Math.max(0, Number(draft.seo || 72))),
            updated: 'Just now',
        };

        setPages((items) =>
            editingId === 'new'
                ? [normalized, ...items]
                : items.map((item) => (item.id === editingId ? normalized : item))
        );
        setEditingId(normalized.id);
        setNotice(editingId === 'new' ? 'Page draft created.' : 'Page content updated.');
    }

    function duplicatePage(page) {
        const copy = {
            ...page,
            id: Date.now(),
            title: `${page.title} Copy`,
            slug: `${page.slug === '/' ? '/home' : page.slug}-copy`,
            status: 'Draft',
            updated: 'Just now',
        };
        setPages((items) => [copy, ...items]);
        setEditingId(copy.id);
        setNotice('Page duplicated as draft.');
    }

    function deletePage(id) {
        setPages((items) => items.filter((item) => item.id !== id));
        setEditingId('new');
        setNotice('Page deleted.');
    }

    function quickStatus(page, status) {
        setPages((items) =>
            items.map((item) => (item.id === page.id ? { ...item, status, updated: 'Just now' } : item))
        );
        setNotice(`Page marked ${status}.`);
    }

    return (
        <div className="admin-two-column">
            <section className="admin-panel">
                <PanelHeader title={editingId === 'new' ? 'Create page' : 'Edit page'} subtitle="Dynamic page editor" Icon={FilePenLine} />
                <form className="admin-form admin-editor-form" onSubmit={savePage}>
                    <label>
                        <span>Page title</span>
                        <input value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Landing page title" />
                    </label>
                    <label>
                        <span>Slug</span>
                        <input value={draft.slug || ''} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder="/new-page" />
                    </label>
                    <label>
                        <span>Owner</span>
                        <select value={draft.owner || 'Marketing'} onChange={(event) => setDraft({ ...draft, owner: event.target.value })}>
                            <option>Marketing</option>
                            <option>Product</option>
                            <option>Revenue</option>
                            <option>Support</option>
                        </select>
                    </label>
                    <label>
                        <span>Status</span>
                        <select value={draft.status || 'Draft'} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                            <option>Draft</option>
                            <option>Review</option>
                            <option>Live</option>
                        </select>
                    </label>
                    <label>
                        <span>Hero headline</span>
                        <textarea value={draft.hero || ''} onChange={(event) => setDraft({ ...draft, hero: event.target.value })} placeholder="Page hero headline" />
                    </label>
                    <label>
                        <span>Page body</span>
                        <textarea value={draft.body || ''} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Page body content" />
                    </label>
                    <label>
                        <span>SEO title</span>
                        <input value={draft.seoTitle || ''} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} placeholder="SEO title" />
                    </label>
                    <label>
                        <span>SEO description</span>
                        <textarea value={draft.seoDescription || ''} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} placeholder="SEO meta description" />
                    </label>
                    <label>
                        <span>SEO score</span>
                        <input type="number" min="0" max="100" value={draft.seo || 0} onChange={(event) => setDraft({ ...draft, seo: event.target.value })} />
                    </label>
                    <div className="admin-editor-actions">
                        <button type="submit">
                            <CheckCircle2 size={17} />
                            Save page
                        </button>
                        <button type="button" onClick={startNewPage}>
                            <Plus size={17} />
                            New page
                        </button>
                    </div>
                </form>
            </section>

            <section className="admin-panel admin-table-panel">
                <PanelHeader title="Site pages" subtitle="SEO and publishing" Icon={Globe2} />
                <div className="admin-page-grid">
                    {pages.map((page) => (
                        <article key={page.id} className={`admin-page-card admin-edit-card ${page.id === editingId ? 'active' : ''}`}>
                            <div>
                                <strong>{page.title}</strong>
                                <code>{page.slug}</code>
                            </div>
                            <p>{page.hero || 'No hero headline yet.'}</p>
                            <p>{page.owner} - updated {page.updated}</p>
                            <div className="admin-card-foot">
                                <Badge tone={statusTone[page.status]}>{page.status}</Badge>
                                <span>SEO {page.seo}%</span>
                            </div>
                            <div className="admin-row-actions">
                                <button type="button" onClick={() => setEditingId(page.id)}>Edit</button>
                                <button type="button" onClick={() => quickStatus(page, page.status === 'Live' ? 'Draft' : 'Live')}>
                                    {page.status === 'Live' ? 'Unpublish' : 'Publish'}
                                </button>
                                <button type="button" onClick={() => duplicatePage(page)}>Duplicate</button>
                                <button type="button" className="danger" onClick={() => deletePage(page.id)}>Delete</button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

function ServicesPanel({ services, serviceForm, setServiceForm, addService, toggleService }) {
    return (
        <div className="admin-two-column">
            <section className="admin-panel">
                <PanelHeader title="Add service" subtitle="Plans and products" Icon={BriefcaseBusiness} />
                <form className="admin-form" onSubmit={addService}>
                    <label>
                        <span>Service name</span>
                        <input value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} placeholder="Service name" />
                    </label>
                    <label>
                        <span>Plan</span>
                        <select value={serviceForm.plan} onChange={(event) => setServiceForm({ ...serviceForm, plan: event.target.value })}>
                            <option>Starter</option>
                            <option>Pro</option>
                            <option>Agency</option>
                            <option>Enterprise</option>
                        </select>
                    </label>
                    <label>
                        <span>Price</span>
                        <input value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })} />
                    </label>
                    <button type="submit">
                        <Plus size={17} />
                        Add service
                    </button>
                </form>
            </section>

            <section className="admin-panel admin-table-panel">
                <PanelHeader title="Service manager" subtitle={`${services.length} services`} Icon={SlidersHorizontal} />
                <div className="admin-service-grid">
                    {services.map((service) => (
                        <article key={service.id} className="admin-service-card">
                            <div>
                                <strong>{service.name}</strong>
                                <span>{service.plan} - {service.price}</span>
                            </div>
                            <p>{service.queue.toLocaleString()} URLs in queue</p>
                            <div className="admin-card-foot">
                                <Badge tone={statusTone[service.status]}>{service.status}</Badge>
                                <button type="button" onClick={() => toggleService(service.id)}>
                                    {service.status === 'Active' ? 'Pause' : 'Activate'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

function IndexingPanel({ session, rules, setRules, setNotice }) {
    const [urlsText, setUrlsText] = useState('https://example.com/page-1\nhttps://example.com/page-2');
    const [submitting, setSubmitting] = useState(false);
    const parsedUrls = parseUrlList(urlsText);

    async function submitAdminUrls(event) {
        event.preventDefault();

        if (!parsedUrls.length) {
            setNotice('Add at least one valid website URL before submitting.');
            return;
        }

        setSubmitting(true);

        try {
            const token = session?.access_token;

            if (!token) {
                throw new Error('Admin session expired. Please sign in again.');
            }

            const response = await fetch('/api/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    urls: parsedUrls,
                }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to queue URLs.');
            }

            setNotice(`${result.queued || 0} website links queued. ${result.skipped || 0} skipped.`);
        } catch (error) {
            setNotice(error.message || 'Failed to queue website links.');
        } finally {
            setSubmitting(false);
        }
    }

    function updateRule(key, value) {
        setRules((current) => ({ ...current, [key]: value }));
    }

    return (
        <div className="admin-section-grid">
            <section className="admin-panel admin-wide">
                <PanelHeader title="Website indexing system" subtitle="Queue and provider control" Icon={Rocket} />
                <div className="admin-indexing-grid">
                    <form className="admin-form admin-editor-form" onSubmit={submitAdminUrls}>
                        <label>
                            <span>Website links</span>
                            <textarea
                                value={urlsText}
                                onChange={(event) => setUrlsText(event.target.value)}
                                placeholder="Paste website URLs, one per line"
                            />
                        </label>
                        <div className="admin-card-foot">
                            <span>{parsedUrls.length} valid URLs detected</span>
                            <button type="submit" disabled={submitting}>
                                <Rocket size={17} />
                                {submitting ? 'Queueing...' : 'Submit to indexing queue'}
                            </button>
                        </div>
                    </form>

                    <StatusList
                        items={[
                            ['Google Indexing API', rules.googleApi ? 'Enabled' : 'Disabled', rules.googleApi ? 'green' : 'amber'],
                            ['IndexNow', rules.indexNow ? 'Enabled' : 'Disabled', rules.indexNow ? 'green' : 'amber'],
                            ['Sitemap ping', rules.sitemapPing ? 'Enabled' : 'Disabled', rules.sitemapPing ? 'green' : 'amber'],
                            ['Auto retry', rules.autoRetry ? 'Enabled' : 'Disabled', rules.autoRetry ? 'green' : 'amber'],
                        ]}
                    />
                </div>
            </section>

            <section className="admin-panel">
                <PanelHeader title="Provider routing" subtitle="Indexing channels" Icon={SlidersHorizontal} />
                <div className="admin-toggle-grid single">
                    {[
                        ['googleApi', 'Google Indexing API'],
                        ['indexNow', 'IndexNow broadcast'],
                        ['sitemapPing', 'Sitemap ping'],
                        ['rssPing', 'RSS update ping'],
                        ['autoRetry', 'Auto-retry failed URLs'],
                    ].map(([key, label]) => (
                        <label key={key}>
                            <input
                                type="checkbox"
                                checked={Boolean(rules[key])}
                                onChange={(event) => updateRule(key, event.target.checked)}
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </section>

            <section className="admin-panel">
                <PanelHeader title="Queue rules" subtitle="Limits and priority" Icon={Gauge} />
                <div className="admin-form">
                    <label>
                        <span>Daily URL limit per user</span>
                        <input
                            type="number"
                            value={rules.dailyLimit}
                            onChange={(event) => updateRule('dailyLimit', event.target.value)}
                        />
                    </label>
                    <label>
                        <span>Batch size</span>
                        <input
                            type="number"
                            value={rules.batchSize}
                            onChange={(event) => updateRule('batchSize', event.target.value)}
                        />
                    </label>
                    <label>
                        <span>Default priority</span>
                        <select value={rules.priority} onChange={(event) => updateRule('priority', event.target.value)}>
                            <option value="balanced">Balanced</option>
                            <option value="speed">Speed first</option>
                            <option value="quota">Quota saving</option>
                        </select>
                    </label>
                </div>
            </section>

            <section className="admin-panel admin-wide">
                <PanelHeader title="Indexing operations" subtitle="Live system view" Icon={BarChart3} />
                <div className="admin-pipeline">
                    {[
                        ['Queued', '2,450'],
                        ['Processing', '318'],
                        ['Submitted', '18,420'],
                        ['Retrying', '42'],
                        ['Failed', '17'],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <span>{label}</span>
                            <strong>{value}</strong>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function UsersPanel({ users, cycleUserStatus }) {
    return (
        <section className="admin-panel admin-table-panel">
            <PanelHeader title="User management" subtitle="Roles, plans and account state" Icon={UserCog} />
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Plan</th>
                            <th>URLs</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <strong>{user.name}</strong>
                                    <span>{user.email}</span>
                                </td>
                                <td>{user.role}</td>
                                <td>{user.plan}</td>
                                <td>{user.urls.toLocaleString()}</td>
                                <td><Badge tone={statusTone[user.status]}>{user.status}</Badge></td>
                                <td>
                                    <button type="button" onClick={() => cycleUserStatus(user.id)}>Change status</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function OperationsPanel() {
    return (
        <div className="admin-section-grid">
            <section className="admin-panel">
                <PanelHeader title="Queue operations" subtitle="Indexing controls" Icon={Gauge} />
                <StatusList
                    items={[
                        ['Pending URLs', '2,450', 'cyan'],
                        ['Failed retries', '42', 'amber'],
                        ['Worker load', '71%', 'green'],
                        ['Average latency', '340ms', 'green'],
                    ]}
                />
            </section>

            <section className="admin-panel">
                <PanelHeader title="Support inbox" subtitle="Customer handling" Icon={LifeBuoy} />
                <StatusList
                    items={[
                        ['Open tickets', '14', 'amber'],
                        ['Billing questions', '3', 'cyan'],
                        ['API support', '6', 'green'],
                        ['Escalations', '1', 'red'],
                    ]}
                />
            </section>

            <section className="admin-panel admin-wide">
                <PanelHeader title="Audit trail" subtitle="Latest admin actions" Icon={ShieldCheck} />
                <div className="admin-list">
                    {['Updated pricing page SEO title', 'Paused White Label Reports service', 'Approved API article for publishing', 'Changed Demo Account status'].map((item) => (
                        <article key={item} className="admin-list-row">
                            <div>
                                <strong>{item}</strong>
                                <span>Admin - just now</span>
                            </div>
                            <Badge tone="cyan">Logged</Badge>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

function SupportTicketsAdminPanel({ tickets, setTickets, setNotifications, setNotice }) {
    const [liveTickets, setLiveTickets] = useState([]);
    const [liveLoading, setLiveLoading] = useState(true);
    const [supportFilter, setSupportFilter] = useState('all');
    const remoteIds = new Set(liveTickets.map((ticket) => ticket.id));
    const combinedTickets = [
        ...liveTickets,
        ...tickets.filter((ticket) => !remoteIds.has(ticket.id)),
    ];
    const supportStats = {
        all: combinedTickets.length,
        live: combinedTickets.filter((ticket) => ticket.source === 'Live chat').length,
        handover: combinedTickets.filter((ticket) => ticket.source === 'Chat handover').length,
        tickets: combinedTickets.filter((ticket) => ticket.source !== 'Live chat' && ticket.source !== 'Chat handover').length,
        open: combinedTickets.filter((ticket) => ['Open', 'In Progress'].includes(ticket.status)).length,
    };
    const filteredTickets = combinedTickets.filter((ticket) => {
        if (supportFilter === 'live') return ticket.source === 'Live chat';
        if (supportFilter === 'handover') return ticket.source === 'Chat handover';
        if (supportFilter === 'tickets') return ticket.source !== 'Live chat' && ticket.source !== 'Chat handover';
        if (supportFilter === 'open') return ['Open', 'In Progress'].includes(ticket.status);
        return true;
    });

    async function getSupportAuthHeaders() {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) throw new Error('Admin session required.');

        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }

    async function loadLiveTickets() {
        try {
            const response = await fetch('/api/support-realtime', {
                cache: 'no-store',
                headers: await getSupportAuthHeaders(),
            });
            const data = await response.json();
            setLiveTickets(Array.isArray(data.tickets) ? data.tickets : []);
        } catch {
            setLiveTickets([]);
        } finally {
            setLiveLoading(false);
        }
    }

    useEffect(() => {
        loadLiveTickets();
        const timer = window.setInterval(loadLiveTickets, 3500);
        return () => window.clearInterval(timer);
    }, []);

    async function syncLiveTicket(id, updates) {
        const action = updates.reply ? 'admin-reply' : 'update-ticket';
        await fetch('/api/support-realtime', {
            method: 'POST',
            headers: await getSupportAuthHeaders(),
            body: JSON.stringify(
                action === 'admin-reply'
                    ? { action, id, reply: updates.reply }
                    : { action, id, updates }
            ),
        });
        await loadLiveTickets();
    }

    function updateTicket(id, updates) {
        const currentTicket = combinedTickets.find((ticket) => ticket.id === id);
        let updatedTicket;
        setTickets((items) =>
            items.map((ticket) => {
                if (ticket.id !== id) return ticket;
                updatedTicket = { ...ticket, ...updates, updated: 'Just now' };
                return updatedTicket;
            })
        );

        if (updates.reply && (updatedTicket || currentTicket)) {
            const targetTicket = updatedTicket || currentTicket;
            setNotifications((items) => [
                {
                    id: `NTF-${Date.now().toString().slice(-6)}`,
                    to: targetTicket.userEmail,
                    title: `Support reply for ${targetTicket.id}`,
                    message: updates.reply,
                    type: 'Support',
                    status: 'Unread',
                    date: 'Just now',
                },
                ...items,
            ]);
        }
        syncLiveTicket(id, updates).catch(() => {});
        setNotice('Support ticket updated.');
    }

    async function takeHandover(ticket) {
        const handoverReply = ticket.reply || 'A human support agent has taken over this chat handover and will reply shortly.';
        const updates = {
            status: 'In Progress',
            assignedTo: ADMIN_EMAIL,
            reply: handoverReply,
        };
        setTickets((items) =>
            items.map((item) => (item.id === ticket.id ? { ...item, ...updates, updated: 'Just now' } : item))
        );
        setNotifications((items) => [
            {
                id: `NTF-${Date.now().toString().slice(-6)}`,
                to: ticket.userEmail,
                title: `Human support joined ${ticket.id}`,
                message: 'A human support agent has taken over your chat handover. You can continue from your support ticket.',
                type: 'Support',
                status: 'Unread',
                date: 'Just now',
            },
            ...items,
        ]);
        fetch('/api/support-realtime', {
            method: 'POST',
            headers: await getSupportAuthHeaders(),
            body: JSON.stringify({ action: 'take-handover', id: ticket.id, assignedTo: ADMIN_EMAIL, reply: handoverReply }),
        }).then(loadLiveTickets).catch(() => {});
        setNotice(`Human handover ${ticket.id} assigned to admin.`);
    }

    return (
        <section className="admin-panel admin-full">
            <PanelHeader title="Support tickets" subtitle={liveLoading ? 'Syncing live inbox' : 'Live chat, tickets and handovers'} Icon={LifeBuoy} />
            <div className="admin-support-summary">
                {[
                    ['all', 'All', supportStats.all],
                    ['live', 'Live chat', supportStats.live],
                    ['handover', 'Human handover', supportStats.handover],
                    ['tickets', 'Support tickets', supportStats.tickets],
                    ['open', 'Open', supportStats.open],
                ].map(([id, label, count]) => (
                    <button
                        key={id}
                        type="button"
                        className={supportFilter === id ? 'active' : ''}
                        onClick={() => setSupportFilter(id)}
                    >
                        <span>{label}</span>
                        <strong>{count}</strong>
                    </button>
                ))}
            </div>
            <div className="admin-list">
                {filteredTickets.length === 0 && <p className="admin-muted">No support conversations in this view.</p>}
                {filteredTickets.map((ticket) => (
                    <article key={ticket.id} className="admin-list-row admin-edit-row">
                        <div>
                            <strong>{ticket.subject}</strong>
                            <span>{ticket.id} - {ticket.userEmail || 'User'} - {ticket.priority || 'Normal'} - {ticket.updated}</span>
                            {ticket.source && <small>Source: {ticket.source}{ticket.assignedTo ? ` - Assigned to ${ticket.assignedTo}` : ''}</small>}
                            <small>{ticket.message}</small>
                            {Array.isArray(ticket.messages) && ticket.messages.length > 0 && (
                                <div className="admin-ticket-thread">
                                    {ticket.messages.slice(-6).map((message) => (
                                        <span key={message.id} className={message.role === 'admin' ? 'admin' : ''}>
                                            <b>{message.role === 'admin' ? 'Admin' : 'User'}:</b> {message.text}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {ticket.reply && <small>Reply: {ticket.reply}</small>}
                        </div>
                        <div className="admin-row-actions">
                            <Badge tone={statusTone[ticket.status]}>{ticket.status}</Badge>
                            {(ticket.source === 'Chat handover' || ticket.source === 'Live chat') && ticket.status !== 'In Progress' && (
                                <button type="button" onClick={() => takeHandover(ticket)}>Take handover</button>
                            )}
                            <button type="button" onClick={() => updateTicket(ticket.id, { status: 'Open' })}>Open</button>
                            <button type="button" onClick={() => updateTicket(ticket.id, { status: 'Resolved' })}>Resolve</button>
                        </div>
                        <form
                            className="admin-form admin-inline-reply"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const reply = new FormData(event.currentTarget).get('reply')?.toString().trim();
                                if (reply) updateTicket(ticket.id, { reply, status: 'Answered' });
                                event.currentTarget.reset();
                            }}
                        >
                            <input name="reply" placeholder="Write admin reply" />
                            <button type="submit">Send reply</button>
                        </form>
                    </article>
                ))}
            </div>
        </section>
    );
}

function NotificationsAdminPanel({ notifications, setNotifications, users, form, setForm, setNotice, switchSection }) {
    const [filter, setFilter] = useState('all');
    const templates = [
        {
            label: 'Order approved',
            title: 'Order approved',
            message: 'Your order has been approved and added to your dashboard. You can track progress from Orders.',
        },
        {
            label: 'Top-up pending',
            title: 'Top-up under review',
            message: 'We received your payment top-up request. Admin is reviewing the proof and will update your wallet shortly.',
        },
        {
            label: 'Indexing complete',
            title: 'Indexing batch completed',
            message: 'Your submitted URLs have finished processing. Open the indexing dashboard to review the latest status.',
        },
        {
            label: 'Support reply',
            title: 'Support ticket updated',
            message: 'Our support team replied to your ticket. Please check the Support section for the latest response.',
        },
    ];
    const stats = {
        total: notifications.length,
        unread: notifications.filter((item) => item.status === 'Unread').length,
        admin: notifications.filter((item) => item.to === 'admin').length,
        users: notifications.filter((item) => item.to !== 'admin').length,
    };
    const filteredNotifications = notifications.filter((item) => {
        if (filter === 'unread') return item.status === 'Unread';
        if (filter === 'admin') return item.to === 'admin';
        if (filter === 'users') return item.to !== 'admin';
        return true;
    });

    function sendNotification(event) {
        event.preventDefault();
        if (!form.title.trim() || !form.message.trim()) return;

        setNotifications((items) => [
            {
                id: `NTF-${Date.now().toString().slice(-6)}`,
                to: form.to,
                title: form.title.trim(),
                message: form.message.trim(),
                type: 'Admin',
                status: 'Unread',
                date: 'Just now',
            },
            ...items,
        ]);
        setForm({ to: 'all', title: '', message: '' });
        setNotice('Notification sent.');
    }

    function useTemplate(template) {
        setForm({ ...form, title: template.title, message: template.message });
    }

    function updateNotification(id, updates) {
        setNotifications((items) =>
            items.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
    }

    function deleteNotification(id) {
        setNotifications((items) => items.filter((item) => item.id !== id));
        setNotice('Notification deleted.');
    }

    function markAdminRead() {
        setNotifications((items) =>
            items.map((item) => (item.to === 'admin' ? { ...item, status: 'Read' } : item))
        );
        setNotice('Admin notifications marked as read.');
    }

    function clearRead() {
        setNotifications((items) => items.filter((item) => item.status !== 'Read'));
        setNotice('Read notifications cleared.');
    }

    function openNotification(item) {
        updateNotification(item.id, { status: 'Read' });
        switchSection(getNotificationSection(item, 'admin'));
    }

    return (
        <div className="admin-notification-center">
            <section className="admin-notification-hero">
                <div>
                    <span>Notification center</span>
                    <h2>Manage real-time admin and user alerts</h2>
                    <p>Track handovers, orders, support tickets and send updates to all users or a single account.</p>
                </div>
                <div className="admin-notification-actions">
                    <button type="button" onClick={markAdminRead}>Mark admin read</button>
                    <button type="button" onClick={clearRead}>Clear read</button>
                </div>
            </section>

            <section className="admin-notification-stats" aria-label="Notification summary">
                <MetricCard title="Total alerts" value={stats.total} label="All messages" Icon={Bell} />
                <MetricCard title="Unread" value={stats.unread} label="Needs review" Icon={MessageSquareText} />
                <MetricCard title="Admin inbox" value={stats.admin} label="System events" Icon={ShieldCheck} />
                <MetricCard title="User alerts" value={stats.users} label="Sent to users" Icon={Users} />
            </section>

            <div className="admin-notification-layout">
                <section className="admin-panel">
                    <PanelHeader title="Send notification" subtitle="Admin to user" Icon={Send} />
                    <div className="admin-template-grid">
                        {templates.map((template) => (
                            <button key={template.label} type="button" onClick={() => useTemplate(template)}>
                                {template.label}
                            </button>
                        ))}
                    </div>
                <form className="admin-form" onSubmit={sendNotification}>
                    <label>
                        <span>Recipient</span>
                        <select value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })}>
                            <option value="all">All users</option>
                            <option value="user">All signed-in users</option>
                            {users.map((user) => <option key={user.email} value={user.email}>{user.email}</option>)}
                        </select>
                    </label>
                    <label>
                        <span>Title</span>
                        <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                    </label>
                    <label>
                        <span>Message</span>
                        <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
                    </label>
                    <button type="submit">Send notification</button>
                </form>
            </section>

                <section className="admin-panel admin-notification-inbox">
                    <div className="admin-notification-head">
                        <PanelHeader title="Notification inbox" subtitle="Latest messages" Icon={MessageSquareText} />
                        <div className="admin-filter-pills" role="tablist" aria-label="Notification filters">
                            {[
                                ['all', 'All'],
                                ['unread', 'Unread'],
                                ['admin', 'Admin'],
                                ['users', 'Users'],
                            ].map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={filter === id ? 'active' : ''}
                                    onClick={() => setFilter(id)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-notification-list">
                        {filteredNotifications.length === 0 && <p className="admin-muted">No notifications in this view.</p>}
                        {filteredNotifications.map((item) => (
                            <article key={item.id} className={`admin-notification-card ${item.status === 'Unread' ? 'unread' : ''}`}>
                                <button type="button" className="admin-notification-card-main" onClick={() => openNotification(item)}>
                                    <div className="admin-notification-card-title">
                                        <strong>{item.title}</strong>
                                        <Badge tone={item.status === 'Unread' ? 'amber' : 'green'}>{item.status}</Badge>
                                    </div>
                                    <span>{item.to} - {item.type || 'System'} - {item.date || 'Just now'}</span>
                                    <p>{item.message}</p>
                                </button>
                                <div className="admin-row-actions">
                                    <button
                                        type="button"
                                        onClick={() => updateNotification(item.id, { status: item.status === 'Unread' ? 'Read' : 'Unread' })}
                                    >
                                        {item.status === 'Unread' ? 'Mark read' : 'Unread'}
                                    </button>
                                    <button type="button" className="danger" onClick={() => deleteNotification(item.id)}>Delete</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function PaymentsAdminPanel({ requests, setRequests, settings, setSettings, setNotice }) {
    const [editingGatewayId, setEditingGatewayId] = useState(null);
    const [gatewayForm, setGatewayForm] = useState(blankGatewayForm);
    const pending = requests.filter((request) => request.status === 'Pending').length;
    const approved = requests.filter((request) => request.status === 'Approved').length;
    const totalApproved = requests
        .filter((request) => request.status === 'Approved')
        .reduce((sum, request) => sum + Number(request.amount || 0), 0);
    const gateways = normalizePaymentGateways(settings.gateways);
    const gatewayGroups = ['International', 'Local Bank', 'Indian gateways'].map((region) => ({
        region,
        gateways: gateways.filter((gateway) => gateway.region === region),
    }));

    function updateRequest(id, status) {
        setRequests((items) =>
            items.map((request) =>
                request.id === id
                    ? {
                        ...request,
                        status,
                        reviewedAt: 'Just now',
                        note: status === 'Approved' ? 'Approved by admin' : 'Rejected by admin',
                    }
                    : request
            )
        );
        setNotice(`Payment request ${status.toLowerCase()}.`);
    }

    function updateSetting(key, value) {
        const gatewayMap = {
            stripe: 'stripe',
            paypal: 'paypal',
            razorpay: 'razorpay',
            bankTransfer: 'bank-transfer',
        };

        setSettings((current) => ({
            ...current,
            [key]: value,
            gateways: gatewayMap[key]
                ? normalizePaymentGateways(current.gateways).map((gateway) =>
                    gateway.id === gatewayMap[key] ? { ...gateway, status: value ? 'Active' : 'Disabled' } : gateway
                )
                : normalizePaymentGateways(current.gateways),
        }));
    }

    function updateGateway(id, updates) {
        setSettings((current) => ({
            ...current,
            gateways: normalizePaymentGateways(current.gateways).map((gateway) =>
                gateway.id === id ? { ...gateway, ...updates } : gateway
            ),
        }));
    }

    function removeGateway(id) {
        setSettings((current) => ({
            ...current,
            gateways: normalizePaymentGateways(current.gateways).filter((gateway) => gateway.id !== id),
        }));
        if (editingGatewayId === id) {
            setEditingGatewayId(null);
            setGatewayForm(blankGatewayForm());
        }
        setNotice('Payment gateway removed.');
    }

    function editGateway(gateway) {
        const normalized = normalizePaymentGateway(gateway);
        setEditingGatewayId(normalized.id);
        setGatewayForm({
            name: normalized.name,
            region: normalized.region,
            type: normalized.type,
            fee: normalized.fee,
            apiKey: normalized.apiKey,
            secretKey: normalized.secretKey,
            merchantId: normalized.merchantId,
            webhookUrl: normalized.webhookUrl,
            instructions: normalized.instructions,
        });
        setNotice(`Editing ${normalized.name} gateway details.`);
    }

    function resetGatewayForm() {
        setEditingGatewayId(null);
        setGatewayForm(blankGatewayForm());
    }

    function saveGateway(event) {
        event.preventDefault();
        const name = gatewayForm.name.trim();
        if (!name) return;

        const payload = {
            name,
            region: gatewayForm.region,
            type: gatewayForm.type,
            status: 'Active',
            fee: gatewayForm.fee.trim() || 'Custom fee',
            apiKey: gatewayForm.apiKey.trim(),
            secretKey: gatewayForm.secretKey.trim(),
            merchantId: gatewayForm.merchantId.trim(),
            webhookUrl: gatewayForm.webhookUrl.trim(),
            instructions: gatewayForm.instructions.trim() || 'Admin managed payment gateway.',
        };

        setSettings((current) => ({
            ...current,
            gateways: editingGatewayId
                ? normalizePaymentGateways(current.gateways).map((gateway) =>
                    gateway.id === editingGatewayId ? { ...gateway, ...payload } : gateway
                )
                : [
                    {
                        id: `${slugify(name)}-${Date.now().toString().slice(-5)}`,
                        ...payload,
                    },
                    ...normalizePaymentGateways(current.gateways),
                ],
        }));
        setNotice(`${name} payment gateway ${editingGatewayId ? 'updated' : 'added'}.`);
        resetGatewayForm();
    }

    return (
        <div className="admin-section-grid">
            <MetricCard title="Pending top-ups" value={pending} label="Need admin review" Icon={CreditCard} />
            <MetricCard title="Approved" value={approved} label="Completed requests" Icon={CheckCircle2} />
            <MetricCard title="Approved value" value={`$${totalApproved.toFixed(2)}`} label="Wallet credit released" Icon={Landmark} />
            <MetricCard title="Mode" value={settings.mode === 'live' ? 'Live' : 'Test'} label="Payment environment" Icon={SlidersHorizontal} />

            <section className="admin-panel admin-full">
                <PanelHeader title="Top-up approval queue" subtitle="User payment requests" Icon={CreditCard} />
                {requests.length === 0 ? (
                    <p className="admin-muted">No top-up requests yet. User requests will appear here for approval.</p>
                ) : (
                    <div className="admin-list">
                        {requests.map((request) => (
                            <article key={request.id} className="admin-list-row admin-edit-row">
                                <div>
                                    <strong>{request.userName || request.userEmail} requested ${Number(request.amount || 0).toFixed(2)}</strong>
                                    <span>{request.id} - {request.userEmail} - {request.gateway} - {request.date}</span>
                                    <small>{request.note}</small>
                                </div>
                                <div className="admin-row-actions">
                                    <Badge tone={statusTone[request.status]}>{request.status}</Badge>
                                    <button type="button" onClick={() => updateRequest(request.id, 'Approved')} disabled={request.status === 'Approved'}>
                                        Approve
                                    </button>
                                    <button type="button" className="danger" onClick={() => updateRequest(request.id, 'Rejected')} disabled={request.status === 'Rejected'}>
                                        Reject
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-panel admin-full">
                <PanelHeader title="Gateway and top-up settings" subtitle="Admin managed" Icon={Settings} />
                <div className="admin-config-grid">
                    <div className="admin-form">
                        <label>
                            <span>Default currency</span>
                            <select value={settings.defaultCurrency} onChange={(event) => updateSetting('defaultCurrency', event.target.value)}>
                                <option value="usd">USD - US Dollar</option>
                                <option value="sar">SAR - Saudi Riyal</option>
                                <option value="bdt">BDT - Bangladeshi Taka</option>
                                <option value="inr">INR - Indian Rupee</option>
                            </select>
                        </label>
                        <label>
                            <span>Payment mode</span>
                            <select value={settings.mode} onChange={(event) => updateSetting('mode', event.target.value)}>
                                <option value="live">Live</option>
                                <option value="sandbox">Sandbox/Test</option>
                            </select>
                        </label>
                        <label>
                            <span>Minimum top-up</span>
                            <input
                                type="number"
                                value={settings.minTopup}
                                onChange={(event) => updateSetting('minTopup', Number(event.target.value))}
                            />
                        </label>
                        <label>
                            <span>Webhook secret</span>
                            <input type="password" placeholder="Payment webhook signing secret" />
                        </label>
                    </div>

                    <div className="admin-toggle-grid single">
                        {[
                            ['stripe', 'Stripe international cards'],
                            ['paypal', 'PayPal international'],
                            ['razorpay', 'Razorpay / UPI India'],
                            ['bankTransfer', 'Local bank transfer'],
                            ['manualBankReview', 'Manual bank review required'],
                            ['autoApprove', 'Auto-approve verified gateway payments'],
                        ].map(([key, label]) => (
                            <label key={key}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(settings[key])}
                                    onChange={(event) => updateSetting(key, event.target.checked)}
                                />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </section>

            <section className="admin-panel admin-full">
                <PanelHeader
                    title={editingGatewayId ? 'Edit payment gateway' : 'Add payment gateway'}
                    subtitle="API credentials, coverage and details"
                    Icon={Plus}
                />
                <form className="admin-form admin-payment-form" onSubmit={saveGateway}>
                    <label>
                        <span>Gateway name</span>
                        <input
                            value={gatewayForm.name}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, name: event.target.value }))}
                            placeholder="Example: Cashfree, PayU, Local Bank"
                        />
                    </label>
                    <label>
                        <span>Coverage</span>
                        <select
                            value={gatewayForm.region}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, region: event.target.value }))}
                        >
                            <option value="International">International</option>
                            <option value="Local Bank">Local Bank</option>
                            <option value="Indian gateways">Indian gateways</option>
                        </select>
                    </label>
                    <label>
                        <span>Gateway type</span>
                        <select
                            value={gatewayForm.type}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, type: event.target.value }))}
                        >
                            <option value="Card gateway">Card gateway</option>
                            <option value="Wallet gateway">Wallet gateway</option>
                            <option value="Manual bank">Manual bank</option>
                            <option value="UPI and card">UPI and card</option>
                            <option value="Crypto gateway">Crypto gateway</option>
                        </select>
                    </label>
                    <label>
                        <span>Fee / note</span>
                        <input
                            value={gatewayForm.fee}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, fee: event.target.value }))}
                            placeholder="2.9%, manual, no fee"
                        />
                    </label>
                    <label>
                        <span>API key</span>
                        <input
                            value={gatewayForm.apiKey}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, apiKey: event.target.value }))}
                            placeholder="Public API key / client ID"
                        />
                    </label>
                    <label>
                        <span>Secret key</span>
                        <input
                            type="password"
                            value={gatewayForm.secretKey}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, secretKey: event.target.value }))}
                            placeholder="Secret key / private token"
                        />
                    </label>
                    <label>
                        <span>Merchant ID</span>
                        <input
                            value={gatewayForm.merchantId}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, merchantId: event.target.value }))}
                            placeholder="Merchant, account or terminal ID"
                        />
                    </label>
                    <label>
                        <span>Webhook URL</span>
                        <input
                            value={gatewayForm.webhookUrl}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, webhookUrl: event.target.value }))}
                            placeholder="https://speedyindexer.com/api/payments/webhook"
                        />
                    </label>
                    <label className="admin-form-wide">
                        <span>Gateway details</span>
                        <input
                            value={gatewayForm.instructions}
                            onChange={(event) => setGatewayForm((current) => ({ ...current, instructions: event.target.value }))}
                            placeholder="Bank account, UPI ID, checkout details, setup notes"
                        />
                    </label>
                    <button type="submit">
                        <Plus size={17} />
                        {editingGatewayId ? 'Save gateway' : 'Add gateway'}
                    </button>
                    {editingGatewayId && (
                        <button type="button" className="admin-secondary-button" onClick={resetGatewayForm}>
                            Cancel edit
                        </button>
                    )}
                </form>
            </section>

            <section className="admin-panel admin-full">
                <PanelHeader title="Gateway coverage" subtitle="International, local and India" Icon={Globe2} />
                <div className="admin-payment-groups">
                    {gatewayGroups.map(({ region, gateways: groupGateways }) => (
                        <PaymentGroup
                            key={region}
                            title={region}
                            Icon={region === 'International' ? Globe2 : region === 'Local Bank' ? Landmark : IndianRupee}
                            gateways={groupGateways}
                            onToggle={updateGateway}
                            onEdit={editGateway}
                            onRemove={removeGateway}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

function SettingsPanel({ chatSettings, setChatSettings, adminSettings, setAdminSettings }) {
    const settings = {
        ...initialAdminSettings,
        ...adminSettings,
        recaptcha: { ...initialAdminSettings.recaptcha, ...(adminSettings?.recaptcha || {}) },
        integrations: { ...initialAdminSettings.integrations, ...(adminSettings?.integrations || {}) },
        smtp: { ...initialAdminSettings.smtp, ...(adminSettings?.smtp || {}) },
        seo: { ...initialAdminSettings.seo, ...(adminSettings?.seo || {}) },
        alerts: { ...initialAdminSettings.alerts, ...(adminSettings?.alerts || {}) },
    };

    function updateSetting(section, key, value) {
        setAdminSettings((current) => ({
            ...initialAdminSettings,
            ...current,
            [section]: {
                ...initialAdminSettings[section],
                ...(current?.[section] || {}),
                [key]: value,
            },
        }));
    }

    return (
        <div className="admin-section-grid">
            <section className="admin-panel admin-wide">
                <PanelHeader title="AI chat and WhatsApp" subtitle="Frontend assistant" Icon={MessageSquareText} />
                <div className="admin-config-grid">
                    <div className="admin-form">
                        <label>
                            <span>Chat title</span>
                            <input value={chatSettings.title} onChange={(event) => setChatSettings({ ...chatSettings, title: event.target.value })} />
                        </label>
                        <label>
                            <span>Welcome message</span>
                            <input value={chatSettings.welcome} onChange={(event) => setChatSettings({ ...chatSettings, welcome: event.target.value })} />
                        </label>
                        <label>
                            <span>WhatsApp number</span>
                            <input value={chatSettings.whatsapp} onChange={(event) => setChatSettings({ ...chatSettings, whatsapp: event.target.value })} placeholder="+15550000000" />
                        </label>
                        <label>
                            <span>AI instruction</span>
                            <textarea value={chatSettings.prompt} onChange={(event) => setChatSettings({ ...chatSettings, prompt: event.target.value })} />
                        </label>
                    </div>
                    <div className="admin-toggle-grid single">
                        <label>
                            <input type="checkbox" checked={Boolean(chatSettings.enabled)} onChange={(event) => setChatSettings({ ...chatSettings, enabled: event.target.checked })} />
                            <span>Enable frontend AI chat widget</span>
                        </label>
                        <GatewayCard name="WhatsApp handoff" status={chatSettings.whatsapp ? 'Ready' : 'Missing'} tone={chatSettings.whatsapp ? 'green' : 'amber'} />
                        <GatewayCard name="Admin editable" status="Enabled" tone="green" />
                    </div>
                </div>
            </section>

            <section className="admin-panel admin-wide">
                <PanelHeader title="reCAPTCHA and bot protection" subtitle="Security gateways" Icon={Bot} />
                <div className="admin-config-grid">
                    <div className="admin-form">
                        <label>
                            <span>Provider</span>
                            <select value={settings.recaptcha.provider} onChange={(event) => updateSetting('recaptcha', 'provider', event.target.value)}>
                                <option value="google-recaptcha-v3">Google reCAPTCHA v3</option>
                                <option value="google-recaptcha-v2">Google reCAPTCHA v2 Checkbox</option>
                                <option value="cloudflare-turnstile">Cloudflare Turnstile</option>
                                <option value="disabled">Disabled</option>
                            </select>
                        </label>
                        <label>
                            <span>Site key</span>
                            <input value={settings.recaptcha.siteKey} onChange={(event) => updateSetting('recaptcha', 'siteKey', event.target.value)} placeholder="Public site key" />
                        </label>
                        <label>
                            <span>Secret key</span>
                            <input type="password" value={settings.recaptcha.secretKey} onChange={(event) => updateSetting('recaptcha', 'secretKey', event.target.value)} placeholder="Private secret key" />
                        </label>
                        <label>
                            <span>Score threshold</span>
                            <input value={settings.recaptcha.threshold} onChange={(event) => updateSetting('recaptcha', 'threshold', event.target.value)} placeholder="0.5" />
                        </label>
                        <div className="admin-toggle-grid single">
                            {[
                                ['login', 'Protect login'],
                                ['signup', 'Protect signup'],
                                ['contact', 'Protect contact form'],
                            ].map(([key, label]) => (
                                <label key={key}>
                                    <input type="checkbox" checked={Boolean(settings.recaptcha[key])} onChange={(event) => updateSetting('recaptcha', key, event.target.checked)} />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <StatusList
                        items={[
                            ['Login protection', settings.recaptcha.login ? 'Enabled' : 'Disabled', settings.recaptcha.login ? 'green' : 'red'],
                            ['Signup protection', settings.recaptcha.signup ? 'Enabled' : 'Disabled', settings.recaptcha.signup ? 'green' : 'red'],
                            ['Contact form', settings.recaptcha.contact ? 'Enabled' : 'Optional', settings.recaptcha.contact ? 'green' : 'amber'],
                            ['Score threshold', settings.recaptcha.threshold, 'cyan'],
                        ]}
                    />
                </div>
            </section>

            <section className="admin-panel admin-wide">
                <PanelHeader title="Google and Cloudflare" subtitle="Platform integrations" Icon={Cloud} />
                <div className="admin-config-grid">
                    <div className="admin-form">
                        <label>
                            <span>Google Search Console property</span>
                            <input value={settings.integrations.searchConsole} onChange={(event) => updateSetting('integrations', 'searchConsole', event.target.value)} />
                        </label>
                        <label>
                            <span>Google Analytics / Tag ID</span>
                            <input value={settings.integrations.analyticsId} onChange={(event) => updateSetting('integrations', 'analyticsId', event.target.value)} placeholder="G-XXXXXXXXXX or GTM-XXXXXXX" />
                        </label>
                        <label>
                            <span>Cloudflare Zone ID</span>
                            <input value={settings.integrations.cloudflareZoneId} onChange={(event) => updateSetting('integrations', 'cloudflareZoneId', event.target.value)} placeholder="Cloudflare zone id" />
                        </label>
                        <label>
                            <span>Cloudflare API token</span>
                            <input type="password" value={settings.integrations.cloudflareApiToken} onChange={(event) => updateSetting('integrations', 'cloudflareApiToken', event.target.value)} placeholder="Scoped API token" />
                        </label>
                        <label>
                            <input type="checkbox" checked={Boolean(settings.integrations.cachePurge)} onChange={(event) => updateSetting('integrations', 'cachePurge', event.target.checked)} />
                            <span>Enable Cloudflare cache purge</span>
                        </label>
                    </div>
                    <div className="admin-gateway-grid">
                        <GatewayCard name="Google Indexing API" status="Connected" tone="green" />
                        <GatewayCard name="Search Console" status={settings.integrations.searchConsole ? 'Ready' : 'Missing'} tone={settings.integrations.searchConsole ? 'cyan' : 'amber'} />
                        <GatewayCard name="Cloudflare DNS" status={settings.integrations.cloudflareApiToken ? 'Ready' : 'Token needed'} tone={settings.integrations.cloudflareApiToken ? 'green' : 'amber'} />
                        <GatewayCard name="Cloudflare Cache" status={settings.integrations.cachePurge ? 'Purge enabled' : 'Disabled'} tone={settings.integrations.cachePurge ? 'green' : 'red'} />
                    </div>
                </div>
            </section>

            <section className="admin-panel admin-wide">
                <PanelHeader title="SMTP email manager" subtitle="Transactional email" Icon={Send} />
                <div className="admin-config-grid">
                    <div className="admin-form">
                        <label>
                            <span>SMTP provider</span>
                            <select value={settings.smtp.provider} onChange={(event) => updateSetting('smtp', 'provider', event.target.value)}>
                                <option value="custom">Custom SMTP</option>
                                <option value="sendgrid">SendGrid</option>
                                <option value="mailgun">Mailgun</option>
                                <option value="ses">Amazon SES</option>
                                <option value="postmark">Postmark</option>
                            </select>
                        </label>
                        <label>
                            <span>SMTP host</span>
                            <input value={settings.smtp.host} onChange={(event) => updateSetting('smtp', 'host', event.target.value)} placeholder="smtp.example.com" />
                        </label>
                        <label>
                            <span>Port</span>
                            <input value={settings.smtp.port} onChange={(event) => updateSetting('smtp', 'port', event.target.value)} />
                        </label>
                        <label>
                            <span>Username</span>
                            <input value={settings.smtp.username} onChange={(event) => updateSetting('smtp', 'username', event.target.value)} placeholder="SMTP username" />
                        </label>
                        <label>
                            <span>Password / API key</span>
                            <input type="password" value={settings.smtp.password} onChange={(event) => updateSetting('smtp', 'password', event.target.value)} placeholder="SMTP password or API key" />
                        </label>
                        <label>
                            <span>From email</span>
                            <input value={settings.smtp.fromEmail} onChange={(event) => updateSetting('smtp', 'fromEmail', event.target.value)} />
                        </label>
                        <div className="admin-toggle-grid single">
                            {[
                                ['signupEmail', 'Signup email'],
                                ['passwordReset', 'Password reset'],
                                ['orderReceipt', 'Order receipt'],
                                ['adminAlert', 'Admin alert'],
                            ].map(([key, label]) => (
                                <label key={key}>
                                    <input type="checkbox" checked={Boolean(settings.smtp[key])} onChange={(event) => updateSetting('smtp', key, event.target.checked)} />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <StatusList
                        items={[
                            ['Signup email', settings.smtp.signupEmail ? 'Enabled' : 'Disabled', settings.smtp.signupEmail ? 'green' : 'red'],
                            ['Password reset', settings.smtp.passwordReset ? 'Enabled' : 'Disabled', settings.smtp.passwordReset ? 'green' : 'red'],
                            ['Order receipt', settings.smtp.orderReceipt ? 'Enabled' : 'Disabled', settings.smtp.orderReceipt ? 'green' : 'red'],
                            ['Admin alert', settings.smtp.adminAlert ? 'Enabled' : 'Disabled', settings.smtp.adminAlert ? 'cyan' : 'red'],
                        ]}
                    />
                </div>
            </section>

            <section className="admin-panel admin-wide">
                <PanelHeader title="SEO and search engines" subtitle="Google and others" Icon={SearchCheck} />
                <div className="admin-config-grid">
                    <div className="admin-form">
                        <label>
                            <span>Site title</span>
                            <input value={settings.seo.siteTitle} onChange={(event) => updateSetting('seo', 'siteTitle', event.target.value)} />
                        </label>
                        <label>
                            <span>Default description</span>
                            <textarea value={settings.seo.description} onChange={(event) => updateSetting('seo', 'description', event.target.value)} />
                        </label>
                        <label>
                            <span>Robots policy</span>
                            <select value={settings.seo.robots} onChange={(event) => updateSetting('seo', 'robots', event.target.value)}>
                                <option value="index-follow">Index, follow</option>
                                <option value="noindex-follow">Noindex, follow</option>
                                <option value="noindex-nofollow">Noindex, nofollow</option>
                            </select>
                        </label>
                        <div className="admin-toggle-grid single">
                            {[
                                ['sitemapPing', 'Google sitemap ping'],
                                ['bingIndexNow', 'Bing IndexNow'],
                                ['yandexIndexNow', 'Yandex IndexNow'],
                                ['schema', 'Schema markup'],
                            ].map(([key, label]) => (
                                <label key={key}>
                                    <input type="checkbox" checked={Boolean(settings.seo[key])} onChange={(event) => updateSetting('seo', key, event.target.checked)} />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="admin-gateway-grid">
                        <GatewayCard name="Google sitemap ping" status={settings.seo.sitemapPing ? 'Enabled' : 'Disabled'} tone={settings.seo.sitemapPing ? 'green' : 'red'} />
                        <GatewayCard name="Bing IndexNow" status={settings.seo.bingIndexNow ? 'Enabled' : 'Disabled'} tone={settings.seo.bingIndexNow ? 'green' : 'red'} />
                        <GatewayCard name="Yandex IndexNow" status={settings.seo.yandexIndexNow ? 'Enabled' : 'Disabled'} tone={settings.seo.yandexIndexNow ? 'green' : 'red'} />
                        <GatewayCard name="Schema markup" status={settings.seo.schema ? 'Configured' : 'Disabled'} tone={settings.seo.schema ? 'cyan' : 'red'} />
                    </div>
                </div>
            </section>

            <section className="admin-panel">
                <PanelHeader title="Admin roles" subtitle="Permissions" Icon={ShieldCheck} />
                <StatusList
                    items={[
                        ['Owner', 'Full access', 'green'],
                        ['Editor', 'Content only', 'cyan'],
                        ['Support', 'Users and tickets', 'amber'],
                        ['Analyst', 'Read only', 'cyan'],
                    ]}
                />
            </section>

            <section className="admin-panel">
                <PanelHeader title="Notifications" subtitle="Operational alerts" Icon={Mail} />
                <div className="admin-toggle-grid single">
                    {[
                        ['newUserSignup', 'New user signup'],
                        ['paymentFailed', 'Payment failed'],
                        ['queueFailure', 'Queue failure'],
                        ['blogReview', 'Blog review request'],
                        ['securityLogin', 'Security login alert'],
                        ['dailyReport', 'Daily report'],
                    ].map(([key, label]) => (
                        <label key={key}>
                            <input
                                type="checkbox"
                                checked={Boolean(settings.alerts[key])}
                                onChange={(event) => updateSetting('alerts', key, event.target.checked)}
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </section>
        </div>
    );
}

function GatewayCard({ name, status, tone }) {
    return (
        <article className="admin-gateway-card">
            <strong>{name}</strong>
            <Badge tone={tone}>{status}</Badge>
        </article>
    );
}

function PaymentGroup({ title, Icon, gateways, onToggle, onEdit, onRemove }) {
    return (
        <section className="admin-payment-group">
            <header>
                <Icon size={19} />
                <h3>{title}</h3>
            </header>
            <div className="admin-list compact">
                {gateways.length === 0 && <p className="admin-muted">No gateways added yet.</p>}
                {gateways.map((gateway) => (
                    <article key={gateway.id} className="admin-list-row">
                        <div>
                            <strong>{gateway.name}</strong>
                            <span>{gateway.type} - {gateway.fee}</span>
                            <small>{gateway.instructions}</small>
                            <small>
                                API: {gateway.apiKey ? 'Added' : 'Missing'} - Secret: {gateway.secretKey ? 'Added' : 'Missing'}
                                {gateway.merchantId ? ` - Merchant: ${gateway.merchantId}` : ''}
                            </small>
                            {gateway.webhookUrl && <small>Webhook: {gateway.webhookUrl}</small>}
                        </div>
                        <div className="admin-row-actions">
                            <Badge tone={gateway.status === 'Active' ? 'green' : 'red'}>{gateway.status}</Badge>
                            <button type="button" onClick={() => onEdit(gateway)}>
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => onToggle(gateway.id, { status: gateway.status === 'Active' ? 'Disabled' : 'Active' })}
                            >
                                {gateway.status === 'Active' ? 'Disable' : 'Activate'}
                            </button>
                            <button type="button" className="danger" onClick={() => onRemove(gateway.id)}>
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function MetricCard({ title, value, label, Icon }) {
    return (
        <article className="admin-metric">
            <div>
                <span>{title}</span>
                <strong>{value}</strong>
                <p>{label}</p>
            </div>
            <Icon size={22} />
        </article>
    );
}

function PanelHeader({ title, subtitle, Icon }) {
    return (
        <header className="admin-panel-header">
            <div>
                <span>{subtitle}</span>
                <h2>{title}</h2>
            </div>
            <Icon size={20} />
        </header>
    );
}

function Badge({ children, tone = 'cyan' }) {
    return <span className={`admin-badge ${tone}`}>{children}</span>;
}

function StatusList({ items }) {
    return (
        <div className="admin-status-list">
            {items.map(([label, value, tone]) => (
                <div key={label}>
                    <span>{label}</span>
                    <Badge tone={tone}>{value}</Badge>
                </div>
            ))}
        </div>
    );
}
