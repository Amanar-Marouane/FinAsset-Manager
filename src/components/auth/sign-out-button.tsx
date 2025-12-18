import { Button } from '@/components/ui/button';
import { AppContext } from '@/contexts/AppProvider';
import { useAppContext } from '@/hooks/use-app-context';
import { useContext } from 'react';

export function SignOutButton({ className = '' }) {
  const { logout, isLoading } = useAppContext();

  return (
    <Button
      onClick={logout}
      type={'submit'}
      isLoading={isLoading}
      loadingLabel={'Déconnexion...'}
      label={'Déconnexion'}
      fullWidth
      className={className}
    />
  );
}
