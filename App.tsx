import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { ProductList } from './components/ProductList';
import { FinanceDashboard } from './components/FinanceDashboard';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { useStore } from './store';

import { BlingCallback } from './components/BlingCallback';

import { ImportantContacts } from './components/ImportantContacts';
import { Settings } from './components/Settings';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';
import { PublicCatalog } from './components/PublicCatalog';
import { supabase } from './supabaseClient';
import { Loader2 } from 'lucide-react';

function App() {
  const { fetchData, user, setUser, isLoading, fetchProfile, authResolved, setAuthResolved } = useStore();

  useEffect(() => {
    let mounted = true;

    // Check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchData();
      }
      setAuthResolved(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      const newUser = session?.user ?? null;
      const currentUser = useStore.getState().user;

      setUser(newUser);

      // Only fetch data if the user actually changed (login/logout)
      // and NOT on every focus-triggered session check
      if (newUser && (!currentUser || currentUser.id !== newUser.id)) {
        fetchProfile(newUser.id);
        fetchData();
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY') {
        setAuthResolved(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchData, setUser, fetchProfile, setAuthResolved]);

  useEffect(() => {
    // Intercepta o redirecionamento do Bling
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const path = window.location.pathname;

    const isCatalog = path.includes('/catalogo') || path.includes('/catalog');

    if (code || path.includes('bling-callback')) {
      const targetHash = '/#/bling-callback' + window.location.search;
      if (!window.location.hash.includes('bling-callback')) {
        window.location.replace(window.location.origin + targetHash);
        return;
      }
    }

    if (isCatalog && !window.location.hash.includes('catalogo')) {
      window.location.replace(window.location.origin + '/#/catalogo');
      return;
    }
  }, []);

  if (!authResolved) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  // Check if we are in a special auth flow (invite or password reset)
  const isAuthFlow = window.location.hash.includes('type=recovery') ||
    window.location.hash.includes('type=invite') ||
    window.location.hash.includes('access_token=');

  // Allow public catalog access without auth
  const isPublicCatalog = window.location.hash.startsWith('#/catalogo') || window.location.hash.startsWith('#/catalog');

  if (!user && !isAuthFlow && !isPublicCatalog) {
    return <LoginPage />;
  }

  // If we have an auth flow hash but NO user yet, show login page in reset mode
  if (isAuthFlow && !user) {
    return <LoginPage />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/catalogo" element={<PublicCatalog />} />
        <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />

        {/* Layout-wrapped internal routes */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/kanban" element={<KanbanBoard />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/finance" element={<FinanceDashboard />} />
                <Route path="/contacts" element={<ImportantContacts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/bling-callback" element={<BlingCallback />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
