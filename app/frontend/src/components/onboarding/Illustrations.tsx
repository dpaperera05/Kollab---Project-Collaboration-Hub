import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

const palette = {
  violet: "hsl(var(--primary))",
  violetSoft: "hsl(var(--primary) / 0.3)",
  violetFaint: "hsl(var(--primary) / 0.12)",
  pink: "hsl(var(--accent-brand) / 0.6)",
  fg: "hsl(var(--foreground))",
  fgMuted: "hsl(var(--muted-foreground))",
  card: "hsl(var(--card))",
  border: "hsl(var(--border))",
};

export const RoleIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 400" fill="none" className={cn("w-full h-full max-w-[360px]", className)}>
    {/* Person choosing cards */}
    <circle cx="200" cy="160" r="36" fill={palette.violetSoft} />
    <circle cx="200" cy="148" r="16" fill={palette.violet} opacity="0.7" />
    <rect x="186" y="168" width="28" height="36" rx="8" fill={palette.violet} opacity="0.5" />
    {/* Floating skill cards */}
    <rect x="60" y="100" width="80" height="50" rx="12" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.5" />
    <rect x="72" y="114" width="40" height="6" rx="3" fill={palette.violet} opacity="0.5" />
    <rect x="72" y="126" width="28" height="4" rx="2" fill={palette.fgMuted} opacity="0.3" />
    <rect x="260" y="80" width="80" height="50" rx="12" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.5" />
    <rect x="272" y="94" width="44" height="6" rx="3" fill={palette.violet} opacity="0.5" />
    <rect x="272" y="106" width="30" height="4" rx="2" fill={palette.fgMuted} opacity="0.3" />
    <rect x="80" y="240" width="80" height="50" rx="12" fill={palette.violetFaint} stroke={palette.pink} strokeWidth="1.5" />
    <rect x="92" y="254" width="36" height="6" rx="3" fill={palette.pink} opacity="0.6" />
    <rect x="240" y="250" width="80" height="50" rx="12" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.5" />
    <rect x="252" y="264" width="50" height="6" rx="3" fill={palette.violet} opacity="0.5" />
    {/* Connecting lines */}
    <line x1="140" y1="125" x2="170" y2="155" stroke={palette.violet} strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />
    <line x1="260" y1="105" x2="230" y2="150" stroke={palette.violet} strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />
    {/* Decorative dots */}
    <circle cx="50" cy="200" r="4" fill={palette.violet} opacity="0.2" />
    <circle cx="350" cy="180" r="3" fill={palette.pink} opacity="0.3" />
    <circle cx="180" cy="320" r="5" fill={palette.violet} opacity="0.15" />
  </svg>
);

export const BasicsIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 400" fill="none" className={cn("w-full h-full max-w-[360px]", className)}>
    {/* Profile card */}
    <rect x="100" y="80" width="200" height="240" rx="20" fill={palette.violetFaint} stroke={palette.border} strokeWidth="1.5" />
    {/* Avatar circle */}
    <circle cx="200" cy="150" r="32" fill={palette.violetSoft} />
    <circle cx="200" cy="142" r="14" fill={palette.violet} opacity="0.6" />
    <rect x="189" y="158" width="22" height="20" rx="6" fill={palette.violet} opacity="0.4" />
    {/* Name line */}
    <rect x="150" y="200" width="100" height="8" rx="4" fill={palette.violet} opacity="0.4" />
    {/* Bio lines */}
    <rect x="130" y="220" width="140" height="5" rx="2.5" fill={palette.fgMuted} opacity="0.25" />
    <rect x="145" y="232" width="110" height="5" rx="2.5" fill={palette.fgMuted} opacity="0.2" />
    {/* Location pin */}
    <circle cx="180" y="260" r="6" fill={palette.pink} opacity="0.4" />
    <rect x="218" y="257" width="40" height="5" rx="2.5" fill={palette.fgMuted} opacity="0.2" />
    {/* Decorative */}
    <circle cx="70" cy="140" r="6" fill={palette.violet} opacity="0.15" />
    <circle cx="340" cy="200" r="4" fill={palette.pink} opacity="0.2" />
    {/* Pencil icon hint */}
    <rect x="270" y="90" width="20" height="20" rx="6" fill={palette.violet} opacity="0.25" />
  </svg>
);

export const SkillsIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 400" fill="none" className={cn("w-full h-full max-w-[360px]", className)}>
    {/* Central figure */}
    <circle cx="200" cy="180" r="28" fill={palette.violetSoft} />
    <circle cx="200" cy="170" r="12" fill={palette.violet} opacity="0.6" />
    <rect x="190" y="184" width="20" height="24" rx="6" fill={palette.violet} opacity="0.4" />
    {/* Floating tech icons (simple shapes) */}
    <rect x="60" y="80" width="56" height="28" rx="14" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.2" />
    <text x="88" y="99" textAnchor="middle" fontSize="10" fill={palette.violet} fontFamily="Inter" fontWeight="600">React</text>
    <rect x="290" y="100" width="56" height="28" rx="14" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.2" />
    <text x="318" y="119" textAnchor="middle" fontSize="10" fill={palette.violet} fontFamily="Inter" fontWeight="600">Node</text>
    <rect x="40" y="200" width="64" height="28" rx="14" fill={palette.violetFaint} stroke={palette.pink} strokeWidth="1.2" />
    <text x="72" y="219" textAnchor="middle" fontSize="10" fill={palette.pink} fontFamily="Inter" fontWeight="600">Python</text>
    <rect x="300" y="220" width="60" height="28" rx="14" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.2" />
    <text x="330" y="239" textAnchor="middle" fontSize="10" fill={palette.violet} fontFamily="Inter" fontWeight="600">AWS</text>
    <rect x="130" y="300" width="56" height="28" rx="14" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.2" />
    <text x="158" y="319" textAnchor="middle" fontSize="10" fill={palette.violet} fontFamily="Inter" fontWeight="600">Git</text>
    <rect x="220" y="290" width="64" height="28" rx="14" fill={palette.violetFaint} stroke={palette.pink} strokeWidth="1.2" />
    <text x="252" y="309" textAnchor="middle" fontSize="10" fill={palette.pink} fontFamily="Inter" fontWeight="600">Figma</text>
    {/* Connectors */}
    <line x1="116" y1="94" x2="175" y2="170" stroke={palette.violet} strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
    <line x1="290" y1="114" x2="225" y2="170" stroke={palette.violet} strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
  </svg>
);

export const LinksIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 400" fill="none" className={cn("w-full h-full max-w-[360px]", className)}>
    {/* Chain/link central icon */}
    <rect x="140" y="140" width="120" height="120" rx="28" fill={palette.violetFaint} stroke={palette.border} strokeWidth="1.5" />
    {/* Link symbol */}
    <path d="M185 190 Q185 175, 200 175 L215 175 Q230 175, 230 190" stroke={palette.violet} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M215 210 Q215 225, 200 225 L185 225 Q170 225, 170 210" stroke={palette.violet} strokeWidth="3" fill="none" strokeLinecap="round" />
    <line x1="190" y1="195" x2="210" y2="205" stroke={palette.violet} strokeWidth="2.5" strokeLinecap="round" />
    {/* GitHub circle */}
    <circle cx="80" cy="120" r="24" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.5" />
    <circle cx="80" cy="116" r="8" fill={palette.violet} opacity="0.5" />
    <rect x="74" y="126" width="12" height="8" rx="3" fill={palette.violet} opacity="0.3" />
    {/* LinkedIn circle */}
    <circle cx="320" cy="140" r="24" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.5" />
    <text x="320" y="145" textAnchor="middle" fontSize="14" fill={palette.violet} fontFamily="Inter" fontWeight="700">in</text>
    {/* Portfolio */}
    <circle cx="100" cy="300" r="24" fill={palette.violetFaint} stroke={palette.pink} strokeWidth="1.5" />
    <rect x="90" y="292" width="20" height="16" rx="3" fill={palette.pink} opacity="0.4" />
    {/* Connecting dashed lines */}
    <line x1="104" y1="132" x2="140" y2="170" stroke={palette.violet} strokeWidth="1" opacity="0.25" strokeDasharray="4 3" />
    <line x1="296" y1="152" x2="260" y2="175" stroke={palette.violet} strokeWidth="1" opacity="0.25" strokeDasharray="4 3" />
    <line x1="115" y1="285" x2="150" y2="255" stroke={palette.pink} strokeWidth="1" opacity="0.2" strokeDasharray="4 3" />
  </svg>
);

export const AvailabilityIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 400" fill="none" className={cn("w-full h-full max-w-[360px]", className)}>
    {/* Calendar frame */}
    <rect x="80" y="80" width="240" height="240" rx="20" fill={palette.violetFaint} stroke={palette.border} strokeWidth="1.5" />
    {/* Header bar */}
    <rect x="80" y="80" width="240" height="50" rx="20" fill={palette.violet} opacity="0.15" />
    <circle cx="140" cy="105" r="6" fill={palette.violet} opacity="0.4" />
    <circle cx="200" cy="105" r="6" fill={palette.violet} opacity="0.4" />
    <circle cx="260" cy="105" r="6" fill={palette.violet} opacity="0.4" />
    {/* Calendar cells */}
    {[0, 1, 2, 3].map(row =>
      [0, 1, 2, 3, 4].map(col => {
        const x = 100 + col * 44;
        const y = 150 + row * 38;
        const isHighlighted = (row === 1 && col === 2) || (row === 2 && col === 1) || (row === 0 && col === 4);
        return (
          <rect
            key={`${row}-${col}`}
            x={x}
            y={y}
            width="32"
            height="26"
            rx="6"
            fill={isHighlighted ? palette.violet : "transparent"}
            opacity={isHighlighted ? 0.3 : 0.1}
            stroke={palette.border}
            strokeWidth="0.5"
          />
        );
      })
    )}
    {/* Clock icon */}
    <circle cx="320" cy="340" r="20" fill={palette.violetFaint} stroke={palette.violet} strokeWidth="1.5" />
    <line x1="320" y1="330" x2="320" y2="340" stroke={palette.violet} strokeWidth="2" strokeLinecap="round" />
    <line x1="320" y1="340" x2="330" y2="344" stroke={palette.violet} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const InterestsIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 400" fill="none" className={cn("w-full h-full max-w-[360px]", className)}>
    {/* Compass base */}
    <circle cx="200" cy="200" r="100" fill={palette.violetFaint} stroke={palette.border} strokeWidth="1.5" />
    <circle cx="200" cy="200" r="60" fill="transparent" stroke={palette.violet} strokeWidth="1" opacity="0.2" />
    <circle cx="200" cy="200" r="8" fill={palette.violet} opacity="0.5" />
    {/* Compass needle */}
    <line x1="200" y1="200" x2="200" y2="145" stroke={palette.violet} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="200" y1="200" x2="200" y2="245" stroke={palette.pink} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    {/* Domain labels around */}
    <text x="200" y="118" textAnchor="middle" fontSize="9" fill={palette.violet} fontFamily="Inter" fontWeight="600">AI</text>
    <text x="290" y="205" textAnchor="middle" fontSize="9" fill={palette.violet} fontFamily="Inter" fontWeight="600">Web</text>
    <text x="200" y="295" textAnchor="middle" fontSize="9" fill={palette.fgMuted} fontFamily="Inter" fontWeight="500">IoT</text>
    <text x="115" y="205" textAnchor="middle" fontSize="9" fill={palette.fgMuted} fontFamily="Inter" fontWeight="500">Data</text>
    {/* Orbiting dots */}
    <circle cx="260" cy="145" r="5" fill={palette.violet} opacity="0.3" />
    <circle cx="140" cy="260" r="4" fill={palette.pink} opacity="0.3" />
    <circle cx="270" cy="270" r="3" fill={palette.violet} opacity="0.2" />
    <circle cx="130" cy="140" r="4" fill={palette.violet} opacity="0.15" />
  </svg>
);
