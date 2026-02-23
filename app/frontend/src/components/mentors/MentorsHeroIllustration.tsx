import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const MentorsHeroIllustration = ({ className }: Props) => (
  <div className={cn("relative select-none", className)} aria-hidden="true">
    <div className="absolute inset-[-10%] pointer-events-none rounded-full bg-[radial-gradient(ellipse_55%_45%_at_55%_48%,hsl(270_80%_60%/0.08),transparent)] dark:bg-[radial-gradient(ellipse_55%_45%_at_55%_48%,hsl(270_80%_60%/0.16),transparent)]" />

    <svg
      viewBox="0 0 480 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      style={{ filter: "drop-shadow(0 6px 28px hsl(270 80% 60% / 0.09))" }}
    >
      <defs>
        <linearGradient id="gm-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(270 80% 60%)" />
          <stop offset="100%" stopColor="hsl(290 72% 64%)" />
        </linearGradient>
        <linearGradient id="gm-path" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(270 80% 60%)" stopOpacity="0.6" />
          <stop offset="50%" stopColor="hsl(290 72% 64%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(315 70% 65%)" stopOpacity="0.15" />
        </linearGradient>
        <filter id="fm-glow2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fm-soft2" x="-12%" y="-12%" width="124%" height="148%">
          <feDropShadow dx="0" dy="3" stdDeviation="7" floodColor="hsl(240 10% 10%)" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* Glowing path from mentor to learner */}
      <path
        d="M160 140 C200 160, 220 200, 320 190"
        stroke="url(#gm-path)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      >
        <animate attributeName="stroke-dasharray" values="0 300;300 0" dur="3s" repeatCount="indefinite" />
      </path>
      <path
        d="M160 140 C180 180, 250 240, 320 190"
        stroke="hsl(270 60% 70%)"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
        strokeDasharray="4 4"
      />

      {/* Mentor figure — left, larger */}
      <g filter="url(#fm-glow2)">
        <circle cx="140" cy="120" r="40" fill="url(#gm-violet)" opacity="0.15" />
      </g>
      <circle cx="140" cy="120" r="30" fill="url(#gm-violet)" opacity="0.9" />
      {/* Head */}
      <circle cx="140" cy="108" r="10" fill="hsl(0 0% 100%)" fillOpacity="0.9" />
      {/* Body */}
      <rect x="128" y="122" width="24" height="14" rx="7" fill="hsl(0 0% 100%)" fillOpacity="0.8" />
      {/* Star badge */}
      <polygon points="140,82 143,90 151,90 145,95 147,103 140,99 133,103 135,95 129,90 137,90" fill="hsl(45 90% 55%)" opacity="0.9">
        <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
      </polygon>

      {/* Learner figure — right */}
      <circle cx="340" cy="175" r="24" fill="hsl(270 40% 92%)" stroke="hsl(270 60% 75%)" strokeWidth="1.5" className="dark:fill-[hsl(270_30%_20%)]" />
      <circle cx="340" cy="166" r="8" fill="hsl(28 55% 78%)" />
      <rect x="330" y="178" width="20" height="11" rx="5.5" fill="hsl(270 35% 68%)" />

      {/* Energy particle traveling along path */}
      <circle r="4" fill="hsl(270 80% 65%)" opacity="0.8">
        <animateMotion dur="3s" repeatCount="indefinite" path="M160 140 C200 160, 220 200, 320 190" />
        <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Floating skill badges */}
      <g filter="url(#fm-soft2)">
        <rect x="50" y="70" width="62" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(270 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="70;64;70" dur="4s" repeatCount="indefinite" />
        </rect>
        <text x="60" y="85" fontSize="9" fontWeight="600" fill="hsl(270 80% 50%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(270_80%_70%)]">
          <animate attributeName="y" values="85;79;85" dur="4s" repeatCount="indefinite" />
          React
        </text>

        <rect x="56" y="200" width="52" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(270 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="200;206;200" dur="3.5s" repeatCount="indefinite" />
        </rect>
        <text x="65" y="215" fontSize="9" fontWeight="600" fill="hsl(270 80% 50%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(270_80%_70%)]">
          <animate attributeName="y" values="215;221;215" dur="3.5s" repeatCount="indefinite" />
          ML/AI
        </text>

        <rect x="380" y="100" width="68" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(315 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="100;106;100" dur="5s" repeatCount="indefinite" />
        </rect>
        <text x="389" y="115" fontSize="9" fontWeight="600" fill="hsl(315 85% 55%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(315_80%_70%)]">
          <animate attributeName="y" values="115;121;115" dur="5s" repeatCount="indefinite" />
          Design
        </text>

        <rect x="370" y="240" width="72" height="22" rx="11" fill="hsl(0 0% 100%)" stroke="hsl(270 50% 82%)" strokeWidth="1" className="dark:fill-[hsl(240_10%_14%)]">
          <animate attributeName="y" values="240;234;240" dur="4.5s" repeatCount="indefinite" />
        </rect>
        <text x="380" y="255" fontSize="9" fontWeight="600" fill="hsl(270 80% 50%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(270_80%_70%)]">
          <animate attributeName="y" values="255;249;255" dur="4.5s" repeatCount="indefinite" />
          DevOps
        </text>
      </g>

      {/* Guidance label between figures */}
      <g opacity="0.85">
        <rect x="200" y="148" width="78" height="24" rx="12" fill="url(#gm-violet)" opacity="0.12" />
        <text x="214" y="164" fontSize="10" fontWeight="700" fill="hsl(270 80% 55%)" fontFamily="-apple-system,sans-serif" className="dark:fill-[hsl(270_80%_75%)]">
          Guidance
        </text>
      </g>

      {/* Subtle orbit dots */}
      <circle cx="100" cy="150" r="2.5" fill="hsl(270 80% 60%)" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="380" cy="155" r="2" fill="hsl(315 85% 65%)" opacity="0.35">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="240" cy="260" r="2.5" fill="hsl(270 60% 60%)" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

export default MentorsHeroIllustration;
