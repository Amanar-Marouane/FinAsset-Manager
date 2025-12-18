import SignInViewPage from '@/features/auth/components/forget-password-view';
import GuestLayout from '@/layouts/guest-layout';

const page = () => {
    return (
        <GuestLayout>
            <SignInViewPage />
        </GuestLayout>
    );
};

export default page;
