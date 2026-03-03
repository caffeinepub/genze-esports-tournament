import { useEffect } from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { seedData } from './utils/seedData';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminRoute from './components/AdminRoute';

// Layout with nav + footer
function PublicLayout() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Admin layout (no public nav/footer)
function AdminLayout() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Outlet />
    </div>
  );
}

// Route definitions
const rootRoute = createRootRoute();

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: PublicLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/',
  component: HomePage,
});

const tournamentsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/tournaments',
  component: TournamentsPage,
});

const registerRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/register',
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tournamentId: (search.tournamentId as string) || '',
  }),
});

const paymentRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/payment',
  component: PaymentPage,
  validateSearch: (search: Record<string, unknown>) => ({
    playerId: (search.playerId as string) || '',
    tournamentId: (search.tournamentId as string) || '',
    amount: (search.amount as string) || '0',
  }),
});

const leaderboardRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/leaderboard',
  component: LeaderboardPage,
});

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/contact',
  component: ContactPage,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: AdminLayout,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/login',
  component: AdminLoginPage,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  component: () => (
    <AdminRoute>
      <AdminPanelPage />
    </AdminRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    tournamentsRoute,
    registerRoute,
    paymentRoute,
    leaderboardRoute,
    contactRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminLoginRoute,
    adminPanelRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  useEffect(() => {
    // Only initializes empty arrays if keys don't exist — no hardcoded seed tournaments
    seedData();
  }, []);

  return <RouterProvider router={router} />;
}
