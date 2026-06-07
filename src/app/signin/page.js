import AuthForm from '../auth/AuthForm';

export const metadata = {
    title: 'Sign in | SpeedyIndexer AI',
    description: 'Sign in to your SpeedyIndexer dashboard.',
};

export default function SigninPage() {
    return <AuthForm mode="signin" />;
}
