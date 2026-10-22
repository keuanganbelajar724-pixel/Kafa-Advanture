import React from 'react';
import { motion } from 'motion/react';

// Large, beautiful, tactile 2.5D Game Props for Little Home

export const BedProp: React.FC = () => (
  <svg width="155" height="115" viewBox="0 0 155 115" fill="none" className="filter drop-shadow-2xl">
    <defs>
      <linearGradient id="oakWood" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A16207" />
        <stop offset="50%" stopColor="#854D0E" />
        <stop offset="100%" stopColor="#582C05" />
      </linearGradient>
      <linearGradient id="bedQuilt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="60%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    {/* Wooden Headboard with Finial */}
    <rect x="8" y="16" width="20" height="82" rx="7" fill="url(#oakWood)" stroke="#451A03" strokeWidth="2.5" />
    <circle cx="18" cy="14" r="9" fill="#D97706" stroke="#451A03" strokeWidth="2" />
    {/* Wood grain grooves */}
    <line x1="14" y1="28" x2="14" y2="85" stroke="#713F12" strokeWidth="1.5" strokeDasharray="8 6" />
    <line x1="22" y1="28" x2="22" y2="85" stroke="#713F12" strokeWidth="1.5" strokeDasharray="12 4" />
    
    {/* Back Bed Frame */}
    <rect x="22" y="32" width="108" height="36" rx="4" fill="#854D0E" stroke="#582C05" strokeWidth="2" />
    
    {/* Fluffy Thick Mattress with Layer Piping */}
    <rect x="24" y="48" width="116" height="34" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <line x1="26" y1="62" x2="138" y2="62" stroke="#E2E8F0" strokeWidth="1.5" />
    
    {/* Quilt / Blanket with Cozy Fold and Warm Shadow */}
    <path d="M48 50 L140 50 Q144 50 144 56 L144 82 L48 82 Z" fill="url(#bedQuilt)" stroke="#1E40AF" strokeWidth="2" />
    <path d="M48 50 L140 50 L140 58 L48 58 Z" fill="#93C5FD" opacity="0.4" />
    {/* Folded Top Edge of Quilt */}
    <path d="M48 50 Q56 46 64 50 L64 82 L48 82 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
    <line x1="68" y1="66" x2="140" y2="66" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5 4" opacity="0.8" />
    
    {/* Fluffy Feather Pillow with indentation */}
    <ellipse cx="40" cy="50" rx="19" ry="12" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
    <path d="M32 49 Q40 53 48 49" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" fill="none" />
    
    {/* Wooden Footboard */}
    <rect x="136" y="44" width="15" height="52" rx="6" fill="url(#oakWood)" stroke="#451A03" strokeWidth="2.5" />
    <circle cx="143" cy="41" r="7" fill="#D97706" stroke="#451A03" strokeWidth="2" />
    
    {/* Sturdy Bed Legs */}
    <rect x="12" y="94" width="12" height="15" rx="3" fill="#451A03" />
    <rect x="138" y="94" width="12" height="15" rx="3" fill="#451A03" />
  </svg>
);

export const TableProp: React.FC = () => (
  <svg width="145" height="115" viewBox="0 0 145 115" fill="none" className="filter drop-shadow-2xl">
    <defs>
      <linearGradient id="tableTop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="50%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
    </defs>
    {/* Table Top Surface (Rich Polished Oak Wood with 2.5D Bevel) */}
    <ellipse cx="72" cy="46" rx="64" ry="17" fill="url(#tableTop)" stroke="#451A03" strokeWidth="2.5" />
    <ellipse cx="72" cy="43" rx="61" ry="14" fill="#F59E0B" opacity="0.35" />
    
    {/* Natural Wood Grain Rings on Surface */}
    <path d="M30 44 Q72 37 114 44" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    <path d="M45 42 Q72 38 100 42" stroke="#78350F" strokeWidth="1" strokeLinecap="round" opacity="0.4" fill="none" />

    {/* Cozy Reading Lamp on Desk with Warm Light Beam */}
    <ellipse cx="32" cy="42" rx="8" ry="3.5" fill="#334155" />
    <path d="M32 42 Q36 26 45 22" stroke="#64748B" strokeWidth="3" fill="none" />
    <path d="M42 18 L56 26 L41 31 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
    {/* Warm Light Cast */}
    <polygon points="48,27 76,46 36,46" fill="#FDE047" opacity="0.3" />
    
    {/* Ceramic Pencil Cup with Colored Pencils */}
    <rect x="100" y="30" width="14" height="18" rx="4" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
    <line x1="103" y1="30" x2="100" y2="20" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="107" y1="30" x2="108" y2="18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="111" y1="30" x2="114" y2="22" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Wooden Drawer Apron & Turned Legs with Brass Tips */}
    <path d="M18 48 L126 48 L120 60 L24 60 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    {/* Front Left Leg */}
    <rect x="22" y="56" width="13" height="52" rx="4" fill="#92400E" stroke="#451A03" strokeWidth="2" />
    <rect x="22" y="100" width="13" height="8" rx="2" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
    {/* Front Right Leg */}
    <rect x="109" y="56" width="13" height="52" rx="4" fill="#92400E" stroke="#451A03" strokeWidth="2" />
    <rect x="109" y="100" width="13" height="8" rx="2" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
    {/* Back Legs */}
    <rect x="39" y="52" width="10" height="44" rx="3" fill="#582C05" opacity="0.8" />
    <rect x="96" y="52" width="10" height="44" rx="3" fill="#582C05" opacity="0.8" />
  </svg>
);

export const ChairProp: React.FC = () => (
  <svg width="105" height="130" viewBox="0 0 105 130" fill="none" className="filter drop-shadow-2xl">
    {/* Solid Wooden Backrest Spindles */}
    <rect x="24" y="6" width="56" height="58" rx="10" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
    <rect x="33" y="14" width="7" height="42" rx="3.5" fill="#FDE68A" />
    <rect x="48" y="14" width="7" height="42" rx="3.5" fill="#FDE68A" />
    <rect x="63" y="14" width="7" height="42" rx="3.5" fill="#FDE68A" />
    
    {/* Plump Padded Seat Cushion (Emerald Velvet with Button Tuft) */}
    <rect x="16" y="64" width="72" height="20" rx="8" fill="#10B981" stroke="#065F46" strokeWidth="2.5" />
    <ellipse cx="52" cy="70" rx="30" ry="7" fill="#34D399" />
    <circle cx="52" cy="71" r="2.5" fill="#065F46" />
    
    {/* Turned Chair Legs with Cross Stretcher */}
    <rect x="22" y="82" width="10" height="42" rx="3" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
    <rect x="72" y="82" width="10" height="42" rx="3" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
    <line x1="28" y1="104" x2="76" y2="104" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
    <rect x="34" y="80" width="8" height="38" rx="2" fill="#582C05" opacity="0.7" />
    <rect x="64" y="80" width="8" height="38" rx="2" fill="#582C05" opacity="0.7" />

    {/* Non-Slip Rubber Foot Caps */}
    <rect x="20" y="122" width="14" height="8" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
    <rect x="70" y="122" width="14" height="8" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
  </svg>
);


export const BookProp: React.FC = () => (
  <svg width="135" height="115" viewBox="0 0 135 115" fill="none" className="filter drop-shadow-2xl">
    {/* Heavy Oak Book Stand Base */}
    <ellipse cx="68" cy="100" rx="38" ry="9" fill="#582C05" />
    <rect x="63" y="65" width="10" height="36" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    
    {/* Open Crimson Leather Hardcover with Gold Filigree */}
    <path d="M12 55 Q68 69 68 66 Q68 69 124 55 L128 24 Q68 38 68 35 Q68 38 8 24 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="3" />
    
    {/* Left Page Pages with Realistic Thickness */}
    <path d="M15 52 Q68 65 68 63 L68 33 Q68 35 12 23 Z" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
    {/* Story Calligraphy text lines */}
    <line x1="22" y1="33" x2="58" y2="39" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="41" x2="54" y2="47" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="49" x2="48" y2="54" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    
    {/* Right Page with Colorful Adventure Castle Illustration */}
    <path d="M121 52 Q68 65 68 63 L68 33 Q68 35 124 23 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <circle cx="94" cy="38" r="11" fill="#F59E0B" />
    <path d="M86 46 Q94 40 104 46" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
    <polygon points="90,44 94,36 98,44" fill="#3B82F6" />
    
    {/* Lustrous Golden Ribbon Bookmark */}
    <path d="M68 34 Q74 58 82 76 L76 72 L72 78 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
  </svg>
);

export const BagProp: React.FC = () => (
  <svg width="125" height="135" viewBox="0 0 125 135" fill="none" className="filter drop-shadow-2xl">
    {/* Sturdy Canvas Hanging Handle */}
    <path d="M44 42 Q62 14 80 42" stroke="#78350F" strokeWidth="7" strokeLinecap="round" fill="none" />
    
    {/* Main Backpack Body (Bright Orange/Coral Adventure Canvas) */}
    <rect x="24" y="34" width="76" height="78" rx="22" fill="#EA580C" stroke="#7C2D12" strokeWidth="3" />
    
    {/* Backpack Top Flap with Rounded Cut */}
    <path d="M24 50 Q62 67 100 50 L100 36 Q62 26 24 36 Z" fill="#C2410C" stroke="#7C2D12" strokeWidth="2" />
    
    {/* Front Zipper Cargo Pocket */}
    <rect x="36" y="66" width="52" height="38" rx="12" fill="#FB923C" stroke="#C2410C" strokeWidth="2.5" />
    <line x1="42" y1="74" x2="82" y2="74" stroke="#78350F" strokeWidth="2" strokeDasharray="3 2" />
    
    {/* Leather Straps & Solid Brass Buckles */}
    <rect x="44" y="48" width="7" height="30" fill="#78350F" />
    <rect x="42" y="63" width="11" height="7" rx="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
    <rect x="74" y="48" width="7" height="30" fill="#78350F" />
    <rect x="72" y="63" width="11" height="7" rx="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />

    {/* Adventure Star Keychain Tag */}
    <circle cx="92" cy="74" r="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
    <text x="89.5" y="77" fontSize="8" fontWeight="black" fill="#78350F">★</text>
    
    {/* Side Pocket Water Bottle */}
    <rect x="96" y="62" width="14" height="28" rx="5" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
    <rect x="98" y="56" width="10" height="7" rx="2" fill="#38BDF8" />
  </svg>
);

export const DoorProp: React.FC = () => (
  <svg width="135" height="175" viewBox="0 0 135 175" fill="none" className="filter drop-shadow-2xl">
    <defs>
      <linearGradient id="doorPlanks" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A16207" />
        <stop offset="50%" stopColor="#854D0E" />
        <stop offset="100%" stopColor="#582C05" />
      </linearGradient>
    </defs>
    {/* Cottage Stone Arch Frame with Keystone */}
    <path d="M12 165 L12 60 Q68 12 124 60 L124 165 Z" fill="#94A3B8" stroke="#475569" strokeWidth="3" />
    <path d="M18 165 L18 64 Q68 20 118 64 L118 165 Z" fill="#CBD5E1" />
    <polygon points="62,14 74,14 71,28 65,28" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
    
    {/* Arched Heavy Oak Plank Door */}
    <path d="M22 165 L22 68 Q68 28 114 68 L114 165 Z" fill="url(#doorPlanks)" stroke="#451A03" strokeWidth="2.5" />
    
    {/* Vertical Timber Plank Grooves */}
    <line x1="52" y1="46" x2="52" y2="165" stroke="#451A03" strokeWidth="2.5" />
    <line x1="84" y1="46" x2="84" y2="165" stroke="#451A03" strokeWidth="2.5" />
    
    {/* Wrought Iron Strap Hinges with Rivets */}
    <rect x="22" y="66" width="34" height="7" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
    <circle cx="26" cy="69.5" r="1.8" fill="#94A3B8" />
    <circle cx="36" cy="69.5" r="1.8" fill="#94A3B8" />
    <circle cx="48" cy="69.5" r="1.8" fill="#94A3B8" />

    <rect x="22" y="132" width="34" height="7" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
    <circle cx="26" cy="135.5" r="1.8" fill="#94A3B8" />
    <circle cx="36" cy="135.5" r="1.8" fill="#94A3B8" />
    <circle cx="48" cy="135.5" r="1.8" fill="#94A3B8" />
    
    {/* Polished Solid Brass Doorknob with Keyhole Backplate */}
    <rect x="94" y="104" width="10" height="20" rx="3" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
    <circle cx="99" cy="111" r="5.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
    <circle cx="97.5" cy="109.5" r="1.5" fill="#FFFFFF" />
    <ellipse cx="99" cy="119" rx="1.2" ry="2" fill="#78350F" />

    {/* Cozy Brass Knocker */}
    <circle cx="68" cy="80" r="7" stroke="#FDE047" strokeWidth="2.5" fill="none" />
    <circle cx="68" cy="74" r="3.5" fill="#B45309" />
    
    {/* Welcome Mat with Textured Border */}
    <rect x="18" y="160" width="100" height="12" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
    <text x="36" y="169" fontSize="8" fontWeight="black" fill="#FEF3C7" letterSpacing="2">WELCOME</text>
  </svg>
);

export const WindowProp: React.FC = () => (
  <svg width="135" height="135" viewBox="0 0 135 135" fill="none" className="filter drop-shadow-2xl">
    {/* White Wooden Trim with Window Sill */}
    <rect x="16" y="12" width="102" height="96" rx="12" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" />
    
    {/* Sunny Day Outdoor Scene Behind Glass */}
    <rect x="24" y="20" width="86" height="80" rx="6" fill="#38BDF8" />
    {/* Sun & Rolling Green Hill */}
    <circle cx="86" cy="38" r="14" fill="#FDE047" />
    <path d="M24 82 Q55 60 85 75 Q100 82 110 74 L110 100 L24 100 Z" fill="#22C55E" />
    
    {/* Soft Sheer Curtains Draped on Sides */}
    <path d="M24 20 Q36 55 28 85 L24 85 Z" fill="#FEF08A" opacity="0.6" />
    <path d="M110 20 Q98 55 106 85 L110 85 Z" fill="#FEF08A" opacity="0.6" />
    
    {/* Window Cross Muntin Grid */}
    <line x1="67" y1="20" x2="67" y2="100" stroke="#FFFFFF" strokeWidth="4" />
    <line x1="24" y1="60" x2="110" y2="60" stroke="#FFFFFF" strokeWidth="4" />
    
    {/* Realistic Diagonal Glass Glare Shines */}
    <line x1="32" y1="26" x2="56" y2="26" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    <line x1="74" y1="26" x2="98" y2="26" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    <line x1="34" y1="34" x2="48" y2="34" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    
    {/* Colorful Blossoming Flowerbox on Sill */}
    <rect x="10" y="100" width="114" height="20" rx="6" fill="#78350F" stroke="#451A03" strokeWidth="2.5" />
    {/* Flowers in Flowerbox */}
    <circle cx="28" cy="100" r="7" fill="#F43F5E" />
    <circle cx="28" cy="100" r="2.5" fill="#FDE047" />
    <circle cx="50" cy="98" r="7" fill="#FBBF24" />
    <circle cx="50" cy="98" r="2.5" fill="#FFFFFF" />
    <circle cx="72" cy="100" r="7" fill="#A855F7" />
    <circle cx="72" cy="100" r="2.5" fill="#FDE047" />
    <circle cx="94" cy="98" r="7" fill="#EC4899" />
    <circle cx="94" cy="98" r="2.5" fill="#FFFFFF" />
  </svg>
);

export const ShoesProp: React.FC = () => (
  <svg width="135" height="95" viewBox="0 0 135 95" fill="none" className="filter drop-shadow-2xl">
    {/* Left Retro Sneaker */}
    <g>
      {/* Red Canvas Upper with Ankle Collar */}
      <path d="M12 56 Q18 30 38 26 L52 40 L65 52 Q68 64 50 67 L16 67 Q10 67 12 56 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
      {/* White Star Logo Badge */}
      <circle cx="30" cy="46" r="6" fill="#FFFFFF" stroke="#991B1B" strokeWidth="1" />
      <text x="27.5" y="49" fontSize="9" fontWeight="black" fill="#EF4444">★</text>
      {/* White Rubber Toe Cap */}
      <path d="M52 49 Q67 55 64 64 L50 67 Q47 57 52 49 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Thick White Outsole with Red Tread Line */}
      <rect x="11" y="65" width="56" height="13" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      <line x1="14" y1="71" x2="63" y2="71" stroke="#EF4444" strokeWidth="1.5" />
      {/* Metal Eyelets & Criss-cross Shoelaces */}
      <circle cx="34" cy="37" r="1.5" fill="#94A3B8" />
      <circle cx="44" cy="42" r="1.5" fill="#94A3B8" />
      <circle cx="32" cy="45" r="1.5" fill="#94A3B8" />
      <circle cx="44" cy="50" r="1.5" fill="#94A3B8" />
      <line x1="34" y1="37" x2="44" y2="42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="42" x2="32" y2="45" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="45" x2="44" y2="50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    
    {/* Right Retro Sneaker (Slightly Offset in Perspective) */}
    <g transform="translate(54, -4)">
      <path d="M12 56 Q18 30 38 26 L52 40 L65 52 Q68 64 50 67 L16 67 Q10 67 12 56 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
      <circle cx="30" cy="46" r="6" fill="#FFFFFF" stroke="#991B1B" strokeWidth="1" />
      <text x="27.5" y="49" fontSize="9" fontWeight="black" fill="#EF4444">★</text>
      <path d="M52 49 Q67 55 64 64 L50 67 Q47 57 52 49 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
      <rect x="11" y="65" width="56" height="13" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      <line x1="14" y1="71" x2="63" y2="71" stroke="#EF4444" strokeWidth="1.5" />
      <circle cx="34" cy="37" r="1.5" fill="#94A3B8" />
      <circle cx="44" cy="42" r="1.5" fill="#94A3B8" />
      <circle cx="32" cy="45" r="1.5" fill="#94A3B8" />
      <circle cx="44" cy="50" r="1.5" fill="#94A3B8" />
      <line x1="34" y1="37" x2="44" y2="42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="42" x2="32" y2="45" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="45" x2="44" y2="50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

export const BallProp: React.FC = () => (
  <svg width="110" height="110" viewBox="0 0 110 110" fill="none" className="filter drop-shadow-xl">
    {/* Soccer Ball Outer Sphere */}
    <circle cx="55" cy="55" r="45" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
    
    {/* Center Pentagon */}
    <polygon points="55,38 68,48 63,64 47,64 42,48" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
    
    {/* Connecting Seams to Edge Patches */}
    <line x1="55" y1="38" x2="55" y2="12" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="68" y1="48" x2="94" y2="42" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="63" y1="64" x2="84" y2="86" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="47" y1="64" x2="26" y2="86" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="42" y1="48" x2="16" y2="42" stroke="#0F172A" strokeWidth="2.5" />
    
    {/* Edge Pentagon Segments */}
    <polygon points="45,11 65,11 55,24" fill="#1E293B" />
    <polygon points="90,34 99,48 88,54" fill="#1E293B" />
    <polygon points="82,82 72,96 86,96" fill="#1E293B" />
    <polygon points="28,82 38,96 24,96" fill="#1E293B" />
    <polygon points="20,34 11,48 22,54" fill="#1E293B" />
    
    {/* Glossy Curved Highlight */}
    <path d="M30 25 Q55 18 75 28" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const CatProp: React.FC = () => (
  <svg width="130" height="110" viewBox="0 0 130 110" fill="none" className="filter drop-shadow-xl">
    {/* Cozy Cushion Mat */}
    <ellipse cx="65" cy="88" rx="55" ry="18" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />
    <ellipse cx="65" cy="85" rx="50" ry="14" fill="#FDF2F8" />
    
    {/* Ginger Cat Body (Curled up peacefully) */}
    <ellipse cx="65" cy="65" rx="36" ry="24" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
    
    {/* Tabby Stripes on Back */}
    <path d="M52 48 Q60 52 56 60" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M65 46 Q72 50 68 60" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M78 48 Q84 52 80 60" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Cat Head */}
    <circle cx="42" cy="55" r="18" fill="#FB923C" stroke="#C2410C" strokeWidth="2" />
    
    {/* Cute Ears */}
    <polygon points="30,44 26,26 40,36" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
    <polygon points="31,40 28,30 38,36" fill="#FEE2E2" />
    <polygon points="44,36 56,26 54,44" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
    <polygon points="46,36 53,30 51,40" fill="#FEE2E2" />
    
    {/* Peaceful Sleeping Eyes & Whiskers */}
    <path d="M32 58 Q36 62 40 58" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M44 58 Q48 62 52 58" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
    <ellipse cx="42" cy="62" rx="2" ry="1.5" fill="#BE123C" />
    <line x1="24" y1="60" x2="30" y2="61" stroke="#7C2D12" strokeWidth="1.5" />
    <line x1="23" y1="64" x2="29" y2="64" stroke="#7C2D12" strokeWidth="1.5" />
    
    {/* Fluffy Tail Curled */}
    <path d="M96 68 Q108 55 98 44 Q90 42 92 50" stroke="#EA580C" strokeWidth="8" strokeLinecap="round" fill="none" />
    
    {/* Floating "Z z z" */}
    <text x="24" y="30" fontSize="14" fontWeight="bold" fill="#8B5CF6" className="animate-float">z</text>
    <text x="14" y="20" fontSize="16" fontWeight="bold" fill="#A855F7" className="animate-float" style={{ animationDelay: '0.5s' }}>Z</text>
  </svg>
);

// ==========================================
// CUTE HIGH-TECH ROBOT HERO (NO HUMAN CHARACTERS)
// ==========================================
export { RoboHero, RoboHero as FacelessCharacter } from './RoboHero';
export type { RoboHeroProps as FacelessCharacterProps } from './RoboHero';

// ==========================================
// LEVEL 2 TO 5 ADDITIONAL PROPS
// ==========================================

export const TreeProp: React.FC = () => (
  <svg width="150" height="170" viewBox="0 0 150 170" fill="none" className="filter drop-shadow-2xl">
    {/* Trunk */}
    <path d="M60 90 L52 165 L98 165 L90 90 Z" fill="#78350F" stroke="#451A03" strokeWidth="3" />
    <path d="M48 160 Q75 145 102 160" stroke="#451A03" strokeWidth="2" fill="none" />
    {/* Foliage Canopy */}
    <circle cx="75" cy="70" r="55" fill="#15803D" stroke="#166534" strokeWidth="3" />
    <circle cx="50" cy="60" r="40" fill="#16A34A" />
    <circle cx="100" cy="60" r="40" fill="#16A34A" />
    <circle cx="75" cy="40" r="38" fill="#22C55E" />
    {/* Red Apples */}
    <circle cx="50" cy="55" r="9" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
    <circle cx="95" cy="50" r="9" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
    <circle cx="75" cy="85" r="9" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
    <circle cx="85" cy="30" r="7" fill="#EF4444" />
  </svg>
);

export const FlowerProp: React.FC = () => (
  <svg width="120" height="110" viewBox="0 0 120 110" fill="none" className="filter drop-shadow-xl">
    {/* Green Leaves */}
    <ellipse cx="40" cy="85" rx="20" ry="8" fill="#16A34A" transform="rotate(-20 40 85)" />
    <ellipse cx="80" cy="85" rx="20" ry="8" fill="#16A34A" transform="rotate(20 80 85)" />
    <line x1="60" y1="50" x2="60" y2="100" stroke="#15803D" strokeWidth="4" />
    {/* Flower 1 (Pink) */}
    <circle cx="60" cy="45" r="16" fill="#F43F5E" stroke="#BE123C" strokeWidth="2" />
    <circle cx="60" cy="45" r="8" fill="#FACC15" />
    {/* Surrounding Petals */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x = 60 + Math.cos(rad) * 18;
      const y = 45 + Math.sin(rad) * 18;
      return <circle key={i} cx={x} cy={y} r="10" fill="#FB7185" />;
    })}
    <circle cx="60" cy="45" r="9" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
  </svg>
);

export const WaterProp: React.FC = () => (
  <svg width="150" height="90" viewBox="0 0 150 90" fill="none" className="filter drop-shadow-xl">
    <ellipse cx="75" cy="50" rx="70" ry="32" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
    <ellipse cx="75" cy="48" rx="64" ry="26" fill="#38BDF8" />
    {/* Ripples */}
    <ellipse cx="65" cy="45" rx="35" ry="12" stroke="#BAE6FD" strokeWidth="2" fill="none" />
    {/* Waterlily */}
    <ellipse cx="105" cy="50" rx="14" ry="7" fill="#15803D" />
    <circle cx="105" cy="46" r="6" fill="#F472B6" />
    <circle cx="105" cy="46" r="2.5" fill="#FEF08A" />
  </svg>
);

export const DeskProp: React.FC = () => (
  <svg width="150" height="112" viewBox="0 0 150 112" fill="none" className="filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
    <defs>
      <linearGradient id="deskTopWood" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="40%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="deskFront" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="metalLeg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Metal Frame & Sturdy Tubular Legs */}
    <rect x="22" y="58" width="10" height="52" rx="4" fill="url(#metalLeg)" stroke="#334155" strokeWidth="1.5" />
    <rect x="118" y="58" width="10" height="52" rx="4" fill="url(#metalLeg)" stroke="#334155" strokeWidth="1.5" />
    {/* Non-slip Rubber Feet */}
    <rect x="20" y="105" width="14" height="7" rx="3" fill="#1E293B" />
    <rect x="116" y="105" width="14" height="7" rx="3" fill="#1E293B" />
    {/* Under-desk Book Compartment / Shelf */}
    <path d="M26 56 L124 56 L120 74 L30 74 Z" fill="url(#deskFront)" stroke="#451A03" strokeWidth="1.5" />
    {/* Textbooks stored under desk */}
    <rect x="36" y="60" width="38" height="10" rx="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
    <rect x="76" y="62" width="36" height="8" rx="2" fill="#10B981" stroke="#047857" strokeWidth="1" />
    
    {/* Desktop Beveled Surface */}
    <rect x="12" y="32" width="126" height="24" rx="6" fill="url(#deskTopWood)" stroke="#78350F" strokeWidth="2.5" />
    {/* Gloss Top Specular Sheen */}
    <rect x="16" y="34" width="118" height="6" rx="3" fill="#FEF3C7" opacity="0.45" />

    {/* Open Notebook with Colorful Pen & Bookmark */}
    <rect x="36" y="24" width="46" height="20" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
    <line x1="59" y1="24" x2="59" y2="44" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Mini notebook text lines */}
    <line x1="40" y1="29" x2="55" y2="29" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" />
    <line x1="40" y1="34" x2="53" y2="34" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
    <line x1="40" y1="39" x2="55" y2="39" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
    <line x1="63" y1="29" x2="78" y2="29" stroke="#EF4444" strokeWidth="1" strokeLinecap="round" />
    <line x1="63" y1="34" x2="76" y2="34" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
    {/* Bookmark ribbon */}
    <path d="M57 24 L57 40 L60 37 L63 40 L63 24 Z" fill="#F43F5E" />

    {/* Ceramic Pencil Cup with Colored Pencils */}
    <rect x="94" y="20" width="18" height="22" rx="4" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1.5" />
    <line x1="98" y1="20" x2="94" y2="8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="103" y1="20" x2="103" y2="6" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="108" y1="20" x2="111" y2="10" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />

    {/* Shiny Red Teacher's Apple */}
    <circle cx="122" cy="28" r="8" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
    <path d="M122 20 Q124 16 126 15" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <ellipse cx="126" cy="17" rx="3" ry="1.5" fill="#22C55E" transform="rotate(-20 126 17)" />
  </svg>
);

export const PencilProp: React.FC = () => (
  <svg width="130" height="95" viewBox="0 0 130 95" fill="none" className="filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
    <g transform="rotate(-28 65 48)">
      {/* Pencil Body Facets */}
      <rect x="34" y="38" width="68" height="20" rx="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
      <rect x="34" y="44" width="68" height="8" fill="#FDE047" opacity="0.7" />
      <line x1="34" y1="44" x2="102" y2="44" stroke="#CA8A04" strokeWidth="1.2" />
      <line x1="34" y1="52" x2="102" y2="52" stroke="#CA8A04" strokeWidth="1.2" />
      
      {/* Metallic Ferrule Band with Embossed Crimps */}
      <rect x="102" y="38" width="10" height="20" rx="1" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
      <line x1="105" y1="38" x2="105" y2="58" stroke="#CBD5E1" strokeWidth="1.2" />
      <line x1="109" y1="38" x2="109" y2="58" stroke="#64748B" strokeWidth="1.2" />

      {/* Soft Pink Rubber Eraser with Rounded Edge */}
      <rect x="112" y="39" width="14" height="18" rx="4" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
      <path d="M114 41 L124 41" stroke="#FBCFE8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Sharpened Cedar Wood Cone Tip */}
      <polygon points="34,38 12,48 34,58" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />
      {/* Natural Wood Grain on Cone */}
      <path d="M26 42 Q28 48 26 54" stroke="#FDBA74" strokeWidth="1.2" fill="none" />

      {/* Graphite Lead Point */}
      <polygon points="19,45 12,48 19,51" fill="#0F172A" stroke="#020617" strokeWidth="1" />
      {/* Specular Lead Highlight */}
      <circle cx="15" cy="47.5" r="1" fill="#94A3B8" />
    </g>
  </svg>
);

export const RulerProp: React.FC = () => (
  <svg width="150" height="75" viewBox="0 0 150 75" fill="none" className="filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.4)]">
    <defs>
      <linearGradient id="rulerWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>
    {/* Ruler Solid Plank */}
    <rect x="10" y="24" width="130" height="30" rx="5" fill="url(#rulerWood)" stroke="#B45309" strokeWidth="2.5" />
    {/* Top Edge Gloss Highlight */}
    <rect x="12" y="25" width="126" height="5" rx="2" fill="#FFFFFF" opacity="0.6" />

    {/* Metric Calibration Ticks */}
    {[18, 28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="24" x2={x} y2={i % 2 === 0 ? "40" : "34"} stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
        {i % 2 === 0 && (
          <text x={x - 3} y="49" fontSize="8" fontWeight="900" fill="#78350F" fontFamily="monospace">
            {i}
          </text>
        )}
      </g>
    ))}
    {/* Centimeter Brand Badge */}
    <text x="116" y="49" fontSize="8.5" fontWeight="900" fill="#92400E" fontFamily="sans-serif">
      CM
    </text>
    {/* Mini Star Stamp */}
    <circle cx="22" cy="46" r="3" fill="#F59E0B" />
  </svg>
);

export const BoardProp: React.FC = () => (
  <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)]">
    <defs>
      <linearGradient id="chalkboardWood" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#92400E" />
        <stop offset="50%" stopColor="#78350F" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
      <linearGradient id="chalkSlate" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#064E3B" />
        <stop offset="50%" stopColor="#065F46" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Solid Hardwood Frame with Beveled Edges */}
    <rect x="8" y="12" width="144" height="92" rx="7" fill="url(#chalkboardWood)" stroke="#451A03" strokeWidth="3" />
    {/* Inner Shadow Recess */}
    <rect x="15" y="19" width="130" height="74" rx="4" fill="#022C22" opacity="0.6" />
    
    {/* Classic School Deep Sage Green Chalkboard */}
    <rect x="16" y="20" width="128" height="72" rx="4" fill="url(#chalkSlate)" />
    
    {/* Decorative Compass & Stars Chalk Art */}
    <text x="24" y="44" fontSize="16" fontWeight="900" fill="#FFFFFF" opacity="0.95" fontFamily="monospace">
      A B C • 1 2 3
    </text>
    <text x="24" y="64" fontSize="11" fontWeight="bold" fill="#FEF08A" opacity="0.95" fontFamily="monospace">
      2 + 3 = 5 🌟
    </text>
    <text x="24" y="80" fontSize="9" fontWeight="bold" fill="#6EE7B7" opacity="0.9" fontFamily="sans-serif">
      "Rajin Belajar, Pintar!"
    </text>

    {/* Hanging Wooden Chalk Tray Ledge */}
    <rect x="12" y="98" width="136" height="8" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
    {/* Colored Chalk Sticks resting on tray */}
    <rect x="24" y="96" width="14" height="4" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
    <rect x="42" y="96" width="14" height="4" rx="1.5" fill="#FDE047" stroke="#EAB308" strokeWidth="0.5" />
    <rect x="60" y="96" width="14" height="4" rx="1.5" fill="#67E8F9" stroke="#06B6D4" strokeWidth="0.5" />
    {/* Felt Chalkboard Eraser */}
    <rect x="106" y="94" width="22" height="7" rx="2" fill="#451A03" stroke="#291003" strokeWidth="1" />
    <rect x="106" y="98" width="22" height="3" fill="#D6D3D1" />
  </svg>
);

export const ClockProp: React.FC = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
    <defs>
      <linearGradient id="clockBezel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>
    {/* Thick Molded Polycarbonate Chrome Ring Bezel */}
    <circle cx="60" cy="60" r="50" fill="url(#clockBezel)" stroke="#0C4A6E" strokeWidth="3" />
    {/* Inner White Dial Face */}
    <circle cx="60" cy="60" r="42" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
    
    {/* Numerals (12, 3, 6, 9) */}
    <text x="56" y="30" fontSize="11" fontWeight="900" fill="#0F172A" fontFamily="sans-serif">12</text>
    <text x="92" y="64" fontSize="11" fontWeight="900" fill="#0F172A" fontFamily="sans-serif">3</text>
    <text x="57" y="96" fontSize="11" fontWeight="900" fill="#0F172A" fontFamily="sans-serif">6</text>
    <text x="22" y="64" fontSize="11" fontWeight="900" fill="#0F172A" fontFamily="sans-serif">9</text>
    
    {/* Subtle Hour Dots */}
    <circle cx="78" cy="27" r="2" fill="#64748B" />
    <circle cx="93" cy="42" r="2" fill="#64748B" />
    <circle cx="93" cy="78" r="2" fill="#64748B" />
    <circle cx="78" cy="93" r="2" fill="#64748B" />
    <circle cx="42" cy="93" r="2" fill="#64748B" />
    <circle cx="27" cy="78" r="2" fill="#64748B" />
    <circle cx="27" cy="42" r="2" fill="#64748B" />
    <circle cx="42" cy="27" r="2" fill="#64748B" />

    {/* Hour Hand (Points to 10) */}
    <line x1="60" y1="60" x2="42" y2="44" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
    {/* Minute Hand (Points to 2) */}
    <line x1="60" y1="60" x2="80" y2="38" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />
    {/* Sweeping Red Second Hand */}
    <line x1="60" y1="64" x2="60" y2="24" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
    
    {/* Center Pin Cover */}
    <circle cx="60" cy="60" r="4.5" fill="#EF4444" stroke="#991B1B" strokeWidth="1.2" />

    {/* Convex Glass Dome Curved Reflection */}
    <path d="M26 44 A38 38 0 0 1 94 44" stroke="#FFFFFF" strokeWidth="4" opacity="0.45" strokeLinecap="round" fill="none" />
  </svg>
);

export const BreadProp: React.FC = () => (
  <svg width="130" height="90" viewBox="0 0 130 90" fill="none" className="filter drop-shadow-xl">
    <ellipse cx="65" cy="52" rx="55" ry="26" fill="#D97706" stroke="#92400E" strokeWidth="2.5" />
    <ellipse cx="65" cy="48" rx="50" ry="22" fill="#F59E0B" />
    {/* Cuts on bread */}
    <path d="M40 38 Q45 48 42 56" stroke="#78350F" strokeWidth="2.5" fill="none" />
    <path d="M65 36 Q70 48 67 58" stroke="#78350F" strokeWidth="2.5" fill="none" />
    <path d="M90 38 Q95 48 92 56" stroke="#78350F" strokeWidth="2.5" fill="none" />
  </svg>
);

export const MilkProp: React.FC = () => (
  <svg width="100" height="120" viewBox="0 0 100 120" fill="none" className="filter drop-shadow-xl">
    {/* Bottle Body */}
    <rect x="28" y="40" width="44" height="65" rx="10" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
    <path d="M38 40 L38 22 L62 22 L62 40 Z" fill="#F0F9FF" stroke="#0284C7" strokeWidth="2" />
    {/* Blue Cap */}
    <rect x="36" y="16" width="28" height="8" rx="3" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
    {/* Milk Label with Cow/Drop */}
    <rect x="32" y="55" width="36" height="32" rx="4" fill="#38BDF8" />
    <text x="36" y="75" fontSize="10" fontWeight="bold" fill="#FFFFFF">MILK</text>
  </svg>
);

export const AppleProp: React.FC = () => (
  <svg width="110" height="110" viewBox="0 0 110 110" fill="none" className="filter drop-shadow-xl">
    <circle cx="45" cy="62" r="32" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
    <circle cx="65" cy="62" r="32" fill="#DC2626" stroke="#B91C1C" strokeWidth="2" />
    {/* Stem & Leaf */}
    <path d="M55 35 Q58 20 66 18" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <ellipse cx="72" cy="24" rx="10" ry="5" fill="#22C55E" transform="rotate(-20 72 24)" />
    {/* Shine */}
    <ellipse cx="40" cy="50" rx="7" ry="12" fill="#FCA5A5" opacity="0.6" transform="rotate(-20 40 50)" />
  </svg>
);

export const BananaProp: React.FC = () => (
  <svg width="130" height="90" viewBox="0 0 130 90" fill="none" className="filter drop-shadow-xl">
    <path d="M25 60 Q65 85 105 35 Q70 65 25 60 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
    <path d="M32 55 Q70 75 110 28 Q75 58 32 55 Z" fill="#FDE047" />
    {/* Stem */}
    <rect x="105" y="24" width="8" height="8" rx="2" fill="#15803D" />
  </svg>
);

export const CheeseProp: React.FC = () => (
  <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="filter drop-shadow-xl">
    {/* Cheese Wedge */}
    <polygon points="20,70 105,70 95,30 20,45" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
    <polygon points="20,45 95,30 50,20 15,32" fill="#FCD34D" />
    {/* Holes */}
    <circle cx="45" cy="55" r="7" fill="#F59E0B" />
    <circle cx="75" cy="60" r="9" fill="#F59E0B" />
    <circle cx="85" cy="45" r="5" fill="#F59E0B" />
  </svg>
);

export const LionProp: React.FC = () => (
  <svg width="130" height="120" viewBox="0 0 130 120" fill="none" className="filter drop-shadow-xl">
    {/* Fluffy Mane */}
    <circle cx="65" cy="55" r="44" fill="#EA580C" stroke="#C2410C" strokeWidth="2.5" />
    {/* Face */}
    <circle cx="65" cy="55" r="28" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
    {/* Ears */}
    <circle cx="44" cy="30" r="9" fill="#FBBF24" stroke="#EA580C" strokeWidth="2" />
    <circle cx="86" cy="30" r="9" fill="#FBBF24" stroke="#EA580C" strokeWidth="2" />
    {/* Cute Nose & Eyes */}
    <circle cx="56" cy="50" r="3.5" fill="#0F172A" />
    <circle cx="74" cy="50" r="3.5" fill="#0F172A" />
    <polygon points="65,58 60,65 70,65" fill="#7C2D12" />
    <path d="M60 68 Q65 73 70 68" stroke="#7C2D12" strokeWidth="2" fill="none" />
  </svg>
);

export const MonkeyProp: React.FC = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="filter drop-shadow-xl">
    <circle cx="60" cy="55" r="34" fill="#78350F" stroke="#451A03" strokeWidth="2.5" />
    {/* Ears */}
    <circle cx="30" cy="50" r="12" fill="#92400E" stroke="#451A03" strokeWidth="2" />
    <circle cx="30" cy="50" r="7" fill="#FED7AA" />
    <circle cx="90" cy="50" r="12" fill="#92400E" stroke="#451A03" strokeWidth="2" />
    <circle cx="90" cy="50" r="7" fill="#FED7AA" />
    {/* Face Mask */}
    <ellipse cx="60" cy="62" rx="22" ry="16" fill="#FED7AA" />
    <circle cx="52" cy="50" r="3" fill="#0F172A" />
    <circle cx="68" cy="50" r="3" fill="#0F172A" />
    <ellipse cx="60" cy="65" rx="3" ry="2" fill="#78350F" />
    <path d="M54 70 Q60 76 66 70" stroke="#78350F" strokeWidth="2" fill="none" />
  </svg>
);

export const DuckProp: React.FC = () => (
  <svg width="120" height="110" viewBox="0 0 120 110" fill="none" className="filter drop-shadow-xl">
    <ellipse cx="60" cy="65" rx="35" ry="24" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
    {/* Head */}
    <circle cx="80" cy="42" r="18" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
    <circle cx="85" cy="38" r="3" fill="#0F172A" />
    {/* Orange Bill */}
    <polygon points="94,40 112,45 94,50" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
    {/* Wing */}
    <ellipse cx="52" cy="62" rx="18" ry="12" fill="#EAB308" />
  </svg>
);

export const ElephantProp: React.FC = () => (
  <svg width="130" height="120" viewBox="0 0 130 120" fill="none" className="filter drop-shadow-xl">
    <circle cx="65" cy="60" r="36" fill="#94A3B8" stroke="#475569" strokeWidth="2.5" />
    {/* Giant Ears */}
    <circle cx="32" cy="55" r="18" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
    <circle cx="98" cy="55" r="18" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
    {/* Trunk */}
    <path d="M65 60 Q65 92 78 88" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" fill="none" />
    {/* Eyes */}
    <circle cx="54" cy="52" r="3" fill="#0F172A" />
    <circle cx="76" cy="52" r="3" fill="#0F172A" />
  </svg>
);

export const BirdProp: React.FC = () => (
  <svg width="110" height="110" viewBox="0 0 110 110" fill="none" className="filter drop-shadow-xl">
    <ellipse cx="55" cy="58" rx="28" ry="20" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
    <circle cx="72" cy="42" r="15" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2" />
    <circle cx="76" cy="40" r="2.5" fill="#0F172A" />
    <polygon points="84,40 98,44 84,48" fill="#F59E0B" />
    {/* Wing */}
    <path d="M42 55 Q55 40 65 58 Z" fill="#2563EB" />
  </svg>
);

export const UniversalVocabProp: React.FC<{ word: string }> = ({ word }) => {
  switch (word.toUpperCase()) {
    case 'BED':
      return <BedProp />;
    case 'TABLE':
      return <TableProp />;
    case 'CHAIR':
      return <ChairProp />;
    case 'BOOK':
      return <BookProp />;
    case 'BAG':
      return <BagProp />;
    case 'DOOR':
      return <DoorProp />;
    case 'WINDOW':
      return <WindowProp />;
    case 'SHOES':
      return <ShoesProp />;
    case 'BALL':
      return <BallProp />;
    case 'CAT':
      return <CatProp />;
    case 'TREE':
      return <TreeProp />;
    case 'FLOWER':
      return <FlowerProp />;
    case 'WATER':
      return <WaterProp />;
    case 'DESK':
      return <DeskProp />;
    case 'PENCIL':
      return <PencilProp />;
    case 'RULER':
      return <RulerProp />;
    case 'BOARD':
      return <BoardProp />;
    case 'CLOCK':
      return <ClockProp />;
    case 'BREAD':
      return <BreadProp />;
    case 'MILK':
      return <MilkProp />;
    case 'APPLE':
      return <AppleProp />;
    case 'BANANA':
      return <BananaProp />;
    case 'CHEESE':
      return <CheeseProp />;
    case 'LION':
      return <LionProp />;
    case 'MONKEY':
      return <MonkeyProp />;
    case 'DUCK':
      return <DuckProp />;
    case 'ELEPHANT':
      return <ElephantProp />;
    case 'BIRD':
      return <BirdProp />;
    default:
      return (
        <div className="w-20 h-20 bg-amber-400/90 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-3 border-white">
          📦
        </div>
      );
  }
};
