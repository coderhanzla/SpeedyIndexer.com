import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('changelog');

export default function ChangelogPage() {
    return <StaticInfoPage {...staticPages.changelog} />;
}
