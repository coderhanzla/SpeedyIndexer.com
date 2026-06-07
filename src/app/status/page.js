import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('status');

export default function StatusPage() {
    return <StaticInfoPage {...staticPages.status} />;
}
