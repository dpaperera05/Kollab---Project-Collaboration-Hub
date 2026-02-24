import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const PeopleHeroIllustration = ({ className }: Props) => (
  <div className={cn("relative select-none", className)} aria-hidden="true">
    {/* Ambient glow */}
    <div className="absolute inset-[-10%] pointer-events-none rounded-full bg-[radial-gradient(ellipse_55%_45%_at_55%_48%,hsl(270_80%_60%/0.08),transparent)] dark:bg-[radial-gradient(ellipse_55%_45%_at_55%_48%,hsl(270_80%_60%/0.16),transparent)]" />

    <svg
      viewBox="0 0 480 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      style={{ filter: "drop-shadow(0 6px 28px hsl(270 80% 60% / 0.09))" }}
    >
      <defs>
        <linearGradient id="gp-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(270 80% 60%)" />
          <stop offset="100%" stopColor="hsl(290 72% 64%)" />
        </linearGradient>
        <linearGradient id="gp-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(315 85% 65%)" />
          <stop offset="100%" stopColor="hsl(340 75% 68%)" />
        </linearGradient>
        <filter id="fp-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="hsl(270 80% 60%)" floodOpacity="0.2" />
        </filter>
        <filter id="fp-soft" x="-12%" y="-12%" width="124%" height="148%">
          <feDropShadow dx="0" dy="3" stdDeviation="7" floodColor="hsl(240 10% 10%)" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* Connection lines */}
      <line x1="240" y1="160" x2="120" y2="80" stroke="hsl(270 60% 70%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <line x1="240" y1="160" x2="360" y2="80" stroke="hsl(270 60% 70%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <line x1="240" y1="160" x2="100" y2="220" stroke="hsl(270 60% 70%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <line x1="240" y1="160" x2="380" y2="220" stroke="hsl(270 60% 70%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <line x1="240" y1="160" x2="180" y2="270" stroke="hsl(270 60% 70%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35" />
      <line x1="240" y1="160" x2="320" y2="270" stroke="hsl(270 60% 70%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35" />

      {/* Center person node — main hub */}
      <circle cx="240" cy="160" r="32" fill="url(#gp-violet)" filter="url(#fp-glow)" opacity="0.9" />
      <circle cx="240" cy="150" r="10" fill="hsl(0 0% 100%)" fillOpacity="0.9" />
      <rect x="228" y="164" width="24" height="14" rx="7" fill="hsl(0 0% 100%)" fillOpacity="0.8" />

      {/* Person nodes */}
      {/* Top-left */}
      <circle cx="120" cy="80" r="22" fill="hsl(270 40% 92%)" stroke="hsl(270 60% 75%)" strokeWidth="1.5" className="dark:fill-[hsl(270_30%_20%)]" />
      <circle cx="120" cy="73" r="7" fill="hsl(28 55% 78%)" />
      <rect x="111" y="83" width="18" height="10" rx="5" fill="hsl(270 35% 68%)" />

      {/* Top-right */}
      <circle cx="360" cy="80" r="22" fill="hsl(270 40% 92%)" stroke="hsl(270 60% 75%)" strokeWidth="1.5" className="dark:fill-[hsl(270_30%_20%)]" />
      <circle cx="360" cy="73" r="7" fill="hsl(38 50% 72%)" />
      <rect x="351" y="83" width="18" height="10" rx="5" fill="hsl(220 20% 68%)" />

      {/* Bottom-left */}
      <circle cx="100" cy="220" r="22" fill="hsl(270 40% 92%)" stroke="hsl(270 60% 75%)" strokeWidth="1.5" className="dark:fill-[hsl(270_30%_20%)]" />
      <circle cx="100" cy="213" r="7" fill="hsl(20 60% 70%)" />
      <rect x="91" y="223" width="18" height="10" rx="5" fill="hsl(315 40% 68%)" />

      {/* Bottom-right */}
      <circle cx="380" cy="220" r="22" fill="hsl(270 40% 92%)" stroke="hsl(270 60% 75%)" strokeWidth="1.5" className="dark:fill-[hsl(270_30%_20%)]" />
      <circle cx="380" cy="213" r="7" fill="hsl(340 40% 75%)" />
      <rect x="371" y="223" width="18" height="10" rx="5" fill="hsl(200 30% 65%)" />

      {/* Bottom center nodes */}
      <circle cx="180" cy="270" r="18" fill="hsl(270 40% 92%)" stroke="hsl(270 60% 75%)" strokeWidth="1" className="dark:fill-[hsl(270_30%_20%)]" />
      <circle cx="180" cy="264" r="6" fill="hsl(25 50% 75%)" />
      <rect x="173" y="272" width="14" height="8" rx="4" fill="hsl(270 30% 65%)" />

      <circle cx="320" cy="270" r="18" fill="hsl(270 40% 92%)" stroke="hsl(270 60% 75%)" strokeWidth="1" className="dark:fill-[hsl(270_30%_20%)]" />
      <circle cx="320" cy="264" r="6" fill="hsl(15 45% 72%)" />
      <rect x="313" y="272" width="14" height="8" rx="4" fill="hsl(200 25% 62%)" />

      {/* Floating skill badges */}
      <g filter="url(#fp-soft)">
        {/* React badge */}
        <rect x="50" y="130" width="52" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(270 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="130;124;130" dur="4s" repeatCount="indefinite" />
        </rect>
        <text x="63" y="145" fontSize="9" fontWeight="600" fill="hsl(270 80% 50%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(270_80%_70%)]">
          <animate attributeName="y" values="145;139;145" dur="4s" repeatCount="indefinite" />
          React
        </text>

        {/* UI/UX badge */}
        <rect x="380" y="130" width="56" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(315 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="130;136;130" dur="5s" repeatCount="indefinite" />
        </rect>
        <text x="393" y="145" fontSize="9" fontWeight="600" fill="hsl(315 85% 55%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(315_80%_70%)]">
          <animate attributeName="y" values="145;151;145" dur="5s" repeatCount="indefinite" />
          UI/UX
        </text>

        {/* ML badge */}
        <rect x="55" y="260" width="36" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(270 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="260;254;260" dur="3.5s" repeatCount="indefinite" />
        </rect>
        <text x="65" y="275" fontSize="9" fontWeight="600" fill="hsl(270 80% 50%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(270_80%_70%)]">
          <animate attributeName="y" values="275;269;275" dur="3.5s" repeatCount="indefinite" />
          ML
        </text>

        {/* DevOps badge */}
        <rect x="390" y="270" width="58" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(270 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="270;264;270" dur="4.5s" repeatCount="indefinite" />
        </rect>
        <text x="400" y="285" fontSize="9" fontWeight="600" fill="hsl(270 80% 50%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(270_80%_70%)]">
          <animate attributeName="y" values="285;279;285" dur="4.5s" repeatCount="indefinite" />
          DevOps
        </text>
      </g>

      {/* Small connection dots */}
      <circle cx="180" cy="120" r="3" fill="hsl(270 80% 60%)" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="300" cy="120" r="3" fill="hsl(315 85% 65%)" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="200" r="2.5" fill="hsl(270 80% 60%)" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="310" cy="200" r="2.5" fill="hsl(270 80% 60%)" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

export default PeopleHeroIllustration;
