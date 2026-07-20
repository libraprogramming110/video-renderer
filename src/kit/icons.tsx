// Editorial line icons — thin monochrome strokes (currentColor by default), no
// fill, rounded. On-brand: they read as a quality newspaper's infographic marks,
// not app-store glyphs. Each takes { size, color, sw }.
import React from "react";

type IP = { size?: number; color?: string; sw?: number };

const S: React.FC<IP & { children: React.ReactNode }> = ({ size = 34, color = "currentColor", sw = 1.75, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
    {children}
  </svg>
);

// siRNA / molecule — three linked nodes
export const IconMolecule: React.FC<IP> = (p) => (
  <S {...p}>
    <circle cx="6.5" cy="7.5" r="2.1" />
    <circle cx="17.5" cy="9.5" r="2.1" />
    <circle cx="10.5" cy="17" r="2.1" />
    <path d="M8.5 8.4l7 .8M8.4 9.5l1.7 5.4M15.9 11.3l-4.4 4.4" />
  </S>
);

// kidney / renal — a teardrop (fluid/organ)
export const IconKidney: React.FC<IP> = (p) => (
  <S {...p}>
    <path d="M12 3.6C12 3.6 5.5 10.5 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10.5 12 3.6 12 3.6z" />
  </S>
);

// AI engine — a chip / CPU
export const IconChip: React.FC<IP> = (p) => (
  <S {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
  </S>
);

// hypertension — a heart
export const IconHeart: React.FC<IP> = (p) => (
  <S {...p}>
    <path d="M12 20C12 20 4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11z" />
  </S>
);

// obesity / weight — a gauge (neutral measurement)
export const IconGauge: React.FC<IP> = ({ color = "currentColor", ...p }) => (
  <S color={color} {...p}>
    <path d="M5 16.5a7 7 0 0 1 14 0" />
    <path d="M12 16.5l3.6-4.3" />
    <circle cx="12" cy="16.5" r="1.1" fill={color} stroke="none" />
  </S>
);

// counter-signal — a broadcast ping
export const IconSignal: React.FC<IP> = ({ color = "currentColor", ...p }) => (
  <S color={color} {...p}>
    <circle cx="12" cy="17.5" r="1.2" fill={color} stroke="none" />
    <path d="M8.6 14.2a5 5 0 0 1 6.8 0M6.1 11.6a8.5 8.5 0 0 1 11.8 0" />
  </S>
);

// channel / flow — three chevrons of throughput
export const IconFlow: React.FC<IP> = (p) => (
  <S {...p}>
    <path d="M5 7l4 5-4 5M11 7l4 5-4 5M17 7l4 5-4 5" />
  </S>
);

// approval / unanimous — a check in a ring
export const IconCheck: React.FC<IP> = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.2 12.4l2.6 2.6 5-5.4" />
  </S>
);

// timeline / close date — a calendar with a marked day
export const IconCalendar: React.FC<IP> = ({ color = "currentColor", ...p }) => (
  <S color={color} {...p}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    <circle cx="12" cy="15" r="1.5" fill={color} stroke="none" />
  </S>
);

// financing / bank — a columned institution (bridge-loan lenders)
export const IconBank: React.FC<IP> = (p) => (
  <S {...p}>
    <path d="M4 9.5l8-4.5 8 4.5" />
    <path d="M5.5 11v6M9.5 11v6M14.5 11v6M18.5 11v6" />
    <path d="M3.5 20h17" />
  </S>
);

// injectable / monoclonal antibody — a syringe (the old delivery)
export const IconSyringe: React.FC<IP> = (p) => (
  <S {...p}>
    <path d="M2.5 12h3" />
    <path d="M16 12h2.6" />
    <path d="M18.6 9.4v5.2" />
    <rect x="6.5" y="9" width="9.5" height="6" rx="1" />
    <path d="M9.5 9v6M12 9v6" />
  </S>
);

// oral dose — a capsule / pill (the new delivery)
export const IconPill: React.FC<IP> = (p) => (
  <S {...p}>
    <rect x="3.4" y="8.5" width="17.2" height="7" rx="3.5" />
    <path d="M12 8.7v6.6" />
  </S>
);
