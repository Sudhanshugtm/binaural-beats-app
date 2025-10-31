"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/components/AccessibilityProvider";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

type NavItem =
  | { href: string; label: string }
  | { href: string; label: string; onClick: () => void };

const baseNavItems: NavItem[] = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { announceToScreenReader } = useAccessibility();
  const supabase = createClientComponentClient<Database>();

  const isHomePage = pathname === '/';

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(Boolean(session));
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    ...baseNavItems,
    isSignedIn
      ? { href: "#", label: "Sign Out", onClick: handleSignOut }
      : { href: "/login", label: "Sign In" }
  ];

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollThreshold = 20;
          const isMobile = window.innerWidth < 768;
          const visibilityThreshold = (isHomePage && isMobile) ? 200 : 0;
          
          setIsScrolled(window.scrollY > scrollThreshold);
          setIsVisible(window.scrollY > visibilityThreshold || !isHomePage || !isMobile);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isHomePage]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled 
          ? 'bg-white/90 shadow-sm' 
          : 'bg-transparent'
      } ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      role="banner"
    >
      <div className="container-zen mx-auto">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 sm:space-x-3 transition-opacity hover:opacity-80 touch-target"
            aria-label="Beatful Home - Binaural Beats for Focus and Meditation"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md overflow-hidden">
              <Image
                src="/logo.png"
                alt="Beatful Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className={`text-lg sm:text-xl font-semibold tracking-wider ${
              isScrolled ? 'text-gray-800' : 'text-gray-800'
            }`}>
              Beatful
            </span>
          </Link>

          {/* Desktop Navigation */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
              {navItems.map((item) =>
                'onClick' in item ? (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`text-sm font-semibold tracking-wide transition-colors duration-200 touch-target bg-transparent border-0 p-0 cursor-pointer ${
                      isScrolled
                        ? 'text-gray-700 hover:text-gray-900'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-semibold tracking-wide transition-colors duration-200 touch-target ${
                      isScrolled
                        ? 'text-gray-700 hover:text-gray-900'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          )}

          {/* Mobile Menu Button */}
          {navItems.length > 0 && (
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                announceToScreenReader(
                  isMobileMenuOpen ? 'Mobile menu closed' : 'Mobile menu opened',
                  'assertive'
                );
              }}
              className={`p-2 touch-target ${
                isScrolled ? 'text-gray-700' : 'text-gray-700'
              }`}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {navItems.length > 0 && (
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
            <nav className="container-zen mx-auto py-4 space-y-2" aria-label="Mobile navigation">
              {navItems.map((item, index) =>
                'onClick' in item ? (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick?.();
                      setIsMobileMenuOpen(false);
                      announceToScreenReader(item.label, 'assertive');
                    }}
                    className={`block w-full text-left px-4 py-3 text-gray-800 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 hover:translate-x-1 touch-target ${
                      isMobileMenuOpen
                        ? 'translate-x-0 opacity-100'
                        : 'translate-x-4 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                    }}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 text-gray-800 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 hover:translate-x-1 touch-target ${
                      isMobileMenuOpen
                        ? 'translate-x-0 opacity-100'
                        : 'translate-x-4 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                    }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      announceToScreenReader(`Navigating to ${item.label}`, 'assertive');
                    }}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
