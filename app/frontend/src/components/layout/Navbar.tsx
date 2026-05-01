"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Sun, Moon, UserRound, ChevronDown, LogOut, Bookmark } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "@/components/ui/Container";
import KollabLogo from "@/components/ui/KollabLogo";
import { cn } from "@/lib/utils";
import { getSession, logout, type KollabUser } from "@/lib/authStore";

const navLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Mentors", href: "/mentors" },
  { label: "Members", href: "/people" },
  { label: "Job Simulations", href: "/simulations" },
  { label: "Job Market", href: "/insights" },
  { label: "Events", href: "/events" },
  { label: "Blogs", href: "/blogs" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const [session, setSession] = useState<KollabUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    setSession(getSession());

    const handleStorage = () => setSession(getSession());
    window.addEventListener("storage", handleStorage);
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Re-read session on every route change (covers same-tab login/logout)
  useEffect(() => {
    setSession(getSession());
    setIsOpen(false);
  }, [location.pathname]);

  const themeOptions = [
    { key: "light", label: "Light", icon: <Sun size={14} /> },
    { key: "dark", label: "Dark", icon: <Moon size={14} /> },
  ];

  const avatarUrl =
    session?.profile?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session?.name || "User")}`;

  const handleLogout = () => {
    logout();
    setSession(null);
    setAccountOpen(false);
    if (location.pathname.startsWith("/profile")) {
      navigate("/", { replace: true });
    }
  };

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
            <Link
              to="/bookmarks"
              className="p-2 rounded-full border border-border/70 text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-colors"
              aria-label="Bookmarked projects"
            >
              <Bookmark size={18} />
            </Link>
            {session ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  className={cn(
                    "flex items-center gap-2 h-10 px-3.5 min-w-[160px] max-w-[240px] rounded-full text-sm font-semibold",
                    "border-[1.5px] border-primary/35 bg-gradient-to-r from-primary/8 via-card to-primary/5 text-foreground/90",
                    "shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/55 focus:outline-none focus:ring-2 focus:ring-primary/25"
                  )}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  <img
                    src={avatarUrl}
                    alt={session.name || "User"}
                    className="w-8 h-8 rounded-full border-[1.5px] border-primary/35 bg-muted object-cover"
                  />
                  <span className="hidden sm:inline text-foreground/90 truncate">
                    {session.name || "Account"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-muted-foreground transition-transform",
                      accountOpen && "rotate-180"
                    )}
                  />
                </button>

                {accountOpen && (
                  <div
                    className="absolute right-0 mt-2 w-68 max-w-xs rounded-2xl border-[1.5px] border-primary/30 bg-card shadow-xl overflow-hidden transition-all"
                    role="menu"
                  >
                    <div className="px-3 py-2.5 border-b border-border/70 bg-card">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {session.name || "Account"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{session.email}</p>
                    </div>
                    <div className="p-2 space-y-1.5 text-sm">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-foreground hover:bg-accent"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <UserRound size={16} />
                        <span>Profile</span>
                      </Link>

                      <div className="px-3 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Appearance
                      </div>
                      {mounted && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/40 border border-primary/20">
                          {themeOptions.map((opt) => {
                            const active = theme === opt.key;
                            return (
                              <button
                                key={opt.key}
                                onClick={() => setTheme(opt.key)}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                                  active
                                    ? "bg-primary/10 text-foreground border border-primary/30 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                                )}
                                role="menuitemradio"
                                aria-checked={active}
                              >
                                {opt.icon}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/15"
                        role="menuitem"
                      >
                        <LogOut size={16} />
                        <span className="leading-none">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="px-4 py-2 text-[15px] font-semibold text-foreground/80 hover:text-foreground transition-colors duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-[15px] font-semibold text-primary-foreground rounded-lg bg-primary hover:bg-primary/90 shadow-brand-sm hover:shadow-brand transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/bookmarks"
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              aria-label="Bookmarked projects"
            >
              <Bookmark size={18} />
            </Link>
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
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-3">
                {mounted && (
                  <div className="grid grid-cols-2 gap-1">
                    {themeOptions.map((opt) => {
                      const active = theme === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setTheme(opt.key)}
                          className={cn(
                            "flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-semibold",
                            active
                              ? "bg-primary/10 text-foreground border border-primary/30"
                              : "text-muted-foreground hover:bg-accent"
                          )}
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {session ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-foreground rounded-lg bg-primary shadow-brand-sm w-full justify-center"
                    >
                      <UserRound size={18} strokeWidth={2.25} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-border hover:bg-accent"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-center border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-primary-foreground rounded-lg bg-primary shadow-brand-sm"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Navbar;
