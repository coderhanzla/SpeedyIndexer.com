export const staticPages = {
    changelog: {
        path: '/changelog',
        badge: 'Product updates',
        title: 'Changelog',
        description: 'Follow SpeedyIndexer platform improvements, indexing workflow releases, payment updates and dashboard refinements.',
        sections: [
            { kicker: 'May 2026', title: 'Admin and user dashboards', body: 'Added payment approvals, dynamic gateway management, website indexing controls, notifications, support tickets and improved responsive layouts.' },
            { kicker: 'May 2026', title: 'Bulk indexing workflow', body: 'Improved URL submission with bulk paste, sitemap support, duplicate handling and upload-friendly dashboard controls.' },
            { kicker: 'May 2026', title: 'Support and chat', body: 'Introduced AI chat, WhatsApp handoff, human handover tickets and admin notification tracking.' },
        ],
    },
    status: {
        path: '/status',
        badge: 'System status',
        title: 'Status',
        description: 'Current availability for SpeedyIndexer web app, admin dashboard, indexing queue, payment requests and support systems.',
        sections: [
            { kicker: 'Operational', title: 'Web application', body: 'The public website, pricing pages, user dashboard and admin dashboard are available.' },
            { kicker: 'Operational', title: 'Indexing queue', body: 'URL queue submissions are authenticated and processed through the configured indexing worker pipeline.' },
            { kicker: 'Operational', title: 'Support and notifications', body: 'Support tickets, local notifications and chat handover workflows are active in the dashboard experience.' },
        ],
    },
    careers: {
        path: '/careers',
        badge: 'Careers',
        title: 'Build the future of SEO indexing',
        description: 'Join SpeedyIndexer to work on scalable URL discovery, search engine automation, API systems and agency-grade SEO tooling.',
        cta: { label: 'Contact hiring team', href: '/contact' },
        sections: [
            { kicker: 'Engineering', title: 'Full-stack product builders', body: 'We value engineers who can ship polished dashboards, reliable queues, clean APIs and practical automation.' },
            { kicker: 'Growth', title: 'SEO and agency specialists', body: 'Help customers design indexing workflows, onboarding playbooks and measurable search visibility improvements.' },
            { kicker: 'Remote', title: 'Flexible collaboration', body: 'We work with focused contributors who communicate clearly and care about dependable customer outcomes.' },
        ],
    },
    press: {
        path: '/press',
        badge: 'Press',
        title: 'SpeedyIndexer press resources',
        description: 'Company background, product positioning and media contact information for SpeedyIndexer AI.',
        sections: [
            { kicker: 'Overview', title: 'What SpeedyIndexer does', body: 'SpeedyIndexer helps agencies and businesses submit URLs through Google Indexing API, IndexNow, sitemap pings and bulk workflows.' },
            { kicker: 'Audience', title: 'Built for SEO teams', body: 'The platform is designed for agencies, publishers, SaaS teams and site owners that need faster crawl discovery at scale.' },
            { kicker: 'Contact', title: 'Media inquiries', body: 'For interviews, product screenshots, partnership notes or brand assets, contact support@speedyindexer.com.' },
        ],
    },
    privacy: {
        path: '/privacy-policy',
        badge: 'Legal',
        title: 'Privacy Policy',
        description: 'How SpeedyIndexer collects, uses and protects account, indexing, payment and support information.',
        sections: [
            { kicker: 'Data collected', title: 'Account and usage data', body: 'We may collect account details, submitted URLs, indexing status, payment requests, support tickets and basic analytics needed to operate the service.' },
            { kicker: 'Use of data', title: 'Service delivery', body: 'Data is used to authenticate users, process indexing jobs, manage orders, provide support, prevent abuse and improve product reliability.' },
            { kicker: 'Protection', title: 'Security practices', body: 'We use access controls, environment-separated credentials and operational monitoring to protect platform data.' },
        ],
    },
    terms: {
        path: '/terms-of-service',
        badge: 'Legal',
        title: 'Terms of Service',
        description: 'Terms for using SpeedyIndexer websites, dashboards, APIs, indexing tools and related services.',
        sections: [
            { kicker: 'Acceptable use', title: 'Responsible submissions', body: 'Users must submit URLs they are authorized to manage and must not use the platform for spam, malware, abuse or policy-violating content.' },
            { kicker: 'Service limits', title: 'Plans and quotas', body: 'Plans may include daily URL limits, rate limits, queue priority, API access and support levels as described on pricing pages.' },
            { kicker: 'Availability', title: 'Operational changes', body: 'Features, integrations and limits may change as search engine APIs, indexing protocols and product capabilities evolve.' },
        ],
    },
    cookies: {
        path: '/cookie-policy',
        badge: 'Legal',
        title: 'Cookie Policy',
        description: 'How SpeedyIndexer uses cookies and local browser storage to keep dashboards, preferences and sessions working.',
        sections: [
            { kicker: 'Essential', title: 'Authentication and security', body: 'Cookies and browser storage may be used to maintain sign-in sessions, protect forms and remember dashboard preferences.' },
            { kicker: 'Functional', title: 'Product settings', body: 'Local storage may keep non-sensitive UI settings, support drafts, notification state and admin configuration in the current version.' },
            { kicker: 'Control', title: 'Your browser settings', body: 'You can manage cookies and local storage in your browser. Disabling them may limit sign-in and dashboard functionality.' },
        ],
    },
    gdpr: {
        path: '/gdpr',
        badge: 'Privacy',
        title: 'GDPR',
        description: 'Information for users in the European Economic Area about data rights and SpeedyIndexer privacy controls.',
        sections: [
            { kicker: 'Rights', title: 'Access, correction and deletion', body: 'Eligible users may request access to personal data, corrections, deletion or export where required by applicable law.' },
            { kicker: 'Processing', title: 'Service necessity', body: 'We process data needed to provide indexing services, account access, billing workflows, support and platform security.' },
            { kicker: 'Requests', title: 'Contact privacy support', body: 'Send GDPR or privacy requests to support@speedyindexer.com with the account email and a clear description of the request.' },
        ],
    },
};

export function pageMetadata(key) {
    const page = staticPages[key];
    return {
        title: page.title,
        description: page.description,
        alternates: { canonical: page.path },
        openGraph: {
            title: `${page.title} | SpeedyIndexer AI`,
            description: page.description,
            url: page.path,
        },
    };
}
