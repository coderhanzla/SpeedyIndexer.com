import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('terms');

export default function TermsOfServicePage() {
    return <StaticInfoPage {...staticPages.terms} />;
}
