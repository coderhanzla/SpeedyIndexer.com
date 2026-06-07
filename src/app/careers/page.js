import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('careers');

export default function CareersPage() {
    return <StaticInfoPage {...staticPages.careers} />;
}
