import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const EventsHeroIllustration = ({ className }: Props) => (
  <svg
    viewBox="0 0 480 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-full h-auto", className)}
    aria-hidden="true"
  >
    {/* Background glow */}
    <defs>
      <radialGradient id="ev-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(270 80% 60%)" stopOpacity="0.18" />
        <stop offset="100%" stopColor="hsl(270 80% 60%)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ev-card-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(270 80% 60%)" stopOpacity="0.15" />
        <stop offset="100%" stopColor="hsl(315 85% 65%)" stopOpacity="0.08" />
      </linearGradient>
    </defs>

    <circle cx="240" cy="180" r="150" fill="url(#ev-glow)" />

    {/* Central calendar / ticket card */}
    <g>
      <rect x="170" y="100" width="140" height="160" rx="16" fill="url(#ev-card-grad)" stroke="hsl(270 80% 60%)" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Calendar header bar */}
      <rect x="170" y="100" width="140" height="36" rx="16" fill="hsl(270 80% 60%)" fillOpacity="0.12" />
      <rect x="170" y="128" width="140" height="8" rx="0" fill="hsl(270 80% 60%)" fillOpacity="0" />
      {/* Calendar dots (date grid) */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <circle
            key={`dot-${row}-${col}`}
            cx={195 + col * 24}
            cy={155 + row * 24}
            r={row === 1 && col === 2 ? 8 : 4}
            fill={
              row === 1 && col === 2
                ? "hsl(270 80% 60%)"
                : "hsl(270 80% 60%)"
            }
            fillOpacity={row === 1 && col === 2 ? 0.9 : 0.15}
          />
        ))
      )}
      {/* Check on highlighted date */}
      <path d="M289 170l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
    </g>

    {/* Floating person nodes — community / networking */}
    {/* Person 1 — top left */}
    <g opacity="0.85">
      <circle cx="100" cy="120" r="20" fill="hsl(270 80% 60%)" fillOpacity="0.1" stroke="hsl(270 80% 60%)" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="100" cy="114" r="6" fill="hsl(270 80% 60%)" fillOpacity="0.5" />
      <path d="M90 130a10 10 0 0 1 20 0" fill="hsl(270 80% 60%)" fillOpacity="0.3" />
      <line x1="120" y1="120" x2="170" y2="140" stroke="hsl(270 80% 60%)" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="0" to="14" dur="3s" repeatCount="indefinite" />
      </line>
    </g>

    {/* Person 2 — bottom left */}
    <g opacity="0.85">
      <circle cx="110" cy="260" r="18" fill="hsl(315 85% 65%)" fillOpacity="0.08" stroke="hsl(315 85% 65%)" strokeWidth="1" strokeOpacity="0.25" />
      <circle cx="110" cy="254" r="5.5" fill="hsl(315 85% 65%)" fillOpacity="0.45" />
      <path d="M101 267a9 9 0 0 1 18 0" fill="hsl(315 85% 65%)" fillOpacity="0.25" />
      <line x1="128" y1="260" x2="175" y2="240" stroke="hsl(315 85% 65%)" strokeWidth="1" strokeOpacity="0.18" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="0" to="14" dur="4s" repeatCount="indefinite" />
      </line>
    </g>

    {/* Person 3 — top right */}
    <g opacity="0.85">
      <circle cx="380" cy="110" r="18" fill="hsl(270 80% 60%)" fillOpacity="0.08" stroke="hsl(270 80% 60%)" strokeWidth="1" strokeOpacity="0.25" />
      <circle cx="380" cy="104" r="5.5" fill="hsl(270 80% 60%)" fillOpacity="0.45" />
      <path d="M371 117a9 9 0 0 1 18 0" fill="hsl(270 80% 60%)" fillOpacity="0.25" />
      <line x1="362" y1="115" x2="310" y2="135" stroke="hsl(270 80% 60%)" strokeWidth="1" strokeOpacity="0.18" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="14" to="0" dur="3.5s" repeatCount="indefinite" />
      </line>
    </g>

    {/* Person 4 — bottom right */}
    <g opacity="0.85">
      <circle cx="370" cy="270" r="20" fill="hsl(270 80% 60%)" fillOpacity="0.1" stroke="hsl(270 80% 60%)" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="370" cy="264" r="6" fill="hsl(270 80% 60%)" fillOpacity="0.5" />
      <path d="M360 280a10 10 0 0 1 20 0" fill="hsl(270 80% 60%)" fillOpacity="0.3" />
      <line x1="350" y1="265" x2="310" y2="245" stroke="hsl(270 80% 60%)" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="14" to="0" dur="4.5s" repeatCount="indefinite" />
      </line>
    </g>

    {/* Floating badges */}
    <g>
      <rect x="60" y="180" width="56" height="22" rx="11" fill="hsl(270 80% 60%)" fillOpacity="0.12" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.3" />
      <text x="88" y="195" textAnchor="middle" fill="hsl(270 80% 60%)" fontSize="9" fontWeight="600" opacity="0.7">Hack</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="5s" repeatCount="indefinite" />
    </g>
    <g>
      <rect x="350" y="180" width="70" height="22" rx="11" fill="hsl(315 85% 65%)" fillOpacity="0.1" stroke="hsl(315 85% 65%)" strokeWidth="0.8" strokeOpacity="0.25" />
      <text x="385" y="195" textAnchor="middle" fill="hsl(315 85% 65%)" fontSize="9" fontWeight="600" opacity="0.6">Workshop</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,5;0,0" dur="6s" repeatCount="indefinite" />
    </g>
    <g>
      <rect x="320" y="320" width="52" height="22" rx="11" fill="hsl(270 80% 60%)" fillOpacity="0.1" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.25" />
      <text x="346" y="335" textAnchor="middle" fill="hsl(270 80% 60%)" fontSize="9" fontWeight="600" opacity="0.6">Talk</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="4s" repeatCount="indefinite" />
    </g>
    <g>
      <rect x="100" y="320" width="64" height="22" rx="11" fill="hsl(270 80% 60%)" fillOpacity="0.1" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.25" />
      <text x="132" y="335" textAnchor="middle" fill="hsl(270 80% 60%)" fontSize="9" fontWeight="600" opacity="0.6">Webinar</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,0" dur="5.5s" repeatCount="indefinite" />
    </g>

    {/* Central pulse ring */}
    <circle cx="240" cy="180" r="80" fill="none" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.15">
      <animate attributeName="r" values="80;95;80" dur="4s" repeatCount="indefinite" />
      <animate attributeName="stroke-opacity" values="0.15;0.05;0.15" dur="4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default EventsHeroIllustration;
