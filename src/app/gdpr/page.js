import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('gdpr');

export default function GdprPage() {
    return <StaticInfoPage {...staticPages.gdpr} />;
}
