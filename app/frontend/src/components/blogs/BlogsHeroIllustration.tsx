import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const BlogsHeroIllustration = ({ className }: Props) => (
  <svg
    viewBox="0 0 480 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-full h-auto", className)}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="blog-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(270 80% 60%)" stopOpacity="0.16" />
        <stop offset="100%" stopColor="hsl(270 80% 60%)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="blog-card-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(270 80% 60%)" stopOpacity="0.12" />
        <stop offset="100%" stopColor="hsl(315 85% 65%)" stopOpacity="0.06" />
      </linearGradient>
    </defs>

    <circle cx="240" cy="180" r="150" fill="url(#blog-glow)" />

    {/* Central article / page card */}
    <g>
      <rect x="165" y="80" width="150" height="200" rx="14" fill="url(#blog-card-grad)" stroke="hsl(270 80% 60%)" strokeWidth="1.5" strokeOpacity="0.35" />
      {/* Title lines */}
      <rect x="185" y="105" width="90" height="6" rx="3" fill="hsl(270 80% 60%)" fillOpacity="0.5" />
      <rect x="185" y="117" width="60" height="4" rx="2" fill="hsl(270 80% 60%)" fillOpacity="0.25" />
      {/* Body text lines */}
      <rect x="185" y="140" width="110" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.15" />
      <rect x="185" y="149" width="100" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.15" />
      <rect x="185" y="158" width="108" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.15" />
      <rect x="185" y="167" width="70" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.12" />
      {/* Code block */}
      <rect x="185" y="185" width="110" height="40" rx="6" fill="hsl(270 80% 60%)" fillOpacity="0.07" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.2" />
      <rect x="193" y="195" width="50" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.3" />
      <rect x="193" y="203" width="70" height="3" rx="1.5" fill="hsl(315 85% 65%)" fillOpacity="0.25" />
      <rect x="193" y="211" width="40" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.2" />
      {/* Author line */}
      <circle cx="195" cy="252" r="8" fill="hsl(270 80% 60%)" fillOpacity="0.2" />
      <rect x="208" y="249" width="50" height="4" rx="2" fill="hsl(270 80% 60%)" fillOpacity="0.25" />
    </g>

    {/* Floating article card — top right */}
    <g opacity="0.8">
      <rect x="340" y="90" width="100" height="70" rx="10" fill="url(#blog-card-grad)" stroke="hsl(270 80% 60%)" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="355" y="105" width="50" height="4" rx="2" fill="hsl(270 80% 60%)" fillOpacity="0.35" />
      <rect x="355" y="114" width="70" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.15" />
      <rect x="355" y="122" width="55" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.12" />
      <rect x="355" y="140" width="30" height="10" rx="5" fill="hsl(270 80% 60%)" fillOpacity="0.12" stroke="hsl(270 80% 60%)" strokeWidth="0.6" strokeOpacity="0.2" />
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="5s" repeatCount="indefinite" />
    </g>

    {/* Floating article card — bottom left */}
    <g opacity="0.8">
      <rect x="40" y="200" width="100" height="70" rx="10" fill="url(#blog-card-grad)" stroke="hsl(315 85% 65%)" strokeWidth="1" strokeOpacity="0.2" />
      <rect x="55" y="215" width="55" height="4" rx="2" fill="hsl(315 85% 65%)" fillOpacity="0.3" />
      <rect x="55" y="224" width="70" height="3" rx="1.5" fill="hsl(315 85% 65%)" fillOpacity="0.15" />
      <rect x="55" y="232" width="45" height="3" rx="1.5" fill="hsl(315 85% 65%)" fillOpacity="0.12" />
      <rect x="55" y="250" width="28" height="10" rx="5" fill="hsl(315 85% 65%)" fillOpacity="0.1" stroke="hsl(315 85% 65%)" strokeWidth="0.6" strokeOpacity="0.2" />
      <animateTransform attributeName="transform" type="translate" values="0,0;0,5;0,0" dur="6s" repeatCount="indefinite" />
    </g>

    {/* Floating tag badges */}
    <g>
      <rect x="70" y="130" width="52" height="20" rx="10" fill="hsl(270 80% 60%)" fillOpacity="0.1" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.25" />
      <text x="96" y="144" textAnchor="middle" fill="hsl(270 80% 60%)" fontSize="8" fontWeight="600" opacity="0.65">React</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="4s" repeatCount="indefinite" />
    </g>
    <g>
      <rect x="360" y="195" width="58" height="20" rx="10" fill="hsl(270 80% 60%)" fillOpacity="0.1" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.25" />
      <text x="389" y="209" textAnchor="middle" fill="hsl(270 80% 60%)" fontSize="8" fontWeight="600" opacity="0.65">AI/ML</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,0" dur="5.5s" repeatCount="indefinite" />
    </g>
    <g>
      <rect x="350" y="280" width="68" height="20" rx="10" fill="hsl(315 85% 65%)" fillOpacity="0.08" stroke="hsl(315 85% 65%)" strokeWidth="0.8" strokeOpacity="0.2" />
      <text x="384" y="294" textAnchor="middle" fill="hsl(315 85% 65%)" fontSize="8" fontWeight="600" opacity="0.55">DevOps</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="5s" repeatCount="indefinite" />
    </g>
    <g>
      <rect x="60" y="300" width="60" height="20" rx="10" fill="hsl(270 80% 60%)" fillOpacity="0.08" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.2" />
      <text x="90" y="314" textAnchor="middle" fill="hsl(270 80% 60%)" fontSize="8" fontWeight="600" opacity="0.55">Career</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,3;0,0" dur="4.5s" repeatCount="indefinite" />
    </g>

    {/* Chat / comment bubble — top left */}
    <g opacity="0.7">
      <rect x="55" y="60" width="70" height="40" rx="10" fill="hsl(270 80% 60%)" fillOpacity="0.08" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.2" />
      <polygon points="80,100 85,107 95,100" fill="hsl(270 80% 60%)" fillOpacity="0.08" />
      <rect x="67" y="72" width="45" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.2" />
      <rect x="67" y="80" width="30" height="3" rx="1.5" fill="hsl(270 80% 60%)" fillOpacity="0.15" />
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="6s" repeatCount="indefinite" />
    </g>

    {/* Pen / pencil icon — bottom right */}
    <g opacity="0.6" transform="translate(400,300)">
      <line x1="0" y1="30" x2="20" y2="0" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
      <line x1="20" y1="0" x2="24" y2="4" stroke="hsl(270 80% 60%)" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
      <circle cx="0" cy="30" r="2" fill="hsl(270 80% 60%)" fillOpacity="0.4" />
      <animateTransform attributeName="transform" type="translate" values="400,300;400,296;400,300" dur="4s" repeatCount="indefinite" />
    </g>

    {/* Pulse ring */}
    <circle cx="240" cy="180" r="85" fill="none" stroke="hsl(270 80% 60%)" strokeWidth="0.8" strokeOpacity="0.12">
      <animate attributeName="r" values="85;100;85" dur="4s" repeatCount="indefinite" />
      <animate attributeName="stroke-opacity" values="0.12;0.04;0.12" dur="4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default BlogsHeroIllustration;
