/**
 * Deterministic abstract geometric default avatar system.
 *
 * 10 SVG variants are defined locally (no external requests).
 * A fast djb2-style hash maps a seed string to a stable variant,
 * so the same user always gets the same avatar across renders.
 *
 * Usage:
 *   import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";
 *   const src = realAvatarUrl || getDefaultAvatarUrl(user.id ?? user.name);
 */

// ── SVG helpers ────────────────────────────────────────────────────────────────

const enc = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// ── 10 abstract geometric variants ────────────────────────────────────────────
//  Each uses a dark/neutral background + a single bold geometric shape.
//  The background rect uses rx="50" (= 50% of 100 width) → perfect circle,
//  so avatars look circular even without external CSS clipping.

const VARIANTS: string[] = [
  // 1 · Diamond frame  ·  indigo + gold
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#1C1040"/>` +
      `<polygon points="50,17 77,50 50,83 23,50" fill="#F0B429"/>` +
      `<polygon points="50,33 63,50 50,67 37,50" fill="#1C1040"/>` +
      `</svg>`
  ),

  // 2 · Capsule / pill  ·  charcoal + coral-red
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#151520"/>` +
      `<rect x="22" y="32" width="56" height="36" rx="18" fill="#FF5D5D"/>` +
      `</svg>`
  ),

  // 3 · Hollow triangle  ·  dark teal + electric cyan
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#052A30"/>` +
      `<polygon points="50,14 84,74 16,74" fill="#00D4E0"/>` +
      `<polygon points="50,34 68,66 32,66" fill="#052A30"/>` +
      `</svg>`
  ),

  // 4 · Bullseye rings  ·  near-black + sky blue
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#0E1117"/>` +
      `<circle cx="50" cy="50" r="27" fill="none" stroke="#38BDF8" stroke-width="8"/>` +
      `<circle cx="50" cy="50" r="9" fill="#38BDF8"/>` +
      `</svg>`
  ),

  // 5 · Rounded cross  ·  dark forest + electric lime
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#071A0D"/>` +
      `<rect x="42" y="19" width="16" height="62" rx="8" fill="#7AFF3A"/>` +
      `<rect x="19" y="42" width="62" height="16" rx="8" fill="#7AFF3A"/>` +
      `</svg>`
  ),

  // 6 · Rotated square  ·  dark maroon + hot pink
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#18060F"/>` +
      `<rect x="28" y="28" width="44" height="44" rx="6" fill="#FF2D78" transform="rotate(45 50 50)"/>` +
      `</svg>`
  ),

  // 7 · Double chevron  ·  very dark green + golden yellow
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#0D1200"/>` +
      `<polyline points="22,36 50,58 78,36" fill="none" stroke="#FFD000" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<polyline points="22,56 50,78 78,56" fill="none" stroke="#FFD000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>` +
      `</svg>`
  ),

  // 8 · Hexagon frame  ·  pitch black + violet
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#080812"/>` +
      `<polygon points="50,16 78,33 78,67 50,84 22,67 22,33" fill="#7C3AED"/>` +
      `<polygon points="50,30 66,39 66,61 50,70 34,61 34,39" fill="#080812"/>` +
      `</svg>`
  ),

  // 9 · Stacked squares  ·  dark amber + warm orange / gold
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#191000"/>` +
      `<rect x="17" y="17" width="36" height="36" rx="5" fill="#FF8C00" opacity="0.9"/>` +
      `<rect x="47" y="47" width="36" height="36" rx="5" fill="#FFD700" opacity="0.85"/>` +
      `</svg>`
  ),

  // 10 · Open arc  ·  dark navy + vivid orange
  enc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" rx="50" fill="#071525"/>` +
      `<path d="M17,68 A37,37 0 1,1 83,68" fill="none" stroke="#FF6200" stroke-width="13" stroke-linecap="round"/>` +
      `</svg>`
  ),
];

// ── Hash function ──────────────────────────────────────────────────────────────
// djb2xor variant — fast, good distribution, no external deps.

function hashSeed(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h & h; // keep 32-bit
  }
  return Math.abs(h);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns a data URI for one of the 10 abstract geometric avatars.
 * Selection is deterministic: same seed → same avatar every time.
 *
 * @param seed  Any stable identifier: user id, name, email, etc.
 *              Falls back gracefully when null/undefined/empty.
 */
export function getDefaultAvatarUrl(seed?: string | null): string {
  const s = (seed ?? "").trim() || "default";
  return VARIANTS[hashSeed(s) % VARIANTS.length];
}
