"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";
import Container from "@/components/ui/Container";
import KollabLogo from "@/components/ui/KollabLogo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Projects", href: "/projects" },
  { label: "People", href: "#" },
  { label: "Mentors", href: "#" },
  { label: "Job Simulations", href: "#" },
  { label: "Events", href: "#" },
  { label: "Blogs", href: "#" },
  { label: "Insights", href: "#" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <KollabLogo size={34} textSize="text-3xl" />

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = link.href !== "#" && location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    "px-3.5 py-2 text-[15px] font-semibold rounded-md transition-colors duration-150 whitespace-nowrap",
                    isActive
                      ? "text-primary bg-primary/8"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="block h-0.5 mt-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <Link
              to="#"
              className="px-4 py-2 text-[15px] font-semibold text-foreground/80 hover:text-foreground transition-colors duration-150"
            >
              Login
            </Link>
            <Link
              to="#"
              className="px-5 py-2.5 text-[15px] font-semibold text-primary-foreground rounded-lg bg-primary hover:bg-primary/90 shadow-brand-sm hover:shadow-brand transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile right */}
          <div className="flex lg:hidden items-center gap-2">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <Container>
            <div className="py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = link.href !== "#" && location.pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={cn(
                      "px-3 py-2.5 text-sm font-semibold rounded-md transition-colors",
                      isActive
                        ? "text-primary bg-primary/8"
                        : "text-foreground/80 hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <Link
                  to="#"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-center border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="#"
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-primary-foreground rounded-lg bg-primary shadow-brand-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Navbar;
