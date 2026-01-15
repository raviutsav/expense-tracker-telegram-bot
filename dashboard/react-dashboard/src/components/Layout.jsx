import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, Sun, Moon, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeContext';

const Layout = ({ children, currentPage = 'Dashboard', headerAction, onNavigate, isAuthenticated = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', disabled: !isAuthenticated },
    { icon: MessageCircle, label: 'Telegram Bot', id: 'bot-guide', disabled: false },
  ];

  const handleNavigation = (id) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-8">
          <h1 className="text-base font-semibold tracking-tight text-foreground">Expense Tracker</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-6">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage.toLowerCase() === item.label.toLowerCase();

              const isDashboard = item.id === 'dashboard' && currentPage === 'Dashboard';
              const isBot = item.id === 'bot-guide' && currentPage === 'Telegram Bot';
              const showActive = isDashboard || isBot;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => !item.disabled && handleNavigation(item.id)}
                    disabled={item.disabled}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      showActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.disabled && <span className="ml-auto text-xs opacity-70">(Login req)</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 w-full">
          <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground truncate max-w-[150px] md:max-w-none">
                {currentPage}
              </h2>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              {headerAction && (
                <div className="hidden md:block">
                  {headerAction}
                </div>
              )}

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative rounded-full bg-muted p-2 text-foreground transition-colors hover:bg-accent flex-shrink-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Header Action - Placed in flow, not sticky */}
        {headerAction && (
          <div className="md:hidden px-4 py-4 border-b border-border bg-card/50">
            {headerAction}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
