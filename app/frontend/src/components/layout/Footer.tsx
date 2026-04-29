import { useState } from "react";
import { Github, Twitter, Linkedin, Youtube, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/ui/Container";
import KollabLogo from "@/components/ui/KollabLogo";

const discoverLinks = [
{ label: "Projects", href: "/projects" },
{ label: "Mentors", href: "/mentors" },
{ label: "Members", href: "/people" },
{ label: "Job Simulations", href: "/simulations" },
{ label: "Job Market", href: "/insights" },
{ label: "Events", href: "/events" },
{ label: "Blogs", href: "/blogs" }];


const participateLinks = [
{ label: "Post a Project", href: "/projects/new" },
{ label: "How it Works", href: "#" },
{ label: "Evidence Portfolio", href: "#" },
{ label: "Community Guidelines", href: "#" }];


const helpLinks = [
{ label: "Support / FAQ", href: "#" },
{ label: "Contact Us", href: "#" },
{ label: "Report an Issue", href: "#" },
{ label: "Accessibility", href: "#" }];


const socials = [
{ icon: Github, label: "GitHub", href: "#" },
{ icon: Linkedin, label: "LinkedIn", href: "#" },
{ icon: Twitter, label: "X / Twitter", href: "#" },
{ icon: Youtube, label: "YouTube", href: "#" }];


const FooterLinkGroup = ({
  title,
  links



}: {title: string;links: {label: string;href: string;}[];}) =>
<div className="space-y-2">
    <h3 className="text-sm font-bold text-black dark:text-white tracking-wide">{title}</h3>
    <ul className="space-y-1.5">
      {links.map(({ label, href }) =>
    <li key={label}>
          <Link
        to={href}
        className="text-sm text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors duration-150">

            {label}
          </Link>
        </li>
    )}
    </ul>
  </div>;


const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="border-t border-border bg-[#FBFAFF] dark:bg-black">
      <Container>
        {/* Main grid */}
        <div className="py-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] lg:gap-5">

          {/* Col 1 — Brand */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <KollabLogo size={34} textSize="text-3xl" />
            <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed max-w-xs">
              Kollab is a collaboration platform where users discover projects, find teammates, learn with mentors, and build proof of skills.
            </p>
            














          </div>

          {/* Col 2 — Discover */}
          <FooterLinkGroup title="Discover" links={discoverLinks} />

          {/* Col 3 — Participate */}
          <FooterLinkGroup title="Participate" links={participateLinks} />

          {/* Col 4 — Help & Support */}
          <FooterLinkGroup title="Help & Support" links={helpLinks} />

          {/* Col 5 — Stay in the loop */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-black dark:text-white tracking-wide">Stay in the Loop</h3>
            <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
              Get updates on new projects, features, and opportunities.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />

                <button
                  type="submit"
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-sm transition-all duration-150 disabled:opacity-50"
                  aria-label="Subscribe">

                  <Send size={14} />
                </button>
              </div>
              {subscribed &&
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ You're subscribed!
                </p>
              }
            </form>

            {/* Socials */}
            <div className="flex items-center gap-1.5 pt-1">
              {socials.map(({ icon: Icon, label, href }) =>
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-2 rounded-lg text-black/70 hover:text-black hover:bg-black/10 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 transition-colors duration-150">

                  <Icon size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/15 dark:border-white/15 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-black/60 dark:text-white/60">
          <span>© 2026 Kollab. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link to="#" className="hover:text-black dark:hover:text-white transition-colors duration-150">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-black dark:hover:text-white transition-colors duration-150">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>);

};

export default Footer;