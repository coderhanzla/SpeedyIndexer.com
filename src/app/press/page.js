import StaticInfoPage from '../StaticInfoPage';
import { pageMetadata, staticPages } from '../staticPageData';

export const metadata = pageMetadata('press');

export default function PressPage() {
    return <StaticInfoPage {...staticPages.press} />;
}
