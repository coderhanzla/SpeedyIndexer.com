import AuthForm from '../auth/AuthForm';

export const metadata = {
    title: 'Sign up | SpeedyIndexer AI',
    description: 'Create your SpeedyIndexer account and start submitting URLs for indexing.',
};

export default function SignupPage() {
    return <AuthForm mode="signup" />;
}
