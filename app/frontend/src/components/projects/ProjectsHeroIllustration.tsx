import { cn } from "@/lib/utils";

interface Props { className?: string }

const ProjectsHeroIllustration = ({ className }: Props) => (
  <div className={cn("relative select-none", className)} aria-hidden="true">

    {/* ── Ambient glow — very subtle, theme-aware ─────────────────── */}
    <div className="absolute inset-[-10%] pointer-events-none rounded-full
      bg-[radial-gradient(ellipse_55%_45%_at_55%_48%,hsl(270_80%_60%/0.08),transparent)]
      dark:bg-[radial-gradient(ellipse_55%_45%_at_55%_48%,hsl(270_80%_60%/0.16),transparent)]" />

    <svg
      viewBox="0 0 540 360"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      style={{ filter: "drop-shadow(0 6px 28px hsl(270 80% 60% / 0.09))" }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="g-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(270 80% 60%)" />
          <stop offset="100%" stopColor="hsl(290 72% 64%)" />
        </linearGradient>
        <linearGradient id="g-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(315 85% 65%)" />
          <stop offset="100%" stopColor="hsl(340 75% 68%)" />
        </linearGradient>
        <linearGradient id="g-panel-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" />
          <stop offset="100%" stopColor="hsl(240 8% 97%)" />
        </linearGradient>
        <linearGradient id="g-panel-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(270 40% 99%)" />
          <stop offset="100%" stopColor="hsl(270 30% 96%)" />
        </linearGradient>
        <linearGradient id="g-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(240 8% 86%)" />
          <stop offset="100%" stopColor="hsl(240 6% 76%)" />
        </linearGradient>
        <linearGradient id="g-robot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(240 10% 90%)" />
          <stop offset="100%" stopColor="hsl(240 8% 76%)" />
        </linearGradient>
        <linearGradient id="g-laptop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(240 12% 18%)" />
          <stop offset="100%" stopColor="hsl(240 10% 12%)" />
        </linearGradient>
        <linearGradient id="g-p1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(270 35% 68%)" />
          <stop offset="100%" stopColor="hsl(270 25% 52%)" />
        </linearGradient>
        <linearGradient id="g-p2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(220 20% 68%)" />
          <stop offset="100%" stopColor="hsl(220 15% 54%)" />
        </linearGradient>

        {/* Shadows */}
        <filter id="f-panel" x="-12%" y="-12%" width="124%" height="148%">
          <feDropShadow dx="0" dy="3" stdDeviation="7" floodColor="hsl(240 10% 10%)" floodOpacity="0.07"/>
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="hsl(240 10% 10%)" floodOpacity="0.04"/>
        </filter>
        <filter id="f-panel-glow" x="-18%" y="-18%" width="136%" height="154%">
          <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="hsl(270 80% 60%)" floodOpacity="0.28"/>
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="hsl(240 10% 10%)" floodOpacity="0.06"/>
        </filter>
        <filter id="f-robot">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="hsl(270 80% 60%)" floodOpacity="0.35"/>
        </filter>
        <filter id="f-desk">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="hsl(240 10% 10%)" floodOpacity="0.10"/>
        </filter>
      </defs>

      {/* ── Floor shadow ─────────────────────────────────────────────── */}
      <ellipse cx="270" cy="348" rx="190" ry="8" fill="hsl(240 10% 10%)" fillOpacity="0.06" />

      {/* ── Desk ─────────────────────────────────────────────────────── */}
      {/* Legs */}
      <rect x="96" y="272" width="12" height="70" rx="4" fill="hsl(240 8% 72%)" />
      <rect x="432" y="272" width="12" height="70" rx="4" fill="hsl(240 8% 72%)" />
      {/* Surface — raised slightly for depth */}
      <rect x="72" y="256" width="396" height="18" rx="6" fill="url(#g-desk)" filter="url(#f-desk)" />
      {/* Surface highlight */}
      <rect x="72" y="256" width="396" height="4" rx="3" fill="hsl(240 6% 92%)" />

      {/* ── Laptop (on desk, slightly left of centre) ─────────────── */}
      {/* Screen */}
      <rect x="180" y="214" width="90" height="60" rx="5" fill="url(#g-laptop)" />
      {/* Screen bezel inner */}
      <rect x="184" y="218" width="82" height="50" rx="3" fill="hsl(240 12% 14%)" />
      {/* Screen content — code editor feel */}
      <rect x="188" y="222" width="36" height="3" rx="1.5" fill="hsl(270 80% 68%)" fillOpacity="0.9" />
      <rect x="188" y="228" width="52" height="2.5" rx="1.5" fill="hsl(200 70% 65%)" fillOpacity="0.6" />
      <rect x="188" y="234" width="28" height="2.5" rx="1.5" fill="hsl(140 60% 60%)" fillOpacity="0.5" />
      <rect x="188" y="240" width="44" height="2.5" rx="1.5" fill="hsl(270 60% 70%)" fillOpacity="0.5" />
      <rect x="188" y="246" width="32" height="2" rx="1" fill="hsl(200 70% 65%)" fillOpacity="0.35" />
      <rect x="188" y="251" width="60" height="2" rx="1" fill="hsl(240 10% 60%)" fillOpacity="0.3" />
      {/* Keyboard base */}
      <rect x="170" y="273" width="110" height="6" rx="3" fill="hsl(240 8% 78%)" />
      <rect x="175" y="271" width="100" height="4" rx="2" fill="hsl(240 8% 84%)" />

      {/* ── Mug ──────────────────────────────────────────────────────── */}
      <rect x="130" y="238" width="26" height="28" rx="5" fill="hsl(240 8% 88%)" />
      {/* Mug handle */}
      <path d="M156 244 Q168 244 168 252 Q168 260 156 260" stroke="hsl(240 8% 80%)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Kollab brand stripe on mug */}
      <rect x="133" y="241" width="20" height="8" rx="2" fill="url(#g-violet)" fillOpacity="0.75" />
      {/* Steam */}
      <path d="M138 236 Q140 230 138 224" stroke="hsl(240 8% 75%)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M144 234 Q146 228 144 222" stroke="hsl(240 8% 75%)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />

      {/* ── Person 1 — left, seated, looking at laptop ───────────────── */}
      {/* Head */}
      <circle cx="102" cy="220" r="19" fill="hsl(28 55% 78%)" />
      {/* Hair */}
      <path d="M84 216 Q102 197 120 216 Q118 205 102 201 Q86 205 84 216Z" fill="hsl(22 35% 24%)" />
      {/* Ear */}
      <ellipse cx="83" cy="222" rx="4" ry="5" fill="hsl(28 50% 74%)" />
      {/* Body */}
      <rect x="83" y="237" width="38" height="36" rx="9" fill="url(#g-p1)" />
      {/* Collar */}
      <path d="M102 237 L94 248 L102 245 L110 248 Z" fill="hsl(0 0% 97%)" fillOpacity="0.5" />
      {/* Arm to laptop */}
      <path d="M121 254 Q152 254 178 244" stroke="hsl(270 28% 60%)" strokeWidth="11" strokeLinecap="round" fill="none"/>
      <circle cx="179" cy="243" r="5.5" fill="hsl(28 50% 76%)" />

      {/* ── Person 2 — right, standing, gesturing at panels ──────────── */}
      {/* Head */}
      <circle cx="418" cy="198" r="19" fill="hsl(38 50% 72%)" />
      {/* Hair */}
      <ellipse cx="418" cy="189" rx="17" ry="9" fill="hsl(18 25% 18%)" />
      {/* Ear */}
      <ellipse cx="437" cy="200" rx="4" ry="5" fill="hsl(38 46% 68%)" />
      {/* Body */}
      <rect x="399" y="215" width="38" height="48" rx="9" fill="url(#g-p2)" />
      {/* Collar */}
      <path d="M418 215 L410 228 L418 224 L426 228 Z" fill="hsl(270 80% 60%)" fillOpacity="0.35" />
      {/* Pointing arm */}
      <path d="M399 228 Q376 216 356 192" stroke="hsl(220 18% 58%)" strokeWidth="11" strokeLinecap="round" fill="none"/>
      <circle cx="355" cy="191" r="5.5" fill="hsl(38 46% 70%)" />

      {/* ── Robot — center-right on desk ─────────────────────────────── */}
      {/* Base / wheels */}
      <rect x="296" y="246" width="40" height="12" rx="5" fill="hsl(240 10% 80%)" />
      <circle cx="306" cy="258" r="5" fill="hsl(240 10% 70%)" />
      <circle cx="326" cy="258" r="5" fill="hsl(240 10% 70%)" />
      {/* Body */}
      <rect x="299" y="218" width="34" height="32" rx="7" fill="url(#g-robot)" />
      {/* Chest panel */}
      <rect x="305" y="224" width="22" height="14" rx="3" fill="hsl(270 80% 60%)" fillOpacity="0.18" stroke="hsl(270 60% 70%)" strokeWidth="0.8"/>
      {/* Chest LEDs */}
      <circle cx="310" cy="229" r="2" fill="hsl(270 80% 64%)" fillOpacity="0.9" />
      <circle cx="318" cy="229" r="2" fill="hsl(315 85% 65%)" fillOpacity="0.8" />
      <rect x="307" y="233" width="18" height="2" rx="1" fill="hsl(270 60% 70%)" fillOpacity="0.5" />
      {/* Head */}
      <rect x="299" y="192" width="34" height="28" rx="9" fill="url(#g-robot)" filter="url(#f-robot)"/>
      {/* Visor strip */}
      <rect x="302" y="199" width="28" height="10" rx="4" fill="hsl(270 80% 60%)" fillOpacity="0.22" />
      {/* Eyes */}
      <ellipse cx="311" cy="204" rx="4" ry="4" fill="hsl(270 80% 62%)" className="robot-eye" />
      <ellipse cx="321" cy="204" rx="4" ry="4" fill="hsl(270 80% 62%)" className="robot-eye" />
      {/* Eye shine */}
      <circle cx="313" cy="202" r="1.2" fill="white" fillOpacity="0.6" />
      <circle cx="323" cy="202" r="1.2" fill="white" fillOpacity="0.6" />
      {/* Antenna */}
      <line x1="316" y1="192" x2="316" y2="182" stroke="hsl(240 8% 74%)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="316" cy="180" r="4" fill="url(#g-violet)" className="antenna-pulse" />
      {/* Arms */}
      <path d="M299 228 Q282 232 272 226" stroke="hsl(240 8% 80%)" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M333 228 Q350 232 360 226" stroke="hsl(240 8% 80%)" strokeWidth="7" strokeLinecap="round" fill="none"/>

      {/* ════════════════════════════════════════════════════════════════
          FLOATING UI PANELS — shadcn-card style
          ════════════════════════════════════════════════════════════════ */}

      {/* ── Panel 1 — Project Card (top-left) ──────────────────────── */}
      <g className="panel p1">
        <g filter="url(#f-panel-glow)">
          {/* Card shell */}
          <rect x="8" y="14" width="148" height="102" rx="12" fill="url(#g-panel-a)" stroke="hsl(270 50% 88%)" strokeWidth="1"/>
        </g>
        {/* Top accent bar */}
        <rect x="8" y="14" width="148" height="28" rx="12" fill="url(#g-violet)"/>
        <rect x="8" y="30" width="148" height="12" fill="url(#g-violet)"/>
        {/* Dots + label */}
        <circle cx="20" cy="27" r="3.5" fill="white" fillOpacity="0.3"/>
        <circle cx="30" cy="27" r="3.5" fill="white" fillOpacity="0.2"/>
        <circle cx="40" cy="27" r="3.5" fill="white" fillOpacity="0.15"/>
        <text x="50" y="31" fontSize="8.5" fontWeight="700" fill="white" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif" letterSpacing="0.2">Project Card</text>
        {/* Project title line */}
        <rect x="18" y="49" width="72" height="6" rx="3" fill="hsl(240 12% 16%)" fillOpacity="0.75"/>
        {/* Subtitle lines */}
        <rect x="18" y="60" width="112" height="3.5" rx="1.8" fill="hsl(240 8% 50%)" fillOpacity="0.38"/>
        <rect x="18" y="66" width="88" height="3.5" rx="1.8" fill="hsl(240 8% 50%)" fillOpacity="0.26"/>
        {/* Tech chips */}
        <rect x="18" y="75" width="30" height="11" rx="5.5" fill="hsl(270 80% 60%)" fillOpacity="0.13" stroke="hsl(270 60% 72%)" strokeWidth="0.8"/>
        <text x="22" y="84" fontSize="6.5" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">React</text>
        <rect x="52" y="75" width="30" height="11" rx="5.5" fill="hsl(270 80% 60%)" fillOpacity="0.13" stroke="hsl(270 60% 72%)" strokeWidth="0.8"/>
        <text x="56" y="84" fontSize="6.5" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">AI/ML</text>
        <rect x="86" y="75" width="34" height="11" rx="5.5" fill="hsl(270 80% 60%)" fillOpacity="0.13" stroke="hsl(270 60% 72%)" strokeWidth="0.8"/>
        <text x="89" y="84" fontSize="6.5" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">Python</text>
        {/* Footer: avatars + progress */}
        <circle cx="18" cy="104" r="5.5" fill="hsl(270 40% 70%)"/>
        <circle cx="27" cy="104" r="5.5" fill="hsl(240 30% 68%)"/>
        <circle cx="36" cy="104" r="5.5" fill="hsl(315 40% 70%)"/>
        <text x="46" y="108" fontSize="6.5" fill="hsl(240 8% 52%)" fontFamily="-apple-system,sans-serif">4 members</text>
        {/* Progress */}
        <rect x="104" y="100" width="44" height="5" rx="2.5" fill="hsl(270 20% 92%)"/>
        <rect x="104" y="100" width="28" height="5" rx="2.5" fill="url(#g-violet)" fillOpacity="0.8"/>
        <text x="150" y="107" fontSize="5.5" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">63%</text>
      </g>

      {/* ── Panel 2 — Kanban Board (top-right) ─────────────────────── */}
      <g className="panel p2">
        <g filter="url(#f-panel)">
          <rect x="372" y="8" width="144" height="100" rx="12" fill="url(#g-panel-a)" stroke="hsl(240 8% 90%)" strokeWidth="1"/>
        </g>
        {/* Header row */}
        <rect x="372" y="8" width="144" height="26" rx="12" fill="hsl(240 12% 18%)"/>
        <rect x="372" y="22" width="144" height="12" fill="hsl(240 12% 18%)"/>
        <text x="384" y="24" fontSize="8.5" fontWeight="700" fill="hsl(240 8% 92%)" fontFamily="-apple-system,sans-serif">Kanban Board</text>
        {/* 3 columns */}
        {/* To Do */}
        <rect x="378" y="36" width="38" height="66" rx="7" fill="hsl(240 8% 96%)"/>
        <rect x="378" y="36" width="38" height="14" rx="5" fill="hsl(240 8% 86%)"/>
        <text x="382" y="47" fontSize="6" fill="hsl(240 8% 38%)" fontFamily="-apple-system,sans-serif" fontWeight="600">To Do</text>
        <rect x="381" y="53" width="32" height="10" rx="3" fill="white" stroke="hsl(240 8% 88%)" strokeWidth="0.6"/>
        <rect x="383" y="55" width="20" height="2" rx="1" fill="hsl(240 8% 70%)" fillOpacity="0.6"/>
        <rect x="383" y="59" width="14" height="2" rx="1" fill="hsl(240 8% 70%)" fillOpacity="0.4"/>
        <rect x="381" y="65" width="32" height="10" rx="3" fill="white" stroke="hsl(240 8% 88%)" strokeWidth="0.6"/>
        <rect x="383" y="67" width="18" height="2" rx="1" fill="hsl(240 8% 70%)" fillOpacity="0.6"/>
        <rect x="381" y="77" width="32" height="18" rx="3" fill="white" stroke="hsl(240 8% 88%)" strokeWidth="0.6"/>
        <rect x="383" y="79" width="22" height="2" rx="1" fill="hsl(240 8% 70%)" fillOpacity="0.5"/>
        <rect x="383" y="83" width="16" height="2" rx="1" fill="hsl(240 8% 70%)" fillOpacity="0.35"/>
        {/* In Progress */}
        <rect x="422" y="36" width="38" height="66" rx="7" fill="hsl(270 35% 97%)"/>
        <rect x="422" y="36" width="38" height="14" rx="5" fill="hsl(270 60% 80%)"/>
        <text x="424" y="47" fontSize="5.5" fill="hsl(270 80% 38%)" fontFamily="-apple-system,sans-serif" fontWeight="600">In Prog.</text>
        <rect x="425" y="53" width="32" height="10" rx="3" fill="white" stroke="hsl(270 40% 86%)" strokeWidth="0.6"/>
        <rect x="427" y="55" width="20" height="2" rx="1" fill="hsl(270 60% 68%)" fillOpacity="0.7"/>
        <rect x="425" y="65" width="32" height="18" rx="3" fill="hsl(270 80% 60%)" fillOpacity="0.08" stroke="hsl(270 60% 82%)" strokeWidth="0.6"/>
        <rect x="427" y="67" width="24" height="2" rx="1" fill="hsl(270 70% 58%)" fillOpacity="0.6"/>
        <rect x="427" y="71" width="16" height="2" rx="1" fill="hsl(270 60% 65%)" fillOpacity="0.4"/>
        {/* Done */}
        <rect x="466" y="36" width="44" height="66" rx="7" fill="hsl(148 30% 97%)"/>
        <rect x="466" y="36" width="44" height="14" rx="5" fill="hsl(148 50% 74%)"/>
        <text x="472" y="47" fontSize="6" fill="hsl(148 60% 28%)" fontFamily="-apple-system,sans-serif" fontWeight="600">Done ✓</text>
        <rect x="469" y="53" width="38" height="10" rx="3" fill="white" stroke="hsl(148 30% 86%)" strokeWidth="0.6"/>
        <rect x="471" y="55" width="24" height="2" rx="1" fill="hsl(148 40% 50%)" fillOpacity="0.6"/>
        <rect x="469" y="65" width="38" height="10" rx="3" fill="white" stroke="hsl(148 30% 86%)" strokeWidth="0.6"/>
        <rect x="469" y="77" width="38" height="18" rx="3" fill="white" stroke="hsl(148 30% 86%)" strokeWidth="0.6"/>
        <rect x="471" y="79" width="22" height="2" rx="1" fill="hsl(148 40% 50%)" fillOpacity="0.5"/>
      </g>

      {/* ── Panel 3 — AI Match Score (bottom-right) ─────────────────── */}
      <g className="panel p3">
        <g filter="url(#f-panel)">
          <rect x="374" y="162" width="148" height="84" rx="12" fill="url(#g-panel-b)" stroke="hsl(270 40% 88%)" strokeWidth="1"/>
        </g>
        {/* Header */}
        <rect x="374" y="162" width="148" height="26" rx="12" fill="url(#g-violet)"/>
        <rect x="374" y="176" width="148" height="12" fill="url(#g-violet)"/>
        {/* Sparkle icon box */}
        <rect x="382" y="168" width="14" height="14" rx="4" fill="white" fillOpacity="0.22"/>
        <text x="385" y="179" fontSize="9" fill="white">✦</text>
        <text x="400" y="179" fontSize="8.5" fontWeight="700" fill="white" fontFamily="-apple-system,sans-serif">AI Match Score</text>
        {/* Donut score */}
        <circle cx="406" cy="210" r="22" stroke="hsl(270 20% 90%)" strokeWidth="5" fill="none"/>
        <path d="M406 188 A22 22 0 1 1 384.8 222" stroke="url(#g-violet)" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <text x="399" y="213" fontSize="10" fontWeight="800" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">92%</text>
        {/* Right info */}
        <rect x="436" y="192" width="80" height="7" rx="3.5" fill="hsl(240 10% 18%)" fillOpacity="0.65"/>
        <rect x="436" y="203" width="60" height="4" rx="2" fill="hsl(240 8% 52%)" fillOpacity="0.38"/>
        <rect x="436" y="211" width="68" height="4" rx="2" fill="hsl(240 8% 52%)" fillOpacity="0.28"/>
        {/* Best Match badge */}
        <rect x="436" y="220" width="70" height="14" rx="7" fill="url(#g-violet)" fillOpacity="0.14" stroke="hsl(270 60% 72%)" strokeWidth="0.8"/>
        <text x="450" y="230" fontSize="7" fontWeight="600" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">★ Best Match</text>
      </g>

      {/* ── Panel 4 — Skill Portfolio (bottom-left) ─────────────────── */}
      <g className="panel p4">
        <g filter="url(#f-panel)">
          <rect x="14" y="160" width="136" height="90" rx="12" fill="url(#g-panel-a)" stroke="hsl(315 35% 88%)" strokeWidth="1"/>
        </g>
        {/* Header */}
        <rect x="14" y="160" width="136" height="26" rx="12" fill="url(#g-pink)"/>
        <rect x="14" y="174" width="136" height="12" fill="url(#g-pink)"/>
        <rect x="22" y="166" width="14" height="14" rx="4" fill="white" fillOpacity="0.22"/>
        <text x="25" y="177" fontSize="9" fill="white">◈</text>
        <text x="40" y="179" fontSize="8.5" fontWeight="700" fill="white" fontFamily="-apple-system,sans-serif">Skill Portfolio</text>
        {/* Badge chips row */}
        <rect x="22" y="194" width="36" height="13" rx="6.5" fill="hsl(270 80% 60%)" fillOpacity="0.14" stroke="hsl(270 60% 72%)" strokeWidth="0.8"/>
        <text x="27" y="204" fontSize="6.5" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">React</text>
        <rect x="62" y="194" width="28" height="13" rx="6.5" fill="hsl(270 80% 60%)" fillOpacity="0.14" stroke="hsl(270 60% 72%)" strokeWidth="0.8"/>
        <text x="67" y="204" fontSize="6.5" fill="hsl(270 80% 44%)" fontFamily="-apple-system,sans-serif">ML</text>
        <rect x="94" y="194" width="48" height="13" rx="6.5" fill="hsl(315 75% 60%)" fillOpacity="0.12" stroke="hsl(315 55% 72%)" strokeWidth="0.8"/>
        <text x="99" y="204" fontSize="6.5" fill="hsl(315 80% 40%)" fontFamily="-apple-system,sans-serif">UI/UX</text>
        {/* Skill bars */}
        <text x="22" y="221" fontSize="6.5" fill="hsl(240 8% 48%)" fontFamily="-apple-system,sans-serif">React</text>
        <rect x="22" y="224" width="120" height="5" rx="2.5" fill="hsl(270 20% 92%)"/>
        <rect x="22" y="224" width="92" height="5" rx="2.5" fill="url(#g-violet)" fillOpacity="0.75"/>
        <text x="22" y="237" fontSize="6.5" fill="hsl(240 8% 48%)" fontFamily="-apple-system,sans-serif">Python</text>
        <rect x="22" y="240" width="120" height="5" rx="2.5" fill="hsl(315 15% 92%)"/>
        <rect x="22" y="240" width="68" height="5" rx="2.5" fill="url(#g-pink)" fillOpacity="0.75"/>
      </g>

      {/* ── Drifting particles ───────────────────────────────────────── */}
      <circle cx="4"   cy="82"  r="2.8" fill="hsl(270 80% 60%)" fillOpacity="0.22" className="pt p1"/>
      <circle cx="510" cy="120" r="2.2" fill="hsl(315 85% 65%)" fillOpacity="0.18" className="pt p2"/>
      <circle cx="260" cy="40"  r="2"   fill="hsl(270 60% 70%)" fillOpacity="0.28" className="pt p3"/>
      <circle cx="490" cy="270" r="2.2" fill="hsl(270 80% 60%)" fillOpacity="0.18" className="pt p4"/>
      <circle cx="20"  cy="300" r="1.8" fill="hsl(315 85% 65%)" fillOpacity="0.18" className="pt p5"/>
      <circle cx="528" cy="46"  r="1.8" fill="hsl(270 80% 60%)" fillOpacity="0.18" className="pt p1"/>
      <circle cx="148" cy="340" r="2"   fill="hsl(270 60% 70%)" fillOpacity="0.15" className="pt p3"/>
    </svg>

    {/* ── Animations ─────────────────────────────────────────────────── */}
    <style>{`
      /* Panel float — each panel bobs independently */
      .p1 { animation: f1 6.4s ease-in-out infinite; }
      .p2 { animation: f2 7.2s ease-in-out infinite; }
      .p3 { animation: f3 5.8s ease-in-out infinite; animation-delay: -1.6s; }
      .p4 { animation: f4 8s   ease-in-out infinite; animation-delay: -3s; }

      @keyframes f1 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-9px)} }
      @keyframes f2 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-7px)} }
      @keyframes f3 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-11px)} }
      @keyframes f4 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-6px)} }

      /* Glow pulse — only on panel 1 (project card) */
      .p1 > g:first-child { animation: glow-pulse 5s ease-in-out infinite; }
      @keyframes glow-pulse {
        0%,100% { filter: drop-shadow(0 3px 7px hsl(270 80% 60% / 0.12)); }
        50%      { filter: drop-shadow(0 3px 18px hsl(270 80% 60% / 0.36)); }
      }

      /* Robot eyes */
      .robot-eye { animation: blink 5.5s ease-in-out infinite; }
      @keyframes blink {
        0%,88%,100%{ ry:4; } 92%,95%{ ry:0.5; }
      }

      /* Antenna */
      .antenna-pulse { animation: ant 3.2s ease-in-out infinite; }
      @keyframes ant {
        0%,100%{ opacity:1; } 50%{ opacity:0.35; }
      }

      /* Particles */
      .pt { animation: drift 10s ease-in-out infinite; }
      .pt.p1{ animation-duration:9s;  animation-delay:0s; }
      .pt.p2{ animation-duration:12s; animation-delay:-3.5s; }
      .pt.p3{ animation-duration:8s;  animation-delay:-5.2s; }
      .pt.p4{ animation-duration:11s; animation-delay:-2.1s; }
      .pt.p5{ animation-duration:10s; animation-delay:-7.3s; }
      @keyframes drift {
        0%,100%{ transform:translate(0,0);        opacity:0.22; }
        40%    { transform:translate(5px,-7px);   opacity:0.42; }
        70%    { transform:translate(-4px,-3px);  opacity:0.14; }
      }

      /* Reduced motion */
      @media(prefers-reduced-motion:reduce){
        .p1,.p2,.p3,.p4,.robot-eye,.antenna-pulse,.pt{ animation:none!important; }
      }
    `}</style>
  </div>
);

export default ProjectsHeroIllustration;
