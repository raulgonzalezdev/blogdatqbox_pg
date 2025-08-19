"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon, LogIn, User, Plus, LogOut } from "lucide-react";

export default function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Verificar si hay un usuario logueado
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/v1/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.log('No user logged in');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/session', { method: 'DELETE' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-full bg-black dark:bg-white" />
          <span className="font-semibold tracking-tight text-xl">datqbox</span>
        </Link>
        
        <nav className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{user.name}</span>
              </div>
              <Link href="/admin" className="btn flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Nuevo Post</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="btn flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="btn flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Entrar</span>
            </Link>
          )}
          
          {mounted && (
            <button 
              className="btn text-sm flex items-center gap-2" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden md:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden md:inline">Dark</span>
                </>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
