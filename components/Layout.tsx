import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Search,
  KanbanSquare,
  Package,
  BadgeDollarSign,
  BookUser,
  LogOut
} from 'lucide-react';
import { useStore } from '../store';
import { cn, Button, Input } from './ui/primitives';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, collapsed, colorClass }: { to: string; icon: any; label: string; collapsed: boolean; colorClass: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-500 group relative overflow-hidden",
          isActive
            ? `${colorClass} shadow-glow scale-[1.02] animate-active-pulse`
            : "text-muted-foreground hover:bg-primary/[0.03] hover:text-foreground hover:scale-[1.02]"
        )
      }
    >
      <NavLink to={to} className={({ isActive }) => cn(
        "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full transition-all duration-500 origin-left",
        isActive ? "opacity-100 scale-y-100 bg-current" : "opacity-0 scale-y-0"
      )} />

      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <Icon className={cn(
          "h-5 w-5 shrink-0 transition-all duration-500 group-hover:drop-shadow-[0_0_8px_currentColor]",
          collapsed ? "mx-auto" : ""
        )} />
      </motion.div>

      {!collapsed && (
        <span className="font-bold truncate text-sm tracking-wide transition-all duration-500 group-hover:translate-x-1">
          {label}
        </span>
      )}

      {/* Hover Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {collapsed && (
        <div className="absolute left-20 z-[100] hidden rounded-xl border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-medium text-white shadow-2xl backdrop-blur-md group-hover:block animate-in fade-in zoom-in-95 slide-in-from-left-2">
          {label}
        </div>
      )}
    </NavLink>
  );
};

import { LOGO_URL, LOGO_ICON_URL } from '../constants';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkMode, toggleDarkMode, signOut, user, profile } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  // Update HTML class for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const isMobile = () => window.innerWidth <= 768;

  // Header Scroll Effect
  useEffect(() => {
    if (!headerRef.current) return;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 20) {
        headerRef.current?.classList.add("bg-background/80", "backdrop-blur-2xl", "border-b", "border-white/5", "shadow-xl");
      } else {
        headerRef.current?.classList.remove("bg-background/80", "backdrop-blur-2xl", "border-b", "border-white/5", "shadow-xl");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/kanban': return 'CRM & Vendas';
      case '/products': return 'Estoque de Produtos';
      case '/finance': return 'Fluxo Financeiro';
      case '/customers': return 'Base de Clientes';
      default: return 'Painel de Controle';
    }
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-[hsl(var(--background))] text-foreground font-sans selection:bg-primary/30 selection:text-white relative"
      onMouseMove={handleMouseMove}
    >
      {/* Background Perfumarias */}

      {/* Interactive Mouse Spotlight */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.05), transparent 80%)`
        }}
      />

      {/* Background Orbs for Depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[160px] opacity-60"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[180px] opacity-40"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[140px] opacity-30"
        />
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 m-4 flex flex-col rounded-[2.5rem] border border-foreground/10 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-3xl shadow-2xl transition-all duration-500 md:relative md:translate-x-0 overflow-hidden group/sidebar",
          isMobileMenuOpen ? "translate-x-0 w-[calc(100%-2rem)]" : "-translate-x-full md:flex",
          collapsed ? "md:w-24" : "md:w-72"
        )}
      >
        <div className="flex h-24 items-center justify-center border-b border-foreground/5 dark:border-white/5 px-6">
          {!collapsed ? (
            <motion.img
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              src={LOGO_URL}
              alt="Kinderplay"
              className="h-10 object-contain dark:brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          ) : (
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ rotate: 15, scale: 1.1 }}
              src={LOGO_ICON_URL}
              alt="Kinderplay"
              className="h-11 w-11 object-contain cursor-pointer drop-shadow-[0_0_12px_rgba(15,117,188,0.4)]"
            />
          )}
        </div>

        <div className="flex-1 space-y-2 p-4 pt-8 overflow-y-auto no-scrollbar">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} colorClass="bg-cyan-500/10 text-cyan-500 border-cyan-500/20" />
          <SidebarItem to="/kanban" icon={KanbanSquare} label="Pipeline" collapsed={collapsed} colorClass="bg-pink-500/10 text-pink-500 border-pink-500/20" />
          <SidebarItem to="/customers" icon={Users} label="Clientes" collapsed={collapsed} colorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" />
          <SidebarItem to="/products" icon={Package} label="Produtos" collapsed={collapsed} colorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" />
          <SidebarItem to="/finance" icon={BadgeDollarSign} label="Financeiro" collapsed={collapsed} colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" />
          <SidebarItem to="/contacts" icon={BookUser} label="Contatos" collapsed={collapsed} colorClass="bg-indigo-500/10 text-indigo-500 border-indigo-500/20" />
        </div>

        <div className="p-4 border-t border-foreground/5 dark:border-white/5">
          <SidebarItem to="/settings" icon={Settings} label="Configurações" collapsed={collapsed} colorClass="bg-slate-500/10 text-slate-500 border-slate-500/20" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            className="mt-4 flex w-full items-center justify-center p-3 rounded-2xl bg-white/5 text-muted-foreground hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/20"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </motion.button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10">
        <header
          ref={headerRef}
          className="sticky top-0 z-40 flex h-20 items-center justify-between px-8 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                {getPageTitle()}
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-60">Kinderplay OS v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-2xl bg-foreground/5 border border-foreground/5 hover:bg-foreground/10"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary" />}
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l border-foreground/10">
              <NavLink to="/profile" className="hidden lg:block text-right hover:opacity-80 transition-opacity">
                <p className="text-sm font-bold truncate max-w-[120px]">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground">Premium Account</p>
              </NavLink>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="h-11 w-11 rounded-[1rem] bg-gradient-to-tr from-primary to-purple-400 p-[1px] shadow-glow cursor-pointer"
                  onClick={() => navigate('/profile')}
                  title="Meu Perfil"
                >
                  <div className="h-full w-full rounded-[0.9rem] bg-background flex items-center justify-center font-black text-xs text-primary border border-primary/20 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={signOut}
                  title="Sair do Sistema"
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div >
    </div >
  );
};
