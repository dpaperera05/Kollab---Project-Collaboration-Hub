import { Link } from "react-router-dom";

interface KollabLogoProps {
  size?: number; 
  textSize?: string; 
}

const KollabLogo = ({ size = 34, textSize = "text-xl" }: KollabLogoProps) => (
  <Link to="/" className="flex items-center gap-2 flex-shrink-0">
    <span className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* === EDGES / CONNECTIONS === */}
        <line x1="50" y1="50" x2="50" y2="22" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="72" y2="34" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="78" y2="58" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="62" y2="76" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="30" y2="72" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="22" y2="58" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="28" y2="34" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="22" x2="72" y2="34" stroke="hsl(270 80% 60% / 0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="50" y1="22" x2="28" y2="34" stroke="hsl(270 80% 60% / 0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="50" y1="22" x2="62" y2="10" stroke="hsl(270 80% 60% / 0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="50" y1="22" x2="36" y2="10" stroke="hsl(270 80% 60% / 0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="72" y1="34" x2="78" y2="58" stroke="hsl(270 80% 60% / 0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="78" y1="58" x2="62" y2="76" stroke="hsl(270 80% 60% / 0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="72" y1="34" x2="88" y2="28" stroke="hsl(270 80% 60% / 0.45)" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="78" y1="58" x2="92" y2="52" stroke="hsl(270 80% 60% / 0.4)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="78" y1="58" x2="88" y2="70" stroke="hsl(270 80% 60% / 0.4)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="62" y1="76" x2="30" y2="72" stroke="hsl(270 80% 60% / 0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="62" y1="76" x2="68" y2="90" stroke="hsl(270 80% 60% / 0.45)" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="30" y1="72" x2="42" y2="88" stroke="hsl(270 80% 60% / 0.45)" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="30" y1="72" x2="18" y2="82" stroke="hsl(270 80% 60% / 0.38)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="22" y1="58" x2="30" y2="72" stroke="hsl(270 80% 60% / 0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="22" y1="58" x2="28" y2="34" stroke="hsl(270 80% 60% / 0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="22" y1="58" x2="8" y2="52" stroke="hsl(270 80% 60% / 0.4)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="28" y1="34" x2="12" y2="30" stroke="hsl(270 80% 60% / 0.4)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="36" y1="10" x2="14" y2="18" stroke="hsl(270 80% 60% / 0.3)" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="14" y1="18" x2="12" y2="30" stroke="hsl(270 80% 60% / 0.3)" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="62" y1="10" x2="88" y2="28" stroke="hsl(270 80% 60% / 0.3)" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="88" y1="28" x2="92" y2="52" stroke="hsl(270 80% 60% / 0.28)" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="88" y1="70" x2="68" y2="90" stroke="hsl(270 80% 60% / 0.28)" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="68" y1="90" x2="42" y2="88" stroke="hsl(270 80% 60% / 0.28)" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="42" y1="88" x2="18" y2="82" stroke="hsl(270 80% 60% / 0.28)" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="18" y1="82" x2="8" y2="52" stroke="hsl(270 80% 60% / 0.25)" strokeWidth="0.8" strokeLinecap="round"/>
        {/* === NODES — center === */}
        <circle cx="50" cy="50" r="5.5" fill="hsl(270 80% 60%)"/>
        {/* === NODES — inner ring === */}
        <circle cx="50" cy="22" r="4" fill="hsl(270 80% 60%)"/>
        <circle cx="72" cy="34" r="3.6" fill="hsl(270 80% 60%)"/>
        <circle cx="78" cy="58" r="3.6" fill="hsl(270 80% 60%)"/>
        <circle cx="62" cy="76" r="3.6" fill="hsl(270 80% 60%)"/>
        <circle cx="30" cy="72" r="3.6" fill="hsl(270 80% 60%)"/>
        <circle cx="22" cy="58" r="3.6" fill="hsl(270 80% 60%)"/>
        <circle cx="28" cy="34" r="3.6" fill="hsl(270 80% 60%)"/>
        {/* === NODES — outer ring (perspective) === */}
        <ellipse cx="36" cy="10" rx="2.8" ry="2.2" fill="hsl(270 80% 60% / 0.8)"/>
        <ellipse cx="62" cy="10" rx="2.8" ry="2.2" fill="hsl(270 80% 60% / 0.8)"/>
        <ellipse cx="88" cy="28" rx="2.2" ry="2.8" fill="hsl(270 80% 60% / 0.75)"/>
        <ellipse cx="92" cy="52" rx="2" ry="2.8" fill="hsl(270 80% 60% / 0.7)"/>
        <ellipse cx="88" cy="70" rx="2.2" ry="2.8" fill="hsl(270 80% 60% / 0.7)"/>
        <ellipse cx="68" cy="90" rx="2.8" ry="2" fill="hsl(270 80% 60% / 0.7)"/>
        <ellipse cx="42" cy="88" rx="2.8" ry="2" fill="hsl(270 80% 60% / 0.7)"/>
        <ellipse cx="18" cy="82" rx="2.6" ry="2" fill="hsl(270 80% 60% / 0.65)"/>
        <ellipse cx="8" cy="52" rx="2" ry="2.8" fill="hsl(270 80% 60% / 0.65)"/>
        <ellipse cx="12" cy="30" rx="2" ry="2.6" fill="hsl(270 80% 60% / 0.65)"/>
        <ellipse cx="14" cy="18" rx="2.2" ry="2.6" fill="hsl(270 80% 60% / 0.6)"/>
        {/* Pink accent on center node */}
        <circle cx="50" cy="50" r="2" fill="hsl(315 85% 72%)"/>
      </svg>
    </span>
    <span className={`${textSize} font-bold tracking-tight`}>
      Koll<span className="gradient-text">ab</span>
    </span>
  </Link>
);

export default KollabLogo;
