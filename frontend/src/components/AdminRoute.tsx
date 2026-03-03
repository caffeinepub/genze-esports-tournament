import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { isAdminLoggedIn } from '../utils/seedData';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate({ to: '/admin/login' });
    }
  }, [navigate]);

  if (!isAdminLoggedIn()) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <div className="text-center">
          <div
            className="font-orbitron text-sm tracking-wider"
            style={{ color: '#6b6b88' }}
          >
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
