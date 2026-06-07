import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('cookies');

export default function CookiePolicyPage() {
    return <StaticInfoPage {...staticPages.cookies} />;
}
