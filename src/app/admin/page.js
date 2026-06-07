import AdminDashboard from './AdminDashboard';

export const metadata = {
    title: 'Admin Dashboard',
    description: 'SpeedyIndexer admin dashboard for content, services, users and operations.',
    robots: { index: false, follow: false },
};

export default function AdminPage() {
    return <AdminDashboard />;
}
