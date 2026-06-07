import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('privacy');

export default function PrivacyPolicyPage() {
    return <StaticInfoPage {...staticPages.privacy} />;
}
